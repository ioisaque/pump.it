import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { findFicha, saveFicha } from "api/fichas";
import FichaForm from "components/fichas/FichaForm";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { fichaQueryKey, fichasQueryKey } from "domain/fichas/constants";
import { FichaPayload } from "domain/fichas/types";
import useTenantBase from "hooks/useTenantBase";
import { Fragment } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const BTN_140 = { width: 140, height: 40 } as const;

export default function FichaEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const fichaId = Number(id);
  const { base } = useTenantBase();

  const { data, isLoading, error } = useQuery({
    queryKey: fichaQueryKey(fichaId),
    queryFn: () => findFicha(fichaId),
    enabled: Number.isFinite(fichaId) && fichaId > 0,
    retry: 1,
  });

  async function handleSubmit(payload: FichaPayload) {
    try {
      await saveFicha(fichaId, payload);
      toast.success("Ficha salva.");
      await queryClient.invalidateQueries({ queryKey: fichasQueryKey });
      await queryClient.invalidateQueries({ queryKey: fichaQueryKey(fichaId) });
      navigate(`${base}/fichas`, { replace: true });
    } catch {
      toast.error("Não foi possível salvar a ficha.");
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="error">Ficha não encontrada.</Alert>
        <Button
          sx={{ mt: 2, width: 140, height: 40 }}
          variant="contained"
          color="quinzel"
          onClick={() => navigate(`${base}/fichas`)}
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
            <Icon name="mdi:clipboard-list-outline" color="secondary.main" />
            <Box minWidth={0}>
              <Typography variant="subtitle2" color="secondary.main" fontWeight={600}>
                Ficha: #{String(data.id).padStart(5, "0")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.nome}
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
            <Button type="submit" form="editFicha" variant="contained" color="info" sx={BTN_140}>
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
      <FichaForm formId="editFicha" initial={data} onSubmit={handleSubmit} />
    </Fragment>
  );
}
