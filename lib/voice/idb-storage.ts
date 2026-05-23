// lib/voice/idb-storage.ts
//
// IndexedDB persistence layer for dictation audio, transcripts, and upload queue.
//
// ALL DATA STORED HERE IS AES-GCM-256 ENCRYPTED.
// The Data Encryption Key (DEK) lives ONLY in memory (lib/voice/crypto.ts).
// IndexedDB never sees plaintext audio blobs or transcript strings.
//
// Schema (database: doxxy-voice, version 2):
//   sessions       — keyPath: id (UUID) — session metadata, encrypted transcript
//   chunks         — auto-increment key, index on sessionId — encrypted audio
//   uploadQueue    — auto-increment key — encrypted pending fallback uploads
//
// Sessions in "active" state at app start are considered orphaned (crash/refresh).

const DB_NAME = "doxxy-voice";
const DB_VERSION = 2;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 h — orphaned sessions older than this are auto-cleaned

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EncryptedPayload {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

export interface DBSession {
  id: string;
  department: string;
  startedAt: number;
  state: "active" | "completed";
  chunkCount: number;
  transcriptSnapshot: EncryptedPayload | null;
}

export interface DBChunk {
  id?: number;
  sessionId: string;
  chunkIndex: number;
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  timestamp: number;
}

export interface DBUploadItem {
  id?: number;
  sessionId: string;
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  department: string;
  mimeType: string;
  status: "pending" | "processing" | "done" | "error";
  createdAt: number;
  retries: number;
  transcriptSnapshot: EncryptedPayload | null;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      // Version 1 → 2 migration: delete old plaintext stores if they exist
      if (db.objectStoreNames.contains("sessions")) {
        db.deleteObjectStore("sessions");
      }
      if (db.objectStoreNames.contains("chunks")) {
        db.deleteObjectStore("chunks");
      }
      if (db.objectStoreNames.contains("uploadQueue")) {
        db.deleteObjectStore("uploadQueue");
      }

      // Create fresh encrypted-only stores
      db.createObjectStore("sessions", { keyPath: "id" });

      const chunksStore = db.createObjectStore("chunks", { autoIncrement: true });
      chunksStore.createIndex("sessionId", "sessionId", { unique: false });

      db.createObjectStore("uploadQueue", { autoIncrement: true });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDB().then((db) => {
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      db.onclose = () => {
        dbPromise = null;
      };
      return db;
    });
  }
  return dbPromise;
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    dbPromise?.then((db) => db.close()).catch(() => {});
    dbPromise = null;
  });
}

function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Session management ───────────────────────────────────────────────────────

export async function createSession(
  sessionId: string,
  department: string,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("sessions", "readwrite");
  const session: DBSession = {
    id: sessionId,
    department,
    startedAt: Date.now(),
    state: "active",
    chunkCount: 0,
    transcriptSnapshot: null,
  };
  await promisifyRequest(tx.objectStore("sessions").add(session));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}

export async function updateSessionTranscript(
  sessionId: string,
  payload: EncryptedPayload,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  const existing = await promisifyRequest<DBSession | undefined>(store.get(sessionId));
  if (existing) {
    existing.transcriptSnapshot = payload;
    await promisifyRequest(store.put(existing));
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}

export async function completeSession(sessionId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["chunks", "sessions"], "readwrite");

  // Delete all chunks for this session
  const chunkStore = tx.objectStore("chunks");
  const chunkIndex = chunkStore.index("sessionId");
  const cursorReq = chunkIndex.openCursor(IDBKeyRange.only(sessionId));
  cursorReq.onsuccess = () => {
    const cursor = cursorReq.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  // Delete the session
  tx.objectStore("sessions").delete(sessionId);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await completeSession(sessionId);
}

// ─── Audio chunk storage ──────────────────────────────────────────────────────

export async function addChunks(
  sessionId: string,
  chunks: Array<{ chunkIndex: number; ciphertext: ArrayBuffer; iv: Uint8Array }>,
): Promise<void> {
  if (chunks.length === 0) return;
  const db = await getDB();
  const tx = db.transaction(["chunks", "sessions"], "readwrite");
  const chunkStore = tx.objectStore("chunks");
  for (const c of chunks) {
    chunkStore.add({
      sessionId,
      chunkIndex: c.chunkIndex,
      ciphertext: c.ciphertext,
      iv: c.iv,
      timestamp: Date.now(),
    });
  }
  const sessionStore = tx.objectStore("sessions");
  const session = await promisifyRequest<DBSession | undefined>(sessionStore.get(sessionId));
  if (session) {
    session.chunkCount = Math.max(session.chunkCount, chunks[chunks.length - 1].chunkIndex + 1);
    sessionStore.put(session);
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}

export async function getSessionChunks(sessionId: string): Promise<DBChunk[]> {
  const db = await getDB();
  const tx = db.transaction("chunks", "readonly");
  const store = tx.objectStore("chunks");
  const index = store.index("sessionId");
  const chunks = await promisifyRequest<DBChunk[]>(index.getAll(sessionId));

  return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
}

// ─── Orphaned session detection ───────────────────────────────────────────────

export async function getOrphanedSessions(): Promise<DBSession[]> {
  const db = await getDB();
  const tx = db.transaction("sessions", "readonly");
  const allSessions = await promisifyRequest<DBSession[]>(
    tx.objectStore("sessions").getAll(),
  );


  const now = Date.now();
  return allSessions.filter((s) => {
    if (s.state !== "active") return false;
    if (now - s.startedAt > SESSION_TTL_MS) {
      deleteSession(s.id).catch(() => {});
      return false;
    }
    return true;
  });
}

export async function getSession(
  sessionId: string,
): Promise<DBSession | undefined> {
  const db = await getDB();
  const tx = db.transaction("sessions", "readonly");
  const session = await promisifyRequest<DBSession | undefined>(
    tx.objectStore("sessions").get(sessionId),
  );

  return session;
}

// ─── Upload queue ─────────────────────────────────────────────────────────────

export async function addToUploadQueue(item: {
  sessionId: string;
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  department: string;
  mimeType: string;
  transcriptSnapshot?: EncryptedPayload | null;
}): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("uploadQueue", "readwrite");
  const entry: DBUploadItem = {
    sessionId: item.sessionId,
    ciphertext: item.ciphertext,
    iv: item.iv,
    department: item.department,
    mimeType: item.mimeType,
    status: "pending",
    createdAt: Date.now(),
    retries: 0,
    transcriptSnapshot: item.transcriptSnapshot ?? null,
  };
  await promisifyRequest(tx.objectStore("uploadQueue").add(entry));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}

export async function getPendingUploads(): Promise<DBUploadItem[]> {
  const db = await getDB();
  const tx = db.transaction("uploadQueue", "readonly");
  const all = await promisifyRequest<DBUploadItem[]>(
    tx.objectStore("uploadQueue").getAll(),
  );

  return all.filter((i) => i.status === "pending" || i.status === "error");
}

export async function updateUploadItem(
  id: number,
  updates: Partial<Pick<DBUploadItem, "status" | "retries">>,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("uploadQueue", "readwrite");
  const store = tx.objectStore("uploadQueue");
  const existing = await promisifyRequest<DBUploadItem | undefined>(store.get(id));
  if (existing) {
    Object.assign(existing, updates);
    await promisifyRequest(store.put(existing));
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}

export async function deleteUploadItem(id: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("uploadQueue", "readwrite");
  await promisifyRequest(tx.objectStore("uploadQueue").delete(id));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

}
