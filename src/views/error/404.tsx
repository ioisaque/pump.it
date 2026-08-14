import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img404 from "assets/imgs/error/404.svg";
import { useNavigate } from "react-router-dom";

function E404() {
  const navigate = useNavigate();

  return (
    <Box className="error-shell bg-warning">
      <Box component="main">
        <Box component="span">
          <h1>404</h1>
          <h5>Opps... página não encontrada</h5>
        </Box>

        <img src={img404} alt="" />

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
          Voltar a página anterior...
        </Button>
      </Box>

      <ErrorStyles />
    </Box>
  );
}

export default E404;
