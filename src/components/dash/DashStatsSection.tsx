import { Button, Grid, Stack } from "@mui/material";
import type { DashboardStats } from "api/dashboard";
import StatCard from "components/dash/StatCard";
import Icon from "components/Icon";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import { Link as RouterLink } from "react-router-dom";
import { LINK } from "utils/link";

type DashStatsSectionProps = {
  stats: DashboardStats | undefined;
  loading: boolean;
};

export default function DashStatsSection({ stats, loading }: DashStatsSectionProps) {
  const { user } = useAuth();
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const self = stats?.scope === "self" || isCliente;
  const alunos = stats?.alunos ?? 0;
  const acessos = stats?.acessos_hoje ?? 0;
  const atraso = stats?.mensalidades_atraso ?? 0;
  const fichas = stats?.fichas ?? 0;

  return (
    <>
      {isCliente ? (
        <Stack direction="row" sx={{ mb: 2 }}>
          <Button
            component={RouterLink}
            to={LINK("/workout/add")}
            variant="contained"
            color="success"
            startIcon={<Icon name="mdi:login" />}
            sx={{ height: 40 }}
          >
            Check-in
          </Button>
        </Stack>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 2 }}>
      {!self && (
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Alunos"
            value={String(alunos)}
            subtitle="Ativos na academia"
            icon="mdi:account-group"
            color="#0076F3"
            loading={loading}
            to={LINK("/pessoas")}
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6} md={self ? 4 : 3}>
        <StatCard
          title="Check-ins hoje"
          value={String(acessos)}
          subtitle={self ? "Seus check-ins de hoje" : "Check-ins registrados hoje"}
          icon="mdi:login"
          color="#33CC66"
          loading={loading}
          to={LINK("/workouts")}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={self ? 4 : 3}>
        <StatCard
          title="Mensalidades em atraso"
          value={String(atraso)}
          subtitle={self ? "Suas mensalidades vencidas" : "Pendências em aberto"}
          icon="mdi:alert-circle"
          color="#FF5356"
          loading={loading}
          to={LINK("/mensalidades")}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={self ? 4 : 3}>
        <StatCard
          title="Planos de treino"
          value={String(fichas)}
          subtitle={self ? "Seus planos ativos" : "Planos de treino ativos"}
          icon="mdi:clipboard-list"
          color="#9900CC"
          loading={loading}
          to={LINK("/workout-plans")}
        />
      </Grid>
    </Grid>
    </>
  );
}
