import { useEffect, useState } from 'react';

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 간단한 데이터 fetching 훅
 * @param key 고유 키 (string 또는 string[])
 * @param fetcher 데이터를 가져오는 함수
 * @param options 옵션
 */
export const useQuery = <T>(
  key: string | string[],
  fetcher: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> => {
  const { enabled = true, refetchOnMount = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      const keyString = Array.isArray(key) ? key.join(',') : key;
      console.error(`Query ${keyString} failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refetchOnMount && enabled) {
      fetchData();
    }
  }, [Array.isArray(key) ? key.join(',') : key, enabled, refetchOnMount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useQuery;
