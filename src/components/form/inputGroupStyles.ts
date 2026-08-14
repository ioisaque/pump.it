import { SxProps, Theme } from "@mui/material";
import { COMPACT_INPUT_FONT_SIZE, COMPACT_INPUT_HEIGHT_PX } from "./inputConstants";

/** Shared width for prepend/append slots (Bootstrap input-group). */
export const ADDON_WIDTH = 40;

const INPUT_INNER_PAD_X = 2;

export function compactInputRootSx(): SxProps<Theme> {
  return {
    "& .MuiInputBase-root": {
      height: COMPACT_INPUT_HEIGHT_PX,
      fontSize: COMPACT_INPUT_FONT_SIZE,
      backgroundColor: "transparent",
    },
    "& .MuiOutlinedInput-root": {
      alignItems: "center",
      backgroundColor: "transparent",
      "&:hover": { backgroundColor: "transparent" },
      "&.Mui-focused": { backgroundColor: "transparent" },
      "&.Mui-disabled": { backgroundColor: "transparent" },
    },
    "& .MuiInputBase-input": {
      paddingTop: 0,
      paddingBottom: 0,
      height: "auto",
      display: "flex",
      alignItems: "center",
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      minHeight: "unset",
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
}

export function inputGroupFieldSx(hasPrepend: boolean, hasAppend: boolean): SxProps<Theme> {

  return {
    "& .MuiOutlinedInput-root": {
      alignItems: "center",
      overflow: "hidden",
      borderRadius: "4px",
      // Keep addon flush to the outer edge; do not pad the root on that side.
      ...(hasPrepend && { paddingLeft: 0 }),
      ...(hasAppend && { paddingRight: 0 }),
    },
    "& .MuiOutlinedInput-input": {
      alignSelf: "center",
      flex: 1,
      minWidth: 0,
      ...(hasPrepend && { paddingLeft: `${INPUT_INNER_PAD_X}px` }),
      ...(hasAppend && { paddingRight: `${INPUT_INNER_PAD_X}px` }),
    },
    "& .MuiSelect-select": {
      alignSelf: "center",
      flex: 1,
      minWidth: 0,
      ...(hasPrepend && {
        paddingLeft: `${INPUT_INNER_PAD_X}px`,
      }),
      ...(hasAppend && {
        paddingRight: `${INPUT_INNER_PAD_X}px`,
      }),
    },
    "& .MuiOutlinedInput-notchedOutline": {
      ...(hasPrepend && {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }),
      ...(hasAppend && {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }),
    },
    "& .MuiInputAdornment-root": {
      height: "auto",
      maxHeight: "none",
      alignSelf: "stretch",
      margin: 0,
      padding: 0,
      display: "flex",
    },
    "& .MuiInputAdornment-positionStart": {
      marginLeft: 0,
      marginRight: 0,
    },
    "& .MuiInputAdornment-positionEnd": {
      marginLeft: 0,
      marginRight: 0,
    },
  };
}
