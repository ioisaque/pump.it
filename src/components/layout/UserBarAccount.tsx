import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "components/Icon";
import UserAvatar from "components/UserAvatar";
import { NotificacaoInboxItem } from "domain/notificacoes/types";
import useAuth from "hooks/useAuth";
import { usePessoa } from "hooks/usePessoa";
import useTenantBase from "hooks/useTenantBase";
import { Fragment, useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

export default function UserBarAccount() {
  const { user, logOut } = useAuth();
  const { data: pessoa } = usePessoa(user?.id);
  const { base } = useTenantBase();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setAnchorEl(null);
  }, [location.pathname]);

  const { data: inboxData, isLoading: inboxLoading, isError: inboxError } = useQuery({
    queryKey: ["notificacoes", "inbox"],
    queryFn: async () => {
      const { getInbox } = await import("api/notificacoes");
      return getInbox();
    },
    enabled: Boolean(user),
    retry: 1,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => import("api/notificacoes").then((m) => m.markInboxRead(id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => import("api/notificacoes").then((m) => m.markAllInboxRead()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notificacoes", "inbox"] });
    },
  });

  const inbox: NotificacaoInboxItem[] = inboxData?.inbox ?? [];
  const naoLidas: number = inboxData?.nao_lidas ?? 0;
  const naoLidasItems = inbox.filter((item) => !item.lida);
  const lidasItems = inbox.filter((item) => item.lida);

  function handleInboxItemClick(item: NotificacaoInboxItem) {
    if (!item.lida) markReadMutation.mutate(item.id);
  }

  async function handleLogout() {
    await logOut();
    navigate(base ? `${base}/login` : "/login", { replace: true });
  }

  return (
    <Fragment>
      <Tooltip title={user?.email ?? ""}>
        <Badge
          color="error"
          badgeContent={naoLidas}
          max={99}
          invisible={naoLidas === 0}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          overlap="circular"
        >
          <IconButton
            id="user-avatar"
            aria-label="Minha conta"
            aria-controls={open ? "avatar-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            color="inherit"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{
              p: 0,
              border: "none",
              outline: "none",
              boxShadow: "none",
              "&:hover": { backgroundColor: "transparent" },
              "&:focus, &:focus-visible": {
                outline: "none",
                backgroundColor: "transparent",
              },
            }}
          >
            <UserAvatar
              foto={pessoa?.foto}
              instagram={pessoa?.instagram}
              name={pessoa?.nome}
              size={40}
            />
          </IconButton>
        </Badge>
      </Tooltip>
      <Menu
        id="avatar-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        MenuListProps={{ "aria-labelledby": "user-avatar" }}
        PaperProps={{ sx: { width: 360, maxWidth: "95vw", maxHeight: 520 } }}
      >
        <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Notificações
          </Typography>
          {naoLidas > 0 && (
            <Button size="small" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isLoading}>
              Marcar todas lidas
            </Button>
          )}
        </Box>
        <Divider />

        {inboxLoading ? (
          <MenuItem disabled>Carregando...</MenuItem>
        ) : inboxError ? (
          <MenuItem disabled>Não foi possível carregar a inbox.</MenuItem>
        ) : inbox.length === 0 ? (
          <MenuItem disabled>Nenhuma notificação recebida.</MenuItem>
        ) : (
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {naoLidasItems.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleInboxItemClick(item)}
                sx={{ alignItems: "flex-start", whiteSpace: "normal", py: 1.25, bgcolor: "action.hover" }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {item.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.mensagem}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            {naoLidasItems.length > 0 && lidasItems.length > 0 && <Divider />}
            {lidasItems.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleInboxItemClick(item)}
                sx={{ alignItems: "flex-start", whiteSpace: "normal", py: 1.25, opacity: 0.72 }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {item.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.mensagem}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        <Divider />
        <MenuItem
          component={RouterLink}
          to={user?.id ? `${base}/pessoas/${user.id}/edit` : `${base}/pessoas`}
          onClick={() => setAnchorEl(null)}
          disabled={!user?.id}
        >
          <ListItemIcon>
            <Icon name="badge" />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem
          onClick={() => {
            void handleLogout();
          }}
        >
          <ListItemIcon>
            <Icon name="logout" />
          </ListItemIcon>
          Finalizar Sessão
        </MenuItem>
      </Menu>
    </Fragment>
  );
}
