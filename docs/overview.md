# Visão geral

Este guia é a porta de entrada para times que constroem APIs com `@sebrae/api-base` e `@sebrae/api-base-cli`.

## O que a API-BASE entrega

- `@sebrae/api-base`: runtime HTTP, validação, erros, observabilidade e integrações compartilhadas.
- `@sebrae/api-base-cli`: bootstrap do projeto consumidor e geração de scaffolds.

## Fluxo recomendado no consumidor

1. Instale os pacotes.
2. Rode `pnpm api-cli init`.
3. Ajuste o `.env`.
4. Rode `pnpm run db:migrate:env`.
5. Suba a API com `pnpm run dev`.
6. Valide `health`, `ready`, `__routes` e Swagger.

## Início rápido

```bash
pnpm add @sebrae/api-base
pnpm add -D @sebrae/api-base-cli
pnpm api-cli init
```

`.env` mínimo:

```env
NODE_ENV=development
PORT=3000
SWAGGER_ENABLED=true
DB_DIALECT=postgres
DATABASE_URL=postgres://user:pass@localhost:5432/app
REDIS_URL=redis://localhost:6379
```

Execução local:

```bash
pnpm run db:migrate:env
pnpm run dev
```

Validação básica:

- `http://127.0.0.1:3000/health`
- `http://127.0.0.1:3000/ready`
- `http://127.0.0.1:3000/__routes`
- `http://127.0.0.1:3000/docs`

## Como navegar na documentação

- [Arquitetura](./architecture.md): estrutura do projeto consumidor e convenções.
- [API](./api.md): exports, comandos e variáveis mais usadas.
- [Exemplos](./examples.md): snippets para servidor, rotas, casos de uso e repositórios.

Guias complementares:

- [Instalação](./installing-packages.md)
- [CLI](./cli.md)
- [Variáveis de ambiente](./env.md)
- [OpenAPI](./openapi.md)
- [Migrações](./migrations.md)
- [Workers](./workers.md)
- [Padrões](./standards.md)
- [Testes](./testing.md)
- [Implantação](./deploy.md)
- [Solução de problemas](./troubleshooting.md)

Conteúdo interno da base:

- [Projeto base](./project-base/overview.md)
