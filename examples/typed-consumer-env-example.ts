import path from 'node:path';

import { z } from 'zod';

import { createApp, createDefineZodRoute, parseEnv } from '@sebrae/api-base';

import type { Env } from '@sebrae/api-base';

interface AppEnv extends Env {
  APP_BASE_URL: string;
  AUTH_DEFAULT_ROLE_SLUG: string;
}

const parseAppEnv = (input: Record<string, unknown>): AppEnv => ({
  ...parseEnv(input),
  APP_BASE_URL:
    typeof input.APP_BASE_URL === 'string' ? input.APP_BASE_URL : 'http://127.0.0.1:3000',
  AUTH_DEFAULT_ROLE_SLUG:
    typeof input.AUTH_DEFAULT_ROLE_SLUG === 'string' ? input.AUTH_DEFAULT_ROLE_SLUG : 'user',
});

const env = parseAppEnv(process.env);

export const defineAppRoute = createDefineZodRoute<AppEnv>();

const resolveRoutesDir = (): string => path.resolve(process.cwd(), 'src/http/routes');

const app = createApp<AppEnv>({ env, routesDir: resolveRoutesDir() });

void app;

export default defineAppRoute({
  options: {
    schema: {
      response: {
        200: z.object({
          appBaseUrl: z.string().url(),
          defaultRole: z.string(),
        }),
      },
    },
  },
  handler: async (request) => ({
    appBaseUrl: request.server.env.APP_BASE_URL,
    defaultRole: request.server.env.AUTH_DEFAULT_ROLE_SLUG,
  }),
});
