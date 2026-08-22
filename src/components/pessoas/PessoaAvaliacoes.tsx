import { Box, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listAvaliacoes } from "api/avaliacoes";
import { calcImc, formatAvaliacaoData } from "domain/avaliacoes/formatters";
import { Avaliacao } from "domain/avaliacoes/types";
import { MouseEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

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
  showPath,
}: {
  row: Avaliacao;
  showPath: (id: number) => string;
}) {
  const imc = calcImc(row.peso_kg, row.altura_cm);
  const navigate = useNavigate();
  const metricas = [
    imc != null ? `IMC ${imc}` : null,
    row.peso_kg != null ? `${row.peso_kg} kg` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  function onOpen(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    navigate(showPath(row.id));
  }

  const titulo = [formatAvaliacaoData(row.data), metricas || null].filter(Boolean).join(" · ");
  const avaliador = row.avaliador_nome?.trim();
  const realizadoPor = avaliador ? `Realizado por: ${avaliador}` : "Realizado por: —";

  return (
    <Box
      onClick={onOpen}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        "&:hover": { borderColor: "secondary.main", bgcolor: "rgba(255, 83, 86, 0.04)" },
      }}
    >
      <Stack spacing={0.25} minWidth={0}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {titulo || "—"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {realizadoPor}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.25 }}>
          {row.observacoes?.trim() || "—"}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function PessoaAvaliacoes({ pessoaId }: { pessoaId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["avaliacoes", "pessoa", pessoaId],
    queryFn: () => listAvaliacoes({ id_pessoa: pessoaId }),
  });
  const rows = useMemo(() => sortAvaliacoes(data?.avaliacoes ?? []), [data?.avaliacoes]);
  const showPath = (id: number) => LINK(`/avaliacoes/${id}`, { pessoa: pessoaId });

  return (
    <Box>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Carregando…
        </Typography>
      ) : !rows.length ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma avaliação ainda.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {rows.map((row) => (
            <AvaliacaoRow key={row.id} row={row} showPath={showPath} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
