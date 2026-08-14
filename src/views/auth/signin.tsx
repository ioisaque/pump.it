import { Alert, Box, Button, Link, TextField, Typography, useMediaQuery } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { findAcademiaPublic } from "api/academias";
import { SignInStyles } from "assets/css/auth";
import { BlobGreen, BlobRed, BlobYellow } from "assets/css/main";
import UserAvatar from "components/UserAvatar";
import { User } from "contexts/AuthContext";
import useAuth from "hooks/useAuth";
import jwtDecode from "jwt-decode";
import { useLayoutEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { HTTP_RESPONSE } from "services/api";
import { applyAppChrome, applyPageChrome } from "utils/app-chrome";
import { LINK } from "utils/link";

export default function SignInPage() {
  const { logIn, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { academiaSlug } = useParams();
  const [response, setResponse] = useState<HTTP_RESPONSE | null>(null);
  const [loading, setLoading] = useState(false);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

  const { data: academia } = useQuery({
    queryKey: ["auth", "academia", academiaSlug],
    queryFn: () => findAcademiaPublic(academiaSlug!),
    enabled: Boolean(academiaSlug),
    retry: 1,
  });

  const bg = prefersDark ? "#000000" : "#FFFFFF";
  const linkColor = prefersDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
  const subtitleColor = prefersDark ? "rgba(255,255,255,0.65)" : "rgba(26,26,26,0.6)";
  const logoColor = prefersDark ? "#FFFFFF" : "#1a1a1a";
  const fieldSx = prefersDark
    ? {
        "& .MuiFilledInput-root": {
          backgroundColor: "rgba(255,255,255,0.08)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          "&.Mui-focused": { backgroundColor: "rgba(255,255,255,0.12)" },
        },
        "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
        "& .MuiFilledInput-input": { color: "#fff" },
      }
    : undefined;

  useLayoutEffect(() => {
    applyAppChrome(bg, "page", bg, prefersDark ? "light" : "dark");
    return () => {
      applyPageChrome();
    };
  }, [bg, prefersDark]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await logIn({
      email: formData.get("email")?.toString() ?? "",
      senha: formData.get("senha")?.toString() ?? "",
      ...(academiaSlug ? { academia_slug: academiaSlug } : {}),
    });

    setLoading(false);
    setResponse({ status: result.status, message: result.message, data: result.data });

    if (result.status >= 200 && result.status < 300) {
      const token = (result.data as { access_token?: string } | undefined)?.access_token;
      const slug = token ? jwtDecode<User>(token).academia_slug : undefined;
      const homeSlug = slug || academiaSlug;
      navigate(homeSlug ? LINK("/", undefined, homeSlug) : LINK("/plataforma/academias"), { replace: true });
    }
  }

  if (isAuthenticated) {
    if (user?.academia_slug) return <Navigate to={LINK("/", undefined, user.academia_slug)} replace />;
    if (Number(user?.academia_id) > 0) return <Navigate to={LINK("/")} replace />;
    return <Navigate to={LINK("/plataforma/academias")} replace />;
  }

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxSizing: "border-box",
        backgroundColor: bg,
        px: 2,
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <SignInStyles />
      <Box className="form-signin" component="form" onSubmit={handleSubmit} sx={{ margin: 0 }}>
        {academiaSlug ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
            <UserAvatar
              foto={academia?.logo}
              name={academia?.nome ?? academiaSlug}
              size={96}
              fallbackIcon="mdi:domain"
            />
            <Typography variant="body2" textAlign="center" sx={{ mt: 1.5, color: subtitleColor }}>
              login no pump.it
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              className="logo"
              component="div"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1.2,
                color: logoColor,
                boxSizing: "border-box",
              }}
            >
              pump.it
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ mb: 2, color: subtitleColor }}>
              Acesso master da plataforma
            </Typography>
          </>
        )}
        {response && (
          <Alert severity={response.status === 200 ? "success" : "error"} variant="filled" sx={{ my: 1 }}>
            <strong>{response.status}:</strong> {response.message}.
          </Alert>
        )}
        <TextField
          id="email"
          name="email"
          label="E-mail"
          type="email"
          autoComplete="username"
          autoFocus
          fullWidth
          margin="none"
          variant="filled"
          required
          sx={fieldSx}
        />
        <TextField
          id="senha"
          name="senha"
          label="Senha"
          type="password"
          autoComplete="current-password"
          variant="filled"
          fullWidth
          margin="none"
          required
          sx={fieldSx}
        />
        <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
          {loading ? "ENTRANDO…" : "ENTRAR"}
        </Button>
        <Box sx={{ textAlign: "center" }}>
          <Link href="mailto:contato@isaque.it" variant="body2" sx={{ color: linkColor }}>
            Esqueceu a senha?
          </Link>
        </Box>
      </Box>
      <img className="blob_red" src={BlobRed} alt="" aria-hidden />
      <img className="blob_green" src={BlobGreen} alt="" aria-hidden />
      <img className="blob_yellow" src={BlobYellow} alt="" aria-hidden />
    </Box>
  );
}
