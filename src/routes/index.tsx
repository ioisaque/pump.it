import { Backdrop, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import RequireAuth, { RequireStaff } from "components/auth/RequireAuth";
import { DashboardLayout } from "components/layout/Dashboard";
import FakeStatusBar, { AppSafeArea } from "components/layout/FakeStatusBar";
import React, { Suspense, useLayoutEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { acessosRoutes } from "routes/acessos";
import { authRoutes } from "routes/auth";
import { avaliacoesRoutes } from "routes/avaliacoes";
import { checkinRoutes } from "routes/checkin";
import { configuracoesRoutes } from "routes/configuracoes";
import { dashboardRoutes } from "routes/dashboard";
import { exerciciosRoutes } from "routes/exercicios";
import { fichasRoutes } from "routes/fichas";
import { mensalidadesRoutes } from "routes/mensalidades";
import { notificacoesRoutes } from "routes/notificacoes";
import { pessoasRoutes } from "routes/pessoas";
import { plataformaRoutes } from "routes/plataforma";
import { sistemaRoutes } from "routes/sistema";
import { tabelasRoutes } from "routes/tabelas";
import { icTheme } from "theme";
import { applyPageChrome } from "utils/app-chrome";
import InstallPage from "views/auth/install";

export const appTheme = icTheme();

function RouteSuspenseFallback() {
  return (
    <Backdrop open sx={{ color: "primary.main", backgroundColor: "#f4f1e6", zIndex: (t) => t.zIndex.drawer + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

function AppChromeBar() {
  const { pathname } = useLocation();
  const hide =
    pathname === "/login" ||
    pathname === "/install" ||
    pathname.endsWith("/login") ||
    pathname.endsWith("/install");
  return <FakeStatusBar hidden={hide} cube={false} color="#FFFFFF" />;
}

const AppRoutes: React.FC = () => {
  useLayoutEffect(() => {
    applyPageChrome();
  }, []);

  const tenantCrud = (
    <>
      {dashboardRoutes}
      {exerciciosRoutes}
      {fichasRoutes}
      {avaliacoesRoutes}
      {acessosRoutes}
      {checkinRoutes}
      {mensalidadesRoutes}
      <Route element={<RequireStaff />}>
        {pessoasRoutes}
        {tabelasRoutes}
        {notificacoesRoutes}
        {configuracoesRoutes}
        {sistemaRoutes}
      </Route>
    </>
  );

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppChromeBar />
        <AppSafeArea>
          <Suspense fallback={<RouteSuspenseFallback />}>
            <Routes>
              <Route path="/install" element={<InstallPage />} />
              <Route path="/:academiaSlug/install" element={<InstallPage />} />
              {authRoutes}

              <Route element={<RequireAuth />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route element={<RequireStaff />}>{plataformaRoutes}</Route>
                  {tenantCrud}
                </Route>
                <Route path="/:academiaSlug" element={<DashboardLayout />}>
                  {tenantCrud}
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AppSafeArea>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default AppRoutes;
