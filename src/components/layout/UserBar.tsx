import { Grid, styled } from "@mui/material";
import { STATUS_BAR_AUTH } from "utils/app-chrome";
import CubeBackground from "./CubeBackground";
import UserBarAccount from "./UserBarAccount";
import UserBarNav from "./UserBarNav";

/**
 * Sticky no topo (black-translucent).
 * `backgroundColor` = vermelho da logo: Safari 26+ amostra sticky/fixed no topo
 * (ignora `theme-color`). Cubo mantém verde/amarelo corretos via underlay branco
 * nas faces laterais (`CubeBackground`) — não misturam com este vermelho.
 */
const Wrapper = styled(Grid)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
  flexShrink: 0,
  minHeight: 60,
  width: "100%",
  display: "flex",
  flexWrap: "wrap",
  rowGap: theme.spacing(0.5),
  columnGap: theme.spacing(1),
  padding: theme.spacing(1.25),
  paddingTop: `calc(${theme.spacing(1.25)} + env(safe-area-inset-top, 0px))`,
  marginBottom: 20,
  backgroundColor: STATUS_BAR_AUTH,
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    flexWrap: "nowrap",
  },
}));

export default function UserBar({ container = true }: { container?: boolean }) {
  return (
    <Wrapper container={container}>
      <CubeBackground />
      <Grid
        item
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: { xs: "nowrap", sm: "wrap" },
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 1,
          flex: "1 1 auto",
          minWidth: 0,
          "& > .MuiButton-root": {
            px: 1,
          },
        }}
      >
        <UserBarNav />
      </Grid>
      <Grid
        item
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <UserBarAccount />
      </Grid>
    </Wrapper>
  );
}
