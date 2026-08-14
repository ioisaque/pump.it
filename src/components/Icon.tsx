import { Icon as IconifyIcon } from "@iconify/react";
import { Box, SxProps, Theme } from "@mui/material";
import { resolveIconifyId } from "utils/iconify";

interface IconProps {
  name: string;
  hoverIcon?: string;
  color?: string;
  hoverColor?: string;
  sx?: SxProps<Theme>;
  width?: number | string;
  height?: number | string;
}

function Icon({ name, hoverIcon, color, hoverColor, sx, width = "1.15em", height }: IconProps) {
  const iconId = resolveIconifyId(name);
  const hoverIconId = hoverIcon ? resolveIconifyId(hoverIcon) : null;
  const size = height ?? width;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        color: color ?? "inherit",
        lineHeight: 0,
        position: hoverIconId ? "relative" : undefined,
        ...(hoverColor && {
          "&:hover": {
            color: hoverColor,
          },
        }),
        ...(hoverIconId && {
          "& .icon-default": {
            display: "inline-flex",
          },
          "& .icon-hover": {
            position: "absolute",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          },
          "&:hover .icon-default": {
            visibility: "hidden",
          },
          "&:hover .icon-hover": {
            display: "inline-flex",
          },
        }),
        ...sx,
      }}
    >
      {hoverIconId ? (
        <>
          <IconifyIcon className="icon-default" icon={iconId} width={width} height={size} />
          <IconifyIcon className="icon-hover" icon={hoverIconId} width={width} height={size} />
        </>
      ) : (
        <IconifyIcon icon={iconId} width={width} height={size} />
      )}
    </Box>
  );
}

export default Icon;
