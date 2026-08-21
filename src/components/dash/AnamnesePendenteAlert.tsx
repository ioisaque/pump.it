import { Alert, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { LINK } from "utils/link";

export default function AnamnesePendenteAlert() {
  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button component={RouterLink} to={LINK("/anamnese")} color="inherit" size="small" sx={{ fontWeight: 700 }}>
          Responder
        </Button>
      }
    >
      Você ainda não respondeu o questionário pessoal.
    </Alert>
  );
}
