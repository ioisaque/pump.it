import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img500 from "assets/imgs/error/500.svg";
import { useNavigate } from "react-router-dom";

function E500() {
  const navigate = useNavigate();

  return (
    <Box className="error-shell bg-info">
      <Box component="main">
        <Box component="span">
          <h1>500</h1>
          <h5>Erro interno do servidor</h5>
        </Box>

        <img src={img500} alt="" />

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

export default E500;
