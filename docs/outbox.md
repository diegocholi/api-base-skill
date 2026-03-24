# Padrão Outbox

Este documento explica o padrão Outbox usado para publicar eventos de forma confiavel.

## Visão geral

O padrão Outbox garante que eventos de domínio sejam persistidos no banco
junto com a transação principal e depois publicados de forma assincrona.

Fluxo:

1. A transação salva dados de domínio e registra evento na tabela `outbox`.
2. O worker de outbox busca eventos pendentes.
3. O worker publica no queue (BullMQ) e marca como processado.

## Tabela outbox

Campos principais: `aggregate`, `type`, `payload`, `status`, `created_at`.

No projeto consumidor, a migration da `outbox` é opcional e deve ser habilitada somente
quando o serviço realmente usar o padrão outbox.

### Habilitar outbox no consumidor

Via CLI:

```bash
pnpm api-cli db enable-outbox
```

Ou via script criado pelo `init`:

```bash
pnpm run db:enable-outbox
```

Esse comando:

1. Cria a migration `*_outbox.sql` para `postgres`, `mysql` e `mssql`.
2. Atualiza os arquivos `meta/_journal.json`.
3. Falha com conflito se uma migration de outbox ja existir.

Depois de gerar a migration, aplique normalmente:

```bash
pnpm api-cli db migrate
```

## Como usar

1. Em contexto HTTP com banco configurado, use `request.server.outbox` dentro de `withOutboxTransaction(...)`.
2. Fora do runtime HTTP, injete qualquer writer compatível com `ApiBaseOutboxWriter`.
3. Para eventos estaveis e conhecidos, use opcionalmente `defineOutboxEvent(...)`.
4. Rode o worker de outbox separadamente.

Para code agents:

- no scaffold atual com banco configurado, prefira `request.server.outbox`; nao monte `OutboxRepository` ou `OutboxService` manualmente sem necessidade clara;
- use `enqueueDefinedEvent(...)` ou `enqueueOutboxEvent(...)` quando o evento for estavel e conhecido;
- mantenha `enqueueEvent(...)` quando `aggregate`, `type` ou payload forem realmente dinamicos.

Exemplo em rota/use case HTTP:

```ts
await withOutboxTransaction(request.server.db, request.server.outbox, async ({ tx, enqueueEvent }) => {
  await repo.create(tx, payload);
  await enqueueEvent({
    aggregate: 'user',
    type: 'user.created',
    payload: { id: '123' },
  });
});
```

Exemplo fora do HTTP com writer explícito:

```ts
await withOutboxTransaction(db, outboxService, async ({ tx, enqueueEvent }) => {
  await repo.create(tx, payload);
  await enqueueEvent({
    aggregate: 'user',
    type: 'user.created',
    payload: { id: '123' },
  });
});
```

Exemplo declarativo para evento estavel:

No scaffold atual, o caminho recomendado e gerar o descritor por modulo:

```bash
pnpm api-cli generate outbox-event orders created
```

Isso cria um arquivo em `src/modules/orders/application/events/created.event.ts`.
Para eventos transversais, use `--shared`, que gera em `src/shared/outbox-events`.

```ts
import { defineOutboxEvent, withOutboxTransaction } from '@sebrae/api-base';
import { z } from 'zod';

const orderCreatedEvent = defineOutboxEvent({
  aggregate: 'orders',
  type: 'orders.created',
  schema: z.object({
    id: z.string().min(1),
  }),
});

await withOutboxTransaction(db, outboxService, async ({ enqueueDefinedEvent }) => {
  await enqueueDefinedEvent(orderCreatedEvent, {
    id: 'order-1',
  });
});
```

Quando `aggregate`, `type` ou payload forem dinamicos de verdade, mantenha o caminho atual:

```ts
await withOutboxTransaction(db, outboxService, async ({ enqueueEvent }) => {
  await enqueueEvent({
    aggregate: aggregateFromDomain,
    type: typeFromDomain,
    payload,
  });
});
```

## Relacao com filas e jobs

- outbox persiste eventos de dominio dentro da transacao principal;
- o worker de outbox continua drenando registros e publicando no queue com `aggregate`, `type` e `payload`;
- `defineOutboxEvent(...)` nao substitui `defineJob(...)`;
- `pnpm api-cli generate outbox-event` gera apenas o descritor e o schema inicial;
- o consumidor ainda define jobs/processors normalmente quando precisar tratar os eventos publicados.

## Idempotência

- Eventos podem ser reprocessados em falhas.
- Use chaves idempotentes nos consumidores (ex.: `jobId` baseado no `outbox.id`).

## Falhas comuns

- Tabela `outbox` ausente: rode `pnpm api-cli db enable-outbox` ou o script equivalente e depois `pnpm api-cli db migrate` ou o comando real de migracao do projeto.
- `DB_URL` ausente impede `request.server.outbox` e o worker de iniciar.
- `REDIS_URL` ausente impede publicacao no queue.
- Payloads grandes devem ser evitados.
- O entrypoint local recomendado do consumidor fica em `src/infra/outbox/worker.ts`.

## Ajustes recomendados

- `OUTBOX_INTERVAL_MS`: reduza para maior latência (custo maior de queries).
- `OUTBOX_BATCH_SIZE`: aumente para maior throughput.

## Referências

- `src/infra/outbox/outbox.repository.ts`
- `src/infra/outbox/outbox.service.ts`
- `src/infra/outbox/transaction.ts`
- `docs/workers.md`
