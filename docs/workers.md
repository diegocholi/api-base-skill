# Workers

Este guia cobre a operação de filas e outbox no projeto consumidor.

## Worker de fila

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

O scaffold atual do consumidor não gera um arquivo local `src/infra/outbox/worker.ts`.
Quando o serviço usa outbox, o caminho mais comum é criar um entrypoint local que importe
o worker publicado pela LIB, ou executar esse worker publicado diretamente.

Execução direta do worker publicado:

```bash
pnpm exec tsx ./node_modules/@sebrae/api-base/dist/infra/outbox/worker.js
```

ou, após build:

```bash
node ./node_modules/@sebrae/api-base/dist/infra/outbox/worker.js
```

Se o time preferir um entrypoint próprio do consumidor, ele deve ser criado manualmente.

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
