import { startOutboxWorker } from '@sebrae/api-base';

export const startWorker = async (): Promise<void> => {
  await startOutboxWorker();
};

void startWorker();
