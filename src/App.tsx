import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "./storage";
import { HomePage } from "./pages/HomePage";
import { PrompterPage } from "./pages/PrompterPage";

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((m: string) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1600);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { msg, show };
}

type Route = "home" | "prompter";

function getRouteFromHash(): Route {
  const h = (window.location.hash || "").replace(/^#/, "");
  if (h === "/prompter" || h === "prompter" || h === "/prompter/") return "prompter";
  return "home";
}

export default function App() {
  const initial = useMemo(() => loadState(), []);
  const [script, setScript] = useState(initial.script);
  const [fontSizePx, setFontSizePx] = useState(initial.settings.fontSizePx);
  const [speedPps, setSpeedPps] = useState(initial.settings.speedPps);
  const [mirror, setMirror] = useState(initial.settings.mirror);

  const { msg: toast, show: showToast } = useToast();

  useEffect(() => {
    saveState({ script, settings: { fontSizePx, speedPps, mirror } });
  }, [script, fontSizePx, speedPps, mirror]);

  const [route, setRoute] = useState<Route>(() => getRouteFromHash());

  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goHome = useCallback(() => {
    window.location.hash = "#/";
  }, []);

  const goPrompter = useCallback(() => {
    window.location.hash = "#/prompter";
  }, []);

  if (route === "prompter") {
    return (
      <PrompterPage
        script={script}
        fontSizePx={fontSizePx}
        speedPps={speedPps}
        mirror={mirror}
        onFontSizePx={setFontSizePx}
        onSpeedPps={setSpeedPps}
        onMirror={setMirror}
        toast={{ msg: toast, show: showToast }}
        onBackHome={goHome}
      />
    );
  }

  return <HomePage script={script} onScriptChange={setScript} onStart={goPrompter} />;
}
