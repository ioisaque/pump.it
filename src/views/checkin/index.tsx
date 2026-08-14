import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAcesso, listAcessos } from "api/acessos";
import { listExercicios } from "api/exercicios";
import { listFichas } from "api/fichas";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { Acesso } from "domain/acessos/types";
import { EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { fichasQueryKey } from "domain/fichas/constants";
import { diasFromPadrao } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DIA_COLORS: Record<string, string> = {
  A: "#FF5356",
  B: "#33CC66",
  C: "#0076F3",
  D: "#FFD22B",
};

function diaFromOrigem(origem?: string | null): string | null {
  const m = String(origem || "").match(/^app:([A-D])$/i);
  return m ? m[1].toUpperCase() : null;
}

function nextDia(padrao: string, last?: string | null) {
  const dias = diasFromPadrao(padrao);
  if (!dias.length) return "A";
  if (!last) return dias[0];
  const i = dias.indexOf(last);
  if (i < 0) return dias[0];
  return dias[(i + 1) % dias.length];
}

function sortedAcessos(list: Acesso[]) {
  return [...list].sort((a, b) => new Date(a.registrado_em).getTime() - new Date(b.registrado_em).getTime());
}

export default function CheckinDia() {
  const navigate = useNavigate();
  const { base, academiaSlug } = useTenantBase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const posted = useRef(false);
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;

  const { data: fichas = [], isLoading: loadingFichas } = useQuery({
    queryKey: [...fichasQueryKey, "aluno"],
    queryFn: () => listFichas(),
  });

  const { data: acessosData, isLoading: loadingAcessos } = useQuery({
    queryKey: ["acessos", "self"],
    queryFn: () => listAcessos({ academia_slug: academiaSlug, id_pessoa: user?.id }),
    enabled: Boolean(user?.id),
  });

  const { data: exercicios = [] } = useQuery({
    queryKey: EXERCICIOS_QUERY_KEY,
    queryFn: listExercicios,
  });

  const ficha: Ficha | undefined = fichas[0];
  const acessos = acessosData?.acessos ?? [];
  const ordered = useMemo(() => sortedAcessos(acessos), [acessos]);
  const last = ordered[ordered.length - 1];
  const openEntrada = last?.tipo === "ENTRADA" ? last : null;
  const lastSaida = [...ordered].reverse().find((a) => a.tipo === "SAIDA");
  const dia = openEntrada
    ? diaFromOrigem(openEntrada.origem) || "A"
    : ficha
      ? nextDia(String(ficha.padrao), diaFromOrigem(lastSaida?.origem))
      : "A";
  const itensDia = (ficha?.itens ?? []).filter((i) => String(i.dia).toUpperCase() === dia);
  const musculos = useMemo(() => {
    const map = new Map<number, { nome: string; color: string; icon: string }>();
    for (const item of itensDia) {
      const ex = exercicios.find((e) => e.id === item.id_exercicio);
      for (const m of ex?.musculos ?? []) {
        map.set(m.id, { nome: m.nome, color: m.color, icon: m.icon });
      }
    }
    return [...map.values()];
  }, [itensDia, exercicios]);

  const entradaMutation = useMutation({
    mutationFn: () =>
      addAcesso({
        id_pessoa: user!.id,
        tipo: "ENTRADA",
        origem: `app:${dia}`,
        academia_slug: academiaSlug,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["acessos"] });
    },
    onError: () => toast.error("Não foi possível registrar a entrada."),
  });

  useEffect(() => {
    if (!isCliente || !user?.id || !ficha || posted.current) return;
    if (loadingAcessos || loadingFichas) return;
    if (openEntrada) return;
    posted.current = true;
    entradaMutation.mutate();
  }, [isCliente, user?.id, ficha, loadingAcessos, loadingFichas, openEntrada, entradaMutation]);

  if (!isCliente) {
    return <Alert severity="info">Check-in de treino é para o aluno.</Alert>;
  }

  const loading = loadingFichas || loadingAcessos || entradaMutation.isLoading;
  const entradaHora = openEntrada?.registrado_em
    ? new Date(openEntrada.registrado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <Box sx={{ width: "100%", maxWidth: 480, mx: "auto", pb: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Check-in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Entrada registrada. Confira o treino de hoje.
      </Typography>

      {loading && !ficha ? (
        <Skeleton variant="rounded" height={180} />
      ) : !ficha ? (
        <Alert severity="warning">Nenhuma ficha vinculada.</Alert>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                minWidth: 44,
                height: 44,
                borderRadius: 1,
                bgcolor: DIA_COLORS[dia] ?? "secondary.main",
                color: dia === "D" ? "#333" : "#fff",
                fontWeight: 800,
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {dia}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="secondary.main">
                {ficha.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Entrada {entradaHora} · {itensDia.length} exercícios
              </Typography>
            </Box>
          </Stack>

          {musculos.length ? (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
              {musculos.map((m) => (
                <Chip key={m.nome} icon={m.icon} nome={m.nome} color={m.color} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Sem músculos cadastrados neste dia.
            </Typography>
          )}

          <Button
            variant="contained"
            color="success"
            disabled={!openEntrada && !entradaMutation.isSuccess}
            startIcon={<Icon name="mdi:dumbbell" />}
            onClick={() => navigate(`${base}/fichas/${ficha.id}/treino?dia=${dia}&sessao=1`)}
            sx={{ height: 48 }}
          >
            Treinar agora
          </Button>
          <Button color="inherit" onClick={() => navigate(base || "/")} sx={{ color: "text.secondary" }}>
            Agora não
          </Button>
        </Stack>
      )}
    </Box>
  );
}
