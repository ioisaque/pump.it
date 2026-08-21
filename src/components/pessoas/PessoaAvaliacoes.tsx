import { Box, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAvaliacao, listAvaliacoes } from "api/avaliacoes";
import ActionIcon from "components/data-table/ActionIcon";
import TableActions from "components/data-table/TableActions";
import Icon from "components/Icon";
import { calcImc, formatAvaliacaoData } from "domain/avaliacoes/formatters";
import { Avaliacao } from "domain/avaliacoes/types";
import { MouseEvent, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;

function sortAvaliacoes(rows: Avaliacao[]): Avaliacao[] {
  return [...rows].sort((a, b) => {
    const da = a.data ?? "";
    const db = b.data ?? "";
    if (da !== db) return db.localeCompare(da);
    return (b.id ?? 0) - (a.id ?? 0);
  });
}

function AvaliacaoRow({
  row,
  destaque,
  showPath,
  editPath,
  onDelete,
}: {
  row: Avaliacao;
  destaque?: boolean;
  showPath: (id: number) => string;
  editPath: (id: number) => string;
  onDelete: (id: number) => void;
}) {
  const imc = calcImc(row.peso_kg, row.altura_cm);
  const navigate = useNavigate();

  function onOpen(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(showPath(row.id));
  }

  return (
    <Box
      onClick={onOpen}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: destaque ? "secondary.main" : "divider",
        bgcolor: destaque ? "rgba(255, 83, 86, 0.06)" : "background.paper",
        cursor: "pointer",
      }}
    >
      <Box minWidth={0} flex={1}>
        <Typography variant="body2" fontWeight={destaque ? 700 : 600}>
          {destaque ? "Atual · " : ""}
          {formatAvaliacaoData(row.data)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.peso_kg != null ? `${row.peso_kg} kg` : "Peso —"}
          {imc != null ? ` · IMC ${imc}` : ""}
        </Typography>
      </Box>
      <TableActions sx={{ minHeight: 40, width: "auto", p: 0 }}>
        <ActionIcon icon="mdi:human" color="secondary.main" to={showPath(row.id)} />
        <ActionIcon icon="line-md:edit" color="info.main" to={editPath(row.id)} />
        <ActionIcon
          icon="mdi:delete"
          color="error.main"
          to="#delete"
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Excluir esta avaliação?")) onDelete(row.id);
          }}
        />
      </TableActions>
    </Box>
  );
}

export default function PessoaAvaliacoes({ pessoaId }: { pessoaId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["avaliacoes", "pessoa", pessoaId],
    queryFn: () => listAvaliacoes({ id_pessoa: pessoaId }),
  });
  const rows = useMemo(() => sortAvaliacoes(data?.avaliacoes ?? []), [data?.avaliacoes]);
  const atual = rows[0] ?? null;
  const historico = rows.slice(1);
  const pessoaQuery = { pessoa: pessoaId };
  const showPath = (id: number) => LINK(`/avaliacoes/${id}`, pessoaQuery);
  const editPath = (id: number) => LINK(`/avaliacoes/${id}/edit`, pessoaQuery);

  const evolucao = useMemo(() => {
    const pesos = [...rows].reverse().filter((r) => r.peso_kg != null);
    if (pesos.length < 2) return null;
    return pesos.map((r) => `${r.peso_kg} kg`).join(" → ");
  }, [rows]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAvaliacao(id),
    onSuccess: async () => {
      toast.success("Avaliação excluída.");
      await queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Falha ao excluir.");
    },
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Avaliações físicas
        </Typography>
        <Button
          variant="contained"
          color="success"
          sx={BTN_140}
          startIcon={<Icon name="mdi:plus" />}
          onClick={() => navigate(LINK("/avaliacoes/add", pessoaQuery))}
        >
          Nova avaliação
        </Button>
      </Stack>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Carregando…
        </Typography>
      ) : !atual ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma avaliação ainda.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {evolucao ? (
            <Typography variant="caption" color="text.secondary">
              Evolução: {evolucao}
            </Typography>
          ) : null}
          <AvaliacaoRow
            row={atual}
            destaque
            showPath={showPath}
            editPath={editPath}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
          {historico.length > 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
              Histórico
            </Typography>
          ) : null}
          {historico.map((row) => (
            <AvaliacaoRow
              key={row.id}
              row={row}
              showPath={showPath}
              editPath={editPath}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
