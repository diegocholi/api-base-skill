# Contratos publicos do template

Este indice detalha contratos proximos da implementacao da base. Para a jornada de uso do consumidor, comece por [Visao geral](../overview.md) e [API](../api.md).

Limite de escopo para code agents:

- esta pagina cobre contratos publicos usados por consumidores;
- nao desvie para `docs/project-base/*` a menos que a tarefa trate da manutencao da base, do monorepo ou da paridade do scaffold;
- para tarefas normais de servico consumidor, permaneça nesta area e nos guias de `docs/*`.

Ordem recomendada para code agents:

1. Abra [Rotas por pasta](./http-register-route.md) antes de criar ou mover rotas.
2. Abra [Schemas com Zod e provedor de tipos](./http-schemas-zod.md) antes de alterar request ou response.
3. Abra [Autenticacao e guards](./security-auth.md) quando a rota for privada, usar RBAC, cookies ou social auth.
4. Abra [Handler de erros global](./http-error-handler.md) quando a rota mudar contratos de falha.
5. Abra os contratos de dados e observabilidade apenas se a tarefa tocar nessas camadas.

Atalho operacional:

- rota publica: `http-register-route` + `http-schemas-zod`;
- rota privada com RBAC: `http-register-route` + `http-schemas-zod` + `security-auth`;
- endpoint com banco: adicionar `data-db`;
- endpoint auditado: adicionar `obs-audit`.

## HTTP

- [Rotas por pasta](./http-register-route.md)
- [Schemas com Zod e provedor de tipos](./http-schemas-zod.md)
- [Handler de erros global](./http-error-handler.md)
- [RequestId e correlacao](./http-request-id.md)

## Compartilhado

- [Result](./shared-result.md)
- [AppError e erros HTTP](./shared-errors.md)

## Dados

- [DB e repositórios](./data-db.md)
- [Migrações](./data-migrations.md)
- [CacheService e KeyBuilder](./data-cache.md)
- [QueueService, jobs e workers](./data-queue.md)

## Seguranca

- [Autenticacao e guards](./security-auth.md)
- [Headers e rate limit](./security-headers-rate-limit.md)

## Observabilidade

- [Logs](./obs-logger.md)
- [Auditoria](./obs-audit.md)
- [Rastreamento e métricas](./obs-tracing-metrics.md)

## Operação

- [Variáveis de ambiente](../env.md)
- [Workers](../workers.md)
- [Outbox](../outbox.md)
- [Testes](../testing.md)
- [Solução de problemas](../troubleshooting.md)
