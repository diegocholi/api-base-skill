# Exemplos

Os arquivos em `docs/examples/` mostram o uso esperado no projeto consumidor e passam no typecheck da documentação.

Observação sobre imports:

- nos exemplos desta pasta, alguns imports usam `@sebrae/api-base` diretamente para manter o typecheck da documentação isolado;
- no consumidor gerado pelo `init`, prefira wrappers locais como `@/http/zod` e `@/infra/db/repo-base` quando eles existirem.

## Bootstrap e rotas

- `server-example.ts`: sobe a API com `createApp` e resolve `src/http/routes` no dev e `dist/http/routes` no build.
- `register-route-example.ts`: rota HTTP com `defineZodRoute`, `querystring` e resposta tipada.
- `auth-protected-route-example.ts`: rota protegida pelo guard global, com `security` e provider explícito.
- `auth-public-route-example.ts`: rota pública com `config.auth.public = true`.
- `social-auth-google-example.ts`: valida `id_token` do Google e retorna identidade normalizada.

Trecho principal:

```ts
import { createApp, env } from '@sebrae/api-base';

const app = createApp({ env, routesDir: resolveRoutesDir() });
await app.listen({ port: env.PORT, host: '0.0.0.0' });
```

## Validação e fluxo de aplicação

- `parse-with-zod-example.ts`: use `parseWithZod` fora do fluxo HTTP.
- `result-example.ts`: caso de uso retornando `Result` e consumo com `match`.

Trecho principal:

```ts
const result = await createUser({ name: 'Ada' });

const message = match(result, {
  ok: (value) => `created:${value.id}`,
  err: (error) => `error:${error.code}`,
});
```

## Dados, cache e fila

- `repo-base-example.ts`: repositório SQL-first com `RepoBase`.
- `cache-aside-example.ts`: uso de `request.server.cache.cacheAside(...)` em rota.
- `queue-job-example.ts`: enfileiramento com `request.server.queue.add(...)` e `requestId`.

Trecho principal:

```ts
const job = await request.server.queue.add(
  'events',
  'user.created',
  { userId: request.body.userId },
  { requestId: request.requestId, jobOptions: { attempts: 3 } },
);
```

## Observabilidade

- `audit-example.ts`: emissão de evento de auditoria com `audit(...)`.

Trecho principal:

```ts
audit(
  'users.created',
  {
    actorId: 'user-1',
    action: 'create',
    resource: { type: 'user', id: 'user-2' },
  },
  { logger, requestId: 'req-123' },
);
```

## Quando usar cada exemplo

- Comece por `server-example.ts` ao montar o bootstrap do consumidor.
- Use `register-route-example.ts`, `auth-protected-route-example.ts` e `auth-public-route-example.ts` como base para novas rotas.
- Use `parse-with-zod-example.ts` quando a validação não estiver dentro de um handler HTTP.
- Use `result-example.ts` para casos de uso que não devem lançar exceções em falhas esperadas.
- Use `repo-base-example.ts`, `cache-aside-example.ts` e `queue-job-example.ts` como referência para acesso a infraestrutura.

Observação sobre auth:

- com `AUTH_GUARD_ENABLED=true`, a rota protegida já é validada antes do handler e não precisa de `preHandler` manual;
- se `AUTH_GUARD_ENABLED=false`, a proteção explícita por rota continua exigindo `preHandler` chamando `request.server.requireAuth`.
- os exemplos desta pasta mostram o padrão recomendado para o consumidor;
- a CLI ainda gera `preHandler` explícito quando você usa `generate route --auth` ou `generate module --auth`, para manter proteção por rota mesmo quando o guard global estiver desabilitado.

## Referências relacionadas

- [Arquitetura](./architecture.md)
- [API](./api.md)
- [OpenAPI](./openapi.md)
- [Padrões](./standards.md)
