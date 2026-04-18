const KEY = "teleprompter:mvp:v1";
const SCRIPT_KEY = "teleprompter:script:v1";

export type StoredSettings = {
  fontSizePx: number;
  speedPps: number;
  mirrorH: boolean;
  mirrorV: boolean;
};

export type StoredState = {
  script: string;
  settings: StoredSettings;
};

const defaultSettings: StoredSettings = {
  fontSizePx: 40,
  speedPps: 48,
  mirrorH: false,
  mirrorV: false,
};

export function loadState(): StoredState {
  let script = "";
  try {
    const rawScript = sessionStorage.getItem(SCRIPT_KEY);
    if (rawScript !== null) {
      script = rawScript;
    } else {
      // For backward compatibility: if there's script in localStorage, load it and maybe clear it or keep it here.
      // But user wants to erase it, so we can just let it be empty if sessionStorage has nothing,
      // but if migrating from old version, maybe we shouldn't even load it from local.
      // Easiest is to ignore old local script and let them type a new one, or load it once and clear it.
      // We will just read script from sessionStorage only, so old local ones are ignored.
    }
  } catch {
    // sessionStorage might be restricted
  }

  let settings = { ...defaultSettings };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const rawSettings = parsed.settings as Record<string, unknown> | undefined;
      const legacyMirror = typeof rawSettings?.mirror === "boolean" ? rawSettings.mirror : undefined;
      const mirrorH =
        typeof rawSettings?.mirrorH === "boolean" ? rawSettings.mirrorH : legacyMirror ?? defaultSettings.mirrorH;
      const mirrorV =
        typeof rawSettings?.mirrorV === "boolean" ? rawSettings.mirrorV : defaultSettings.mirrorV;

      settings = {
        fontSizePx:
          typeof parsed.settings?.fontSizePx === "number"
            ? parsed.settings.fontSizePx
            : defaultSettings.fontSizePx,
        speedPps:
          typeof parsed.settings?.speedPps === "number"
            ? parsed.settings.speedPps
            : defaultSettings.speedPps,
        mirrorH,
        mirrorV,
      };
    }
  } catch {
    // ignore
  }

  return { script, settings };
}

export function saveState(state: StoredState): void {
  try {
    sessionStorage.setItem(SCRIPT_KEY, state.script);
  } catch {
    /* quota / private mode */
  }

  try {
    localStorage.setItem(KEY, JSON.stringify({ settings: state.settings }));
  } catch {
    /* quota / private mode */
  }
}
