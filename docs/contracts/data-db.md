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
- O handler pode instanciar um repositório com `request.server.db`, mas não deve escrever SQL direto no handler.
- Em fluxos mais complexos, mova a orquestracao para caso de uso e mantenha o acesso ao banco encapsulado no repositório.

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
import { UsersRepository } from '@/modules/users/infra/repos/users.repo';

export const handler = async (request) => {
  const db = request.server.db;
  if (!db) {
    throw new Error('DB não configurado');
  }

  return db.transaction(async (tx) => {
    const repo = new UsersRepository(tx, request.server.env.DB_DIALECT);
    return { ok: true };
  });
};
```

## Como um code agent decide usar este contrato

- se a rota ja usa repositorio local, preserve o padrao existente;
- se a tarefa criar acesso novo a banco, prefira criar ou estender um repositorio do modulo;
- so use `request.server.db` no handler para montar o repositorio ou iniciar transacao;
- nao introduza helpers como `withTransaction` sem confirmar que eles existem no consumidor.

## Anti-padrões

- Query direta no handler HTTP.
- Criar conexão manual fora do plugin.
- Transação para leitura simples sem necessidade.

## Checklist de revisão

- [ ] Handler usa repositório e não SQL direto.
- [ ] `request.server.db` existe antes de instanciar repositório ou transação.
- [ ] Transação usada somente quando necessário.
- [ ] Readiness check ativo para DB.
