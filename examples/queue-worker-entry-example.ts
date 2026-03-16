import { startQueueWorker } from '@sebrae/api-base';

interface LoggerLike {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface JobLike {
  name: string;
  queueName: string;
}

const billingChargeJobConfig = {
  queueName: 'billing',
  jobName: 'billing.charge',
};

const createBillingChargeJobProcessor =
  (_logger: LoggerLike) =>
  async (_job: JobLike): Promise<{ ok: true }> => ({ ok: true });

export const startWorker = async (): Promise<void> => {
  await startQueueWorker({
    register: async ({ queueService, logger }) => {
      const billingChargeProcessor = createBillingChargeJobProcessor(logger);

      queueService.registerQueue(billingChargeJobConfig.queueName);
      queueService.registerWorker(billingChargeJobConfig.queueName, async (job) => {
        if (job.name === billingChargeJobConfig.jobName) {
          return billingChargeProcessor(job);
        }

        logger.warn({ jobName: job.name, queue: job.queueName }, 'Unknown job received');
        return { ok: false };
      });
    },
  });
};

void startWorker();
