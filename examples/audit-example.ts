import { audit } from '@sebrae/api-base';

const logger = {
  child: (_bindings: Record<string, unknown>) => logger,
  info: (_obj: unknown, _msg?: string) => undefined,
};

audit(
  'users.created',
  {
    actorId: 'user-1',
    action: 'create',
    resource: { type: 'user', id: 'user-2' },
    metadata: { source: 'http', module: 'users' },
  },
  {
    logger,
    requestId: 'req-123',
  },
);
