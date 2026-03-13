# Instalação dos pacotes privados

Este guia cobre apenas a instalação inicial no projeto consumidor. Para a jornada completa, comece por [Visão geral](./overview.md).

## Pré-requisitos

- Node.js 20+
- pnpm 10+
- acesso aos pacotes `@sebrae/*` no npm

## Configurar autenticação no npm

Login local:

```bash
npm login --registry https://registry.npmjs.org --scope @sebrae
```

Token para CI ou ambiente não interativo:

```ini
@sebrae:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

## Criar e preparar o consumidor

```bash
mkdir meu-servico
cd meu-servico
pnpm init
pnpm add @sebrae/api-base
pnpm add -D @sebrae/api-base-cli
pnpm api-cli init
```

Se quiser um projeto de estudo com exemplos:

```bash
pnpm api-cli init --with-example
```

Use `init --with-example` apenas para onboarding, POC ou demonstração.

## Scripts esperados no consumidor

```json
{
  "scripts": {
    "dev": "api-cli dev",
    "clean": "rimraf dist tsconfig.tsbuildinfo",
    "build": "pnpm run clean && tsc -p tsconfig.json && tsc-alias -p tsconfig.json --resolve-full-paths --resolve-full-extension .js && api-cli routes:prepare-build",
    "start": "node dist/server.js",
    "start:env": "ENV_FALLBACK_ENABLED=true pnpm run start",
    "db:migrate": "api-cli db migrate",
    "db:migrate:env": "ENV_FALLBACK_ENABLED=true api-cli db migrate"
  }
}
```

Para consumidores antigos:

```bash
pnpm api-cli migrate
```

O comando aplica todas as migrações conhecidas do scaffold do consumidor,
incluindo upgrades entre versões antigas e o padrão atual do framework.

Simulação sem escrita:

```bash
pnpm api-cli migrate --dry-run
```

## Próximos passos

1. Ajuste o `.env` com base em [Variáveis de ambiente](./env.md).
2. Rode `pnpm api-cli db migrate` ou o script equivalente existente no `package.json`.
3. Suba a API com `pnpm api-cli dev` ou com o script `dev` do consumidor.
4. Consulte [Arquitetura](./architecture.md), [API](./api.md) e [Exemplos](./examples.md).
