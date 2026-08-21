import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    TextField,
    Typography,
    keyframes,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { compactInputRootSx } from "components/form/inputGroupStyles";
import Icon from "components/Icon";
import useAuth from "hooks/useAuth";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LINK } from "utils/link";

const BRAND = {
  red: "#FF5356",
  green: "#33CC66",
  yellow: "#FFD22B",
} as const;

const floatY = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const softPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

export default function SessionRelogin() {
  const { sessionLocked, user, renewSession, logOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = sessionLocked && Boolean(user?.email);

  useEffect(() => {
    if (!open) {
      setSenha("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!senha.trim() || loading) return;
    setLoading(true);
    setError(null);
    const result = await renewSession(senha);
    setLoading(false);
    if (result.status >= 200 && result.status < 300) {
      setSenha("");
      await queryClient.invalidateQueries();
      return;
    }
    setError(result.status === 401 ? "Senha incorreta." : (result.message ?? "Não foi possível renovar a sessão."));
  }

  async function handleLogout() {
    const slug = user?.academia_slug;
    await logOut();
    navigate(LINK("/login", undefined, slug ?? null), { replace: true });
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      keepMounted={false}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(6px)",
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: 440,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: 3,
          pt: 4,
          pb: 3,
          color: "common.white",
          background: `linear-gradient(145deg, ${BRAND.red} 0%, #e8484b 55%, #d63d40 100%)`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          aspectRatio: "1 / 1",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: BRAND.yellow,
            top: -50,
            right: -40,
            animation: `${softPulse} 3.2s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            bgcolor: BRAND.green,
            bottom: -36,
            left: -28,
            animation: `${softPulse} 4s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: "relative",
            mx: "auto",
            mb: 1.5,
            display: "inline-flex",
            animation: `${floatY} 2.8s ease-in-out infinite`,
          }}
        >
          <Icon name="mdi:lock-outline" color="inherit" width={64} />
        </Box>
        <Typography variant="h5" fontWeight={800} letterSpacing={-0.3} sx={{ position: "relative" }}>
          Sessão expirada
        </Typography>
        <Typography
          variant="body1"
          sx={{ position: "relative", mt: 1, opacity: 0.92, maxWidth: 300, mx: "auto", lineHeight: 1.45 }}
        >
          Digite sua senha para continuar.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogActions sx={{ flexDirection: "column", gap: 1.5, px: 3, pt: 2.5, pb: 3, alignItems: "stretch" }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {user?.email}
          </Typography>
          {error && (
            <Alert severity="error" variant="outlined">
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            required
            size="small"
            type="password"
            name="senha"
            label="Senha"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            disabled={loading}
            sx={compactInputRootSx()}
          />
          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="success"
            disabled={loading || !senha.trim()}
            startIcon={<Icon name="mdi:lock-open-outline" width={22} />}
            sx={{
              py: 1.35,
              fontSize: "1rem",
              fontWeight: 700,
              bgcolor: BRAND.green,
              "&:hover": { bgcolor: "#2db85a" },
            }}
          >
            {loading ? "Entrando…" : "Entrar"}
          </Button>
          <Button fullWidth color="inherit" type="button" onClick={() => void handleLogout()} sx={{ fontWeight: 600 }}>
            Sair
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
