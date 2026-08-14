import AsaasProviderCard from "components/integracoes/AsaasProviderCard";
import MercadoPagoProviderCard from "components/integracoes/MercadoPagoProviderCard";
import NotifyProviderCard from "components/integracoes/NotifyProviderCard";
import { IntegracaoProviderSummary } from "domain/integracoes/types";
import { ComponentType } from "react";

export type IntegracaoAmbiente = "sandbox" | "producao";

export type AmbienteTheme = {
  main: string;
  light: string;
  dark: string;
  label: string;
  icon: string;
};

export type IntegracaoProviderSlug = "asaas" | "mercadopago" | "notify";

export const NOTIFY_THEME: AmbienteTheme = {
  main: "#3366CC",
  light: "#E8EEF9",
  dark: "#2952A3",
  label: "notify.it",
  icon: "mdi:bell-ring-outline",
};

export const AMBIENTE_THEME: Record<IntegracaoProviderSlug, Record<IntegracaoAmbiente, AmbienteTheme>> = {
  asaas: {
    sandbox: {
      main: "#ed6c02",
      light: "#fff3e0",
      dark: "#e65100",
      label: "Sandbox",
      icon: "mdi:flask-outline",
    },
    producao: {
      main: "#d32f2f",
      light: "#ffebee",
      dark: "#b71c1c",
      label: "Produção",
      icon: "mdi:rocket-launch-outline",
    },
  },
  mercadopago: {
    sandbox: {
      main: "#009EE3",
      light: "#e3f2fd",
      dark: "#0077b6",
      label: "Sandbox",
      icon: "mdi:flask-outline",
    },
    producao: {
      main: "#007EB7",
      light: "#e1f5fe",
      dark: "#005f8a",
      label: "Produção",
      icon: "mdi:rocket-launch-outline",
    },
  },
  notify: {
    sandbox: NOTIFY_THEME,
    producao: NOTIFY_THEME,
  },
};

export function getAmbienteTheme(provider: IntegracaoProviderSlug, ambiente: IntegracaoAmbiente): AmbienteTheme {
  return AMBIENTE_THEME[provider][ambiente];
}

export const PROVIDER_CARDS: Record<
  string,
  ComponentType<{ provider: IntegracaoProviderSummary; onSync?: () => void }>
> = {
  asaas: AsaasProviderCard,
  mercadopago: MercadoPagoProviderCard,
  notify: NotifyProviderCard,
};

type SyncItemKey = "syncPessoas" | "syncFaturas" | "transferenciasAutomaticas";

export type IntegracaoSyncItemConfig = {
  key: SyncItemKey;
  icon: string;
  label: string;
  desc: string;
};

export const INTEGRACAO_SYNC_ITEMS: Record<IntegracaoProviderSlug, IntegracaoSyncItemConfig[]> = {
  asaas: [
    {
      key: "syncPessoas",
      icon: "groups",
      label: "Sync Pessoas / Clientes",
      desc: "CRUD de pessoas → clientes Asaas",
    },
    {
      key: "syncFaturas",
      icon: "mdi:file-document-outline",
      label: "Sync Faturas",
      desc: "Cada fatura → cobrança no Asaas",
    },
    {
      key: "transferenciasAutomaticas",
      icon: "mdi:bank-transfer",
      label: "Transferências automáticas",
      desc: "Executa agendamentos PIX desta integração",
    },
  ],
  mercadopago: [
    {
      key: "syncPessoas",
      icon: "groups",
      label: "Sync Pessoas / Clientes",
      desc: "CRUD de pessoas → clientes Mercado Pago",
    },
    {
      key: "syncFaturas",
      icon: "mdi:file-document-outline",
      label: "Sync Faturas",
      desc: "Cada fatura → pagamento no Mercado Pago",
    },
    {
      key: "transferenciasAutomaticas",
      icon: "mdi:bank-transfer",
      label: "Transferências automáticas",
      desc: "Executa agendamentos PIX desta integração",
    },
  ],
  notify: [],
};

export const INTEGRACAO_PROVIDER_META: Record<
  IntegracaoProviderSlug,
  { nome: string; logoHeight: number }
> = {
  asaas: { nome: "Asaas", logoHeight: 15 },
  mercadopago: { nome: "Mercado Pago", logoHeight: 18 },
  notify: { nome: "notify.it", logoHeight: 26 },
};
