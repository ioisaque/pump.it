import { Box, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
    getAsaasFees,
    getMercadoPagoFees,
} from "api/integracoes";
import Icon from "components/Icon";
import { IntegracaoProviderSlug } from "domain/integracoes/constants";
import { AsaasPaymentFees, MercadoPagoPaymentFees } from "domain/integracoes/types";
import { BRL } from "domain/shared/formatters";
import { ReactNode } from "react";
import { DATA } from "utils/dates";

type FeeRow = {
  key: string;
  icon: string;
  label: string;
  fee: string;
  tooltip: ReactNode;
};

type IntegracaoFeesPanelProps = {
  provider: IntegracaoProviderSlug;
  configurado: boolean;
};

function pctLabel(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function pctOrDash(value: number | null | undefined) {
  if (value == null) return "—";
  return pctLabel(value);
}

function creditoLinha(pct: number, taxaOperacao: number) {
  if (taxaOperacao > 0) return `${pctLabel(pct)} + ${BRL(taxaOperacao)}`;
  return pctLabel(pct);
}

function buildAsaasRows(data: AsaasPaymentFees): FeeRow[] {
  const rows: FeeRow[] = [];

  if (data.boleto) {
    rows.push({
      key: "boleto",
      icon: "mdi:barcode",
      label: "Boleto",
      fee: BRL(data.boleto.valor),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Boleto bancário
          </Typography>
          <Typography variant="caption">Taxa: {BRL(data.boleto.valor)}</Typography>
          {data.boleto.promocional != null && (
            <Typography variant="caption">
              Promocional: {BRL(data.boleto.promocional)}
              {data.boleto.promocionalValidade
                ? ` até ${DATA(data.boleto.promocionalValidade) || data.boleto.promocionalValidade}`
                : ""}
            </Typography>
          )}
          <Typography variant="caption">
            Recebimento em {data.boleto.diasRecebimento} dia(s) útil(eis)
          </Typography>
        </Stack>
      ),
    });
  }

  if (data.credito) {
    const op = data.credito.taxaOperacao;
    const parcelas = [
      { label: "à vista", pct: data.credito.avista, promo: data.credito.promocional.avista },
      { label: "2 a 6 parcelas", pct: data.credito.ate6x, promo: data.credito.promocional.ate6x },
      { label: "7 a 12 parcelas", pct: data.credito.ate12x, promo: data.credito.promocional.ate12x },
      { label: "13 a 21 parcelas", pct: data.credito.ate21x, promo: data.credito.promocional.ate21x },
    ];
    rows.push({
      key: "credito",
      icon: "mdi:credit-card-outline",
      label: "Crédito",
      fee: creditoLinha(data.credito.avista, op),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Cartão de crédito (online)
          </Typography>
          <Typography variant="caption">Recebimento em {data.credito.diasRecebimento} dias</Typography>
          {parcelas.map((row) => (
            <Typography key={row.label} variant="caption">
              {row.label}: {creditoLinha(row.pct, op)}
              {row.promo != null ? ` · promo ${pctLabel(row.promo)}` : ""}
            </Typography>
          ))}
          {data.credito.promocional.validade && (
            <Typography variant="caption">
              Promo até {DATA(data.credito.promocional.validade) || data.credito.promocional.validade}
            </Typography>
          )}
        </Stack>
      ),
    });
  }

  if (data.debito) {
    rows.push({
      key: "debito",
      icon: "mdi:credit-card-outline",
      label: "Débito",
      fee: creditoLinha(data.debito.percentual, data.debito.taxaOperacao),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Cartão de débito (online)
          </Typography>
          <Typography variant="caption">
            Taxa: {creditoLinha(data.debito.percentual, data.debito.taxaOperacao)}
          </Typography>
          <Typography variant="caption">Recebimento em {data.debito.diasRecebimento} dias</Typography>
        </Stack>
      ),
    });
  }

  if (data.pix) {
    const pixValor =
      data.pix.taxaFixa != null
        ? BRL(data.pix.taxaFixa)
        : data.pix.percentual != null
          ? pctLabel(data.pix.percentual)
          : null;
    if (pixValor) {
      rows.push({
        key: "pix",
        icon: "mdi:qrcode",
        label: "Pix",
        fee: pixValor,
        tooltip: (
          <Stack gap={0.25}>
            <Typography variant="caption" fontWeight={700}>
              Pix
            </Typography>
            <Typography variant="caption">Taxa: {pixValor}</Typography>
            {data.pix.taxaFixaPromocional != null && (
              <Typography variant="caption">
                Promocional: {BRL(data.pix.taxaFixaPromocional)}
                {data.pix.promocionalValidade
                  ? ` até ${DATA(data.pix.promocionalValidade) || data.pix.promocionalValidade}`
                  : ""}
              </Typography>
            )}
            {data.pix.percentual != null && data.pix.minimo != null && data.pix.maximo != null && (
              <Typography variant="caption">
                Faixa: {BRL(data.pix.minimo)} – {BRL(data.pix.maximo)}
              </Typography>
            )}
            {data.pix.recebimentosGratisMes > 0 && (
              <Typography variant="caption">
                {data.pix.recebimentosGratisMes} recebimentos grátis/mês ({data.pix.recebidosMesAtual} usados)
              </Typography>
            )}
          </Stack>
        ),
      });
    }
  }

  return rows;
}

function buildMercadoPagoRows(data: MercadoPagoPaymentFees): FeeRow[] {
  const rows: FeeRow[] = [];

  if (data.pix) {
    rows.push({
      key: "pix",
      icon: "mdi:qrcode",
      label: "Pix",
      fee: pctOrDash(data.pix.percentual),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Pix
          </Typography>
          <Typography variant="caption">Taxa média: {pctOrDash(data.pix.percentual)}</Typography>
          <Typography variant="caption">
            Recebimento em {data.pix.diasRecebimento === 0 ? "D+0" : `${data.pix.diasRecebimento} dia(s)`}
          </Typography>
          {data.pix.amostras > 0 && (
            <Typography variant="caption">Base: {data.pix.amostras} pagamento(s) aprovado(s)</Typography>
          )}
        </Stack>
      ),
    });
  }

  if (data.boleto) {
    rows.push({
      key: "boleto",
      icon: "mdi:barcode",
      label: "Boleto",
      fee: pctOrDash(data.boleto.percentual),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Boleto
          </Typography>
          <Typography variant="caption">Taxa média: {pctOrDash(data.boleto.percentual)}</Typography>
          <Typography variant="caption">
            Recebimento em {data.boleto.diasRecebimento === 0 ? "D+0" : `${data.boleto.diasRecebimento} dia(s)`}
          </Typography>
          {data.boleto.amostras > 0 && (
            <Typography variant="caption">Base: {data.boleto.amostras} pagamento(s) aprovado(s)</Typography>
          )}
        </Stack>
      ),
    });
  }

  if (data.credito) {
    rows.push({
      key: "credito",
      icon: "mdi:credit-card-outline",
      label: "Crédito",
      fee: pctOrDash(data.credito.avista),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Cartão de crédito
          </Typography>
          <Typography variant="caption">
            Recebimento em {data.credito.diasRecebimento === 0 ? "D+0" : `${data.credito.diasRecebimento} dia(s)`}
          </Typography>
          <Typography variant="caption">À vista: {pctOrDash(data.credito.avista)}</Typography>
          <Typography variant="caption">2 a 6 parcelas: {pctOrDash(data.credito.ate6x)}</Typography>
          <Typography variant="caption">7 a 12 parcelas: {pctOrDash(data.credito.ate12x)}</Typography>
          {data.credito.amostras > 0 && (
            <Typography variant="caption">Base: {data.credito.amostras} pagamento(s) aprovado(s)</Typography>
          )}
        </Stack>
      ),
    });
  }

  if (data.debito) {
    rows.push({
      key: "debito",
      icon: "mdi:credit-card-outline",
      label: "Débito",
      fee: pctOrDash(data.debito.percentual),
      tooltip: (
        <Stack gap={0.25}>
          <Typography variant="caption" fontWeight={700}>
            Cartão de débito
          </Typography>
          <Typography variant="caption">Taxa média: {pctOrDash(data.debito.percentual)}</Typography>
          <Typography variant="caption">
            Recebimento em {data.debito.diasRecebimento === 0 ? "D+0" : `${data.debito.diasRecebimento} dia(s)`}
          </Typography>
          {data.debito.amostras > 0 && (
            <Typography variant="caption">Base: {data.debito.amostras} pagamento(s) aprovado(s)</Typography>
          )}
        </Stack>
      ),
    });
  }

  return rows;
}

const NOT_CONFIGURED_MESSAGE: Record<IntegracaoProviderSlug, string> = {
  asaas: "Configure a API Key para ver as taxas da conta.",
  mercadopago: "Configure o Access Token para ver as taxas da conta.",
  notify: "Configure a API key para ver as taxas da conta.",
};

export default function IntegracaoFeesPanel({ provider, configurado }: IntegracaoFeesPanelProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["integracoes", provider, "fees"],
    queryFn: () => (provider === "asaas" ? getAsaasFees() : getMercadoPagoFees()),
    enabled: configurado,
    staleTime: 5 * 60 * 1000,
  });

  if (!configurado) {
    return (
      <Box sx={{ p: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {NOT_CONFIGURED_MESSAGE[provider]}
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Não foi possível carregar as taxas.
        </Typography>
      </Box>
    );
  }

  const rows = provider === "asaas" ? buildAsaasRows(data as AsaasPaymentFees) : buildMercadoPagoRows(data as MercadoPagoPaymentFees);
  const mpFonte = provider === "mercadopago" ? (data as MercadoPagoPaymentFees).fonte : null;

  return (
    <Box sx={{ px: 1.5, py: 1.25, height: "100%", bgcolor: "grey.50", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.75, display: "block" }}>
        Taxas · passe o mouse para detalhes
      </Typography>
      {mpFonte === "indisponivel" && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
          Sem histórico aprovado ainda — prazos conforme métodos habilitados na conta.
        </Typography>
      )}
      <Stack gap={0.25}>
        {rows.map((row) => (
          <Tooltip
            key={row.key}
            title={row.tooltip}
            placement="left"
            arrow
            disableInteractive
            slotProps={{
              tooltip: { sx: { maxWidth: 300, p: 1 } },
              popper: { sx: { pointerEvents: "none" } },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{
                py: 0.35,
                px: 0.5,
                borderRadius: 1,
                cursor: "help",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
                <Icon name={row.icon} width={16} height={16} color="primary.main" />
                <Typography variant="caption" fontWeight={600} noWrap>
                  {row.label}
                </Typography>
              </Stack>
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ flexShrink: 0 }}>
                {row.fee}
              </Typography>
            </Stack>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}
