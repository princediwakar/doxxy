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

  // iOS-specific browser tokens (all iOS browsers use WebKit and include Safari/ in UA)
  const isCriOS = /CriOS\//.test(ua);
  const isFxiOS = /FxiOS\//.test(ua);
  const isEdgiOS = /EdgiOS\//.test(ua);

  const isChrome = (/Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua)) || isCriOS;
  const isFirefox = /Firefox\//.test(ua) || isFxiOS;
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua) && !isCriOS && !isFxiOS && !isEdgiOS && !/\bBrave\b/i.test(ua);
  const isBrave = /Brave\//.test(ua) || /\bBrave\b/i.test(ua);
  const isEdge = /Edge\//.test(ua) || isEdgiOS;

  const browserName = isBrave ? "Brave" : isEdge ? "Edge" : isChrome ? "Chrome" : isFirefox ? "Firefox" : isSafari ? "Safari" : "your browser";

  if (isAndroid) {
    return {
      instructions: `Microphone access is blocked for ${browserName}. To re-enable: tap the lock icon in the address bar → Permissions → Microphone → Allow. Then come back and tap Try Again.`,
      settingsUrl: "intent://com.android.settings/.Settings#Intent;scheme=android-app;end",
    };
  }
  if (isIOS) {
    if (isSafari) {
      return {
        instructions: `Microphone access is blocked for Safari. To re-enable: open the Settings app → Privacy & Security → Microphone → find this website and set to Allow. Then come back and tap Try Again.`,
        settingsUrl: null,
      };
    }
    return {
      instructions: `Microphone access is blocked for ${browserName}. To re-enable: open the Settings app → Apps → ${browserName} → Microphone → Allow. Then come back and tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isMac && isSafari) {
    return {
      instructions: `Microphone access is blocked for Safari. To re-enable: in Safari's menu bar → Safari → Settings for This Website → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isMac && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `Microphone access is blocked for ${browserName}. To re-enable: open ${browserName} menu → Settings → Privacy & Security → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isMac && isFirefox) {
    return {
      instructions: `Microphone access is blocked for Firefox. To re-enable: click the permissions icon in the address bar → enable Microphone for this site. Then refresh and tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isWindows && (isChrome || isBrave || isEdge)) {
    return {
      instructions: `Microphone access is blocked for ${browserName}. To re-enable: click the lock/slider icon in the address bar → Site Settings → Microphone → Allow. Then tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isWindows && isFirefox) {
    return {
      instructions: `Microphone access is blocked for Firefox. To re-enable: click the permissions icon in the address bar → enable Microphone for this site. Then refresh and tap Try Again.`,
      settingsUrl: null,
    };
  }
  if (isFirefox) {
    return {
      instructions: `Microphone access is blocked for Firefox. To re-enable: click the permissions icon in the address bar → enable Microphone for this site. Then refresh and tap Try Again.`,
      settingsUrl: null,
    };
  }
  return {
    instructions: `Microphone access is blocked. To re-enable: check ${browserName} site settings → Microphone → Allow. Then refresh and tap Try Again.`,
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