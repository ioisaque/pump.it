import { Alert, Box, Button, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAcesso, listAcessos } from "api/acessos";
import { listExercicios } from "api/exercicios";
import { listFichas } from "api/fichas";
import anatomiaCostas from "assets/imgs/anatomia-costas.webp";
import anatomiaFrente from "assets/imgs/anatomia-frente.webp";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { Acesso } from "domain/acessos/types";
import { EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { fichasQueryKey } from "domain/fichas/constants";
import { formatDescanso } from "domain/fichas/formatters";
import { FichaItem } from "domain/fichas/types";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function diaFromOrigem(origem?: string | null): string | null {
  const m = String(origem || "").match(/^app:([A-D])$/i);
  return m ? m[1].toUpperCase() : null;
}

function sortedAcessos(list: Acesso[]) {
  return [...list].sort((a, b) => new Date(a.registrado_em).getTime() - new Date(b.registrado_em).getTime());
}

function isCardio(nome: string, musculos: { nome: string }[]) {
  const blob = `${nome} ${musculos.map((m) => m.nome).join(" ")}`.toLowerCase();
  return /cardio|esteira|bike|el[ií]pt|corda|skierg|remo |spinning|hiit/.test(blob);
}

function regionId(nome: string): string | null {
  const n = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/peit|peitoral|chest/.test(n)) return "chest";
  if (/costas|dorsal|latiss|trapez/.test(n)) return "back";
  if (/ombro|deltoid/.test(n)) return "shoulders";
  if (/bicep/.test(n)) return "biceps";
  if (/tricep/.test(n)) return "triceps";
  if (/abdomen|obliquo|core|abs/.test(n)) return "abs";
  if (/quadric|coxa/.test(n) && !/posterior|femor/.test(n)) return "quads";
  if (/posterior|femor|isquiot/.test(n)) return "hams";
  if (/glute/.test(n)) return "glutes";
  if (/panturr|gemel|calf/.test(n)) return "calves";
  return null;
}

function Overlay({
  id,
  active,
  children,
}: {
  id: string;
  active: Record<string, string>;
  children: ReactNode;
}) {
  const c = active[id];
  if (!c) return null;
  return (
    <g fill={c} fillOpacity={0.52} style={{ mixBlendMode: "multiply" }}>
      {children}
    </g>
  );
}

function MuscleAvatar({ active }: { active: Record<string, string> }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = (next: number) => {
    const el = scrollerRef.current;
    if (!el || next < 0 || next > 1) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  const arrowSx = {
    position: "absolute" as const,
    top: "48%",
    zIndex: 3,
    opacity: 0.28,
    color: "text.primary",
    p: 0.25,
    "&:hover": { opacity: 0.55, bgcolor: "transparent" },
  };

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#fff",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {index > 0 ? (
        <IconButton aria-label="Anterior" onClick={() => goTo(index - 1)} sx={{ ...arrowSx, left: 4 }}>
          <Icon name="mdi:chevron-left" width={36} height={36} />
        </IconButton>
      ) : null}
      {index < 1 ? (
        <IconButton aria-label="Próximo" onClick={() => goTo(index + 1)} sx={{ ...arrowSx, right: 4 }}>
          <Icon name="mdi:chevron-right" width={36} height={36} />
        </IconButton>
      ) : null}
      <Box
        ref={scrollerRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
          if (next !== index && (next === 0 || next === 1)) setIndex(next);
        }}
        sx={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", boxSizing: "border-box" }}>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Box
              component="img"
              src={anatomiaFrente}
              alt="Frente"
              draggable={false}
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <Box
              component="svg"
              viewBox="0 0 360 360"
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              <Overlay id="shoulders" active={active}>
                <ellipse cx="122" cy="88" rx="28" ry="24" />
                <ellipse cx="238" cy="88" rx="28" ry="24" />
              </Overlay>
              <Overlay id="chest" active={active}>
                <ellipse cx="180" cy="118" rx="48" ry="32" />
              </Overlay>
              <Overlay id="biceps" active={active}>
                <ellipse cx="98" cy="132" rx="18" ry="32" />
                <ellipse cx="262" cy="132" rx="18" ry="32" />
              </Overlay>
              <Overlay id="abs" active={active}>
                <ellipse cx="180" cy="162" rx="32" ry="36" />
              </Overlay>
              <Overlay id="quads" active={active}>
                <ellipse cx="152" cy="232" rx="26" ry="52" />
                <ellipse cx="208" cy="232" rx="26" ry="52" />
              </Overlay>
              <Overlay id="calves" active={active}>
                <ellipse cx="150" cy="302" rx="18" ry="34" />
                <ellipse cx="210" cy="302" rx="18" ry="34" />
              </Overlay>
            </Box>
          </Box>
        </Box>
        <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", boxSizing: "border-box" }}>
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
            <Box
              component="img"
              src={anatomiaCostas}
              alt="Costas"
              draggable={false}
              sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
            />
            <Box
              component="svg"
              viewBox="0 0 360 360"
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
            >
              <Overlay id="shoulders" active={active}>
                <ellipse cx="122" cy="90" rx="28" ry="24" />
                <ellipse cx="238" cy="90" rx="28" ry="24" />
              </Overlay>
              <Overlay id="back" active={active}>
                <ellipse cx="180" cy="128" rx="54" ry="50" />
              </Overlay>
              <Overlay id="triceps" active={active}>
                <ellipse cx="96" cy="136" rx="18" ry="34" />
                <ellipse cx="264" cy="136" rx="18" ry="34" />
              </Overlay>
              <Overlay id="glutes" active={active}>
                <ellipse cx="180" cy="208" rx="36" ry="26" />
              </Overlay>
              <Overlay id="hams" active={active}>
                <ellipse cx="152" cy="252" rx="24" ry="44" />
                <ellipse cx="208" cy="252" rx="24" ry="44" />
              </Overlay>
              <Overlay id="calves" active={active}>
                <ellipse cx="150" cy="308" rx="18" ry="32" />
                <ellipse cx="210" cy="308" rx="18" ry="32" />
              </Overlay>
            </Box>
          </Box>
        </Box>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ pb: 1.25, pt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {index === 0 ? "Frente" : "Costas"}
        </Typography>
        {[0, 1].map((i) => (
          <Box
            key={i}
            onClick={() => {
              const el = scrollerRef.current;
              if (!el) return;
              el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
              setIndex(i);
            }}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === index ? "#FF5356" : "#ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default function CheckinResumo() {
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

  const ficha = fichas[0];
  const ordered = useMemo(() => sortedAcessos(acessosData?.acessos ?? []), [acessosData]);
  const last = ordered[ordered.length - 1];
  const openEntrada = last?.tipo === "ENTRADA" ? last : null;
  const lastPair = useMemo(() => {
    if (openEntrada) return { entrada: openEntrada, saida: null as Acesso | null };
    const saida = [...ordered].reverse().find((a) => a.tipo === "SAIDA");
    if (!saida) return { entrada: null as Acesso | null, saida: null as Acesso | null };
    const before = ordered.filter(
      (a) => a.tipo === "ENTRADA" && new Date(a.registrado_em) <= new Date(saida.registrado_em),
    );
    return { entrada: before[before.length - 1] ?? null, saida };
  }, [ordered, openEntrada]);

  const dia =
    diaFromOrigem(openEntrada?.origem ?? lastPair.saida?.origem ?? lastPair.entrada?.origem) || "A";
  const itensDia: FichaItem[] = (ficha?.itens ?? []).filter((i) => String(i.dia).toUpperCase() === dia);

  const saidaMutation = useMutation({
    mutationFn: () =>
      addAcesso({
        id_pessoa: user!.id,
        tipo: "SAIDA",
        origem: `app:${dia}`,
        academia_slug: academiaSlug,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["acessos"] });
    },
    onError: () => toast.error("Não foi possível registrar a saída."),
  });

  useEffect(() => {
    if (!isCliente || !user?.id || posted.current) return;
    if (loadingAcessos) return;
    if (!openEntrada) return;
    posted.current = true;
    saidaMutation.mutate();
  }, [isCliente, user?.id, loadingAcessos, openEntrada, saidaMutation]);

  const musculos = useMemo(() => {
    const map = new Map<number, { nome: string; color: string; icon: string }>();
    for (const item of itensDia) {
      const ex = exercicios.find((e) => e.id === item.id_exercicio);
      for (const m of ex?.musculos ?? []) map.set(m.id, m);
    }
    return [...map.values()];
  }, [itensDia, exercicios]);

  const activeRegions = useMemo(() => {
    const out: Record<string, string> = {};
    for (const m of musculos) {
      const id = regionId(m.nome);
      if (id) out[id] = m.color || "#FF5356";
    }
    return out;
  }, [musculos]);

  const descansoSeg = itensDia.reduce((acc, i) => acc + (i.descanso_segundos || 0) * (i.series || 1), 0);
  const cardioSeg = itensDia.reduce((acc, i) => {
    const ex = exercicios.find((e) => e.id === i.id_exercicio);
    if (!ex || !isCardio(ex.nome, ex.musculos ?? [])) return acc;
    return acc + (i.descanso_segundos || 0) * (i.series || 1) + 60 * (i.series || 1);
  }, 0);

  const entrada = lastPair.entrada;
  const saida = lastPair.saida ?? (saidaMutation.data ?? null);
  const treinoMs =
    entrada && saida ? Math.max(0, new Date(saida.registrado_em).getTime() - new Date(entrada.registrado_em).getTime()) : 0;

  if (!isCliente) {
    return <Alert severity="info">Resumo de treino é para o aluno.</Alert>;
  }

  const loading = loadingFichas || loadingAcessos || (openEntrada && saidaMutation.isLoading);

  return (
    <Box sx={{ width: "100%", maxWidth: 480, mx: "auto", pb: 3 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
        Treino encerrado
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {ficha?.nome ?? "Ficha"} · dia {dia}
      </Typography>

      {loading && !saida ? (
        <Skeleton variant="rounded" height={240} />
      ) : (
        <Stack spacing={2}>
          <MuscleAvatar active={activeRegions} />
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
          {musculos.length ? (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
              {musculos.map((m) => (
                <Chip key={m.nome} icon={m.icon} nome={m.nome} color={m.color} />
              ))}
            </Stack>
          ) : null}
          <Button variant="contained" color="success" onClick={() => navigate(base || "/")}>
            Voltar ao início
          </Button>
        </Stack>
      )}
    </Box>
  );
}
