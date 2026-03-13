import { createPermissionsResolver, createRolesResolver } from '@sebrae/api-base';

type CacheService = {
  cacheAside: <T>(key: string, ttlSeconds: number, loader: () => Promise<T>) => Promise<T>;
};

type DbExecutor = {
  query: (
    statement: string,
    params?: unknown[],
  ) => Promise<{ rows?: Array<Record<string, unknown>> }>;
};

interface AppEnv {
  DB_DIALECT: 'postgres' | 'mysql' | 'mssql';
}

interface AuthRbacPluginOptions {
  env: AppEnv;
}

interface AuthPluginApp {
  cache?: CacheService;
  db?: DbExecutor;
  decorate: (name: string, value: unknown) => void;
}

class AuthRepository {
  constructor(
    private readonly db: DbExecutor,
    private readonly _dialect: AppEnv['DB_DIALECT'],
  ) {}

  async findRoleSlugsByUserId(userId: string): Promise<string[]> {
    const result = await this.db.query(
      'select slug from roles_by_user where user_id = ? order by slug asc',
      [userId],
    );

    return (result.rows ?? [])
      .map((row) => row.slug)
      .filter((value): value is string => typeof value === 'string');
  }

  async findPermissionSlugsByRoleSlugs(roleSlugs: readonly string[]): Promise<string[]> {
    const result = await this.db.query(
      'select slug from permissions_by_role where role_slug = any (?) order by slug asc',
      [roleSlugs],
    );

    return (result.rows ?? [])
      .map((row) => row.slug)
      .filter((value): value is string => typeof value === 'string');
  }
}

export const authRbacPlugin = async (
  app: AuthPluginApp,
  { env }: AuthRbacPluginOptions,
): Promise<void> => {
  app.decorate(
    'resolveRoles',
    createRolesResolver({
      ...(app.cache ? { cache: app.cache } : {}),
      loadRoles: async (userId) => {
        if (!app.db) {
          return [];
        }

        const repo = new AuthRepository(app.db, env.DB_DIALECT);
        return repo.findRoleSlugsByUserId(userId);
      },
    }),
  );

  app.decorate(
    'resolvePermissions',
    createPermissionsResolver({
      ...(app.cache ? { cache: app.cache } : {}),
      loadPermissions: async (roles) => {
        if (!app.db) {
          return [];
        }

        const repo = new AuthRepository(app.db, env.DB_DIALECT);
        return repo.findPermissionSlugsByRoleSlugs(roles);
      },
    }),
  );
};
