import { z } from 'zod';

import { InfrastructureError, defineJob, defineZodRoute } from '@sebrae/api-base';

const bodySchema = z.object({
  userId: z.uuid(),
});

const userCreatedJob = defineJob({
  queueName: 'events',
  jobName: 'user.created',
  schema: bodySchema,
});

const responseSchema = z.object({
  queued: z.literal(true),
  jobId: z.string(),
});

export default defineZodRoute({
  options: {
    schema: {
      body: bodySchema,
      response: {
        202: responseSchema,
      },
    },
  },
  handler: async (request, reply) => {
    if (!request.server.queue) {
      throw new InfrastructureError('Fila não configurada');
    }

    const job = await request.server.queue.addJob(
      userCreatedJob,
      { userId: request.body.userId },
      {
        requestId: request.requestId,
        jobOptions: { attempts: 3 },
      },
    );

    reply.code(202);

    return {
      queued: true,
      jobId: String(job.id ?? 'pending'),
    };
  },
});
