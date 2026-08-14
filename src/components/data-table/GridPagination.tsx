import Pagination from "@mui/material/Pagination";
import { gridPageCountSelector, gridPageSelector, useGridApiContext, useGridSelector } from "@mui/x-data-grid";
import { themeColor } from "theme";

interface props {
  color: themeColor;
}

export default function GridPagination(props: props) {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  if (pageCount <= 1) return null;

  return (
    <Pagination
      color={props.color}
      count={pageCount}
      page={page + 1}
      onChange={(_event, value) => apiRef.current.setPage(value - 1)}
    />
  );
}
