import { z } from 'zod';

import { createScopeOrOwnerPolicy, defineZodRoute } from '@sebrae/api-base';

const responseSchema = z.object({
  ok: z.literal(true),
});

const allowOwnAccountOrAdmin = createScopeOrOwnerPolicy(
  'admin.subscriptions.manage',
  'query.accountId',
);

export default defineZodRoute({
  options: {
    config: {
      auth: { provider: 'internal' },
    },
    schema: {
      querystring: z.object({
        accountId: z.string().min(1),
      }),
      security: [{ bearerAuth: [] }],
      response: {
        200: responseSchema,
      },
    },
    preHandler: async (request, reply) => {
      const requirePolicy = request.server.requirePolicy?.(allowOwnAccountOrAdmin, {
        name: 'allowOwnAccountOrAdmin',
      });
      if (!requirePolicy) {
        reply.code(503);
        throw new Error('Auth guard not configured');
      }
      await requirePolicy(request, reply);
    },
  },
  handler: async () => ({ ok: true }),
});
