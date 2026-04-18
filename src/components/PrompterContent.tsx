import { Box } from "@mui/material";
import { colors } from "../theme";

type Props = {
  text: string;
  fontSizePx: number;
  mirror: boolean;
  maxContentWidth?: number | string;
  /** 全屏深底时用浅色字 */
  variant?: "default" | "fullscreen";
};

export function PrompterContent({
  text,
  fontSizePx,
  mirror,
  maxContentWidth = "min(920px, 86vw)",
  variant = "default",
}: Props) {
  const paragraphs = text.length ? text.split(/\n{2,}/) : [];
  const bodyColor = variant === "fullscreen" ? colors.fullscreenText : colors.title;
  const emptyColor = variant === "fullscreen" ? colors.fullscreenMuted : colors.secondary;

  return (
    <Box
      sx={{
        mx: "auto",
        width: maxContentWidth,
        transform: mirror ? "scaleX(-1)" : undefined,
        transformOrigin: "center",
        py: 3,
        px: { xs: 2, sm: 3 },
        position: "relative",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 1,
          bgcolor: colors.border,
          opacity: 0.1,
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />
      {paragraphs.length === 0 ? (
        <Box
          component="p"
          sx={{
            m: 0,
            color: emptyColor,
            fontSize: fontSizePx,
            fontWeight: 500,
            lineHeight: 1.35,
          }}
        >
          在此输入或粘贴
        </Box>
      ) : (
        paragraphs.map((block, i) => (
          <Box
            component="p"
            key={i}
            sx={{
              m: 0,
              mb: "1.2em",
              color: bodyColor,
              fontSize: fontSizePx,
              fontWeight: 500,
              lineHeight: 1.35,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {block}
          </Box>
        ))
      )}
    </Box>
  );
}
