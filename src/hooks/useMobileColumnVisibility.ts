import { Breakpoint, useMediaQuery, useTheme } from "@mui/material";
import type { GridColumnVisibilityModel } from "@mui/x-data-grid";
import { useMemo } from "react";

/**
 * Hides secondary DataGrid columns below `breakpoint` (default `sm`).
 * Pass a stable field list (module-level const) so the model stays referentially quiet.
 */
export function useMobileColumnVisibility(
  hideOnMobile: readonly string[],
  breakpoint: Breakpoint = "sm",
): GridColumnVisibilityModel {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  return useMemo(() => {
    if (!isMobile) return {};
    const model: GridColumnVisibilityModel = {};
    for (const field of hideOnMobile) {
      model[field] = false;
    }
    return model;
  }, [isMobile, hideOnMobile]);
}
