import { Card, CardContent, Grid } from "@mui/material";
import { Fragment, ReactNode } from "react";

type EntityHeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
};

function EntityHeader({ left = <Fragment />, right = <Fragment /> }: EntityHeaderProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1.5,
        bgcolor: "#fff",
        boxShadow: "none",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Grid container spacing={1} alignItems="center">
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
      </CardContent>
    </Card>
  );
}

export default EntityHeader;
