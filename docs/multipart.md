# Multipart

Para code agents:

- use este guia quando a decisao envolver parser multipart, `attachFieldsToBody`, upload por stream ou documentacao de arquivo no Swagger;
- se ainda nao estiver claro se o problema e parser, OpenAPI ou wiring local, volte para [Playbooks para code agents](./agent-playbooks.md);
- se o consumidor tiver plugin local ou shape proprio para upload, priorize o comportamento real do projeto antes de aplicar o padrao documentado aqui.

## Visao geral

O runtime registra `@fastify/multipart` no `createApp()` por padrão.
Voce nao precisa declarar `multipart: true` no consumidor para upload funcionar.

Isso ja deixa disponivel no handler:

- `await request.file()`
- `await request.files()`
- `for await (const part of request.parts())`

`schema.consumes = ['multipart/form-data']` nao habilita o parser multipart.
Esse campo serve para:

- documentar a rota no OpenAPI/Swagger;
- explicitar o contrato HTTP da rota;
- permitir que a validacao estrita aceite rotas multipart sem `schema.body`.

Para code agents, a sequencia padrao e:

1. confirmar se a rota precisa apenas receber arquivo por stream ou tambem documentar campos no Swagger;
2. usar upload por stream como padrao mais simples;
3. habilitar `attachFieldsToBody` so quando houver requisito claro de documentacao dos campos;
4. nao tratar `schema.body` de multipart como garantia do shape interno de `request.body`.

Gatilho de retorno:

- parser falha ou arquivo nao chega ao handler: volte para troubleshooting;
- Swagger documenta mas o runtime diverge: trate `schema.body` como documental e valide o fluxo real do consumidor;
- bootstrap muito customizado ou legado: volte para o playbook de legado.

## Configuracao do plugin

Quando precisar customizar o comportamento do upload, passe as opcoes do
`@fastify/multipart` no bootstrap:

```ts
const app = createApp({
  env,
  multipart: {
    attachFieldsToBody: true,
    limits: {
      fileSize: 10 * 1024 * 1024,
      parts: 20,
    },
    throwFileSizeLimit: true,
  },
});
```

Configuracoes mais comuns:

- `attachFieldsToBody`: copia os campos do `form-data` para `request.body`;
- `limits.fileSize`: tamanho maximo por arquivo em bytes;
- `limits.parts`: numero maximo de partes no multipart;
- `throwFileSizeLimit`: quando `true`, exceder `fileSize` gera erro `413`.

Observacoes:

- sem `limits.fileSize`, o plugin usa o limite padrao do Fastify multipart;
- se a rota usar `toBuffer()`, o arquivo inteiro sera carregado em memoria.

## Upload por stream

Para uploads simples por stream, o padrão recomendado é usar `request.file()` e declarar `schema.consumes`:

```ts
import { z } from 'zod';

import { ValidationError } from '@sebrae/api-base';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      consumes: ['multipart/form-data'],
      response: {
        201: z.object({
          ok: z.literal(true),
          filename: z.string(),
        }),
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

## Campos do form no Swagger

Use `attachFieldsToBody` apenas quando voce precisar expor os campos do form-data no Swagger.
Nesse caso, configure o bootstrap com `attachFieldsToBody` e declare `body` com JSON Schema.

- para o Swagger UI renderizar um seletor de arquivo, o campo de upload deve ser
  documentado como `type: 'string'` com `format: 'binary'`;
- no runtime, esse campo continua chegando em `request.body` como o objeto multipart
  do Fastify, com metodos como `toBuffer()`.
- por isso, o `schema.body` usado nesse caso e tratado como contrato de documentacao,
  nao como validacao do shape interno do multipart no runtime.

```ts
const app = createApp({
  env,
  multipart: { attachFieldsToBody: true },
});
```

```ts
import { z } from 'zod';

import { ValidationError } from '@sebrae/api-base';
import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
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
    },
  },
  handler: async (request, reply) => {
    const body = request.body as {
      file?: { filename?: string; mimetype?: string; toBuffer: () => Promise<Buffer> };
      folder?: { value?: string };
    };

    if (!body.file) {
      throw new ValidationError('Arquivo nao enviado');
    }

    await body.file.toBuffer();
    reply.code(201);
    return { ok: true };
  },
});
```

Resumo:

- upload funcionar: automatico no runtime;
- `consumes`: contrato e documentacao;
- `schema.body`: opcional no upload por stream, necessario quando os campos do form precisam aparecer no OpenAPI.
- em rotas híbridas, o restante do schema pode continuar em Zod.

Checklist rapido para code agents:

- upload simples: `request.file()` + `schema.consumes`;
- upload com campos no Swagger: `attachFieldsToBody` + `schema.body` documental;
- arquivo grande: evitar `toBuffer()` quando stream for suficiente;
- validacao final: testar upload real e revisar o OpenAPI resultante.

## Referências relacionadas

- [Playbooks para code agents](./agent-playbooks.md)
- [OpenAPI](./openapi.md)
- [Exemplos](./examples.md)
