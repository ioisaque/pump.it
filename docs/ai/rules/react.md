# Padrões React (UI)

## Camadas

```
View → useQuery/useMutation → api/*.ts → axios → API
```

## Componentes

| Regra | Detalhe |
|-------|---------|
| Dialogs | `components/{entidade}/modals/`; estado **dentro** do dialog |
| Listas | `EntityHeader` (card branco) + `SearchInput` + `GridTable` |
| Forms | `@unform/web` apenas — **proibido** `react-hook-form` |
| Inputs | altura **40px**, `size="small"`, `compactInputRootSx()` |

## Hooks

| Padrão | Uso |
|--------|-----|
| `use{Entity}` | detalhe com `enabled: !!id` |
| Presença | **Uma** conexão Socket.io — filhas via `useOutletContext` |

## Performance (obrigatório neste ecossistema)

- Colunas DataGrid: **sempre** `useMemo(() => [...], [deps])`
- Filtro de lista: client-side com `useMemo`; server-side só com debounce
- `GridTable`: não passar arrows inline em `getRowClassName` / `slots`
- Queries de modal: `enabled: open && !!id`

Não omitir `useMemo` nesses casos sob pretexto de React Compiler.

## Realtime

- Uma conexão Socket.io
- `sync:invalidate` → invalidar keys alinhadas a SyncQueryKeys (API)

## PWA

Status bar / safe-area / UserBar / login / install — [`pwa-rules.md`](pwa-rules.md).

## Limites

- Máx. **300 linhas** por arquivo
- Sem `axios` direto em `views/`
