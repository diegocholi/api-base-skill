# Workers

Este guia cobre a operação de filas e outbox no projeto consumidor.

## Worker de fila

O scaffold atual do consumidor gera um entrypoint local em `src/infra/queue/worker.ts`.
Esse arquivo deve importar `startQueueWorker` da LIB e receber registros gerados pela CLI.

Se o consumidor ainda estiver em formato legado, rode antes:

```bash
pnpm api-cli migrate
```

Isso garante os entrypoints locais de fila e outbox no padrão atual, em vez de
manter scripts apontando direto para arquivos publicados em `node_modules`.

Uso local:

```bash
pnpm run worker:dev
```

Uso com build:

```bash
pnpm run build
pnpm run worker:start
```

Variáveis mínimas:

- `REDIS_URL`
- `QUEUE_PREFIX` opcional

## Worker de outbox

O scaffold atual do consumidor também gera `src/infra/outbox/worker.ts`.
O padrão recomendado é usar esse entrypoint local, que importa `startOutboxWorker`.

Uso local:

```bash
pnpm run outbox:dev
```

Uso com build:

```bash
pnpm run build
pnpm run outbox:start
```

Execução direta do worker publicado continua disponível apenas como fallback:

```bash
pnpm exec tsx ./node_modules/@sebrae/api-base/dist/infra/outbox/worker.js
```

ou, após build:

```bash
node ./node_modules/@sebrae/api-base/dist/infra/outbox/worker.js
```

Variáveis mínimas:

- `DATABASE_URL` ou `DB_URL`
- `REDIS_URL`
- `OUTBOX_INTERVAL_MS`
- `OUTBOX_BATCH_SIZE`

## Recomendação operacional

- rode workers em réplicas separadas da API;
- ajuste batch e intervalo conforme o volume;
- valide Redis e banco no ambiente antes do rollout.

## Referências relacionadas

- [API](./api.md)
- [Variáveis de ambiente](./env.md)
- [Implantação](./deploy.md)
- [Outbox](./outbox.md)
