import { Box, ClickAwayListener, Paper, Popper, TextField, TextFieldProps } from "@mui/material";
import { DATE_CALENDAR_ADDON, DATE_PICKER_ACCENT } from "components/form/dateInputConstants";
import { InputGroupAddon } from "components/form/InputGroupAddon";
import { compactInputRootSx, inputGroupFieldSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import { ptBR } from "date-fns/locale";
import { calendarDateUTC } from "domain/datahora/calendar-utc";
import {
    dateToISO,
    formatBrDateInputShort,
    maskBrDateInputTyping,
    parseBrDateInputToStorage,
    parseStorageDate,
    TODAY,
} from "domain/datahora/types";
import { ChangeEvent, Ref, useEffect, useRef, useState } from "react";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type DateInputProps = Omit<TextFieldProps, "value" | "onChange" | "type"> & {
  value: string;
  onChange: (iso: string) => void;
  clearable?: boolean;
  inputRef?: Ref<HTMLInputElement>;
};

export default function DateInput({
  value,
  onChange,
  clearable = false,
  placeholder = "dd/mm/aa",
  helperText,
  disabled,
  size = "small",
  sx,
  FormHelperTextProps,
  InputLabelProps,
  inputRef,
  ...rest
}: DateInputProps) {
  const [display, setDisplay] = useState(() => formatBrDateInputShort(value));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    setDisplay(formatBrDateInputShort(value));
  }, [value]);

  const openCalendar = () => {
    if (!disabled) setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  const commitDisplay = (nextDisplay: string) => {
    const parsed = parseBrDateInputToStorage(nextDisplay);
    if (parsed === null) {
      setDisplay(formatBrDateInputShort(valueRef.current));
      return;
    }
    setDisplay(nextDisplay.trim() ? nextDisplay : "");
    if (parsed !== valueRef.current) onChange(parsed);
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const masked = maskBrDateInputTyping(event.target.value);
    setDisplay(masked);
    const parsed = parseBrDateInputToStorage(masked);
    if (parsed !== null && parsed !== valueRef.current) onChange(parsed);
  };

  const handleBlur = () => {
    commitDisplay(display);
  };

  const handleCalendarSelect = (date: Date) => {
    // react-date-range entrega meia-noite local — normaliza para UTC noon.
    const normalized = calendarDateUTC(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const iso = dateToISO(normalized);
    setDisplay(formatBrDateInputShort(iso));
    onChange(iso);
    setCalendarOpen(false);
  };

  const handleClear = () => {
    setDisplay("");
    onChange("");
  };

  const calendarDate = parseStorageDate(value) ?? TODAY();
  const hasValue = Boolean(value);
  const hasPrepend = true;
  const hasAppend = clearable && hasValue;

  return (
    <>
      <Box ref={anchorRef}>
        <TextField
          {...rest}
          fullWidth
          variant="outlined"
          size={size}
          disabled={disabled}
          placeholder={placeholder}
          value={display}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onClick={openCalendar}
          helperText={helperText}
          FormHelperTextProps={FormHelperTextProps}
          InputLabelProps={{
            ...InputLabelProps,
            shrink: display !== "" ? true : InputLabelProps?.shrink,
          }}
          inputProps={{
            inputMode: "numeric",
            "aria-label":
              typeof rest.label === "string"
                ? rest.label
                : ((rest["aria-label"] as string | undefined) ?? "Data"),
          }}
          inputRef={inputRef}
          sx={[
            compactInputRootSx(),
            inputGroupFieldSx(hasPrepend, hasAppend),
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
          InputProps={{
            startAdornment: (
              <InputGroupAddon
                position="start"
                {...DATE_CALENDAR_ADDON}
                onClick={openCalendar}
                tooltip="Abrir calendário"
                ariaLabel="Abrir calendário"
              />
            ),
            endAdornment:
              clearable && hasValue ? (
                <InputGroupAddon
                  position="end"
                  onClick={disabled ? undefined : handleClear}
                  tooltip="Limpar data"
                  ariaLabel="Limpar data"
                >
                  <Icon name="mdi:close" width={18} height={18} />
                </InputGroupAddon>
              ) : undefined,
          }}
        />
      </Box>
      <Popper
        open={calendarOpen}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        modifiers={[
          { name: "offset", options: { offset: [0, 8] } },
          { name: "flip", options: { fallbackPlacements: ["top-start", "bottom-end", "top-end"] } },
          { name: "preventOverflow", options: { padding: 8, boundary: "viewport" } },
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 2 }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) return;
            closeCalendar();
          }}
        >
          <Paper elevation={8} sx={{ overflow: "visible" }}>
            <Calendar
              date={calendarDate}
              onChange={handleCalendarSelect}
              locale={ptBR}
              color={DATE_PICKER_ACCENT}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
