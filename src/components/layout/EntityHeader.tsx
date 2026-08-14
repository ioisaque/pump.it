import { Grid } from "@mui/material";
import { Fragment, ReactNode } from "react";

type EntityHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
};

function EntityHeader({ left = <Fragment />, right = <Fragment /> }: EntityHeaderProps) {
  return (
    <Grid container marginBottom={1.5} spacing={1} alignItems="center">
      <Grid
        item
        xs={12}
        sm={6}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={1}
        flexWrap="wrap"
        minWidth={0}
      >
        {left}
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        display="flex"
        alignItems="center"
        justifyContent={{ xs: "flex-start", sm: "flex-end" }}
        gap={1}
        flexWrap="wrap"
        minWidth={0}
      >
        {right}
      </Grid>
    </Grid>
  );
}

export default EntityHeader;
