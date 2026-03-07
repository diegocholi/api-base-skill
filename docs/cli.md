# CLI

Este documento descreve os comandos do `@sebrae/api-base-cli` para projetos
consumidores de `@sebrae/api-base`.

## Instalação

```bash
pnpm add @sebrae/api-base
pnpm add -D @sebrae/api-base-cli
```

## Flags globais

Os comandos da CLI aceitam estas flags globais:

- `--cwd <path>`: define o diretório alvo.
- `--dry-run`: mostra o plano sem escrever arquivos.
- `--force`: permite sobrescrever arquivos gerenciados.
- `--verbose`: exibe logs detalhados.
- `--no-format`: desativa a formatação dos arquivos gerados.

## Comandos principais

- `pnpm api-cli init`: cria a estrutura base do consumidor e normaliza scripts.
- `pnpm api-cli init --with-example`: faz o `init` base e inclui domínio de exemplo.
- `pnpm api-cli generate module <name>`: gera módulo e grupo de rotas.
- `pnpm api-cli generate route <path> [name]`: gera uma rota pontual.
- `pnpm api-cli generate usecase <module> <name>`: gera caso de uso.
- `pnpm api-cli generate repo <module> <name>`: gera repositório com `RepoBase`.
- `pnpm api-cli generate job <queue> <job>`: gera artefatos de job BullMQ.
- `pnpm api-cli routes:list`: lista rotas resolvidas pela árvore de pastas.
- `pnpm api-cli routes:validate`: valida convenções da árvore de rotas.
- `pnpm api-cli routes:prepare-build`: prepara `dist/http/routes` para cold start.
- `pnpm api-cli dev`: inicia `tsx watch src/server.ts`.
- `pnpm api-cli migrate [id]`: aplica migrações de scaffold do consumidor.
- `pnpm api-cli env check`: valida ambiente e imprime resumo sanitizado.
- `pnpm api-cli health` / `pnpm api-cli ready`: smoke checks HTTP.
- `pnpm api-cli db create <name>`: cria migration SQL e atualiza `_journal`.
- `pnpm api-cli db enable-outbox`: cria migration opcional da outbox.
- `pnpm api-cli db generate` / `pnpm api-cli db migrate`: wrappers para banco.

## `init`

```bash
pnpm api-cli init [--name <name>] [--with-example] [--no-install]
```

O `init` cria a estrutura mínima do consumidor e atualiza `package.json` para o
formato esperado pela base.

Arquivos e diretórios centrais gerados:

- `tsconfig.json`
- `.env.example`
- `src/server.ts`
- `src/config/env.ts`
- `src/http/routes`
- `src/http/zod.ts`
- `src/http/fastify.d.ts`
- `src/http/fastify-context.d.ts`
- `src/http/route.types.ts`
- `src/infra/db/repo-base.ts`
- `src/shared/errors.ts`
- `src/shared/id.ts`
- `src/shared/result.ts`
- `src/shared/queue-jobs.ts`
- `src/shared/db/types.ts`
- `src/shared/db/rows.ts`
- `src/modules`

Além da estrutura, o `init` também:

- cria aliases `@/*` no `tsconfig.json`;
- adiciona wrappers locais para manter imports do consumidor em `@/`;
- normaliza scripts como `dev`, `build`, `start`, `routes:validate`,
  `env:check`, `db:create`, `db:generate` e `db:migrate`;
- gera rotas de sistema como `/health`, `/ready` e `/__routes`;
- prepara o build para usar `api-cli routes:prepare-build`, que poda `__routes`
  e gera `routes.manifest.json` para reduzir custo de cold start;
- tenta instalar dependências automaticamente, salvo quando usado `--no-install`.

Alguns wrappers gerados são "pass-through" para exports públicos da lib, como:

- `@/http/route.types`
- `@/shared/id`
- `@/shared/queue-jobs`
- `@/shared/db/types`
- `@/shared/db/rows`

Esses arquivos padronizam o uso de `@/` no consumidor e deixam espaço para
customização futura sem refatorar todos os imports. Se o projeto preferir,
também é possível importar diretamente de `@sebrae/api-base`.

### Quando usar cada modo

- `init`: para projeto consumidor novo, sem domínio de exemplo.
- `init --with-example`: para onboarding, POC e estudo do stack completo.

### `init --with-example`

```bash
pnpm api-cli init --with-example
```

Esse modo inclui a estrutura base e adiciona conteúdo de exemplo, como rotas,
módulo `users` e migrations de demonstração. É útil para treinamento e
exploração do framework, mas não deve ser o ponto de partida padrão de um
serviço real.

## `generate module`

```bash
pnpm api-cli generate module [name] [--crud] [--auth] [--method GET|POST|PUT|DELETE] [--with-id] [--route-base <path>] [--interactive]
```

Cria um módulo em `src/modules/<name>` e um grupo de rotas em
`src/http/routes/<name>`.

Comportamento esperado:

- sem `--crud`, gera uma rota base e um caso de uso compatível com `--method`;
- com `--crud`, gera rota base e rotas em `[id]` para operações CRUD;
- as rotas geradas já chamam o caso de uso e instanciam repositórios via
  `request.server.db`;
- `--auth` inclui proteção na rota gerada;
- `--method` define o verbo HTTP da rota base. Valores aceitos: `GET`, `POST`,
  `PUT` e `DELETE`;
- `--with-id` usa rota base com segmento `[id]`. Só faz sentido sem `--crud` e
  com método `GET`;
- `--route-base` sobrescreve o caminho base padrão;
- `--interactive` abre o wizard interativo da CLI.

Exemplo:

```bash
pnpm api-cli generate module billing --crud --auth
```

## `generate route`

```bash
pnpm api-cli generate route <path> [name] [--method GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD] [--auth] [--with-auth] [--with-zod] [--legacy-route-module] [--with-response-schema]
```

Cria uma rota em `src/http/routes` seguindo a convenção da árvore de pastas.

Formas de uso:

- caminho completo, como `"/users/[id]/posts"`;
- combinação de módulo + nome, quando fizer sentido para o time.

Exemplos:

```bash
pnpm api-cli generate route "/users/[id]" --method GET
pnpm api-cli generate route "/users/[id]" --method GET --auth
```

No `zsh`, use aspas ou escape quando o caminho tiver `[]`.

Opções relevantes:

- `--method`: verbo HTTP da rota. Valores aceitos: `GET`, `POST`, `PUT`,
  `PATCH`, `DELETE`, `OPTIONS` e `HEAD`;
- `--auth`: protege a rota com auth;
- `--with-auth`: alias para `--auth`;
- `--with-zod`: mantém explícito o modo declarativo com `defineZodRoute`;
- `--legacy-route-module`: gera no formato legado com `satisfies RouteModule`,
  sem `defineZodRoute`;
- `--with-response-schema`: inclui schema de resposta;
- padrão atual: a rota já é gerada com `defineZodRoute` e `options.schema`.

## `generate usecase`

```bash
pnpm api-cli generate usecase <module> <name>
```

Gera um caso de uso em `src/modules`. Este comando existe principalmente para
compatibilidade com a estrutura atual baseada em `src/modules`.

## `generate repo`

```bash
pnpm api-cli generate repo <module> <name>
```

Gera um repositório em `src/modules` usando `RepoBase`.

## `generate job`

```bash
pnpm api-cli generate job <queue> <job>
```

Gera schema, processor e registro de job BullMQ para o consumidor.

## Rotas

### `routes:list`

```bash
pnpm api-cli routes:list
```

Lista as rotas resolvidas pela árvore de pastas.

### `routes:validate`

```bash
pnpm api-cli routes:validate
```

Valida convenções de arquivos e pastas em `src/http/routes`.

### `routes:prepare-build`

```bash
pnpm api-cli routes:prepare-build
```

Prepara `dist/http/routes` para produção:

- remove artefatos de `__routes`;
- preserva rotas de sistema;
- gera `routes.manifest.json` para otimizar descoberta de rotas no runtime.

Esse comando normalmente já entra no `build` gerado pelo `init`.

## `dev`

```bash
pnpm api-cli dev
```

Inicia o servidor com `tsx watch src/server.ts`. No fluxo gerado pela CLI, esse
comando roda com `ENV_FALLBACK_ENABLED=true` por padrão, caso a variável ainda
não esteja definida no ambiente.

## `migrate`

```bash
pnpm api-cli migrate [id] [--list]
```

Aplica migrações de scaffold do consumidor sem alterar código de domínio.

Comportamentos úteis:

- sem `id`, executa todas as migrações conhecidas pela CLI;
- com `--list`, lista migrações disponíveis;
- com `--dry-run`, mostra o que seria alterado sem escrever.

Migrações atuais:

- `consumer-scripts-v2`: atualiza scripts do `package.json` para o padrão atual;
- `legacy-generated-scripts-v2`: remove scripts legados gerados por versões mais
  antigas do scaffold.

Exemplos:

```bash
pnpm api-cli migrate --list
pnpm api-cli migrate --dry-run
pnpm api-cli migrate consumer-scripts-v2 --dry-run
```

## Ambiente e saúde

### `env check`

```bash
pnpm api-cli env check
```

Valida o ambiente carregado e imprime um resumo sanitizado.

### `health` e `ready`

```bash
pnpm api-cli health --url http://127.0.0.1:3000
pnpm api-cli ready --url http://127.0.0.1:3000
```

Opções:

- `--url <url>`: URL base do serviço. O padrão é `http://localhost:3000`.
- `--timeout-ms <ms>`: timeout da requisição. O padrão é `5000`.

## Banco de dados

### `db create`

```bash
pnpm api-cli db create <name>
```

Cria migrations SQL em todos os dialetos suportados e atualiza `_journal`.

### `db enable-outbox`

```bash
pnpm api-cli db enable-outbox
```

Cria a migration opcional da tabela outbox para projetos que usam esse padrão.

### `db generate` e `db migrate`

```bash
pnpm api-cli db generate
pnpm api-cli db migrate
```

São wrappers para os scripts de banco já normalizados no consumidor.

## Convenções importantes

### Rotas por arquivo

```text
src/http/routes/
  users/get.route.ts
  users/[id]/get.route.ts
  users/[id]/posts/get.route.ts
```

Regras:

- cada pasta vira um segmento da URL;
- `[id]` vira `:id`;
- o verbo HTTP vem do nome do arquivo;
- no `zsh`, use aspas quando o caminho tiver `[]`.

### Padrão de rota gerada

O padrão atual do CLI usa `defineZodRoute`:

```ts
import { z } from 'zod';

import { defineZodRoute } from '@/http/zod';

export default defineZodRoute({
  options: {
    schema: {
      response: { 200: z.object({ ok: z.boolean() }) },
    },
  },
  handler: async () => ({ ok: true }),
});
```

`--legacy-route-module` existe apenas para compatibilidade com código antigo.

## Fluxo recomendado de projeto novo

1. `pnpm add @sebrae/api-base`
2. `pnpm add -D @sebrae/api-base-cli`
3. `pnpm api-cli init` ou `pnpm api-cli init --with-example`
4. `pnpm api-cli env check`
5. `pnpm api-cli routes:validate`
6. `pnpm run db:migrate:env`
7. `pnpm run dev`
8. `pnpm run build && pnpm run start:env`

## Relação com a documentação central

- [Visão geral](./overview.md)
- [Arquitetura](./architecture.md)
- [API](./api.md)
- [Exemplos](./examples.md)
