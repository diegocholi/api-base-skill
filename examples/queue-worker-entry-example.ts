import { startQueueWorker } from '@sebrae/api-base';
import type { ApiBaseJob, ApiBaseJobProcessorContext } from '@sebrae/api-base';
import { billingChargeJob } from '@/modules/billing/application/jobs';
import type { BillingChargeJobPayload } from '@/modules/billing/application/jobs';

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
