# QueueService, jobs e workers

## Objetivo

Padronizar enfileiramento de jobs, schemas Zod e comportamento dos workers.

## Quando usar

- Para processamento assincroono e tarefas pesadas.
- Para eventos de domínio (ex: user.created).

## Quando NÃO usar

- Não use para operações sincronas pequenas.
- Não use payloads sem schema.

## Contrato

### Assinatura

```ts
const queue = new QueueService({ redisUrl, prefix, defaultJobOptions, logger });

queue.registerQueue('events');
queue.registerJobSchema('events', 'user.created', userCreatedJobSchema);
await queue.add('events', 'user.created', payload, {
  requestId,
  jobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
});
```

### Entradas

- `registerJobSchema(queueName, jobName, schema)` com Zod.
- `add(queue, job, payload, options)`.
- `startWorker()` inicia workers padrão (ver `src/infra/queue/worker.ts`).
- `options.requestId` propaga correlacao para logs do enqueue.
- `queuePlugin` aplica defaults: attempts=3, backoff exponencial, removeOnComplete=true.

### Saidas

- Job enfileirado e logado (quando logger existe).
- Payload validado via Zod quando schema registrado.

## Erros e códigos de status

- Falha de validação de schema gera erro antes de enfileirar.
- Erros de Redis propagam e viram 500/503 conforme handler.

## Exemplos

### Básico

```ts
queue.registerJobSchema('default', 'ping-job', pingJobSchema);
await queue.add('default', 'ping-job', { message: 'hello' });
```

### Avançado

```ts
await queue.add('events', 'user.created', payload, {
  requestId: request.requestId,
  jobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
});
```

## Anti-padrões

- Enviar payload sem schema.
- Jobs enormes (payload grande).
- Retries agressivos sem backoff.

## Checklist de revisão

- [ ] Job schema registrado antes do `add`.
- [ ] Payload pequeno e validado.
- [ ] `attempts/backoff` configurados.
- [ ] Worker trata idempotência.
