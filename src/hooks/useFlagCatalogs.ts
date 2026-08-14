import { useQueries, useQuery } from "@tanstack/react-query";
import { FlagKind, listEntityStatus, listFlags, StatusEntity } from "api/flags";
import { EntityStatusFlag, Flag } from "domain/tabelas/types";

export function flagsCatalogQueryKey(kind: FlagKind) {
  return ["flags", kind] as const;
}

export function flagsStatusQueryKey(entity: StatusEntity) {
  return ["flags", "status", entity] as const;
}

export function useFlagCatalogs<K extends FlagKind>(kinds: readonly K[]) {
  const queries = useQueries({
    queries: kinds.map((kind) => ({
      queryKey: flagsCatalogQueryKey(kind),
      queryFn: () => listFlags<Flag>(kind),
      retry: 1,
    })),
  });

  const catalogs = kinds.reduce(
    (acc, kind, index) => {
      acc[kind] = queries[index]?.data;
      return acc;
    },
    {} as Record<K, Flag[] | undefined>,
  );

  return {
    ...catalogs,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}

export function useEntityStatusCatalog(entity: StatusEntity) {
  const query = useQuery({
    queryKey: flagsStatusQueryKey(entity),
    queryFn: () => listEntityStatus(entity),
    retry: 1,
  });

  return {
    catalog: query.data as EntityStatusFlag[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
