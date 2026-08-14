import { Box, LinearProgress, styled, SxProps, Theme } from "@mui/material";
import {
    DataGrid,
    DataGridProps,
    GridColDef,
    GridPaginationModel,
    GridRowClassNameParams,
} from "@mui/x-data-grid";
import stripesBackground from "assets/imgs/stripes-background.png";
import { COMPACT_INPUT_HEIGHT_PX } from "components/form/inputConstants";
import { Flag, flagCode, isFlag } from "domain/tabelas/types";
import GRID_PT_BR_LOCALE_TEXT from "lang/DateGrid";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { themeColor } from "theme";
import GridPagination from "./GridPagination";
import NoRowsOverlay from "./NoRowsOverlay";

export const ROW_WITH_STRIPES = "id_unactive_item";

/** Lifecycle codes that get the yellow stripe (paused / blocked — not expired). */
const LIFECYCLE_INACTIVE = new Set([
  "BLOCKED",
  "SUSPENDED",
  "DELETED",
  "CANCELLED",
]);

/**
 * Yellow striped row when `status` is inactive (pause/block/etc.).
 * Skips workflow statuses (fatura PENDING/PAID, etc.) and EXPIRED.
 */
export function inactiveGridRowClassName(row: unknown): string {
  if (!row || typeof row !== "object") return "";
  const status = (row as { status?: unknown }).status;
  if (status == null || status === "") return "";

  if (isFlag(status) || (typeof status === "object" && status !== null && "id" in status)) {
    const code = flagCode(status as Flag);
    if (!code || code === "ACTIVE" || code === "EXPIRED") return "";
    return ROW_WITH_STRIPES;
  }

  if (typeof status === "number") {
    return status !== 1 ? ROW_WITH_STRIPES : "";
  }

  if (typeof status === "string") {
    if (/^\d+$/.test(status)) return Number(status) !== 1 ? ROW_WITH_STRIPES : "";
    if (status === "ACTIVE" || status === "EXPIRED") return "";
    if (LIFECYCLE_INACTIVE.has(status)) return ROW_WITH_STRIPES;
  }

  return "";
}

export const GRID_CELL_AVATAR_PX = 40;
export const GRID_ROW_MIN_HEIGHT_PX = 40;
export const GRID_INPUT_HEIGHT_PX = COMPACT_INPUT_HEIGHT_PX;
export const GRID_HEADER_HEIGHT_PX = 56;
export const GRID_FOOTER_HEIGHT_PX = 52;
export const GRID_ROW_GAP_PX = 4;
export const GRID_DEFAULT_PAGE_SIZE = 10;

/** Fixed width — fits play/pause toggle + "Status" header. */
export const GRID_COL_STATUS = {
  width: 68,
  minWidth: 68,
  maxWidth: 68,
  flex: 0,
  align: "center" as const,
  headerAlign: "center" as const,
  sortable: false,
  disableColumnMenu: true,
  resizable: false,
};

/** Grows to fill remaining grid width. */
export const GRID_COL_ROTULO = {
  flex: 1,
  minWidth: 96,
};

/** Fixed width — slightly wider than Cor, fits typical iconify ids. */
export const GRID_COL_ICONE = {
  width: 200,
  minWidth: 200,
  maxWidth: 200,
  flex: 0,
  resizable: false,
};

/** Fixed width — IconPicker avatar; fits header “Ícone”. */
export const GRID_COL_ICONE_PICKER = {
  width: 80,
  minWidth: 80,
  maxWidth: 80,
  flex: 0,
  align: "center" as const,
  headerAlign: "center" as const,
  sortable: false,
  disableColumnMenu: true,
  resizable: false,
};

/** Fixed width — color swatch only. */
export const GRID_COL_COR = {
  width: 52,
  minWidth: 52,
  maxWidth: 52,
  flex: 0,
  align: "center" as const,
  headerAlign: "center" as const,
  resizable: false,
};

/** Fixed width — one action icon. */
export const GRID_COL_ACTIONS_ONE = {
  width: 60,
  minWidth: 60,
  maxWidth: 60,
  flex: 0,
  resizable: false,
};

/** Fixed width — save + delete icons. */
export const GRID_COL_ACTIONS_TWO = {
  width: 88,
  minWidth: 88,
  maxWidth: 88,
  flex: 0,
  resizable: false,
};

function calcFillPageSize(containerHeight: number): number {
  const bodyHeight = containerHeight - GRID_HEADER_HEIGHT_PX - GRID_FOOTER_HEIGHT_PX;
  const rowSlot = GRID_ROW_MIN_HEIGHT_PX + GRID_ROW_GAP_PX;
  return Math.max(1, Math.floor(bodyHeight / rowSlot));
}

const Table = styled(DataGrid, {
  shouldForwardProp: (prop) => prop !== "newRowId",
})<{ newRowId?: string }>(({ newRowId }) => ({
  "--grid-cell-py": "2px",
  "--grid-avatar-size": `${GRID_CELL_AVATAR_PX}px`,
  "--grid-row-min-height": `${GRID_ROW_MIN_HEIGHT_PX}px`,
  "--grid-input-height": `${GRID_INPUT_HEIGHT_PX}px`,
  "--grid-input-py": "2px",
  "--grid-input-px": "8px",
  "--grid-input-font-size": "0.8125rem",
  "--grid-row-gap": `${GRID_ROW_GAP_PX}px`,
  height: "100%",
  minHeight: 0,
  width: "100%",
  border: "none",
  ".MuiDataGrid-columnHeaderTitle": {
    fontSize: "90%",
    fontWeight: 600,
    color: "inherit",
  },
  ".MuiDataGrid-columnHeader[data-field='status'] .MuiDataGrid-columnHeaderTitleContainer, .MuiDataGrid-columnHeader[data-field='id'] .MuiDataGrid-columnHeaderTitleContainer":
    {
      justifyContent: "center",
    },
  ".MuiDataGrid-columnHeader[data-field='status'] .MuiDataGrid-columnHeaderTitle, .MuiDataGrid-columnHeader[data-field='id'] .MuiDataGrid-columnHeaderTitle":
    {
      textAlign: "center",
      overflow: "visible",
      textOverflow: "clip",
    },
  ".MuiDataGrid-cell[data-field='id']": {
    justifyContent: "center",
  },
  ".MuiDataGrid-cell[data-field='id'] .MuiDataGrid-cellContent": {
    justifyContent: "center",
  },
  ".MuiDataGrid-columnSeparator": {
    display: "none",
  },
  ".MuiDataGrid-row": {
    cursor: "pointer",
    padding: "0 10px var(--grid-row-gap)",
    marginBottom: 0,
    borderRadius: 4,
    boxSizing: "border-box",
    minHeight: "calc(var(--grid-row-min-height) + var(--grid-row-gap))",
  },
  ".MuiDataGrid-row:nth-of-type(odd)": {
    backgroundColor: "#fff",
  },
  ".MuiDataGrid-row:nth-of-type(even)": {
    backgroundColor: "#f5f5f5",
  },
  ".MuiDataGrid-row:nth-of-type(odd):hover, .MuiDataGrid-row:nth-of-type(odd).Mui-hovered": {
    backgroundColor: "#fff",
  },
  ".MuiDataGrid-row:nth-of-type(even):hover, .MuiDataGrid-row:nth-of-type(even).Mui-hovered": {
    backgroundColor: "#f5f5f5",
  },
  ...(newRowId
    ? {
        [`& .MuiDataGrid-row[data-id="${newRowId}"]`]: {
          backgroundColor: "#e8f5e9",
          "&:hover, &.Mui-hovered": {
            backgroundColor: "#e8f5e9",
          },
        },
      }
    : {}),
  [`& .MuiDataGrid-row.${ROW_WITH_STRIPES}`]: {
    backgroundColor: "#FFDC6C",
    backgroundImage: `url(${stripesBackground})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    "&:hover, &.Mui-hovered": {
      backgroundImage: `url(${stripesBackground})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    },
  },
  ".MuiDataGrid-columnHeader": {
    display: "flex",
    alignItems: "center",
    color: "inherit",
  },
  ".MuiDataGrid-cell": {
    border: "none",
    outline: "none",
    display: "flex",
    alignItems: "center",
  },
  ".MuiDataGrid-cellContent": {
    display: "flex",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    minHeight: "100%",
  },
  ".MuiDataGrid-cell .MuiDataGrid-cellContent > *": {
    alignSelf: "center",
  },
  ".MuiDataGrid-cell .MuiFormControl-root, .MuiDataGrid-cell .MuiTextField-root": {
    margin: 0,
    width: "100%",
  },
  ".MuiDataGrid-cell .MuiInputBase-root": {
    fontSize: "var(--grid-input-font-size)",
  },
  ".MuiDataGrid-cell .MuiOutlinedInput-root": {
    minHeight: "var(--grid-input-height)",
  },
  ".MuiDataGrid-cell .MuiOutlinedInput-input": {
    padding: "var(--grid-input-py) var(--grid-input-px)",
    height: "auto",
    minHeight: 0,
    boxSizing: "border-box",
  },
  ".MuiDataGrid-cell .MuiSelect-select.MuiSelect-outlined": {
    padding: "var(--grid-input-py) var(--grid-input-px)",
    minHeight: "var(--grid-input-height)",
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
  },
  ".MuiDataGrid-cell .MuiInputBase-root.MuiInputBase-multiline": {
    height: "auto",
    minHeight: "var(--grid-input-height)",
  },
  ".MuiDataGrid-toolbarContainer .MuiInputBase-root": {
    fontSize: "var(--grid-input-font-size)",
  },
  ".MuiDataGrid-toolbarContainer .MuiOutlinedInput-root": {
    minHeight: "var(--grid-input-height)",
  },
  ".MuiDataGrid-toolbarContainer .MuiOutlinedInput-input": {
    padding: "var(--grid-input-py) var(--grid-input-px)",
  },
  ".MuiDataGrid-cell .tableActions": {
    cursor: "default",
    padding: "0 4px",
    gap: "4px",
    alignItems: "center",
  },
  ".MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell": {
    alignItems: "center",
    paddingTop: "var(--grid-cell-py)",
    paddingBottom: "var(--grid-cell-py)",
    lineHeight: 1.35,
  },
  ".MuiDataGrid-row--dynamicHeight .MuiDataGrid-cellContent": {
    overflow: "visible",
    whiteSpace: "normal",
    textOverflow: "unset",
    lineHeight: "inherit",
  },
  ".MuiDataGrid-cell .MuiAvatar-root": {
    width: "var(--grid-avatar-size)",
    height: "var(--grid-avatar-size)",
    flexShrink: 0,
  },
  ".MuiDataGrid-cell .tableActions svg": {
    width: "27px",
    height: "27px",
  },
  ".MuiDataGrid-cell .tableActions [data-grid-icon-size] svg": {
    width: "var(--grid-icon-px)",
    height: "var(--grid-icon-px)",
  },
  ".MuiDataGrid-cell .tableActions a, .MuiDataGrid-cell .tableActions button:not(.MuiButton-root)": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    flex: "0 0 auto",
    minWidth: 0,
    minHeight: "100%",
    height: "100%",
    padding: "0 2px",
    borderRadius: 4,
  },
  ".MuiDataGrid-cell .tableActions .MuiButton-root": {
    alignSelf: "center",
    height: "auto",
    minHeight: 0,
    flex: "0 0 auto",
  },
  ".MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within, .MuiDataGrid-cell:focus, .MuiDataGrid-cell:focus-within":
    {
      border: "none",
      outline: "none",
    },
  ".MuiDataGrid-footerContainer:not(:has(.MuiPagination-root))": {
    display: "none",
  },
  "&.MuiDataGrid-autoHeight": {
    overflow: "visible",
    "& .MuiDataGrid-main": {
      overflowX: "auto",
      overflowY: "visible",
    },
    "& .MuiDataGrid-virtualScroller": {
      overflow: "visible",
    },
    "& .MuiDataGrid-filler": {
      display: "none",
    },
  },
}));

export type GridTableProps = Omit<DataGridProps, "autoHeight"> & {
  /** When set, styles the row with this id as a draft/new row (green background). */
  newRowId?: string;
  /** MUI palette key for pagination and checkbox (`primary`, `secondary`, …). */
  color?: themeColor;
  /**
   * Accent for headers and cell text — any theme color path, e.g. `primary.main`.
   * Defaults to `${color}.main`.
   */
  accentColor?: string;
  /**
   * Fills remaining page height but only as tall as row content (may leave empty space below).
   * Mutually exclusive with `autoHeightFill`.
   */
  autoHeight?: boolean;
  /**
   * Fills remaining page height; page size fits visible rows (no scroll inside the grid).
   * Default mode (neither flag): content height, page scrolls when taller than viewport.
   */
  autoHeightFill?: boolean;
  /**
   * Apply yellow stripes to inactive rows (`status` ≠ ACTIVE / ≠ 1).
   * Disable for grids where `status` is a workflow (faturas, notificações, etc.).
   */
  stripeInactiveRows?: boolean;
};

const gridDefaultSx: SxProps<Theme> = {
  "& .MuiDataGrid-row": { cursor: "pointer" },
  "& .MuiDataGrid-cell .tableActions": { cursor: "default" },
};

function gridAccentSx(accent: string): SxProps<Theme> {
  return {
    color: accent,
    "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle": {
      color: accent,
    },
    "& .MuiDataGrid-cell": {
      color: accent,
    },
  };
}

function gridHeightSx(autoHeightFill: boolean, autoHeight: boolean, isDefault: boolean): SxProps<Theme> {
  if (autoHeightFill) {
    return {
      height: "100%",
      flex: 1,
      minHeight: 0,
      // Vertical fill still pages rows; allow horizontal scroll for wide columns on mobile.
      "& .MuiDataGrid-main": {
        overflowX: "auto",
      },
      "& .MuiDataGrid-virtualScroller": {
        overflowX: "auto",
        overflowY: "hidden",
      },
    };
  }

  if (isDefault || autoHeight) {
    return {
      height: "auto !important",
      overflow: "visible",
      ...(autoHeight ? { flex: "0 0 auto", alignSelf: "stretch" } : {}),
    };
  }

  return {};
}

function GridTable({
  color = "secondary",
  accentColor,
  autoHeight = false,
  autoHeightFill = false,
  stripeInactiveRows = true,
  newRowId,
  columns,
  rows,
  loading,
  sx,
  paginationModel: paginationModelProp,
  onPaginationModelChange: onPaginationModelChangeProp,
  initialState,
  getRowClassName,
  ...rest
}: GridTableProps) {
  const accent = accentColor ?? `${color}.main`;
  const isDefault = !autoHeight && !autoHeightFill;
  const expandToContent = isDefault || autoHeight;
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedGetRowClassName = useMemo(() => {
    if (!stripeInactiveRows && !getRowClassName) return undefined;
    return (params: GridRowClassNameParams) => {
      const inactive = stripeInactiveRows ? inactiveGridRowClassName(params.row) : "";
      const custom = getRowClassName?.(params) ?? "";
      return [inactive, custom].filter(Boolean).join(" ");
    };
  }, [stripeInactiveRows, getRowClassName]);
  const [fillPageSize, setFillPageSize] = useState(GRID_DEFAULT_PAGE_SIZE);
  const [fillPaginationModel, setFillPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: GRID_DEFAULT_PAGE_SIZE,
  });
  const rowCount = rows?.length ?? 0;

  useLayoutEffect(() => {
    if (!autoHeightFill) return;
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const height = el.clientHeight;
      if (height <= 0) return;
      const next = calcFillPageSize(height);
      setFillPageSize((prev) => (prev === next ? prev : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoHeightFill]);

  useEffect(() => {
    if (!autoHeightFill) return;
    setFillPaginationModel((prev) => {
      const maxPage = Math.max(0, Math.ceil(rowCount / fillPageSize) - 1);
      return {
        page: Math.min(prev.page, maxPage),
        pageSize: fillPageSize,
      };
    });
  }, [autoHeightFill, fillPageSize, rowCount]);

  const gridColumns = useMemo(
    () =>
      columns?.map((col) => {
        if (col.field !== "actions") return col;
        const width = col.width ?? 88;
        return {
          ...col,
          headerName: col.headerName?.trim() ? col.headerName : "Ações",
          width,
          minWidth: col.minWidth ?? width,
          maxWidth: col.maxWidth ?? width,
          flex: 0,
          resizable: false,
          sortable: col.sortable ?? false,
          align: col.align ?? ("left" as const),
          cellClassName: col.cellClassName ?? "no-print tableActions",
          headerClassName: col.headerClassName ?? "no-print",
        } as GridColDef;
      }),
    [columns],
  );

  const wrapperSx: SxProps<Theme> =
    autoHeightFill || autoHeight
      ? { flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }
      : { width: "100%" };

  const heightSx = gridHeightSx(autoHeightFill, autoHeight, isDefault);
  const paginationModel = autoHeightFill ? fillPaginationModel : paginationModelProp;
  const onPaginationModelChange = autoHeightFill ? setFillPaginationModel : onPaginationModelChangeProp;
  const pageSizeOptions = autoHeightFill ? [fillPageSize] : [GRID_DEFAULT_PAGE_SIZE];

  return (
    <Box ref={containerRef} sx={wrapperSx}>
      <Table
        newRowId={newRowId}
        columns={gridColumns}
        rows={rows}
        autoHeight={expandToContent}
        disableColumnResize
        getRowHeight={() => "auto"}
        disableRowSelectionOnClick
        checkboxSelection={false}
        onCellKeyDown={(_params, event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("input, textarea, [contenteditable='true']")) {
            event.defaultMuiPrevented = true;
          }
        }}
        initialState={{
          ...initialState,
          pagination: {
            ...initialState?.pagination,
            paginationModel: {
              pageSize: GRID_DEFAULT_PAGE_SIZE,
              ...initialState?.pagination?.paginationModel,
            },
          },
        }}
        {...(autoHeightFill
          ? { paginationModel, onPaginationModelChange }
          : paginationModelProp != null
            ? { paginationModel: paginationModelProp, onPaginationModelChange: onPaginationModelChangeProp }
            : {})}
        pageSizeOptions={pageSizeOptions}
        localeText={GRID_PT_BR_LOCALE_TEXT}
        loading={loading}
        slots={{
          loadingOverlay: () => <LinearProgress />,
          noRowsOverlay: NoRowsOverlay,
          pagination: () => <GridPagination color={color} />,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={[
          gridDefaultSx,
          gridAccentSx(accent),
          heightSx,
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        getRowClassName={resolvedGetRowClassName}
        {...rest}
      />
    </Box>
  );
}

export default GridTable;
