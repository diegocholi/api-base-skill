# Result<T, E> (compartilhado)

## Objetivo

Padronizar retornos de casos de uso e evitar try/catch em cascata para erros esperados.

## Quando usar

- Em todos os casos de uso de aplicação.
- Quando quiser transformar falhas esperadas em fluxo de controle explícito.

## Quando NÃO usar

- Não use para erros inesperados (bugs, falhas de infraestrutura não previstas).
- Não use para exceções que devem interromper a requisição imediatamente.

## Contrato

### Assinatura

```ts
export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok: <T>(value: T) => Result<T, never>;
export const err: <E extends AppError>(error: E) => Result<never, E>;
export const match: <T, E extends AppError, R>(
  result: Result<T, E>,
  handlers: { ok: (value: T) => R; err: (error: E) => R },
) => R;
```

### Entradas

- `ok(value)` recebe o valor de sucesso.
- `err(error)` recebe um `AppError` (ou subclasse).
- `match(result, handlers)` recebe o `Result` e dois handlers.

### Saidas

- `ok` retorna `{ ok: true, value }`.
- `err` retorna `{ ok: false, error }`.
- `match` retorna o que o handler correspondente retornar.

## Erros e códigos de status

- O `Result` não define status code diretamente.
- O handler HTTP deve mapear `AppError` para HTTP (ver `http-error-handler.md`).

## Exemplos

Exemplos reais em `src/modules/users/application/usecases/CreateUser.ts` e
`src/modules/users/application/usecases/GetUser.ts`.

### Básico

```ts
import { err, ok, Result } from '@/shared/result';
import { ValidationError } from '@/shared/errors';

type Output = { id: string };

export const createUser = async (name: string): Promise<Result<Output>> => {
  if (!name.trim()) {
    return err(new ValidationError('Nome é obrigatório', { field: 'name' }));
  }

  return ok({ id: 'user-123' });
};
```

### Avançado

```ts
import { match } from '@/shared/result';
import { createUser } from './CreateUser';

export const handler = async (request, reply) => {
  const result = await createUser(request.body.name);

  return match(result, {
    ok: (value) => {
      reply.code(201);
      return value;
    },
    err: (error) => {
      throw error;
    },
  });
};
```

## Anti-padrões

- Lancar exceção dentro do caso de uso para falhas esperadas.
- Retornar `null`/`undefined` para indicar erro.
- Mapear `Result` para HTTP fora do handler (ex: dentro do repo).

## Checklist de revisão

- [ ] Todo caso de uso retorna `Result<T, AppError>`.
- [ ] `err(...)` usa subclasses de `AppError`.
- [ ] Handler HTTP usa `match` e repassa erro com `throw`.
- [ ] Testes cobrem casos `ok` e `err`.
