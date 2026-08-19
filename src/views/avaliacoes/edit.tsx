import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { findAvaliacao, saveAvaliacao } from "api/avaliacoes";
import AvaliacaoForm from "components/avaliacoes/AvaliacaoForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { avaliacaoToFormValues, buildAvaliacaoPayload } from "domain/avaliacoes/formatters";
import { AvaliacaoFormValues } from "domain/avaliacoes/types";
import useAuth from "hooks/useAuth";
import { Fragment, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;

export default function AvaliacaoEdit() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const avaliacaoId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);
  const { user } = useAuth();
  const academiaFromQuery = Number(searchParams.get("academia_id"));
  const pessoaFromQuery = Number(searchParams.get("pessoa"));
  const pessoaId = Number.isFinite(pessoaFromQuery) && pessoaFromQuery > 0 ? pessoaFromQuery : 0;
  const academiaId =
    user?.academia_id && user.academia_id > 0
      ? user.academia_id
      : academiaFromQuery > 0
        ? academiaFromQuery
        : undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["avaliacoes", avaliacaoId, academiaId],
    queryFn: () => findAvaliacao(avaliacaoId, academiaId ? { academia_id: academiaId } : undefined),
    enabled: Number.isInteger(avaliacaoId) && avaliacaoId > 0,
    retry: 1,
  });

  const initialData = useMemo(() => (data ? avaliacaoToFormValues(data) : undefined), [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => saveAvaliacao(avaliacaoId, payload),
    onSuccess: async () => {
      toast.success("Avaliação salva.");
      await queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      navigate(pessoaId > 0 ? LINK(`/pessoas/${pessoaId}/edit`) : LINK("/avaliacoes"));
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Falha ao salvar.");
    },
  });

  async function handleSubmit(formData: AvaliacaoFormValues) {
    const payload = buildAvaliacaoPayload(formData);
    if (!payload.data) {
      toast.error("Informe a data.");
      return;
    }
    await saveMutation.mutateAsync(payload);
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data || !initialData) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">Avaliação não encontrada.</Alert>
        <Button
          sx={{ mt: 2, width: 140, height: 40 }}
          variant="contained"
          color="quinzel"
          onClick={() => navigate(LINK("/avaliacoes"))}
        >
          <Icon name="undo" />
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:clipboard-pulse-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Avaliação: #{String(data.id).padStart(5, "0")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.pessoa_nome || `Pessoa #${data.id_pessoa}`}
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button
              type="submit"
              form="editAvaliacao"
              variant="contained"
              color="info"
              sx={BTN_140}
              disabled={saveMutation.isLoading}
            >
              <Icon name="mdi:content-save-outline" />
              Salvar
            </Button>
            <Button onClick={() => navigate(-1)} variant="contained" color="quinzel" sx={BTN_140}>
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />
      <AvaliacaoForm formId="editAvaliacao" formRef={formRef} initialData={initialData} onSubmit={handleSubmit} />
    </Fragment>
  );
}
