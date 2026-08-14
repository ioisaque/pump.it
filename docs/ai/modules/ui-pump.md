# Módulo — UI pump.it

SPA React PWA. Porta dev **3008**. Produção: estático (sem PM2).

## Stack

MUI, TanStack Query, Unform, Iconify. PWA modelo `cliente.isaque.it`.

## Multi-tenant

- Path `/:academiaSlug/...` para academia
- `/login` sem slug → Master da plataforma → `/plataforma/academias`
- `/:academiaSlug/login` → admin/aluno da academia
- `/plataforma/*` para super-admin (CRUD academias)
- Token `@Pump:JWT`

## Papéis

`nivel` numérico (catalog). Aluno baixo; admin academia; Master = 10.

## Pastas

```
src/
├── api/
├── components/{entidade}/
├── domain/{entidade}/
├── views/{entidade}/
├── routes/
└── ...
```

## Master vs tenant

- `/login` (nivel 10, sem academia) → rotas em `/` e `/plataforma/*` **sem** forçar `/:academiaSlug`
- Nav geral (pessoas, tabelas, notificações/inbox, academias, config): disponível na plataforma
- Nav tenant (exercícios, fichas, avaliações, acessos, mensalidades): só com `/:academiaSlug`
- `/pessoas`: lista pessoas (`tipo=ALL` por padrão)

