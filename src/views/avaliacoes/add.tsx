import { Box, Button, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { FormHandles } from "@unform/core";
import { addAvaliacao } from "api/avaliacoes";
import AvaliacaoForm from "components/avaliacoes/AvaliacaoForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { buildAvaliacaoPayload } from "domain/avaliacoes/formatters";
import { AvaliacaoFormValues } from "domain/avaliacoes/types";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BTN_140 = { width: 140, height: 40 } as const;

export default function AvaliacaoAdd() {
  const navigate = useNavigate();
  const { base } = useTenantBase();
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);
  const { user } = useAuth();

  const initialData = useMemo<AvaliacaoFormValues>(
    () => ({
      academia_id: user?.academia_id && user.academia_id > 0 ? user.academia_id : "",
      id_pessoa: "",
      data: "",
      peso_kg: "",
      altura_cm: "",
      observacoes: "",
    }),
    [user?.academia_id],
  );

  async function handleSubmit(data: AvaliacaoFormValues) {
    try {
      const payload = buildAvaliacaoPayload(data);
      if (!payload.id_pessoa) {
        toast.error("Informe a pessoa.");
        return;
      }
      if (!payload.data) {
        toast.error("Informe a data.");
        return;
      }
      await addAvaliacao(payload);
      toast.success("Avaliação criada.");
      await queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      navigate(`${base}/avaliacoes`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Falha ao criar avaliação.");
    }
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:clipboard-pulse-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Nova avaliação
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preencha os dados para cadastrar
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="addAvaliacao" variant="contained" color="info" sx={BTN_140}>
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
      <AvaliacaoForm formId="addAvaliacao" formRef={formRef} initialData={initialData} onSubmit={handleSubmit} />
    </Fragment>
  );
}
