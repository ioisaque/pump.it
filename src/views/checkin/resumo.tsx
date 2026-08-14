import { Alert, Box, Button, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAcesso, listAcessos } from "api/acessos";
import { listExercicios } from "api/exercicios";
import { listFichas } from "api/fichas";
import anatomiaCostasMask from "assets/imgs/anatomia-costas-mask.webp";
import anatomiaCostas from "assets/imgs/anatomia-costas.webp";
import anatomiaFrenteMask from "assets/imgs/anatomia-frente-mask.webp";
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

type MuscleMark = { id: string; nome: string; color: string; icon: string };

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
  return <g fill={c}>{children}</g>;
}

const FRONT_CALL = {
  shoulders: { ax: 222, ay: 78, side: "right" as const },
  chest: { ax: 210, ay: 108, side: "right" as const },
  biceps: { ax: 122, ay: 118, side: "left" as const },
  abs: { ax: 208, ay: 152, side: "right" as const },
  quads: { ax: 144, ay: 236, side: "left" as const },
  calves: { ax: 142, ay: 308, side: "left" as const },
};

const BACK_CALL = {
  shoulders: { ax: 222, ay: 78, side: "right" as const },
  back: { ax: 214, ay: 120, side: "right" as const },
  triceps: { ax: 124, ay: 118, side: "left" as const },
  glutes: { ax: 214, ay: 200, side: "right" as const },
  hams: { ax: 144, ay: 246, side: "left" as const },
  calves: { ax: 140, ay: 308, side: "left" as const },
};

function MuscleAvatar({ marks }: { marks: MuscleMark[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const active: Record<string, string> = {};
  for (const m of marks) active[m.id] = m.color;

  const goTo = (next: number) => {
    const el = scrollerRef.current;
    if (!el || next < 0 || next > 1) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };

  const arrowSx = {
    position: "absolute" as const,
    top: "48%",
    zIndex: 4,
    opacity: 0.28,
    color: "text.primary",
    p: 0.25,
    "&:hover": { opacity: 0.55, bgcolor: "transparent" },
  };

  const callMap = index === 0 ? FRONT_CALL : BACK_CALL;
  const callouts = marks.filter((m) => m.id in callMap);

  const overlayMask = {
    position: "absolute" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    mixBlendMode: "multiply" as const,
    WebkitMaskImage: `url(${index === 0 ? anatomiaFrenteMask : anatomiaCostasMask})`,
    maskImage: `url(${index === 0 ? anatomiaFrenteMask : anatomiaCostasMask})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
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
        isolation: "isolate",
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
            <Box component="svg" viewBox="0 0 360 360" sx={{ ...overlayMask, WebkitMaskImage: `url(${anatomiaFrenteMask})`, maskImage: `url(${anatomiaFrenteMask})` }}>
                <Overlay id="shoulders" active={active}>
                  <path d="M140 66 C132 70 128 80 130 92 C134 102 146 102 154 92 C154 80 150 70 140 66 Z" />
                  <path d="M220 66 C228 70 232 80 230 92 C226 102 214 102 206 92 C206 80 210 70 220 66 Z" />
                </Overlay>
                <Overlay id="chest" active={active}>
                  <path d="M180 76 C164 76 152 86 150 102 C152 116 164 124 180 122 C180 104 180 88 180 76 Z" />
                  <path d="M180 76 C196 76 208 86 210 102 C208 116 196 124 180 122 C180 104 180 88 180 76 Z" />
                </Overlay>
                <Overlay id="biceps" active={active}>
                  <path d="M126 96 C116 104 114 124 116 146 C122 154 134 150 138 132 C140 114 136 100 126 96 Z" />
                  <path d="M234 96 C244 104 246 124 244 146 C238 154 226 150 222 132 C220 114 224 100 234 96 Z" />
                </Overlay>
                <Overlay id="abs" active={active}>
                  <path d="M168 122 C176 120 180 120 180 176 L168 176 C162 158 162 138 168 122 Z" />
                  <path d="M192 122 C184 120 180 120 180 176 L192 176 C198 158 198 138 192 122 Z" />
                  <path d="M154 128 C146 142 146 164 154 178 L168 176 C164 152 160 134 168 124 Z" />
                  <path d="M206 128 C214 142 214 164 206 178 L192 176 C196 152 200 134 192 124 Z" />
                </Overlay>
                <Overlay id="quads" active={active}>
                  <path d="M144 214 C138 238 136 262 142 276 C152 280 166 268 168 242 C166 224 158 214 148 214 Z" />
                  <path d="M216 214 C222 238 224 262 218 276 C208 280 194 268 192 242 C194 224 202 214 212 214 Z" />
                </Overlay>
                <Overlay id="calves" active={active}>
                  <path d="M142 286 C136 308 138 326 148 334 C158 334 164 316 162 298 C160 288 152 284 142 286 Z" />
                  <path d="M218 286 C224 308 222 326 212 334 C202 334 196 316 198 298 C200 288 208 284 218 286 Z" />
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
            {index === 1 ? (
              <Box component="svg" viewBox="0 0 360 360" sx={overlayMask}>
                <Overlay id="shoulders" active={active}>
                  <path d="M138 68 C130 74 128 86 132 96 C138 104 150 102 156 90 C154 78 148 68 138 68 Z" />
                  <path d="M222 68 C230 74 232 86 228 96 C222 104 210 102 204 90 C206 78 212 68 222 68 Z" />
                </Overlay>
                <Overlay id="back" active={active}>
                  <path d="M180 58 C162 62 150 72 148 88 C158 94 180 98 180 58 Z" />
                  <path d="M180 58 C198 62 210 72 212 88 C202 94 180 98 180 58 Z" />
                  <path d="M150 90 C134 112 130 148 140 176 L180 180 L180 96 C168 94 156 92 150 90 Z" />
                  <path d="M210 90 C226 112 230 148 220 176 L180 180 L180 96 C192 94 204 92 210 90 Z" />
                </Overlay>
                <Overlay id="triceps" active={active}>
                  <path d="M126 94 C118 108 118 138 124 156 C134 160 142 146 140 120 C138 102 132 94 126 94 Z" />
                  <path d="M234 94 C242 108 242 138 236 156 C226 160 218 146 220 120 C222 102 228 94 234 94 Z" />
                </Overlay>
                <Overlay id="glutes" active={active}>
                  <path d="M150 188 C144 200 150 216 178 218 C178 200 168 188 150 188 Z" />
                  <path d="M210 188 C216 200 210 216 182 218 C182 200 192 188 210 188 Z" />
                </Overlay>
                <Overlay id="hams" active={active}>
                  <path d="M144 218 C136 242 136 266 144 276 C156 280 168 266 170 242 C168 224 158 218 148 218 Z" />
                  <path d="M216 218 C224 242 224 266 216 276 C204 280 192 266 190 242 C192 224 202 218 212 218 Z" />
                </Overlay>
                <Overlay id="calves" active={active}>
                  <path d="M140 286 C134 308 136 326 146 334 C156 334 164 316 162 296 C158 286 148 284 140 286 Z" />
                  <path d="M220 286 C226 308 224 326 214 334 C204 334 196 316 198 296 C202 286 212 284 220 286 Z" />
                </Overlay>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Box
        component="svg"
        viewBox="0 0 360 360"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          aspectRatio: "1 / 1",
          width: "100%",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {callouts.map((m) => {
          const c = callMap[m.id as keyof typeof callMap];
          const x2 = c.side === "left" ? 36 : 324;
          return (
            <g key={m.id}>
              <line x1={c.ax} y1={c.ay} x2={x2} y2={c.ay} stroke={m.color} strokeWidth={1.4} />
              <circle cx={c.ax} cy={c.ay} r={2.4} fill={m.color} />
            </g>
          );
        })}
      </Box>
      <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, aspectRatio: "1 / 1", zIndex: 3, pointerEvents: "none" }}>
        {callouts.map((m) => {
          const c = callMap[m.id as keyof typeof callMap];
          return (
            <Box
              key={m.id}
              sx={{
                position: "absolute",
                top: `calc(${(c.ay / 360) * 100}% - 12px)`,
                left: c.side === "left" ? 6 : "auto",
                right: c.side === "right" ? 6 : "auto",
              }}
            >
              <Chip icon={m.icon} nome={m.nome} color={m.color} fontSize="72%" />
            </Box>
          );
        })}
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ pb: 1.25, pt: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {index === 0 ? "Frente" : "Costas"}
        </Typography>
        {[0, 1].map((i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
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

  const muscleMarks = useMemo(() => {
    const byRegion = new Map<string, MuscleMark>();
    for (const m of musculos) {
      const id = regionId(m.nome);
      if (id && !byRegion.has(id)) {
        byRegion.set(id, { id, nome: m.nome, color: m.color || "#FF5356", icon: m.icon });
      }
    }
    return [...byRegion.values()];
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
          <MuscleAvatar marks={muscleMarks} />
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
          <Button variant="contained" color="success" onClick={() => navigate(base || "/")}>
            Voltar ao início
          </Button>
        </Stack>
      )}
    </Box>
  );
}
