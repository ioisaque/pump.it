import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import Icon from "components/Icon";
import EntityHeader from "components/layout/EntityHeader";
import FlagManagement, { FlagManagementFlag } from "components/tabelas/FlagManagement";

type TabelaPanelDef = {
  id: string;
  flag: FlagManagementFlag;
  title: string;
  description: string;
  icon: string;
  gridMd: 6 | 12;
};

type TabelaGroup = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  surface: string;
  border: string;
  panels: TabelaPanelDef[];
};

/** Pump only exposes pessoas catalogs (no planos/faturas/contratos/métodos). */
const GROUPS: TabelaGroup[] = [
  {
    id: "pessoas",
    title: "Pessoas",
    subtitle: "Níveis, origens, etiquetas e estados do cadastro",
    icon: "accounts",
    accent: "primary.main",
    surface: "primary.50",
    border: "primary.light",
    panels: [
      {
        id: "niveis",
        flag: "niveis",
        title: "Níveis",
        description: "Hierarquia e classificação de pessoas",
        icon: "mdi:stairs",
        gridMd: 6,
      },
      {
        id: "origens",
        flag: "origens",
        title: "Origens",
        description: "Como a pessoa chegou até você",
        icon: "mdi:source-branch",
        gridMd: 6,
      },
      {
        id: "etiquetas",
        flag: "etiquetas",
        title: "Etiquetas",
        description: "Marcadores visuais para pessoas",
        icon: "mdi:tag-outline",
        gridMd: 6,
      },
      {
        id: "status-pessoas",
        flag: "status:pessoas",
        title: "Status",
        description: "Estados do cadastro de pessoas",
        icon: "label",
        gridMd: 6,
      },
    ],
  },
  {
    id: "exercicios",
    title: "Exercícios",
    subtitle: "Catálogo de músculos trabalhados",
    icon: "mdi:dumbbell",
    accent: "secondary.main",
    surface: "secondary.50",
    border: "secondary.light",
    panels: [
      {
        id: "musculos",
        flag: "musculos",
        title: "Músculos",
        description: "Grupos musculares usados no cadastro de exercícios",
        icon: "mdi:arm-flex",
        gridMd: 12,
      },
    ],
  },
];

function TabelaPanel({ panel, group }: { panel: TabelaPanelDef; group: TabelaGroup }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderColor: group.border,
        borderTopWidth: 4,
        borderTopStyle: "solid",
        borderTopColor: group.accent,
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, "&:last-child": { pb: 2 } }}>
        <FlagManagement
          flag={panel.flag}
          title={panel.title}
          description={panel.description}
          icon={panel.icon}
          color={group.accent}
          surfaceColor={group.surface}
        />
      </CardContent>
    </Card>
  );
}

function TabelasDashboard() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <EntityHeader
        left={
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Icon name="table_chart" color="secondary.main" width={28} height={28} />
            <Box>
              <Typography variant="h5" lineHeight={1.2}>
                Tabelas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Catálogos auxiliares organizados por entidade
              </Typography>
            </Box>
          </Stack>
        }
      />

      {GROUPS.map((group) => (
        <Box key={group.id}>
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{
              mb: 2,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              bgcolor: group.surface,
              borderLeft: 4,
              borderColor: group.accent,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "background.paper",
                color: group.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 1,
              }}
            >
              <Icon name={group.icon} width={20} height={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color={group.accent} lineHeight={1.2}>
                {group.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.subtitle}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {group.panels.map((panel) => (
              <Grid item xs={12} md={panel.gridMd} key={panel.id}>
                <TabelaPanel panel={panel} group={group} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

export default TabelasDashboard;
