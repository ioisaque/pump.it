import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img403 from "assets/imgs/error/403.svg";
import { useNavigate } from "react-router-dom";
import { setHeaderColor } from "domain/shared/formatters";

function E403() {
  const navigate = useNavigate();

  setHeaderColor("#f9142a");

  return (
    <Box className="error-shell bg-error">
      <Box component="main">
        <Box component="span">
          <h1>403</h1>
          <h5>Acesso negado a área restrita</h5>
        </Box>

        <img src={img403} alt="" />

        <Button
          variant="text"
          onClick={() => navigate("/")}
          sx={{
            color: "#FFF",
            fontWeight: 600,
            fontFamily: "inherit",
            textTransform: "none",
            margin: "5rem auto 0",
            padding: "1.2rem 0.5rem",
          }}
        >
          Fazer login...
        </Button>
      </Box>

      <ErrorStyles />
    </Box>
  );
}

export default E403;
