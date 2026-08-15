import anatomiaCostasFem from "assets/imgs/anatomia-costas-fem.webp";
import anatomiaCostasMaskFem from "assets/imgs/anatomia-costas-mask-fem.webp";
import anatomiaCostasMasc from "assets/imgs/anatomia-costas-masc.webp";
import anatomiaCostasMaskMasc from "assets/imgs/anatomia-costas-mask-masc.webp";
import anatomiaFrenteFem from "assets/imgs/anatomia-frente-fem.webp";
import anatomiaFrenteMaskFem from "assets/imgs/anatomia-frente-mask-fem.webp";
import anatomiaFrenteMasc from "assets/imgs/anatomia-frente-masc.webp";
import anatomiaFrenteMaskMasc from "assets/imgs/anatomia-frente-mask-masc.webp";
import { useCallback, useState } from "react";

export const ANATOMIA_GENERO_KEY = "pump-anatomia-genero";

export type AnatomiaGenero = "masc" | "fem";

const ASSETS = {
  masc: {
    frente: anatomiaFrenteMasc,
    costas: anatomiaCostasMasc,
    frenteMask: anatomiaFrenteMaskMasc,
    costasMask: anatomiaCostasMaskMasc,
  },
  fem: {
    frente: anatomiaFrenteFem,
    costas: anatomiaCostasFem,
    frenteMask: anatomiaFrenteMaskFem,
    costasMask: anatomiaCostasMaskFem,
  },
} as const;

function readStored(): AnatomiaGenero {
  try {
    const v = localStorage.getItem(ANATOMIA_GENERO_KEY);
    if (v === "fem" || v === "masc") return v;
  } catch {
    /* ignore */
  }
  return "masc";
}

export default function useAnatomiaGenero() {
  const [genero, setGeneroState] = useState<AnatomiaGenero>(readStored);

  const setGenero = useCallback((next: AnatomiaGenero) => {
    setGeneroState(next);
    try {
      localStorage.setItem(ANATOMIA_GENERO_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setGenero(genero === "masc" ? "fem" : "masc");
  }, [genero, setGenero]);

  return { genero, setGenero, toggle, assets: ASSETS[genero] };
}
