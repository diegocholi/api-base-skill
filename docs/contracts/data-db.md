# DB e repositórios

## Objetivo

Explicar como acessar o banco via `app.db`, aplicar transações e manter queries
fora do handler HTTP.

## Quando usar

- Para qualquer acesso a banco de dados no handler ou caso de uso.
- Para encapsular queries em repositórios por módulo.

## Quando NÃO usar

- Não escreva SQL diretamente no handler HTTP.
- Não abra conexão fora do ciclo do plugin.

## Contrato

### Assinatura

```ts
app.register(dbPlugin, { env, createDb, pingDb, shutdownDb });
```

### Entradas

- `env.DB_URL` e `env.DB_DIALECT`.
- Configs de pool via env.

### Saidas

- `app.db` disponível para repositórios.
- checagem de prontidao `db` registrado.
- Use `RepoBase` como base de repositórios SQL-first por módulo.
- Não acesse `db` diretamente em handlers; encapsule em repositórios.

## Erros e códigos de status

- Falhas de conexão viram `InfrastructureError` ao criar DB.
- `pingDb` falha marca readiness como `ok: false`.

## Exemplos

### Básico

```ts
import { UsersRepository } from '@/modules/users/infra/repos/users.repo';

export const handler = async (request) => {
  if (!request.server.db) {
    throw new Error('DB não configurado');
  }

  const repo = new UsersRepository(request.server.db, request.server.env.DB_DIALECT);
  return repo.list();
};
```

### Avançado

```ts
import { withTransaction } from '@/infra/db/transaction';

export const handler = async (request) => {
  const db = request.server.db;
  if (!db) {
    throw new Error('DB não configurado');
  }

  return withTransaction(db, async (tx) => {
    // usar tx em multiplas chamadas ao repo
    return { ok: true };
  });
};
```

## Anti-padrões

- Query direta no handler HTTP.
- Criar conexão manual fora do plugin.
- Transação para leitura simples sem necessidade.

## Checklist de revisão

- [ ] Handler usa repositório e não SQL direto.
- [ ] `app.db` existe antes de usar.
- [ ] Transação usada somente quando necessário.
- [ ] Readiness check ativo para DB.
