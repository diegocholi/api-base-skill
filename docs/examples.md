# Exemplos

Os arquivos em `examples/` mostram o uso esperado no projeto consumidor e passam no typecheck da documentacao.

Observação sobre imports:

- nos exemplos desta pasta, alguns imports usam `@sebrae/api-base` diretamente para manter o typecheck da documentação isolado;
- no consumidor gerado pelo `init`, prefira wrappers locais como `@/http/zod` e `@/infra/db/repo-base` quando eles existirem.

Como usar esta pagina como code agent:

- nao invente bootstrap, decorators ou helpers sem antes localizar um exemplo equivalente;
- copie o exemplo mais proximo e adapte so o necessario;
- se a mudanca envolver auth, abra tambem [Autenticacao e guards](./contracts/security-auth.md);
- se a mudanca envolver erro, schema ou persistencia, abra o contrato correspondente antes de editar.
- confirme primeiro que o exemplo corresponde ao scaffold e a versao real do consumidor.

## Bootstrap e rotas

- `server-example.ts`: sobe a API com `createApp` e resolve `src/http/routes` no dev e `dist/http/routes` no build.
- `auth-rbac-plugin-example.ts`: plugin custom do consumidor para registrar `resolveRoles` e `resolvePermissions`.
- `typed-consumer-env-example.ts`: mostra como estender `Env` no consumidor sem casts por rota.
- `register-route-example.ts`: rota HTTP com `defineZodRoute`, `querystring` e resposta tipada.
- `multipart-upload-example.ts`: upload `multipart/form-data` com `request.file()` e resposta tipada.
- `auth-protected-route-example.ts`: rota protegida com provider explicito e RBAC declarativo via `config.roles` e `config.permissions`.
- `auth-public-route-example.ts`: rota pública com `config.auth.public = true`.
- `social-auth-google-example.ts`: valida `id_token` do Google e retorna identidade normalizada.

Trecho principal:

```ts
import { createApp, env } from '@sebrae/api-base';

const app = createApp({ env, routesDir: resolveRoutesDir() });
await app.listen({ port: env.PORT, host: '0.0.0.0' });
```

Quando o consumidor tiver env estendido, o padrão recomendado passa a ser:

```ts
interface AppEnv extends Env {
  APP_BASE_URL: string;
}

const env = parseAppEnv(process.env);
const defineAppRoute = createDefineZodRoute<AppEnv>();
const app = createApp<AppEnv>({ env });
```

## Validação e fluxo de aplicação

- `parse-with-zod-example.ts`: use `parseWithZod` fora do fluxo HTTP.
- `result-example.ts`: caso de uso retornando `Result` e consumo com `match`.
- `generate-client-id-example.ts`: gera um `clientId` deterministico a partir do CPF, com ou sem mascara.

Trecho principal:

```ts
const result = await createUser({ name: 'Ada' });

const message = match(result, {
  ok: (value) => `created:${value.id}`,
  err: (error) => `error:${error.code}`,
});
```

Trecho de utilitario:

```ts
const clientId = generateClientId('123.456.789-09');
```

## Dados, cache e fila

- `repo-base-example.ts`: repositório SQL-first com `RepoBase`.
- `cache-aside-example.ts`: uso de `request.server.cache.cacheAside(...)` em rota.
- `queue-job-example.ts`: enfileiramento com `defineJob(...)`, `request.server.queue.addJob(...)` e `requestId`; no scaffold atual, prefira gerar o descritor com `pnpm api-cli generate job <module> <job>`.
- `queue-worker-entry-example.ts`: entrypoint local do consumidor para worker de fila com `startQueueWorker`.
- `outbox-worker-entry-example.ts`: entrypoint local do consumidor para worker de outbox com `startOutboxWorker`.
- `outbox-transaction-example.ts`: escrita transacional com `withOutboxTransaction`, combinando evento declarativo estavel e evento dinamico.

Trecho principal:

```ts
const job = await request.server.queue.addJob(userCreatedJob, { userId: request.body.userId }, {
  requestId: request.requestId,
  jobOptions: { attempts: 3 },
});
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
- Use `auth-rbac-plugin-example.ts` quando o consumidor precisar um plugin local para RBAC dinâmico ou decorators compartilhados.
- Use `register-route-example.ts`, `multipart-upload-example.ts`, `auth-protected-route-example.ts` e `auth-public-route-example.ts` como base para novas rotas.
- Use `parse-with-zod-example.ts` quando a validação não estiver dentro de um handler HTTP.
- Use `result-example.ts` para casos de uso que não devem lançar exceções em falhas esperadas.
- Use `generate-client-id-example.ts` quando o consumidor precisar derivar um identificador estavel de cliente a partir do CPF.
- Use `repo-base-example.ts`, `cache-aside-example.ts` e `queue-job-example.ts` como referência para acesso a infraestrutura.
- Use `queue-worker-entry-example.ts` e `outbox-worker-entry-example.ts` ao criar os entrypoints locais gerados pelo scaffold.
- Use `outbox-transaction-example.ts` quando o caso de uso precisar gravar domínio e registrar evento na outbox no mesmo `tx`.
- Para eventos estaveis, prefira gerar o descritor com `pnpm api-cli generate outbox-event <module> <event>` e use `outbox-transaction-example.ts` como referencia de uso com `enqueueDefinedEvent(...)`; para eventos construidos em runtime, mantenha `enqueueEvent(...)`.

Observação sobre auth:

- com `AUTH_GUARD_ENABLED=true`, a rota protegida já é validada antes do handler e não precisa de `preHandler` manual;
- se `AUTH_GUARD_ENABLED=false`, a proteção explícita por rota continua exigindo `preHandler` chamando `request.server.requireAuth`.
- os exemplos desta pasta mostram o padrão recomendado para o consumidor;
- a CLI ainda gera `preHandler` explícito quando você usa `generate route --auth` ou `generate module --auth`, para manter proteção por rota mesmo quando o guard global estiver desabilitado.
- quando o consumidor emitir JWT proprio, o objetivo e sempre chegar a um `request.user` com `sub`, `roles`, `scopes` e `claims`; veja [Autenticacao e guards](./contracts/security-auth.md).

Regra adicional para code agents:

- para RBAC estatico, prefira `examples/auth-protected-route-example.ts` combinado com `config.roles` e `config.permissions` descritos em [Autenticacao e guards](./contracts/security-auth.md);
- use `preHandler` manual apenas quando a regra depender de ownership, policy customizada ou auth sem guard global;
- ownership depende de `request.user.sub`, entao nao trate token sem `sub` como aceitavel quando a rota usa owner checks;
- se um exemplo e o contrato divergirem, siga o contrato e ajuste o exemplo do consumidor conforme necessario.
- os exemplos desta pasta devem permanecer alinhados com os contratos; se voce atualizar um contrato canonico, atualize o exemplo correspondente no mesmo fluxo seguindo [Manutenção da skill](./maintaining-this-skill.md).

Observação sobre multipart:

- o runtime registra `@fastify/multipart` no `createApp()` por padrão;
- o consumidor nao precisa declarar `multipart: true`;
- para upload por stream, use `await request.file()` ou `request.parts()` no handler;
- `schema.consumes = ['multipart/form-data']` documenta a rota e nao habilita o parser;
- para documentar campos do form no Swagger, inicialize a app com `createApp({ multipart: { attachFieldsToBody: true } })` e declare `schema.body`;
- para o Swagger UI abrir o seletor de arquivo, documente o campo com `type: 'string'` e `format: 'binary'`;
- para limites e exemplos completos de bootstrap, consulte [Multipart](./multipart.md).

Politica de consistencia:

- contratos canonicos definem o comportamento recomendado;
- exemplos devem ilustrar esse comportamento sem depender de inferencia adicional;
- quando um exemplo precisar mostrar uma excecao ao padrao, isso deve estar explicito no proprio doc e no codigo do exemplo.
- a checklist operacional e os checks locais desta skill ficam em [Manutenção da skill](./maintaining-this-skill.md).

## Referências relacionadas

- [Arquitetura](./architecture.md)
- [API](./api.md)
- [OpenAPI](./openapi.md)
- [Multipart](./multipart.md)
- [Padrões](./standards.md)

## Mapa rapido de escolha

- bootstrap da app: `examples/server-example.ts`
- plugin local de RBAC: `examples/auth-rbac-plugin-example.ts`
- rota publica: `examples/auth-public-route-example.ts`
- rota privada com guard global: `examples/auth-protected-route-example.ts`
- social auth Google: `examples/social-auth-google-example.ts`
- validacao fora do HTTP: `examples/parse-with-zod-example.ts`
- geracao de `clientId` deterministico a partir de CPF: `examples/generate-client-id-example.ts`
- fila, cache e repositorio: `examples/queue-job-example.ts`, `examples/cache-aside-example.ts`, `examples/repo-base-example.ts`
- workers locais e outbox transacional: `examples/queue-worker-entry-example.ts`, `examples/outbox-worker-entry-example.ts`, `examples/outbox-transaction-example.ts`
