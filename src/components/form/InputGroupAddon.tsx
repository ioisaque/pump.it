import { Box, IconButton, InputAdornment, Theme, Tooltip, useTheme } from "@mui/material";
import Icon from "components/Icon";
import { ReactNode } from "react";
import { ADDON_WIDTH } from "./inputGroupStyles";

export type InputGroupAddonProps = {
  icon?: string;
  bgcolor?: string;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
  ariaLabel?: string;
  children?: ReactNode;
};

type InputGroupAddonSlotProps = InputGroupAddonProps & {
  position: "start" | "end";
};

function resolveAddonColors(
  bgcolor: string | undefined,
  color: string | undefined,
  theme: Theme,
) {
  const hasCustomBg = Boolean(bgcolor);
  const bg = bgcolor ?? 'transparent';
  const iconColor = color ?? (hasCustomBg ? "#fff" : theme.palette.text.secondary);
  return { bg, iconColor, hasCustomBg };
}

function shellSx(
  bg: string,
  iconColor: string,
  hasCustomBg: boolean,
  position: "start" | "end",
) {

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    flex: `0 0 ${ADDON_WIDTH}px`,
    width: ADDON_WIDTH,
    minWidth: ADDON_WIDTH,
    height: "100%",
    minHeight: "100%",
    bgcolor: bg,
    color: iconColor,
    border: "1px solid",
    borderColor: "divider",
    boxSizing: "border-box",
    borderRadius: position === "start" ? `4px 0 0 4px` : `0 4px 4px 0`,
    ...(position === "start"
      ? { borderRight: 0 }
      : {
          borderLeft: 0,
          ...(hasCustomBg && { borderColor: bg }),
        }),
  };
}

function buttonSx(
  bg: string,
  iconColor: string,
  hasCustomBg: boolean,
  position: "start" | "end",
  theme: Theme,
) {
  
  return {
    ...shellSx(bg, iconColor, hasCustomBg, position),
    p: 0,
    borderRadius: position === "start" ? `4px 0 0 4px` : `0 4px 4px 0`,
    color: iconColor,
    "&:hover": {
      bgcolor: hasCustomBg ? bg : theme.palette.action.hover,
      filter: hasCustomBg ? "brightness(0.92)" : "none",
    },
  };
}

export function InputGroupAddon({
  position,
  icon,
  bgcolor,
  color,
  onClick,
  disabled = false,
  tooltip,
  ariaLabel,
  children,
}: InputGroupAddonSlotProps) {
  const theme = useTheme();
  const { bg, iconColor, hasCustomBg } = resolveAddonColors(bgcolor, color, theme);

  const content =
    children ??
    (icon ? <Icon name={icon} color={iconColor} width={22} height={22} /> : null);

  const shell = onClick ? (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? tooltip}
      disableRipple={false}
      sx={{
        ...buttonSx(bg, iconColor, hasCustomBg, position, theme),
        ...(disabled && { opacity: 0.45, pointerEvents: "none" }),
      }}
    >
      {content}
    </IconButton>
  ) : (
    <Box component="span" sx={shellSx(bg, iconColor, hasCustomBg, position)}>
      {content}
    </Box>
  );

  const wrapped =
    tooltip && onClick ? (
      <Tooltip title={tooltip}>
        <Box
          component="span"
          sx={{
            display: "flex",
            alignSelf: "stretch",
            height: "100%",
            minHeight: "100%",
          }}
        >
          {shell}
        </Box>
      </Tooltip>
    ) : (
      shell
    );

  return (
    <InputAdornment
      position={position}
      disablePointerEvents={!onClick}
      sx={{
        height: "auto",
        maxHeight: "none",
        alignSelf: "stretch",
        m: 0,
        p: 0,
        display: "flex",
        "& > *": {
          alignSelf: "stretch",
          height: "100%",
          minHeight: "100%",
        },
        "& .MuiIconButton-root": {
          height: "100%",
          minHeight: "100%",
        },
      }}
    >
      {wrapped}
    </InputAdornment>
  );
}
