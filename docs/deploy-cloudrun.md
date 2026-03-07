# Implantacao no Cloud Run

## Visão geral

O app roda como container HTTP simples. O Cloud Run injeta `PORT`, e o Fastify usa `PORT` do env.

## Variáveis recomendadas

- `PORT`: fornecida pelo Cloud Run.
- `NODE_ENV`: `production`.
- `LOG_LEVEL`: `info` (ou `debug` para diagnostico).
- `LOG_ROUTES`: `false` (use `true` apenas para diagnostico).
- `SERVICE_NAME`: nome do serviço (default `api-base`).

HTTP:

- `HTTP_CORS_ENABLED`: `true` ou `false`.
- `HTTP_CORS_ORIGINS`: CSV com origins permitidas.
- `HTTP_TRUST_PROXY`: `true` no Cloud Run para resolver IP real via proxy.
- `HTTP_RATE_LIMIT_ENABLED`: `true` ou `false`.
- `HTTP_RATE_LIMIT_MAX`: limite de requests.
- `HTTP_RATE_LIMIT_WINDOW_MS`: janela em ms.
- `HTTP_HELMET_ENABLED`: `true` ou `false`.

Swagger:

- `SWAGGER_ENABLED`: `false` em prod.
- `SWAGGER_DOCS_ROUTE`: default `/docs`.
- `SWAGGER_OPENAPI_ROUTE`: default `/openapi.json`.

JWT:

- `JWT_SECRET` ou `JWT_PUBLIC_KEY`/`JWT_PRIVATE_KEY` (JWT interno).
- `JWT_ALLOWED_ALGS`: ativa o auth interno quando preenchido.
- `JWT_JWKS_URL` (Keycloak) e `JWT_KEYCLOAK_ALLOWED_ALGS` para validar tokens externos.
- `JWT_ISSUER`, `JWT_AUDIENCE`: opcionais.

Banco/Cache/Fila (se usados):

- `DATABASE_URL` ou `DB_URL`.
- `DB_DIALECT`: `postgres`, `mysql`, `mssql`.
- `ROUTE_SCHEMA_STRICT`: `true` para validar contratos de schema no boot tambem em producao.
- `REDIS_URL`.
- `QUEUE_PREFIX`.

## Observações operacionais

- Cold start: ajuste `min-instances` no Cloud Run se precisar de latência consistente.
- Para reduzir cold start, mantenha `OTEL_ENABLED=false` quando tracing nao for necessario.
- Health checks: `/health` e `/ready` via routes loader.
- Logs de rota: habilite `LOG_ROUTES=true` apenas em debug.
