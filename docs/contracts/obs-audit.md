# Auditoria

## Objetivo

Registrar eventos sensiveis de forma estruturada sem expor PII.

## Quando usar

- Criacao de usuários, mudança de papeis, exclusao de recursos.
- Operações que exigem trilha de auditoria.

## Quando NÃO usar

- Não use para logs comuns de debug.
- Não registre dados sensiveis ou payloads inteiros.

## Contrato

### Assinatura

```ts
audit(eventName, {
  actorId,
  action,
  resource: { type, id? },
  metadata?,
}, { logger, requestId });
```

### Entradas

- `eventName` (string).
- `payload` com `action` e `resource`.
- `context` obrigatório com `logger` e/ou `requestId` (pode ser `{}`).

### Saidas

- Log `info` com `audit: true`, `actorId` e `requestId`.

## Erros e códigos de status

- `audit` não gera erro; usa logger fallback.

## Exemplos

### Básico

```ts
import { audit } from '@/observability/audit';
import { createLogger } from '@/observability/logger';

const logger = createLogger({ level: 'info', service: 'api-base', env: 'development' });

audit(
  'users.created',
  {
    actorId: 'user-1',
    action: 'create',
    resource: { type: 'user', id: 'user-1' },
  },
  { logger },
);
```

### Avançado

```ts
import { audit } from '@/observability/audit';

audit(
  'users.role_changed',
  {
    actorId: request.user?.sub ?? 'system',
    action: 'change_role',
    resource: { type: 'user', id: targetId },
    metadata: { from: 'viewer', to: 'admin' },
  },
  { logger: request.log, requestId: request.requestId },
);
```

## Anti-padrões

- Registrar email, CPF, tokens ou dados de pagamento.
- Logar payload completo sem filtragem.
- Usar auditoria para eventos não sensiveis.

## Checklist de revisão

- [ ] Evento sensivel auditado.
- [ ] Metadata sem PII.
- [ ] RequestId incluido quando disponível.
- [ ] Nome do evento padronizado.
