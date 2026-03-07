import { z } from 'zod';

import { ValidationError, parseWithZod } from '@sebrae/api-base';

const createUserInputSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
});

const run = () => {
  try {
    const input = parseWithZod(createUserInputSchema, {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });

    console.log(input.email);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(error.details);
    }
  }
};

run();
