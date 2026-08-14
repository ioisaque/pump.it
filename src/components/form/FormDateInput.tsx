import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "@unform/core";
import { US_DATE } from "domain/shared/formatters";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { compactInputRootSx } from "./inputGroupStyles";

type FormDateInputProps = Omit<TextFieldProps, "name" | "value" | "onChange" | "type"> & {
  name: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

/** Unform date field — native `type="date"` (ISO yyyy-mm-dd). */
export default function FormDateInput({ name, onChange, sx, size = "small", ...rest }: FormDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);
  const [value, setValue] = useState(() => US_DATE(defaultValue != null ? String(defaultValue) : ""));
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: () => valueRef.current,
      setValue: (_ref, nextValue) => {
        const iso = US_DATE(nextValue == null ? "" : String(nextValue));
        setValue(iso);
        valueRef.current = iso;
      },
      clearValue: () => {
        setValue("");
        valueRef.current = "";
      },
    });
  }, [fieldName, registerField]);

  return (
    <TextField
      {...rest}
      type="date"
      size={size}
      fullWidth
      variant="outlined"
      name={name}
      id={fieldName}
      value={value}
      inputRef={inputRef}
      error={Boolean(error)}
      helperText={error || rest.helperText}
      InputLabelProps={{ shrink: true, ...rest.InputLabelProps }}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        setValue(next);
        valueRef.current = next;
        onChange?.(event);
      }}
      sx={[compactInputRootSx(), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
}
