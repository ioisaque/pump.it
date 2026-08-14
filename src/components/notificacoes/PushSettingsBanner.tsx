import { Alert, Button } from "@mui/material";
import { usePushNotifications } from "hooks/usePushNotifications";

export default function PushSettingsBanner() {
  const { status: pushStatus, enablePush } = usePushNotifications();

  if (pushStatus === "subscribed" || pushStatus === "unsupported") {
    return null;
  }

  return (
    <Alert
      severity="error"
      sx={{ mb: 2, flexShrink: 0, alignItems: "center" }}
      action={
        <Button color="inherit" size="small" onClick={() => void enablePush()}>
          Ativar push
        </Button>
      }
    >
      Push notifications não estão ativas neste dispositivo. Clique para ativar e receber mensagens.
    </Alert>
  );
}
