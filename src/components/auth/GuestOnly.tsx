import { Backdrop, CircularProgress } from "@mui/material";
import useAuth from "hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LINK } from "utils/link";
import { shouldShowInstallGate } from "utils/pwa-install";

export default function GuestOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Backdrop
        open
        sx={{
          color: "primary.main",
          backgroundColor: "#FFFFFF",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  if (shouldShowInstallGate() && location.pathname.endsWith("/login")) {
    return <Navigate to={LINK("/install")} replace />;
  }

  return <Outlet />;
}
