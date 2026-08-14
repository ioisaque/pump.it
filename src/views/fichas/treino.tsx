import {
    Alert,
    Box,
    Button,
    ButtonBase,
    CircularProgress,
    Dialog,
    IconButton,
    Link,
    Skeleton,
    Stack,
    Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listExercicios } from "api/exercicios";
import { findFicha } from "api/fichas";
import { findTreino } from "api/treinos";
import Icon from "components/Icon";
import { EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { Exercicio } from "domain/exercicios/types";
import { fichaQueryKey } from "domain/fichas/constants";
import { formatDescanso } from "domain/fichas/formatters";
import { FichaItem } from "domain/fichas/types";
import useTenantBase from "hooks/useTenantBase";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LINK } from "utils/link";

const DIA_COLORS: Record<string, string> = {
  A: "#FF5356",
  B: "#33CC66",
  C: "#0076F3",
  D: "#FFD22B",
};

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function ExercicioMedia({ exercicio }: { exercicio?: Exercicio }) {
  const capa = exercicio?.capa;
  if (!capa?.caminho) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          bgcolor: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Icon name="mdi:dumbbell" width={64} height={64} />
      </Box>
    );
  }

  if (capa.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(capa.caminho);
    if (id) {
      return (
        <Box sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: "#000" }}>
          <Box
            component="iframe"
            title={exercicio?.nome ?? "Exercício"}
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ width: "100%", height: "100%", border: 0 }}
          />
        </Box>
      );
    }
  }

  return (
    <Box
      component="img"
      src={resolveUploadUrl(capa.caminho)}
      alt={exercicio?.nome ?? ""}
      draggable={false}
      sx={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", bgcolor: "#111", display: "block" }}
    />
  );
}

function Stat({
  label,
  value,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
  onClick?: () => void;
}) {
  const dark = color === "#FFD22B";
  const inner = (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ width: "100%" }}>
      <Box sx={{ color, display: "flex", opacity: 0.95 }}>
        <Icon name={icon} width={36} height={36} />
      </Box>
      <Box minWidth={0}>
        <Typography variant="caption" display="block" sx={{ color: dark ? "rgba(0,0,0,0.55)" : "text.secondary" }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={800} lineHeight={1.2} noWrap>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
  const sx = {
    flex: "1 1 40%",
    minWidth: 0,
    borderRadius: 2,
    px: 1.5,
    py: 1.35,
    textAlign: "left" as const,
    bgcolor: `${color}22`,
    color: dark ? "#333" : "text.primary",
  };
  if (onClick) {
    return (
      <ButtonBase onClick={onClick} sx={sx}>
        {inner}
      </ButtonBase>
    );
  }
  return <Box sx={sx}>{inner}</Box>;
}

function TreinoSlide({
  item,
  exercicio,
  onRestEnd,
}: {
  item: FichaItem;
  exercicio?: Exercicio;
  onRestEnd: () => void;
}) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const descRef = useRef<HTMLParagraphElement>(null);
  const onRestEndRef = useRef(onRestEnd);
  onRestEndRef.current = onRestEnd;
  const descricao = exercicio?.descricao?.trim() ?? "";
  const descanso = item.descanso_segundos || 0;
  const elapsed = Math.max(0, descanso - restLeft);
  const restColor =
    elapsed < (descanso * 2) / 4 ? "#33CC66" : elapsed < (descanso * 3) / 4 ? "#FFD22B" : "#FF5356";

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || descExpanded) return;
    setDescOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [descricao, descExpanded]);

  useEffect(() => {
    if (!restOpen) return;
    setRestLeft(descanso);
    if (descanso <= 0) {
      setRestOpen(false);
      onRestEndRef.current();
      return;
    }
    const t = window.setInterval(() => {
      setRestLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          window.setTimeout(() => {
            setRestOpen(false);
            onRestEndRef.current();
          }, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [restOpen, descanso]);

  return (
    <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", px: 0.5, boxSizing: "border-box" }}>
      <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <ExercicioMedia exercicio={exercicio} />
      </Box>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 2 }}>
        <Stat label="Séries" value={String(item.series)} icon="mdi:repeat" color="#0076F3" />
        <Stat label="Repetições" value={item.repeticoes || "—"} icon="mdi:counter" color="#9900CC" />
        <Stat label="Carga" value={item.carga != null ? `${item.carga} kg` : "—"} icon="mdi:weight-kilogram" color="#FFD22B" />
        <Stat
          label="Descanso"
          value={formatDescanso(descanso)}
          icon="mdi:timer-outline"
          color="#FF5356"
          onClick={() => setRestOpen(true)}
        />
      </Stack>
      <Dialog
        open={restOpen}
        onClose={() => setRestOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "50%",
            width: 280,
            height: 280,
            maxWidth: "80vw",
            maxHeight: "80vw",
            overflow: "visible",
            bgcolor: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size="100%"
            thickness={3.2}
            sx={{ position: "absolute", color: `${restColor}33` }}
          />
          <CircularProgress
            variant="determinate"
            value={descanso ? (restLeft / descanso) * 100 : 0}
            size="100%"
            thickness={3.2}
            sx={{
              position: "absolute",
              color: restColor,
              transform: "rotate(-90deg) !important",
            }}
          />
          <Typography variant="h2" fontWeight={800} sx={{ color: restColor, zIndex: 1 }}>
            {formatDescanso(restLeft)}
          </Typography>
        </Box>
      </Dialog>
      {descricao ? (
        <Box sx={{ mb: 2 }}>
          <Typography
            ref={descRef}
            variant="body2"
            color="text.secondary"
            sx={
              descExpanded
                ? undefined
                : {
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
            }
          >
            {descricao}
          </Typography>
          {descOverflows || descExpanded ? (
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              onClick={() => setDescExpanded((v) => !v)}
              sx={{ mt: 0.5, fontWeight: 600 }}
            >
              {descExpanded ? "Leia menos" : "Leia mais..."}
            </Link>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

export default function FichaTreino() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { academiaSlug } = useTenantBase();
  const fromWorkout = pathname.split("/").includes("workout");
  const treinoId = Number(id);
  const fichaIdParam = Number(id);
  const diaQuery = (search.get("dia") || "").toUpperCase();
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data: treino, isLoading: loadingTreino, error: treinoError } = useQuery({
    queryKey: ["treino", treinoId],
    queryFn: () => findTreino(treinoId, { academia_slug: academiaSlug }),
    enabled: fromWorkout && Number.isFinite(treinoId) && treinoId > 0,
  });

  const fichaId = fromWorkout ? Number(treino?.id_ficha) : fichaIdParam;
  const dia = fromWorkout ? String(treino?.dia || "A").toUpperCase() : diaQuery;

  const { data: fichaLoaded, isLoading: loadingFicha, error: fichaError } = useQuery({
    queryKey: fichaQueryKey(fichaId),
    queryFn: () => findFicha(fichaId),
    enabled: !fromWorkout && Number.isFinite(fichaId) && fichaId > 0,
  });

  const ficha = fromWorkout ? treino?.ficha : fichaLoaded;
  const isLoading = fromWorkout ? loadingTreino : loadingFicha;
  const error = fromWorkout ? treinoError : fichaError;

  const { data: exercicios = [] } = useQuery({
    queryKey: EXERCICIOS_QUERY_KEY,
    queryFn: listExercicios,
  });

  const byId = useMemo(() => {
    const map = new Map<number, Exercicio>();
    for (const ex of exercicios) map.set(ex.id, ex);
    return map;
  }, [exercicios]);

  const itens = useMemo(() => {
    return (ficha?.itens ?? [])
      .filter((row) => String(row.dia).toUpperCase() === dia)
      .slice()
      .sort((a, b) => a.ordem - b.ordem);
  }, [ficha?.itens, dia]);

  const item = itens[itens.length ? Math.min(index, itens.length - 1) : 0];
  const exercicio = item ? byId.get(item.id_exercicio) : undefined;
  const titulo = exercicio?.nome ?? item?.exercicio_nome ?? "Exercício";

  function goTo(next: number) {
    const el = scrollerRef.current;
    if (!el || next < 0 || next >= itens.length) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  const qTreino = Number(search.get("treino"));
  if (!fromWorkout && Number.isFinite(qTreino) && qTreino > 0) {
    return <Navigate to={LINK(`/workout/${qTreino}`)} replace />;
  }

  if (!fromWorkout && !dia) {
    return <Navigate to={LINK("/workout-plans")} replace />;
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        pb: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: DIA_COLORS[dia] ?? "secondary.main",
            color: dia === "D" ? "#333" : "#fff",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {dia}
        </Box>
        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
          {isLoading ? "Treino" : titulo}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>
          {itens.length ? `${Math.min(index, itens.length - 1) + 1}/${itens.length}` : "—"}
        </Typography>
      </Stack>

      {isLoading ? (
        <Skeleton variant="rectangular" sx={{ aspectRatio: "1 / 1", width: "100%", borderRadius: 2 }} />
      ) : error || !ficha ? (
        <Alert severity="error">Não foi possível carregar o plano de treino.</Alert>
      ) : itens.length === 0 ? (
        <Alert severity="info">Nenhum exercício no treino {dia}.</Alert>
      ) : (
        <Box sx={{ position: "relative" }}>
          {index > 0 ? (
            <IconButton
              aria-label="Anterior"
              onClick={() => goTo(index - 1)}
              sx={{
                position: "fixed",
                left: 4,
                top: "48%",
                zIndex: 3,
                opacity: 0.28,
                color: "text.primary",
                p: 0.25,
                "&:hover": { opacity: 0.55, bgcolor: "transparent" },
              }}
            >
              <Icon name="mdi:chevron-left" width={36} height={36} />
            </IconButton>
          ) : null}
          {index < itens.length - 1 ? (
            <IconButton
              aria-label="Próximo"
              onClick={() => goTo(index + 1)}
              sx={{
                position: "fixed",
                right: 4,
                top: "48%",
                zIndex: 3,
                opacity: 0.28,
                color: "text.primary",
                p: 0.25,
                "&:hover": { opacity: 0.55, bgcolor: "transparent" },
              }}
            >
              <Icon name="mdi:chevron-right" width={36} height={36} />
            </IconButton>
          ) : null}

          <Box
            ref={scrollerRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
              if (next !== index && next >= 0 && next < itens.length) setIndex(next);
            }}
            sx={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollBehavior: "auto",
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {itens.map((row) => (
              <TreinoSlide
                key={`${row.dia}-${row.ordem}-${row.id_exercicio}`}
                item={row}
                exercicio={byId.get(row.id_exercicio)}
                onRestEnd={() => goTo(index + 1)}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button
          size="small"
          color="inherit"
          onClick={() =>
            navigate(fromWorkout ? LINK(`/workout/${treinoId}/end`) : LINK("/workout-plans"))
          }
          sx={{ color: "text.disabled", textTransform: "none", fontWeight: 400 }}
        >
          {fromWorkout ? (treino?.encerrado_em ? "Ver resumo" : "Encerrar treino") : "Voltar aos planos"}
        </Button>
      </Box>
    </Box>
  );
}
