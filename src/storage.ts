const KEY = "teleprompter:mvp:v1";

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
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { script: "", settings: { ...defaultSettings } };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const rawSettings = parsed.settings as Record<string, unknown> | undefined;
    const legacyMirror = typeof rawSettings?.mirror === "boolean" ? rawSettings.mirror : undefined;
    const mirrorH =
      typeof rawSettings?.mirrorH === "boolean" ? rawSettings.mirrorH : legacyMirror ?? defaultSettings.mirrorH;
    const mirrorV =
      typeof rawSettings?.mirrorV === "boolean" ? rawSettings.mirrorV : defaultSettings.mirrorV;

    return {
      script: typeof parsed.script === "string" ? parsed.script : "",
      settings: {
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
      },
    };
  } catch {
    return { script: "", settings: { ...defaultSettings } };
  }
}

export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}
