import { CUBE_TOP_SPLIT_PCT, cubeCornerPalette } from "components/layout/CubeBackground";

const { green, red, yellow } = cubeCornerPalette;
const left = CUBE_TOP_SPLIT_PCT;
const right = 100 - CUBE_TOP_SPLIT_PCT;

/**
 * Mesmas proporções do topo do CubeBackground (UserBar):
 * verde 0–22% | vermelho 22–78% | amarelo 78–100%.
 */
export const BRAND_STRIPE_GRADIENT = `linear-gradient(
  to right,
  ${green} 0%,
  ${green} ${left}%,
  ${red} ${left}%,
  ${red} ${right}%,
  ${yellow} ${right}%,
  ${yellow} 100%
)`;
