import { defineJob, startQueueWorker } from '@sebrae/api-base';
import type { ApiBaseJob, ApiBaseJobProcessorContext } from '@sebrae/api-base';
import { z } from 'zod';

const billingChargeJobSchema = z.object({
  id: z.string().min(1),
});

const billingChargeJob = defineJob({
  queueName: 'billing',
  jobName: 'billing.charge',
  schema: billingChargeJobSchema,
});

type BillingChargeJobPayload = {
  id: string;
};

const processBillingChargeJob = async (
  _job: ApiBaseJob<BillingChargeJobPayload>,
  _context: ApiBaseJobProcessorContext,
): Promise<{ ok: true }> => ({ ok: true });

export const startWorker = async (): Promise<void> => {
  await startQueueWorker({
    jobs: [
      {
        definition: billingChargeJob,
        processor: processBillingChargeJob,
      },
    ],
  });
};

void startWorker();
