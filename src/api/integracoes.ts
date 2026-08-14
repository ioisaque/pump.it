import { IntegracaoProviderSummary } from "domain/integracoes/types";
import { api } from "services/api";

const BASE = "sistema/integracoes";

export function listIntegracoes() {
  return api.get<{ providers: IntegracaoProviderSummary[] }>(BASE).then((r) => r.data);
}

export function getAsaasConfig() {
  return api.get(`${BASE}/asaas`).then((r) => r.data);
}

export function saveAsaasConfig(body: unknown) {
  return api.patch(`${BASE}/asaas`, body).then((r) => r.data);
}

export function getAsaasApiKey() {
  return api.get<{ apiKey: string }>(`${BASE}/asaas/api-key`).then((r) => r.data);
}

export function getAsaasWebhookToken() {
  return api.get<{ authToken: string }>(`${BASE}/asaas/webhook-token`).then((r) => r.data);
}

export function testAsaasSaqueWebhook() {
  return api
    .post<{
      ok: boolean;
      tokenOk: boolean;
      url: string;
      httpStatus: number | null;
      mensagem: string;
    }>(`${BASE}/asaas/webhook/test-saque`)
    .then((r) => r.data);
}

export function setupAsaasWebhook() {
  return api.post(`${BASE}/asaas/webhook/setup`);
}

export function getAsaasFees() {
  return api.get(`${BASE}/asaas/fees`).then((r) => r.data);
}

export function getMercadoPagoConfig() {
  return api.get(`${BASE}/mercadopago`).then((r) => r.data);
}

export function saveMercadoPagoConfig(body: unknown) {
  return api.patch(`${BASE}/mercadopago`, body).then((r) => r.data);
}

export function getMercadoPagoAccessToken() {
  return api.get<{ accessToken: string }>(`${BASE}/mercadopago/access-token`).then((r) => r.data);
}

export function getMercadoPagoPublicKey() {
  return api.get<{ publicKey: string }>(`${BASE}/mercadopago/public-key`).then((r) => r.data);
}

export function setupMercadoPagoWebhook(body?: unknown) {
  return api.post(`${BASE}/mercadopago/webhook/setup`, body);
}

export function getMercadoPagoFees() {
  return api.get(`${BASE}/mercadopago/fees`).then((r) => r.data);
}

export function getNotifyConfig() {
  return api.get(`${BASE}/notify`).then((r) => r.data);
}

export function saveNotifyConfig(body: unknown) {
  return api.patch(`${BASE}/notify`, body).then((r) => r.data);
}

export function getNotifyApiKey() {
  return api.get<{ apiKey: string }>(`${BASE}/notify/api-key`).then((r) => r.data);
}

export function testNotifyConnection(body?: { apiKey?: string }) {
  return api.post(`${BASE}/notify/test`, body ?? {}).then((r) => r.data);
}

export function completeNotifySetup(body: unknown) {
  return api.post(`${BASE}/notify/setup/complete`, body).then((r) => r.data);
}

export function getProvider(provider: string) {
  return api.get(`${BASE}/${provider}`).then((r) => r.data);
}

export function getProviderSyncAudit(provider: string) {
  return api.get(`${BASE}/${provider}/sync/audit`).then((r) => r.data);
}

export function getProviderSyncJob(provider: string, jobId: string) {
  return api.get(`${BASE}/${provider}/sync/jobs/${jobId}`).then((r) => r.data);
}

export function startProviderReconcile(provider: string, strict: boolean) {
  return api.post(`${BASE}/${provider}/sync/reconcile`, { strict });
}

export function listTelas() {
  return api.get<{ screens: Array<{ id: string; nome: string; path: string }> }>("sistema/telas").then((r) => r.data);
}
