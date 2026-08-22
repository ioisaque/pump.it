import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import AnexoPdfPreview from "components/anexos/AnexoPdfPreview";
import Icon from "components/Icon";
import { ArquivoAnexo, anexoDisplayName, anexoExtIcon, anexoListKey } from "domain/anexos/types";
import { resolveUploadUrl } from "domain/shared/formatters";
import { useRef, useState } from "react";

type Props = {
  anexos: ArquivoAnexo[];
  editable?: boolean;
  uploading?: boolean;
  onAdd?: (file: File) => void;
  onRemove?: (anexoId: number) => void;
  paperSx?: object;
  hideTitle?: boolean;
  embedded?: boolean;
};

export function AnexosAddButton({
  uploading = false,
  disabled = false,
  onAdd,
}: {
  uploading?: boolean;
  disabled?: boolean;
  onAdd: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onAdd(file);
        }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={disabled || uploading}
        startIcon={<Icon name="mdi:paperclip-plus" width={18} />}
        onClick={() => inputRef.current?.click()}
        sx={{ textTransform: "none" }}
      >
        {uploading ? "Enviando…" : "Adicionar"}
      </Button>
    </>
  );
}

function anexoExt(nome: string): string {
  return nome.includes(".") ? nome.slice(nome.lastIndexOf(".") + 1).toLowerCase() : "";
}

function AnexoPreview({ url, nome }: { url: string; nome: string }) {
  const ext = anexoExt(nome);
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "heic"].includes(ext)) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box
          component="img"
          src={url}
          alt={anexoDisplayName(nome)}
          sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      </Box>
    );
  }
  if (ext === "pdf") {
    return <AnexoPdfPreview url={url} title={anexoDisplayName(nome)} />;
  }
  if (["mp4", "mov", "webm"].includes(ext)) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
        <Box component="video" src={url} controls sx={{ maxWidth: "100%", maxHeight: "100%" }} />
      </Box>
    );
  }
  if (["mp3", "wav", "m4a", "ogg"].includes(ext)) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ width: "100%", height: "100%" }}>
        <Icon name={anexoExtIcon(nome)} color="primary.main" width={64} />
        <Box component="audio" src={url} controls sx={{ width: "min(100%, 420px)" }} />
      </Stack>
    );
  }
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ width: "100%", height: "100%", px: 3 }}>
      <Icon name={anexoExtIcon(nome)} color="primary.main" width={64} />
      <Typography color="text.secondary" textAlign="center">
        Pré-visualização indisponível para este tipo de arquivo.
      </Typography>
      <Button
        variant="contained"
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<Icon name="mdi:download" width={18} />}
      >
        Abrir / baixar
      </Button>
    </Stack>
  );
}

export default function AnexosCard({
  anexos,
  editable = false,
  uploading = false,
  onAdd,
  onRemove,
  paperSx,
  hideTitle = false,
  embedded = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ArquivoAnexo | null>(null);
  const previewUrl = preview ? resolveUploadUrl(preview.path) : null;

  const list = anexos.length === 0 ? (
    <Typography variant="body2" color="text.secondary">
      Nenhum anexo.
    </Typography>
  ) : (
    <Stack spacing={0.75}>
      {anexos.map((anexo) => {
        const url = resolveUploadUrl(anexo.path);
        return (
          <Stack
            key={anexoListKey(anexo)}
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              py: 0.75,
              px: 1,
              borderRadius: 1.5,
              bgcolor: "action.hover",
            }}
          >
            <Box
              component="button"
              type="button"
              disabled={!url}
              onClick={() => url && setPreview(anexo)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
                minWidth: 0,
                border: 0,
                p: 0,
                bgcolor: "transparent",
                textAlign: "left",
                color: "inherit",
                cursor: url ? "pointer" : "default",
                font: "inherit",
                "&:hover .anexo-name": url ? { color: "primary.main", textDecoration: "underline" } : undefined,
              }}
            >
              <Icon name={anexoExtIcon(anexo.nome)} color="primary.main" width={22} />
              <Typography className="anexo-name" variant="body2" fontWeight={600} noWrap sx={{ minWidth: 0, flex: 1 }}>
                {anexoDisplayName(anexo.nome)}
              </Typography>
            </Box>
            {editable ? (
              <IconButton
                size="small"
                aria-label="Remover anexo"
                onClick={() => onRemove?.(anexo.id)}
                sx={{ color: "error.main" }}
              >
                <Icon name="mdi:trash-can-outline" width={18} />
              </IconButton>
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );

  const previewDialog = (
    <Dialog
      fullScreen
      open={preview != null && Boolean(previewUrl)}
      onClose={() => setPreview(null)}
      keepMounted={false}
      PaperProps={{ sx: { display: "flex", flexDirection: "column" } }}
    >
      <DialogTitle sx={{ py: 1.25, px: 2, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" gap={1} minWidth={0} flex={1}>
            {preview ? <Icon name={anexoExtIcon(preview.nome)} color="primary.main" width={24} /> : null}
            <Typography variant="h6" fontWeight={700} noWrap component="div" sx={{ minWidth: 0 }}>
              {preview ? anexoDisplayName(preview.nome) : ""}
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setPreview(null)} aria-label="Fechar">
            <Icon name="majesticons:close" color="error.main" width={22} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 0,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "grey.100",
          overflow: "hidden",
          "& > *": { flex: 1, minHeight: 0 },
        }}
      >
        {preview && previewUrl ? <AnexoPreview url={previewUrl} nome={preview.nome} /> : null}
      </DialogContent>
    </Dialog>
  );

  if (embedded) {
    return (
      <>
        {list}
        {previewDialog}
      </>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          ...paperSx,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} mb={1.5}>
          {hideTitle ? (
            <Box />
          ) : (
            <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={0.8}>
              Anexos
            </Typography>
          )}
          {editable ? (
            <>
              <input
                ref={inputRef}
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onAdd?.(file);
                }}
              />
              <Button
                size="small"
                variant="outlined"
                disabled={uploading}
                startIcon={<Icon name="mdi:paperclip-plus" width={18} />}
                onClick={() => inputRef.current?.click()}
                sx={{ textTransform: "none", ml: hideTitle ? "auto" : undefined }}
              >
                {uploading ? "Enviando…" : "Adicionar"}
              </Button>
            </>
          ) : null}
        </Stack>

        {list}
      </Paper>

      {previewDialog}
    </>
  );
}
