# Guia de testes

## Suite principal

```bash
pnpm run test
pnpm run test:watch
pnpm run test:coverage
```

## Integração

Suba as dependências:

```bash
docker compose -f docker-compose.test.yml up -d
```

Para MySQL ou MSSQL:

```bash
docker compose -f docker-compose.test.mysql.yml up -d
docker compose -f docker-compose.test.mssql.yml up -d
```

Execução:

```bash
INTEGRATION_TESTS=true pnpm run test
```

Overrides:

- `TEST_DATABASE_URL`
- `TEST_DB_URL`
- `TEST_REDIS_URL`
- `TEST_DB_DIALECT`

## Validação da documentação

- `pnpm run docs:links`
- `pnpm run docs:examples:typecheck`

## Referências relacionadas

- [Exemplos](./examples.md)
- [Migrações](./migrations.md)
