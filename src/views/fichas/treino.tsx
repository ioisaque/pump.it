import { Alert, Box, IconButton, Link, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listExercicios } from "api/exercicios";
import { findFicha } from "api/fichas";
import Icon from "components/Icon";
import { EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { Exercicio } from "domain/exercicios/types";
import { fichaQueryKey } from "domain/fichas/constants";
import { formatDescanso } from "domain/fichas/formatters";
import { FichaItem } from "domain/fichas/types";
import useTenantBase from "hooks/useTenantBase";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        flex: "1 1 40%",
        minWidth: 0,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        px: 1.5,
        py: 1.25,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
        {value}
      </Typography>
    </Box>
  );
}

function TreinoSlide({ item, exercicio }: { item: FichaItem; exercicio?: Exercicio }) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const descricao = exercicio?.descricao?.trim() ?? "";

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el || descExpanded) return;
    setDescOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [descricao, descExpanded]);

  return (
    <Box sx={{ flex: "0 0 100%", width: "100%", scrollSnapAlign: "start", px: 0.5, boxSizing: "border-box" }}>
      <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <ExercicioMedia exercicio={exercicio} />
      </Box>
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 2 }}>
        <Stat label="Séries" value={String(item.series)} />
        <Stat label="Repetições" value={item.repeticoes || "—"} />
        <Stat label="Carga" value={item.carga != null ? `${item.carga} kg` : "—"} />
        <Stat label="Descanso" value={formatDescanso(item.descanso_segundos)} />
      </Stack>
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
  const { base } = useTenantBase();
  const dia = (search.get("dia") || "").toUpperCase();
  const fichaId = Number(id);
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const { data: ficha, isLoading, error } = useQuery({
    queryKey: fichaQueryKey(fichaId),
    queryFn: () => findFicha(fichaId),
    enabled: Number.isFinite(fichaId) && fichaId > 0,
  });

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

  if (!dia) {
    return <Navigate to={`${base}/fichas`} replace />;
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
        <Alert severity="error">Não foi possível carregar a ficha.</Alert>
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
              <TreinoSlide key={`${row.dia}-${row.ordem}-${row.id_exercicio}`} item={row} exercicio={byId.get(row.id_exercicio)} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
