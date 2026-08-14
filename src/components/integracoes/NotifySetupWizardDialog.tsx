import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import notifyItLogoLight from "assets/providers/notify-it-logo-light.svg";
import Chip from "components/Chip";
import NotifySetupWizardStepContent from "components/integracoes/NotifySetupWizardStepContent";
import { NotifyConfigPublic } from "domain/integracoes/types";
import { useMobileDialog } from "hooks/useMobileDialog";
import useNotifySetupWizard from "hooks/useNotifySetupWizard";

type NotifySetupWizardDialogProps = {
  open: boolean;
  onClose: () => void;
  initial: NotifyConfigPublic;
};

export default function NotifySetupWizardDialog({ open, onClose, initial }: NotifySetupWizardDialogProps) {
  const mobileDialog = useMobileDialog("sm");
  const wizard = useNotifySetupWizard({ open, onClose, initial });
  const { step, setStep, theme, STEPS, stepIndex, connection, pushReady, credentialsReady, setupMutation, finish, next, onClose: closeWizard } = wizard;

  return (
    <Dialog
      open={open}
      onClose={closeWizard}
      {...mobileDialog}
      PaperProps={{
        sx: {
          overflow: "hidden",
          borderTop: `6px solid ${theme.main}`,
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          backgroundColor: theme.main,
          color: "#fff",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              component="img"
              src={notifyItLogoLight}
              alt="notify.it"
              sx={{ height: 32, display: "block" }}
            />
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                Conectar notify.it
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.92 }}>
                Mail + Push
                {connection === "success" ? " · conectado" : connection === "testing" ? " · testando…" : ""}
              </Typography>
            </Box>
          </Stack>
          <Chip icon={theme.icon} bgColor="rgba(255,255,255,0.22)" txtColor="#fff" nome="notify.it" />
        </Stack>
      </Box>

      <DialogTitle sx={{ pb: 0, pt: 2 }}>
        <Stepper activeStep={stepIndex < 0 ? 0 : stepIndex} alternativeLabel sx={{ mb: 1 }}>
          {STEPS.map((s) => (
            <Step key={s.key} completed={STEPS.findIndex((x) => x.key === step) > STEPS.findIndex((x) => x.key === s.key)}>
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
          value={((stepIndex + 1) / STEPS.length) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            bgcolor: theme.light,
            "& .MuiLinearProgress-bar": { bgcolor: theme.main },
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "#f4f1e6", minHeight: 280, pt: 2 }}>
        <NotifySetupWizardStepContent
          step={wizard.step}
          theme={wizard.theme}
          initial={wizard.initial}
          webhookDisponivel={wizard.webhookDisponivel}
          apiKey={wizard.apiKey}
          apiKeySaved={wizard.apiKeySaved}
          setApiKey={wizard.setApiKey}
          connection={wizard.connection}
          connectionDetail={wizard.connectionDetail}
          pushStatus={wizard.pushStatus}
          pushReady={wizard.pushReady}
          setupResult={wizard.setupResult}
          showApiKey={wizard.showApiKey}
          setShowApiKey={wizard.setShowApiKey}
          revealedApiKey={wizard.revealedApiKey}
          setRevealedApiKey={wizard.setRevealedApiKey}
          testMutation={wizard.testMutation}
          setupMutation={wizard.setupMutation}
          revealMutation={wizard.revealMutation}
          activatePush={wizard.activatePush}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#fafafa" }}>
        {stepIndex > 0 && step !== "done" && (
          <Button onClick={() => setStep(STEPS[stepIndex - 1].key)}>Voltar</Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={closeWizard}>Fechar</Button>
        {step === "done" ? (
          <Button variant="contained" onClick={closeWizard} sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}>
            Concluir
          </Button>
        ) : step === "setup" ? (
          <Button
            variant="contained"
            onClick={() => void finish()}
            disabled={setupMutation.isLoading || !wizard.webhookDisponivel}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Concluir integração
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
          <Button
            variant="contained"
            onClick={next}
            disabled={!pushReady}
            sx={{ bgcolor: theme.main, "&:hover": { bgcolor: theme.dark } }}
          >
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
