import { InputBase, InputBaseProps, styled } from "@mui/material";
import { COMPACT_INPUT_FONT_SIZE, COMPACT_INPUT_HEIGHT_PX } from "components/form/inputConstants";
import { FC } from "react";
import Icon from "./Icon";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  height: COMPACT_INPUT_HEIGHT_PX,
  fontSize: COMPACT_INPUT_FONT_SIZE,
  width: "100%",
  maxWidth: 270,
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
  fontWeight: 500,
  padding: "0 1rem",
  borderRadius: "8px",
  border: "1px solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  color: theme.palette.info.main,
  backgroundColor: "transparent",
}));

const SearchInput: FC<InputBaseProps> = (props) => {
  return <StyledInputBase {...props} startAdornment={<Icon name="search" />} />;
};

export default SearchInput;
