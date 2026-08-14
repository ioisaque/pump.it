import { GridLocaleText } from "@mui/x-data-grid";

export const GRID_PT_BR_LOCALE_TEXT = {
  noRowsLabel: "Nenhum registro",
  noResultsOverlayLabel: "Nenhum resultado encontrado.",

  toolbarDensity: "Densidade",
  toolbarDensityLabel: "Densidade",
  toolbarDensityCompact: "Compacto",
  toolbarDensityStandard: "Padrão",
  toolbarDensityComfortable: "Confortável",

  toolbarColumns: "Colunas",
  toolbarColumnsLabel: "Selecionar colunas",

  toolbarFilters: "Filtros",
  toolbarFiltersLabel: "Exibir filtros",
  toolbarFiltersTooltipHide: "Ocultar filtros",
  toolbarFiltersTooltipShow: "Exibir filtros",
  toolbarFiltersTooltipActive: (count) => (count !== 1 ? `${count} filtros ativos` : `${count} filtro ativo`),

  toolbarQuickFilterPlaceholder: "Buscar…",
  toolbarQuickFilterLabel: "Buscar",
  toolbarQuickFilterDeleteIconLabel: "Limpar",

  toolbarExport: "Exportar",
  toolbarExportLabel: "Exportar",
  toolbarExportCSV: "Baixar CSV",
  toolbarExportPrint: "Imprimir",
  toolbarExportExcel: "Baixar Excel",

  filterPanelAddFilter: "Adicionar filtro",
  filterPanelDeleteIconLabel: "Excluir",
  filterPanelOperatorAnd: "E",
  filterPanelOperatorOr: "Ou",
  filterPanelColumns: "Colunas",
  filterPanelInputLabel: "Valor",
  filterPanelInputPlaceholder: "Valor do filtro",

  filterOperatorAfter: "depois de",
  filterOperatorBefore: "antes de",
  filterOperatorContains: "contém",
  filterOperatorEndsWith: "termina com",
  filterOperatorEquals: "igual a",
  filterOperatorIs: "é",
  filterOperatorIsAnyOf: "é um de",
  filterOperatorIsEmpty: "está vazio",
  filterOperatorIsNotEmpty: "não está vazio",
  filterOperatorNot: "não é",
  filterOperatorOnOrAfter: "em ou depois de",
  filterOperatorOnOrBefore: "em ou antes de",
  filterOperatorStartsWith: "começa com",
  filterPanelLinkOperator: "",
  filterPanelOperators: undefined,

  filterValueAny: "qualquer",
  filterValueTrue: "verdadeiro",
  filterValueFalse: "falso",

  columnMenuLabel: "Menu",
  columnMenuShowColumns: "Mostrar colunas",
  columnMenuFilter: "Filtrar",
  columnMenuHideColumn: "Ocultar coluna",
  columnMenuUnsort: "Limpar ordenação",
  columnMenuSortAsc: "Ordenar crescente",
  columnMenuSortDesc: "Ordenar decrescente",

  columnHeaderFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} filtros ativos` : `${count} filtro ativo`,
  columnHeaderFiltersLabel: "Mostrar filtros",
  columnHeaderSortIconLabel: "Ordenar",

  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString("pt-BR")} linhas selecionadas`
      : `${count.toLocaleString("pt-BR")} linha selecionada`,

  footerTotalRows: "Total de linhas:",

  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${visibleCount.toLocaleString("pt-BR")} de ${totalCount.toLocaleString("pt-BR")}`,

  checkboxSelectionHeaderName: "Seleção",
  checkboxSelectionSelectAllRows: "Selecionar tudo",
  checkboxSelectionUnselectAllRows: "Desmarcar tudo",
  checkboxSelectionSelectRow: "Selecionar linha",
  checkboxSelectionUnselectRow: "Desmarcar linha",

  booleanCellTrueLabel: "sim",
  booleanCellFalseLabel: "não",

  actionsCellMore: "mais",

  pinToLeft: "Fixar à esquerda",
  pinToRight: "Fixar à direita",
  unpin: "Desafixar",

  treeDataGroupingHeaderName: "Grupo",
  treeDataExpand: "ver filhos",
  treeDataCollapse: "ocultar filhos",

  groupingColumnHeaderName: "Grupo",
  groupColumn: (name) => `Agrupar por ${name}`,
  unGroupColumn: (name) => `Parar agrupamento por ${name}`,

  detailPanelToggle: "Painel de detalhes",
  expandDetailPanel: "Expandir",
  collapseDetailPanel: "Recolher",

  MuiTablePagination: {
    labelRowsPerPage: "Linhas por página",
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`,
  },

  rowReorderingHeaderName: "Reordenar linha",

  aggregationMenuItemHeader: "Agregação",
  aggregationFunctionLabelSum: "soma",
  aggregationFunctionLabelAvg: "média",
  aggregationFunctionLabelMin: "mínimo",
  aggregationFunctionLabelMax: "máximo",
  aggregationFunctionLabelSize: "quantidade",

  errorOverlayDefaultLabel: "",
} as unknown as GridLocaleText;

export default GRID_PT_BR_LOCALE_TEXT;
