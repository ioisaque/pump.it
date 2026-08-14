import {
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import Icon from "components/Icon";
import { MASTER_NIVEL_ID } from "domain/auth/constants";
import { ALUNO_NIVEL_MAX } from "domain/pessoas/constants";
import useAuth from "hooks/useAuth";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

type NavItem = {
  label: string;
  icon: string;
  path: string;
  masterOnly?: boolean;
  platformOnly?: boolean;
  tenantOnly?: boolean;
  /** Staff+ (esconde de cliente/aluno). */
  staffOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "line-md:home-twotone", path: "" },
  // Gerais: master em `/` ou `/plataforma` sem slug; tenant com `/:slug`
  { label: "Pessoas", icon: "accounts", path: "/pessoas", staffOnly: true },
  { label: "Exercícios", icon: "mdi:dumbbell", path: "/exercicios", tenantOnly: true },
  { label: "Fichas", icon: "mdi:clipboard-list-outline", path: "/fichas", tenantOnly: true },
  { label: "Avaliações", icon: "mdi:clipboard-pulse-outline", path: "/avaliacoes", tenantOnly: true },
  { label: "Check-ins", icon: "mdi:door-open", path: "/acessos", tenantOnly: true },
  { label: "Mensalidades", icon: "mdi:cash-multiple", path: "/mensalidades", tenantOnly: true },
  { label: "Tabelas", icon: "mdi:table-cog", path: "/tabelas", staffOnly: true },
  { label: "Notificações", icon: "notifications", path: "/notificacoes", staffOnly: true },
  { label: "Configurações", icon: "mdi:cog-outline", path: "/configuracoes", masterOnly: true },
  { label: "Academias", icon: "mdi:domain", path: "/plataforma/academias", platformOnly: true, masterOnly: true },
];

const SISTEMA_ITEMS: NavItem[] = [
  { label: "Catálogo de telas", icon: "mdi:view-dashboard-outline", path: "/sistema/telas" },
  { label: "Integrações", icon: "mdi:connection", path: "/sistema/integracoes" },
];

function resolveTo(base: string, path: string, platformOnly?: boolean) {
  if (platformOnly) return path;
  if (!path) return base || "/";
  return `${base}${path}`;
}

function pathSelected(pathname: string, to: string) {
  if (to === "/" || to === "") return pathname === "/" || /^\/[^/]+\/?$/.test(pathname);
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function UserBarNav() {
  const theme = useTheme();
  const { user } = useAuth();
  const { base, academiaSlug } = useTenantBase();
  const location = useLocation();
  const isMaster = (user?.nivel ?? 0) >= MASTER_NIVEL_ID;
  const isCliente = (user?.nivel ?? 0) <= ALUNO_NIVEL_MAX;
  const isTenant = Boolean(academiaSlug);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const showLabels = useMediaQuery(theme.breakpoints.up("lg"));

  const [sistemaAnchorEl, setSistemaAnchorEl] = useState<null | HTMLElement>(null);
  const sistemaOpen = Boolean(sistemaAnchorEl?.isConnected);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.masterOnly && !isMaster) return false;
        if (item.staffOnly && isCliente) return false;
        if (item.platformOnly && isTenant) return false;
        // Dados de academia (fichas/acessos/…): só com slug no path
        if (item.tenantOnly && !isTenant) return false;
        // Itens gerais (pessoas/tabelas/notificações): master sem slug ou tenant com slug
        if (!item.tenantOnly && !item.platformOnly && !item.masterOnly && !isTenant && !isMaster) {
          return false;
        }
        return true;
      }),
    [isMaster, isTenant, isCliente],
  );

  const sistemaLinks = useMemo(
    () =>
      SISTEMA_ITEMS.map((item) => ({
        ...item,
        to: resolveTo(base, item.path),
      })),
    [base],
  );

  useEffect(() => {
    setSistemaAnchorEl(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sistemaAnchorEl && !sistemaAnchorEl.isConnected) {
      setSistemaAnchorEl(null);
    }
  });

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  if (isMobile) {
    return (
      <Fragment>
        <IconButton color="inherit" size="small" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}>
          <Icon name="mdi:menu" />
        </IconButton>
        <Drawer
          anchor="top"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              height: "100dvh",
              maxHeight: "100dvh",
              width: "100%",
              borderRadius: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Menu
            </Typography>
            <IconButton color="inherit" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}>
              <Icon name="majesticons:close" />
            </IconButton>
          </Box>
          <List sx={{ py: 1, overflow: "auto" }}>
            {visibleItems.map((item) => {
              const to = resolveTo(base, item.path, item.platformOnly);
              return (
                <ListItemButton
                  key={to}
                  component={RouterLink}
                  to={to}
                  selected={pathSelected(location.pathname, to)}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon name={item.icon} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
            {(isTenant || isMaster) && !isCliente && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListSubheader disableSticky sx={{ bgcolor: "transparent", lineHeight: 2.5 }}>
                  Sistema
                </ListSubheader>
                {sistemaLinks.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    selected={location.pathname.startsWith(item.to)}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon name={item.icon} />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
        </Drawer>
      </Fragment>
    );
  }

  return (
    <Fragment>
      {visibleItems.map((item) => {
        const to = resolveTo(base, item.path, item.platformOnly);
        return showLabels ? (
          <Button key={to} component={RouterLink} to={to} color="inherit" size="small" startIcon={<Icon name={item.icon} />}>
            {item.label}
          </Button>
        ) : (
          <Tooltip key={to} title={item.label}>
            <IconButton component={RouterLink} to={to} color="inherit" size="small" aria-label={item.label}>
              <Icon name={item.icon} />
            </IconButton>
          </Tooltip>
        );
      })}

      {(isTenant || isMaster) && !isCliente &&
        (showLabels ? (
          <Button
            color="inherit"
            size="small"
            startIcon={<Icon name="settings" />}
            onClick={(event) => setSistemaAnchorEl(event.currentTarget)}
          >
            Sistema
          </Button>
        ) : (
          <Tooltip title="Sistema">
            <IconButton
              color="inherit"
              size="small"
              aria-label="Sistema"
              onClick={(event) => setSistemaAnchorEl(event.currentTarget)}
            >
              <Icon name="settings" />
            </IconButton>
          </Tooltip>
        ))}

      <Menu anchorEl={sistemaAnchorEl} open={sistemaOpen} onClose={() => setSistemaAnchorEl(null)}>
        {sistemaLinks.map((item) => (
          <MenuItem key={item.to} component={RouterLink} to={item.to} onClick={() => setSistemaAnchorEl(null)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Fragment>
  );
}
