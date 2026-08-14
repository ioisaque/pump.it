import { Backdrop, CircularProgress, Grid, styled } from "@mui/material";
import PwaPermissionsGate from "components/pwa/PwaPermissionsGate";
import { PAGE_BACKGROUND } from "utils/app-chrome";
import { ReactNode, Suspense } from "react";
import { Outlet } from "react-router-dom";
import UserBar from "./UserBar";

const Wrapper = styled(Grid)({
  flexGrow: 1,
  rowGap: 0,
  margin: 0,
  padding: 0,
  columnGap: 0,
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: PAGE_BACKGROUND,
});

const Page = styled(Grid)({
  flex: 1,
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  rowGap: 4,
  columnGap: 4,
  margin: "0 auto",
  width: "100%",
  maxWidth: "1280px",
  padding: "0 15px 25px",
  boxSizing: "border-box",
});

function RouteSuspenseFallback() {
  return (
    <Backdrop open sx={{ color: "primary.main", backgroundColor: PAGE_BACKGROUND, zIndex: (t) => t.zIndex.drawer + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export function DashboardLayout({ children }: { children?: ReactNode }) {
  return (
    <PwaPermissionsGate>
      <Wrapper>
        <UserBar container />
        <Page>
          <Suspense fallback={<RouteSuspenseFallback />}>{children || <Outlet />}</Suspense>
        </Page>
      </Wrapper>
    </PwaPermissionsGate>
  );
}
