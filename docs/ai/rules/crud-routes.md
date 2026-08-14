# CRUD — rotas e verbos

Padrão **alvo** (rotas legadas `list` / `get` / `save` / `cancel` existem até migração).

| Operação | UI `api/*.ts` | HTTP | Rota |
|----------|---------------|------|------|
| Listar | `list{Entities}` | `GET` | `/{entidade}` |
| Detalhe | `find{Entity}` | `GET` | `/{entidade}/{id}` |
| Criar | `add{Entity}` | `POST` | `/{entidade}/add` |
| Atualizar | `save{Entity}` | `PATCH` | `/{entidade}/{id}` |
| Excluir | `delete{Entity}` | `DELETE` | `/{entidade}/{id}/delete` |

Read e Update compartilham `GET/PATCH /{entidade}/{id}` — diferem por método e body.

## Fora do CRUD

| Tipo | Path | Exemplos |
|------|------|----------|
| Negócio (pt) | português | `/financeiro/extrato` |
| Infra (en) | inglês | `/login`, `/notifications` |
| Integração | doc do parceiro | Asaas / Mercado Pago |

## Proibido em código novo (cliente UI)

`create*`, `get*`, `cancel*`, `patch*` — usar verbos da tabela acima.

## Notify.it (carteiro)

Sem versionamento no path. Modelo **vivo** (código atual):

| Operação | Método | Rota |
|----------|--------|------|
| Health | `GET` | `/notify/health` |
| VAPID público | `GET` | `/notify/vapid-public-key` |
| Enviar push | `POST` | `/notify/push/send` |
| Enviar mail | `POST` | `/notify/mail/send` |
| Deploy begin | `POST` | `/notify/deploy/begin` |
| Deploy complete | `POST` | `/notify/deploy/complete` |
| Setup complete | `POST` | `/notify/setup/complete` |

Subscribe/unsubscribe de push ficam nos **apps consumidores**, não no notify.

Auth carteiro: `Authorization: Bearer ntf_…`. Health e VAPID públicos.
