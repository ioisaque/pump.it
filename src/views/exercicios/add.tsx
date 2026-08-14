import { Box, Button, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { addExercicio } from "api/exercicios";
import Icon from "components/Icon";
import { ExercicioEditFormFields } from "components/exercicios/EditForm";
import EntityHeader from "components/layout/EntityHeader";
import { EXERCICIO_STATUS, EXERCICIOS_QUERY_KEY } from "domain/exercicios/constants";
import { ExercicioFormData } from "domain/exercicios/types";
import { validateExercicioForm } from "domain/exercicios/validators";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BTN_140 = { width: 140, height: 40 } as const;

export default function ExercicioAdd() {
  const { base } = useTenantBase();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);

  async function onSubmit(values: ExercicioFormData) {
    const nextErrors = validateExercicioForm(values);
    if (Object.keys(nextErrors).length) {
      formRef.current?.setErrors(nextErrors);
      return;
    }
    formRef.current?.setErrors({});
    try {
      const exercicio = await addExercicio({
        nome: values.nome.trim(),
        descricao: values.descricao?.trim() || undefined,
        carga_inicial: values.carga_inicial?.trim() || undefined,
        status: EXERCICIO_STATUS.ACTIVE,
        musculos_ids: values.musculos_ids ?? [],
      });
      await queryClient.invalidateQueries({ queryKey: EXERCICIOS_QUERY_KEY });
      toast.success("Exercício criado.");
      navigate(`${base}/exercicios/${exercicio.id}`);
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:dumbbell" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Novo exercício
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preencha os dados para cadastrar
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="addExercicio" variant="contained" color="info" sx={BTN_140}>
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

      <ExercicioEditFormFields
        formId="addExercicio"
        formRef={formRef}
        initialData={{ nome: "", descricao: "", carga_inicial: "" }}
        onSubmit={onSubmit}
      />
    </Fragment>
  );
}
