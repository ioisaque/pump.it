import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { deleteAcademia, findAcademia, saveAcademia } from "api/academias";
import axios from "axios";
import AcademiaForm from "components/academias/AcademiaForm";
import Chip from "components/Chip";
import Icon from "components/Icon";
import LastUpdated from "components/LastUpdated";
import EntityHeader from "components/layout/EntityHeader";
import { useMobileDialog } from "hooks/useMobileDialog";
import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { apiOrigin } from "services/api";
import {
    academiaAddressQuery,
    academiaToFormData,
    buildAcademiaFormInitialData,
    buildAcademiaPayload,
} from "utils/academias/form";

const btnSx = { height: 50, minWidth: 50, px: 1 } as const;

function formatAcademiaShortId(id: string | number): string {
  return String(id).padStart(4, "0");
}

export default function AcademiaEditPage() {
  const { id } = useParams();
  const academiaId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const listPath = "/plataforma/academias";
  const deleteDialog = useMobileDialog("sm");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const formRef = useRef<FormHandles>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoObjectUrlRef = useRef<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["academias", academiaId],
    queryFn: () => findAcademia(academiaId),
    enabled: Number.isFinite(academiaId) && academiaId > 0,
    retry: 1,
  });

  const academia = data?.academia;
  const formInitialData = useMemo(
    () => (academia ? buildAcademiaFormInitialData(academia) : {}),
    [academia],
  );
  const mapQuery = useMemo(() => (academia ? academiaAddressQuery(academia) : null), [academia]);

  const codigo = formatAcademiaShortId(id ?? "");
  const deleteConfirmed = deleteConfirmation.trim() === codigo;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!academia?.id) throw new Error("Academia inválida.");
      await deleteAcademia(academia.id);
    },
    onSuccess: async () => {
      toast.success("Academia excluída.");
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["academias"] });
      navigate(listPath);
    },
    onError: (err: unknown) => {
      const apiMessage = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(
        typeof apiMessage === "string" && apiMessage.trim()
          ? apiMessage
          : "Não foi possível excluir a academia.",
      );
    },
  });

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current);
        logoObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (logoFile) return;
    if (!academia?.logo) {
      setLogoPreview(null);
      return;
    }
    setLogoPreview(
      academia.logo.startsWith("http")
        ? academia.logo
        : `${apiOrigin()}${academia.logo.startsWith("/") ? academia.logo : `/${academia.logo}`}`,
    );
  }, [academia, logoFile]);

  useEffect(() => {
    if (!Number.isFinite(academiaId) || academiaId <= 0) {
      toast.error("Academia inválida.");
      navigate(listPath);
      return;
    }
    if (isLoading) return;
    if (isError) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) return;
      toast.error("Não foi possível carregar a academia.");
      navigate(listPath);
      return;
    }
    if (!academia && !isFetching) {
      toast.error("Academia não encontrada.");
      navigate(listPath);
    }
  }, [academiaId, isLoading, isFetching, isError, error, academia, navigate, listPath]);

  function applyLogoFile(file: File) {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    logoObjectUrlRef.current = objectUrl;
    setLogoFile(file);
    setLogoPreview(objectUrl);
  }

  function onLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyLogoFile(file);
  }

  function onLogoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyLogoFile(file);
  }

  async function handleSubmit(data: Record<string, unknown>) {
    if (!academia?.id) return;
    const nome = String(data.nome ?? "").trim();
    const slug = String(data.slug ?? "").trim();
    if (!nome || !slug) {
      toast.error("Informe nome e slug.");
      return;
    }
    setSaving(true);
    try {
      const payload = buildAcademiaPayload(data);
      const formData = academiaToFormData(payload, logoFile);
      await saveAcademia(academia.id, formData);
      toast.success("Academia salva");
      setLogoFile(null);
      await queryClient.invalidateQueries({ queryKey: ["academias"] });
      await queryClient.invalidateQueries({ queryKey: ["academias", academiaId] });
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(typeof msg === "string" && msg.trim() ? msg : "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (!Number.isFinite(academiaId) || academiaId <= 0) {
    return <Alert severity="error">Academia inválida.</Alert>;
  }

  if (isLoading && !academia) {
    return (
      <Fragment>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={`skeleton-${i}`} variant="rounded" width="100%" height={50} sx={{ margin: "10px 0px" }} />
        ))}
      </Fragment>
    );
  }

  if (isError || !academia) {
    return null;
  }

  const statusActive = academia.status === "ACTIVE";

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0} sx={{ width: "100%" }}>
            <Tooltip title={statusActive ? "Ativa" : "Bloqueada"} arrow>
              <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
                <Icon
                  name={statusActive ? "mdi:check-circle" : "mdi:block-helper"}
                  color={statusActive ? "success.main" : "error.main"}
                  width={40}
                  height={40}
                />
              </Box>
            </Tooltip>
            <Box minWidth={0}>
              <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle1" color="primary.main" fontWeight={700} lineHeight={1.2}>
                  Academia: #{formatAcademiaShortId(id ?? "")}
                </Typography>
                <Chip icon="mdi:link-variant" color="#0076F3" text={academia.slug} />
              </Stack>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25 }}>
                <LastUpdated entity={academia} />
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Tooltip title="Abrir sistema">
              <Button
                variant="contained"
                color="secondary"
                sx={btnSx}
                href={`/${academia.slug}/`}
                aria-label="Abrir sistema"
              >
                <Icon name="majesticons:open" width={30} />
              </Button>
            </Tooltip>
            <Tooltip title="Salvar">
              <Button
                type="submit"
                form="editAcademia"
                variant="contained"
                color="info"
                sx={btnSx}
                disabled={saving}
                aria-label="Salvar"
              >
                <Icon name="mdi:content-save-outline" width={30} />
              </Button>
            </Tooltip>
            <Tooltip title="Excluir academia">
              <Button
                variant="contained"
                color="error"
                sx={btnSx}
                disabled={deleteMutation.isLoading}
                aria-label="Excluir academia"
                onClick={() => {
                  setDeleteConfirmation("");
                  setDeleteDialogOpen(true);
                }}
              >
                <Icon name="mdi:delete-outline" width={30} />
              </Button>
            </Tooltip>
            <Tooltip title="Voltar">
              <Button
                onClick={() => navigate(listPath)}
                variant="contained"
                color="quinzel"
                sx={btnSx}
                aria-label="Voltar"
              >
                <Icon name="undo" width={30} />
              </Button>
            </Tooltip>
          </Stack>
        }
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteMutation.isLoading) setDeleteDialogOpen(false);
        }}
        aria-labelledby="delete-academia-title"
        {...deleteDialog}
        PaperProps={{ sx: { overflow: "hidden" } }}
      >
        <DialogTitle
          id="delete-academia-title"
          sx={{ bgcolor: "error.main", color: "error.contrastText", py: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Icon name="mdi:alert-octagon" width={30} />
            <Box>
              <Typography variant="h6" component="div" fontWeight={800}>
                Excluir academia definitivamente
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Ação destrutiva e irreversível
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Isso apaga a academia #{codigo} ({academia.nome}). Não há como desfazer.
          </Alert>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Digite <strong>{codigo}</strong> para confirmar:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={codigo}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isLoading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteConfirmed || deleteMutation.isLoading}
            onClick={() => deleteMutation.mutate()}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Form
        ref={formRef}
        key={`edit-academia-${academia.id}`}
        id="editAcademia"
        initialData={formInitialData}
        onSubmit={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={onLogoChange} />
        <AcademiaForm
          formRef={formRef}
          showStatus
          mapQuery={mapQuery}
          logoPreview={logoPreview}
          onPickLogo={() => logoInputRef.current?.click()}
          onLogoDrop={onLogoDrop}
        />
      </Form>
    </Fragment>
  );
}
