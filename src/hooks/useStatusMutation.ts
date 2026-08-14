import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "services/api";

export type StatusMutationVars<TId extends string | number = number> = {
  id: TId;
  nextStatus: string | number;
  nome: string;
};

type UseStatusMutationOptions<TId extends string | number> = {
  queryKey: readonly unknown[];
  invalidateQueryKeys?: readonly (readonly unknown[])[];
  /** e.g. `"pessoas"` → `PATCH pessoas/:id` with `{ status }` */
  savePath?: string;
  mutationFn?: (vars: StatusMutationVars<TId>) => Promise<unknown>;
  successMessage?: (vars: StatusMutationVars<TId>) => string;
  errorMessage?: string;
};

export function useStatusMutation<TId extends string | number = number>(
  options: UseStatusMutationOptions<TId>,
) {
  const queryClient = useQueryClient();
  const errorMessage = options.errorMessage ?? "Não foi possível atualizar o status.";

  return useMutation({
    mutationFn: async (vars: StatusMutationVars<TId>) => {
      if (options.mutationFn) return options.mutationFn(vars);
      if (!options.savePath) throw new Error("useStatusMutation: informe savePath ou mutationFn.");
      return api.patch(`${options.savePath}/${vars.id}`, { status: vars.nextStatus });
    },
    onSuccess: async (_, vars) => {
      const message = options.successMessage
        ? options.successMessage(vars)
        : vars.nextStatus === 2 ||
            vars.nextStatus === "BLOCKED" ||
            vars.nextStatus === "INACTIVE" ||
            vars.nextStatus === "SUSPENDED"
          ? `${vars.nome} desativado.`
          : `${vars.nome} reativado.`;
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: options.queryKey });
      if (options.invalidateQueryKeys) {
        for (const key of options.invalidateQueryKeys) {
          await queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { statusCode?: number; message?: string } } };
      const payload = err.response?.data;
      if (payload?.message != null) {
        const code = payload.statusCode != null ? `${payload.statusCode}: ` : "";
        toast.error(`${code}${payload.message}.`);
      } else {
        toast.error(errorMessage);
      }
    },
  });
}
