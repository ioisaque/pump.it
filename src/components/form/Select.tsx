import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "@unform/core";
import { ChangeEvent, isValidElement, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { flagCatalogAddonFromValue, FlagCatalogOption } from "./flagCatalogAddon";
import { InputGroupAddon, InputGroupAddonProps } from "./InputGroupAddon";
import { compactInputRootSx, inputGroupFieldSx } from "./inputGroupStyles";

interface Props {
  name: string;
  label?: string;
  prepend?: ReactNode | InputGroupAddonProps;
  append?: ReactNode | InputGroupAddonProps;
  /** Native `<select>` — reliable with programmatic values (e.g. CEP autofill). */
  native?: boolean;
  /** When set, prepend icon/color follow the selected catalog option. */
  catalogOptions?: FlagCatalogOption[];
}

type SelectProps = Omit<TextFieldProps, "name" | "label" | "prepend" | "append" | "select"> &
  Props & {
    children: ReactNode;
  };

function renderAddon(
  slot: ReactNode | InputGroupAddonProps | undefined,
  position: "start" | "end",
) {
  if (!slot) return undefined;
  if (isValidElement(slot)) return slot;
  return <InputGroupAddon position={position} {...(slot as InputGroupAddonProps)} />;
}

export default function Select({
  name,
  label,
  prepend,
  append,
  native = false,
  catalogOptions,
  children,
  sx,
  InputProps: inputPropsProp,
  SelectProps: selectPropsProp,
  onChange,
  size = "small",
  ...rest
}: SelectProps) {
  const selectRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);
  const [value, setValue] = useState(() => (defaultValue != null ? String(defaultValue) : ""));
  const valueRef = useRef(value);
  valueRef.current = value;

  const catalogAddon = useMemo(
    () => flagCatalogAddonFromValue(value || defaultValue, catalogOptions),
    [value, defaultValue, catalogOptions],
  );

  const catalogPrepend = useMemo(
    () => (catalogOptions ? <InputGroupAddon position="start" {...catalogAddon} /> : undefined),
    [catalogOptions, catalogAddon],
  );

  const startAdornment =
    catalogPrepend ?? renderAddon(prepend, "start");
  const endAdornment = renderAddon(append, "end");
  const hasPrepend = Boolean(startAdornment);
  const hasAppend = Boolean(endAdornment);

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: selectRef,
      getValue: () => valueRef.current,
      setValue: (ref, nextValue) => {
        const v = nextValue == null ? "" : String(nextValue);
        setValue(v);
        if (ref.current) ref.current.value = v;
      },
      clearValue: (ref) => {
        setValue("");
        if (ref.current) ref.current.value = "";
      },
    });
  }, [fieldName, registerField]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(event.target.value);
    onChange?.(event);
  }

  return (
    <TextField
      select
      variant="outlined"
      fullWidth
      size={size}
      {...rest}
      name={name}
      label={label}
      id={fieldName}
      helperText={error}
      error={Boolean(error)}
      value={value}
      onChange={handleChange}
      inputRef={selectRef}
      SelectProps={{
        native,
        ...selectPropsProp,
      }}
      InputLabelProps={{
        ...rest.InputLabelProps,
        shrink: value !== "" ? true : rest.InputLabelProps?.shrink,
      }}
      sx={[
        compactInputRootSx(),
        inputGroupFieldSx(hasPrepend, hasAppend),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      InputProps={{
        ...inputPropsProp,
        startAdornment: startAdornment ?? inputPropsProp?.startAdornment,
        endAdornment: endAdornment ?? inputPropsProp?.endAdornment,
      }}
    >
      {children}
    </TextField>
  );
}
