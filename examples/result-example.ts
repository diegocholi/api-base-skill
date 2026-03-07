import { z } from 'zod';

import { ValidationError, err, match, ok, type Result } from '@sebrae/api-base';

interface Input {
  name: string;
}

interface Output {
  id: string;
  name: string;
}

const inputSchema = z.object({
  name: z.string().min(3),
});

const createUser = async (input: Input): Promise<Result<Output>> => {
  const parsed = inputSchema.safeParse(input);

  if (!parsed.success) {
    return err(new ValidationError('Dados inválidos', z.flattenError(parsed.error), parsed.error));
  }

  return ok({ id: 'user-123', name: parsed.data.name });
};

const run = async () => {
  const result = await createUser({ name: 'Ada' });

  const message = match(result, {
    ok: (value) => `created:${value.id}`,
    err: (error) => `error:${error.code}`,
  });

  console.log(message);
};

void run();
