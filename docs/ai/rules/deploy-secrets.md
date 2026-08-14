# GitHub Actions — secrets SSH

| Secret | Valor |
|--------|-------|
| `SSH_HOST` | **`isaque.it`** |
| `SSH_USER` | `isaqueit` |
| `SSH_KEY` | chave privada de deploy (PEM) |

## `SSH_HOST`

- Domínio principal `isaque.it` (hostname puro).
- **Proibido:** `https://`, path, barra final.
- Fallback se DNS do runner falhar: IP do VPS; preferir voltar a `isaque.it`.

```bash
ssh -i ~/.ssh/deploy isaqueit@isaque.it "echo OK"
```
