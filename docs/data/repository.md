# Auxiliares de repositório

Repositórios são SQL-first para manter comportamento consistente entre Postgres, MySQL e SQL Server.
Prefira `RepoBase` (construido sobre `DbExecutor` + `DB_DIALECT`) para que o repo possa alternar
formatos de query quando necessário. `RepoBase` expõe helpers _protected_, entao chame-os dentro
de métodos do repositório e exponha métodos públicos no seu repo (ex.: `list`, `getById`,
`create`).

```ts
import { RepoBase } from '@/infra/db/repo-base';

import type { DbDialect } from '@/config/env';
import type { DbExecutor } from '@/shared/db/types';

class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at' | 'updated_at'> {
  constructor(db: DbExecutor, dialect: DbDialect) {
    super(db, dialect, {
      table: 'users',
      columns: ['id', 'email', 'name', 'created_at', 'updated_at'],
      primaryKey: 'id',
    });
  }

  async list(limit = 20, offset = 0) {
    return this.findMany({
      orderBy: [{ column: 'created_at', direction: 'desc' }],
      limit,
      offset,
    });
  }
}
```

Use `query`/`queryOne` para joins customizados ou SQL complexo, e `paginate` para list+count.
Para transações, envolva escritas com `withTransaction` para que o caso de uso decida quando
executar em uma única unidade de trabalho.

Auxiliares do RepoBase (protected, para serem chamados dentro do repo):

- `findMany`, `findOne`, `findById`, `count`, `exists`, `paginate`
- `insert`, `insertMany`, `insertAndFetch`
- `update`, `updateById`, `delete`, `deleteById`
- `upsert` (ciente do dialeto)
- `query`, `queryOne` para SQL customizado

## Uso do RepoBase

### Construtor

```ts
class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at'> {
  constructor(db: DbExecutor, dialect: DbDialect) {
    super(db, dialect, {
      table: 'users',
      columns: ['id', 'email', 'name', 'created_at'],
      primaryKey: 'id',
    });
  }
}
```

### Leitura de dados

```ts
class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at'> {
  async list(limit = 20, offset = 0) {
    return this.findMany<UserRow>({
      where: [
        { column: 'email', op: 'like', value: '%@example.com' },
        { column: 'name', op: '!=', value: null },
      ],
      orderBy: [{ column: 'created_at', direction: 'desc' }],
      limit,
      offset,
    });
  }

  async findById(userId: string) {
    return this.findByIdTyped<UserRow>(userId);
  }

  async listPage(limit = 20, offset = 0) {
    return this.paginate<UserRow>({ limit, offset });
  }
}
```

Operadores suportados: `=`, `!=`, `<`, `<=`, `>`, `>=`, `like`, `in` (valores array),
tratamento de `null`.

### Escrita de dados

```ts
class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at'> {
  async create(user: UserRow) {
    await this.insert(user);
  }

  async createMany(rows: UserRow[]) {
    await this.insertMany(rows);
  }

  async rename(userId: string, name: string) {
    await this.updateById(userId, { name });
  }

  async remove(userId: string) {
    await this.deleteById(userId);
  }
}
```

### InsertAndFetch

No projeto consumidor, a configuracao fica no repositorio de modulo (ex.: `src/modules/users/infra/repos/users.repo.ts`):

```ts
class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at' | 'updated_at'> {
  constructor(db: DbExecutor, dialect: DbDialect) {
    super(db, dialect, {
      table: 'users',
      columns: ['id', 'email', 'name', 'created_at', 'updated_at'],
      primaryKey: 'id',
    });
  }

  async create(email: string, name: string) {
    const now = new Date();
    return this.insertAndFetch<UserRow>({
      email,
      name,
      created_at: now,
      updated_at: now,
    } as Record<'id' | 'email' | 'name' | 'created_at' | 'updated_at', unknown>);
  }
}
```

Resumo para consumidor:

- o helper nao inspeciona metadata da tabela para descobrir PK automaticamente.
- ele usa a coluna definida em `primaryKey` no `super(...)`.
- se `primaryKey` nao estiver configurada, passe `where` no `insertAndFetch`.
- se `primaryKey` estiver errada (diferente da tabela), o fetch pode falhar.

Comportamento do helper:

- se você passar `where`, ele usa esse filtro para buscar a linha após o insert.
- se você passar a PK no payload (ex.: UUID gerado na app), ele busca por essa PK.
- se você não passar a PK e houver `primaryKey` no repo, ele tenta ler a PK gerada no insert e busca por ela.

Resolucao da PK gerada por dialeto:

- Postgres: `returning <primaryKey>`
- SQL Server: `output inserted.<primaryKey>`
- MySQL: leitura de `insertId` no retorno do driver

Quando o repo nao tem `primaryKey` configurada, passe `where` explicitamente:

```ts
return this.insertAndFetch<UserRow>(
  {
    email,
    name,
    created_at: new Date(),
  } as Record<'id' | 'email' | 'name' | 'created_at', unknown>,
  {
    where: [{ column: 'email', value: email }],
  },
);
```

### Upsert

`upsert` resolve o alvo de conflito por dialeto (Postgres, MySQL, SQL Server).
Por padrão ele usa o `primaryKey`, mas você pode sobrescrever as colunas de conflito.

```ts
class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at'> {
  async upsertByEmail(user: UserRow) {
    await this.upsert(user, {
      conflictColumns: ['email'],
      updateColumns: ['name'],
    });
  }
}
```

### SQL customizado

Padrao no consumidor: importar `sql` do wrapper local (`@/infra/db/repo-base`).
Alternativa: importar direto da LIB (`@sebrae/api-base`) quando necessario fora do wrapper.

```ts
import { sql } from '@/infra/db/repo-base';
// ou: import { sql } from '@sebrae/api-base';

class UsersRepository extends RepoBase<'id' | 'email' | 'name' | 'created_at'> {
  async listByEmail(email: string) {
    return this.query<UserRow>(sql`
      select id, email, name, created_at from users where email like ${email}
    `);
  }
}
```
