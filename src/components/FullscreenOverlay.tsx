import Add from "@mui/icons-material/Add";
import CloseFullscreen from "@mui/icons-material/CloseFullscreen";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Remove from "@mui/icons-material/Remove";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import { Box, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors } from "../theme";
import { PrompterContent } from "./PrompterContent";

const DOCK_SHOW_ZONE = 120;
const DOCK_HIDE_MS = 800;

type Props = {
  open: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  script: string;
  fontSizePx: number;
  mirrorH: boolean;
  mirrorV: boolean;
  playing: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onTop: () => void;
  onSpeedDelta: (delta: number) => void;
  onFontSizeDelta: (delta: number) => void;
  onToast: (msg: string) => void;
};

export function FullscreenOverlay({
  open,
  rootRef,
  scrollRef,
  script,
  fontSizePx,
  mirrorH,
  mirrorV,
  playing,
  onClose,
  onTogglePlay,
  onTop,
  onSpeedDelta,
  onFontSizeDelta,
  onToast,
}: Props) {
  const [dockVisible, setDockVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hintEsc, setHintEsc] = useState(() => {
    try {
      return localStorage.getItem("teleprompter:hintEsc") !== "0";
    } catch {
      return true;
    }
  });

  const bumpDock = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setDockVisible(false), DOCK_HIDE_MS);
    setDockVisible((prev) => (prev ? prev : true));
  }, []);

  useEffect(() => {
    if (!open) {
      setDockVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      return;
    }
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setDockVisible(false), DOCK_HIDE_MS);
    setDockVisible(true);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onMove = (e: PointerEvent) => {
      const nearBottom = e.clientY >= window.innerHeight - DOCK_SHOW_ZONE;
      if (nearBottom) bumpDock();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [open, bumpDock]);

  useEffect(() => {
    if (!open || !hintEsc) return;
    const t = setTimeout(() => {
      onToast("Esc 退出全屏");
      try {
        localStorage.setItem("teleprompter:hintEsc", "0");
      } catch {
        /* ignore */
      }
      setHintEsc(false);
    }, 400);
    return () => clearTimeout(t);
  }, [open, hintEsc, onToast]);

  if (!open) return null;

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        bgcolor: colors.fullscreenBg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        ref={scrollRef}
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
          variant="fullscreen"
        />
      </Box>

      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 96,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />
      <Box
        aria-hidden
        sx={{
          pointerEvents: "none",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 96,
          background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          left: "50%",
          bottom: 12,
          transform: "translateX(-50%)",
          width: "min(560px, 94vw)",
          minHeight: 56,
          px: 0.75,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.dockPaper,
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(255, 255, 255, 0.12)`,
          opacity: dockVisible ? 1 : 0,
          transition: "opacity 220ms ease",
          pointerEvents: dockVisible ? "auto" : "none",
          zIndex: 1700,
        }}
      >
        <Stack direction="row" spacing={0.25} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="center">
          <Tooltip title={playing ? "暂停 (Space)" : "继续 (Space)"}>
            <IconButton
              onClick={onTogglePlay}
              sx={{
                color: colors.fullscreenText,
                border: `1px solid ${playing ? "rgba(255,255,255,0.35)" : colors.primary}`,
              }}
              aria-label={playing ? "暂停" : "继续"}
            >
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="减速（↓）">
            <IconButton
              onClick={() => onSpeedDelta(-6)}
              sx={{ color: colors.fullscreenText }}
              aria-label="减速"
            >
              <KeyboardArrowDown />
            </IconButton>
          </Tooltip>
          <Tooltip title="加速（↑）">
            <IconButton
              onClick={() => onSpeedDelta(6)}
              sx={{ color: colors.fullscreenText }}
              aria-label="加速"
            >
              <KeyboardArrowUp />
            </IconButton>
          </Tooltip>
          <Tooltip title="字号减小（-）">
            <IconButton
              onClick={() => onFontSizeDelta(-2)}
              sx={{ color: colors.fullscreenText }}
              aria-label="字号减小"
            >
              <Remove />
            </IconButton>
          </Tooltip>
          <Tooltip title="字号增大（+）">
            <IconButton
              onClick={() => onFontSizeDelta(2)}
              sx={{ color: colors.fullscreenText }}
              aria-label="字号增大"
            >
              <Add />
            </IconButton>
          </Tooltip>
          <Tooltip title="回到开头">
            <IconButton onClick={onTop} sx={{ color: colors.fullscreenText }} aria-label="回到开头">
              <VerticalAlignTop />
            </IconButton>
          </Tooltip>
          <Tooltip title="退出全屏 (Esc)">
            <IconButton onClick={onClose} sx={{ color: colors.fullscreenText }} aria-label="退出全屏">
              <CloseFullscreen />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
}
