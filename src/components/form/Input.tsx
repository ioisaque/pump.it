import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "@unform/core";
import { ChangeEvent, isValidElement, ReactNode, useEffect, useRef, useState } from "react";
import { formatMoneyInputValue, isMoneyMaskClass } from "utils/ideyou-masks";
import { COMPACT_INPUT_FONT_SIZE } from "./inputConstants";
import { InputGroupAddon, InputGroupAddonProps } from "./InputGroupAddon";
import { compactInputRootSx, inputGroupFieldSx } from "./inputGroupStyles";

interface Props {
  name: string;
  label?: string;
  prepend?: ReactNode | InputGroupAddonProps;
  append?: ReactNode | InputGroupAddonProps;
}

type InputProps = Omit<TextFieldProps, "name" | "label" | "prepend" | "append"> & Props;

function renderAddon(
  slot: ReactNode | InputGroupAddonProps | undefined,
  position: "start" | "end",
) {
  if (!slot) return undefined;
  if (isValidElement(slot)) return slot;
  return <InputGroupAddon position={position} {...(slot as InputGroupAddonProps)} />;
}

export default function Input({
  name,
  label,
  prepend,
  append,
  sx,
  InputProps: inputPropsProp,
  InputLabelProps: inputLabelPropsProp,
  onChange,
  inputProps: nativeInputProps,
  size = "small",
  multiline,
  ...rest
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);
  const moneyMaskClass =
    typeof nativeInputProps?.className === "string" ? nativeInputProps.className : "";
  const usesMoneyMask = isMoneyMaskClass(moneyMaskClass);

  const [value, setValue] = useState(() => {
    const raw = defaultValue != null ? String(defaultValue) : "";
    return usesMoneyMask ? formatMoneyInputValue(raw, moneyMaskClass) : raw;
  });
  const valueRef = useRef(value);
  valueRef.current = value;

  const registerFieldRef = useRef(registerField);
  registerFieldRef.current = registerField;

  const startAdornment = renderAddon(prepend, "start");
  const endAdornment = renderAddon(append, "end");
  const hasPrepend = Boolean(startAdornment);
  const hasAppend = Boolean(endAdornment);

  const mergedNativeInputProps = {
    ...nativeInputProps,
    ...(usesMoneyMask ? { "data-ideyou-mask": "off" as const } : {}),
  };

  useEffect(() => {
    registerFieldRef.current({
      name: fieldName,
      ref: inputRef,
      getValue: () => valueRef.current,
      setValue: (ref, nextValue) => {
        const raw = nextValue == null ? "" : String(nextValue);
        const v = usesMoneyMask ? formatMoneyInputValue(raw, moneyMaskClass) : raw;
        setValue(v);
        valueRef.current = v;
        if (ref.current) ref.current.value = v;
      },
      clearValue: (ref) => {
        const v = usesMoneyMask ? formatMoneyInputValue("", moneyMaskClass) : "";
        setValue(v);
        valueRef.current = v;
        if (ref.current) ref.current.value = "";
      },
    });
  }, [fieldName, usesMoneyMask, moneyMaskClass]);

  const prevDefaultRef = useRef(defaultValue);

  useEffect(() => {
    if (!usesMoneyMask) return;
    if (prevDefaultRef.current === defaultValue) return;
    prevDefaultRef.current = defaultValue;
    const raw = defaultValue != null ? String(defaultValue) : "";
    const formatted = formatMoneyInputValue(raw, moneyMaskClass);
    setValue(formatted);
    valueRef.current = formatted;
  }, [defaultValue, usesMoneyMask, moneyMaskClass]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    let next = event.target.value;
    if (usesMoneyMask) {
      next = formatMoneyInputValue(next, moneyMaskClass);
      if (inputRef.current) inputRef.current.value = next;
    }
    setValue(next);
    valueRef.current = next;
    onChange?.(event);
  }

  return (
    <TextField
      {...rest}
      size={size}
      multiline={multiline}
      inputProps={mergedNativeInputProps}
      variant="outlined"
      fullWidth
      name={name}
      label={label}
      id={fieldName}
      helperText={error}
      error={Boolean(error)}
      value={value}
      onChange={handleChange}
      inputRef={inputRef}
      InputLabelProps={{
        ...inputLabelPropsProp,
        shrink: value !== "" ? true : inputLabelPropsProp?.shrink,
      }}
      sx={[
        // Compact fixed height is for single-line only — multiline must grow with rows.
        ...(multiline
          ? [
              {
                "& .MuiInputBase-root": {
                  height: "auto",
                  fontSize: COMPACT_INPUT_FONT_SIZE,
                  backgroundColor: "transparent",
                },
                "& .MuiOutlinedInput-root": {
                  alignItems: "flex-start",
                  backgroundColor: "transparent",
                },
              },
            ]
          : [compactInputRootSx()]),
        inputGroupFieldSx(hasPrepend, hasAppend),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      InputProps={{
        ...inputPropsProp,
        startAdornment: startAdornment ?? inputPropsProp?.startAdornment,
        endAdornment: endAdornment ?? inputPropsProp?.endAdornment,
      }}
    />
  );
}
