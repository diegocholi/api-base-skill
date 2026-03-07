# Autenticação, RBAC e guards

## Objetivo

Definir como autenticar requests e aplicar RBAC/escopos de forma consistente.

## Quando usar

- Para rotas privadas (padrão).
- Para aplicar `requireRole`, `requireScope` ou policies.

## Quando NÃO usar

- Não implemente auth ad-hoc por rota.
- Não aceite claims sem validação.

## Contrato

### Plugins

```ts
app.register(jwtAuthPlugin, { env });
app.register(authGuardPlugin, { env });
```

### Controle por env

- `AUTH_GUARD_ENABLED=true` ativa guard global.
- `JWT_ALLOWED_ALGS` habilita JWT interno (demais vars definem o modo interno).
- `JWT_JWKS_URL` habilita JWT do Keycloak via JWKS.
- `JWT_KEYCLOAK_ALLOWED_ALGS` define algoritmos aceitos para Keycloak (default `RS256`).
- `JWT_DEFAULT_AUTH_PROVIDER` define o provider default quando a rota não informa.

### Decorators

- `app.requireAuth(request, reply)`
- `app.optionalAuth(request, reply)`
- `app.requireRole(role)` / `app.requireAnyRole(roles)`
- `app.requireScope(scope)` / `app.requireAnyScope(scopes)`
- `app.requirePolicy(predicate, { name? })`
- `app.ownerOnly(paramPath)`
- `app.roleOrOwner(role, paramPath)`

### Rotas públicas

- `config.auth.public = true` no módulo da rota.
- `config.auth.provider = 'internal' | 'keycloak'` seleciona o provider por rota.
- Se não for definido, o provider default vem de `JWT_DEFAULT_AUTH_PROVIDER` (default `internal`).
- `AUTH_PUBLIC_ROUTES` e `AUTH_PUBLIC_PATH_PREFIXES` permitem allowlist global.

### Exemplos por rota (internal vs keycloak)

Internal (default, com guard global):

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
  },
  handler: async () => ({ ok: true }),
});
```

Keycloak (com guard global):

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      auth: { provider: 'keycloak' },
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

Se `AUTH_GUARD_ENABLED=false`, você precisa usar `preHandler` para validar explicitamente:

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
      if (!request.server.requireAuth) {
        reply.code(503);
        throw new Error('Auth guard not configured');
      }
      await request.server.requireAuth(request, reply);
    },
  },
  handler: async () => ({ ok: true }),
});
```

- Swagger adiciona `security` automaticamente quando a rota é protegida por:
- `preHandler` que exige auth (`requireAuth`, `requireRole`, etc).
- `AUTH_GUARD_ENABLED=true` (exceto quando `config.auth.public = true`).
- `config.permissions` ou `config.roles`.

### Claims no JWT (roles e scopes)

- As roles vêm do token JWT e são expostas em `request.user.roles`.
- Os scopes vêm do token JWT e são expostos em `request.user.scopes`.
- O plugin normaliza roles a partir das claims abaixo (primeira encontrada):
- `roles`
- `role`
- `realm_access.roles`
- `https://roles`
- O plugin normaliza scopes a partir das claims abaixo (primeira encontrada):
- `scope`
- `scopes`
- `permissions`

Observação: no projeto, `scope` e `permissions` são equivalentes. Ambos são normalizados para
`request.user.scopes`, então a diferença é apenas a claim de origem.
Os valores podem ser string (separada por espaço e/ou vírgula, ex.: `users:read users:write`
ou `users:read,users:write`) ou array de strings.

Exemplo de payload (com `scope`):

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "scope": "users:read users:write"
}
```

Exemplo de payload (com `permissions`):

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "permissions": "users:read users:write"
}
```

Exemplo de payload (com `scope` como array):

```json
{
  "sub": "user-1",
  "roles": ["admin", "user"],
  "scope": ["users:read", "users:write"]
}
```

Exemplo de validação:

```ts
const requireAuth = request.server.requireAuth;
const requireRole = request.server.requireRole?.('admin');
if (!requireAuth || !requireRole) {
  reply.code(503);
  throw new Error('Auth guard not configured');
}
await requireAuth(request, reply);
await requireRole(request, reply);
```

### Permissões e roles por rota (config.permissions, config.roles)

Use `config.permissions` e/ou `config.roles` para declarar o que a rota exige. O guard de permissões
valida essas permissões antes do handler.

Observação: rotas com `config.permissions` ou `config.roles` são tratadas como privadas mesmo se
`config.auth.public = true`.

Por padrão, as permissões são lidas de `request.user.scopes` (derivadas das claims do JWT).
Para regras dinâmicas (ex.: roles no banco), registre um resolver:

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

Onde registrar:

- Preferencialmente no bootstrap da app (ex.: `src/app.ts`), após o cache plugin se você
  quiser usar `app.cache` no resolver.

Exemplo no padrão de rotas por pastas:

`src/http/routes/admin/users/get.route.ts`

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: { roles: ['admin'], permissions: ['users:read'] },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

Checklist de validação:

- Sem token: `401`.
- Token válido sem role/permissão: `403`.
- Token válido com permissão: `200`.

Observação importante:

- A validação de `config.permissions` e `config.roles` é feita pelo `permissionsGuardPlugin`
  e ocorre mesmo quando `AUTH_GUARD_ENABLED=false`. Ou seja: rotas com permissões/roles sempre
  exigem auth, independentemente do guard global.

## Erros e códigos de status

- Token ausente: `UnauthorizedError` (401).
- Role/scope ausente: `ForbiddenError` (403).
- Token inválido: `UnauthorizedError` (401).
- Guard global habilitado sem plugin de auth: o guard apenas registra `warn` e não bloqueia
  a request; já o guard de permissões responde `503` se não existir `requireAuth`.

## Revogação e TTL

Quando o projeto valida roles/permissões somente pelo JWT, mudanças no banco não
revogam tokens já emitidos. Para reduzir essa janela, use um TTL curto para o access token.

Recomendação prática:

- Access token com `expiresIn` curto (ex.: 15–30 minutos).
- Reemissão do token quando necessário (sem refresh token, se preferir simplicidade).

Se precisar revogação imediata, adote estratégia de denylist (`jti`) ou `token_version`.

### Estratégia com `jti` (denylist)

Fluxo recomendado:

- Gere um `jti` único ao emitir o token.
- Armazene o `jti` revogado em cache (ex.: Redis) com TTL igual ao do token.
- Em cada request, valide se o `jti` está revogado antes de processar a rota.

Isso permite revogação imediata sem precisar consultar o banco para cada request,
ao custo de uma consulta rápida no cache.

## Exemplos

### Básico

```ts
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: { auth: { public: true } },
    schema: { response: { 200: schema } },
  },
  handler: async () => ({ ok: true }),
});
```

### Validação em rotas por pastas

Use o padrão de rotas em `src/http/routes/**`. Quando possível, prefira declarar
`config.roles` e `config.permissions`; deixe `preHandler` manual para casos que exigem
decorators específicos.

Exemplo de arquivo de rota:

`src/http/routes/admin/users/get.route.ts`

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    config: {
      roles: ['admin'],
      permissions: ['users:read'],
    },
    schema: {
      querystring: z.object({}).strict(),
      response: { 200: schema },
    },
  },
  handler: async () => ({ ok: true }),
});
```

Checklist de validação:

- Sem token: deve retornar `401`.
- Token válido sem `admin`: deve retornar `403`.
- Token válido com `admin`: deve retornar `200`.

### Avançado

```ts
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    preHandler: async (request, reply) => {
      const requireRole = request.server.requireRole?.('admin');
      const requireScope = request.server.requireScope?.('users:write');
      if (requireRole) {
        await requireRole(request, reply);
      }
      if (requireScope) {
        await requireScope(request, reply);
      }
    },
    schema: { response: { 200: schema } },
  },
  handler: async () => ({ ok: true }),
});
```

## Anti-padrões

- Lógica de auth no handler em vez de preHandler.
- Claims sem `sub` quando `JWT_REQUIRE_SUB` esta ativo.
- Rotas públicas sem config explícita.
- Token via cookie sem header CSRF quando `JWT_COOKIE_CSFR_HEADER` estiver configurado.

## Checklist de revisão

- [ ] `JWT_ALLOWED_ALGS` configurado.
- [ ] `authGuardPlugin` habilitado quando necessário.
- [ ] Rotas públicas explícitas.
- [ ] RBAC/escopos aplicados via preHandler.
