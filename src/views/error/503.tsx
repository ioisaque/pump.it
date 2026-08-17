import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import logo_light from "assets/imgs/logos/logo-light.png";
import { useNavigate } from "react-router-dom";

function E503() {
  const navigate = useNavigate();

  return (
    <Box className="error-shell bg-black">
      <Box component="main">
        <Box component="span">
          <h2>Já voltamos...</h2>
          <h6>Este serviço está passando por uma manutenção no momento, tente novamente em alguns instantes.</h6>
        </Box>

        <img src={logo_light} alt="" />

        <Button
          variant="text"
          onClick={() => navigate(-1)}
          sx={{
            color: "#FFF",
            fontWeight: 600,
            fontFamily: "inherit",
            textTransform: "none",
            margin: "5rem auto 0",
            padding: "1.2rem 0.5rem",
          }}
        >
          Voltar a página anterior...
        </Button>
      </Box>

      <ErrorStyles />
    </Box>
  );
}

export default E503;
