import { TextField } from "@mui/material";
import { KeyboardEvent, useEffect, useState } from "react";

type GridCellTextFieldProps = {
  value: string;
  onCommit: (value: string) => void;
  onLiveChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onEnter?: () => void;
  placeholder?: string;
};

function stopGridKeys(event: KeyboardEvent) {
  event.stopPropagation();
}

function blockGridKeyboard(event: KeyboardEvent) {
  event.stopPropagation();
  const target = event.target as HTMLElement | null;
  if (!target?.closest("input, textarea")) return;
  if (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === " " ||
    event.key === "Spacebar"
  ) {
    event.nativeEvent.stopImmediatePropagation();
  }
}

export default function GridCellTextField({
  value,
  onCommit,
  onLiveChange,
  onFocus,
  onBlur,
  onEnter,
  placeholder,
}: GridCellTextFieldProps) {
  const [local, setLocal] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setLocal(value);
  }, [value, editing]);

  function commit(next = local) {
    if (next !== value) onCommit(next);
  }

  return (
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder}
      value={local}
      onFocus={() => {
        setEditing(true);
        setLocal(value);
        onFocus?.();
      }}
      onBlur={() => {
        setEditing(false);
        commit();
        onBlur?.();
      }}
      onChange={(event) => {
        setLocal(event.target.value);
        onLiveChange?.(event.target.value);
      }}
      onKeyDownCapture={blockGridKeyboard}
      onKeyDown={(event) => {
        stopGridKeys(event);
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
          onEnter?.();
        }
      }}
      onKeyUpCapture={stopGridKeys}
      onKeyUp={stopGridKeys}
      inputProps={{ "data-ideyou-mask": "off" }}
    />
  );
}
