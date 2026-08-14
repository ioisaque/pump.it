# Cores da marca (dogma)

Hex **imutáveis** para logo, tema e UI. Não aproximar nem inventar variantes.

| Cor | Hex |
|-----|-----|
| Vermelho | `#FF5356` |
| Verde | `#33CC66` |
| Azul | `#0076F3` |
| Amarelo | `#FFD22B` |
| Roxo | `#9900CC` |
| Rosa | `#F5617F` |

## Cubo no UserBar + Safari (os dois ao mesmo tempo)

- UserBar sticky: `backgroundColor: STATUS_BAR_AUTH` (`#FF5356`) → Safari 26 amostra a chrome
- Faces verde/amarelo: `#3dd889` / `#FFD23F` + **`opacity: 0.8`** sobre **underlay branco no mesmo clip** (não sobre o vermelho do UserBar)
- Face vermelha: `#FF5356` opaca
- Logo / tema / ícones: tabela acima

## Proibido

- Remover underlay branco das faces laterais (volta a sujar o verde com o vermelho)
- Remover a `opacity: 0.8` das faces laterais
- Voltar UserBar para `#fff` só por causa do cubo (quebra tint Safari) — use o underlay
