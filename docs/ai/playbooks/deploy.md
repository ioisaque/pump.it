# Playbook — deploy

## Ordem

1. **API** (`api.isaque.it`) primeiro quando houver mudança de contrato
2. **Notify** no ar **antes** do cutover de clientes GHA que reportam deploy
3. **UIs** (`sistema`, `cliente`) — SPA estáticas
4. **Barcode** / outros serviços Node — independentes se path Apache já existir

## Secrets

Ver [`../rules/deploy-secrets.md`](../rules/deploy-secrets.md) — `SSH_HOST=isaque.it`.

## VPS

Diagnóstico read-only por padrão. Alterar Apache/PM2/env remoto **só** com permissão explícita na conversa.
