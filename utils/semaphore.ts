// Simple case of 0-concurrency semaphore
export const createSemaphore = () => {
  let isAcquired = false;
  let queuedResolve: (() => void) | null = null;

  const acquire = () => {
    return new Promise<void>((resolve) => {
      if (!isAcquired) {
        isAcquired = true;
        resolve();
      } else {
        queuedResolve = resolve;
      }
    });
  };

  const release = () => {
    if (queuedResolve) {
      const resolve = queuedResolve;
      queuedResolve = null;
      resolve();
    } else {
      isAcquired = false;
    }
  };

  return { acquire, release };
};
