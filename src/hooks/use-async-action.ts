import { useCallback, useState } from 'react';

/**
 * Bọc một tác vụ async: theo dõi trạng thái chờ và chuyển lỗi thành thông điệp hiển thị.
 */
export function useAsyncAction(toMessage: (error: unknown) => string) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T>(task: () => Promise<T>): Promise<T | undefined> => {
      setPending(true);
      setError(null);
      try {
        return await task();
      } catch (e) {
        setError(toMessage(e));
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [toMessage],
  );

  return { run, pending, error, setError };
}
