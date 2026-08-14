import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

function hubPath(academiaSlug: string | undefined, path: string) {
  const base = academiaSlug ? `/${academiaSlug}` : "";
  return `${base}${path}`;
}

export default function SistemaHubPage() {
  const { academiaSlug } = useParams();

  const links = [
    { to: hubPath(academiaSlug, "/sistema/telas"), title: "Telas", desc: "Catálogo visual de componentes" },
    {
      to: hubPath(academiaSlug, "/sistema/integracoes"),
      title: "Integrações",
      desc: "Asaas, Mercado Pago e notify.it por academia",
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5">Sistema</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Hub de administração da plataforma
      </Typography>
      <Stack spacing={1.5}>
        {links.map((item) => (
          <Card key={item.to} variant="outlined">
            <CardActionArea component={RouterLink} to={item.to}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
