# CacheService e KeyBuilder

## Objetivo

Padronizar cache-aside, TTL e chaves com prefixo/versionamento.

## Quando usar

- Para leituras frequentes e dados estaveis por curto periodo.
- Para reduzir custo de consultas repetidas.

## Quando NÃO usar

- Não use para dados altamente volateis.
- Não use TTL infinito.

## Contrato

### Assinatura (CacheService)

```ts
const cache = new CacheService({ client, prefix: 'service:v1', logger });

await cache.getJson<T>(key);
await cache.setJson<T>(key, value, ttlSeconds?);
await cache.del(key);
await cache.delByPrefix(prefix, { maxKeys?, batchSize? });
await cache.cacheAside<T>(key, ttlSeconds, loader);
```

### Assinatura (KeyBuilder)

```ts
const builder = new KeyBuilder({ serviceName: 'api-base', version: 'v1' });
const key = builder.key('user', ['123']);
```

### Entradas

- `ttlSeconds` em segundos.
- `prefix` com versão (`service:v1`).

### TTL padronizado da LIB

Use as constantes publicas de `@sebrae/api-base` para evitar valores magicos:

```ts
import { CACHE_TTL_1_MINUTE, CACHE_TTL_10_MINUTES, CACHE_TTL_DAY } from '@sebrae/api-base';

await cache.setJson('user:123', { id: '123' }, CACHE_TTL_10_MINUTES);
await cache.setJson('feature-flags', { beta: true }, CACHE_TTL_1_MINUTE);
await cache.setJson('catalog:snapshot', { ok: true }, CACHE_TTL_DAY);
```

### Saidas

- JSON serializado no Redis.
- Logs warn quando parse JSON falha ou `delByPrefix` trunca.
- O `CacheService` detecta misconfiguracao de comandos Redis (`del`/`scan`) no bootstrap e loga warn de modo degradado.
- `del` e `delByPrefix` sao best-effort: se o cliente Redis estiver sem comandos (`del`/`scan`), a lib faz skip com warn e nao quebra a escrita principal.
- `getJson` retorna `undefined` quando JSON inválido.
- Se `REDIS_URL` estiver ausente no bootstrap da app, o acesso a `request.server.cache`
  falha com `InfrastructureError` indicando a configuracao obrigatoria.

## Erros e códigos de status

- Erros de Redis propagam como falha de infraestrutura (500/503 conforme handler).

## Exemplos

### Básico

```ts
const user = await cache.cacheAside('user:123', 60, () => repo.getById('123'));
```

### Avançado

```ts
const builder = new KeyBuilder({ serviceName: 'api-base' });
const key = builder.key('users', ['123']);

await cache.setJson(key, { id: '123' }, 300);
await cache.delByPrefix('users');
```

## Como um code agent decide usar este contrato

- use cache apenas quando houver leitura repetida com ganho real de latencia ou custo;
- prefira `cacheAside` como padrao antes de montar fluxo customizado;
- reuse TTLs publicos da lib antes de criar numeros magicos;
- confirme se o consumidor realmente tem Redis configurado antes de introduzir dependencia de cache.

## Anti-padrões

- TTL infinito ou muito alto para dados volateis.
- Chaves sem prefixo/versionamento.
- Cachear PII ou tokens sem necessidade.

## Checklist de revisão

- [ ] Chaves com prefixo e versão (`service:v1`).
- [ ] TTL definido e revisado.
- [ ] Cache-aside usado para leituras.
- [ ] Invalida por prefixo quando preciso.
