import { GlobalStyles } from "@mui/material";

export function SignInStyles() {
  return (
    <GlobalStyles
      styles={`
/* Não mexer no body flex — isso quebrava o centro e a largura do #root. */

.blob_red {
  width: 26%;
  max-width: 400px;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  position: fixed;
  z-index: 1;
  pointer-events: none;
}

.blob_green {
  width: 26%;
  max-width: 400px;
  left: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  position: fixed;
  z-index: 1;
  pointer-events: none;
}

.blob_yellow {
  width: 26%;
  max-width: 400px;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  position: fixed;
  z-index: 1;
  pointer-events: none;
}

.form-signin {
  margin: auto;
  max-width: 350px;
  padding: 2rem 1rem;
  width: 100%;
}
.logo {
  width: 100%;
  height: auto;
  padding: 25px 25px 0;
  margin-bottom: 15px;
  object-fit: contain;
}

.form-signin div:has(input[type="email"]) {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin div:has(input[type="password"]) {
  border-radius: 0;
}
.form-signin button[type="submit"] {
  padding: 1em;
  margin-bottom: 25px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
`}
    />
  );
}
