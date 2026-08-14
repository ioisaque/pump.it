import { Autocomplete, SxProps, TextField, Theme } from "@mui/material";
import { compactInputRootSx } from "components/form/inputGroupStyles";

export type AutocompleteSelectOption<T extends string | number = number> = {
  id: T;
  label: string;
};

type AutocompleteSelectProps<T extends string | number> = {
  label?: string;
  options: AutocompleteSelectOption<T>[];
  value: T | null | "";
  onChange: (id: T | null) => void;
  placeholder?: string;
  noOptionsText?: string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

export default function AutocompleteSelect<T extends string | number = number>({
  label,
  options,
  value,
  onChange,
  placeholder = "Pesquisar…",
  noOptionsText = "Nenhuma opção",
  disabled,
  sx,
}: AutocompleteSelectProps<T>) {
  const selected = options.find((opt) => opt.id === value) ?? null;

  return (
    <Autocomplete
      options={options}
      value={selected}
      disabled={disabled}
      autoHighlight
      autoComplete
      clearOnEscape
      noOptionsText={noOptionsText}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(opt) => opt.label}
      onChange={(_e, next) => onChange(next?.id ?? null)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          size="small"
          sx={compactInputRootSx()}
        />
      )}
      sx={[
        { minWidth: 180, flex: 1 },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
