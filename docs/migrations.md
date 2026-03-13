# Migrações

O consumidor segue um fluxo SQL-first por dialeto.

## Comandos principais

- `pnpm api-cli db create <nome>`
- `pnpm api-cli db migrate`
- `pnpm run db:migrate` quando esse script existir no consumidor
- `pnpm run migrations:check`
- `pnpm run db:generate` apenas para times que usam geração com Drizzle

## Estrutura esperada

- `src/infra/db/migrations/postgres`
- `src/infra/db/migrations/mysql`
- `src/infra/db/migrations/mssql`

Cada dialeto mantém arquivos `.sql` e `meta/_journal.json`.

## Fluxo recomendado

1. Crie a migração com `pnpm api-cli db create <nome>`.
2. Preencha os três dialetos quando o serviço for multi-banco.
3. Rode `pnpm api-cli db migrate` ou o script equivalente do projeto.
4. Rode `pnpm run migrations:check`.
5. Faça rollout somente depois de validar a migração no ambiente alvo.

## Regras

- toda mudança de schema exige migração;
- não altere schema manualmente em produção;
- prefira migrações pequenas e revisáveis;
- execute migração antes de subir novas réplicas.

## Referências relacionadas

- [Implantação](./deploy.md)
- [Testes](./testing.md)
- [`docs/data/cross-db.md`](./data/cross-db.md)
