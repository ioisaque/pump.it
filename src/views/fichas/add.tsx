import { Box, Button, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { addFicha } from "api/fichas";
import FichaForm from "components/fichas/FichaForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { fichasQueryKey } from "domain/fichas/constants";
import { FichaPayload } from "domain/fichas/types";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

const BTN_140 = { width: 140, height: 40 } as const;

export default function FichaAdd() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(payload: FichaPayload) {
    try {
      await addFicha(payload);
      toast.success("Plano de treino cadastrado.");
      await queryClient.invalidateQueries({ queryKey: fichasQueryKey });
      navigate(LINK("/workout-plans"), { replace: true });
    } catch {
      toast.error("Não foi possível salvar o plano de treino.");
    }
  }

  return (
    <Fragment>
      <EntityHeader
        left={
          <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
            <Icon name="mdi:clipboard-list-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Novo plano de treino
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preencha os dados para cadastrar
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="addFicha" variant="contained" color="info" sx={BTN_140}>
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
      <FichaForm formId="addFicha" onSubmit={handleSubmit} />
    </Fragment>
  );
}
