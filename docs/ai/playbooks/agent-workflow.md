# Playbook — workflow do agente

## Gate de confirmação

Parar e pedir confirmação quando:

1. Pedido **não coberto** por `docs/ai/`, `docs/flows/`, `AGENTS.md`
2. Pedido **altera padrão** (nomenclatura, rotas, camadas, query keys, deploy…)
3. **Execução direta** sem plano — confirmar escopo

Até OK explícito: sem tasks novas de convenção, sem migrations/workflows, sem commit.

**Exceções:** escopo explícito alinhado às regras; ou só leitura.

## Antes de codar

1. Ler `docs/ai/` + `docs/flows/` / `docs/tasks/` do repo
2. Sem breaking change sem pedido
3. Mapear impacto UI / API / Notify / Barcode
4. Escopo mínimo

## Antes de encerrar

1. `npm run build` → `typecheck` → `lint` (repos tocados)
2. Atualizar docs se nova convenção ou query key
3. Commit **só** se o usuário pedir

## Commits

- Só com pedido explícito; push/PR só com pedido
- **Uma linha**, ~72 chars, prefixo: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Sem corpo, bullets, parágrafos ou inglês longo estilo changelog
- Sem trailers (`Co-authored-by`, etc.)
- **Não usar** o sparkle ✨ do Source Control (gera texto longo + atribuição)

Exemplo: `docs: reorganiza regras em AGENTS.md e docs/ai`
