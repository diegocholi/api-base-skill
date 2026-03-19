import {
  defineOutboxEvent,
  withOutboxTransaction,
  type ApiBaseOutboxEventDefinition,
  type DbExecutor,
} from '@sebrae/api-base';
import { z } from 'zod';

interface OrdersRepository {
  create: (tx: DbExecutor, input: { id: string; total: number }) => Promise<void>;
}

interface OutboxWriter {
  enqueueEvent: (
    tx: DbExecutor,
    event: { aggregate: string; type: string; payload: unknown },
  ) => Promise<{
    id: number;
    aggregate: string;
    type: string;
    payload: unknown;
    status: string;
    created_at: Date;
    processed_at: Date | null;
  }>;
}

const orderCreatedEvent: ApiBaseOutboxEventDefinition<{ id: string }, 'orders.created'> =
  defineOutboxEvent({
    aggregate: 'orders',
    type: 'orders.created',
    schema: z.object({
      id: z.string().min(1),
    }),
  });

export const createOrder = async (
  db: DbExecutor,
  repo: OrdersRepository,
  outbox: OutboxWriter,
): Promise<{ ok: true }> =>
  withOutboxTransaction(db, outbox, async ({ tx, enqueueDefinedEvent, enqueueEvent }) => {
    await repo.create(tx, { id: 'order-1', total: 1000 });
    await enqueueDefinedEvent(orderCreatedEvent, { id: 'order-1' });
    await enqueueEvent({
      aggregate: 'audit',
      type: 'orders.audit.created',
      payload: { orderId: 'order-1' },
    });

    return { ok: true };
  });
