# Visão geral

Este guia é a porta de entrada para times que constroem APIs com `@sebrae/api-base` e `@sebrae/api-base-cli`.

## O que a API-BASE entrega

- `@sebrae/api-base`: runtime HTTP, validação, erros, observabilidade e integrações compartilhadas.
- `@sebrae/api-base-cli`: bootstrap do projeto consumidor e geração de scaffolds.

## Fluxo recomendado no consumidor

1. Instale os pacotes.
2. Rode `pnpm api-cli init`.
3. Ajuste o `.env`.
4. Rode o comando de migration disponivel no consumidor, normalmente `pnpm api-cli db migrate` ou o script equivalente em `package.json`.
5. Suba a API com `pnpm api-cli dev` ou com o script `dev` do consumidor.
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
pnpm api-cli db migrate
pnpm api-cli dev
```

Se o consumidor usar scripts normalizados no `package.json`, os equivalentes mais comuns sao:

- `pnpm run db:migrate`
- `pnpm run dev`

Validação básica:

- `http://127.0.0.1:3000/health`
- `http://127.0.0.1:3000/ready`
- `http://127.0.0.1:3000/__routes`
- `http://127.0.0.1:3000/docs`

## Como navegar na documentação

- [Arquitetura](./architecture.md): estrutura do projeto consumidor e convenções.
- [API](./api.md): exports, comandos e variáveis mais usadas.
- [Exemplos](./examples.md): snippets para servidor, rotas, casos de uso e repositórios.
- [OpenAPI](./openapi.md): documentação de schema e Swagger.
- [Multipart](./multipart.md): upload, limites do plugin e documentação de arquivos no Swagger.

Guias complementares:

- [Instalação](./installing-packages.md)
- [CLI](./cli.md)
- [Variáveis de ambiente](./env.md)
- [OpenAPI](./openapi.md)
- [Multipart](./multipart.md)
- [Migrações](./migrations.md)
- [Workers](./workers.md)
- [Padrões](./standards.md)
- [Testes](./testing.md)
- [Implantação](./deploy.md)
- [Solução de problemas](./troubleshooting.md)

Observação rápida sobre multipart:

- uploads multipart funcionam por padrão no runtime;
- `schema.consumes` documenta a rota, mas nao ativa o parser;
- quando os campos do form precisam aparecer no Swagger, use `attachFieldsToBody` no bootstrap e `schema.body` na rota.
- para limites, streaming e upload no Swagger UI, consulte [Multipart](./multipart.md).

Conteúdo interno da base:

- [Projeto base](./project-base/overview.md)

## Navegacao recomendada para code agents

Quando a tarefa for implementar ou revisar codigo no consumidor, siga esta sequencia minima:

1. [Arquitetura](./architecture.md) para confirmar a estrutura esperada do projeto.
2. [API](./api.md) para checar os exports e comandos validos.
3. [Contratos](./contracts/README.md) para abrir apenas os contratos que afetam a mudanca.
4. [Exemplos](./examples.md) para copiar o padrao mais proximo, em vez de inferir APIs.
5. [Testes](./testing.md) para validar a mudanca com o minimo de cobertura operacional.

Atalhos uteis:

- nova rota HTTP: `architecture` -> `contracts/http-register-route` -> `contracts/http-schemas-zod` -> `examples`;
- rota privada/RBAC: adicionar `contracts/security-auth`;
- banco/repositorio: adicionar `contracts/data-db` e `contracts/data-migrations`;
- observabilidade/auditoria: adicionar `contracts/obs-logger`, `contracts/obs-audit` e `contracts/obs-tracing-metrics`.

Para decidir rapidamente qual trilha seguir antes dessa leitura minima, use [Playbooks para code agents](./agent-playbooks.md).

## Checklist operacional para code agents

Antes de editar no consumidor:

1. confirme a versao de `@sebrae/api-base` e `@sebrae/api-base-cli` no `package.json` ou lockfile;
2. confirme se o projeto possui `src/http/zod.ts`, `src/config/env.ts` e outros wrappers do scaffold atual;
3. confirme quais scripts existem de fato em `package.json`;
4. so entao escolha entre scaffold da CLI e edicao manual.

Fallbacks recomendados:

- se `pnpm api-cli ...` nao existir, procure script equivalente em `package.json`;
- se o scaffold atual nao estiver presente, trate o projeto como legado e reuse os padroes locais antes de impor o scaffold novo;
- se a documentacao e o codigo real divergirem, priorize o codigo real do consumidor e registre a divergencia.
