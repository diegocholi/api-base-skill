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
- `startWorker()` inicia workers padrao quando o consumidor implementa esse bootstrap.
- `options.requestId` propaga correlacao para logs do enqueue.
- `queuePlugin` aplica defaults: attempts=3, backoff exponencial, removeOnComplete=true.
- jobs locais podem tipar processor e logger com `ApiBaseJob` e `ApiBaseLogger`
  importados de `@sebrae/api-base`.

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
queue.registerJobSchema('default', 'ping-job', pingJobSchema);
await queue.add('default', 'ping-job', { message: 'hello' });
```

### Entry point local do consumidor

```ts
import { startQueueWorker } from '@sebrae/api-base';
import type { ApiBaseJob, ApiBaseLogger } from '@sebrae/api-base';

import { billingChargeJobName, billingQueueName } from '@/shared/queue-jobs';
import type { BillingChargeJobPayload } from '@/shared/queue-jobs';

const createBillingChargeJobProcessor =
  (_logger: Pick<ApiBaseLogger, 'info'>) =>
  async (_job: ApiBaseJob<BillingChargeJobPayload>): Promise<{ ok: true }> => ({ ok: true });

export const startWorker = async () => {
  await startQueueWorker({
    register: async ({ queueService, logger }) => {
      const billingChargeProcessor = createBillingChargeJobProcessor(logger);

      queueService.registerQueue(billingQueueName);
      queueService.registerWorker(billingQueueName, async (job) => {
        if (job.name === billingChargeJobName) {
          return billingChargeProcessor(job);
        }

        logger.warn({ jobName: job.name, queue: job.queueName }, 'Unknown job received');
        return { ok: false };
      });
    },
  });
};
```

### Avançado

```ts
await queue.add('events', 'user.created', payload, {
  requestId: request.requestId,
  jobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
});
```

## Como um code agent decide usar este contrato

- se o consumidor ja tiver registro central de filas e jobs, reuse esse ponto de extensao;
- se a tarefa so enfileira um job novo, registre schema antes do primeiro `add`;
- nao invente worker path, bootstrap ou registry sem localizar o padrao real do consumidor;
- trate idempotencia do processor como obrigatoria quando houver retry.

## Anti-padrões

- Enviar payload sem schema.
- Jobs enormes (payload grande).
- Retries agressivos sem backoff.

## Checklist de revisão

- [ ] Job schema registrado antes do `add`.
- [ ] Payload pequeno e validado.
- [ ] `attempts/backoff` configurados.
- [ ] Worker trata idempotência.
