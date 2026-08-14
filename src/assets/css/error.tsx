import { createGlobalStyle } from "styled-components";

export const ErrorStyles = createGlobalStyle`
/* ---------------------------------
1. TYPOGRAPHY
--------------------------------- */

* {
  margin: 0;
  color: "#FFF";
}

h1 {
  font-size: 10em;
  line-height: 1;
  font-weight: 800;
}
h2 {
  font-size: 3em;
  line-height: 1.1;
  font-weight: 600;
}
h5 {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 10px auto;
  max-width: 500px;
}
h6 {
  font-size: 0.95em;
  font-weight: 500;
  line-height: 1.5;
  margin: 10px auto;
  max-width: 500px;
  letter-spacing: 1px;
}

/* ---------------------------------
2. PAGE DESIGN
--------------------------------- */

.error-shell {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

main {
  width: 80vw;
  height: auto;
  max-width: 650px;
  margin: auto;
  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

main img,
main svg,
main canvas {
  height: 30vh;
  max-width: 80%;
  display: block;
  object-fit: contain;
  margin: 5rem auto 0;
}

main p {
  width: 80%;
  display: block;
  margin: 3rem auto;
  padding: 0.5rem;
  font-weight: 600;
}

main .btn:hover {
  opacity: 0.85;
}

/* ---------------------------------
3. COLORS
--------------------------------- */

.bg-muted {
  color: #ffffff;
  background-color: #99abb4;
}
.bg-white {
  color: #717374;
  background-color: #ffffff;
}
.bg-black {
  color: #ffffff;
  background-color: #000000;
}
.bg-inverse {
  color: #ffffff;
  background-color: #2f3d4a;
}
.bg-primary {
  color: #ffffff;
  background-color: #0035ff;
}
.bg-info {
  color: #ffffff;
  background-color: #1976d2;
}
.bg-success {
  color: #ffffff;
  background-color: #28a745;
}
.bg-warning {
  color: #ffffff;
  background-color: #ffb22b;
}
.bg-error {
  color: #ffffff;
  background-color: #f9142a;
}
.bg-ideyou {
  color: #ffffff;
  background-color: #ff5356;
}
.bg-athenas {
  color: #ffffff;
  background-color: #f36700;
}
.bg-quinzel {
  color: #ffffff;
  background-color: #820bcd;
}
.bg-emoji {
  color: #ffffff;
  background-color: #8b4513;
}
.bg-master {
  color: #ffffff;
  background-color: #133d63;
}
.bg-themecolor {
  color: #ffffff;
  background-color: #5292b1;
}
.bg-whatsapp {
  color: #ffffff;
  background-color: #25d366;
}
`;
