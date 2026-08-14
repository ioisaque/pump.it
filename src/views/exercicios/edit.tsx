import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import {
    addExercicioYoutubeAnexo,
    deleteExercicio,
    deleteExercicioAnexo,
    findExercicio,
    reorderExercicioAnexos,
    saveExercicio,
    uploadExercicioAnexo,
} from "api/exercicios";
import ExercicioAnexos from "components/exercicios/Anexos";
import { ExercicioEditFormFields } from "components/exercicios/EditForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { EXERCICIOS_QUERY_KEY, exercicioQueryKey } from "domain/exercicios/constants";
import { ExercicioFormData } from "domain/exercicios/types";
import { validateExercicioForm } from "domain/exercicios/validators";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const BTN_140 = { width: 140, height: 40 } as const;

export default function ExercicioEdit() {
  const { id } = useParams();
  const exercicioId = Number(id);
  const { base } = useTenantBase();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: exercicioQueryKey(exercicioId),
    queryFn: () => findExercicio(exercicioId),
    enabled: !!exercicioId,
  });

  useEffect(() => {
    if (!data) return;
    formRef.current?.setData({
      nome: data.nome,
      descricao: data.descricao ?? "",
      carga_inicial: data.carga_inicial != null ? String(data.carga_inicial) : "",
      musculos_ids: (data.musculos ?? []).map((item) => item.id),
    });
  }, [data]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadExercicioAnexo(exercicioId, file),
    onSuccess: async () => {
      toast.success("Anexo enviado.");
      await queryClient.invalidateQueries({ queryKey: exercicioQueryKey(exercicioId) });
    },
    onError: () => toast.error("Falha no upload."),
  });

  const youtubeMutation = useMutation({
    mutationFn: (url: string) => addExercicioYoutubeAnexo(exercicioId, url),
    onSuccess: async () => {
      toast.success("Vídeo do YouTube adicionado.");
      await queryClient.invalidateQueries({ queryKey: exercicioQueryKey(exercicioId) });
    },
    onError: () => toast.error("URL do YouTube inválida."),
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: number[]) => reorderExercicioAnexos(exercicioId, ids),
    onError: () => toast.error("Não foi possível salvar a ordem."),
  });

  const removeAnexoMutation = useMutation({
    mutationFn: (anexoId: number) => deleteExercicioAnexo(exercicioId, anexoId),
    onSuccess: async () => {
      toast.success("Anexo removido.");
      await queryClient.invalidateQueries({ queryKey: exercicioQueryKey(exercicioId) });
    },
    onError: () => toast.error("Não foi possível remover o anexo."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExercicio(exercicioId),
    onSuccess: async () => {
      toast.success("Exercício excluído.");
      await queryClient.invalidateQueries({ queryKey: EXERCICIOS_QUERY_KEY });
      navigate(`${base}/exercicios`);
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  async function onSubmit(values: ExercicioFormData) {
    const nextErrors = validateExercicioForm(values);
    if (Object.keys(nextErrors).length) {
      formRef.current?.setErrors(nextErrors);
      return;
    }
    formRef.current?.setErrors({});
    try {
      await saveExercicio(exercicioId, {
        nome: values.nome.trim(),
        descricao: values.descricao?.trim() || undefined,
        carga_inicial: values.carga_inicial?.trim() || null,
        status: data?.status,
        musculos_ids: values.musculos_ids ?? [],
      });
      await queryClient.invalidateQueries({ queryKey: EXERCICIOS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: exercicioQueryKey(exercicioId) });
      toast.success("Exercício atualizado.");
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">Exercício não encontrado.</Alert>
        <Button
          sx={{ mt: 2, width: 140, height: 40 }}
          variant="contained"
          color="quinzel"
          onClick={() => navigate(`${base}/exercicios`)}
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
            <Icon name="mdi:dumbbell" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Exercício: #{String(data.id).padStart(5, "0")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.nome}
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="editExercicio" variant="contained" color="info" sx={BTN_140}>
              <Icon name="mdi:content-save-outline" />
              Salvar
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={BTN_140}
              disabled={deleteMutation.isLoading}
              onClick={() => {
                if (window.confirm(`Excluir “${data.nome}”?`)) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Icon name="mdi:delete-outline" />
              Excluir
            </Button>
            <Button onClick={() => navigate(`${base}/exercicios`)} variant="contained" color="quinzel" sx={BTN_140}>
              <Icon name="undo" />
              Voltar
            </Button>
          </Stack>
        }
      />

      <ExercicioEditFormFields
        formId="editExercicio"
        formRef={formRef}
        initialData={{
          nome: data.nome,
          descricao: data.descricao ?? "",
          carga_inicial: data.carga_inicial != null ? String(data.carga_inicial) : "",
          musculos_ids: (data.musculos ?? []).map((item) => item.id),
        }}
        onSubmit={onSubmit}
      />

      <ExercicioAnexos
        anexos={data.anexos ?? []}
        editable
        uploading={uploadMutation.isLoading}
        addingYoutube={youtubeMutation.isLoading}
        onAdd={(file) => uploadMutation.mutate(file)}
        onAddYoutube={(url) => youtubeMutation.mutate(url)}
        onReorder={(ids) => reorderMutation.mutate(ids)}
        onRemove={(anexoId) => removeAnexoMutation.mutate(anexoId)}
      />
    </Fragment>
  );
}
