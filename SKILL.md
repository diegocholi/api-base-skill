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
- Prefira helpers nativos antes de criar abstracoes novas.
- Nao invente APIs que nao existam na documentacao.
- Ao gerar codigo, siga os padroes descritos em `docs/api.md`, `docs/contracts/README.md` e `docs/examples.md`.
- Ao alterar codigo existente, mantenha compatibilidade com a versao atual do framework usada no consumidor.
- Ao criar novos modulos, valide naming, registro no container e hooks de lifecycle.
- Ao alterar esta propria skill, siga `docs/maintaining-this-skill.md` e rode os checks locais antes de concluir.
- Priorize o codigo real do consumidor quando ele divergir da documentacao generica.
- Nao abra `docs/project-base/*` a menos que a tarefa seja manter a base, o monorepo ou a paridade entre scaffold e runtime.
- Em review, priorize bugs, regressao comportamental, risco de compatibilidade e testes faltantes antes de sugerir ajustes esteticos.
- Em tarefas de auth JWT no consumidor, use `docs/contracts/security-auth.md` como fonte canonica para `request.user`, claims normalizadas e leitura de claims arbitrarias do token.

# Como escolher a trilha da tarefa

Classifique a tarefa em uma destas trilhas:

- criar codigo novo no scaffold atual;
- alterar codigo existente em consumidor parcialmente legado;
- depurar runtime, config, auth, OpenAPI, banco, cache ou filas;
- explicar arquitetura, contratos ou fluxo de uso do framework;
- revisar codigo existente do consumidor.

Se a tarefa misturar mais de uma trilha, comece pela que reduz risco estrutural:

1. diagnostico de legado ou scaffold atual;
2. contrato tecnico relevante;
3. implementacao ou revisao pontual.

Use `docs/agent-playbooks.md` como guia principal para escolher a trilha e a sequencia de leitura.

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

Nao detalhe essa decisao na raiz. Use `docs/agent-playbooks.md` como fonte canonica para reconhecer scaffold atual, projeto legado ou estado misto, e use `docs/cli.md` para decidir entre CLI e edicao manual.

# Playbooks por cenário

Nao replique playbooks completos na raiz. Use `docs/agent-playbooks.md` como destino canonico para:

- criacao no scaffold atual;
- consumidor legado ou parcialmente divergente;
- troubleshooting de runtime;
- explicacao de arquitetura ou contratos;
- review de codigo existente.

# Roteamento rapido de leitura

- criacao de codigo novo, scaffold atual ou duvida entre CLI e edicao manual: `docs/agent-playbooks.md` -> `docs/cli.md` -> contrato tecnico do assunto
- consumidor legado ou parcialmente divergente: `docs/agent-playbooks.md` -> `docs/architecture.md` -> `docs/api.md`
- auth, RBAC, ownership ou social auth: `docs/agent-playbooks.md` -> `docs/contracts/security-auth.md`
- integracao HTTP com servicos externos e timeouts: `docs/agent-playbooks.md` -> `docs/troubleshooting.md` -> `docs/env.md` -> `docs/contracts/http-request-id.md`
- jobs, workers e filas: `docs/agent-playbooks.md` -> `docs/cli.md` -> `docs/contracts/data-queue.md` -> `docs/workers.md`
- jobs agendados/reagendaveis, debounce por entidade ou timeout de job atrasado: `docs/contracts/data-queue.md` -> `docs/workers.md`
- outbox e escrita transacional: `docs/agent-playbooks.md` -> `docs/outbox.md` -> `docs/workers.md` -> `docs/contracts/data-db.md`
- rotas HTTP e schemas: `docs/agent-playbooks.md` -> `docs/contracts/http-register-route.md` -> `docs/contracts/http-schemas-zod.md` -> `docs/examples.md`
- erros HTTP, requestId, observabilidade ou auditoria: `docs/agent-playbooks.md` -> contratos especializados correspondentes
- validacao e testes depois da mudanca: `docs/testing.md`

# Quando ignorar a documentacao generica e priorizar o consumidor

- o projeto usa wrappers ou adapters locais com contrato diferente do scaffold atual;
- a CLI sugere um formato que nao combina com a estrutura real do repositorio;
- auth, env, db ou queue foram centralizados em plugins locais nao descritos na skill;
- os scripts documentados nao existem no `package.json`;
- o codigo em producao depende de comportamento legado ainda suportado.

Nesses casos:

- preserve imports, naming e wiring locais;
- use a documentacao apenas para validar API publica e contratos estaveis;
- evite refactor estrutural fora do escopo pedido pelo usuario.

# Referencias locais

- `docs/agent-playbooks.md`
- `docs/contracts/README.md`
- `docs/overview.md`
- `docs/api.md`
- `docs/examples.md`
- `docs/testing.md`
