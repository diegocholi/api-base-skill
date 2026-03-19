---
name: api-base-skill
description: Use esta skill para criar, manter, depurar e explicar projetos que usam o framework api-base.
---

# Quando usar esta skill

Use esta skill quando o repositorio:

- contiver `api-base.on`;
- tiver dependencia `@sebrae/api-base` ou `@sebrae/api-base-cli`;
- possuir pastas `src/http/routes` e `src/modules`;
- mencionar `api-base` em README, docs ou codigo.

Tambem use quando o usuario pedir para:

- criar modulos, handlers, pipelines ou adapters do framework;
- explicar a arquitetura do framework;
- migrar codigo legado para o framework;
- diagnosticar erros comuns do runtime do framework.

# O que voce deve saber

A api-base e baseada em:

- rotas declaradas por arquivos em `src/http/routes`;
- modulos declarativos em `src/modules`;
- ciclo de vida `bootstrap -> init -> run -> shutdown`;
- adapters para integracao externa;
- CLI para criar a estrutura base do consumidor com `pnpm api-cli init` e manter codigo gerado.

# Regras de implementacao

- Sempre preserve a estrutura oficial do framework.
- Quando a tarefa for montar a base do consumidor ou inicializar um projeto aderente ao scaffold atual, considere `pnpm api-cli init` antes de sugerir criacao manual de pastas e arquivos.
- Prefira helpers nativos antes de criar abstracoes novas.
- Nao invente APIs que nao existam na documentacao.
- Ao gerar codigo, siga os padroes descritos em `docs/api.md`, `docs/contracts/README.md` e `docs/examples.md`.
- Ao alterar codigo existente, mantenha compatibilidade com a versao atual do framework usada no consumidor.
- Ao criar novos modulos, valide naming, registro no container e hooks de lifecycle.
- Ao alterar esta propria skill, siga `docs/maintaining-this-skill.md` e rode os checks locais antes de concluir.
- Priorize o codigo real do consumidor quando ele divergir da documentacao generica.
- Nao abra `docs/project-base/*` a menos que a tarefa seja manter a base, o monorepo ou a paridade entre scaffold e runtime.
- Em review, priorize bugs, regressao comportamental, risco de compatibilidade e testes faltantes antes de sugerir ajustes esteticos.

# Como escolher a trilha da tarefa

Antes de abrir muitos arquivos, classifique a tarefa em uma destas trilhas:

- criar codigo novo no scaffold atual;
- alterar codigo existente em consumidor parcialmente legado;
- depurar runtime, config, auth, OpenAPI, banco, cache ou filas;
- explicar arquitetura, contratos ou fluxo de uso do framework;
- revisar codigo existente do consumidor.

Se a tarefa misturar mais de uma trilha, comece pela que reduz risco estrutural:

1. diagnostico de legado ou scaffold atual;
2. contrato tecnico relevante;
3. implementacao ou revisao pontual.

# Hierarquia de fontes

Use esta ordem quando houver sobreposicao entre os guias:

1. `SKILL.md` define a trilha e o comportamento esperado do agente.
2. `docs/agent-playbooks.md` escolhe o playbook operacional por intencao ou sintoma.
3. `docs/contracts/*` e os guias tecnicos especializados definem o contrato recomendado.
4. o codigo real do consumidor prevalece quando houver divergencia operacional, estrutural ou de scripts.

Se dois docs parecerem conflitar:

- preserve a trilha do `SKILL.md`;
- preserve o contrato tecnico do doc especializado;
- adapte a execucao ao codigo real do consumidor;
- registre a divergencia em vez de forcar normalizacao fora do escopo.

# Sinais de scaffold atual vs legado

Use estes sinais antes de decidir entre scaffold e edicao manual.

## Sinais de scaffold atual

- existe `src/server.ts` com `createApp<AppEnv>({ env, routesDir })` ou variacao equivalente;
- existem wrappers como `src/http/zod.ts`, `src/config/env.ts`, `src/http/types.ts` e `src/infra/db/repo-base.ts`;
- o `package.json` possui scripts como `dev`, `build`, `routes:validate`, `env:check` e `db:migrate`;
- a arvore principal segue `src/http/routes`, `src/modules`, `src/infra` e `src/shared`.

## Sinais de projeto legado ou divergente

- imports diretos da base convivem com wrappers locais inconsistentes;
- nao existe `src/http/zod.ts` ou o bootstrap usa padrao anterior ao scaffold atual;
- scripts de `routes:*`, `env:*` e `db:*` estao ausentes ou com nomes totalmente locais;
- handlers, auth ou wiring foram fortemente customizados fora dos padroes descritos em `docs/architecture.md`.

## Decisao padrao

- repositorio vazio, bootstrap ausente ou estrutura base incompleta: prefira `pnpm api-cli init` para criar o esqueleto inicial antes de implementar codigo de dominio;
- sinais majoritarios de scaffold atual: prefira CLI para gerar estrutura repetitiva;
- sinais majoritarios de legado: preserve convencoes locais e prefira edicao manual;
- sinal misto: gere apenas artefato isolado com dry-run mental ou leitura da CLI, mas adapte manualmente o codigo final ao padrao do consumidor.

# Playbooks por cenário

## Criar codigo novo no scaffold atual

Antes de editar:

1. Descubra a versao usada de `@sebrae/api-base` e `@sebrae/api-base-cli` em `package.json`, lockfile ou ambos.
2. Confirme se o projeto foi gerado por `init` atual, se precisa rodar `pnpm api-cli init` para criar a base, ou se ainda possui scaffold legado.
3. Localize wrappers locais como `src/http/zod.ts`, `src/config/env.ts` e `src/infra/db/repo-base.ts`.
4. Verifique se o consumidor usa `internal`, `keycloak`, cache, filas, multipart ou migrations.
5. Se a base ainda nao existir, prefira `pnpm api-cli init` antes de gerar artefatos isolados.
6. Se o scaffold estiver atual, prefira a CLI para modulo, rota, repo, use case ou job novo.

Ao criar ou corrigir jobs no scaffold atual:

- abra `docs/cli.md`, `docs/contracts/data-queue.md` e `docs/workers.md` quando a tarefa envolver autoria, publicacao ou operacao de jobs;
- quando o scaffold estiver atual, trate `pnpm api-cli generate job <module> <job>` como o caminho padrao para criar o descritor inicial do job;
- sem `--shared`, o generator cria o descritor em `src/modules/<module>/application/jobs/<job>.job.ts` e deriva `queueName` de `<module>` e `jobName` como `<module>.<job>`;
- para jobs transversais, use `pnpm api-cli generate job <module> <job> --shared`, que gera em `src/shared/jobs` mas preserva `<module>` como namespace logico do contrato;
- o generator de job cria apenas descritor e schema inicial; ele nao cria processor nem altera `src/infra/queue/worker.ts`;
- o caminho recomendado de publish e worker e `queue.addJob(jobDefinition, payload, options)` e `startQueueWorker({ jobs: [...] })`;
- o callback `register: async ({ queueService, logger }) => { ... }` continua disponivel, mas deve ser tratado como escape hatch ou transicao para legado;
- para tipar processor e logger do job, prefira `import type { ApiBaseJob, ApiBaseJobProcessorContext } from '@sebrae/api-base'`;
- nao introduza imports diretos de `pino` ou `bullmq` no codigo gerado do consumidor quando a API Base ja expuser o contrato publico equivalente.

Ao criar ou corrigir fluxo de outbox no scaffold atual:

- trate `enqueueEvent(...)` e `withOutboxTransaction(...)` como primitives de primeira classe e preserve o caminho dinamico existente;
- abra `docs/cli.md`, `docs/outbox.md` e `docs/workers.md` quando a tarefa envolver autoria, publicacao ou operacao de outbox;
- para eventos estaveis e conhecidos, prefira `defineOutboxEvent(...)` + `enqueueDefinedEvent(...)` ou `enqueueOutboxEvent(...)` para reduzir boilerplate e validar payload com schema;
- quando o scaffold estiver atual, trate `pnpm api-cli generate outbox-event <module> <event>` como o caminho padrao para criar o descritor inicial do evento;
- sem `--shared`, o generator cria o descritor em `src/modules/<module>/application/events/<event>.event.ts` e deriva `aggregate` de `<module>` e `type` como `<module>.<event>`;
- para eventos transversais, use `pnpm api-cli generate outbox-event <module> <event> --shared`, que gera em `src/shared/outbox-events` mas preserva `<module>` como namespace logico do contrato publicado;
- nao trate `defineOutboxEvent(...)` como equivalente a `defineJob(...)`: outbox persiste evento de dominio, job continua sendo definido separadamente quando houver consumidor de fila;
- o worker de outbox continua simples e dinamico, publicando `aggregate`, `type` e `payload`; nao tente registrar processors por evento no outbox worker;
- o generator de outbox cria apenas descritor e schema inicial; ele nao cria worker, job consumidor nem wiring adicional de fila;
- quando a tarefa envolver outbox e jobs ao mesmo tempo, confirme se o evento persistido precisa de um job consumidor separado e mantenha as duas modelagens distintas.

Abra nesta ordem:

1. `docs/overview.md`
2. `docs/api.md`
3. `docs/contracts/README.md`
4. apenas os contratos relevantes para a tarefa
5. `docs/examples.md`
6. `docs/testing.md`

## Alterar consumidor legado ou parcialmente divergente

Antes de editar:

1. Compare a estrutura real com `docs/architecture.md`, mas nao tente normalizar tudo.
2. Confirme versao, scripts reais e wrappers presentes.
3. Identifique o padrao local dominante para rotas, env, auth e repositórios.
4. Preserve o wiring existente e adapte so a parte necessaria para a tarefa.

Abra nesta ordem:

1. `docs/overview.md`
2. `docs/architecture.md`
3. `docs/api.md`
4. o contrato pontual da mudanca
5. `docs/troubleshooting.md` se houver incerteza operacional

## Depurar runtime, config, auth, OpenAPI, banco, cache ou filas

Antes de sugerir qualquer comando:

1. confirme sintomas, arquivo de entrada e scripts reais no `package.json`;
2. identifique se a falha e de bootstrap, rotas, auth, env, banco, cache, fila ou OpenAPI;
3. rode o comando mais barato que ja existir no consumidor;
4. se documentacao e codigo real divergirem, siga o codigo real e registre a divergencia.

Abra nesta ordem:

1. `docs/agent-playbooks.md`
2. `docs/troubleshooting.md`
3. `docs/api.md`
4. o contrato tecnico correspondente ao sintoma

Atalho importante para timeout:

- se o sintoma mencionar `socket hang up`, timeout perto de 10 segundos ou request longa encerrada pela API, revise primeiro `docs/troubleshooting.md` e `docs/env.md` para diferenciar timeout do servidor HTTP (`HTTP_CONNECTION_TIMEOUT_MS`, `HTTP_REQUEST_TIMEOUT_MS`) de timeout do cliente de saida (`createHttpClient({ timeoutMs })`);
- nao assuma que o problema e sempre no servidor: confirme se a falha acontece na request que entra no consumidor ou na chamada que o consumidor faz para uma API externa.

## Explicar arquitetura ou contratos

Antes de responder:

1. confirme se o usuario quer visao geral, fluxo de request, bootstrap, auth, dados ou operacao;
2. abra apenas os docs necessarios para esse recorte;
3. use exemplos da pasta `examples/` apenas para ilustrar o contrato, nao como fonte canonica.

Abra nesta ordem:

1. `docs/overview.md`
2. `docs/architecture.md`
2. `docs/api.md`
3. `docs/contracts/README.md`
4. apenas os contratos relevantes para o assunto
5. `docs/examples.md`

## Revisar codigo existente do consumidor

Antes de revisar:

1. descubra a versao e o nivel de aderencia ao scaffold atual;
2. identifique o contrato principal tocado pela mudanca;
3. procure bugs, regressao de comportamento, risco de compatibilidade e falta de validacao antes de sugerir refactor estetico;
4. use `docs/testing.md` para listar validacoes faltantes ou riscos.

Abra nesta ordem:

1. `docs/overview.md`
2. `docs/api.md`
3. o contrato central da mudanca
4. `docs/examples.md` apenas para comparar padrao recomendado
5. `docs/testing.md`

# Roteamento rapido de leitura

- auth, RBAC, ownership ou social auth: `docs/overview.md` -> `docs/api.md` -> `docs/contracts/security-auth.md` -> `docs/examples.md`
- plugin custom, decorators locais ou bootstrap com `app.register(...)`: adicionar `docs/plugins.md`
- fila, jobs, worker local ou outbox worker: `docs/api.md` -> `docs/contracts/data-queue.md` -> `docs/workers.md` -> `docs/outbox.md` -> `docs/examples.md`
- geracao ou revisao de descritor estavel de outbox: `docs/cli.md` -> `docs/outbox.md` -> `docs/workers.md` -> `docs/examples.md`
- rotas HTTP novas ou ausentes: `docs/architecture.md` -> `docs/contracts/http-register-route.md` -> `docs/contracts/http-schemas-zod.md` -> `docs/examples.md`
- banco, repo, migration ou escrita transacional com outbox: `docs/overview.md` -> `docs/api.md` -> `docs/contracts/data-db.md` -> `docs/outbox.md` -> `docs/examples.md`
- erros HTTP, requestId, observabilidade ou auditoria: `docs/contracts/http-error-handler.md`, `docs/contracts/http-request-id.md`, `docs/contracts/obs-logger.md`, `docs/contracts/obs-audit.md`
- diagnostico operacional: `docs/agent-playbooks.md` -> `docs/troubleshooting.md`
- `socket hang up`, timeout perto de 10 segundos ou duvida sobre limites HTTP: `docs/agent-playbooks.md` -> `docs/troubleshooting.md` -> `docs/env.md`

# Quando ignorar a documentacao generica e priorizar o consumidor

- o projeto usa wrappers ou adapters locais com contrato diferente do scaffold atual;
- a CLI sugere um formato que nao combina com a estrutura real do repositorio;
- auth, env, db ou queue foram centralizados em plugins locais nao descritos na skill;
- os scripts documentados nao existem no `package.json`;
- o codigo em producao depende de comportamento legado ainda suportado.

Ao lidar com consumidor legado de filas/workers:

- verifique se existem `src/infra/queue/worker.ts` e `src/infra/outbox/worker.ts`;
- se o consumidor ainda usa scripts apontando para `node_modules/@sebrae/api-base/dist/infra/*`, prefira `pnpm api-cli migrate` antes de gerar jobs novos;
- depois que o worker estiver no formato atual, prefira a CLI para montar o descritor inicial do job antes de editar processor ou wiring manualmente;
- se o worker ja estiver em `jobs: [...]`, adicione apenas registrations declarativas no bloco gerenciado em vez de recriar dispatch manual por `job.name`;
- ao revisar imports de jobs, preserve o contrato publico da base: `ApiBaseJob` e `ApiBaseJobProcessorContext` de `@sebrae/api-base`, com payload local vindo do barrel do modulo ou de `@/shared/jobs` via `import type` quando aplicavel.

Nesses casos:

- preserve imports, naming e wiring locais;
- use a documentacao apenas para validar API publica e contratos estaveis;
- evite refactor estrutural fora do escopo pedido pelo usuario.

# Decisoes de implementacao

Prefira scaffold da CLI quando:

- a tarefa for criar modulo, rota, use case, repo ou job novo;
- a tarefa for criar um descritor estavel de evento de outbox em scaffold atual;
- o consumidor seguir a estrutura oficial do `init`;
- a geracao reduzir trabalho mecanico sem quebrar customizacoes locais.

Prefira edicao manual quando:

- a tarefa alterar comportamento de codigo ja customizado;
- o consumidor estiver parcialmente legado;
- a mudanca envolver regras de negocio, auth, observabilidade ou integracoes especificas.

Para auth e autorizacao contextual:

- prefira `config.roles` e `config.permissions` quando a regra for estatica por rota;
- use `config.anyPermissions = true` quando a rota aceitar qualquer uma das permissoes declaradas;
- prefira `config.ownership` quando a regra for "owner com bypass por role e/ou permissao" e couber no contrato declarativo da rota;
- assuma o padrao declarativo como: `roles` em `OR`, `permissions` em `AND`, `anyPermissions` em `OR` e `ownership.bypassPermissions` em `OR`;
- considere `resolveRoles` e `resolvePermissions` como pontos de extensao opcionais do consumidor; sem eles, a validacao usa `request.user.roles` e `request.user.scopes`;
- para ownership e policies de owner, assuma `request.user.sub` como identificador canonico do usuario autenticado;
- quando o consumidor precisar desses decorators dinamicos, prefira os helpers publicos `createRolesResolver` e `createPermissionsResolver`;
- use `requirePolicy(...)` apenas quando a regra depender de ownership ou escopo dinamico mais rico do que `config.ownership` suporta;
- prefira os helpers publicos `createOwnerOnlyPolicy`, `createRoleOrOwnerPolicy` e `createScopeOrOwnerPolicy` em vez de duplicar checks imperativos no handler.

# Validar depois da mudanca

No consumidor, prefira nesta ordem:

1. `pnpm api-cli routes:validate` para rotas;
2. `pnpm api-cli env check` para ambiente;
3. `pnpm api-cli health --url ...` e `pnpm api-cli ready --url ...` se a app estiver rodando;
4. `pnpm run test` ou o subset relevante;
5. os checks minimos descritos em `docs/testing.md`.

Se um script nao existir, nao invente outro. Procure primeiro em `package.json` e use o comando real disponivel.

# Restricoes

- Nao usar APIs deprecated, salvo quando o usuario pedir compatibilidade legada.
- Nao misturar padroes de versoes diferentes.
- Nao mover arquivos sem necessidade.
- Nao assumir que scripts do consumidor existem sem confirmar em `package.json`.
- Nao tratar exemplos desta skill como substituto do codigo real do consumidor.

# Referencias locais

- `docs/overview.md`
- `docs/architecture.md`
- `docs/api.md`
- `docs/agent-playbooks.md`
- `docs/contracts/README.md`
- `docs/contracts/security-auth.md`
- `docs/plugins.md`
- `docs/examples.md`
- `docs/testing.md`

# Comandos uteis

Estes comandos sao para o consumidor, nao para este repositorio da skill:

```bash
pnpm api-cli routes:validate
pnpm api-cli env check
pnpm api-cli health --url http://127.0.0.1:3000
pnpm api-cli ready --url http://127.0.0.1:3000
```

Se o consumidor nao tiver `api-cli` instalado ou scripts normalizados, valide primeiro o `package.json` antes de sugerir comandos.
