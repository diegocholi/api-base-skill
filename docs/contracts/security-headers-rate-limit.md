# Headers e limite de taxa

## Objetivo

Padronizar headers de segurança (helmet/cors) e limitar abuso por IP/usuário.

## Quando usar

- Sempre que a API estiver exposta publicamente.
- Para proteger endpoints sensiveis com limites mais restritos.

## Quando NÃO usar

- Não desabilite limite de taxa em produção.
- Não use CORS '\*' em produção.

## Contrato

### Helmet

- Controlado por `HTTP_HELMET_ENABLED`.
- Remove `x-powered-by` e `server` em respostas.

### CORS

- Controlado por `HTTP_CORS_ENABLED` e `HTTP_CORS_ORIGINS`.
- Em produção, `HTTP_CORS_ORIGINS` deve ser allowlist.

### Limite de taxa

- Controlado por `HTTP_RATE_LIMIT_ENABLED`.
- `resolveRateLimitKey` usa `user` quando autenticado e IP como fallback.
- Override por rota via `config.rateLimitKey` (`auto`, `user`, `ip`).
- Para desabilitar em rotas especificas, use `config.rateLimit = false`.

## Erros e códigos de status

- Limite de taxa excedido retorna 429 (padrão do Fastify).
- CORS mal configurado pode bloquear preflight.

## Exemplos

### Básico

```ts
export default {
  options: {
    config: { rateLimitKey: 'auto' },
    schema: { response: { 200: schema } },
  },
  handler: async () => ({ ok: true }),
};
```

### Avançado

```ts
export default {
  options: {
    config: { rateLimitKey: 'ip', auth: { public: true } },
    schema: { response: { 200: schema } },
  },
  handler: async () => ({ ok: true }),
};
```

## Anti-padrões

- CORS '\*' em produção.
- Limite de taxa desabilitado em prod.
- Estratégia de chave inconsistente por rota.

## Checklist de revisão

- [ ] `HTTP_CORS_ORIGINS` com allowlist em prod.
- [ ] Helmet habilitado quando aplicavel.
- [ ] Limite de taxa habilitado e revisado.
- [ ] Override de limite de taxa apenas quando necessário.
