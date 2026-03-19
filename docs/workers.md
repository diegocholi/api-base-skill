# Workers

Este guia cobre a operação de filas e outbox no projeto consumidor.

## Worker de fila

O scaffold atual do consumidor gera um entrypoint local em `src/infra/queue/worker.ts`.
Esse arquivo deve importar `startQueueWorker` da LIB e receber registros gerados pela CLI no formato declarativo `jobs: [...]`.
Os jobs gerados pela CLI usam `defineJob`, `ApiBaseJob` e `ApiBaseJobProcessorContext` de `@sebrae/api-base`,
sem exigir dependência direta de `bullmq` ou `pino` no consumidor.

Formato recomendado:

```ts
await startQueueWorker({
  jobs: [
    {
      definition: billingChargeJob,
      processor: processBillingChargeJob,
    },
  ],
});
```

O callback `register: async ({ queueService, logger }) => { ... }`
continua disponivel como escape hatch avancado e caminho de transicao para consumers legados.

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
Esse worker continua simples: ele drena a tabela `outbox` e publica no queue usando `aggregate` como fila e `type` como nome do job.
Descritores criados com `pnpm api-cli generate outbox-event <module> <event>` ou manualmente com `defineOutboxEvent(...)` ajudam apenas na autoria e validacao do publish; eles nao registram processors automaticamente.

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
- prefira agrupar jobs da mesma fila com `jobs: [...]` em vez de criar `registerWorker(...)` manual por job.
- mantenha a modelagem de jobs e outbox separada: outbox persiste evento, worker publica, e jobs consumidores continuam sendo definidos de forma explicita.

## Referências relacionadas

- [API](./api.md)
- [Variáveis de ambiente](./env.md)
- [Implantação](./deploy.md)
- [Outbox](./outbox.md)
