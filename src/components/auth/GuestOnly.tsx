import { Backdrop, CircularProgress } from "@mui/material";
import useAuth from "hooks/useAuth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LINK } from "utils/link";
import { useShouldShowInstallGate } from "utils/pwa-install";

export default function GuestOnly() {
  const { isLoading } = useAuth();
  const location = useLocation();
  const showInstall = useShouldShowInstallGate();

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

  if (showInstall && location.pathname.endsWith("/login")) {
    return <Navigate to={LINK("/install")} replace />;
  }

  return <Outlet />;
}
