// lib/voice/crypto.ts
//
// AES-GCM-256 encryption for all data persisted to IndexedDB.
//
// KEY HIERARCHY
// ─────────────
// DEK (Data Encryption Key) — AES-GCM-256, generated once per session.
//   Stored ONLY in a module-level variable. Never written to any storage.
//
// KEK (Key Encryption Key) — derived via HKDF from a seed fetched from
//   /api/voice/encryption-key. The server returns a deterministic seed per
//   user session, so the same user + same session = same KEK.
//
// Wrapped DEK — DEK encrypted with KEK, stored in sessionStorage.
//   On tab reload, if the session is still valid: fetch seed → derive KEK →
//   unwrap DEK → recover IDB ciphertext. If session expired: DEK is gone,
//   IDB ciphertext is unrecoverable garbage, and is auto-cleaned.
//
// USAGE
// ─────
// Call `initCrypto()` once on app load (after auth).
// Then use `encryptBlob`, `decryptToBlob`, `encryptString`, `decryptString`.
// All functions throw if called before init.

// ─── Module-level DEK (NEVER persisted) ─────────────────────────────────────

let dek: CryptoKey | null = null;
let initPromise: Promise<void> | null = null;

// ─── Buffer / base64 helpers ────────────────────────────────────────────────

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── Fetch KEK seed from server ─────────────────────────────────────────────

async function fetchSeed(): Promise<ArrayBuffer> {
  const res = await fetch("/api/voice/encryption-key", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Encryption key seed fetch failed: ${res.status}`);
  }
  const { seed } = await res.json();
  if (!seed || typeof seed !== "string") {
    throw new Error("Invalid seed response from server");
  }
  return base64ToBuf(seed);
}

// ─── Key generation & derivation ────────────────────────────────────────────

async function generateDEK(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable — required for wrapKey
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
}

async function deriveKEK(seed: ArrayBuffer): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    seed,
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      info: new TextEncoder().encode("doxxy-voice-kek-v1"),
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable — only used for wrap/unwrap
    ["wrapKey", "unwrapKey"],
  );
}

async function wrapDEK(
  dek: CryptoKey,
  kek: CryptoKey,
): Promise<{ wrappedKey: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappedKey = await crypto.subtle.wrapKey("raw", dek, kek, {
    name: "AES-GCM",
    iv,
  });
  return { wrappedKey, iv };
}

async function unwrapDEK(
  wrappedKey: Uint8Array,
  kek: CryptoKey,
  iv: Uint8Array,
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    "raw",
    wrappedKey.buffer,
    kek,
    { name: "AES-GCM", iv },
    { name: "AES-GCM", length: 256 },
    true, // extractable
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
}

// ─── Public init ────────────────────────────────────────────────────────────

const WRAPPED_DEK_KEY = "voice_dek_wrapped_v1";

export async function initCrypto(): Promise<void> {
  // If already initialized, return immediately
  if (dek) return;

  // Prevent concurrent initialization
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    try {
      // 1. Try to recover DEK from sessionStorage
      const wrappedPayload = sessionStorage.getItem(WRAPPED_DEK_KEY);
      if (wrappedPayload) {
        try {
          const { wrappedKey: wrappedB64, iv: ivB64 } = JSON.parse(wrappedPayload);
          const seed = await fetchSeed();
          const kek = await deriveKEK(seed);
          dek = await unwrapDEK(base64ToBuf(wrappedB64), kek, base64ToBuf(ivB64));
          return;
        } catch {
          // Unwrap failed (session changed, seed differs, data corrupted)
          sessionStorage.removeItem(WRAPPED_DEK_KEY);
          dek = null;
        }
      }

      // 2. Generate fresh DEK and fetch seed in parallel
      const [newDek, seed] = await Promise.all([generateDEK(), fetchSeed()]);

      // 3. Wrap with server-derived KEK
      const kek = await deriveKEK(seed);
      const { wrappedKey, iv } = await wrapDEK(newDek, kek);

      // 4. Store wrapped DEK in sessionStorage (survives reload, cleared on tab close)
      sessionStorage.setItem(
        WRAPPED_DEK_KEY,
        JSON.stringify({ wrappedKey: bufToBase64(wrappedKey), iv: bufToBase64(iv) }),
      );

      // 5. Assign to module-level variable
      dek = newDek;

      // 6. Clean up any unrecoverable ciphertext from previous sessions
      cleanUnrecoverableSessions().catch(() => {});
    } catch (err) {
      console.error("[crypto] initCrypto failed:", err);
      throw err;
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}

// ─── Data encryption / decryption ───────────────────────────────────────────

function requireDEK(): CryptoKey {
  if (!dek) throw new Error("Crypto not initialized — call initCrypto() first");
  return dek;
}

export async function encryptBlob(
  blob: Blob,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const key = requireDEK();
  const plaintext = await blob.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  return { ciphertext, iv };
}

export async function decryptToBlob(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
  mimeType: string,
): Promise<Blob> {
  const key = requireDEK();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new Blob([plaintext], { type: mimeType });
}

export async function encryptString(
  text: string,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const key = requireDEK();
  const plaintext = new TextEncoder().encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext,
  );
  return { ciphertext, iv };
}

export async function decryptString(
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
): Promise<string> {
  const key = requireDEK();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

// ─── Status ─────────────────────────────────────────────────────────────────

export function isCryptoReady(): boolean {
  return dek !== null;
}

export function clearDEK(): void {
  dek = null;
  initPromise = null;
  sessionStorage.removeItem(WRAPPED_DEK_KEY);
}

// ─── Unrecoverable ciphertext cleanup ───────────────────────────────────────
//
// When initCrypto() generates a NEW DEK (not recovered from sessionStorage),
// any existing IDB ciphertext was encrypted with a key that no longer exists.
// We clean those up so orphaned-session detection doesn't offer recovery for
// data it can never decrypt.

async function cleanUnrecoverableSessions(): Promise<void> {
  const { getOrphanedSessions, completeSession } = await import(
    "@/lib/voice/idb-storage"
  );
  // Wait a tick — if we just generated a new DEK, any sessions in IDB
  // from a prior session are unrecoverable. Delete them all.
  try {
    const sessions = await getOrphanedSessions();
    for (const s of sessions) {
      await completeSession(s.id).catch(() => {});
    }
  } catch {
    // Best-effort cleanup
  }
}
