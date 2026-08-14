import { Alert, Box, Button, Card, CardContent, Skeleton } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { listPessoas } from "api/pessoas";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import GridTable, { GRID_COL_ACTIONS_ONE } from "components/data-table/GridTable";
import StatusIcon from "components/data-table/StatusIcon";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import MapDialog from "components/MapDialog";
import PessoaListCell from "components/pessoas/PessoaListCell";
import SearchInput from "components/SearchField";
import { PESSOA_LIST_TIPO, PESSOA_STATUS, PessoaListTipo } from "domain/pessoas/constants";
import { flagCode, resolveFlags } from "domain/tabelas/types";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMobileColumnVisibility } from "hooks/useMobileColumnVisibility";
import { useStatusMutation } from "hooks/useStatusMutation";
import useTenantBase from "hooks/useTenantBase";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiBaseUrl } from "services/api";
import { formatPessoaDisplay } from "utils/pessoas/masks";

const HIDE_ON_MOBILE = ["etiqueta", "visto_em"] as const;

function parseListTipo(raw: string | null): PessoaListTipo {
  if (raw === PESSOA_LIST_TIPO.ALUNO || raw === PESSOA_LIST_TIPO.ALL || raw === PESSOA_LIST_TIPO.FUNCIONARIO) {
    return raw;
  }
  return PESSOA_LIST_TIPO.FUNCIONARIO;
}

function PessoaList() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const [searchParams] = useSearchParams();
  /** Hook for sibling filter agent: `?tipo=FUNCIONARIO|ALUNO|ALL` (default FUNCIONARIO). */
  const listTipo = parseListTipo(searchParams.get("tipo"));
  const etiquetaFilter = searchParams.get("etiqueta");
  const nivelFilter = searchParams.get("nivel");

  const columnVisibilityModel = useMobileColumnVisibility(HIDE_ON_MOBILE);
  const [filter, setFilter] = useState("");
  const [location, setLocation] = useState(false);
  const [item, setItem] = useState({
    id: 0,
    nome: "Desconhecido",
    latitude: 0,
    longitude: 0,
  });

  const { isLoading, error, data, isFetching, refetch } = useQuery({
    queryKey: ["pessoas", listTipo],
    queryFn: () => listPessoas({ tipo: listTipo }),
    retry: 1,
  });
  const { niveis: niveisCatalog, etiquetas: etiquetasCatalog } = useFlagCatalogs(["niveis", "etiquetas"]);

  const toggleStatusMutation = useStatusMutation({
    savePath: "pessoas",
    queryKey: ["pessoas", listTipo],
    successMessage: ({ nextStatus, nome }) =>
      nextStatus === PESSOA_STATUS.BLOCKED ? `${nome} bloqueado!` : `${nome} desbloqueado!`,
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Código",
        width: 100,
        renderCell: (params) => {
          const { etiqueta: etiquetaMeta, nivel: nivelMeta } = resolveFlags(
            params.row,
            ["etiqueta", "nivel"],
            [etiquetasCatalog, niveisCatalog],
          );
          return (
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 5,
                  lineHeight: 1,
                }}
              >
                <Icon name={etiquetaMeta?.icon ?? "help"} color={etiquetaMeta?.color} />
                {params.value?.toString().padStart(5, "0")}
              </span>
              <Chip {...(nivelMeta ?? {})} />
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Acesso",
        renderCell: (params) => (
          <StatusIcon
            variant="door"
            status={flagCode(params.row.status) ?? PESSOA_STATUS.ACTIVE}
            pausedCode={PESSOA_STATUS.BLOCKED}
            id={params.row.id}
            nome={params.row.nome}
            onToggle={toggleStatusMutation.mutate}
          />
        ),
      },
      {
        field: "nome",
        headerName: "Nome",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <PessoaListCell
            nome={params.row.nome}
            cpf_cnpj={params.row.cpf_cnpj}
            email={params.row.email}
            contato={params.row.contato}
          />
        ),
      },
      {
        field: "etiqueta",
        headerName: "Etiqueta",
        width: 150,
        renderCell: (params) => {
          const { etiqueta: meta } = resolveFlags(params.row, ["etiqueta"], [etiquetasCatalog]);
          return meta ? <Chip {...meta} /> : null;
        },
      },
      {
        field: "visto_em",
        headerName: "Status",
        width: 120,
        renderCell: () => (
          <Chip icon="line-md:close-circle" text="Offline" color="neutral.dark" />
        ),
      },
      {
        field: "actions",
        headerName: "Ações",
        ...GRID_COL_ACTIONS_ONE,
        renderCell: (params) => (
          <TableActions>
            <ActionIcon
              icon="majesticons:map-simple-marker"
              color="success.dark"
              to="#location"
              onClick={() => {
                setItem({
                  id: params.row.id,
                  nome: params.row.nome,
                  latitude: Number(params.row.latitude) || 0,
                  longitude: Number(params.row.longitude) || 0,
                });
                setLocation(true);
              }}
            />
          </TableActions>
        ),
      },
    ],
    [etiquetasCatalog, niveisCatalog, toggleStatusMutation.mutate],
  );

  const loadError = error as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  } | null;
  const allRows = !loadError && data?.pessoas ? data.pessoas : [];

  const filteredRows = useMemo(() => {
    let rows = allRows;

    if (etiquetaFilter) {
      const eid = Number(etiquetaFilter);
      if (Number.isFinite(eid)) {
        rows = rows.filter((p) => Number(p.etiqueta) === eid);
      }
    }
    if (nivelFilter) {
      const nid = Number(nivelFilter);
      if (Number.isFinite(nid)) {
        rows = rows.filter((p) => Number(p.nivel) === nid);
      }
    }

    const q = filter.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((pessoa) => {
      const { etiqueta: etiquetaMeta, nivel: nivelMeta } = resolveFlags(
        pessoa,
        ["etiqueta", "nivel"],
        [etiquetasCatalog, niveisCatalog],
      );
      const cpf = pessoa.cpf_cnpj ? String(formatPessoaDisplay("cpf_cnpj", pessoa.cpf_cnpj)) : "";
      const contatoFmt = pessoa.contato ? String(formatPessoaDisplay("contato", pessoa.contato)) : "";

      const haystack = [
        pessoa.id,
        String(pessoa.id).padStart(5, "0"),
        pessoa.nome,
        pessoa.email,
        pessoa.contato,
        contatoFmt,
        cpf,
        pessoa.cidade,
        pessoa.bairro,
        etiquetaMeta?.nome,
        nivelMeta?.nome,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [allRows, filter, etiquetasCatalog, niveisCatalog, etiquetaFilter, nivelFilter]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loadError && (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        >
          {loadError?.response?.status === 403
            ? "Sem permissão para listar pessoas desta academia."
            : loadError?.response?.data?.message
              ? loadError.response.data.message
              : `Não foi possível carregar a lista. Verifique se a API está rodando (${apiBaseUrl()}).`}
        </Alert>
      )}
      <MapDialog id="location" center={item} marker={item} isOpen={location} onCancel={() => setLocation(false)} />

      <Card sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <CardContent
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            pt: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <EntityHeader
              left={
                <SearchInput placeholder="Filtrar lista..." value={filter} onChange={(e) => setFilter(e.target.value)} />
              }
              right={
                <Button
                  onClick={() => navigate(`${base}/pessoas/add`)}
                  variant="contained"
                  color="success"
                  sx={{ width: 140, height: 40 }}
                  startIcon={<Icon name="mdi:plus" />}
                >
                  Adicionar
                </Button>
              }
            />
          </Box>

          {isLoading ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={`skeleton-${i}`} variant="rounded" width="100%" height={50} sx={{ margin: "10px 0px" }} />
              ))}
            </Box>
          ) : (
            <GridTable
              autoHeightFill
              color="secondary"
              columns={columns}
              loading={isFetching}
              rows={filteredRows}
              columnVisibilityModel={columnVisibilityModel}
              onRowClick={(params, event) => {
                const target = event.target as HTMLElement;
                if (target.closest(".tableActions, a, button, [role='button']")) return;
                navigate(`${base}/pessoas/${params.row.id}/edit`);
              }}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default PessoaList;
