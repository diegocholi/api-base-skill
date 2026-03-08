# Variáveis de ambiente

Este documento lista as variáveis mais relevantes para o consumidor. A definição canônica continua no código da base.

## Mínimo para desenvolvimento local

```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=meu-servico
SWAGGER_ENABLED=true
DB_DIALECT=postgres
DATABASE_URL=postgres://user:pass@localhost:5432/app
REDIS_URL=redis://localhost:6379
```

## Aplicação

- `NODE_ENV`: `development`, `test` ou `production`.
- `PORT`: porta HTTP.
- `SERVICE_NAME`: nome do serviço.
- `SERVICE_VERSION`: versão exposta no OpenAPI.
- `LOG_LEVEL`: nível de log.
- `LOG_ROUTES`: loga rotas habilitadas no boot.
- `ENV_FALLBACK_ENABLED`: permite fallback para `.env`; em produção deve permanecer `false`.

## HTTP

- `HTTP_CORS_ENABLED`
- `HTTP_CORS_ORIGINS`
- `HTTP_HELMET_ENABLED`
- `HTTP_RATE_LIMIT_ENABLED`
- `HTTP_RATE_LIMIT_MAX`
- `HTTP_RATE_LIMIT_WINDOW_MS`
- `HTTP_RATE_LIMIT_KEY`
- `HTTP_TRUST_PROXY`
- `HTTP_REQUEST_TIMEOUT_MS`
- `HTTP_CONNECTION_TIMEOUT_MS`
- `HTTP_KEEP_ALIVE_TIMEOUT_MS`
- `HTTP_HEADERS_TIMEOUT_MS`

## OpenAPI

- `SWAGGER_ENABLED`
- `SWAGGER_DOCS_ROUTE`
- `SWAGGER_OPENAPI_ROUTE`
- `SWAGGER_SERVERS`
- `SWAGGER_TITLE`
- `SWAGGER_DESCRIPTION`
- `SWAGGER_ALLOWED_IPS`

## Banco, Redis e filas

- `DB_DIALECT`
- `DATABASE_URL`
- `DB_URL`
- `DB_POOL_MAX`
- `DB_POOL_MIN`
- `DB_CONN_TIMEOUT_MS`
- `DB_IDLE_TIMEOUT_MS`
- `DB_QUERY_TIMEOUT_MS`
- `DB_READINESS_TIMEOUT_MS`
- `REDIS_URL`
- `REDIS_READINESS_TIMEOUT_MS`
- `QUEUE_PREFIX`
- `QUEUE_READINESS_TIMEOUT_MS`

## Outbox e readiness

- `OUTBOX_INTERVAL_MS`
- `OUTBOX_BATCH_SIZE`
- `READINESS_CHECK_TIMEOUT_MS`
- `READINESS_CHECK_CONCURRENCY`
- `ROUTES_IMPORT_CONCURRENCY`
- `ROUTES_ENDPOINT_ENABLED`
- `ROUTES_ENDPOINT_ALLOWED_IPS`
- `ROUTES_ENDPOINT_AUTH_TOKEN`

## Auth e JWT

- `AUTH_GUARD_ENABLED`
- `AUTH_PUBLIC_ROUTES`
- `AUTH_PUBLIC_PATH_PREFIXES`
- `ROUTE_SCHEMA_STRICT`
- `JWT_DEFAULT_AUTH_PROVIDER`
- `JWT_ALLOWED_ALGS`
- `JWT_SECRET`
- `JWT_PUBLIC_KEY`
- `JWT_PRIVATE_KEY`
- `JWT_JWKS_URL`
- `JWT_KEYCLOAK_ALLOWED_ALGS`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_TOKEN_SOURCES`
- `JWT_COOKIE_NAME`

## Social auth

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_JWKS_URL`
- `GOOGLE_OAUTH_ISSUERS`
- `GOOGLE_OAUTH_CLOCK_TOLERANCE_SECONDS`
- `GOOGLE_OAUTH_JWKS_CACHE_TTL_SECONDS`
- `GOOGLE_OAUTH_JWKS_REQUEST_TIMEOUT_MS`
- `GOOGLE_OAUTH_JWKS_COOLDOWN_SECONDS`

## Env estendido no consumidor

Quando o consumidor precisar adicionar variáveis próprias, o padrão recomendado é:

1. declarar `AppEnv extends Env`;
2. criar um `parseAppEnv(...)` local que faz `...parseEnv(input)` e adiciona os campos do consumidor;
3. subir o app com `createApp<AppEnv>({ env })`;
4. criar um wrapper único de rota com `createDefineZodRoute<AppEnv>()`.

Exemplo:

```ts
import { createApp, createDefineZodRoute, parseEnv } from '@sebrae/api-base';
import type { Env } from '@sebrae/api-base';

interface AppEnv extends Env {
  APP_BASE_URL: string;
}

const parseAppEnv = (input: Record<string, unknown>): AppEnv => ({
  ...parseEnv(input),
  APP_BASE_URL:
    typeof input.APP_BASE_URL === 'string' ? input.APP_BASE_URL : 'http://127.0.0.1:3000',
});

const env = parseAppEnv(process.env);
export const defineAppRoute = createDefineZodRoute<AppEnv>();
const app = createApp<AppEnv>({ env });
```

Limite atual intencional:

- o TypeScript nao consegue inferir sozinho o `TEnv` do `createApp(...)` dentro de modulos de rota isolados;
- por isso a forma mais ergonomica e criar o wrapper `defineAppRoute` uma unica vez no consumidor.

## Observabilidade

- `OTEL_ENABLED`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_SERVICE_NAME`
- `OTEL_SERVICE_VERSION`
- `OTEL_RESOURCE_ATTRIBUTES`
- `METRICS_ENABLED`
- `METRICS_ROUTE`
- `METRICS_ALLOWED_IPS`
- `METRICS_AUTH_TOKEN`

## Referências relacionadas

- [Visão geral](./overview.md)
- [API](./api.md)
- [OpenAPI](./openapi.md)
- [Implantação](./deploy.md)
