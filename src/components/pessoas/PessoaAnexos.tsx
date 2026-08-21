import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export type PessoaAnexo = { id: string; name: string };

function sameAnexos(a: PessoaAnexo[], b: PessoaAnexo[]) {
  if (a.length !== b.length) return false;
  return a.every((item, i) => item.id === b[i]?.id && item.name === b[i]?.name);
}

function fileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "mdi:file-pdf-box";
  if (/\.(png|jpe?g|gif|webp)$/.test(lower)) return "mdi:file-image-outline";
  return "mdi:file-outline";
}

export function PessoaAnexosLista({ items }: { items: PessoaAnexo[] }) {
  if (!items.length) return null;
  return (
    <Stack spacing={1} sx={{ width: "100%", maxWidth: { xs: "100%", sm: 300 }, flexShrink: 0 }}>
      {items.map((item) => (
        <Stack
          key={item.id}
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{
            px: 1.5,
            py: 1.25,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            minWidth: 0,
          }}
        >
          <Icon name={fileIcon(item.name)} width={28} height={28} />
          <Typography variant="body2" fontWeight={600} noWrap title={item.name} sx={{ flex: 1, minWidth: 0 }}>
            {item.name}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function PessoaAnexosDialog({
  open,
  onClose,
  saved,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  saved: PessoaAnexo[];
  onSave: (items: PessoaAnexo[]) => void;
}) {
  const [draft, setDraft] = useState<PessoaAnexo[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dirty = !sameAnexos(draft, saved);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const next = Array.from(list).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
    }));
    setDraft((prev) => [...prev, ...next]);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionProps={{ onEnter: () => setDraft(saved.map((item) => ({ ...item }))) }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography variant="h6" fontWeight={700} component="span">
            Anexos
          </Typography>
          <Chip
            bgColor={dirty ? "#FFD22B" : "#33CC66"}
            txtColor={dirty ? "#111" : "#fff"}
            text={dirty ? "Não salvo" : "Salvo"}
            fontSize="78%"
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept="application/pdf,image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button
          fullWidth
          variant="contained"
          color="info"
          startIcon={<Icon name="mdi:plus" width={22} />}
          onClick={() => inputRef.current?.click()}
          sx={{ textTransform: "none", height: 48, mb: 2 }}
        >
          Adicionar arquivos
        </Button>
        {draft.length === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Icon name="mdi:file-document-outline" width={36} height={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Nenhum arquivo
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {draft.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                gap={1.25}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  bgcolor: "rgba(0,0,0,0.02)",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  minWidth: 0,
                }}
              >
                <Icon name={fileIcon(item.name)} width={28} height={28} />
                <Typography variant="body2" fontWeight={600} noWrap title={item.name} sx={{ flex: 1, minWidth: 0 }}>
                  {item.name}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Remover"
                  onClick={() => setDraft((prev) => prev.filter((x) => x.id !== item.id))}
                >
                  <Icon name="mdi:trash-can-outline" width={20} height={20} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={!dirty}
          onClick={() => {
            onSave(draft.map((item) => ({ ...item })));
            onClose();
            toast.success(draft.length ? "Anexos salvos." : "Anexos atualizados.");
          }}
          startIcon={<Icon name="mdi:content-save-outline" />}
          sx={{ textTransform: "none", height: 40 }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
