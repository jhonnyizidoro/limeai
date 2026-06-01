type Success<T> = [null, T];
type Failure = [Error, null];

export async function tryCatch<T>(promise: Promise<T>): Promise<Success<T> | Failure> {
  try {
    const data = await promise;
    return [null, data];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(error);
    return [error, null];
  }
}
