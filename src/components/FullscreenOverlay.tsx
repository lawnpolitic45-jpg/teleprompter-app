import Add from "@mui/icons-material/Add";
import CloseFullscreen from "@mui/icons-material/CloseFullscreen";
import Pause from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Remove from "@mui/icons-material/Remove";
import VerticalAlignTop from "@mui/icons-material/VerticalAlignTop";
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
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
  mirror: boolean;
  playing: boolean;
  speedPps: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onTop: () => void;
  onSpeedDelta: (delta: number) => void;
  onToast: (msg: string) => void;
};

export function FullscreenOverlay({
  open,
  rootRef,
  scrollRef,
  script,
  fontSizePx,
  mirror,
  playing,
  speedPps,
  onClose,
  onTogglePlay,
  onTop,
  onSpeedDelta,
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
    setDockVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setDockVisible(false), DOCK_HIDE_MS);
  }, []);

  useEffect(() => {
    if (!open) {
      setDockVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      return;
    }
    bumpDock();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [open, bumpDock]);

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
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarGutter: "stable",
        }}
      >
        <PrompterContent text={script} fontSizePx={fontSizePx} mirror={mirror} variant="fullscreen" />
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
          background: "linear-gradient(to bottom, rgba(2, 44, 34, 0.72), transparent)",
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
          background: "linear-gradient(to top, rgba(2, 44, 34, 0.72), transparent)",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          left: "50%",
          bottom: 12,
          transform: "translateX(-50%)",
          width: "min(520px, 92vw)",
          height: 56,
          px: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: colors.dockPaper,
          backdropFilter: "blur(8px)",
          border: `1px solid rgba(167, 243, 208, 0.45)`,
          opacity: dockVisible ? 1 : 0,
          transition: "opacity 220ms ease",
          pointerEvents: dockVisible ? "auto" : "none",
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title={playing ? "暂停 (Space)" : "继续 (Space)"}>
            <IconButton
              onClick={onTogglePlay}
              sx={{
                color: colors.fullscreenText,
                border: `1px solid ${playing ? "rgba(167, 243, 208, 0.55)" : colors.primary}`,
              }}
              aria-label={playing ? "暂停" : "继续"}
            >
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="减速">
            <IconButton
              onClick={() => onSpeedDelta(-6)}
              sx={{ color: colors.fullscreenText }}
              aria-label="减速"
            >
              <Remove />
            </IconButton>
          </Tooltip>
          <Tooltip title="加速">
            <IconButton
              onClick={() => onSpeedDelta(6)}
              sx={{ color: colors.fullscreenText }}
              aria-label="加速"
            >
              <Add />
            </IconButton>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{ minWidth: 52, textAlign: "center", color: colors.fullscreenText, fontWeight: 600 }}
          >
            {Math.round(speedPps)}
          </Typography>
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
