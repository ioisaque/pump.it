import { useQuery } from "@tanstack/react-query";
import { findPessoa } from "api/pessoas";
import { DATA, HORA } from "domain/shared/formatters";

export type AuditEntity = {
  criado_em?: string | null;
  criado_por?: number | string | null;
  alterado_em?: string | null;
  alterado_por?: number | string | null;
};

type LastUpdatedProps = JSX.IntrinsicElements["span"] & {
  entity: AuditEntity;
};

export default function LastUpdated({ entity, ...rest }: LastUpdatedProps) {
  const alteradoEm = entity.alterado_em?.trim();
  const criadoEm = entity.criado_em?.trim();
  const useAlterado = Boolean(alteradoEm);
  const at = useAlterado ? alteradoEm : criadoEm;
  const action = useAlterado ? "Alterado" : "Criado";
  const porIdRaw = useAlterado ? entity.alterado_por : entity.criado_por;

  let porId: number | null = null;
  let literalName: string | null = null;
  if (porIdRaw != null && porIdRaw !== "") {
    if (typeof porIdRaw === "number") {
      porId = porIdRaw > 0 ? porIdRaw : null;
    } else {
      const asNum = Number(porIdRaw);
      if (Number.isFinite(asNum) && asNum > 0) {
        porId = asNum;
      } else {
        literalName = porIdRaw;
      }
    }
  }

  const { data: author } = useQuery({
    queryKey: ["pessoas", porId],
    queryFn: () => findPessoa(porId!),
    enabled: porId != null,
    staleTime: 60_000,
  });

  if (!at) {
    return <span {...rest}>Sem registro de auditoria.</span>;
  }

  const by = literalName ?? author?.nome;

  return (
    <span {...rest}>
      {action} por <b>{by ?? "Desconhecido"}</b> em <b>{DATA(at)}</b> ás <b>{HORA(at)}</b>.
    </span>
  );
}
