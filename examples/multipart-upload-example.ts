import { z } from 'zod';

import { ValidationError, defineZodRoute } from '@sebrae/api-base';

const uploadResponseSchema = z.object({
  ok: z.literal(true),
  filename: z.string(),
  mimetype: z.string(),
});

export default defineZodRoute({
  options: {
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        201: uploadResponseSchema,
      },
    },
  },
  handler: async (request, reply) => {
    const file = await request.file();

    if (!file) {
      throw new ValidationError('Arquivo nao enviado');
    }

    await file.toBuffer();

    reply.code(201);
    return {
      ok: true,
      filename: file.filename,
      mimetype: file.mimetype,
    };
  },
});
