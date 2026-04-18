import { Box, InputBase } from "@mui/material";
import { colors } from "../theme";

type Props = {
  text: string;
  fontSizePx: number;
  mirrorH: boolean;
  mirrorV: boolean;
  maxContentWidth?: number | string;
  variant?: "default" | "fullscreen" | "previewDark";
  onChange?: (v: string) => void;
};

export function PrompterContent({
  text,
  fontSizePx,
  mirrorH,
  mirrorV,
  maxContentWidth = "min(920px, 86vw)",
  variant = "default",
  onChange,
}: Props) {
  const paragraphs = text.length ? text.split(/\n{2,}/) : [];
  const dark = variant === "fullscreen" || variant === "previewDark";
  const bodyColor = dark ? colors.fullscreenText : colors.title;
  const emptyColor = dark ? colors.fullscreenMuted : colors.secondary;

  const mirrorParts: string[] = [];
  if (mirrorH) mirrorParts.push("scaleX(-1)");
  if (mirrorV) mirrorParts.push("scaleY(-1)");
  const mirrorTransform = mirrorParts.length ? mirrorParts.join(" ") : undefined;

  return (
    <Box
      sx={{
        mx: "auto",
        width: maxContentWidth,
        transform: mirrorTransform,
        transformOrigin: "center",
        py: 3,
        px: { xs: 2, sm: 3 },
        position: "relative",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
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
      {onChange ? (
        <InputBase
          multiline
          fullWidth
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="在此输入或粘贴"
          sx={{
            flex: 1,
            alignItems: "flex-start",
            color: bodyColor,
            fontSize: fontSizePx,
            fontWeight: 500,
            lineHeight: 1.45,
            p: 0,
            "& .MuiInputBase-input": {
              p: 0,
              minHeight: "50vh",
            }
          }}
        />
      ) : paragraphs.length === 0 ? (
        <Box
          component="p"
          sx={{
            m: 0,
            color: emptyColor,
            fontSize: fontSizePx,
            fontWeight: 500,
            lineHeight: 1.45,
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
              lineHeight: 1.45,
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
