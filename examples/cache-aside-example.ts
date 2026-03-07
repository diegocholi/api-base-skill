import { z } from 'zod';

import { CACHE_TTL_10_MINUTES, InfrastructureError, defineZodRoute } from '@sebrae/api-base';

const paramsSchema = z.object({
  id: z.uuid(),
});

const responseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

export default defineZodRoute({
  options: {
    schema: {
      params: paramsSchema,
      response: {
        200: responseSchema,
      },
    },
  },
  handler: async (request) => {
    if (!request.server.cache) {
      throw new InfrastructureError('Redis não configurado para cache');
    }

    return request.server.cache.cacheAside(
      `users:${request.params.id}`,
      CACHE_TTL_10_MINUTES,
      async () => ({
        id: request.params.id,
        name: 'Ada Lovelace',
      }),
    );
  },
});
