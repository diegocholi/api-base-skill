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

const userCreatedJob = defineJob({
  queueName: 'events',
  jobName: 'user.created',
  schema: userCreatedJobSchema,
});

await queue.addJob(userCreatedJob, payload, {
  requestId,
  jobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
});
```

### Entradas

- `defineJob({ queueName, jobName, schema })`.
- `addJob(definition, payload, options)`.
- `startQueueWorker({ jobs })` para o wiring recomendado do consumidor.
- `options.requestId` propaga correlacao para logs do enqueue.
- `queuePlugin` aplica defaults: attempts=3, backoff exponencial, removeOnComplete=true.
- jobs locais podem tipar processor e logger com `ApiBaseJob` e `ApiBaseJobProcessorContext`
  importados de `@sebrae/api-base`.
- no scaffold atual, para contratos estaveis prefira `pnpm api-cli generate job <module> <job>`
  e use `--shared` apenas para jobs transversais.
- `registerJobSchema(...)`, `add(...)` e `register: async (...) => { ... }` continuam disponiveis como caminho low-level/legacy.

### Saidas

- Job enfileirado e logado (quando logger existe).
- Payload validado via Zod quando schema registrado.

Observacao:

- caminhos como `src/infra/queue/worker.ts` sao uma convencao comum do consumidor, nao um arquivo garantido pelo scaffold em todos os projetos.

## Erros e códigos de status

- Falha de validação de schema gera erro antes de enfileirar.
- Erros de Redis propagam e viram 500/503 conforme handler.

## Exemplos

### Básico

```ts
const pingJob = defineJob({
  queueName: 'default',
  jobName: 'ping-job',
  schema: pingJobSchema,
});

await queue.addJob(pingJob, { message: 'hello' });
```

### Entry point local do consumidor

```ts
import type { ApiBaseJob, ApiBaseJobProcessorContext } from '@sebrae/api-base';
import { startQueueWorker } from '@sebrae/api-base';

import { billingChargeJob } from '@/modules/billing/application/jobs';
import type { BillingChargeJobPayload } from '@/modules/billing/application/jobs';

export const processBillingChargeJob = async (
  _job: ApiBaseJob<BillingChargeJobPayload>,
  _context: ApiBaseJobProcessorContext,
): Promise<{ ok: true }> => ({ ok: true });

export const startWorker = async () => {
  await startQueueWorker({
    jobs: [
      {
        definition: billingChargeJob,
        processor: processBillingChargeJob,
      },
    ],
  });
};
```

### Avançado

```ts
await queue.addJob(userCreatedJob, payload, {
  requestId: request.requestId,
  jobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
});
```

## Como um code agent decide usar este contrato

- no scaffold atual, prefira gerar descritores em `src/modules/<module>/application/jobs`;
- use `src/shared/jobs` apenas para jobs cross-cutting;
- se a tarefa so enfileira um job novo, prefira `queue.addJob(...)` em vez de repetir `registerJobSchema(...)` e `add(...)`;
- se o worker local ja estiver em `jobs: [...]`, preserve esse formato e adicione apenas a registration nova;
- nao invente worker path, bootstrap ou registry sem localizar o padrao real do consumidor;
- trate idempotencia do processor como obrigatoria quando houver retry.

## Anti-padrões

- Enviar payload sem schema.
- Jobs enormes (payload grande).
- Retries agressivos sem backoff.

## Checklist de revisão

- [ ] Job definido com `defineJob(...)` ou schema registrado explicitamente no caminho legado.
- [ ] Payload pequeno e validado.
- [ ] `attempts/backoff` configurados.
- [ ] Worker trata idempotência.
