import Fullscreen from "@mui/icons-material/Fullscreen";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import {
  Box,
  Button,
  CssBaseline,
  FormControlLabel,
  GlobalStyles,
  Slider,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { FullscreenOverlay } from "../components/FullscreenOverlay";
import { KeyCap } from "../components/KeyCap";
import { PrompterContent } from "../components/PrompterContent";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { appTheme, colors } from "../theme";
import { computeScriptStats } from "../utils/scriptStats";

type ToastApi = { msg: string | null; show: (m: string) => void };

type Props = {
  script: string;
  fontSizePx: number;
  speedPps: number;
  mirror: boolean;
  onFontSizePx: (v: number) => void;
  onSpeedPps: (v: number) => void;
  onMirror: (v: boolean) => void;
  toast: ToastApi;
  onBackHome: () => void;
};

export function PrompterPage({
  script,
  fontSizePx,
  speedPps,
  mirror,
  onFontSizePx,
  onSpeedPps,
  onMirror,
  toast,
  onBackHome,
}: Props) {
  const [fsOpen, setFsOpen] = useState(false);
  const [playingPreview, setPlayingPreview] = useState(false);
  const [playingFs, setPlayingFs] = useState(false);
  const playingFsRef = useRef(false);
  playingFsRef.current = playingFs;
  const fsOpenRef = useRef(false);
  fsOpenRef.current = fsOpen;

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fsRootRef = useRef<HTMLDivElement>(null);
  const fsScrollRef = useRef<HTMLDivElement>(null);

  const activeScrollRef = fsOpen ? fsScrollRef : previewScrollRef;
  const playing = fsOpen ? playingFs : playingPreview;

  const { unitCount, punctuationCount, lineCount } = computeScriptStats(script);

  const onUserInterrupt = useCallback(() => {
    setPlayingPreview(false);
    setPlayingFs(false);
    toast.show("已暂停（手动滚动）");
  }, [toast]);

  useAutoScroll({
    scrollRef: activeScrollRef,
    speedPps,
    playing,
    onUserInterrupt,
  });

  const scrollToTopActive = useCallback(() => {
    const el = activeScrollRef.current;
    if (el) el.scrollTop = 0;
  }, [activeScrollRef]);

  const openFullscreen = useCallback(() => {
    setFsOpen(true);
    setPlayingFs(playingPreview);
    setPlayingPreview(false);
    requestAnimationFrame(() => {
      const p = previewScrollRef.current;
      const f = fsScrollRef.current;
      if (p && f) f.scrollTop = p.scrollTop;
      const root = fsRootRef.current;
      if (!root) return;
      void root.requestFullscreen?.().catch(() => {
        toast.show("全屏请求被拒绝，可继续窗口内提词");
      });
    });
  }, [playingPreview, toast]);

  const closeFullscreen = useCallback(() => {
    const p = previewScrollRef.current;
    const f = fsScrollRef.current;
    if (p && f) p.scrollTop = f.scrollTop;
    setPlayingPreview(playingFsRef.current);
    setPlayingFs(false);
    setFsOpen(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && fsOpenRef.current) closeFullscreen();
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [closeFullscreen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typing =
        tag === "textarea" || tag === "input" || (e.target as HTMLElement)?.isContentEditable;
      if (e.code === "Space" && !typing) {
        e.preventDefault();
        if (fsOpenRef.current) {
          setPlayingFs((v) => {
            queueMicrotask(() => toast.show(v ? "已暂停" : "继续"));
            return !v;
          });
        } else {
          setPlayingPreview((v) => {
            queueMicrotask(() => toast.show(v ? "已暂停" : "继续"));
            return !v;
          });
        }
        return;
      }
      if (!typing && (e.code === "ArrowUp" || e.code === "ArrowDown")) {
        e.preventDefault();
        const delta = e.code === "ArrowUp" ? 6 : -6;
        const next = Math.min(180, Math.max(12, speedPps + delta));
        if (next !== speedPps) {
          onSpeedPps(next);
          queueMicrotask(() => toast.show(`速度 ${Math.round(next)}`));
        }
        return;
      }
      if (!typing) {
        const dec = e.code === "Minus" || e.code === "NumpadSubtract";
        const inc = e.code === "Equal" || e.code === "NumpadAdd";
        if (dec || inc) {
          e.preventDefault();
          const delta = dec ? -2 : 2;
          const next = Math.min(72, Math.max(20, fontSizePx + delta));
          if (next !== fontSizePx) {
            onFontSizePx(next);
            queueMicrotask(() => toast.show(`字号 ${next}`));
          }
        }
      }
      if (e.key === "Escape" && fsOpen) closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFullscreen, fsOpen, toast, fontSizePx, speedPps, onFontSizePx, onSpeedPps]);

  const statusText = playing ? "滚动中" : "未滚动";

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "*::-webkit-scrollbar": { width: 10, height: 10 },
            "*::-webkit-scrollbar-thumb": { backgroundColor: colors.border, borderRadius: 8 },
            "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          }}
        />

        <Box
          component="header"
          sx={{
            height: 56,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.pageBg,
            display: "flex",
            alignItems: "center",
            px: 2,
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={onBackHome}
            sx={{
              height: 32,
              borderColor: colors.border,
              color: colors.scriptText,
              fontWeight: 700,
            }}
          >
            返回
          </Button>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.title, letterSpacing: "0.01em" }}>
            提词
          </Typography>
          <Typography sx={{ ml: 1, fontSize: 13, color: colors.iconMuted }}>{statusText}</Typography>
        </Box>

        <Toolbar
          sx={{
            minHeight: 72,
            bgcolor: colors.toolbarBg,
            flexWrap: "wrap",
            gap: 2,
            py: 1.5,
            px: 2,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ flex: 1, alignItems: "center" }}>
            <Box sx={{ minWidth: 160, flex: "1 1 180px" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.label, mb: 0.5 }}>
                字号
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Slider
                  size="small"
                  value={fontSizePx}
                  min={20}
                  max={72}
                  onChange={(_, v) => onFontSizePx(v as number)}
                  sx={{
                    color: colors.primary,
                    "& .MuiSlider-track": { bgcolor: colors.primary },
                    "& .MuiSlider-rail": { bgcolor: colors.track },
                  }}
                />
                <Typography sx={{ width: 40, fontSize: 14, fontWeight: 600, color: colors.value }}>
                  {fontSizePx}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ minWidth: 160, flex: "1 1 180px" }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.label, mb: 0.5 }}>
                速度
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Slider
                  size="small"
                  value={speedPps}
                  min={12}
                  max={180}
                  onChange={(_, v) => onSpeedPps(v as number)}
                  sx={{
                    color: colors.primary,
                    "& .MuiSlider-track": { bgcolor: colors.primary },
                    "& .MuiSlider-rail": { bgcolor: colors.track },
                  }}
                />
                <Typography sx={{ width: 40, fontSize: 14, fontWeight: 600, color: colors.value }}>
                  {Math.round(speedPps)}
                </Typography>
              </Stack>
            </Box>

            <FormControlLabel
              sx={{ ml: 0 }}
              control={
                <Switch
                  checked={mirror}
                  onChange={(_, c) => onMirror(c)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: colors.primary },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: `${colors.primary} !important`,
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.label }}>镜像</Typography>}
            />
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<Fullscreen />}
              onClick={() => void openFullscreen()}
              sx={{
                minWidth: 120,
                height: 44,
                fontWeight: 600,
                bgcolor: colors.primary,
                "&:hover": { bgcolor: colors.primaryHover },
              }}
            >
              进入全屏提词
            </Button>
            <Button
              variant="contained"
              startIcon={playing && !fsOpen ? <Pause /> : <PlayArrow />}
              onClick={() => {
                if (fsOpen) setPlayingFs((v) => !v);
                else setPlayingPreview((v) => !v);
              }}
              disabled={fsOpen}
              sx={{
                minWidth: 120,
                height: 44,
                fontWeight: 600,
                bgcolor: colors.primary,
                "&:hover": { bgcolor: colors.primaryHover },
                "&.Mui-disabled": { bgcolor: colors.track, color: colors.secondary },
              }}
            >
              {fsOpen ? "全屏提词中" : playing ? "暂停" : "开始滚动"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<VerticalAlignTop />}
              onClick={() => {
                scrollToTopActive();
                toast.show("已回到开头");
              }}
              sx={{
                minWidth: 120,
                height: 44,
                fontWeight: 600,
                borderColor: colors.border,
                color: colors.scriptText,
              }}
            >
              回到开头
            </Button>
          </Stack>
        </Toolbar>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, px: { xs: 1.5, sm: 2 }, pb: 1 }}>
          <Typography
            sx={{
              mt: 2,
              mb: 0.5,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: colors.subtle,
            }}
          >
            提词预览
          </Typography>

          <Box
            sx={{
              position: "relative",
              flex: 1,
              minHeight: { xs: 320, sm: 360 },
              bgcolor: colors.canvas,
              border: `1px solid ${colors.border}`,
              borderRadius: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              ref={previewScrollRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                scrollbarGutter: "stable",
              }}
            >
              <PrompterContent text={script} fontSizePx={fontSizePx} mirror={mirror} maxContentWidth="100%" />
            </Box>
          </Box>

          <Box
            component="footer"
            sx={{
              mt: "auto",
              pt: 1,
              minHeight: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: colors.secondary,
              fontSize: 12,
              flexWrap: "wrap",
              gap: 1,
              rowGap: 1,
            }}
          >
            <span>
              字数 {unitCount} · 标点 {punctuationCount} · 行数 {lineCount} · {statusText}
            </span>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
                rowGap: 0.5,
              }}
            >
              <Typography component="span" sx={{ fontSize: 12, color: colors.secondary, mr: 0.25 }}>
                快捷键
              </Typography>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                <KeyCap>Space</KeyCap>
                <Typography component="span" sx={{ fontSize: 12, color: colors.secondary }}>
                  ：播放/暂停；
                </Typography>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                <KeyCap>-</KeyCap>
                <KeyCap>+</KeyCap>
                <Typography component="span" sx={{ fontSize: 12, color: colors.secondary }}>
                  ：调整字号；
                </Typography>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                <KeyCap>↑</KeyCap>
                <KeyCap>↓</KeyCap>
                <Typography component="span" sx={{ fontSize: 12, color: colors.secondary }}>
                  ：调整速度；
                </Typography>
              </Box>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                <KeyCap>ESC</KeyCap>
                <Typography component="span" sx={{ fontSize: 12, color: colors.secondary }}>
                  ：退出全屏
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {toast.msg ? (
          <Box
            role="status"
            sx={{
              position: "fixed",
              left: "50%",
              bottom: 96,
              transform: "translateX(-50%)",
              zIndex: 2000,
              px: 2,
              height: 40,
              display: "flex",
              alignItems: "center",
              bgcolor: colors.toolbarBg,
              color: colors.title,
              border: `1px solid ${colors.border}`,
              borderRadius: 1,
              fontSize: 13,
              fontWeight: 500,
              maxWidth: "80vw",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {toast.msg}
          </Box>
        ) : null}

        <FullscreenOverlay
          open={fsOpen}
          rootRef={fsRootRef}
          scrollRef={fsScrollRef}
          script={script}
          fontSizePx={fontSizePx}
          mirror={mirror}
          playing={playingFs}
          speedPps={speedPps}
          onClose={closeFullscreen}
          onTogglePlay={() => setPlayingFs((v) => !v)}
          onTop={() => {
            if (fsScrollRef.current) fsScrollRef.current.scrollTop = 0;
            toast.show("已回到开头");
          }}
          onSpeedDelta={(d) => onSpeedPps(Math.min(180, Math.max(12, speedPps + d)))}
          onToast={toast.show}
        />
      </Box>
    </ThemeProvider>
  );
}

