import { z } from 'zod';

import { defineZodRoute } from '@sebrae/api-base';

const querySchema = z.object({
  includeDetails: z.coerce.boolean().default(false),
});

const responseSchema = z.object({
  ok: z.literal(true),
  details: z.string().optional(),
});

export default defineZodRoute({
  options: {
    schema: {
      querystring: querySchema,
      response: {
        200: responseSchema,
      },
    },
  },
  handler: async (request) => ({
    ok: true,
    ...(request.query.includeDetails ? { details: 'Rota registrada com schema Zod.' } : {}),
  }),
});
