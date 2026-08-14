import {
    Alert,
    Box,
    Card,
    CardContent,
    FormControlLabel,
    Skeleton,
    Stack,
    Switch,
    Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotificacaoEventConfig, patchNotificacaoEventConfig } from "api/notificacoes";
import Icon from "components/Icon";
import { NotificacaoEventConfig } from "domain/notificacoes/types";
import { useState } from "react";
import toast from "react-hot-toast";

const CATEGORY_ICON: Record<string, string> = {
  perfil: "mdi:account-circle-outline",
};

interface EventKillswitchCardProps {
  isMaster: boolean;
}

export default function EventKillswitchCard({ isMaster }: EventKillswitchCardProps) {
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notificacoes", "config"],
    queryFn: getNotificacaoEventConfig,
    enabled: isMaster,
    retry: 1,
  });

  const patchMutation = useMutation({
    mutationFn: (events: Partial<NotificacaoEventConfig>) =>
      patchNotificacaoEventConfig(events),
    onMutate: async (events) => {
      const key = Object.keys(events)[0] ?? null;
      setSavingKey(key);
      await queryClient.cancelQueries({ queryKey: ["notificacoes", "config"] });
      const previous = queryClient.getQueryData(["notificacoes", "config"]);
      if (previous && typeof previous === "object") {
        const prev = previous as { events: NotificacaoEventConfig };
        queryClient.setQueryData(["notificacoes", "config"], {
          ...prev,
          events: { ...prev.events, ...events },
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notificacoes", "config"], context.previous);
      }
      toast.error("Não foi possível atualizar o evento.");
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["notificacoes", "config"], result);
    },
    onSettled: () => {
      setSavingKey(null);
    },
  });

  if (!isMaster) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        height: 600,
        mb: 2,
        flexShrink: 0,
        overflow: "hidden",
        borderColor: "divider",
        borderTopWidth: 4,
        borderTopStyle: "solid",
        borderTopColor: "primary.main",
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          "&:last-child": { pb: 2 },
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.50",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <Icon name="mdi:toggle-switch-outline" width={20} height={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              Eventos automáticos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.35 }}>
              Killswitch master por tipo de evento. Desligado bloqueia o envio globalmente.
            </Typography>
          </Box>
        </Stack>

        {error ? (
          <Alert
            severity="error"
            action={
              <Typography
                component="button"
                variant="body2"
                onClick={() => refetch()}
                sx={{
                  border: 0,
                  background: "none",
                  p: 0,
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Tentar de novo
              </Typography>
            }
          >
            Não foi possível carregar a configuração de eventos.
          </Alert>
        ) : null}

        {isLoading || !data ? (
          <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <Skeleton variant="rounded" height={88} />
            <Skeleton variant="rounded" height={88} />
          </Stack>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
            <Stack spacing={2}>
              {data.catalog.map((category) => (
                <Box key={category.id}>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Icon
                      name={CATEGORY_ICON[category.id] ?? "mdi:bell-outline"}
                      width={18}
                      height={18}
                      color="text.secondary"
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {category.label}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.75}>
                    {category.events.map((event) => {
                      const enabled = data.events[event.key] !== false;
                      const busy = savingKey === event.key && patchMutation.isLoading;
                      return (
                        <Stack
                          key={event.key}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          gap={1.5}
                          sx={{
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {event.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {event.description}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={enabled}
                                disabled={busy}
                                color="success"
                                onChange={(_, v) =>
                                  patchMutation.mutate({ [event.key]: v })
                                }
                              />
                            }
                            label=""
                            sx={{ m: 0, flexShrink: 0 }}
                          />
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
