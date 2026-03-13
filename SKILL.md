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
- CLI para criacao e manutencao de codigo.

# Regras de implementacao

- Sempre preserve a estrutura oficial do framework.
- Prefira helpers nativos antes de criar abstracoes novas.
- Nao invente APIs que nao existam na documentacao.
- Ao gerar codigo, siga os padroes descritos em `docs/api.md`, `docs/contracts/README.md` e `docs/examples.md`.
- Ao alterar codigo existente, mantenha compatibilidade com a versao atual do framework usada no consumidor.
- Ao criar novos modulos, valide naming, registro no container e hooks de lifecycle.

# Workflow para code agents

## 1. Descobrir contexto do consumidor

Antes de editar:

1. Descubra a versao usada de `@sebrae/api-base` e `@sebrae/api-base-cli` em `package.json`, lockfile ou ambos.
2. Confirme se o projeto foi gerado por `init` atual ou se ainda possui scaffold legado.
3. Localize wrappers locais como `src/http/zod.ts`, `src/config/env.ts` e `src/infra/db/repo-base.ts`.
4. Verifique se o consumidor usa `internal`, `keycloak`, cache, filas, multipart ou migrations.

## 2. Ler o minimo necessario

Abra nesta ordem:

1. `docs/overview.md`
2. `docs/api.md`
3. `docs/contracts/README.md`
4. apenas os contratos relevantes para a tarefa
5. `docs/examples.md`
6. `docs/testing.md`

Se a tarefa envolver auth, RBAC, ownership ou escopo por recurso, abra tambem:

7. `docs/contracts/security-auth.md`

## 3. Escolher entre scaffold e edicao manual

Prefira scaffold da CLI quando:

- a tarefa for criar modulo, rota, use case, repo ou job novo;
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
- quando o consumidor precisar desses decorators dinamicos, prefira os helpers publicos `createRolesResolver` e `createPermissionsResolver`;
- use `requirePolicy(...)` apenas quando a regra depender de ownership ou escopo dinamico mais rico do que `config.ownership` suporta;
- prefira os helpers publicos `createOwnerOnlyPolicy`, `createRoleOrOwnerPolicy` e `createScopeOrOwnerPolicy` em vez de duplicar checks imperativos no handler.

## 4. Validar depois da mudanca

No consumidor, prefira nesta ordem:

1. `pnpm api-cli routes:validate` para rotas;
2. `pnpm api-cli env check` para ambiente;
3. `pnpm api-cli health --url ...` e `pnpm api-cli ready --url ...` se a app estiver rodando;
4. `pnpm run test` ou o subset relevante;
5. os checks minimos descritos em `docs/testing.md`.

Se um script nao existir, nao invente outro. Procure primeiro em `package.json` e use o comando real disponivel.

# Fluxo recomendado

1. Identifique a versao do framework no projeto.
2. Leia `docs/overview.md` e `docs/api.md` antes de mudancas grandes.
3. Abra o contrato especifico da tarefa em `docs/contracts/`.
4. Verifique exemplos reais em `examples/`.
5. Gere ou edite codigo conforme os padroes oficiais.
6. Valide imports, registro no container, ciclo de vida e testes minimos.

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
- `docs/contracts/README.md`
- `docs/contracts/security-auth.md`
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
