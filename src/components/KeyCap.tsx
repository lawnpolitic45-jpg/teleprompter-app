import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type Props = {
  children: string;
  sx?: SxProps<Theme>;
};

/** 圆角白底，模拟键盘按键 */
export function KeyCap({ children, sx }: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 0.75,
        py: 0.35,
        minHeight: 22,
        bgcolor: "#fff",
        color: "#14532D",
        borderRadius: 1,
        border: "1px solid #BBF7D0",
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        boxShadow: "0 1px 2px rgba(20, 83, 45, 0.06)",
        verticalAlign: "middle",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
