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

1. Enfileire eventos usando `OutboxService.enqueueEvent` dentro da transação.
2. Rode o worker de outbox separadamente.

Exemplo (pseudo):

```ts
await db.transaction(async (tx) => {
  await repo.create(tx, payload);
  await outboxService.enqueueEvent(tx, {
    aggregate: 'user',
    type: 'user.created',
    payload: { id: '123' },
  });
});
```

## Idempotência

- Eventos podem ser reprocessados em falhas.
- Use chaves idempotentes nos consumidores (ex.: `jobId` baseado no `outbox.id`).

## Falhas comuns

- Tabela `outbox` ausente: rode `pnpm api-cli db enable-outbox` ou o script equivalente e depois `pnpm api-cli db migrate` ou o comando real de migracao do projeto.
- `DB_URL` ausente impede o worker de iniciar.
- `REDIS_URL` ausente impede publicacao no queue.
- Payloads grandes devem ser evitados.
- O `init` não gera `src/infra/outbox/worker.ts`; se o serviço precisar de um entrypoint
  local, ele deve ser criado no consumidor.

## Ajustes recomendados

- `OUTBOX_INTERVAL_MS`: reduza para maior latência (custo maior de queries).
- `OUTBOX_BATCH_SIZE`: aumente para maior throughput.

## Referências

- `src/infra/outbox/outbox.repository.ts`
- `src/infra/outbox/outbox.service.ts`
- `node_modules/@sebrae/api-base/dist/infra/outbox/worker.js`
- `docs/workers.md`
