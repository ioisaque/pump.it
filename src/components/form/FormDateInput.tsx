import { TextFieldProps } from "@mui/material";
import { useField } from "@unform/core";
import DateInput from "components/form/DateInput";
import { inputDateValue } from "domain/datahora/types";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type FormDateInputProps = Omit<TextFieldProps, "name" | "value" | "onChange" | "type"> & {
  name: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  clearable?: boolean;
};

export default function FormDateInput({ name, onChange, ...rest }: FormDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);
  const [value, setValue] = useState(() => inputDateValue(defaultValue != null ? String(defaultValue) : ""));
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: () => valueRef.current,
      setValue: (_ref, nextValue) => {
        const iso = inputDateValue(nextValue == null ? "" : String(nextValue));
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
    <DateInput
      {...rest}
      name={name}
      id={fieldName}
      value={value}
      onChange={(iso) => {
        setValue(iso);
        valueRef.current = iso;
        onChange?.({ target: { name, value: iso } } as ChangeEvent<HTMLInputElement>);
      }}
      inputRef={inputRef}
      error={Boolean(error)}
      helperText={error || rest.helperText}
    />
  );
}
