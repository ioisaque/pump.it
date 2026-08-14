import { Alert, Avatar, Box, Dialog, DialogContent, DialogTitle, Grid, Skeleton, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findNotificacao } from "api/notificacoes";
import Chip from "components/Chip";
import ActionIcon from "components/data-table/ActionIcon";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import DestinatarioRow from "components/notificacoes/DestinatarioRow";
import { audienciaSummary, notificacaoFotoUrl } from "domain/notificacoes/helpers";
import {
    NOTIFICACAO_STATUS_COLOR,
    NOTIFICACAO_STATUS_LABEL,
    NotificacaoStatus,
} from "domain/notificacoes/types";
import { Flag } from "domain/tabelas/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import { Fragment } from "react";
import { DATA_HORA } from "utils/dates";
import { pessoaSectionSx } from "utils/pessoas/styles";

interface NotificacaoDetailDialogProps {
  notificacaoId: number | null;
  open: boolean;
  onClose: () => void;
  niveis?: Flag[];
  academiaId?: number;
}

export function NotificacaoDetailDialog({ notificacaoId, open, onClose, niveis, academiaId }: NotificacaoDetailDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notificacao", notificacaoId, academiaId],
    queryFn: () => findNotificacao(notificacaoId as number, academiaId),
    enabled: open && notificacaoId != null,
    retry: 1,
  });

  const notificacao = data?.notificacao;
  const status = notificacao?.status as NotificacaoStatus | undefined;
  const fotoUrl = notificacaoFotoUrl(notificacao?.foto);
  const mobileDialog = useMobileDialog("md");

  return (
    <Dialog open={open} onClose={onClose} scroll="paper" {...mobileDialog}>
      <DialogTitle sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ width: "100%", "& > .MuiGrid-container": { mb: 0 } }}>
          <EntityHeader
            left={
              <Fragment>
                <Icon name="notifications" color="primary.main" />
                <Grid item xs={6} fontSize={11}>
                  <Grid color="primary.main">Detalhes da notificação</Grid>
                  <Grid color="neutral">
                    {notificacao ? `#${notificacao.id}` : "Carregando..."}
                    {status != null ? (
                      <Fragment>
                        {" · "}
                        <Chip
                          icon={status === 2 ? "check_circle" : status === 1 ? "schedule" : "cancel"}
                          color={NOTIFICACAO_STATUS_COLOR[status]}
                          text={NOTIFICACAO_STATUS_LABEL[status]}
                        />
                      </Fragment>
                    ) : null}
                  </Grid>
                </Grid>
              </Fragment>
            }
            right={
              <ActionIcon
                icon="majesticons:close"
                color="error.main"
                to="#close"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
              />
            }
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#f4f1e6", p: 2 }}>
        {isLoading ? (
          <Box>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={`detail-skeleton-${i}`} variant="rounded" width="100%" height={64} sx={{ mb: 1.5 }} />
            ))}
          </Box>
        ) : isError || !data ? (
          <Alert severity="error">Não foi possível carregar os detalhes.</Alert>
        ) : (
          <Fragment>
            <Box sx={{ ...pessoaSectionSx, mb: 2 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 1.5 }}>
                <Avatar src={fotoUrl} variant="rounded" sx={{ width: 72, height: 72 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {data.notificacao.titulo}
                  </Typography>
                  <Chip
                    icon="notifications_active"
                    color="#1976d2"
                    text="Push + inbox"
                  />
                </Box>
              </Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Mensagem
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {data.notificacao.mensagem}
              </Typography>
              {data.notificacao.link ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <a href={data.notificacao.link} target="_blank" rel="noopener noreferrer">
                    {data.notificacao.link}
                  </a>
                </Typography>
              ) : null}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Agendado: {(DATA_HORA(data.notificacao.agendado_em, true) || "—")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enviado: {(DATA_HORA(data.notificacao.enviado_em, true) || "—")}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                Audiência: {audienciaSummary(data.notificacao.audiencia, niveis)}
              </Typography>
            </Box>

            {data.previstos ? (
              <Box sx={{ ...pessoaSectionSx, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Destinatários previstos ({data.destinatarios.length})
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {data.destinatarios.map((item) => (
                    <DestinatarioRow key={item.id_pessoa} item={item} niveis={niveis} />
                  ))}
                </Box>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={pessoaSectionSx}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="warning.main">
                      Não abriram ({data.nao_lidas.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {data.nao_lidas.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Todos já abriram.
                        </Typography>
                      ) : (
                        data.nao_lidas.map((item) => (
                          <DestinatarioRow key={item.id_pessoa} item={item} niveis={niveis} />
                        ))
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={pessoaSectionSx}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main">
                      Abriram ({data.lidas.length})
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {data.lidas.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Ninguém abriu ainda.
                        </Typography>
                      ) : (
                        data.lidas.map((item) => <DestinatarioRow key={item.id_pessoa} item={item} niveis={niveis} />)
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
