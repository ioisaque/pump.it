import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import Chip from "components/Chip";
import Icon from "components/Icon";
import AsaasSetupWizardStepContent from "components/integracoes/AsaasSetupWizardStepContent";
import { AsaasConfigPublic } from "domain/integracoes/types";
import useAsaasSetupWizard from "hooks/useAsaasSetupWizard";
import { useMobileDialog } from "hooks/useMobileDialog";

type AsaasSetupWizardDialogProps = {
  open: boolean;
  onClose: () => void;
  initial: AsaasConfigPublic;
};

export default function AsaasSetupWizardDialog({ open, onClose, initial }: AsaasSetupWizardDialogProps) {
  const mobileDialog = useMobileDialog("sm");
  const wizard = useAsaasSetupWizard({ open, onClose, initial });
  const {
    step,
    setStep,
    theme,
    connection,
    visibleSteps,
    stepIndex,
    isLocal,
    credentialsReady,
    saveMutation,
    finish,
    next,
  } = wizard;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      {...mobileDialog}
      PaperProps={{
        sx: {
          overflow: "hidden",
          borderTop: `6px solid ${theme.main}`,
          transition: "border-color 0.35s ease",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: `linear-gradient(120deg, ${theme.main} 0%, ${theme.dark} 100%)`,
          color: "#fff",
          transition: "background 0.35s ease",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="mdi:bank-outline" color="#fff" width={26} height={26} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Conectar Asaas
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 0.25 }}>
                <Icon name={theme.icon} color="#fff" width={16} height={16} />
                <Typography variant="caption" sx={{ opacity: 0.92 }}>
                  {theme.label}
                  {connection === "success" ? " · conectado" : connection === "testing" ? " · testando…" : ""}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Chip icon={theme.icon} bgColor="rgba(255,255,255,0.22)" txtColor="#fff" nome={theme.label} />
        </Stack>
      </Box>

      <DialogTitle sx={{ pb: 0, pt: 2 }}>
        <Stepper activeStep={stepIndex < 0 ? 0 : stepIndex} alternativeLabel sx={{ mb: 1 }}>
          {visibleSteps.map((s) => (
            <Step key={s.key} completed={visibleSteps.findIndex((x) => x.key === step) > visibleSteps.findIndex((x) => x.key === s.key)}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    "&.Mui-active": { color: theme.main },
                    "&.Mui-completed": { color: theme.main },
                  },
                }}
              >
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <LinearProgress
          variant="determinate"
          value={((stepIndex + 1) / visibleSteps.length) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: theme.light,
            "& .MuiLinearProgress-bar": { bgcolor: theme.main, transition: "transform 0.4s ease" },
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#f4f1e6", minHeight: 300, pt: 2 }}>
        <AsaasSetupWizardStepContent
          step={step}
          theme={wizard.theme}
          sandboxTheme={wizard.sandboxTheme}
          producaoTheme={wizard.producaoTheme}
          isLocal={wizard.isLocal}
          initial={wizard.initial}
          ambiente={wizard.ambiente}
          setAmbiente={wizard.setAmbiente}
          apiKey={wizard.apiKey}
          setApiKey={wizard.setApiKey}
          syncPessoas={wizard.syncPessoas}
          setSyncPessoas={wizard.setSyncPessoas}
          syncFaturas={wizard.syncFaturas}
          setSyncFaturas={wizard.setSyncFaturas}
          webhookHabilitado={wizard.webhookHabilitado}
          setWebhookHabilitado={wizard.setWebhookHabilitado}
          connection={wizard.connection}
          connectionDetail={wizard.connectionDetail}
          syncedConta={wizard.syncedConta}
          showApiKey={wizard.showApiKey}
          setShowApiKey={wizard.setShowApiKey}
          revealedApiKey={wizard.revealedApiKey}
          setRevealedApiKey={wizard.setRevealedApiKey}
          testMutation={wizard.testMutation}
          webhookMutation={wizard.webhookMutation}
          revealMutation={wizard.revealMutation}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fafafa" }}>
        {stepIndex > 0 && step !== "done" && (
          <Button onClick={() => setStep(visibleSteps[stepIndex - 1].key)}>Voltar</Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Fechar</Button>
        {step === "done" ? (
          <Button variant="contained" onClick={onClose} sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}>
            Concluir
          </Button>
        ) : step === "webhook" ? (
          <Button
            variant="contained"
            onClick={() => void finish()}
            disabled={saveMutation.isLoading}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Salvar e concluir
          </Button>
        ) : step === "toggles" && isLocal ? (
          <Button
            variant="contained"
            onClick={() => void finish()}
            disabled={saveMutation.isLoading}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Concluir
          </Button>
        ) : step === "credentials" ? (
          <Button
            variant="contained"
            onClick={next}
            disabled={!credentialsReady}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Próximo
          </Button>
        ) : (
          <Button variant="contained" onClick={next} sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}>
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
