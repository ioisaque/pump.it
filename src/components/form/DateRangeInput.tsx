import { Box, ClickAwayListener, Paper, Popper, TextField, TextFieldProps } from "@mui/material";
import { DATE_CALENDAR_ADDON, DATE_PICKER_ACCENT } from "components/form/dateInputConstants";
import { dateRangeStaticRanges } from "components/form/dateRangePresets";
import { InputGroupAddon } from "components/form/InputGroupAddon";
import { compactInputRootSx, inputGroupFieldSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import { ptBR } from "date-fns/locale";
import { calendarDateUTC } from "domain/datahora/calendar-utc";
import {
    dateToISO,
    formatBrDateRangeInput,
    maskBrDateRangeInputTyping,
    parseBrDateRangeInputToStorage,
    parseStorageDate,
    TODAY,
} from "domain/datahora/types";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { DateRangePicker, Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

type DateRangeInputProps = Omit<TextFieldProps, "value" | "onChange"> & {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  emptyLabel?: string;
  clearable?: boolean;
};

export default function DateRangeInput({
  from,
  to,
  onApply,
  emptyLabel = "dd/mm/aa à dd/mm/aa",
  clearable = true,
  disabled,
  size = "small",
  sx,
  InputLabelProps,
  ...rest
}: DateRangeInputProps) {
  const [display, setDisplay] = useState(() => formatBrDateRangeInput(from, to));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef(from);
  const toRef = useRef(to);
  fromRef.current = from;
  toRef.current = to;

  const [rangeSelection, setRangeSelection] = useState<Range>(() => {
    const start = parseStorageDate(from) ?? TODAY();
    const end = parseStorageDate(to) ?? TODAY();
    return { startDate: start, endDate: end, key: "selection" };
  });

  useEffect(() => {
    setDisplay(formatBrDateRangeInput(from, to));
    const start = parseStorageDate(from) ?? TODAY();
    const end = parseStorageDate(to) ?? TODAY();
    setRangeSelection({ startDate: start, endDate: end, key: "selection" });
  }, [from, to]);

  const hasRange = Boolean(from && to);
  const hasPrepend = true;
  const hasAppend = clearable && hasRange;

  const openCalendar = () => {
    if (!disabled) setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  const applyRange = (start: Date, end: Date) => {
    const startUtc = calendarDateUTC(start.getFullYear(), start.getMonth() + 1, start.getDate());
    const endUtc = calendarDateUTC(end.getFullYear(), end.getMonth() + 1, end.getDate());
    const nextFrom = dateToISO(startUtc);
    const nextTo = dateToISO(endUtc);
    onApply(nextFrom, nextTo);
    setDisplay(formatBrDateRangeInput(nextFrom, nextTo));
    setRangeSelection({ startDate: startUtc, endDate: endUtc, key: "selection" });
  };

  const commitDisplay = (nextDisplay: string) => {
    const parsed = parseBrDateRangeInputToStorage(nextDisplay);
    if (parsed === null) {
      setDisplay(formatBrDateRangeInput(fromRef.current, toRef.current));
      return;
    }
    if (!parsed.from && !parsed.to) {
      setDisplay("");
      if (fromRef.current || toRef.current) onApply("", "");
      return;
    }
    setDisplay(formatBrDateRangeInput(parsed.from, parsed.to));
    if (parsed.from !== fromRef.current || parsed.to !== toRef.current) {
      onApply(parsed.from, parsed.to);
    }
  };

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const masked = maskBrDateRangeInputTyping(event.target.value);
    setDisplay(masked);
    const parsed = parseBrDateRangeInputToStorage(masked);
    if (parsed && parsed.from && parsed.to) {
      if (parsed.from !== fromRef.current || parsed.to !== toRef.current) {
        onApply(parsed.from, parsed.to);
      }
    }
  };

  const handleBlur = () => {
    commitDisplay(display);
  };

  const onRangeChange = (item: RangeKeyDict) => {
    const sel = item.selection;
    if (!sel.startDate || !sel.endDate) return;
    applyRange(sel.startDate, sel.endDate);
  };

  const handleClear = () => {
    setDisplay("");
    onApply("", "");
  };

  return (
    <>
      <Box ref={anchorRef}>
        <TextField
          {...rest}
          fullWidth
          variant="outlined"
          size={size}
          disabled={disabled}
          placeholder={emptyLabel}
          value={display}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onClick={openCalendar}
          InputLabelProps={{
            ...InputLabelProps,
            shrink: display !== "" ? true : InputLabelProps?.shrink,
          }}
          inputProps={{
            inputMode: "numeric",
            "aria-label":
              typeof rest.label === "string"
                ? rest.label
                : ((rest["aria-label"] as string | undefined) ?? "Período"),
          }}
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
              clearable && hasRange ? (
                <InputGroupAddon
                  position="end"
                  onClick={disabled ? undefined : handleClear}
                  tooltip="Limpar período"
                  ariaLabel="Limpar período"
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
          { name: "flip", enabled: false },
          { name: "preventOverflow", options: { padding: 8 } },
        ]}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) return;
            closeCalendar();
          }}
        >
          <Paper elevation={8} sx={{ overflow: "visible" }}>
            <DateRangePicker
              ranges={[rangeSelection]}
              onChange={onRangeChange}
              locale={ptBR}
              months={2}
              direction="horizontal"
              staticRanges={dateRangeStaticRanges}
              inputRanges={[]}
              rangeColors={[DATE_PICKER_ACCENT]}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
