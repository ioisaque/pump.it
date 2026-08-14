import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import Icon from "components/Icon";
import { resolveUploadUrl } from "domain/exercicios/formatters";
import { ExercicioAnexo } from "domain/exercicios/types";
import { DragEvent, useEffect, useRef, useState } from "react";
import { pessoaSectionSx } from "utils/pessoas/styles";

type Props = {
  anexos: ExercicioAnexo[];
  editable?: boolean;
  uploading?: boolean;
  addingYoutube?: boolean;
  onAdd?: (file: File) => void;
  onAddYoutube?: (url: string) => void;
  onReorder?: (ids: number[]) => void;
  onRemove?: (anexoId: number) => void;
};

function youtubeIdFromUrl(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] ?? null;
}

function anexoThumb(anexo: ExercicioAnexo): { kind: "img" | "yt"; src: string } {
  if (anexo.tipo === "VIDEO") {
    const id = youtubeIdFromUrl(anexo.caminho);
    return {
      kind: "yt",
      src: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "",
    };
  }
  return { kind: "img", src: resolveUploadUrl(anexo.caminho) };
}

export default function ExercicioAnexos({
  anexos,
  editable,
  uploading,
  addingYoutube,
  onAdd,
  onAddYoutube,
  onReorder,
  onRemove,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);
  const [items, setItems] = useState(anexos);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    setItems(anexos);
  }, [anexos]);

  function handleDrop(toIndex: number) {
    const fromIndex = dragFrom.current;
    dragFrom.current = null;
    if (fromIndex == null || fromIndex === toIndex) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      onReorder?.(next.map((a) => a.id));
      return next;
    });
  }

  function allowDrop(e: DragEvent) {
    e.preventDefault();
  }

  return (
    <Box sx={pessoaSectionSx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" useFlexGap gap={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Mídias
        </Typography>
        {editable ? (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) onAdd?.(file);
              }}
            />
            <Button
              variant="contained"
              color="success"
              disabled={uploading}
              sx={{ width: 140, height: 40 }}
              startIcon={<Icon name="mdi:image-plus" />}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Enviando…" : "Foto / GIF"}
            </Button>
          </>
        ) : null}
      </Stack>

      {editable ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2} alignItems={{ sm: "center" }}>
          <TextField
            size="small"
            fullWidth
            label="URL do YouTube"
            placeholder="https://www.youtube.com/watch?v=…"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <Button
            variant="contained"
            color="info"
            disabled={addingYoutube || !youtubeUrl.trim()}
            sx={{ width: 140, height: 40, flexShrink: 0 }}
            startIcon={<Icon name="mdi:youtube" />}
            onClick={() => {
              const url = youtubeUrl.trim();
              if (!url) return;
              onAddYoutube?.(url);
              setYoutubeUrl("");
            }}
          >
            {addingYoutube ? "Adicionando…" : "YouTube"}
          </Button>
        </Stack>
      ) : null}

      {items.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          Nenhuma mídia. Adicione fotos, GIFs ou um vídeo do YouTube.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 1.5,
          }}
        >
          {items.map((anexo, index) => {
            const thumb = anexoThumb(anexo);
            const href = anexo.tipo === "VIDEO" ? anexo.caminho : resolveUploadUrl(anexo.caminho);
            return (
              <Box
                key={anexo.id}
                draggable={editable}
                onDragStart={() => {
                  dragFrom.current = index;
                }}
                onDragOver={allowDrop}
                onDrop={() => handleDrop(index)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                  position: "relative",
                  cursor: editable ? "grab" : "default",
                  bgcolor: "#fff",
                }}
              >
                <Box
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    display: "block",
                    height: 110,
                    bgcolor: "action.hover",
                    overflow: "hidden",
                  }}
                >
                  {thumb.src ? (
                    <Box
                      component="img"
                      src={thumb.src}
                      alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="mdi:youtube" />
                    </Box>
                  )}
                </Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.5 }}>
                  <Typography variant="caption" fontWeight={600} noWrap>
                    {anexo.tipo === "VIDEO" ? "YouTube" : anexo.tipo === "GIF" ? "GIF" : "Foto"}
                  </Typography>
                  {editable ? (
                    <IconButton size="small" aria-label="Remover mídia" color="error" onClick={() => onRemove?.(anexo.id)}>
                      <Icon name="mdi:delete-outline" />
                    </IconButton>
                  ) : null}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
      {editable && items.length > 1 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
          Arraste as mídias no grid para definir a ordem de exibição.
        </Typography>
      ) : null}
    </Box>
  );
}
