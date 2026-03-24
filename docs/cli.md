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

## Como um code agent deve usar a CLI

Use a CLI como primeira opcao para gerar estrutura repetitiva. Nao use a CLI cegamente.

Workflow recomendado:

1. confirme se o consumidor realmente tem `@sebrae/api-base-cli` instalado;
2. confirme a versao em `package.json` e avalie se o scaffold parece atual;
3. rode `--dry-run` quando a mudanca criar muitos arquivos ou tocar codigo gerenciado;
4. depois da geracao, revise imports, schemas, auth, naming e wiring;
5. finalize com `routes:validate`, testes e smoke checks relevantes.

Se a base ainda nao existir ou o bootstrap estiver incompleto, prefira `pnpm api-cli init` antes de criar artefatos isolados manualmente.

Prefira scaffold da CLI quando:

- for criar modulo, rota, repo, use case ou job novo;
- o consumidor seguir o layout padrao do `init`;
- a mudanca for majoritariamente estrutural.

Prefira edicao manual quando:

- a mudanca alterar fluxo de negocio ja customizado;
- o consumidor estiver em scaffold legado ou divergente;
- a tarefa envolver ajustes finos em auth, observabilidade, SQL ou integracoes.

Se o projeto estiver em estado misto, use a CLI apenas para artefatos estritamente estruturais e adapte o resultado ao wiring local.

## Comandos principais

- `pnpm api-cli init`: cria a estrutura base do consumidor e normaliza scripts.
- `pnpm api-cli init --with-example`: faz o `init` base e inclui domínio de exemplo.
- `pnpm api-cli generate module <name>`: gera módulo e grupo de rotas.
- `pnpm api-cli generate route <path> [name]`: gera uma rota pontual.
- `pnpm api-cli generate usecase <module> <name>`: gera caso de uso.
- `pnpm api-cli generate repo <module> <name>`: gera repositório com `RepoBase`.
- `pnpm api-cli generate job <module> <job> [--shared]`: gera descritor estável de job.
- `pnpm api-cli generate outbox-event <module> <event> [--shared]`: gera descritor estável de evento de outbox.
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

Observacao importante sobre outbox:

- a CLI agora possui `pnpm api-cli generate outbox-event <module> <event>` para criar descritores declarativos de outbox no scaffold atual;
- sem `--shared`, o generator cria o arquivo em `src/modules/<module>/application/events/<event>.event.ts`;
- com `--shared`, o generator cria o arquivo em `src/shared/outbox-events`;
- nao tente reaproveitar `generate job` para representar evento de dominio persistido via outbox.

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
- `src/http/fastify-context.d.ts`
- `src/http/types.ts`
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

No padrão atual, o scaffold já assume que o consumidor pode ter envs próprias:

- `src/config/env.ts` declara `AppEnv extends Env`;
- `src/server.ts` usa `createApp<AppEnv>({ env, routesDir })`;
- `src/http/zod.ts` cria um wrapper local com `createDefineZodRoute<AppEnv>()`;
- `src/http/types.ts` expõe aliases locais como `App`, `AppFastifyInstance` e `AppFastifyRequest`.

Isso reduz a necessidade de casts ou adapters por rota quando o projeto adiciona
variáveis próprias além das fornecidas pela `API-BASE`.

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

## `migrate`

```bash
pnpm api-cli migrate [id]
```

Use este comando quando o consumidor estiver parcialmente legado, mas ainda
próximo do scaffold oficial.

Casos importantes:

- normalizar scripts antigos do `package.json`;
- remover artefatos legados em `scripts/`;
- garantir os entrypoints locais `src/infra/queue/worker.ts` e
  `src/infra/outbox/worker.ts` para consumidores antigos.

Para filas, este passo agora é especialmente relevante antes de
`pnpm api-cli generate job`, porque o gerador espera o worker local no formato
atual.

Quando o consumidor tiver scripts antigos como:

- `pnpm exec tsx watch ./node_modules/@sebrae/api-base/dist/infra/queue/worker.js`
- `node ./node_modules/@sebrae/api-base/dist/infra/queue/worker.js`

prefira rodar `pnpm api-cli migrate` antes de continuar.

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

Pos-geracao recomendada:

1. revise o schema da rota e a resposta `2xx`;
2. confirme se o caso de uso e o repo gerados combinam com o dominio real;
3. ajuste auth declarativa conforme [Autenticacao e guards](./contracts/security-auth.md);
4. rode `pnpm api-cli routes:validate`.

## `generate route`

```bash
pnpm api-cli generate route <path> [name] [--method GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD] [--auth] [--with-auth] [--with-zod] [--legacy-route-module] [--with-response-schema]
```

Cria uma rota em `src/http/routes` seguindo a convenção da árvore de pastas.

## `generate outbox-event`

```bash
pnpm api-cli generate outbox-event <module> <event> [--shared]
```

Gera um descritor estável com `defineOutboxEvent(...)` para o fluxo declarativo
de publish via outbox.

Sem `--shared`, o módulo informado precisa existir previamente em `src/modules`.
Fluxo recomendado no scaffold atual:

```bash
pnpm api-cli generate module orders
pnpm api-cli generate outbox-event orders created
```

Comportamento padrão:

- gera o arquivo em `src/modules/<module>/application/events/<event>.event.ts`;
- cria ou atualiza `src/modules/<module>/application/events/index.ts`;
- deriva `aggregate` de `<module>`;
- deriva `type` como `<module>.<event>`.

Exemplo:

```bash
pnpm api-cli generate outbox-event orders created
```

Para eventos transversais, use `--shared`:

```bash
pnpm api-cli generate outbox-event audit logged --shared
```

Nesse modo, o arquivo vai para `src/shared/outbox-events`, mas o contrato do
evento continua derivado dos argumentos.

O generator cria apenas o descritor e o schema inicial. Ele nao:

- registra processors;
- cria jobs consumidores;
- altera o worker de outbox;
- substitui o caminho dinamico com `enqueueEvent(...)`.

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

Pos-geracao recomendada:

1. complete `querystring`, `params`, `body` e `response`;
2. se a rota for publica, declare `config.auth.public = true`;
3. se a rota for privada com RBAC estatico, prefira `config.roles` e `config.permissions`;
4. valide o arquivo com `pnpm api-cli routes:validate`.

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
pnpm api-cli generate job <module> <job> [--shared]
```

Sem `--shared`, o módulo informado precisa existir previamente em `src/modules`.
Fluxo recomendado no scaffold atual:

```bash
pnpm api-cli generate module orders
pnpm api-cli generate job orders created
```

Gera um descritor estável com `defineJob(...)` para o fluxo declarativo de
publish via fila.

Comportamento padrão:

- gera o arquivo em `src/modules/<module>/application/jobs/<job>.job.ts`;
- cria ou atualiza `src/modules/<module>/application/jobs/index.ts`;
- deriva `queueName` de `<module>`;
- deriva `jobName` como `<module>.<job>`.

Exemplo:

```bash
pnpm api-cli generate job orders created
```

Para jobs transversais, use `--shared`:

```bash
pnpm api-cli generate job audit reprocess --shared
```

Nesse modo, o arquivo vai para `src/shared/jobs`, mas o contrato do job continua
derivado dos argumentos.

O generator cria apenas o descritor e o schema inicial. Ele nao:

- cria processor;
- altera `src/infra/queue/worker.ts`;
- registra wiring de worker automaticamente.

O fluxo recomendado continua sendo:

- usar `request.server.queue.addJob(jobDefinition, payload, options)` para publish;
- registrar processors explicitamente no worker local com `startQueueWorker({ jobs: [...] })`.

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

- `consumer-scaffold-v3`: atualiza wrappers e entrypoints gerados pelo scaffold
  para o padrão atual da `API-BASE`;
- `consumer-scripts-v2`: atualiza scripts do `package.json` para o padrão atual;
- `legacy-generated-scripts-v2`: remove scripts legados gerados por versões mais
  antigas do scaffold.

Exemplos:

```bash
pnpm api-cli migrate --list
pnpm api-cli migrate --dry-run
pnpm api-cli migrate consumer-scripts-v2 --dry-run
```

Quando usar esse comando como code agent:

- quando o consumidor tiver wrappers ou scripts claramente legados;
- antes de aplicar mudancas grandes que dependam do scaffold atual;
- sempre preferindo `--dry-run` na primeira execucao.

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

Observacao para code agents:

- nem todo consumidor tera os mesmos scripts de banco no `package.json`;
- quando houver divergencia, use primeiro o comando real disponivel no projeto;
- nao assuma a existencia de `db:migrate:env` sem verificar.

## Convenções importantes

### Rotas por arquivo

```text
src/http/routes/
  users/get.route.ts
  users/[id]/get.route.ts
  users/[id]/posts/get.route.ts
```

## Sequencias prontas para tarefas comuns

### Nova rota simples

1. `pnpm api-cli generate route "/users/[id]" --method GET --with-response-schema`
2. completar schema e handler
3. `pnpm api-cli routes:validate`

### Novo modulo CRUD

1. `pnpm api-cli generate module billing --crud`
2. ajustar repositorio, schema e caso de uso
3. revisar auth e erros
4. `pnpm api-cli routes:validate`

### Projeto com scaffold legado

1. `pnpm api-cli migrate --list`
2. `pnpm api-cli migrate --dry-run`
3. aplicar migration especifica se fizer sentido
4. so depois gerar novos arquivos ou editar wrappers

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
6. rode `pnpm api-cli db migrate` ou o script equivalente existente no `package.json`
7. rode `pnpm api-cli dev` ou o script `dev` real do consumidor
8. valide `build` e `start` apenas com scripts que existirem no projeto

## Relação com a documentação central

- [Visão geral](./overview.md)
- [Arquitetura](./architecture.md)
- [API](./api.md)
- [Exemplos](./examples.md)
