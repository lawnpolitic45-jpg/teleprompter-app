import Fullscreen from "@mui/icons-material/Fullscreen";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import {
  Box,
  CssBaseline,
  GlobalStyles,
  IconButton,
  Slider,
  Stack,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { FullscreenOverlay } from "../components/FullscreenOverlay";
import { KeyCap } from "../components/KeyCap";
import { PrompterContent } from "../components/PrompterContent";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { appTheme, colors } from "../theme";
import { computeScriptStats } from "../utils/scriptStats";

import { SvgIcon } from "@mui/material";

function ReturnPathIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 20h6a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H5"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 8 5 4 9 0"
      />
    </SvgIcon>
  );
}

function MirrorHorizontalIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
      <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
      <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    </SvgIcon>
  );
}

function MirrorVerticalIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <path fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
    </SvgIcon>
  );
}

export const formatTime = (secs: number) => {
  if (secs < 0 || isNaN(secs) || !isFinite(secs)) secs = 0;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

type ToastApi = { msg: string | null; show: (m: string) => void };

type Props = {
  script: string;
  fontSizePx: number;
  speedPps: number;
  mirrorH: boolean;
  mirrorV: boolean;
  onFontSizePx: (v: number) => void;
  onSpeedPps: (v: number) => void;
  onMirrorH: (v: boolean) => void;
  onMirrorV: (v: boolean) => void;
  toast: ToastApi;
  onBackHome: () => void;
};

export function PrompterPage({
  script,
  fontSizePx,
  speedPps,
  mirrorH,
  mirrorV,
  onFontSizePx,
  onSpeedPps,
  onMirrorH,
  onMirrorV,
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

  const speedRef = useRef(speedPps);
  const fontRef = useRef(fontSizePx);
  speedRef.current = speedPps;
  fontRef.current = fontSizePx;

  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fsRootRef = useRef<HTMLDivElement>(null);
  const fsScrollRef = useRef<HTMLDivElement>(null);

  const activeScrollRef = fsOpen ? fsScrollRef : previewScrollRef;
  const playing = fsOpen ? playingFs : playingPreview;

  const { unitCount, punctuationCount, lineCount } = computeScriptStats(script);

  const [timeStats, setTimeStats] = useState({ elapsed: 0, remaining: 0 });

  useEffect(() => {
    const calc = () => {
      const el = fsOpenRef.current ? fsScrollRef.current : previewScrollRef.current;
      if (!el) return;
      const distance = Math.max(0, el.scrollHeight - el.clientHeight);
      if (distance === 0) {
        setTimeStats((prev) => (prev.elapsed === 0 && prev.remaining === 0 ? prev : { elapsed: 0, remaining: 0 }));
        return;
      }
      const current = el.scrollTop;
      const spd = speedRef.current;
      const elapsedSec = current / spd;
      const remainingSec = (distance - current) / spd;
      setTimeStats({ elapsed: elapsedSec, remaining: remainingSec });
    };
    calc();
    const iv = setInterval(calc, 250);
    return () => clearInterval(iv);
  }, []);

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
        const next = Math.min(180, Math.max(12, speedRef.current + delta));
        if (next !== speedRef.current) {
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
          const next = Math.min(72, Math.max(20, fontRef.current + delta));
          if (next !== fontRef.current) {
            onFontSizePx(next);
            queueMicrotask(() => toast.show(`字号 ${next}`));
          }
        }
      }
      if (e.key === "Escape" && fsOpenRef.current) closeFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeFullscreen, toast, onFontSizePx, onSpeedPps]);

  const statusText = playing ? "滚动中" : "未滚动";



  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "html, body": { width: "100%", height: "100%", margin: 0, padding: 0, overflow: "hidden" },
            "#root": { width: "100%", height: "100%", display: "flex", flexDirection: "column" },
            "*::-webkit-scrollbar": { width: 10, height: 10 },
            "*::-webkit-scrollbar-thumb": { backgroundColor: colors.border, borderRadius: 8 },
            "*::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          }}
        />

        <Box
          component="header"
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.pageBg,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
            rowGap: 1.25,
            py: 1.25,
            px: 2,
          }}
        >
          <Tooltip title="返回">
            <IconButton
              onClick={onBackHome}
              sx={{
                width: 44,
                height: 44,
                bgcolor: colors.primary,
                color: "#fff",
                borderRadius: 1.5,
                "&:hover": { bgcolor: colors.primaryHover },
              }}
            >
              <ReturnPathIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              rowGap: 1.25,
              flex: "1 1 240px",
              justifyContent: "flex-end",
            }}
          >
            <Box sx={{ minWidth: 140, flex: "1 1 140px", maxWidth: 220 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.label, mb: 0.5 }}>字号</Typography>
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
                <Typography sx={{ width: 36, fontSize: 14, fontWeight: 600, color: colors.value }}>
                  {fontSizePx}
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ minWidth: 140, flex: "1 1 140px", maxWidth: 220 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.label, mb: 0.5 }}>速度</Typography>
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
                <Typography sx={{ width: 36, fontSize: 14, fontWeight: 600, color: colors.value }}>
                  {Math.round(speedPps)}
                </Typography>
              </Stack>
            </Box>

            <Tooltip title="水平镜像">
              <IconButton
                onClick={() => onMirrorH(!mirrorH)}
                sx={{
                  width: 44,
                  height: 44,
                  color: mirrorH ? "#fff" : colors.label,
                  bgcolor: mirrorH ? colors.primary : "transparent",
                  border: `1px solid ${mirrorH ? colors.primary : colors.border}`,
                  borderRadius: 1.5,
                  "&:hover": {
                    bgcolor: mirrorH ? colors.primaryHover : "rgba(255, 255, 255, 0.05)",
                    borderColor: mirrorH ? colors.primaryHover : colors.border,
                  }
                }}
              >
                <MirrorHorizontalIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="垂直镜像">
              <IconButton
                onClick={() => onMirrorV(!mirrorV)}
                sx={{
                  width: 44,
                  height: 44,
                  color: mirrorV ? "#fff" : colors.label,
                  bgcolor: mirrorV ? colors.primary : "transparent",
                  border: `1px solid ${mirrorV ? colors.primary : colors.border}`,
                  borderRadius: 1.5,
                  "&:hover": {
                    bgcolor: mirrorV ? colors.primaryHover : "rgba(255, 255, 255, 0.05)",
                    borderColor: mirrorV ? colors.primaryHover : colors.border,
                  }
                }}
              >
                <MirrorVerticalIcon />
              </IconButton>
            </Tooltip>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Tooltip title="全屏">
                <IconButton
                  onClick={() => void openFullscreen()}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: colors.primary,
                    color: "#fff",
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: colors.primaryHover },
                  }}
                >
                  <Fullscreen />
                </IconButton>
              </Tooltip>
              <Tooltip title={playing && !fsOpen ? "暂停" : "开始滚动"}>
                <span>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (fsOpen) {
                        setPlayingFs((v) => !v);
                      } else {
                        setPlayingPreview((v) => {
                          const next = !v;
                          queueMicrotask(() => toast.show(next ? "开始滚动" : "已暂停"));
                          return next;
                        });
                      }
                    }}
                    disabled={fsOpen}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: colors.primary,
                      color: "#fff",
                      borderRadius: 1.5,
                      "&:hover": { bgcolor: colors.primaryHover },
                      "&.Mui-disabled": { bgcolor: colors.track, color: colors.secondary },
                    }}
                  >
                    {playing && !fsOpen ? <Pause /> : <PlayArrow />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="回到开头">
                <IconButton
                  onClick={() => {
                    scrollToTopActive();
                    toast.show("已回到开头");
                  }}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: colors.primary,
                    color: "#fff",
                    borderRadius: 1.5,
                    "&:hover": { bgcolor: colors.primaryHover },
                  }}
                >
                  <VerticalAlignTop />
                </IconButton>
              </Tooltip>
              <Box sx={{ ml: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#fff", bgcolor: "rgba(255,255,255,0.08)", px: 1, py: 0.5, borderRadius: 1.5 }}>
                <Box>{formatTime(timeStats.elapsed)}</Box>
                <Box sx={{ opacity: 0.6 }}>-{formatTime(timeStats.remaining)}</Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: colors.black }}>
          <Box
            sx={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 24,
                right: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.4)",
                px: 1.5,
                py: 1,
                borderRadius: 2,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              <Box>{formatTime(timeStats.elapsed)}</Box>
              <Box sx={{ opacity: 0.6 }}>-{formatTime(timeStats.remaining)}</Box>
            </Box>
            <Box
              ref={previewScrollRef}
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                scrollbarGutter: "stable",
              }}
            >
              <PrompterContent
                text={script}
                fontSizePx={fontSizePx}
                mirrorH={mirrorH}
                mirrorV={mirrorV}
                variant="previewDark"
                maxContentWidth="100%"
              />
            </Box>
          </Box>

          <Box
            component="footer"
            sx={{
              mt: "auto",
              pt: 1,
              pb: 1,
              px: { xs: 1.5, sm: 2 },
              minHeight: 28,
              bgcolor: colors.pageBg,
              borderTop: `1px solid ${colors.border}`,
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
          timeStats={timeStats}
          open={fsOpen}
          rootRef={fsRootRef}
          scrollRef={fsScrollRef}
          script={script}
          fontSizePx={fontSizePx}
          mirrorH={mirrorH}
          mirrorV={mirrorV}
          playing={playingFs}
          onClose={closeFullscreen}
          onTogglePlay={() => setPlayingFs((v) => !v)}
          onTop={() => {
            if (fsScrollRef.current) fsScrollRef.current.scrollTop = 0;
            toast.show("已回到开头");
          }}
          onSpeedDelta={(d) => {
            const next = Math.min(180, Math.max(12, speedRef.current + d));
            if (next !== speedRef.current) {
              onSpeedPps(next);
              queueMicrotask(() => toast.show(`速度 ${Math.round(next)}`));
            }
          }}
          onFontSizeDelta={(d) => {
            const next = Math.min(72, Math.max(20, fontRef.current + d));
            if (next !== fontRef.current) {
              onFontSizePx(next);
              queueMicrotask(() => toast.show(`字号 ${next}`));
            }
          }}
          onToast={toast.show}
        />
      </Box>
    </ThemeProvider>
  );
}
