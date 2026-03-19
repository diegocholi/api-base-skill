import {
  withOutboxTransaction,
  type ApiBaseOutboxWriter,
  type DbExecutor,
} from '@sebrae/api-base';
import { ordersCreatedEvent } from '@/modules/orders/application/events';

interface OrdersRepository {
  create: (tx: DbExecutor, input: { id: string; total: number }) => Promise<void>;
}

export const createOrder = async (
  db: DbExecutor,
  repo: OrdersRepository,
  outbox: ApiBaseOutboxWriter,
): Promise<{ ok: true }> =>
  withOutboxTransaction(db, outbox, async ({ tx, enqueueDefinedEvent, enqueueEvent }) => {
    await repo.create(tx, { id: 'order-1', total: 1000 });
    await enqueueDefinedEvent(ordersCreatedEvent, { id: 'order-1' });
    await enqueueEvent({
      aggregate: 'audit',
      type: 'orders.audit.created',
      payload: { orderId: 'order-1' },
    });

    return { ok: true };
  });
