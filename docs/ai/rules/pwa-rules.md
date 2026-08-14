# PWA (status bar / safe-area)

## Quando aplicar

UIs isaque.it com PWA `black-translucent` e cubo da marca no topo:

| App | Path |
|-----|------|
| **Modelo** | `cliente.isaque.it` |
| Admin | `sistema.isaque.it` |
| Notify admin | `notify.it/admin` |
| pump.it UI | `pump.it/ui` |

Qualquer mudança nestes arquivos deve permanecer **idêntica** ao cliente (copiar, não reinventar).

## Peças

| Arquivo | Papel |
|---------|--------|
| `components/layout/FakeStatusBar.tsx` | Faixa fixed na safe-area; exporta `SAFE_AREA_TOP` e `AppSafeArea` |
| `components/layout/CubeBackground.tsx` | Cubo 3 faces; `CUBE_TOP_SPLIT_PCT=22`, `CUBE_TIP_Y_PCT=68` |
| `components/layout/UserBar.tsx` | Sticky; `paddingTop = spacing + safe-area` para o cubo cobrir o notch |
| `utils/brand-stripe.ts` | `BRAND_STRIPE_GRADIENT` — mesmas % do topo do cubo |
| `utils/app-chrome.ts` | `PAGE_BACKGROUND` (`#f4f1e6`), `applyAppChrome` / `applyPageChrome` / `applyBlockedChrome` |

## Regras

### Meta / manifest

- `apple-mobile-web-app-status-bar-style`: **`black-translucent`** (iOS — conteúdo sob a barra)
- `theme-color` / `setThemeColor()`: cor **sólida** da status bar no Android (PWA e Chrome)
  - Guest (FakeStatusBar): **`#FFFFFF`** (`STATUS_BAR_GUEST`) + ícones **pretos** (`default`)
  - Logado (UserBar/cubo): **`#FF5356`** (`STATUS_BAR_AUTH`) + ícones **brancos** (`black-translucent` — forçar; luminância do vermelho deixa o iOS escolher preto)
  - Bloqueado: `BLOCKED_BACKGROUND` + ícones brancos
  - Login/install: fundo e ícones conforme `prefers-color-scheme` (claro → pretos; escuro → brancos)
- Espelhar `theme-color` em light **e** dark (`media`) — senão o dark mode do aparelho força barra preta
- Fundo da página (`PAGE_BACKGROUND` `#f4f1e6`) **≠** cor da status bar
- `manifest.theme_color` / `background_color`: **`#f4f1e6`** (splash); em runtime o meta manda
- `viewport-fit=cover` no viewport

### Toast (`react-hot-toast`)

- Em `App.tsx`, `Toaster` com `containerStyle.top = calc(16px + SAFE_AREA_TOP)` (e `bottom` com `safe-area-inset-bottom`)
- Sem isso o toast fica sob a Dynamic Island / notch (`black-translucent` + `viewport-fit=cover`)

### Limite por plataforma (comparativo)

| Contexto | O que dá | O que não dá |
|----------|----------|--------------|
| **PWA iOS** | Cubo sob o notch (`black-translucent` + UserBar) — referência visual | — |
| **PWA Android** | Tingir status bar com cor sólida (`STATUS_BAR_AUTH` / guest) | Cubo/FakeStatusBar **atrás** dos ícones — o Chrome instalado ainda não desenha edge-to-edge no **topo**; feature Chromium em andamento |
| **Chrome Android (aba)** | `theme-color` sólido (light); dark do sistema pode forçar preto | FakeStatusBar no safe-area do sistema |
| **Safari ≤18 (aba)** | `theme-color` sólido | Cubo no notch — só após instalar como PWA |
| **Safari 26+ (aba)** | Tint via sticky UserBar = `STATUS_BAR_AUTH`; cubo ok com underlay branco nas faces | Cubo no notch — só após instalar como PWA |

**Resposta direta:** deixar o Android PWA **igual** ao iOS (logo contínua na status bar) **não é possível hoje** com APIs web estáveis. A barra vermelha sólida é a aproximação correta até o Chrome liberar edge-to-edge no topo para WebAPK/PWA.

### Rotas (`AppChromeBar` + `AppSafeArea`)

- FakeStatusBar **oculta** em `/login` e `/install`
- Fora disso: `cube={false}` + cor sólida (ex. `#FFFFFF`) quando guest; some quando autenticado (UserBar assume)
- `AppSafeArea` **não** aplica `paddingTop` em login/install (a página pinta atrás do notch)

### UserBar (logado)

- Sticky `top: 0`
- `backgroundColor: STATUS_BAR_AUTH` (`#FF5356`) — Safari 26 amostra sticky; Android via `theme-color`
- Cubo: faces laterais com underlay `#fff` + `opacity: 0.8` — ver `brand-colors.md`
- `paddingTop: calc(theme.spacing(1.25) + env(safe-area-inset-top, 0px))`
- `CubeBackground` absolute preenchendo o wrapper (incluindo a safe-area)
- FakeStatusBar retorna `null` se `isAuthenticated && !accountBlocked` (ainda chama `setThemeColor(STATUS_BAR_AUTH)`)

### Login / signin

- Shell: `Box component="main"` (não `Container` full-bleed)
- `minHeight: 100dvh`, `px: 2`, `paddingTop`/`paddingBottom` = safe-area
- `useLayoutEffect`: `applyAppChrome(bg)` no mount; cleanup `applyPageChrome()`
- `bg` = `#FFFFFF` / `#000000` conforme `prefers-color-scheme`

### Install

- Mesmo `applyAppChrome(bg)` / cleanup `applyPageChrome()`
- Faixa local `data-fake-status-bar` + `data-cube="true"` com altura `SAFE_AREA_TOP`
- Fundo da faixa: **`BRAND_STRIPE_GRADIENT`** (não hardcode 30%/70%)

### Auth

- Contexto expõe `accountBlocked` (boolean ou objeto truthy). FakeStatusBar / `AppSafeArea` dependem disso.
- Conta bloqueada: fundo vermelho (`applyBlockedChrome` / `BLOCKED_BACKGROUND`); FakeStatusBar fica visível

## Proibido

- Inventar FakeStatusBar / proporções de cubo diferentes do cliente
- Status bar azul / `theme-color` de marca antiga (`#0d47a1`)
- Deixar a status bar Android seguir só o fundo da página (`#f4f1e6`) ou o dark mode preto do aparelho — usar `STATUS_BAR_AUTH` / `STATUS_BAR_GUEST` via `setThemeColor`
- `apple-mobile-web-app-status-bar-style` diferente de `black-translucent`
- Install com gradient inline desatualizado (30%) em vez de `BRAND_STRIPE_GRADIENT`
- Empurrar conteúdo com safe-area no login/install via `AppSafeArea` (quebra o bleed)
