import { Box, Button, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { desvincularFichaAluno, listFichas, vincularFichaAluno } from "api/fichas";
import ActionIcon from "components/data-table/ActionIcon";
import TableActions from "components/data-table/TableActions";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import { formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { MouseEvent, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

function fichaStamp(f: Ficha): string {
  return f.alterado_em || f.criado_em || "";
}

function sortFichas(rows: Ficha[]): Ficha[] {
  return [...rows].sort((a, b) => fichaStamp(b).localeCompare(fichaStamp(a)) || b.id - a.id);
}

function FichaRow({
  row,
  destaque,
  editPath,
  onUnlink,
}: {
  row: Ficha;
  destaque?: boolean;
  editPath: (id: number) => string;
  onUnlink: (row: Ficha) => void;
}) {
  const navigate = useNavigate();

  function onOpen(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest(".tableActions, a, button, [role='button']")) return;
    navigate(editPath(row.id));
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
          {row.nome}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatPadraoLabel(String(row.padrao ?? ""))}
        </Typography>
      </Box>
      <TableActions sx={{ minHeight: 40, width: "auto", p: 0 }}>
        <ActionIcon icon="line-md:edit" color="info.main" to={editPath(row.id)} />
        <ActionIcon
          icon="mdi:link-off"
          color="error.main"
          to="#unlink"
          onClick={(e) => {
            e.preventDefault();
            onUnlink(row);
          }}
        />
      </TableActions>
    </Box>
  );
}

export default function PessoaFichas({ pessoaId }: { pessoaId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modeloId, setModeloId] = useState("");

  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ["fichas", "pessoa", pessoaId],
    queryFn: () => listFichas({ id_pessoa: pessoaId }),
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["fichas", "modelos"],
    queryFn: () => listFichas({ escopo: "modelos" }),
  });

  const ordered = useMemo(() => sortFichas(fichas), [fichas]);
  const atual = ordered[0] ?? null;
  const historico = ordered.slice(1);

  const vincular = useMutation({
    mutationFn: (fichaId: number) => vincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Plano vinculado.");
      setModeloId("");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível vincular o plano."),
  });

  const desvincular = useMutation({
    mutationFn: (fichaId: number) => desvincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Plano desvinculado.");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível desvincular."),
  });

  const jaVinculados = new Set(fichas.map((f) => f.id));
  const disponiveis = modelos.filter((m) => !jaVinculados.has(m.id));
  const editPath = (id: number) => LINK(`/workout-plans/${id}/edit`, { pessoa: pessoaId });

  function unlink(row: Ficha) {
    if (window.confirm(`Desvincular plano "${row.nome}"?`)) desvincular.mutate(row.id);
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Prescrição de treino
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select
            size="small"
            displayEmpty
            value={modeloId}
            onChange={(e) => setModeloId(String(e.target.value))}
            sx={{ minWidth: 160, ...compactInputRootSx() }}
          >
            <MenuItem value="">
              <em>Escolher modelo</em>
            </MenuItem>
            {disponiveis.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                {m.nome} ({formatPadraoLabel(String(m.padrao))})
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="success"
            disabled={!modeloId || vincular.isLoading}
            onClick={() => vincular.mutate(Number(modeloId))}
          >
            Vincular
          </Button>
        </Stack>
      </Stack>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Carregando…
        </Typography>
      ) : !atual ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma prescrição vinculada.
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          <FichaRow row={atual} destaque editPath={editPath} onUnlink={unlink} />
          {historico.length > 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ pt: 1 }}>
              Histórico
            </Typography>
          ) : null}
          {historico.map((row) => (
            <FichaRow key={row.id} row={row} editPath={editPath} onUnlink={unlink} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
