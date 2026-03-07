# Logs

## Objetivo

Definir campos obrigatórios e niveis de log para rastreio consistente.

## Quando usar

- Em todo fluxo de request e processamento assincroono.
- Para eventos de ciclo de vida (start/stop) e erros.

## Quando NÃO usar

- Não use `console.log` no código de runtime.
- Não logue payload sensivel.

## Contrato

### Assinatura

```ts
const logger = createLogger({
  level: env.LOG_LEVEL,
  service: env.SERVICE_NAME,
  env: env.NODE_ENV,
  pretty: env.NODE_ENV !== 'production',
});
```

### Campos obrigatórios

- `service`
- `env`
- `requestId` (quando disponível)

### Niveis

- `info`: eventos esperados (start, success).
- `warn`: falhas recuperaveis (4xx).
- `error`: falhas de sistema (5xx).

## Erros e códigos de status

- Erros 5xx devem logar `error`.
- Erros 4xx devem logar `warn`.

## Exemplos

### Básico

```ts
request.log.info({ route: request.url }, 'request received');
```

### Avançado

```ts
try {
  await doWork();
} catch (error) {
  request.log.error({ err: error }, 'work failed');
  throw error;
}
```

## Anti-padrões

- Logar tokens, senhas ou dados sensiveis.
- Usar `console.log`.
- Logs sem `requestId` em fluxo HTTP.

## Checklist de revisão

- [ ] Log criado via `createLogger` ou `app.log`.
- [ ] Campos base presentes.
- [ ] Erros logados com `err`.
- [ ] Dados sensiveis removidos.
