// lib/voice/captureUtils.ts

export interface PermissionGuidance {
  instructions: string;
  settingsUrl: string | null;
}

export function getPermissionGuidance(): PermissionGuidance {
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMac = /Mac/i.test(platform) || /Macintosh/.test(ua);
  const isWindows = /Win/i.test(platform);
  const isChrome = /Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua);
  const isFirefox = /Firefox\//.test(ua);
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);
  const isBrave = /Brave\//.test(ua);
  const isEdge = /Edge\//.test(ua);

  const browserName = isBrave ? "Brave" : isEdge ? "Edge" : isChrome ? "Chrome" : isFirefox ? "Firefox" : isSafari ? "Safari" : "your browser";

  if (isAndroid) {
    return {
      instructions: `Enable Microphone for ${browserName} in Android Settings, then come back and tap Try Again.`,
      settingsUrl: "intent://com.android.settings/.Settings#Intent;scheme=android-app;end",
    };
  }
  if (isIOS) {
    return {
      instructions: `Open the Settings app → ${browserName} → Microphone → Allow. Then come back and tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isMac && isSafari) {
    return {
      instructions: "Open Safari → Settings for This Website → Microphone → Allow. Then tap Try Again.",
      settingsUrl: null,
    };
  }
  if (isMac && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `Open ${browserName} → Settings → Privacy & Security → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isWindows && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `In ${browserName}, click the lock/tune icon in the address bar → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isFirefox) {
    return {
      instructions: "Click the permissions icon in the address bar, enable Microphone, then refresh and tap Try Again.",
      settingsUrl: null,
    };
  }
  return {
    instructions: `Enable microphone access for this site in ${browserName} settings, then refresh and tap Try Again.`,
    settingsUrl: null,
  };
}

export function getSupportedMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/ogg;codecs=opus",
    "audio/mpeg",
  ];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}