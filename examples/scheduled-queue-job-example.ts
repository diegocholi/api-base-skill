import { z } from 'zod';

import { InfrastructureError, defineZodRoute } from '@sebrae/api-base';
import { paymentJob } from '@/modules/payments/application/jobs';

const bodySchema = z.object({
  paymentId: z.uuid(),
  method: z.enum(['pix', 'boleto']),
});

const responseSchema = z.object({
  id: z.string(),
  status: z.enum(['scheduled', 'rescheduled', 'processing']),
  delay: z.number(),
  runAt: z.date(),
});

const paymentDelayByMethod = {
  pix: 5 * 60 * 1000,
  boleto: 60 * 60 * 1000,
} as const;

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

    const method = request.body.method as keyof typeof paymentDelayByMethod;
    const delay = paymentDelayByMethod[method];
    const result = await request.server.queue.scheduleOrRescheduleJob(
      paymentJob,
      {
        paymentId: request.body.paymentId,
        method,
      },
      {
        jobId: `payment:${request.body.paymentId}:${method}`,
        delay,
        requestId: request.requestId,
      },
    );

    reply.code(202);

    return result;
  },
});
