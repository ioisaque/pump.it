import { Box, Typography } from "@mui/material";
import Chip from "components/Chip";
import { NotificacaoDestinatario } from "domain/notificacoes/types";
import { Flag, resolveFlag } from "domain/tabelas/types";
import { DATA_HORA } from "utils/dates";

interface DestinatarioRowProps {
  item: NotificacaoDestinatario;
  niveis?: Flag[];
}

export default function DestinatarioRow({ item, niveis }: DestinatarioRowProps) {
  const nivelMeta = resolveFlag(item.nivel, niveis);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {item.nome}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {item.email ?? "Sem e-mail"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
        {nivelMeta ? <Chip icon={nivelMeta.icon} color={nivelMeta.color} text={nivelMeta.nome} /> : null}
        {item.lida === true ? (
          <Typography variant="caption" color="success.main">
            Abriu {(DATA_HORA(item.lida_em, true) || "—")}
          </Typography>
        ) : item.lida === false ? (
          <Typography variant="caption" color="warning.main">
            Não abriu
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Aguardando envio
          </Typography>
        )}
      </Box>
    </Box>
  );
}
