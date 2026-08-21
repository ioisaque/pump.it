import { Box, LinearProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "api/dashboard";
import AnamnesePendenteAlert from "components/dash/AnamnesePendenteAlert";
import DashStatsSection from "components/dash/DashStatsSection";

export default function MainDashboard() {
  const { data: stats, isLoading, isFetching } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
  });

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {stats?.scope === "self" ? "Seu resumo" : "Resumo da academia"}
      </Typography>

      {stats?.anamnese_pendente ? <AnamnesePendenteAlert /> : null}

      <DashStatsSection stats={stats} loading={isLoading} />

      {(isLoading || isFetching) && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
    </Box>
  );
}
