import { Box, Button } from "@mui/material";
import { ErrorStyles } from "assets/css/error";
import img501 from "assets/imgs/error/501.svg";
import { useNavigate } from "react-router-dom";

function E501() {
  const navigate = useNavigate();

  return (
    <Box className="error-shell bg-info">
      <Box component="main">
        <Box component="span">
          <h1>501</h1>
          <h5>Não implementado</h5>
        </Box>

        <img src={img501} alt="" />

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

export default E501;
