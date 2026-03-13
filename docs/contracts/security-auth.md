# Autenticacao, RBAC e guards

## Objetivo

Definir um contrato unico para autenticar requests e aplicar RBAC/scopes sem ambiguidade.

Este documento deve ser tratado por code agents como a referencia canonica para:

- bootstrap de auth;
- protecao de rotas;
- escolha entre guard global e `preHandler`;
- uso de `config.roles`, `config.permissions` e `config.ownership`;
- social auth e cookies.

## Regra rapida para code agents

Ao editar ou gerar codigo no consumidor, siga esta ordem:

1. Registre os plugins necessarios no bootstrap.
2. Se a rota for publica, declare `config.auth.public = true`.
3. Se a rota for privada e a regra for estatica, prefira `config.roles` e `config.permissions`.
4. Se a rota for privada e a regra for ownership simples, prefira `config.ownership`.
5. Use `preHandler` manual apenas quando a regra depender de decorators especificos como `requirePolicy`, `ownerOnly` ou `roleOrOwner`, ou quando `config.ownership` nao for suficiente.
6. Se `AUTH_GUARD_ENABLED=false`, toda rota privada sem `config.roles`/`config.permissions`/`config.ownership` precisa chamar `request.server.requireAuth` manualmente.
7. Nunca implemente auth ad-hoc dentro do handler.

Quando a regra for "owner ou role/permissao administrativa", prefira `config.ownership`.
Use helpers standalone da API-BASE com `requirePolicy(...)` apenas quando a regra nao couber
no contrato declarativo.

## Quando usar

- Para rotas privadas, que sao o padrao.
- Para selecionar `internal` ou `keycloak` por rota.
- Para aplicar `config.roles`, `config.permissions`, `config.ownership`, `requireRole`, `requireScope` ou policies.
- Para validar `id_token` de social login.

## Quando nao usar

- Nao aceite claims sem validacao.
- Nao replique logica de auth dentro do handler.
- Nao use `config.auth.public = true` em rotas que tambem declaram `config.roles`, `config.permissions` ou `config.ownership`.
- Nao use `preHandler` manual para regras que cabem em `config.ownership`.

## Contrato canonico

### Plugins e ordem de registro

Use este bootstrap como padrao minimo:

```ts
app.register(jwtAuthPlugin, { env });
app.register(authGuardPlugin, { env });
app.register(permissionsGuardPlugin, { env });
```

Regras:

- `jwtAuthPlugin` registra validacao do token e os decorators de auth.
- `authGuardPlugin` aplica auth global quando `AUTH_GUARD_ENABLED=true`.
- `permissionsGuardPlugin` aplica `config.roles`, `config.permissions` e `config.ownership`.
- Se o projeto usa social auth, registre tambem o plugin social ou use o runtime que ja o registra no `createApp`.
- Se o projeto usa cache para resolver permissoes dinamicas, registre o cache antes de decorar `resolvePermissions`.

### Decorators expostos

- `app.requireAuth(request, reply)`
- `app.optionalAuth(request, reply)`
- `app.requireRole(role)` / `app.requireAnyRole(roles)`
- `app.requireScope(scope)` / `app.requireAnyScope(scopes)`
- `app.requirePolicy(predicate, { name? })`
- `app.ownerOnly(paramPath)`
- `app.roleOrOwner(role, paramPath)`
- `app.verifySocialIdToken({ provider, idToken, nonce? })`

### Helpers standalone expostos

- `createOwnerOnlyPolicy(paramPath)`
- `createRoleOrOwnerPolicy(role, paramPath)`
- `createScopeOrOwnerPolicy(scope, paramPath)`

### Variaveis de ambiente principais

- `AUTH_GUARD_ENABLED=true` ativa guard global.
- `AUTH_PUBLIC_ROUTES` define allowlist global por rota exata.
- `AUTH_PUBLIC_PATH_PREFIXES` define allowlist global por prefixo.
- `JWT_ALLOWED_ALGS` habilita JWT interno.
- `JWT_JWKS_URL` habilita JWT via JWKS para `keycloak`.
- `JWT_KEYCLOAK_ALLOWED_ALGS` define algoritmos aceitos para Keycloak. Default: `RS256`.
- `JWT_DEFAULT_AUTH_PROVIDER` define o provider default quando a rota nao informa. Default: `internal`.

## Matriz de decisao

Use esta tabela como regra de precedencia:

| Caso | Resultado esperado |
| --- | --- |
| `config.auth.public = true` e sem `config.roles`/`config.permissions`/`config.ownership` | rota publica |
| `config.auth.public = true` e com `config.roles`, `config.permissions` ou `config.ownership` | rota privada; `permissionsGuardPlugin` prevalece |
| `AUTH_GUARD_ENABLED=true` e rota sem `config.auth.public = true` | auth obrigatoria antes do handler |
| `AUTH_GUARD_ENABLED=false` e rota sem `config.roles`/`config.permissions`/`config.ownership` | auth so ocorre se `preHandler` chamar decorators manualmente |
| rota com `config.roles`, `config.permissions` ou `config.ownership` | auth obrigatoria, mesmo com `AUTH_GUARD_ENABLED=false` |
| rota com `config.auth.provider` | usa o provider da rota |
| rota sem `config.auth.provider` | usa `JWT_DEFAULT_AUTH_PROVIDER` |
| rota em `AUTH_PUBLIC_ROUTES` ou `AUTH_PUBLIC_PATH_PREFIXES` | publica, salvo se `config.roles`/`config.permissions` tornarem a rota privada |

## Padrao recomendado

### 1. Bootstrap da app

Arquivo recomendado: `src/app.ts`.

```ts
import {
  authGuardPlugin,
  jwtAuthPlugin,
  permissionsGuardPlugin,
} from '@sebrae/api-base';

export async function registerSecurity(app: FastifyInstance, env: AppEnv) {
  app.register(jwtAuthPlugin, { env });
  app.register(authGuardPlugin, { env });
  app.register(permissionsGuardPlugin, { env });
}
```

Se houver permissoes dinamicas por role:

```ts
import { createRolePermissionsResolver } from '@/http/permissions';

app.decorate(
  'resolvePermissions',
  createRolePermissionsResolver({
    cache: app.cache,
    cacheTtlSeconds: 300,
    loadPermissions: async (roles) => loadPermissionsFromDb(roles),
  }),
);
```

Registre `resolvePermissions` no bootstrap, de preferencia depois do cache plugin.

### 2. Rota publica

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      auth: { public: true },
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

### 3. Rota privada com regra estatica

Este e o padrao preferido para code agents.

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      auth: { provider: 'internal' },
      roles: ['admin'],
      permissions: ['users:read'],
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

Notas:

- prefira `config.roles` e `config.permissions` para regras declarativas;
- isso melhora Swagger, reduz codigo manual e deixa a intencao da rota explicita;
- `permissionsGuardPlugin` faz a validacao antes do handler.

### 3.1. Rota privada com ownership declarativo

Este e o padrao preferido para "owner ou bypass por role e/ou permissao".

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      permissions: ['subscription.read_own'],
      ownership: {
        path: 'query.accountId',
        bypassPermissions: ['admin.subscriptions.manage'],
      },
    },
    schema: {
      querystring: z.object({
        accountId: z.string().uuid(),
      }).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

Notas:

- `ownership.path` aponta para o identificador do dono na request;
- `bypassRoles` e `bypassPermissions` sao opcionais;
- se `ownership` existir, a rota ja passa a ser privada;
- use este formato antes de cair para `preHandler` manual.

Exemplo com bypass por role:

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      permissions: ['subscription.read_own'],
      ownership: {
        path: 'query.accountId',
        bypassRoles: ['admin'],
      },
    },
    schema: {
      querystring: z.object({
        accountId: z.string().uuid(),
      }).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

### 4. Rota privada com provider `keycloak`

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      auth: { provider: 'keycloak' },
      permissions: ['users:read'],
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

### 5. Rota privada com regra dinamica

Use `preHandler` apenas quando a regra nao puder ser descrita so com config.

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      params: z.object({ userId: z.string().min(1) }).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
    preHandler: async (request, reply) => {
      const requireAuth = request.server.requireAuth;
      const ownerOnly = request.server.ownerOnly?.('params.userId');

      if (!requireAuth || !ownerOnly) {
        reply.code(503);
        throw new Error('Auth guard not configured');
      }

      await requireAuth(request, reply);
      await ownerOnly(request, reply);
    },
  },
  handler: async () => ({ ok: true }),
});
```

Quando a regra de ownership nao couber em `config.ownership`, prefira o helper standalone e
passe-o para `requirePolicy(...)`:

```ts
import { createScopeOrOwnerPolicy } from '@sebrae/api-base';
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

const allowOwnSubscriptionOrAdmin = createScopeOrOwnerPolicy(
  'admin.subscriptions.manage',
  'query.accountId',
);

export default defineZodRoute({
  options: {
    schema: {
      querystring: z.object({
        accountId: z.string().uuid(),
      }),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
    preHandler: async (request, reply) => {
      const requireAuth = request.server.requireAuth;
      const requirePolicy = request.server.requirePolicy?.(allowOwnSubscriptionOrAdmin, {
        name: 'allowOwnSubscriptionOrAdmin',
      });

      if (!requireAuth || !requirePolicy) {
        reply.code(503);
        throw new Error('Auth guard not configured');
      }

      await requireAuth(request, reply);
      await requirePolicy(request, reply);
    },
  },
  handler: async () => ({ ok: true }),
});
```

### 6. Rota privada sem guard global

Quando `AUTH_GUARD_ENABLED=false`, toda rota privada sem `config.roles`/`config.permissions`/
`config.ownership` precisa validar auth manualmente:

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      auth: { provider: 'internal' },
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
    preHandler: async (request, reply) => {
      const requireAuth = request.server.requireAuth;

      if (!requireAuth) {
        reply.code(503);
        throw new Error('Auth guard not configured');
      }

      await requireAuth(request, reply);
    },
  },
  handler: async () => ({ ok: true }),
});
```

## Claims no JWT

### Roles

As roles sao expostas em `request.user.roles`.

Claims aceitas, na primeira encontrada:

- `roles`
- `role`
- `realm_access.roles`
- `https://roles`

### Scopes

Os scopes sao expostos em `request.user.scopes`.

Claims aceitas, na primeira encontrada:

- `scope`
- `scopes`
- `permissions`

No consumidor, `scope` e `permissions` sao equivalentes. Ambos sao normalizados para
`request.user.scopes`.

Os valores podem ser:

- string separada por espaco;
- string separada por virgula;
- array de strings.

Payload valido com `scope`:

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "scope": "users:read users:write"
}
```

Payload valido com `permissions`:

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "permissions": "users:read users:write"
}
```

Payload valido com `scope` em array:

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "scope": ["users:read", "users:write"]
}
```

## Social auth

### Contrato

- O runtime registra `verifySocialIdToken` automaticamente no `createApp`.
- A API-BASE valida apenas o `id_token`.
- O consumidor continua responsavel por vincular usuario local, definir papel padrao e emitir o JWT interno.
- Provider nativo nesta versao: `google`.
- Providers customizados devem seguir o mesmo contrato de `verifySocialIdToken`.

Variaveis usadas pelo provider Google:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_JWKS_URL`
- `GOOGLE_OAUTH_ISSUERS`
- `GOOGLE_OAUTH_CLOCK_TOLERANCE_SECONDS`
- `GOOGLE_OAUTH_JWKS_CACHE_TTL_SECONDS`
- `GOOGLE_OAUTH_JWKS_REQUEST_TIMEOUT_MS`
- `GOOGLE_OAUTH_JWKS_COOLDOWN_SECONDS`

### Exemplo de uso

```ts
const verifySocialIdToken = request.server.verifySocialIdToken;

if (!verifySocialIdToken) {
  reply.code(503);
  throw new Error('Social auth not configured');
}

const identity = await verifySocialIdToken({
  provider: 'google',
  idToken: request.body.idToken,
  nonce: request.body.nonce,
});
```

### Exemplo registrando provider extra

```ts
import { registerSocialAuthPlugin, type SocialIdTokenVerifier } from '@sebrae/api-base';

const githubVerifier: SocialIdTokenVerifier = async ({ idToken }) => ({
  provider: 'github',
  providerUserId: idToken,
  emailVerified: true,
  claims: {},
});

await registerSocialAuthPlugin(app, env, {
  providers: { github: githubVerifier },
});
```

## Swagger e documentacao

Swagger adiciona `security` automaticamente quando a rota e protegida por:

- `preHandler` que exige auth com decorators como `requireAuth`, `requireRole` ou `requireScope`;
- `AUTH_GUARD_ENABLED=true`, exceto quando `config.auth.public = true`;
- `config.permissions` ou `config.roles`.

Para code agents, a forma mais confiavel de manter Swagger coerente e:

- usar `config.auth.public = true` em rotas publicas;
- usar `config.roles` e `config.permissions` em rotas privadas declarativas;
- reservar `preHandler` manual para casos especiais.

## Erros e status esperados

- token ausente: `UnauthorizedError` (`401`);
- token invalido: `UnauthorizedError` (`401`);
- role ou scope ausente: `ForbiddenError` (`403`);
- decorator esperado mas nao registrado: `503`;
- guard global habilitado sem plugin de auth: o guard registra `warn` e nao bloqueia a request;
- `permissionsGuardPlugin` sem `requireAuth`: responde `503`.

## Revogacao e TTL

Quando o projeto valida roles/permissoes so pelo JWT, mudancas no banco nao revogam
tokens ja emitidos. Reduza a janela com access token curto.

Recomendacao pratica:

- `expiresIn` curto, por exemplo 15 a 30 minutos;
- reemissao do token quando necessario;
- se precisar revogacao imediata, use denylist com `jti` ou `token_version`.

### Estrategia com `jti`

Fluxo recomendado:

1. Gere um `jti` unico ao emitir o token.
2. Grave o `jti` revogado em cache com TTL igual ao do token.
3. Em cada request, valide se o `jti` esta revogado antes do handler.

## Cookies de auth

Quando o consumidor optar por `JWT_TOKEN_SOURCES=cookie`, a API-BASE expoe helpers no `reply`.

Exemplo:

```ts
reply.issueAuthCookies({
  token: accessToken,
  ttlSeconds: 3600,
});

reply.clearAuthCookies();
```

Configuracao relacionada:

- `JWT_COOKIE_NAME`
- `JWT_COOKIE_DOMAIN`
- `JWT_COOKIE_PATH`
- `JWT_COOKIE_SAME_SITE`
- `JWT_COOKIE_SECURE`
- `JWT_COOKIE_CSFR_HEADER`
- `JWT_COOKIE_CSFR_COOKIE_NAME`

Comportamento:

- o cookie de auth sai com `HttpOnly`;
- o cookie de CSRF sai legivel no browser para double-submit;
- `JWT_COOKIE_SAME_SITE=none` exige `JWT_COOKIE_SECURE=true`;
- os helpers preservam outros headers `Set-Cookie` ja existentes.

## Testes minimos que um code agent deve validar

Para qualquer alteracao de auth, valide ao menos:

- sem token: `401`;
- token invalido: `401`;
- token valido sem role/permissao necessaria: `403`;
- token valido com role/permissao necessaria: `200`;
- rota publica: `200` sem token;
- rota com decorator esperado ausente: `503`.

## Anti-padroes

- logica de auth dentro do handler;
- rota publica dependente de inferencia, sem `config.auth.public = true`;
- usar `preHandler` manual para regras que cabem em `config.roles`/`config.permissions`;
- declarar `config.auth.public = true` junto com `config.roles` ou `config.permissions` esperando rota publica;
- claims sem `sub` quando `JWT_REQUIRE_SUB` estiver ativo;
- token via cookie sem header CSRF quando `JWT_COOKIE_CSFR_HEADER` estiver configurado.

## Checklist de revisao

- [ ] `jwtAuthPlugin`, `authGuardPlugin` e `permissionsGuardPlugin` registrados quando o projeto usa auth declarativa.
- [ ] `AUTH_GUARD_ENABLED` coerente com a estrategia escolhida.
- [ ] rotas publicas com `config.auth.public = true`.
- [ ] rotas privadas declarativas usando `config.roles` e `config.permissions`.
- [ ] `preHandler` manual reservado para policies, ownership ou regras nao declarativas.
- [ ] provider por rota definido quando o projeto mistura `internal` e `keycloak`.
- [ ] testes de `401`, `403` e `200` cobrindo o fluxo principal.
