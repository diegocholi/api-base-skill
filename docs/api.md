# API de uso do consumidor

Esta referência reúne os pontos de contato mais usados por quem consome a API-BASE.

## Exports principais de `@sebrae/api-base`

Bootstrap:

- `createApp`
- `env`, `parseEnv`
- `registerRoutes`, `registerRoute`
- `getRouteRegistry`

Rotas e validação:

- `defineZodRoute`
- `createDefineZodRoute`
- `withZod`
- `parseWithZod`
- `parseBody`, `parseQuery`, `parseParams` apenas por compatibilidade

Bootstrap tipado:

- `createApp<TEnv>()`
- `createApp({ multipart: false | { ...options } })`
- tipo `ApiBaseFastifyInstance<TEnv>`
- tipo `ApiBaseFastifyRequest<TRouteGeneric, TEnv>`

Observação sobre multipart:

- `multipart` ja vem habilitado por padrão;
- nao e necessario declarar `multipart: true`;
- use essa opcao apenas para desligar ou customizar o `@fastify/multipart`.
- exemplos comuns de customizacao: `attachFieldsToBody`, `limits.fileSize`, `limits.parts` e `throwFileSizeLimit`.
- detalhes de runtime e exemplos completos: [Multipart](./multipart.md).

Erros e resultado:

- `AppError`
- `ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`
- `InfrastructureError`
- `ok`, `err`, `match`
- tipo `Result`

Dados e utilitários:

- `RepoBase`
- `sql`
- `createGoogleIdTokenVerifier`
- `createId`
- `generateClientId`
- TTLs `CACHE_TTL_*`
- `audit`
- `nowIso`

## Comandos principais de `@sebrae/api-base-cli`

Bootstrap e manutenção:

- `pnpm api-cli init`
- `pnpm api-cli init --with-example`
- `pnpm api-cli migrate`

Scaffolds:

- `pnpm api-cli generate module <name>`
- `pnpm api-cli generate route <path>`
- `pnpm api-cli generate usecase <module> <name>`
- `pnpm api-cli generate repo <module> <name>`
- `pnpm api-cli generate job <queue> <job>`

Operação local:

- `pnpm api-cli dev`
- `pnpm api-cli routes:list`
- `pnpm api-cli routes:validate`
- `pnpm api-cli env check`
- `pnpm api-cli health --url http://127.0.0.1:3000`
- `pnpm api-cli ready --url http://127.0.0.1:3000`

Banco:

- `pnpm api-cli db create <name>`
- `pnpm api-cli db enable-outbox`
- `pnpm api-cli db generate`
- `pnpm api-cli db migrate`

## Variáveis de ambiente que quase todo consumidor usa

Base:

- `NODE_ENV`
- `PORT`
- `SERVICE_NAME`
- `ENV_FALLBACK_ENABLED`

HTTP:

- `HTTP_TRUST_PROXY`
- `HTTP_CORS_ENABLED`
- `HTTP_CORS_ORIGINS`
- `HTTP_HELMET_ENABLED`
- `HTTP_RATE_LIMIT_ENABLED`

OpenAPI:

- `SWAGGER_ENABLED`
- `SWAGGER_DOCS_ROUTE`
- `SWAGGER_OPENAPI_ROUTE`
- `SWAGGER_TITLE`
- `SWAGGER_DESCRIPTION`

Dados e infraestrutura:

- `DB_DIALECT`
- `DATABASE_URL`
- `REDIS_URL`
- `QUEUE_PREFIX`

Auth:

- `AUTH_GUARD_ENABLED`
- `AUTH_PUBLIC_ROUTES`
- `AUTH_PUBLIC_PATH_PREFIXES`
- `JWT_ALLOWED_ALGS`
- `JWT_SECRET`
- `JWT_JWKS_URL`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_JWKS_URL`

Observabilidade:

- `OTEL_ENABLED`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `METRICS_ENABLED`
- `METRICS_ROUTE`

Referência completa:

- [Variáveis de ambiente](./env.md)

## Jornada recomendada no dia a dia

1. `pnpm api-cli generate module billing --crud`
2. `pnpm api-cli routes:validate`
3. `pnpm run db:migrate:env`
4. `pnpm run dev`
5. `pnpm run build && pnpm run start:env`

## Referência complementar

- [CLI](./cli.md)
- [OpenAPI](./openapi.md)
- [Migrações](./migrations.md)
- [Workers](./workers.md)
- [Implantação](./deploy.md)
