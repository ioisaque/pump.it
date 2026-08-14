# AGENTS — pump.it/ui

UI React PWA (`pump.it`). Fonte: este arquivo + [`docs/ai/`](docs/ai/).

## Obrigatório

- Diff mínimo; sem rename/arquivos extras sem pedido.
- Commit/push/PR **só** com pedido explícito. Mensagem: **uma linha** (~72) com prefixo (`docs:` / `feat:` / `fix:` / …). Sem corpo, bullets ou trailers. Não usar o sparkle ✨ do SCM.
- VPS: diagnóstico read-only até permissão explícita.
- Gate de padrão — [`docs/ai/playbooks/agent-workflow.md`](docs/ai/playbooks/agent-workflow.md).
- Terminologia: **UI** (não FE). Flags string **UPPERCASE**.
- Datas: helpers — [`docs/ai/rules/datetime.md`](docs/ai/rules/datetime.md).
- PWA: espelhar `cliente.isaque.it` — [`docs/ai/rules/pwa-rules.md`](docs/ai/rules/pwa-rules.md).
- Cores de marca — [`docs/ai/rules/brand-colors.md`](docs/ai/rules/brand-colors.md).
- Porta UI **3008**. Multi-academia: path `/:academiaSlug/...`.
- Um frontend: admin e aluno (nav por `nivel`).

## Índice `docs/ai/`

| Área | Path |
|------|------|
| Rules | [`docs/ai/rules/`](docs/ai/rules/) |
| PWA | [`docs/ai/rules/pwa-rules.md`](docs/ai/rules/pwa-rules.md) |
| Cores | [`docs/ai/rules/brand-colors.md`](docs/ai/rules/brand-colors.md) |
| Playbooks | [`docs/ai/playbooks/`](docs/ai/playbooks/) |
| Módulo | [`docs/ai/modules/ui-pump.md`](docs/ai/modules/ui-pump.md) |
| Templates | [`docs/ai/templates/`](docs/ai/templates/) |

`.cursor/rules/agents-pointer.mdc` e `CLAUDE.md` só apontam para cá.
