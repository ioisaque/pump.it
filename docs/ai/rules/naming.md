# Nomenclatura

Ver também [`terminology.md`](terminology.md).

## Idioma

| Contexto | Idioma | Exemplos |
|----------|--------|----------|
| Entidades de negócio | Português | `pessoa`, `plano`, `contrato`, `fatura` |
| UI / labels | Português (pt-BR) | "Adicionar pessoa" |
| Infraestrutura | Inglês | `auth`, `hooks`, `repository`, `gateway` |
| Integrações | Nome próprio + slug | `Asaas` / `asaas` |

## UI (React)

| Artefato | Arquivo | Export |
|----------|---------|--------|
| Componente | `components/.../PascalCase.tsx` | **default** |
| View rota | `views/{entidade}/{action}.tsx` | **default** |
| Modal | `components/{entidade}/modals/*Dialog.tsx` | **default** |
| Hook | `hooks/use{Entity}.ts` | **default** |
| API client | `api/{entidade}.ts` | named (`listPessoas`) |
| Domínio | `domain/{entidade}/*.ts` | named |

Pasta `{entidade}` no **plural** (`pessoas`, `faturas`).

## API / Nest

| Artefato | Arquivo | Export |
|----------|---------|--------|
| Controller | `{resource}.controller.ts` | `{Resource}Controller` |
| Use-case | `{verb}.ts` | `{Verb}{Entity}` |
| DTO | `{action}-{entity}-body.ts` | `{Action}{Entity}Body` |
| View-model | `{entity}-view-model.ts` | `{Entity}ViewModel` |
| Repository port | `{entity}.repository.ts` | `{Entity}Repository` |
| Prisma adapter | `prisma-{entity}.repository.ts` | `Prisma{Entity}Repository` |

## Case nos boundaries

| Camada | Convenção |
|--------|-----------|
| JSON / DB | `snake_case` |
| TypeScript | `camelCase` |
| Conversão | só em mappers e view-models |
