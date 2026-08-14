import { Box, LinearProgress, List, ListItem, ListItemText, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { listTelas } from "api/integracoes";

export default function SistemaTelasPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sistema", "telas"],
    queryFn: () => listTelas(),
  });

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5">Telas</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Catálogo de rotas do sistema (stub)
      </Typography>
      {isLoading ? (
        <LinearProgress />
      ) : (
        <List dense>
          {(data?.screens ?? []).map((screen) => (
            <ListItem key={screen.id} divider>
              <ListItemText primary={screen.nome} secondary={screen.path} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
