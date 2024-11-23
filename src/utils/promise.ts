export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withMinDuration = async <T>(
  promise: Promise<T>,
  delayMs: number
): Promise<T> => {
  const startTime = performance.now();
  const result = await promise;
  const elapsedTime = performance.now() - startTime;

  if (elapsedTime < delayMs) {
    await delay(delayMs - elapsedTime);
  }

  return result;
};

export class PromiseQueue {
  private promises: (() => Promise<unknown>)[] = [];
  private processing = false;

  public push<T>(promise: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedPromise = async () => {
        try {
          const result = await promise();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      };

      this.promises.push(wrappedPromise);
      this.process();
    });
  }

  private process() {
    if (this.processing || this.promises.length === 0) {
      return;
    }

    this.processing = true;

    const promise = this.promises.shift();

    if (!promise) return;

    promise().finally(() => {
      this.processing = false;
      this.process();
    });
  }
}
