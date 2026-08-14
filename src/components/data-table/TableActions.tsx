import { Box, BoxProps } from "@mui/material";
import { ReactNode, SyntheticEvent } from "react";
import { GRID_ROW_MIN_HEIGHT_PX } from "./GridTable";

interface TableActionsProps {
  children: ReactNode;
  sx?: BoxProps["sx"];
}

export default function TableActions({ children, sx }: TableActionsProps) {
  const stopGridEvent = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <Box
      className="tableActions"
      onMouseDown={stopGridEvent}
      onClick={stopGridEvent}
      sx={{
        display: "flex",
        alignItems: "stretch",
        alignSelf: "stretch",
        width: "100%",
        height: "100%",
        minHeight: GRID_ROW_MIN_HEIGHT_PX,
        p: "0 15px",
        gap: 1,
        m: 0,
        "& a:not(:has(.icon-hover)):hover > span, & button:not(:has(.icon-hover)):hover > span": {
          filter: "brightness(0.6)",
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
