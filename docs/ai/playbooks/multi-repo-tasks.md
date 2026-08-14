# Playbook — tasks multi-repo

Quando a mudança cruza repos:

1. Um plano por impacto (ou `docs/tasks/<nome>/` com README indexando cada repo)
2. Ordem de implementação alinhada a [`deploy.md`](deploy.md)
3. Atualizar `docs/ai/rules/ports.md` se mudar porta
4. Não deixar docs stale (ex.: endpoints notify)

Tasks locais de um único repo: `docs/tasks/` daquele repo.
