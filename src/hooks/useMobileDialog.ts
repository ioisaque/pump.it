import { Breakpoint, useMediaQuery, useTheme } from "@mui/material";
import type { DialogProps } from "@mui/material/Dialog";

/**
 * Props to spread onto MUI `Dialog` so it goes fullscreen below `breakpoint`
 * (default `sm`, same as UserBar mobile nav).
 */
export function useMobileDialog(
  maxWidth: DialogProps["maxWidth"] = "sm",
  breakpoint: Breakpoint = "sm",
): Pick<DialogProps, "fullScreen" | "fullWidth" | "maxWidth"> {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  return {
    fullScreen: isMobile,
    fullWidth: true,
    maxWidth: isMobile ? false : maxWidth,
  };
}
