import { z } from 'zod';

import { defineZodRoute } from '@sebrae/api-base';

const bodySchema = z.object({
  idToken: z.string().min(1),
  nonce: z.string().optional(),
});

const responseSchema = z.object({
  provider: z.literal('google'),
  providerUserId: z.string(),
  email: z.string().optional(),
  emailVerified: z.boolean(),
});

export default defineZodRoute({
  options: {
    config: { auth: { public: true } },
    schema: {
      body: bodySchema,
      response: { 200: responseSchema },
    },
  },
  handler: async (request) => {
    const verifySocialIdToken = request.server.verifySocialIdToken;
    if (!verifySocialIdToken) {
      throw new Error('Social auth plugin not configured');
    }

    const identity = await verifySocialIdToken({
      provider: 'google',
      idToken: request.body.idToken,
      nonce: request.body.nonce,
    });

    return {
      provider: identity.provider,
      providerUserId: identity.providerUserId,
      email: identity.email,
      emailVerified: identity.emailVerified,
    };
  },
});
