# Rotas por pasta (HTTP)

## Objetivo

Garantir que rotas definidas por arquivos tenham schema completo
(requisição/resposta) e respostas de erro padronizadas.

## Quando usar

- Para criar rotas HTTP via arquivos `*.route.ts` em `src/http/routes/**`.
- Ao carregar rotas pelo loader `registerRoutes`.

## Quando NÃO usar

- Não use `app.route` direto em rotas do template.
- Não chame `registerRoute` manualmente (uso interno do loader).
- Não registre rotas sem schema em ambiente de desenvolvimento/teste.

## Contrato

### Resolucao de rotas (pastas -> URL)

- O método vem do nome do arquivo: `get.route.ts`, `post.route.ts`, etc.
- O path vem da árvore de pastas em `src/http/routes`.
- Segmentos `[id]` viram parâmetros `:id`.

Exemplos:

- `src/http/routes/health/get.route.ts` -> `GET /health`
- `src/http/routes/users/[id]/get.route.ts` -> `GET /users/:id`

### Interface do módulo

```ts
export interface RouteModule {
  enabled?: boolean | ((ctx: RouteContext) => boolean);
  options?: RouteShorthandOptions & { config?: RouteConfig };
  handler: RouteHandlerMethod;
}
```

### Entradas

- `options.schema` deve conter:
  - `params` quando a URL tem `:id`.
  - `body` para `POST`, `PUT`, `PATCH`, exceto quando a rota declara `consumes: ['multipart/form-data']`.
  - `querystring` para `GET`, `DELETE`, `HEAD`.
  - `response` com algum `2xx` (ex: `200`, `201` ou `2xx`).
- `enabled` pode desabilitar a rota via config/contexto.

Observação sobre multipart:

- o parser multipart ja vem habilitado no runtime;
- `consumes: ['multipart/form-data']` nao ativa upload;
- esse campo documenta a rota e informa ao validador que `schema.body` pode ser omitido;
- use `schema.body` apenas quando quiser expor os campos do form-data no OpenAPI, normalmente junto com `attachFieldsToBody` no bootstrap.
- para configuracao do plugin e exemplos completos, consulte [Multipart](../multipart.md).

### Saidas

- O loader `registerRoutes` resolve o arquivo e registra a rota.
- `registerRoute` injeta respostas `400` e `500` automaticamente.

## Como um code agent decide usar este contrato

- se a tarefa criar rota nova, comece pelo caminho do arquivo em `src/http/routes/**` antes de pensar no handler;
- depois escolha o metodo pelo nome do arquivo (`get.route.ts`, `post.route.ts`, etc);
- complete `params`, `querystring`, `body` e `response` antes de implementar a logica;
- se a rota for privada, abra tambem [Autenticacao e guards](./security-auth.md);
- se o consumidor ainda usar `satisfies RouteModule`, preserve o padrao local e nao force migracao para `defineZodRoute` sem necessidade.

Sequencia recomendada:

1. escolher o path do arquivo;
2. definir o verbo HTTP;
3. preencher `options.schema`;
4. aplicar auth/publicidade da rota;
5. implementar handler;
6. validar com `pnpm api-cli routes:validate` ou o comando equivalente do projeto.

## Erros e códigos de status

- Em `NODE_ENV=development|test`, faltas de schema geram `RouteSchemaError`.
- Em `NODE_ENV=production`, a rota registra mesmo com schema incompleto.

## Exemplos

### Básico (arquivo de rota)

```ts
import { z } from 'zod';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      querystring: z.object({}).strict(),
      response: {
        200: z.object({ ok: z.literal(true) }),
      },
    },
  },
  handler: async () => ({ ok: true }),
});
```

### Avançado (POST)

```ts
import { z } from 'zod';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      body: z.object({ name: z.string().min(1) }),
      response: {
        201: z.object({ id: z.uuid(), name: z.string() }),
      },
    },
  },
  handler: async (request, reply) => {
    reply.code(201);
    return { id: 'user-123', name: request.body.name };
  },
});
```

### Multipart

```ts
import { z } from 'zod';
import { ValidationError } from '@sebrae/api-base';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        201: z.object({ ok: z.literal(true), filename: z.string() }),
      },
    },
  },
  handler: async (request, reply) => {
    const file = await request.file();
    if (!file) {
      throw new ValidationError('Arquivo nao enviado');
    }

    reply.code(201);
    return { ok: true, filename: file.filename };
  },
});
```

### GET com params

```ts
import { z } from 'zod';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      params: z.object({ id: z.uuid() }),
      querystring: z.object({}).strict(),
      response: {
        200: z.object({ id: z.uuid(), name: z.string() }),
      },
    },
  },
  handler: async (request) => ({ id: request.params.id, name: 'Ada' }),
});
```

O formato com `satisfies RouteModule` continua compatível, mas a documentação do consumidor
prioriza `defineZodRoute` como padrão atual.

## Anti-padrões

- Usar `app.route` direto em vez do loader.
- Exportar handler sem `options.schema`.
- Deixar `response` sem `2xx`.
- Registrar `GET` sem `querystring`.

## Checklist de revisão

- [ ] Arquivo `*.route.ts` no caminho correto.
- [ ] `schema` completo para params/query/body.
- [ ] `response` define `2xx`.
- [ ] Erros 400/500 presentes (auto-injetados).
- [ ] Teste valida schema (`routes:validate`).
