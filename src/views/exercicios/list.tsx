import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, TablePagination, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listExercicios } from "api/exercicios";
import Chip from "components/Chip";
import StatusIcon from "components/data-table/StatusIcon";
import ExercicioPreviewDialog from "components/exercicios/modals/ExercicioPreviewDialog";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import SearchInput from "components/SearchField";
import { EXERCICIO_STATUS, EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { Exercicio } from "domain/exercicios/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useStatusMutation } from "hooks/useStatusMutation";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "services/api";
import { LINK } from "utils/link";

const PAGE_SIZE = 50;

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function capaSrc(capa?: { tipo: string; caminho: string } | null): string {
  if (!capa?.caminho) return "";
  if (capa.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(capa.caminho);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  }
  return resolveUploadUrl(capa.caminho);
}

function ExercicioCard({
  row,
  canEdit,
  showHoverTip,
  onOpen,
  onToggle,
}: {
  row: Exercicio;
  canEdit: boolean;
  showHoverTip: boolean;
  onOpen: (id: number) => void;
  onToggle: (vars: { id: number; nextStatus: string | number; nome: string }) => void;
}) {
  const src = capaSrc(row.capa);

  function onCardClick(e: MouseEvent) {
    if (canEdit) {
      const target = e.target as HTMLElement;
      if (target.closest(".tableActions, a, button, [role='button']")) return;
    }
    onOpen(row.id);
  }

  const muscleChips =
    (row.musculos ?? []).length > 0 ? (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
        {(row.musculos ?? []).map((m) => {
          const chip = (
            <Box component="span" sx={{ display: "inline-flex" }}>
              <Chip icon={m.icon} color={m.color} fontSize="90%" />
            </Box>
          );
          if (!showHoverTip) return <Box key={m.id} component="span">{chip}</Box>;
          return (
            <Tooltip key={m.id} title={m.nome} placement="top">
              {chip}
            </Tooltip>
          );
        })}
      </Stack>
    ) : null;

  const card = (
    <Box onClick={onCardClick} sx={{ cursor: "pointer", minWidth: 0 }}>
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {src ? (
          <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Icon name="mdi:dumbbell" width={64} height={64} />
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.75, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
      >
        {String(row.id).padStart(4, "0")}
      </Typography>
      <Stack direction="row" alignItems="stretch" spacing={0.75} sx={{ mt: 0.5 }}>
        {canEdit ? (
          <Box
            sx={{
              flexShrink: 0,
              alignSelf: "stretch",
              display: "flex",
              "& .tableActions": { minHeight: 0, height: "100%", width: "auto", p: 0 },
              "& button": { height: "100%", p: 0 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <StatusIcon
              status={row.status || EXERCICIO_STATUS.ACTIVE}
              pausedCode={EXERCICIO_STATUS.INACTIVE}
              id={row.id}
              nome={row.nome}
              onToggle={onToggle}
              size={52}
            />
          </Box>
        ) : null}
        <Box minWidth={0} flex={1}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {row.nome}
          </Typography>
          {muscleChips}
        </Box>
      </Stack>
    </Box>
  );

  if (!showHoverTip) return card;

  const descricao = row.descricao?.trim();
  return (
    <Tooltip
      placement="top"
      enterDelay={400}
      title={
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {row.nome}
          </Typography>
          {descricao ? (
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
              {descricao}
            </Typography>
          ) : null}
        </Box>
      }
    >
      {card}
    </Tooltip>
  );
}

export default function ExerciciosList() {
  const { user } = useAuth();
  const theme = useTheme();
  const showHoverTip = useMediaQuery(theme.breakpoints.up("sm"));
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const canEdit = !isCliente;
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(0);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: EXERCICIOS_QUERY_KEY,
    queryFn: listExercicios,
    retry: 1,
  });

  const toggleStatusMutation = useStatusMutation({
    savePath: "exercicios",
    queryKey: EXERCICIOS_QUERY_KEY,
  });

  const rows = useMemo(() => {
    const source = isCliente ? data.filter((row) => row.status === EXERCICIO_STATUS.ACTIVE) : data;
    const q = filter.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
      (row) =>
        (row.nome ?? "").toLowerCase().includes(q) ||
        (row.descricao ?? "").toLowerCase().includes(q) ||
        (row.musculos ?? []).some((m) => (m.nome ?? "").toLowerCase().includes(q)) ||
        String(row.id).padStart(4, "0").includes(q) ||
        String(row.status ?? "").toLowerCase().includes(q),
    );
  }, [data, filter, isCliente]);

  useEffect(() => {
    setPage(0);
  }, [filter, isCliente]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  const loadError = error as { message?: string } | null;

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex", flexDirection: "column" }}>
      {loadError ? (
        <Alert
          severity="error"
          sx={{ mb: 2, flexShrink: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        >
          Não foi possível carregar a lista. Verifique se a API está rodando ({apiBaseUrl()}).
        </Alert>
      ) : null}

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
                canEdit ? (
                  <Button
                    onClick={() => navigate(LINK("/exercicios/add"))}
                    variant="contained"
                    color="success"
                    sx={{ width: 140, height: 40 }}
                    startIcon={<Icon name="mdi:plus" />}
                  >
                    Adicionar
                  </Button>
                ) : undefined
              }
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                  <Box key={`skeleton-${i}`}>
                    <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "1 / 1" }} />
                    <Skeleton variant="text" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ))
              : pagedRows.map((row) => (
                  <ExercicioCard
                    key={row.id}
                    row={row}
                    canEdit={canEdit}
                    showHoverTip={showHoverTip}
                    onOpen={(id) => (canEdit ? navigate(LINK(`/exercicios/${id}`)) : setPreviewId(id))}
                    onToggle={toggleStatusMutation.mutate}
                  />
                ))}
          </Box>
          {!isLoading && rows.length > 0 ? (
            <TablePagination
              component="div"
              count={rows.length}
              page={safePage}
              onPageChange={(_e, next) => setPage(next)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              sx={{ flexShrink: 0, overflow: "hidden" }}
            />
          ) : null}
        </CardContent>
      </Card>

      <ExercicioPreviewDialog
        exercicioId={previewId}
        open={previewId != null}
        onClose={() => setPreviewId(null)}
      />
    </Box>
  );
}
