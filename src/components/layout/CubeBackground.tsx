import { Box } from "@mui/material";

export const cubeCornerPalette = {
  red: "#FF5356",
  /** Face lateral (com opacity 0.8) — igual PWA online; logo sólida usa `#33CC66`. */
  green: "#3dd889",
  yellow: "#FFD23F",
} as const;

/** Divisão no topo do cubo (UserBar) — FakeStatusBar usa as mesmas %. */
export const CUBE_TOP_SPLIT_PCT = 22;
/** Ápice do triângulo vermelho (mais baixo = mais visível abaixo do notch). */
export const CUBE_TIP_Y_PCT = 68;

const greenClip = (lr: number, tip: number) =>
  `polygon(0 0, ${lr}% 0, 50% ${tip}%, 50% 100%, 0 100%)`;
const yellowClip = (rr: number, tip: number) =>
  `polygon(${rr}% 0, 100% 0, 100% 100%, 50% 100%, 50% ${tip}%)`;

/**
 * Cubo + Safari 26: UserBar fica vermelho (sticky amostrado pela chrome).
 * Faces laterais misturam com underlay **branco** no mesmo clip (não com o vermelho).
 */
export default function CubeBackground() {
  const { red, green, yellow } = cubeCornerPalette;
  const lr = CUBE_TOP_SPLIT_PCT;
  const rr = 100 - CUBE_TOP_SPLIT_PCT;
  const tip = CUBE_TIP_Y_PCT;
  const gClip = greenClip(lr, tip);
  const yClip = yellowClip(rr, tip);

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: gClip,
          bgcolor: "#fff",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: yClip,
          bgcolor: "#fff",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: `polygon(${lr}% 0, ${rr}% 0, 50% ${tip}%)`,
          bgcolor: red,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: gClip,
          bgcolor: green,
          opacity: 0.8,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: yClip,
          bgcolor: yellow,
          opacity: 0.8,
        }}
      />
    </Box>
  );
}
