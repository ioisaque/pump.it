import { Alert, Box, Dialog, DialogContent, DialogTitle, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findExercicio } from "api/exercicios";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import Icon from "components/Icon";
import { exercicioQueryKey } from "domain/exercicios/constants";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { Exercicio } from "domain/exercicios/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useEffect, useMemo, useRef, useState } from "react";

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

type Slide = { key: string; tipo: string; caminho: string };

function slidesFromExercicio(data: Exercicio): Slide[] {
  const slides: Slide[] = [];
  const seen = new Set<string>();
  function push(tipo: string, caminho: string, key: string) {
    if (!caminho || seen.has(caminho)) return;
    seen.add(caminho);
    slides.push({ tipo, caminho, key });
  }
  if (data.capa?.caminho) push(data.capa.tipo, data.capa.caminho, "capa");
  for (const a of data.anexos ?? []) push(a.tipo, a.caminho, `anexo-${a.id}`);
  return slides;
}

function thumbSrc(slide: Slide): string {
  if (slide.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(slide.caminho);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  }
  return resolveUploadUrl(slide.caminho);
}

function SlideMedia({ slide, title }: { slide: Slide; title: string }) {
  if (slide.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(slide.caminho);
    if (id) {
      return (
        <Box sx={{ width: "100%", height: "100%", bgcolor: "#000" }}>
          <Box
            component="iframe"
            title={title}
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ width: "100%", height: "100%", border: 0 }}
          />
        </Box>
      );
    }
  }
  const src = resolveUploadUrl(slide.caminho);
  if (!src) {
    return (
      <Box sx={{ width: "100%", height: "100%", bgcolor: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <Icon name="mdi:dumbbell" width={64} height={64} />
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={src}
      alt=""
      draggable={false}
      sx={{ width: "100%", height: "100%", objectFit: "contain", bgcolor: "#111", display: "block" }}
    />
  );
}

type Props = {
  exercicioId: number | null;
  open: boolean;
  onClose: () => void;
};

export default function ExercicioPreviewDialog({ exercicioId, open, onClose }: Props) {
  const mobileDialog = useMobileDialog("md");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: exercicioQueryKey(exercicioId ?? 0),
    queryFn: () => findExercicio(exercicioId as number),
    enabled: open && exercicioId != null,
    retry: 1,
  });

  const slides = useMemo(() => (data ? slidesFromExercicio(data) : []), [data]);

  useEffect(() => {
    setIndex(0);
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [exercicioId, open]);

  function goTo(next: number) {
    const el = scrollerRef.current;
    if (!el || next < 0 || next >= slides.length) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  }

  return (
    <Dialog open={open} onClose={onClose} scroll="paper" {...mobileDialog}>
      <DialogTitle sx={{ p: 2, pb: 1.5 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1}>
          <Box minWidth={0} flex={1}>
            <Typography variant="subtitle1" color="secondary.main" fontWeight={700} noWrap>
              {data?.nome ?? "Exercício"}
            </Typography>
            {data ? (
              <Typography variant="caption" color="text.secondary">
                #{String(data.id).padStart(4, "0")}
              </Typography>
            ) : null}
          </Box>
          <ActionIcon
            icon="majesticons:close"
            color="error.main"
            size={40}
            to="#close"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          />
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 2, px: { xs: 1.5, sm: 2 } }}>
        {isLoading ? (
          <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "1 / 1" }} />
        ) : isError || !data ? (
          <Alert severity="error">Não foi possível carregar o exercício.</Alert>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ position: "relative" }}>
              {index > 0 ? (
                <IconButton
                  aria-label="Anterior"
                  onClick={() => goTo(index - 1)}
                  sx={{ position: "absolute", left: 4, top: "48%", zIndex: 2, opacity: 0.45, p: 0.25, color: "#fff" }}
                >
                  <Icon name="mdi:chevron-left" width={36} height={36} />
                </IconButton>
              ) : null}
              {index < slides.length - 1 ? (
                <IconButton
                  aria-label="Próximo"
                  onClick={() => goTo(index + 1)}
                  sx={{ position: "absolute", right: 4, top: "48%", zIndex: 2, opacity: 0.45, p: 0.25, color: "#fff" }}
                >
                  <Icon name="mdi:chevron-right" width={36} height={36} />
                </IconButton>
              ) : null}
              <Box
                ref={scrollerRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
                  if (next !== index && next >= 0 && next < slides.length) setIndex(next);
                }}
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  scrollSnapType: "x mandatory",
                  bgcolor: "#111",
                  borderRadius: 2,
                  WebkitOverflowScrolling: "touch",
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {(slides.length ? slides : [{ key: "empty", tipo: "IMAGE", caminho: "" }]).map((slide) => (
                  <Box
                    key={slide.key}
                    sx={{ flex: "0 0 100%", width: "100%", aspectRatio: "1 / 1", scrollSnapAlign: "start" }}
                  >
                    <SlideMedia slide={slide} title={data.nome} />
                  </Box>
                ))}
              </Box>
            </Box>

            {slides.length > 1 ? (
              <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
                {slides.map((slide, i) => {
                  const src = thumbSrc(slide);
                  return (
                    <Box
                      key={slide.key}
                      onClick={() => goTo(i)}
                      sx={{
                        flex: "0 0 64px",
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        bgcolor: "#111",
                        outline: i === index ? "2px solid #FF5356" : "2px solid transparent",
                        outlineOffset: 0,
                      }}
                    >
                      {src ? (
                        <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                          <Icon name="mdi:youtube" width={28} height={28} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            ) : null}

            {(data.musculos ?? []).length ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {(data.musculos ?? []).map((m) => (
                  <Chip key={m.id} icon={m.icon} nome={m.nome} color={m.color} />
                ))}
              </Stack>
            ) : null}
            {data.carga_inicial != null ? (
              <Typography variant="body2">
                Carga predefinida inicial: <strong>{data.carga_inicial} kg</strong>
              </Typography>
            ) : null}
            {data.descricao?.trim() ? (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                {data.descricao}
              </Typography>
            ) : null}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
