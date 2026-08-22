import { Box, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listFichas } from "api/fichas";
import { formatFichaData, formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { MouseEvent, useMemo } from "react";
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
}: {
  row: Ficha;
  destaque?: boolean;
  editPath: (id: number) => string;
}) {
  const navigate = useNavigate();
  const tituloBase = [formatFichaData(row.criado_em), formatPadraoLabel(String(row.padrao ?? ""))]
    .filter((part) => part && part !== "—")
    .join(" · ");
  const titulo = destaque && tituloBase ? `Atual · ${tituloBase}` : tituloBase || "—";
  const prescritor = row.prescritor_nome?.trim();
  const realizadoPor = prescritor ? `Realizado por: ${prescritor}` : "Realizado por: —";

  function onOpen(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    navigate(editPath(row.id));
  }

  return (
    <Box
      onClick={onOpen}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: destaque ? "secondary.main" : "divider",
        bgcolor: destaque ? "rgba(255, 83, 86, 0.06)" : "background.paper",
        cursor: "pointer",
        "&:hover": { borderColor: "secondary.main", bgcolor: "rgba(255, 83, 86, 0.04)" },
      }}
    >
      <Stack spacing={0.25} minWidth={0}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {titulo}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {realizadoPor}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>
          {row.nome?.trim() || "—"}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function PessoaFichas({ pessoaId }: { pessoaId: number }) {
  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ["fichas", "pessoa", pessoaId],
    queryFn: () => listFichas({ id_pessoa: pessoaId }),
  });

  const rows = useMemo(() => sortFichas(fichas), [fichas]);
  const editPath = (id: number) => LINK(`/workout-plans/${id}/edit`, { pessoa: pessoaId });

  return (
    <Box>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Carregando…
        </Typography>
      ) : !rows.length ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma prescrição vinculada.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((row, index) => (
            <FichaRow key={row.id} row={row} destaque={index === 0} editPath={editPath} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
