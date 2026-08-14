import { useQuery } from "@tanstack/react-query";
import { findPessoa } from "api/pessoas";

export function pessoaQueryKey(id: string | number | null | undefined) {
  if (id == null || id === "") return ["pessoas", ""] as const;
  return ["pessoas", Number(id)] as const;
}

export function usePessoa(id: string | number | null | undefined) {
  const numericId = id == null || id === "" ? null : Number(id);

  return useQuery({
    queryKey: pessoaQueryKey(numericId),
    queryFn: async () => findPessoa(numericId as number),
    enabled: numericId != null && !Number.isNaN(numericId),
    retry: 1,
  });
}
