# RequestId e correlacao

## Objetivo

Garantir correlacao entre logs, respostas e chamadas externas via `x-request-id`.

## Quando usar

- Em qualquer request HTTP (entrada e saida).
- Em chamadas externas e filas para propagar rastreio.

## Quando NÃO usar

- Não gere um novo requestId para cada log.
- Não sobrescreva `x-request-id` se já veio do cliente.

## Contrato

### Assinatura

```ts
app.register(requestIdPlugin);
```

### Entradas

- Header `x-request-id` (case-insensitive).

### Saidas

- `request.requestId` populado.
- Header `x-request-id` de resposta.
- Log com `requestId` em todas as entradas do request.

## Erros e códigos de status

- Não ha erros diretos; o plugin sempre gera um id quando ausente.

## Exemplos

### Básico

```ts
export const handler = async (request) => {
  request.log.info({ requestId: request.requestId }, 'handling request');
  return { ok: true };
};
```

### Avançado

```ts
import { createHttpClient } from '@/providers/http-client';

const client = createHttpClient({});

export const handler = async (request) => {
  await client.post('https://service/api', {
    requestId: request.requestId,
  });

  return { ok: true };
};
```

## Anti-padrões

- Remover o header `x-request-id` na resposta.
- Gerar um novo id para cada operação interna.
- Ignorar `requestId` em logs de erro.

## Checklist de revisão

- [ ] `requestIdPlugin` registrado.
- [ ] Logs de request incluem `requestId`.
- [ ] Chamadas externas propagam `x-request-id`.
- [ ] Fila registra `requestId` nos jobs quando aplicavel.
