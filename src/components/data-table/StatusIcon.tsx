import ActionIcon from "components/data-table/ActionIcon";
import TableActions from "components/data-table/TableActions";
import type { StatusMutationVars } from "hooks/useStatusMutation";

type StatusIconVariant = "play" | "door";

type StatusIconProps<TId extends string | number = number> = {
  status: string | number;
  id: TId;
  nome: string;
  onToggle?: (vars: StatusMutationVars<TId>) => void;
  variant?: StatusIconVariant;
  activeCode?: string;
  pausedCode?: string;
  readOnly?: boolean;
  size?: number;
};

export default function StatusIcon<TId extends string | number = number>({
  status,
  id,
  nome,
  onToggle,
  variant = "play",
  activeCode = "ACTIVE",
  pausedCode = "BLOCKED",
  readOnly = false,
  size = 32,
}: StatusIconProps<TId>) {
  const numeric =
    typeof status === "number" || (typeof status === "string" && /^\d+$/.test(status));
  const active = numeric ? Number(status) === 1 : status === activeCode;
  const nextStatus = numeric ? (active ? 2 : 1) : active ? pausedCode : activeCode;

  const icon =
    variant === "door"
      ? "majesticons:door-enter"
      : active
        ? "mdi:play-box"
        : "mdi:pause-box";
  const hoverIcon =
    readOnly || !onToggle
      ? icon
      : variant === "door"
        ? active
          ? "majesticons:lock"
          : "majesticons:lock-off"
        : active
          ? "mdi:pause-box"
          : "mdi:play-box";

  return (
    <TableActions
      sx={{
        p: 0,
        gap: 0,
        alignItems: "center",
        justifyContent: "center",
        "& button": {
          p: 0,
          minHeight: 0,
          height: "auto",
          alignSelf: "center",
        },
      }}
    >
      <ActionIcon
        icon={icon}
        size={size}
        hoverIcon={hoverIcon}
        color={active ? "success.main" : "error.main"}
        hoverColor={readOnly || !onToggle ? (active ? "success.main" : "error.main") : active ? "error.main" : "success.main"}
        to="#status"
        onClick={(e) => {
          e.preventDefault();
          if (readOnly || !onToggle) return;
          onToggle({ id, nextStatus, nome });
        }}
      />
    </TableActions>
  );
}
