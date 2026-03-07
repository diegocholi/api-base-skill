# Padrões do consumidor

Este documento registra as convenções recomendadas para projetos que usam `@sebrae/api-base`.

## Casos de uso

- mantenha casos de uso puros e com dependências explícitas;
- valide entrada com Zod;
- retorne `Result<T, AppError>` para falhas esperadas;
- faça `throw` apenas em erro inesperado.

## Erros

Prefira os erros tipados da base:

- `ValidationError`
- `NotFoundError`
- `ConflictError`
- `UnauthorizedError`
- `ForbiddenError`
- `InfrastructureError`

## Rotas

- prefira `defineZodRoute`;
- declare `options.schema.response` sempre que possível;
- trate rotas públicas explicitamente com `config.auth.public = true`;
- use `schema.security` apenas quando precisar sobrescrever ou explicitar o comportamento do Swagger;
- no fluxo padrão, rotas protegidas já recebem `security` automaticamente.

## Regras compartilhadas

Quando mais de um caso de uso reutilizar a mesma regra:

- no mesmo módulo: `src/modules/<modulo>/application/rules`;
- entre módulos: `src/shared/domain/rules` ou `src/shared/application/rules`.

## Cache

- prefira cache-aside;
- use chaves explícitas e versionadas;
- prefira TTLs constantes da base;
- para invalidação por grupo, use prefixos previsíveis.

## Filas

- defina nomes de jobs e schemas no consumidor;
- valide payload antes de enfileirar;
- use retries apenas quando a operação for segura para repetição.

## Logs e observabilidade

- use logs estruturados;
- inclua `requestId` quando disponível;
- não logue segredos;
- habilite tracing e métricas só quando o ambiente estiver preparado.

## Dependências externas

- use `@sebrae/api-base/providers/*` para clientes HTTP;
- configure timeout, retries e circuit breaker de forma explícita;
- não reexporte detalhes do provider para o domínio.

## Referências relacionadas

- [Arquitetura](./architecture.md)
- [API](./api.md)
- [Exemplos](./examples.md)
