declare module '@sebrae/api-base' {
  export interface Env {
    PORT: number;
    [key: string]: unknown;
  }

  export const env: Env;

  export function parseEnv(input: Record<string, unknown>): Env;

  export function createApp<TEnv = Env>(options: { env: TEnv; routesDir?: string }): {
    env: TEnv;
    listen(options: { port: number; host: string }): Promise<void>;
  };

  export function defineZodRoute(options: {
    options?: {
      preHandler?: (request: any, reply: any) => any;
      [key: string]: unknown;
    };
    handler: (request: any, reply: any) => any;
  }): unknown;

  export function createDefineZodRoute<TEnv = Env>(): typeof defineZodRoute;

  export function parseWithZod(schema: unknown, input: unknown): any;

  export class ValidationError extends Error {
    code: string;
    details?: unknown;
    constructor(message: string, details?: unknown, cause?: unknown);
  }

  export class InfrastructureError extends Error {
    code: string;
    constructor(message: string, cause?: unknown);
  }

  export const CACHE_TTL_10_MINUTES: number;

  export function createScopeOrOwnerPolicy(scope: string, ownerPath: string): unknown;

  export function createRolesResolver(options: {
    cache?: unknown;
    loadRoles: (userId: string) => Promise<string[]>;
  }): unknown;

  export function createPermissionsResolver(options: {
    cache?: unknown;
    loadPermissions: (roles: readonly string[]) => Promise<string[]>;
  }): unknown;

  export type Result<T, E = ValidationError> =
    | { ok: true; value: T }
    | { ok: false; error: E };

  export function ok<T>(value: T): Result<T, never>;
  export function err<E>(error: E): Result<never, E>;
  export function match<T, E, R>(
    result: Result<T, E>,
    handlers: { ok: (value: T) => R; err: (error: E) => R },
  ): R;

  export function audit(
    event: string,
    payload: Record<string, unknown>,
    context: { logger: { child(bindings: Record<string, unknown>): unknown; info(obj: unknown, msg?: string): void }; requestId?: string },
  ): void;

  export type DbDialect = 'postgres' | 'mysql' | 'mssql';

  export interface DbExecutor {
    query(statement: string, params?: unknown[]): Promise<{ rows?: Array<Record<string, unknown>> }>;
  }

  export class RepoBase<TColumn extends string> {
    constructor(
      db: DbExecutor,
      dialect: DbDialect,
      options: { table: string; columns: TColumn[]; primaryKey: TColumn },
    );

    findOne<TRow>(options: { where: Array<{ column: TColumn; value: unknown }> }): Promise<TRow | null>;
    findMany<TRow>(options: {
      orderBy?: Array<{ column: TColumn; direction: 'asc' | 'desc' }>;
      limit?: number;
      offset?: number;
    }): Promise<TRow[]>;
  }
}
