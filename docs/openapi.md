# OpenAPI e Swagger

## Como habilitar

```env
SWAGGER_ENABLED=true
```

Rotas padrão:

- UI: `/docs`
- JSON: `/openapi.json`

As duas podem ser alteradas por `SWAGGER_DOCS_ROUTE` e `SWAGGER_OPENAPI_ROUTE`.

## Como documentar rotas

O OpenAPI é gerado a partir de `options.schema` das rotas. No consumidor, prefira `defineZodRoute`.

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      params: z.object({ id: z.uuid() }),
      response: {
        200: z.object({ id: z.uuid(), name: z.string() }),
      },
    },
  },
  handler: async (request) => ({ id: request.params.id, name: 'Ana' }),
});
```

Campos mais importantes:

- `params`
- `querystring`
- `body`
- `response`
- `security`

## Multipart no Swagger

Para rotas multipart, `schema.consumes = ['multipart/form-data']` documenta a operação no OpenAPI,
mas nao habilita o parser de upload.

Quando os campos do form precisam aparecer no Swagger UI:

- inicialize a app com `createApp({ multipart: { attachFieldsToBody: true } })`;
- declare `schema.body` com JSON Schema;
- para o campo de arquivo abrir o seletor de upload no Swagger UI, use
  `type: 'string'` com `format: 'binary'`.

Exemplo:

```ts
schema: {
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    required: ['file'],
    properties: {
      file: { type: 'string', format: 'binary' },
      folder: { type: 'string' },
    },
  },
  response: {
    201: z.object({ ok: z.literal(true) }),
  },
}
```

Para detalhes de runtime, limites de upload e exemplos completos, consulte
[Multipart](./multipart.md).

## Rotas protegidas

Quando a rota exigir autenticação, o plugin de Swagger normalmente injeta `security`
automaticamente para o Swagger UI habilitar o fluxo de `Authorize`.

Isso acontece quando a rota é protegida por:

- guard global com `AUTH_GUARD_ENABLED=true`;
- `preHandler` que exige auth;
- `config.permissions` ou `config.roles`.

Declare `schema.security` manualmente apenas quando quiser sobrescrever esse comportamento
ou explicitar um caso especial.

```ts
schema: {
  security: [{ bearerAuth: [] }],
  response: { 200: responseSchema },
}
```

Rotas públicas podem declarar `config.auth.public = true`.

## Geração do arquivo estático

```bash
pnpm run openapi:generate
pnpm run openapi:lint
```

## Variáveis relacionadas

- `SWAGGER_ENABLED`
- `SWAGGER_DOCS_ROUTE`
- `SWAGGER_OPENAPI_ROUTE`
- `SWAGGER_SERVERS`
- `SWAGGER_TITLE`
- `SWAGGER_DESCRIPTION`
- `SWAGGER_ALLOWED_IPS`

## Referências relacionadas

- [Visão geral](./overview.md)
- [Exemplos](./examples.md)
- [Variáveis de ambiente](./env.md)
- [Implantação](./deploy.md)
