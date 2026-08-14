import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Paper,
    Radio,
    RadioGroup,
    Skeleton,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { Form } from "@unform/web";
import { addNotificacao } from "api/notificacoes";
import Chip from "components/Chip";
import FotoCropDialog from "components/FotoCropDialog";
import DateInput from "components/form/DateInput";
import Input from "components/form/Input";
import Icon from "components/Icon";
import UserAvatar from "components/UserAvatar";
import { hasAudienceFilter } from "domain/notificacoes/helpers";
import { NotificacaoAudiencia } from "domain/notificacoes/types";
import { PESSOA_LIST_TIPO } from "domain/pessoas/constants";
import { Pessoa } from "domain/pessoas/types";
import { Flag } from "domain/tabelas/types";
import { useFlagCatalogs } from "hooks/useFlagCatalogs";
import { useMobileDialog } from "hooks/useMobileDialog";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HORA, inputDateValue, NOW } from "utils/dates";

interface NotificacaoCreateDialogProps {
  open: boolean;
  onClose: () => void;
  academiaId?: number;
}

export default function NotificacaoCreateDialog({ open, onClose, academiaId }: NotificacaoCreateDialogProps) {
  const mobileDialog = useMobileDialog("md");
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const cropSrcRef = useRef<string | null>(null);
  const [sendNow, setSendNow] = useState(true);
  const [selectedNiveis, setSelectedNiveis] = useState<number[]>([]);
  const [selectedPessoas, setSelectedPessoas] = useState<Pessoa[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [activeMinutes, setActiveMinutes] = useState("");
  const [inactiveMinutes, setInactiveMinutes] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("foto.jpg");
  const [previewTitulo, setPreviewTitulo] = useState("");
  const [previewMensagem, setPreviewMensagem] = useState("");
  const [previewLink, setPreviewLink] = useState("");
  const [scheduledDate, setScheduledDate] = useState(() => inputDateValue(NOW().toISOString()));
  const [scheduledTime, setScheduledTime] = useState(() => HORA(NOW()));
  const { niveis, isLoading: niveisLoading, isError: niveisError } = useFlagCatalogs(["niveis"]);

  const { data: pessoasList } = useQuery({
    queryKey: ["pessoas", "list", academiaId],
    queryFn: () =>
      import("api/pessoas").then((m) =>
        m.listPessoas({ academia_id: academiaId, tipo: PESSOA_LIST_TIPO.ALL }),
      ),
    enabled: open,
    retry: 1,
  });

  const pessoasOptions = pessoasList?.pessoas ?? [];

  const initialData = useMemo(
    () => ({
      titulo: "",
      mensagem: "",
      link: "",
    }),
    [],
  );

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => addNotificacao(formData, { headers: { "Content-Type": "multipart/form-data" } }),
    onSuccess: async () => {
      toast.success("Notificação agendada!");
      closeDialog();
      await queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message) {
        const code = payload.statusCode != null ? `${payload.statusCode}: ` : "";
        toast.error(`${code}${payload.message}.`);
      } else {
        toast.error("Não foi possível agendar a notificação.");
      }
    },
  });

  function resetForm() {
    formRef.current?.reset();
    formRef.current?.setData(initialData);
    setSelectedNiveis([]);
    setSelectedPessoas([]);
    setOnlineOnly(false);
    setActiveMinutes("");
    setInactiveMinutes("");
    setFotoFile(null);
    setFotoPreview(null);
    setCropSrc(null);
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    setPreviewTitulo("");
    setPreviewMensagem("");
    setPreviewLink("");
    setScheduledDate(inputDateValue(NOW().toISOString()));
    setScheduledTime(HORA(NOW()));
    if (fotoInputRef.current) fotoInputRef.current.value = "";
    setSendNow(true);
  }

  function closeDialog() {
    onClose();
    resetForm();
  }

  function toggleNivel(id: number) {
    setSelectedNiveis((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  }

  useEffect(() => {
    return () => {
      if (cropSrcRef.current) {
        URL.revokeObjectURL(cropSrcRef.current);
        cropSrcRef.current = null;
      }
    };
  }, []);

  function applyFotoFile(file: File) {
    if (fotoPreview?.startsWith("blob:")) URL.revokeObjectURL(fotoPreview);
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function openFotoCrop(file: File) {
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    const url = URL.createObjectURL(file);
    cropSrcRef.current = url;
    setCropSrc(url);
    setCropFileName(file.name || "foto.jpg");
  }

  function closeFotoCrop() {
    if (cropSrcRef.current) {
      URL.revokeObjectURL(cropSrcRef.current);
      cropSrcRef.current = null;
    }
    setCropSrc(null);
  }

  function onFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    openFotoCrop(file);
  }

  function onFotoDrop(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    openFotoCrop(file);
  }

  async function handleSubmit(formData: Record<string, unknown>) {
    const titulo = String(formData.titulo ?? "").trim();
    const mensagem = String(formData.mensagem ?? "").trim();
    const link = String(formData.link ?? "").trim();

    if (!titulo) {
      toast.error("Informe o título.");
      return;
    }
    if (!mensagem) {
      toast.error("Informe a mensagem.");
      return;
    }
    if (!sendNow && (!scheduledDate || !scheduledTime)) {
      toast.error("Informe a data e hora.");
      return;
    }

    const audiencia: NotificacaoAudiencia = {};
    if (selectedPessoas.length > 0) {
      audiencia.pessoa_ids = selectedPessoas.map((p) => p.id);
    }
    if (selectedNiveis.length > 0) {
      audiencia.niveis = selectedNiveis;
    }
    if (onlineOnly) {
      audiencia.online_only = true;
    }
    const active = activeMinutes.trim() ? Number(activeMinutes) : 0;
    const inactive = inactiveMinutes.trim() ? Number(inactiveMinutes) : 0;
    if (active > 0) audiencia.active_within_minutes = active;
    if (inactive > 0) audiencia.inactive_within_minutes = inactive;

    if (!hasAudienceFilter(audiencia)) {
      toast.error("Informe ao menos um filtro de destinatários.");
      return;
    }

    const agendado_em = sendNow
      ? NOW().toISOString()
      : new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    const payload = new FormData();
    payload.append("titulo", titulo);
    payload.append("mensagem", mensagem);
    payload.append("audiencia", JSON.stringify(audiencia));
    payload.append("agendado_em", agendado_em);
    if (academiaId) payload.append("academia_id", String(academiaId));
    if (link) payload.append("link", link);
    if (fotoFile) payload.append("foto", fotoFile);

    await createMutation.mutateAsync(payload);
  }

  return (
    <>
    <Dialog open={open} onClose={closeDialog} scroll="paper" {...mobileDialog}>
      <DialogTitle sx={{ px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.50",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <Icon name="mdi:bell-plus-outline" width={22} height={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Nova notificação
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie a mensagem, escolha quem recebe e defina quando enviar
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "grey.50", px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Form
          ref={formRef}
          id="notificacaoForm"
          initialData={initialData}
          onSubmit={handleSubmit}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        >
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Icon name="mdi:text-box-edit-outline" color="primary.main" width={20} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    Conteúdo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Escreva uma mensagem curta e objetiva
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2} alignItems="stretch">
                <Grid item xs={12} sm={4}>
                  <input ref={fotoInputRef} type="file" accept="image/*" hidden onChange={onFotoChange} />
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{
                      height: "100%",
                      minHeight: 160,
                    }}
                  >
                    <UserAvatar
                      foto={fotoPreview}
                      name="Imagem da notificação"
                      size={112}
                      onClick={() => fotoInputRef.current?.click()}
                      onFotoDrop={onFotoDrop}
                      showUploadOnHover
                      fallbackIcon="mdi:image-plus-outline"
                    />
                    {fotoFile ? (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setFotoFile(null);
                          setFotoPreview(null);
                          if (fotoInputRef.current) fotoInputRef.current.value = "";
                        }}
                      >
                        Remover
                      </Button>
                    ) : null}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Stack spacing={1.5} height="100%">
                    <Input
                      name="titulo"
                      label="Título"
                      placeholder="Ex.: Manutenção programada"
                      onChange={(event) => setPreviewTitulo(event.target.value)}
                    />
                    <Input
                      name="mensagem"
                      label="Mensagem"
                      placeholder="Digite o texto que será exibido ao destinatário"
                      multiline
                      rows={4}
                      onChange={(event) => setPreviewMensagem(event.target.value)}
                    />
                    <Input
                      name="link"
                      label="Link de destino (opcional)"
                      placeholder="https://..."
                      onChange={(event) => setPreviewLink(event.target.value)}
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  bgcolor: "primary.50",
                  border: 1,
                  borderColor: "primary.light",
                }}
              >
                <Typography variant="body2" fontWeight={700} noWrap>
                  {previewTitulo || "Título da notificação"}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {previewMensagem || "A mensagem aparecerá aqui."}
                </Typography>
                {previewLink ? (
                  <Typography variant="caption" color="primary.main" noWrap display="block">
                    {previewLink}
                  </Typography>
                ) : null}
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Icon name="mdi:account-multiple-outline" color="secondary.main" width={20} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    Destinatários
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Selecione pessoas ou níveis. Os filtros informados são combinados.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1.25 }}>
                      Pessoas e níveis
                    </Typography>
                    <Autocomplete
                      multiple
                      options={pessoasOptions}
                      getOptionLabel={(option) => `${option.nome}${option.email ? ` (${option.email})` : ""}`}
                      value={selectedPessoas}
                      onChange={(_, value) => setSelectedPessoas(value)}
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Pessoas específicas"
                          placeholder="Busque por nome ou e-mail"
                          size="small"
                        />
                      )}
                    />

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5, mb: 0.75 }}>
                      Níveis de acesso
                    </Typography>
                    {niveisError ? (
                      <Alert severity="error">Não foi possível carregar os níveis.</Alert>
                    ) : niveisLoading ? (
                      <Stack direction="row" gap={1}>
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} variant="rounded" width={90} height={36} />
                        ))}
                      </Stack>
                    ) : (
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {(niveis ?? []).map((nivel: Flag) => (
                          <FormControlLabel
                            key={nivel.id}
                            control={
                              <Checkbox
                                size="small"
                                checked={selectedNiveis.includes(nivel.id)}
                                onChange={() => toggleNivel(nivel.id)}
                                color="primary"
                              />
                            }
                            label={<Chip icon={nivel.icon} color={nivel.color} text={nivel.nome} />}
                            sx={{
                              m: 0,
                              pr: 1,
                              border: 1,
                              borderColor: selectedNiveis.includes(nivel.id) ? "primary.main" : "divider",
                              borderRadius: 1.5,
                              bgcolor: selectedNiveis.includes(nivel.id) ? "primary.50" : "transparent",
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      height: "100%",
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                      Atividade
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={onlineOnly}
                          onChange={(_, checked) => setOnlineOnly(checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Somente online agora
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Apenas sessões conectadas
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, mb: 1.5 }}
                    />
                    <Stack spacing={1.5}>
                      <TextField
                        type="number"
                        label="Ativos nos últimos (minutos)"
                        size="small"
                        fullWidth
                        value={activeMinutes}
                        onChange={(e) => setActiveMinutes(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        type="number"
                        label="Inativos há mais de (minutos)"
                        size="small"
                        fullWidth
                        value={inactiveMinutes}
                        onChange={(e) => setInactiveMinutes(e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                <Icon name="mdi:clock-outline" color="warning.main" width={20} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                    Envio
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Envie imediatamente ou programe uma data
                  </Typography>
                </Box>
              </Stack>

              <RadioGroup
                value={sendNow ? "now" : "scheduled"}
                onChange={(_, value) => setSendNow(value === "now")}
                sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}
              >
                <FormControlLabel
                  value="now"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Enviar agora
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        A entrega começa ao confirmar
                      </Typography>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    px: 1,
                    py: 0.5,
                    border: 1,
                    borderColor: sendNow ? "warning.main" : "divider",
                    borderRadius: 1.5,
                    bgcolor: sendNow ? "warning.50" : "transparent",
                  }}
                />
                <FormControlLabel
                  value="scheduled"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Agendar
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Escolha quando a entrega será iniciada
                      </Typography>
                    </Box>
                  }
                  sx={{
                    m: 0,
                    px: 1,
                    py: 0.5,
                    border: 1,
                    borderColor: !sendNow ? "warning.main" : "divider",
                    borderRadius: 1.5,
                    bgcolor: !sendNow ? "warning.50" : "transparent",
                  }}
                />
              </RadioGroup>

              {!sendNow && (
                <Grid container spacing={1.5} sx={{ mt: 0 }}>
                  <Grid item xs={12} sm={6}>
                    <DateInput
                      label="Data do envio"
                      value={scheduledDate}
                      onChange={setScheduledDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="time"
                      label="Hora do envio"
                      value={scheduledTime}
                      onChange={(event) => setScheduledTime(event.target.value)}
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                    />
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Stack>
        </Form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: 1, borderColor: "divider" }}>
        <Button
          onClick={closeDialog}
          variant="contained"
          color="quinzel"
          startIcon={<Icon name="mdi:close" />}
          sx={{ minWidth: 120, height: 40 }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form="notificacaoForm"
          variant="contained"
          color={sendNow ? "success" : "warning"}
          disabled={createMutation.isLoading}
          startIcon={<Icon name={sendNow ? "mdi:send-outline" : "mdi:calendar-clock-outline"} />}
          sx={{ minWidth: 130, height: 40 }}
        >
          {sendNow ? "Enviar" : "Agendar"}
        </Button>
      </DialogActions>
    </Dialog>
    <FotoCropDialog
      open={Boolean(cropSrc)}
      imageSrc={cropSrc}
      fileName={cropFileName}
      onClose={closeFotoCrop}
      onConfirm={applyFotoFile}
    />
    </>
  );
}
