# Arquitetura do consumidor

Este documento descreve a estrutura esperada para um projeto consumidor gerado com `pnpm api-cli init`.

## Estrutura padrão

```text
src/
  config/
  http/
    routes/
  infra/
  modules/
  shared/
  server.ts
```

Papéis principais:

- `src/server.ts`: sobe a aplicação com `createApp`.
- `src/http/routes`: rotas por arquivo.
- `src/modules`: domínio, casos de uso, schemas e repositórios do consumidor.
- `src/infra`: adaptações locais de banco, cache, filas e integrações.
- `src/shared`: utilitários compartilhados do serviço.

## Imports e fronteiras

Use dois padrões de import:

- `@/` para código do próprio consumidor.
- `@sebrae/api-base` para runtime e contratos publicados pela base.

Exemplo:

```ts
import { createApp, env, ValidationError } from '@sebrae/api-base';
import { UsersRepository } from '@/modules/users/infra/repos/users.repo';
```

## Boot do servidor

O `init` gera `src/server.ts` com este fluxo:

1. resolve a pasta de rotas (`src/http/routes` em dev e `dist/http/routes` no build);
2. cria a aplicação com `createApp({ env, routesDir })`;
3. inicializa tracing apenas quando `OTEL_ENABLED=true`;
4. registra shutdown gracioso.

## Rotas por arquivo

As rotas ficam em `src/http/routes` e seguem a árvore de diretórios:

```text
src/http/routes/
  users/get.route.ts
  users/post.route.ts
  users/[id]/get.route.ts
```

Regras:

- cada pasta vira um segmento da URL;
- `[id]` vira `:id`;
- o verbo vem do nome do arquivo: `get.route.ts`, `post.route.ts`, `put.route.ts`, `delete.route.ts`;
- a maior parte das rotas deve usar `defineZodRoute`.

## Módulos e casos de uso

A organização recomendada no consumidor é:

```text
src/modules/<modulo>/
  application/usecases/
  infra/repos/
  schemas/
```

Diretrizes:

- casos de uso recebem dependências explicitamente;
- validação fica em schemas Zod do módulo;
- falhas esperadas retornam `Result`, não `throw`;
- regras compartilhadas podem ficar em `application/rules`.

## Repositórios

`RepoBase` cobre o básico para SQL-first, mas o consumidor continua responsável pelo contrato do próprio repositório.

Prática recomendada:

- encapsular queries em classes locais;
- expor métodos de negócio, não utilitários genéricos;
- manter mapeamento entre linha de banco e DTO no módulo.

## Build e execução

Scripts esperados no consumidor:

```json
{
  "scripts": {
    "dev": "api-cli dev",
    "build": "pnpm run clean && tsc -p tsconfig.json && tsc-alias -p tsconfig.json --resolve-full-paths --resolve-full-extension .js && api-cli routes:prepare-build",
    "start": "node dist/server.js",
    "start:env": "ENV_FALLBACK_ENABLED=true pnpm run start"
  }
}
```

No build, `api-cli routes:prepare-build` remove a rota de debug `__routes` do artefato final e gera o manifesto de rotas usado em produção.

## Onde aprofundar

- [API](./api.md)
- [Exemplos](./examples.md)
- [Padrões](./standards.md)
- [CLI](./cli.md)
