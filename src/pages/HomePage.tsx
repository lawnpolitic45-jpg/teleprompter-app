import PlayArrow from "@mui/icons-material/PlayArrow";
import { Box, CssBaseline, IconButton, Stack, TextField, ThemeProvider, Typography } from "@mui/material";
import { KeyCap } from "../components/KeyCap";
import { homeColors, homeTheme } from "../theme";

type Props = {
  script: string;
  onScriptChange: (v: string) => void;
  onStart: () => void;
};

function ShortcutLine() {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        rowGap: 0.75,
      }}
    >
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
        <KeyCap>Space</KeyCap>
        <Typography component="span" sx={{ fontSize: 11.5, lineHeight: 1.5, color: homeColors.subtle }}>
          ：播放/暂停；
        </Typography>
      </Box>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
        <KeyCap>-</KeyCap>
        <KeyCap>+</KeyCap>
        <Typography component="span" sx={{ fontSize: 11.5, lineHeight: 1.5, color: homeColors.subtle }}>
          ：调整字号；
        </Typography>
      </Box>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
        <KeyCap>↑</KeyCap>
        <KeyCap>↓</KeyCap>
        <Typography component="span" sx={{ fontSize: 11.5, lineHeight: 1.5, color: homeColors.subtle }}>
          ：调整速度；
        </Typography>
      </Box>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
        <KeyCap>ESC</KeyCap>
        <Typography component="span" sx={{ fontSize: 11.5, lineHeight: 1.5, color: homeColors.subtle }}>
          ：退出全屏
        </Typography>
      </Box>
    </Box>
  );
}

export function HomePage({ script, onScriptChange, onStart }: Props) {
  return (
    <ThemeProvider theme={homeTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(1200px 600px at 20% 0%, #BBF7D0 0%, ${homeColors.pageBg} 55%, ${homeColors.pageBg} 100%)`,
        }}
      >
        <Box
          component="header"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 28, sm: 34 },
              fontWeight: 800,
              color: homeColors.title,
              letterSpacing: "0.02em",
              textAlign: "center",
            }}
          >
            提词器
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3 },
            pb: 3,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 980,
              flex: 1,
              minHeight: 0,
              bgcolor: homeColors.surface,
              border: `1px solid ${homeColors.border}`,
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(20, 83, 45, 0.08)",
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 220, mb: 1.5 }}>
              <TextField
                multiline
                fullWidth
                minRows={10}
                placeholder="在此输入或粘贴"
                value={script}
                onChange={(e) => onScriptChange(e.target.value)}
                sx={{
                  flex: 1,
                  minHeight: 0,
                  "& .MuiInputBase-root": {
                    height: "100%",
                    bgcolor: homeColors.inputBg,
                    fontSize: 15,
                    lineHeight: 1.75,
                    alignItems: "stretch",
                  },
                  "& .MuiInputBase-input": {
                    height: "100% !important",
                    overflow: "auto !important",
                    boxSizing: "border-box",
                  },
                  "& fieldset": { borderColor: homeColors.border },
                }}
              />
            </Box>

            <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}>
              <Box
                sx={{
                  width: "100%",
                  p: 1.25,
                  borderRadius: 2,
                  bgcolor: homeColors.shortcutBg,
                  border: `1px solid ${homeColors.shortcutBorder}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: homeColors.title,
                    textAlign: "center",
                    mb: 1,
                  }}
                >
                  快捷键
                </Typography>
                <ShortcutLine />
              </Box>

              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end" sx={{ width: "100%" }}>
                <Typography sx={{ fontSize: 12.5, color: homeColors.subtle }}>{script.length} 字</Typography>
                <IconButton
                  aria-label="开始提词"
                  onClick={onStart}
                  sx={{
                    width: 56,
                    height: 56,
                    p: 0,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: homeColors.primary,
                    color: "#fff",
                    "&:hover": { bgcolor: homeColors.primaryHover },
                    "& .MuiSvgIcon-root": { fontSize: 32, ml: 0.25 },
                  }}
                >
                  <PlayArrow />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
