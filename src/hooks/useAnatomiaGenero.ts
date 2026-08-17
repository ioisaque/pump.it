import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { findPessoa, savePessoa } from "api/pessoas";
import anatomiaCostasFem from "assets/imgs/anatomia-costas-fem.webp";
import anatomiaCostasMasc from "assets/imgs/anatomia-costas-masc.webp";
import anatomiaCostasMaskFem from "assets/imgs/anatomia-costas-mask-fem.webp";
import anatomiaCostasMaskMasc from "assets/imgs/anatomia-costas-mask-masc.webp";
import anatomiaFrenteFem from "assets/imgs/anatomia-frente-fem.webp";
import anatomiaFrenteMasc from "assets/imgs/anatomia-frente-masc.webp";
import anatomiaFrenteMaskFem from "assets/imgs/anatomia-frente-mask-fem.webp";
import anatomiaFrenteMaskMasc from "assets/imgs/anatomia-frente-mask-masc.webp";
import { Pessoa } from "domain/pessoas/types";
import useAuth from "hooks/useAuth";
import { useCallback, useMemo } from "react";

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

export function parseAnatomiaGenero(value: unknown): AnatomiaGenero {
  const s = String(value ?? "").trim().toLowerCase();
  if (s === "fem" || s === "f" || s === "feminino") return "fem";
  return "masc";
}

function readStored(): AnatomiaGenero {
  try {
    return parseAnatomiaGenero(localStorage.getItem(ANATOMIA_GENERO_KEY));
  } catch {
    return "masc";
  }
}

function writeStored(next: AnatomiaGenero) {
  try {
    localStorage.setItem(ANATOMIA_GENERO_KEY, next);
  } catch {
    /* ignore */
  }
}

export default function useAnatomiaGenero() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pessoaId = user?.id;

  const { data: pessoa } = useQuery({
    queryKey: ["pessoas", pessoaId],
    queryFn: () => findPessoa(pessoaId as number),
    enabled: Number.isInteger(pessoaId) && (pessoaId as number) > 0,
    retry: 1,
  });

  const genero = useMemo(() => {
    if (pessoa?.anatomia_genero) return parseAnatomiaGenero(pessoa.anatomia_genero);
    return readStored();
  }, [pessoa?.anatomia_genero]);

  const persistMutation = useMutation({
    mutationFn: (next: AnatomiaGenero) =>
      savePessoa(pessoaId as number, { anatomia_genero: next === "fem" ? "FEM" : "MASC" }),
    onSuccess: (data) => {
      if (data?.pessoa && pessoaId) {
        queryClient.setQueryData(["pessoas", pessoaId], data.pessoa);
      }
    },
  });

  const persist = persistMutation.mutate;

  const setGenero = useCallback(
    (next: AnatomiaGenero) => {
      writeStored(next);
      if (!pessoaId) return;
      queryClient.setQueryData(["pessoas", pessoaId], (prev: Pessoa | null | undefined) =>
        prev ? { ...prev, anatomia_genero: next === "fem" ? "FEM" : "MASC" } : prev,
      );
      persist(next);
    },
    [pessoaId, persist, queryClient],
  );

  const toggle = useCallback(() => {
    setGenero(genero === "masc" ? "fem" : "masc");
  }, [genero, setGenero]);

  return { genero, setGenero, toggle, assets: ASSETS[genero] };
}
