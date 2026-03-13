# Schemas Zod e provedor de tipos

## Objetivo

Padronizar validação de requisição/resposta com Zod e gerar tipos consistentes.

## Quando usar

- Para qualquer schema de `params`, `querystring`, `body` e `response`.
- Para inferir tipos de DTOs com `z.infer`.
- Para multipart com Swagger, voce pode misturar JSON Schema em `body` e manter Zod no restante.

## Quando NÃO usar

- Não use schemas soltos sem reutilizacao (prefira centralizar em `schemas/`).
- Para rotas HTTP, prefira `defineZodRoute` para evitar parse manual.

## Contrato

### Assinatura

```ts
import { z } from 'zod';
import { withZod } from '@/http/zod';

const app = withZod(fastify());
```

### Entradas

- Schemas Zod para requisição e resposta.
- `defineZodRoute` para inferência de tipos de `request`.
- `defineZodRoute` aceita rotas híbridas: partes como `params`, `querystring` e `response` podem continuar em Zod enquanto `body` usa JSON Schema.
- `defineZodRoute` aceita JSON Schema em campos como `body` quando a rota precisar documentar `multipart/form-data`.
- `parseWithZod` para validações fora do fluxo HTTP.
- `parseBody`, `parseParams` e `parseQuery` apenas para compatibilidade legada.

### Saidas

- Tipos inferidos com `z.infer<typeof schema>`.
- Erros de validação viram `ValidationError` (400).

## Erros e códigos de status

- Falhas de Zod geram `ValidationError` (400).
- Falhas de JSON Schema puro geram erros de validação do Fastify/AJV (400).
- Details incluem `issues` com path e message.

## Observacao sobre rotas híbridas

Quando a rota usa multipart com `attachFieldsToBody`, o `schema.body` em JSON Schema
serve principalmente para documentacao no OpenAPI/Swagger.

Nesse caso:

- o Swagger usa o `schema.body` para renderizar os campos do form;
- o runtime continua entregando `request.body` no formato do multipart do Fastify;
- o `body` documental não é validado contra esse shape interno do multipart.

## Exemplos

### Básico

```ts
import { z } from 'zod';

export const createUserBodySchema = z.object({
  name: z.string().min(1),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
```

### Avançado

```ts
import { z } from 'zod';
import { defineZodRoute } from '@/http/zod';

const baseSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});

const updateSchema = baseSchema.partial().merge(z.object({ active: z.boolean().optional() }));

export default defineZodRoute({
  options: {
    schema: {
      body: updateSchema,
      response: { 200: z.object({ ok: z.boolean(), payload: updateSchema }) },
    },
  },
  handler: async (request) => ({ ok: true, payload: request.body }),
});
```

## Anti-padrões

- Schema de response incompleto ou ausente.
- Usar `any` no handler e ignorar schema.
- Duplicar schemas sem composicao (`merge`, `pick`, `partial`).

## Checklist de revisão

- [ ] Params/query/body/response possuem schema Zod.
- [ ] Zod schemas reutilizados em módulo.
- [ ] Handler usa `defineZodRoute` (parse manual apenas fora de HTTP ou legado).
- [ ] Tipos inferidos com `z.infer`.
