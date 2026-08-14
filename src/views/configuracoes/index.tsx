import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Form } from "@unform/web";
import { FormHandles } from "@unform/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppConfig, saveAppConfig } from "api/config";
import FormDateInput from "components/form/FormDateInput";
import Select from "components/form/Select";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import { MASTER_NIVEL_ID } from "domain/auth/constants";
import useAuth from "hooks/useAuth";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: "America/Sao_Paulo", label: "Brasília (UTC−3)" },
  { value: "America/Manaus", label: "Manaus (UTC−4)" },
  { value: "America/Cuiaba", label: "Cuiabá (UTC−4)" },
  { value: "America/Fortaleza", label: "Fortaleza (UTC−3)" },
  { value: "America/Belem", label: "Belém (UTC−3)" },
  { value: "America/Recife", label: "Recife (UTC−3)" },
  { value: "America/Bahia", label: "Salvador (UTC−3)" },
  { value: "America/Rio_Branco", label: "Rio Branco (UTC−5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (UTC−2)" },
  { value: "UTC", label: "UTC" },
];

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const isMaster = (user?.nivel ?? MASTER_NIVEL_ID) >= MASTER_NIVEL_ID;
  const queryClient = useQueryClient();
  const formRef = useRef<FormHandles>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["app-config"],
    queryFn: () => getAppConfig(),
    enabled: isMaster,
  });

  useEffect(() => {
    if (!data) return;
    formRef.current?.setData({
      timezone: data.timezone || "America/Sao_Paulo",
      current_date: data.current_date_override ?? "",
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (values: { timezone?: string; current_date?: string }) =>
      saveAppConfig({
        timezone: values.timezone || "America/Sao_Paulo",
        current_date: values.current_date?.trim() || null,
      }),
    onSuccess: async () => {
      toast.success("Configurações salvas.");
      await queryClient.invalidateQueries({ queryKey: ["app-config"] });
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message ?? "Não foi possível salvar as configurações.");
    },
  });

  if (!isMaster) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography variant="h5">Configurações</Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Acesso restrito a usuários Master.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <EntityHeader
        left={
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Icon name="mdi:cog-outline" color="primary.main" width={28} height={28} />
            <Box>
              <Typography variant="h5" lineHeight={1.2}>
                Configurações
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fuso horário e data efetiva da academia
              </Typography>
            </Box>
          </Stack>
        }
        right={
          <Button
            type="submit"
            form="appConfigForm"
            variant="contained"
            color="secondary"
            disabled={saveMutation.isLoading || isLoading}
            sx={{ height: 40 }}
          >
            Salvar
          </Button>
        }
      />

      {isError ? <Alert severity="error">Não foi possível carregar as configurações.</Alert> : null}

      <Card variant="outlined">
        <CardContent>
          <Form
            id="appConfigForm"
            ref={formRef}
            initialData={{
              timezone: data?.timezone || "America/Sao_Paulo",
              current_date: data?.current_date_override ?? "",
            }}
            onSubmit={(values: { timezone?: string; current_date?: string }) => saveMutation.mutate(values)}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            <Stack spacing={2}>
              <Select name="timezone" label="Fuso horário">
                {TIMEZONE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>

              <FormDateInput
                name="current_date"
                label="Data do sistema"
                clearable
                helperText="Vazio = dia real do relógio"
              />
            </Stack>
          </Form>

          {data ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", mt: 2 }}>
              Agora: {data.now} · academia_id: {data.academia_id ?? "—"}
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </Box>
  );
}
