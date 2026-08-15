import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { encerrarTreino, findTreino, Treino } from "api/treinos";
import AnatomiaFigure, { anatomiaGrupoFromNome, type AnatomiaGroupProp } from "components/AnatomiaFigure";
import Chip from "components/Chip";
import { formatDescanso } from "domain/fichas/formatters";
import { FichaItem } from "domain/fichas/types";
import useTenantBase from "hooks/useTenantBase";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { LINK } from "utils/link";

function isCardio(nome: string, musculos: { nome: string }[]) {
  const blob = `${nome} ${musculos.map((m) => m.nome).join(" ")}`.toLowerCase();
  return /cardio|esteira|bike|el[ií]pt|corda|skierg|remo |spinning|hiit/.test(blob);
}

function unwrapTreino(data: unknown): Treino | undefined {
  if (!data || typeof data !== "object") return undefined;
  const row = data as Treino & { treino?: Treino };
  if (typeof row.id === "number" && row.id_ficha != null) return row;
  if (row.treino && typeof row.treino.id === "number") return row.treino;
  return undefined;
}

function parseDt(v?: string | null) {
  if (!v) return NaN;
  const raw = String(v).trim();
  const iso = raw.includes("T") ? raw : raw.replace(" ", "T");
  const local = new Date(iso.length === 19 ? `${iso}` : iso);
  if (!Number.isNaN(local.getTime())) return local.getTime();
  return new Date(`${iso}Z`).getTime();
}

export default function CheckinResumo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { academiaSlug } = useTenantBase();
  const posted = useRef(false);
  const treinoId = Number(id);

  const {
    data: treinoLoaded,
    isLoading: loadingTreino,
    isError,
    error,
  } = useQuery({
    queryKey: ["treino", treinoId, academiaSlug],
    queryFn: () => findTreino(treinoId, academiaSlug ? { academia_slug: academiaSlug } : undefined),
    enabled: Number.isFinite(treinoId) && treinoId > 0,
  });

  const encerrarMutation = useMutation({
    mutationFn: () => encerrarTreino(treinoId, academiaSlug ? { academia_slug: academiaSlug } : undefined),
    onError: () => toast.error("Não foi possível encerrar o treino."),
  });

  useEffect(() => {
    if (!treinoLoaded || posted.current) return;
    if (treinoLoaded.encerrado_em) return;
    posted.current = true;
    encerrarMutation.mutate();
  }, [treinoLoaded, encerrarMutation]);

  const treino = unwrapTreino(encerrarMutation.data) ?? treinoLoaded;
  const ficha = treino?.ficha;
  const dia = String(treino?.dia || "A").toUpperCase();
  const itensDia: FichaItem[] = (ficha?.itens ?? []).filter((i) => String(i.dia).toUpperCase() === dia);

  const musculos = useMemo(() => {
    const map = new Map<number, { nome: string; color: string; icon: string }>();
    for (const item of itensDia) {
      for (const m of item.musculos ?? []) map.set(m.id, m);
    }
    return [...map.values()];
  }, [itensDia]);

  const anatomyGroups = useMemo(() => {
    const byRegion = new Map<string, AnatomiaGroupProp>();
    for (const m of musculos) {
      const rid = anatomiaGrupoFromNome(m.nome);
      if (rid && !byRegion.has(rid)) {
        byRegion.set(rid, { id: rid, text: m.nome, color: m.color, icon: m.icon });
      }
    }
    return [...byRegion.values()];
  }, [musculos]);

  const descansoSeg = itensDia.reduce((acc, i) => acc + (i.descanso_segundos || 0) * (i.series || 1), 0);
  const cardioSeg = itensDia.reduce((acc, i) => {
    if (!isCardio(i.exercicio_nome ?? "", i.musculos ?? [])) return acc;
    return acc + (i.descanso_segundos || 0) * (i.series || 1) + 60 * (i.series || 1);
  }, 0);

  const treinoMs =
    treino?.iniciado_em && treino.encerrado_em
      ? Math.max(0, parseDt(treino.encerrado_em) - parseDt(treino.iniciado_em))
      : 0;

  const errMsg =
    error && typeof error === "object" && "response" in error
      ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "")
      : "";

  const loading = loadingTreino || (!treino?.encerrado_em && encerrarMutation.isLoading);

  return (
    <Box sx={{ width: "100%", maxWidth: 480, mx: "auto", pb: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        {treinoLoaded?.encerrado_em && !encerrarMutation.isSuccess ? "Resumo do treino" : "Treino encerrado"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {ficha?.nome ?? "Plano"} · dia {dia}
        {itensDia.length ? ` · ${itensDia.length} exercícios` : ""}
      </Typography>

      {isError ? (
        <Alert severity="warning">{errMsg || "Não foi possível carregar o treino."}</Alert>
      ) : loading && !treino?.encerrado_em ? (
        <Skeleton variant="rounded" height={240} />
      ) : (
        <Stack spacing={2}>
          <AnatomiaFigure groups={anatomyGroups} />
          {musculos.length ? (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
              {musculos.map((m) => (
                <Chip key={`${m.nome}-${m.icon}`} icon={m.icon} nome={m.nome} color={m.color} />
              ))}
            </Stack>
          ) : null}
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            <Box sx={{ flex: "1 1 40%", bgcolor: "#33CC6622", borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Tempo treinado
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formatDescanso(Math.round(treinoMs / 1000))}
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 40%", bgcolor: "#FFD22B22", borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Descanso
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formatDescanso(descansoSeg)}
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 40%", bgcolor: "#0076F322", borderRadius: 2, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Cardio
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {formatDescanso(cardioSeg)}
              </Typography>
            </Box>
          </Stack>
          <Button variant="contained" color="success" onClick={() => navigate(LINK("/"))}>
            Voltar ao início
          </Button>
        </Stack>
      )}
    </Box>
  );
}
