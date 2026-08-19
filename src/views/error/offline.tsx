import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img503 from "assets/imgs/error/503.svg";
import { setHeaderColor } from "domain/shared/formatters";

function EOffline() {
  setHeaderColor("#1976d2");

  return (
    <Box className="error-shell bg-info">
      <Box component="main">
        <Box component="span">
          <h1>503</h1>
          <h5>Houston, temos um probleminha</h5>
        </Box>

        <img src={img503} alt="" />

        <Button
          variant="text"
          className="btn"
          onClick={() => window.location.reload()}
          sx={{
            color: "#FFF",
            fontWeight: 600,
            fontFamily: "inherit",
            textTransform: "none",
            width: "80%",
            margin: "5rem auto 0",
            padding: "1.2rem 0.5rem",
          }}
        >
          O serviço pode estar indisponível ou você está offline. Tente novamente mais tarde!
        </Button>
      </Box>

      <ErrorStyles />
    </Box>
  );
}

export default EOffline;
