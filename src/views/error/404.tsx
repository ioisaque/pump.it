import { Box, Typography } from "@mui/material";

export default function StubPage() {
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5">404</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Stub — preencher no plano do módulo (onda 1).
      </Typography>
    </Box>
  );
}
