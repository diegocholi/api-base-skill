import { RepoBase, type DbDialect, type DbExecutor } from '@sebrae/api-base';

type UserColumns = 'id' | 'email' | 'name' | 'created_at' | 'updated_at';

interface UserRow {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class UsersRepository extends RepoBase<UserColumns> {
  constructor(db: DbExecutor, dialect: DbDialect) {
    super(db, dialect, {
      table: 'users',
      columns: ['id', 'email', 'name', 'created_at', 'updated_at'],
      primaryKey: 'id',
    });
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return this.findOne<UserRow>({
      where: [{ column: 'email', value: email }],
    });
  }

  async list(limit = 20, offset = 0): Promise<UserRow[]> {
    return this.findMany<UserRow>({
      orderBy: [{ column: 'created_at', direction: 'desc' }],
      limit,
      offset,
    });
  }
}
