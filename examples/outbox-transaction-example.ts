import { withOutboxTransaction, type DbExecutor } from '@sebrae/api-base';

import type { OutboxEvent, OutboxInsert } from '@sebrae/api-base/infra/outbox/outbox.repository';

interface OrdersRepository {
  create: (tx: DbExecutor, input: { id: string; total: number }) => Promise<void>;
}

interface OutboxWriter {
  enqueueEvent: (tx: DbExecutor, event: OutboxInsert) => Promise<OutboxEvent>;
}

export const createOrder = async (
  db: DbExecutor,
  repo: OrdersRepository,
  outbox: OutboxWriter,
): Promise<{ ok: true }> =>
  withOutboxTransaction(db, outbox, async ({ tx, enqueueEvent }) => {
    await repo.create(tx, { id: 'order-1', total: 1000 });
    await enqueueEvent({
      aggregate: 'orders',
      type: 'orders.created',
      payload: { id: 'order-1' },
    });

    return { ok: true };
  });
