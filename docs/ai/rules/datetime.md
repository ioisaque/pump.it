# Data e hora

Fuso e “agora” vêm do backend (`GET app/config` → `syncAppConfig`). Não usar relógio local para regra de negócio.

## Helpers canônicos

| Nome | Formato de saída |
|------|------------------|
| `DATA()` / `HORA()` / `DATA_HORA()` | Brasileiro (BR) |
| `DATE()` / `TIME()` / `DATE_TIME()` | Americano (US) |

- **Sem parâmetro** → instante atual (“agora”).
- **Com parâmetro** → formata string/datetime no **formato oposto** ao do helper  
  (ex.: `DATA(isoOuUs)` → BR; `DATE(br)` → US).

### Storage / API

- Data: `YYYY-MM-DD` via `US_DATE(v)` / `HOJE()` / `TODAY()`
- DateTime: `YYYY-MM-DD HH:mm:ss` via `AGORA_MESMO()` / `RIGHT_NOW()`

### UI

- Só data BR: `DATA(v)` → tipicamente `DD/MM/YY` ou `DD/MM/YYYY`
- DateTime BR: `DATA_HORA(v)`
- Hora BR: `HORA(v)`
- Equivalentes US: `DATE` / `DATE_TIME` / `TIME`

## Módulos canônicos

- API: `api.isaque.it/src/helpers/datetime.ts`
- UI: `sistema.isaque.it/src/domain/datahora/` (reexport em utils)

## Proibido

- `new Date()` para “hoje”/negócio (timestamp de webhook do provedor é exceção)
- `toLocaleDateString` / `toLocaleTimeString` direto
- Fuso fixo hardcoded (`America/Sao_Paulo`)
