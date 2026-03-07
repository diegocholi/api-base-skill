import { z } from 'zod';

import { defineZodRoute } from '@sebrae/api-base';

const responseSchema = z.object({
  ok: z.literal(true),
});

export default defineZodRoute({
  options: {
    config: {
      auth: { public: true },
    },
    schema: {
      response: {
        200: responseSchema,
      },
    },
  },
  handler: async () => ({ ok: true }),
});
