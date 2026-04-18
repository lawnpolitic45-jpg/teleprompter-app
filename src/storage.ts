const KEY = "teleprompter:mvp:v1";

export type StoredSettings = {
  fontSizePx: number;
  speedPps: number;
  mirror: boolean;
};

export type StoredState = {
  script: string;
  settings: StoredSettings;
};

const defaultSettings: StoredSettings = {
  fontSizePx: 40,
  speedPps: 48,
  mirror: false,
};

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { script: "", settings: { ...defaultSettings } };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
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
        mirror:
          typeof parsed.settings?.mirror === "boolean"
            ? parsed.settings.mirror
            : defaultSettings.mirror,
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
