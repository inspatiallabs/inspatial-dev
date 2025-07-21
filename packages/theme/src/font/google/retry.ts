// eslint-disable-next-line import/no-extraneous-dependencies
interface RetryOptions {
  retries: number;
  onRetry?: (error: unknown, attempt: number) => void;
  minTimeout?: number;
}

type RetryFunction<T> = () => Promise<T>;

async function asyncRetry<T>(
  fn: RetryFunction<T>,
  options: RetryOptions
): Promise<T> {
  const { retries, onRetry, minTimeout = 100 } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt);
      }

      // Exponential backoff with random jitter
      const delay = Math.min(
        minTimeout * Math.pow(2, attempt - 1) + Math.random() * minTimeout,
        30000 // Max timeout of 30 seconds
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Retry failed: Maximum retries reached");
}

export async function retry<T>(
  fn: RetryFunction<T>,
  retries: number
): Promise<T> {
  return await asyncRetry(fn, {
    retries,
    onRetry(e: unknown, attempt: number) {
      console.error(
        (e as Error).message + `\n\nRetrying ${attempt}/${retries}...`
      );
    },
    minTimeout: 100,
  });
}
