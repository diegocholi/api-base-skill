# Guia de testes

Este documento mistura dois contextos:

- consumidor gerado com `api-cli init`;
- repositorio da base ou repositorios internos que mantem testes de documentacao.

Para code agents, a regra e simples: execute apenas comandos que existirem no projeto atual.

## Suite principal

```bash
pnpm run test
pnpm run test:watch
pnpm run test:coverage
```

## Integração

Os arquivos `docker-compose.test*.yml` sao exemplos comuns em repositorios da base ou consumidores mais completos.
Se eles nao existirem no projeto atual, nao invente nomes alternativos: verifique o `package.json`, README e a infraestrutura local antes de sugerir comandos.

Suba as dependências:

```bash
docker compose -f docker-compose.test.yml up -d
```

Para MySQL ou MSSQL:

```bash
docker compose -f docker-compose.test.mysql.yml up -d
docker compose -f docker-compose.test.mssql.yml up -d
```

Execução:

```bash
INTEGRATION_TESTS=true pnpm run test
```

Overrides:

- `TEST_DATABASE_URL`
- `TEST_DB_URL`
- `TEST_REDIS_URL`
- `TEST_DB_DIALECT`

## Validação da documentação

- `pnpm run docs:links`
- `pnpm run docs:examples:typecheck`

Esses comandos fazem sentido apenas quando o projeto realmente mantem a suite de docs.
Nao assuma que eles existem em todo consumidor gerado pela CLI.

## Minimo de validacao para code agents

Ao alterar rotas, handlers ou contratos HTTP, valide pelo menos:

- resposta de sucesso principal (`200`, `201` ou equivalente);
- erro de validacao de entrada quando houver schema;
- erro esperado de dominio quando a mudanca tocar regra de negocio.

Ao alterar auth ou RBAC, valide pelo menos:

- sem token: `401`;
- token invalido: `401`;
- token valido sem role/permissao: `403`;
- token valido com role/permissao necessaria: `200`;
- rota publica sem token: `200`.

## Ordem recomendada de validacao

1. procure scripts reais em `package.json`;
2. rode validacoes baratas primeiro, como `pnpm api-cli routes:validate`;
3. rode testes automatizados relevantes;
4. se a app estiver em execucao, rode `health` e `ready`;
5. complemente com checks manuais quando a mudanca tocar auth, OpenAPI ou filas.

Fallbacks:

- sem suite automatizada: descreva explicitamente que a validacao foi manual;
- sem `api-cli`: use o script equivalente do projeto, se existir;
- sem infraestrutura local: nao finja cobertura de integracao.

## Referências relacionadas

- [Exemplos](./examples.md)
- [Migrações](./migrations.md)
