# Solução de problemas

## Swagger não abre

- confirme `SWAGGER_ENABLED=true`;
- valide `/docs` e `/openapi.json`;
- revise as rotas e o CSP do ambiente.

## Banco não conecta

- confirme `DATABASE_URL` ou `DB_URL`;
- valide `DB_DIALECT`;
- rode `pnpm run db:migrate`.

## Redis ou fila não funcionam

- confirme `REDIS_URL`;
- valide conectividade e credenciais;
- para outbox, confirme também banco e parâmetros de batch/intervalo.

## Auth não valida token

- confirme `JWT_ALLOWED_ALGS` ou `JWT_JWKS_URL`;
- revise `JWT_SECRET`, chaves ou issuer/audience;
- valide se a rota está pública ou protegida como esperado.

## Rotas não aparecem

- confira a árvore em `src/http/routes`;
- valide nomes como `get.route.ts` e `post.route.ts`;
- rode `pnpm api-cli routes:validate`.

## OpenAPI fica incompleto

- defina `options.schema.response`;
- use Zod nos schemas de `body`, `params` e `querystring`;
- revise [OpenAPI](./openapi.md).

## Referências relacionadas

- [Variáveis de ambiente](./env.md)
- [OpenAPI](./openapi.md)
- [Workers](./workers.md)
- [Implantação](./deploy.md)
