# API de uso do consumidor

Esta referência reúne os pontos de contato mais usados por quem consome a API-BASE.

Como um code agent deve usar esta pagina:

- se ainda nao estiver claro qual trilha da tarefa seguir, comece por [Playbooks para code agents](./agent-playbooks.md);
- use esta referencia para descobrir exports, tipos e comandos validos da base;
- nao trate esta pagina como garantia de que todo consumidor expoe todos os scripts mostrados aqui;
- confirme sempre os scripts reais no `package.json` do consumidor antes de sugerir execucao;
- quando a tarefa tocar auth, rotas, multipart, erros, cache ou fila, abra tambem o contrato canonico correspondente.

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
- `config.roles`, `config.permissions`, `config.anyPermissions` e `config.ownership` na definição da rota

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
- auth, RBAC e social auth: [Autenticacao e guards](./contracts/security-auth.md).
- erros HTTP: [AppError e erros HTTP](./contracts/shared-errors.md) e [Handler de erros global](./contracts/http-error-handler.md).
- cache e filas: [CacheService e KeyBuilder](./contracts/data-cache.md) e [QueueService, jobs e workers](./contracts/data-queue.md).

Erros e resultado:

- `AppError`
- `ValidationError`, `NotFoundError`, `ConflictError`, `UnauthorizedError`, `ForbiddenError`
- `InfrastructureError`
- `ok`, `err`, `match`
- tipo `Result`

Dados e utilitários:

- `RepoBase`
- `sql`
- `createOwnerOnlyPolicy`
- `createRoleOrOwnerPolicy`
- `createScopeOrOwnerPolicy`
- `createRolesResolver`
- `createPermissionsResolver`
- `startQueueWorker`
- `startOutboxWorker`
- `withOutboxTransaction`
- decorators opcionais no consumidor: `resolveRoles` e `resolvePermissions`
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
- `pnpm run worker:dev`
- `pnpm run worker:start`
- `pnpm run outbox:dev`
- `pnpm run outbox:start`
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

Contrato minimo do usuario autenticado no runtime:

- `request.user.sub`
- `request.user.roles`
- `request.user.scopes`
- `request.user.claims`

Para detalhes de normalizacao de token, ownership e payload minimo recomendado, consulte [Autenticacao e guards](./contracts/security-auth.md).

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
3. rode `pnpm api-cli db migrate` ou o script equivalente existente no `package.json`
4. rode `pnpm api-cli dev` ou o script `dev` disponivel no consumidor
5. valide `build` e `start` usando apenas scripts que existirem no projeto real

Se essa jornada nao encaixar no estado real do consumidor, volte para [Playbooks para code agents](./agent-playbooks.md) e trate o projeto como legado ou troubleshooting antes de seguir.

## Referência complementar

- [Playbooks para code agents](./agent-playbooks.md)
- [CLI](./cli.md)
- [OpenAPI](./openapi.md)
- [Migrações](./migrations.md)
- [Workers](./workers.md)
- [Implantação](./deploy.md)
