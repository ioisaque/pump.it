# Banco de dados — charset e collation

## Padrão obrigatório

| Nível | Charset | Collation |
|-------|---------|-----------|
| Database | `utf8mb4` | `utf8mb4_unicode_ci` |
| Tabela | `utf8mb4` | `utf8mb4_unicode_ci` |
| Coluna string | herdado | `utf8mb4_unicode_ci` |

## Proibido

`utf8mb4_general_ci`, `utf8`, `utf8mb3`, `latin1`.

## Migrations

```sql
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `id_exemplo` ENGINE=InnoDB, CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER DATABASE `isaqueit_exemplo` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Produção: `prisma migrate deploy` — nunca `db push`.

## Flags string

Enums/categorias no banco e no código: **sempre CAIXA ALTA** (`ENTRADA`, `MANUAL`). Labels pt-BR só na UI.
