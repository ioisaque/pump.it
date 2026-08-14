# Registro de portas

| Porta | Projeto | Dev | Produção |
|-------|---------|-----|----------|
| **3001** | `sistema.isaque.it` (UI admin) | isaque.local:3001 | SPA estática — sem PM2 |
| **3002** | `api.isaque.it` | :3002 | pm2 API |
| **3003** | `notify.it` (API) | :3003 | pm2 `notify-it` |
| **3004** | `notify.it` admin (Vite HMR) | :3004 | build estático servido pela API :3003 |
| **3005** | `cliente.isaque.it` | :3005 | SPA estática — sem PM2 |
| **3006** | `barcode.it` | :3006 | pm2 `barcode.it` |
| **3007** | `pump.it` (API) | :3007 | pm2 `pump-it` |
| **3008** | `pump.it` (UI) | :3008 | SPA estática — sem PM2 |

**Próximo Node livre:** `3009`, `3010`, …

## URLs públicas (`api.isaque.it`)

| Path | Porta local |
|------|-------------|
| `/` | 3002 |
| `/notify.it` (e aliases `/notify/`) | 3003 |
| `/barcode.it` | 3006 |
| `/pump.it` | 3007 |

Apache: paths **mais específicos** antes do catch-all `/`.
