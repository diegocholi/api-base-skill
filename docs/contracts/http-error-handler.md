# Handler de erros global

## Objetivo

Centralizar conversao de erros em HTTP e garantir logs consistentes com requestId.

## Quando usar

- Sempre habilitado no app (`errorHandlerPlugin`).
- Para transformar `AppError` em respostas padronizadas.

## Quando NÃO usar

- Não use try/catch por rota para mapear erros.
- Não gere respostas customizadas fora do contrato.

## Contrato

### Assinatura

```ts
app.register(errorHandlerPlugin, { env });
```

### Entradas

- `AppError` ou erros genericos.
- `env.NODE_ENV` controla detalhes em erros 500.

### Saidas

- Resposta JSON: `{ code, message, details?, requestId }`.
- Logs `warn` para 4xx e `error` para 5xx.

## Erros e códigos de status

- `AppError` usa mapeamento por `code`.
- `ZodError` e erros de validação viram `ValidationError` (400).
- Erro desconhecido vira `INTERNAL_ERROR` (500) com details apenas fora de prod.

## Exemplos

### Básico

```ts
import { NotFoundError } from '@/shared/errors';

export const handler = async () => {
  throw new NotFoundError('User not found');
};
```

### Avançado

```ts
import { AppError } from '@/shared/errors';

export const handler = async () => {
  throw new AppError({
    code: 'CUSTOM_ERROR',
    message: 'Custom error',
    isOperational: true,
  });
};
```

## Anti-padrões

- `try/catch` no handler para mapear erro manualmente.
- Retornar payload de erro custom por rota.
- Logar stack ou payload sensivel em `details`.

## Checklist de revisão

- [ ] Erros esperados são `AppError`.
- [ ] Handler não captura e re-escreve erros.
- [ ] Resposta inclui `requestId`.
- [ ] Logs seguem nivel correto (4xx warn, 5xx error).
