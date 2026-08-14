import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { listAcademias } from "api/academias";
import { desvincularFichaAluno, listFichas, vincularFichaAluno } from "api/fichas";
import { deletePessoa } from "api/pessoas";
import axios from "axios";
import Chip from "components/Chip";
import Icon from "components/Icon";
import LastUpdated from "components/LastUpdated";
import EntityHeader from "components/layout/EntityHeader";
import EditForm from "components/pessoas/EditForm";
import { MASTER_NIVEL_ID } from "domain/auth/constants";
import { formatPadraoLabel } from "domain/fichas/formatters";
import { Ficha } from "domain/fichas/types";
import { resolveFlags } from "domain/tabelas/types";
import useAuth from "hooks/useAuth";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMobileDialog } from "hooks/useMobileDialog";
import { usePessoa } from "hooks/usePessoa";
import useTenantBase from "hooks/useTenantBase";
import { ChangeEvent, Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { apiOrigin } from "services/api";
import { buildPessoaFormInitialData, submitPessoaUpdate } from "utils/pessoas/form";
import { pessoaSectionSx } from "utils/pessoas/styles";

const btnSx = { height: 50, minWidth: 50, px: 1 } as const;

function formatPessoaShortId(id: string | number): string {
  return String(id).padStart(4, "0");
}

function PessoaFichas({ pessoaId }: { pessoaId: number }) {
  const { base } = useTenantBase();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modeloId, setModeloId] = useState("");

  const { data: fichas = [], isLoading } = useQuery({
    queryKey: ["fichas", "pessoa", pessoaId],
    queryFn: () => listFichas({ id_pessoa: pessoaId }),
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["fichas", "modelos"],
    queryFn: () => listFichas({ escopo: "modelos" }),
  });

  const vincular = useMutation({
    mutationFn: (fichaId: number) => vincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Ficha vinculada.");
      setModeloId("");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível vincular a ficha."),
  });

  const desvincular = useMutation({
    mutationFn: (fichaId: number) => desvincularFichaAluno(fichaId, pessoaId),
    onSuccess: async () => {
      toast.success("Ficha desvinculada.");
      await queryClient.invalidateQueries({ queryKey: ["fichas", "pessoa", pessoaId] });
    },
    onError: () => toast.error("Não foi possível desvincular."),
  });

  const jaVinculados = new Set(fichas.map((f) => f.id));
  const disponiveis = modelos.filter((m) => !jaVinculados.has(m.id));

  return (
    <Box sx={{ ...pessoaSectionSx, mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap gap={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Fichas
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Select
            size="small"
            displayEmpty
            value={modeloId}
            onChange={(e) => setModeloId(String(e.target.value))}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">
              <em>Escolher modelo</em>
            </MenuItem>
            {disponiveis.map((m) => (
              <MenuItem key={m.id} value={String(m.id)}>
                {m.nome} ({formatPadraoLabel(String(m.padrao))})
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="success"
            disabled={!modeloId || vincular.isLoading}
            onClick={() => vincular.mutate(Number(modeloId))}
          >
            Vincular
          </Button>
        </Stack>
      </Stack>
      {isLoading ? (
        <Skeleton variant="rounded" height={48} />
      ) : fichas.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma ficha vinculada. Escolha um modelo acima.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {fichas.map((ficha: Ficha) => (
            <Stack
              key={ficha.id}
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Box minWidth={0}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {ficha.nome}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPadraoLabel(String(ficha.padrao))}
                  {ficha.modelo ? " · modelo" : " · personalizada"}
                  {(ficha.alunos_count ?? 0) > 1 ? ` · ${ficha.alunos_count} alunos` : ""}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="info"
                  onClick={() => navigate(`${base}/fichas/${ficha.id}/edit?pessoa=${pessoaId}`)}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  disabled={desvincular.isLoading}
                  onClick={() => desvincular.mutate(ficha.id)}
                >
                  Desvincular
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function PessoaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const listPath = `${base}/pessoas`;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const deleteDialog = useMobileDialog("sm");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const canDelete = Number(user?.nivel ?? 0) >= 9;
  const isMaster = (user?.nivel ?? 0) >= MASTER_NIVEL_ID;

  const {
    data: pessoa,
    isLoading,
    isFetching,
    isError,
    error,
  } = usePessoa(id);

  const { status: allStatus, niveis: allNiveis, origens: allOrigens, etiquetas: allEtiquetas } =
    useFlagCatalogs(["status", "niveis", "origens", "etiquetas"]);

  const { data: academiasData } = useQuery({
    queryKey: ["academias"],
    queryFn: listAcademias,
    enabled: isMaster,
  });
  const academias = academiasData?.academias ?? [];

  const formInitialData = useMemo(() => (pessoa ? buildPessoaFormInitialData(pessoa) : {}), [pessoa]);
  const formRef = useRef<FormHandles>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const fotoObjectUrlRef = useRef<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const codigoPessoa = formatPessoaShortId(id ?? "");
  const deleteConfirmed = deleteConfirmation.trim() === codigoPessoa;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!pessoa?.id) throw new Error("Pessoa inválida.");
      await deletePessoa(pessoa.id);
    },
    onSuccess: async () => {
      toast.success("Pessoa excluída.");
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["pessoas"] });
      navigate(listPath);
    },
    onError: (err: unknown) => {
      const apiMessage = axios.isAxiosError(err) ? err.response?.data?.message : null;
      toast.error(
        typeof apiMessage === "string" && apiMessage.trim()
          ? apiMessage
          : "Não foi possível excluir a pessoa.",
      );
    },
  });

  useEffect(() => {
    return () => {
      if (fotoObjectUrlRef.current) {
        URL.revokeObjectURL(fotoObjectUrlRef.current);
        fotoObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fotoFile) return;
    if (!pessoa) {
      setFotoPreview(null);
      return;
    }
    if (!pessoa.foto) {
      setFotoPreview(null);
      return;
    }
    setFotoPreview(
      pessoa.foto.startsWith("http")
        ? pessoa.foto
        : `${apiOrigin()}${pessoa.foto.startsWith("/") ? pessoa.foto : `/${pessoa.foto}`}`,
    );
  }, [pessoa, fotoFile]);

  function applyFotoFile(file: File) {
    if (fotoObjectUrlRef.current) {
      URL.revokeObjectURL(fotoObjectUrlRef.current);
      fotoObjectUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    fotoObjectUrlRef.current = objectUrl;
    setFotoFile(file);
    setFotoPreview(objectUrl);
  }

  function onFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyFotoFile(file);
  }

  function onFotoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    applyFotoFile(file);
  }

  useEffect(() => {
    if (!id) {
      toast.error("ID da pessoa ausente na URL.");
      navigate(listPath);
      return;
    }

    if (isLoading) return;

    if (isError) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) return;
      toast.error("Não foi possível carregar a pessoa.");
      navigate(listPath);
      return;
    }

    if (!pessoa && !isFetching) {
      toast.error("Pessoa não encontrada.");
      navigate(listPath);
    }
  }, [id, isLoading, isFetching, isError, error, pessoa, navigate, listPath]);

  async function handleSubmit(data: Record<string, unknown>) {
    if (!pessoa?.id) return;
    await submitPessoaUpdate(data, pessoa, { queryClient, navigate, listPath, fotoFile });
  }

  if (isLoading && id) {
    return (
      <Fragment>
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={`skeleton-${i}`} variant="rounded" width="100%" height={50} sx={{ margin: "10px 0px" }} />
        ))}
      </Fragment>
    );
  }

  if (!id || isError || !pessoa) {
    return null;
  }

  const { status: statusMeta, nivel: nivelMeta } = resolveFlags(
    pessoa,
    ["status", "nivel"],
    [allStatus, allNiveis],
  );

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0} sx={{ width: "100%" }}>
            <Tooltip title={statusMeta?.nome ?? "Status"} arrow>
              <Box component="span" sx={{ display: "inline-flex", flexShrink: 0 }}>
                <Icon
                  name={statusMeta?.icon ?? "mdi:check-circle"}
                  color={statusMeta?.color ?? "text.secondary"}
                  width={40}
                  height={40}
                />
              </Box>
            </Tooltip>
            <Box minWidth={0}>
              <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle1" color="primary.main" fontWeight={700} lineHeight={1.2}>
                  Pessoa: #{formatPessoaShortId(id)}
                </Typography>
                <Chip
                  icon={nivelMeta?.icon ?? "person"}
                  color={nivelMeta?.color ?? "#757575"}
                  text={nivelMeta?.nome ?? "Desconhecido"}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.25 }}>
                <LastUpdated entity={pessoa} />
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Tooltip title="Salvar">
              <Button type="submit" form="editPessoa" variant="contained" color="info" sx={btnSx} aria-label="Salvar">
                <Icon name="mdi:content-save-outline" width={30} />
              </Button>
            </Tooltip>
            {canDelete ? (
              <Tooltip title="Excluir pessoa">
                <Button
                  variant="contained"
                  color="error"
                  sx={btnSx}
                  disabled={deleteMutation.isLoading}
                  aria-label="Excluir pessoa"
                  onClick={() => {
                    setDeleteConfirmation("");
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Icon name="mdi:delete-outline" width={30} />
                </Button>
              </Tooltip>
            ) : null}
            <Tooltip title="Voltar">
              <Button
                onClick={() => navigate(-1)}
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
        aria-labelledby="delete-pessoa-title"
        {...deleteDialog}
        PaperProps={{ sx: { overflow: "hidden" } }}
      >
        <DialogTitle
          id="delete-pessoa-title"
          sx={{ bgcolor: "error.main", color: "error.contrastText", py: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Icon name="mdi:alert-octagon" width={30} />
            <Box>
              <Typography variant="h6" component="div" fontWeight={800}>
                Excluir pessoa definitivamente
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Ação destrutiva e irreversível
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Isso apaga a pessoa #{codigoPessoa} ({pessoa.nome}). Não há como desfazer.
          </Alert>
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            Digite o código <strong>{codigoPessoa}</strong> para confirmar:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={codigoPessoa}
            inputProps={{ autoComplete: "off", spellCheck: false }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="contained"
            color="quinzel"
            disabled={deleteMutation.isLoading}
            sx={{ width: 120 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => deleteMutation.mutate()}
            variant="contained"
            color="error"
            disabled={!deleteConfirmed || deleteMutation.isLoading}
            sx={{ width: 140 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Form
        ref={formRef}
        key={`edit-pessoa-${pessoa.id}`}
        id="editPessoa"
        initialData={formInitialData}
        onSubmit={handleSubmit}
        placeholder={undefined}
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
      >
        <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={onFotoChange} />
        <EditForm
          formRef={formRef}
          pessoa={pessoa}
          catalogs={{ origens: allOrigens, etiquetas: allEtiquetas, niveis: allNiveis, academias }}
          fotoPreview={fotoPreview}
          onPickFoto={() => fotoInputRef.current?.click()}
          onFotoDrop={onFotoDrop}
        />
      </Form>
      <PessoaFichas pessoaId={pessoa.id} />
    </Fragment>
  );
}

export default PessoaEdit;
