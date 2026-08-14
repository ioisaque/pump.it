import { Box } from "@mui/material";
import Icon from "components/Icon";
import { MouseEvent, MouseEventHandler } from "react";
import { Link } from "react-router-dom";

export interface ActionIconProps {
  icon: string;
  size?: number;
  hoverIcon?: string;
  color?: string;
  hoverColor?: string;
  to?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function ActionIcon({
  icon,
  size,
  hoverIcon,
  color,
  hoverColor,
  to,
  onClick,
}: ActionIconProps) {
  const useButton = !to || to.startsWith("#");
  const customGridSize = size != null;

  const stopGridEvent = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Box
      component={useButton ? "button" : Link}
      {...(useButton ? { type: "button" } : { to })}
      {...(customGridSize ? { "data-grid-icon-size": "" } : {})}
      onMouseDown={stopGridEvent}
      onClick={(e) => {
        stopGridEvent(e);
        onClick?.(e);
      }}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
        borderRadius: 1,
        color: "inherit",
        border: "none",
        background: "none",
        padding: "6px 8px",
        cursor: "pointer",
        ...(customGridSize && { "--grid-icon-px": `${size}px` }),
      }}
    >
      <Icon
        name={icon}
        hoverIcon={hoverIcon}
        color={color ?? "inherit"}
        hoverColor={hoverColor}
        width={size}
        height={size}
      />
    </Box>
  );
}
