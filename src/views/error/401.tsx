import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img401 from "assets/imgs/error/401.svg";
import { useNavigate } from "react-router-dom";

function E401() {
  const navigate = useNavigate();

  return (
    <Box className="error-shell bg-athenas">
      <Box component="main">
        <Box component="span">
          <h1>401</h1>
          <h5>Necessário credenciais válidas</h5>
        </Box>

        <img src={img401} alt="" />

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

export default E401;
