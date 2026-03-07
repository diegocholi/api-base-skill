# AppError e contrato de erros

## Objetivo

Definir um formato de erro consistente para respostas HTTP e comunicação interna.

## Quando usar

- Para qualquer falha esperada de domínio ou validação.
- Para erros de infraestrutura onde se quer padronizar resposta.

## Quando NÃO usar

- Não use para erros de programacao (bugs) sem tratamento.
- Não exponha stack trace ou dados sensiveis em `details`.

## Contrato

### Formato HTTP padrão

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validação falhou",
  "details": { "field": "name" },
  "requestId": "req-123"
}
```

### Classes principais

- `AppError`: base com `code`, `message`, `details?`, `isOperational`.
- `ValidationError`: `VALIDATION_ERROR` (400).
- `UnauthorizedError`: `UNAUTHORIZED` (401).
- `ForbiddenError`: `FORBIDDEN` (403).
- `NotFoundError`: `NOT_FOUND` (404).
- `ConflictError`: `CONFLICT` (409).
- `InfrastructureError`: `INFRASTRUCTURE_ERROR` (503).

### Mapeamento code -> HTTP

| code                         | status |
| ---------------------------- | ------ |
| VALIDATION_ERROR             | 400    |
| UNAUTHORIZED                 | 401    |
| FORBIDDEN                    | 403    |
| NOT_FOUND                    | 404    |
| CONFLICT                     | 409    |
| INFRASTRUCTURE_ERROR         | 503    |
| outros (isOperational=true)  | 400    |
| outros (isOperational=false) | 500    |

## Erros e códigos de status

- `AppError` vira o `status` conforme tabela acima.
- Erros de schema (Zod/Fastify) viram `ValidationError` (400).
- Erros desconhecidos viram `INTERNAL_ERROR` (500).

## Exemplos

### Básico

```ts
import { NotFoundError } from '@/shared/errors';

throw new NotFoundError('Usuário não encontrado', { id: userId });
```

### Avançado

```ts
import { AppError } from '@/shared/errors';

throw new AppError({
  code: 'CUSTOM_RULE',
  message: 'Regra violada',
  details: { rule: 'user.active' },
  isOperational: true,
});
```

## Anti-padrões

- Retornar string/objeto solto em vez de `AppError`.
- Usar `details` para incluir PII (emails, tokens, CPF etc.).
- Usar `isOperational=false` para erros esperados.

## Checklist de revisão

- [ ] Erros esperados usam subclasses de `AppError`.
- [ ] `details` não expande dados sensiveis.
- [ ] Código de status mapeado corretamente.
- [ ] Resposta inclui `requestId`.
