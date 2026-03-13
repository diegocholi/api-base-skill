# Solução de problemas

Este guia foi escrito para diagnostico operacional no consumidor.

Regra geral para code agents:

1. inspecione arquivos e variaveis relevantes antes de sugerir comandos;
2. rode primeiro o comando mais barato que realmente existir no projeto;
3. se a documentacao e o codigo real divergirem, priorize o codigo real do consumidor;
4. nao invente scripts ou caminhos locais.

## Swagger nao abre

Sequencia recomendada:

1. confirme `SWAGGER_ENABLED=true` no ambiente carregado;
2. confirme se a app expoe `/docs` e `/openapi.json` ou se houve override por `SWAGGER_DOCS_ROUTE` e `SWAGGER_OPENAPI_ROUTE`;
3. revise se as rotas possuem `options.schema.response`;
4. se houver proxy ou ambiente restritivo, revise CSP, IP allowlist e headers.

Se precisar aprofundar:

- [OpenAPI](./openapi.md)
- [Variáveis de ambiente](./env.md)

## Banco nao conecta

Sequencia recomendada:

1. confirme `DATABASE_URL` ou `DB_URL` e `DB_DIALECT`;
2. confira se o consumidor possui script de banco em `package.json`;
3. se existir, rode o comando real do projeto, como `pnpm api-cli db migrate` ou `pnpm run db:migrate`;
4. revise pool, timeout e readiness se a app subir mas continuar falhando.

Se precisar aprofundar:

- [DB e repositórios](./contracts/data-db.md)
- [Variáveis de ambiente](./env.md)

## Redis ou fila nao funcionam

Sequencia recomendada:

1. confirme `REDIS_URL`;
2. valide conectividade, credenciais e disponibilidade do Redis;
3. confirme se o consumidor realmente registra filas, workers e schemas de job;
4. para outbox, confirme tambem banco, batch e intervalo.

Se precisar aprofundar:

- [QueueService, jobs e workers](./contracts/data-queue.md)
- [CacheService e KeyBuilder](./contracts/data-cache.md)

## Auth nao valida token

Sequencia recomendada:

1. confirme se a rota e publica ou privada pelo contrato de auth;
2. confirme `JWT_ALLOWED_ALGS` ou `JWT_JWKS_URL`, conforme provider usado;
3. revise `JWT_SECRET`, issuer, audience, chaves ou JWKS;
4. confirme se os plugins de auth e guards foram registrados como esperado.

Se precisar aprofundar:

- [Autenticacao e guards](./contracts/security-auth.md)
- [Variáveis de ambiente](./env.md)

## Rotas nao aparecem

Sequencia recomendada:

1. confira a arvore em `src/http/routes`;
2. valide nomes como `get.route.ts`, `post.route.ts` e segmentos `[id]`;
3. confirme se o consumidor usa `src/http/routes` no dev e `dist/http/routes` no build;
4. rode `pnpm api-cli routes:validate` se esse comando existir no projeto.

Se precisar aprofundar:

- [Rotas por pasta](./contracts/http-register-route.md)
- [Arquitetura](./architecture.md)

## OpenAPI fica incompleto

Sequencia recomendada:

1. confirme `options.schema.response`;
2. use Zod em `params`, `querystring` e `body` quando aplicavel;
3. em multipart documentado, confirme `schema.consumes` e `schema.body` documental quando necessario;
4. revise se a rota depende de `security` automatico ou configuracao manual.

Se precisar aprofundar:

- [OpenAPI](./openapi.md)
- [Schemas Zod e provedor de tipos](./contracts/http-schemas-zod.md)
- [Multipart](./multipart.md)

## Erros HTTP nao seguem o contrato esperado

Sequencia recomendada:

1. confirme se o app registra `errorHandlerPlugin`;
2. revise se o handler esta lançando `AppError` para falhas esperadas;
3. remova `try/catch` por rota que remapeia resposta manualmente;
4. confirme se `requestId` aparece no payload e nos logs.

Se precisar aprofundar:

- [Handler de erros global](./contracts/http-error-handler.md)
- [AppError e erros HTTP](./contracts/shared-errors.md)

## Projeto parece legado ou fora do scaffold atual

Sequencia recomendada:

1. confira versoes de `@sebrae/api-base` e `@sebrae/api-base-cli`;
2. confira se existem wrappers como `src/http/zod.ts` e `src/config/env.ts`;
3. confira scripts reais de `dev`, `build`, `db:*` e `routes:*` no `package.json`;
4. se houver grande divergencia, preserve o padrao local antes de impor o scaffold atual.

Se precisar aprofundar:

- [Visão geral](./overview.md)
- [CLI](./cli.md)
- [Arquitetura](./architecture.md)

## Referências relacionadas

- [Variáveis de ambiente](./env.md)
- [CLI](./cli.md)
- [Arquitetura](./architecture.md)
- [OpenAPI](./openapi.md)
- [Workers](./workers.md)
- [Implantação](./deploy.md)
