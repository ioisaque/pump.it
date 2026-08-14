import { Box } from "@mui/material";
import Icon from "components/Icon";

export type ChipProps = {
  icon?: string;
  nome?: string;
  text?: string;
  /** Background — API field name on lookup rows. */
  color?: string;
  bgColor?: string;
  txtColor?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
};

export type IntegracaoRefEntidade = "pessoa" | "fatura" | "contrato";

const INTEGRACAO_REF_LABELS: Record<IntegracaoRefEntidade, string> = {
  pessoa: "customerID",
  fatura: "paymentID",
  contrato: "paymentID",
};

export function IntegracaoNaoConciliadaChip() {
  return (
    <Chip
      icon="mdi:link-variant-off"
      bgColor="#ed6c02"
      txtColor="#fff"
      text="Não conciliada"
      fontSize="78%"
    />
  );
}

export function IntegracaoRefChip({
  entidade,
  integracoes,
  provider = "asaas",
}: {
  entidade: IntegracaoRefEntidade;
  integracoes?: { asaas?: string | null; mercadopago?: string | null } | null;
  provider?: "asaas" | "mercadopago";
}) {
  const ref = provider === "mercadopago" ? integracoes?.mercadopago : integracoes?.asaas;
  if (!ref) return null;

  const label =
    provider === "mercadopago"
      ? entidade === "contrato"
        ? "paymentID"
        : INTEGRACAO_REF_LABELS[entidade]
      : INTEGRACAO_REF_LABELS[entidade];

  return (
    <Chip
      icon="mdi:bank-outline"
      bgColor={provider === "mercadopago" ? "#009EE3" : "#0038E5"}
      txtColor="#fff"
      text={`${label} · ${ref}`}
      fontSize="78%"
    />
  );
}

export default function Chip({ icon, nome, text, color, bgColor, txtColor = "#fff", ...rest }: ChipProps) {
  const label = text ?? nome;
  if (!icon && !label) return null;

  const background = bgColor ?? color;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        width: "fit-content",
        maxWidth: "100%",
        alignSelf: "center",
        alignItems: "center",
        gap: icon && label ? 0.5 : 0,
        bgcolor: background,
        color: txtColor,
        fontSize: "80%",
        padding: "3px 10px",
        borderRadius: "4px",
        lineHeight: 1.4,
        verticalAlign: "middle",
        ...rest,
      }}
    >
      {icon ? <Icon name={icon} color={txtColor} width="1.1em" height="1.1em" /> : null}
      {label ? <span>{label}</span> : null}
    </Box>
  );
}
