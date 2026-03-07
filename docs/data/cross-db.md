# Diretrizes de compatibilidade entre bancos

Use estas notas ao escrever repositórios SQL e migrações que devem rodar em
Postgres, MySQL e SQL Server.

As migrações são mantidas por dialeto em
`src/infra/db/migrations/{postgres,mysql,mssql}` e o runner escolhe a pasta
com base em `DB_DIALECT`.

## Tipos e indexacao

- Prefira `varchar(N)` para strings indexadas (emails, slugs). O MySQL não consegue indexar
  colunas `text` inteiras sem um tamanho.
- Use `text` para campos grandes não indexados.
- Represente booleanos de forma portavel (armazenar como `tinyint`/`bit` no SQL Server se
  necessário).
- Para IDs, prefira UUIDs gerados na app para evitar comportamento de auto-incremento
  especifico de dialeto.

## Restrições únicas e collation

- Postgres e sensivel a caixa por default. MySQL e SQL Server geralmente são
  case-insensitive dependendo do collation.
- Normalize identificadores sensiveis (email, username) na app antes de salvar.
- Mantenha constraints únicas em colunas normalizadas para evitar colisões cross-db.

## Data/hora e defaults

- Armazene datas em UTC. Evite misturar horario local.
- Prefira timestamps atribuidos pela app (ISO strings) para evitar defaults especificos
  de dialeto.
- Se usar defaults no DB, verifique a funcao equivalente por dialeto (por exemplo
  `now()` vs `CURRENT_TIMESTAMP` vs `SYSUTCDATETIME()`).

## Payloads JSON

- Postgres usa `jsonb`, MySQL usa `json`, SQL Server usa `nvarchar(max)` ou `json`.
- Para MSSQL, armazene JSON como string e parse no read.

## Notas de SQL Server

- Use `datetime2` para melhor precisao.
- Collations do SQL Server geralmente são case-insensitive; normalize na app quando necessário.
- Garanta que strings de conexão incluam opções TLS (por exemplo `encrypt=false`
  localmente ou `trustServerCertificate=true`).
