# Rastreamento e métricas

## Objetivo

Explicar como habilitar OTEL e Prometheus para observabilidade.

## Quando usar

- Rastreamento quando houver multiplos serviços.
- Métricas para dashboards e alertas de SLIs.

## Quando NÃO usar

- Não habilite rastreamento sem exporter configurado.
- Não exponha métricas sem auth/allowlist em prod.

## Contrato

### Rastreamento (OTEL)

- Habilitado por `OTEL_ENABLED=true`.
- Exporter via `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Atributos base: `service.name`, `deployment.environment`, `service.version`.
- `tracingPlugin` injeta `http.request_id` e `http.route` nos spans.

### Métricas (Prometheus)

- Habilitado por `METRICS_ENABLED=true`.
- Endpoint `METRICS_ROUTE` (padrão `/metrics`).
- Allowlist via `METRICS_ALLOWED_IPS` e token via `METRICS_AUTH_TOKEN`.

## Erros e códigos de status

- Sem token/allowlist: 401/403 no endpoint de métricas.
- Rastreamento com exporter ausente não exporta spans.

## Exemplos

### Básico

```bash
OTEL_ENABLED=true OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318
METRICS_ENABLED=true METRICS_ROUTE=/metrics
```

### Avançado

```bash
METRICS_ALLOWED_IPS=10.0.0.1,10.0.0.2
METRICS_AUTH_TOKEN=secret
```

## Anti-padrões

- Rastreamento ligado sem exporter configurado.
- Métricas expostas publicamente em prod.
- Atributos de service inconsistentes.

## Checklist de revisão

- [ ] OTEL configurado com endpoint valido.
- [ ] Métricas protegidas por allowlist/token.
- [ ] `requestId` propagado (quando disponível).
- [ ] Dashboards usam métricas padrão (`http_requests_total`).
