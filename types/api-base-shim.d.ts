declare module '@sebrae/api-base' {
  export interface ApiBaseOutboxPublishContext<TType extends string = string> {
    aggregate: string;
    type: TType;
  }

  export interface ApiBaseOutboxEventDefinition<TPayload = unknown, TType extends string = string>
    extends ApiBaseOutboxPublishContext<TType> {
    schema: unknown;
  }

  export interface ApiBaseJobDefinition<TPayload = unknown, TName extends string = string> {
    queueName: string;
    jobName: TName;
    schema: unknown;
  }

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

  export type ApiBaseJob<TPayload = unknown> = {
    id?: string | number | null;
    name: string;
    queueName: string;
    data: TPayload;
  };

  export type ApiBaseJobProcessorContext = {
    logger: ApiBaseLogger;
  };

  export type ApiBaseJobRegistration<TPayload = unknown> = {
    definition: ApiBaseJobDefinition<TPayload>;
    processor: {
      bivarianceHack(
        job: ApiBaseJob<TPayload>,
        context: ApiBaseJobProcessorContext,
      ): Promise<unknown> | unknown;
    }['bivarianceHack'];
  };

  export type ApiBaseLogger = {
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
    error(...args: unknown[]): void;
  };

  export function defineJob<TPayload = unknown, TName extends string = string>(definition: {
    queueName: string;
    jobName: TName;
    schema: unknown;
  }): ApiBaseJobDefinition<TPayload, TName>;

  export function defineOutboxEvent<TPayload = unknown, TType extends string = string>(
    definition: ApiBaseOutboxEventDefinition<TPayload, TType>,
  ): ApiBaseOutboxEventDefinition<TPayload, TType>;

  export function enqueueOutboxEvent<TPayload = unknown, TType extends string = string>(
    writer: {
      enqueueEvent: (
        tx: DbExecutor,
        event: import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxInsert,
      ) => Promise<import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxEvent>;
    },
    tx: DbExecutor,
    definition: ApiBaseOutboxEventDefinition<TPayload, TType>,
    payload: TPayload,
  ): Promise<import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxEvent>;

  export function registerJobs(
    queueService: QueueWorkerRegistrationContext['queueService'],
    logger: ApiBaseLogger,
    registrations: ApiBaseJobRegistration[],
  ): void;

  export interface QueueWorkerRegistrationContext {
    queueService: {
      registerQueue(name: string): unknown;
      registerJob(definition: ApiBaseJobDefinition): unknown;
      registerWorker(
        queueName: string,
        processor: (job: ApiBaseJob) => Promise<unknown>,
      ): unknown;
      addJob(
        definition: ApiBaseJobDefinition,
        payload: unknown,
        options?: { requestId?: string; jobOptions?: Record<string, unknown> },
      ): Promise<{ id?: string | number | null }>;
    };
    logger: ApiBaseLogger;
  }

  export function startQueueWorker(options?: {
    jobs?: ApiBaseJobRegistration[];
    register?: (context: QueueWorkerRegistrationContext) => Promise<void> | void;
  }): Promise<void>;

  export function startOutboxWorker(options?: unknown): Promise<void>;

  export function withOutboxTransaction<T>(
    db: DbExecutor,
    outbox: {
      enqueueEvent: (
        tx: DbExecutor,
        event: import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxInsert,
      ) => Promise<import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxEvent>;
    },
    fn: (context: {
      tx: DbExecutor;
      enqueueEvent: (
        event: import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxInsert,
      ) => Promise<import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxEvent>;
      enqueueDefinedEvent: <TPayload = unknown, TType extends string = string>(
        definition: ApiBaseOutboxEventDefinition<TPayload, TType>,
        payload: TPayload,
      ) => Promise<import('@sebrae/api-base/infra/outbox/outbox.repository').OutboxEvent>;
    }) => Promise<T>,
  ): Promise<T>;

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

declare module '@sebrae/api-base/infra/outbox/outbox.repository' {
  export interface OutboxInsert {
    aggregate: string;
    type: string;
    payload: unknown;
  }

  export interface OutboxEvent extends OutboxInsert {
    id: number;
    status: string;
    created_at: Date;
    processed_at: Date | null;
  }
}
