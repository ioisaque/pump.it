import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listExercicios } from "api/exercicios";
import { addTreino } from "api/treinos";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

const DIA_COLORS: Record<string, string> = {
  A: "#FF5356",
  B: "#33CC66",
  C: "#0076F3",
  D: "#FFD22B",
};

export default function CheckinDia() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;

  const { data: exercicios = [] } = useQuery({
    queryKey: EXERCICIOS_QUERY_KEY,
    queryFn: listExercicios,
    enabled: isCliente,
  });

  const {
    data: treino,
    isLoading: treinoLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["treinos", "add", user?.id],
    queryFn: () => addTreino(),
    enabled: isCliente && Boolean(user?.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const ficha = treino?.ficha;
  const dia = treino?.dia ?? "A";
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

  if (!authLoading && !isCliente) {
    return <Alert severity="info">Check-in de treino é para o aluno.</Alert>;
  }

  const loading = authLoading || treinoLoading;
  const entradaHora = treino?.iniciado_em
    ? new Date(treino.iniciado_em.replace(" ", "T")).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
  const errMsg =
    error && typeof error === "object" && "response" in error
      ? String((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? "")
      : "";

  return (
    <Box sx={{ width: "100%", maxWidth: 480, mx: "auto", pb: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Check-in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {treino ? "Entrada registrada. Confira o treino de hoje." : "Registrando entrada…"}
      </Typography>

      {loading ? (
        <Skeleton variant="rounded" height={180} />
      ) : isError || !ficha || !treino ? (
        <Alert severity="warning">
          {errMsg || "Nenhum plano de treino vinculado."}
        </Alert>
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
            startIcon={<Icon name="mdi:dumbbell" />}
            onClick={() => navigate(LINK(`/workout/${treino.id}`))}
            sx={{ height: 48 }}
          >
            Treinar agora
          </Button>
          <Button color="inherit" onClick={() => navigate(LINK("/"))} sx={{ color: "text.secondary" }}>
            Agora não
          </Button>
        </Stack>
      )}
    </Box>
  );
}
