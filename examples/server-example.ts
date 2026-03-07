import path from 'node:path';

import { createApp, env } from '@sebrae/api-base';

const resolveRoutesDir = (): string => {
  const customDir = process.env.ROUTES_DIR?.trim();

  if (customDir) {
    return path.resolve(process.cwd(), customDir);
  }

  const entrypoint = process.argv[1] ?? '';
  const isTsRuntime = entrypoint.endsWith('.ts');

  return path.resolve(process.cwd(), isTsRuntime ? 'src/http/routes' : 'dist/http/routes');
};

const start = async (): Promise<void> => {
  const app = createApp({ env, routesDir: resolveRoutesDir() });
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
};

void start();
