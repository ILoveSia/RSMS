import { useState } from 'react';

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

interface UseMutationResult<TData, TVariables> {
  data: TData | null;
  loading: boolean;
  error: string | null;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
}

/**
 * 데이터 변경을 위한 mutation 훅
 * @param mutationFn 실행할 mutation 함수
 * @param options 옵션
 */
export const useMutation = <TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> => {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (variables: TVariables): Promise<TData> => {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFn(variables);
      setData(result);

      if (onSuccess) {
        onSuccess(result, variables);
      }

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '작업을 수행하는데 실패했습니다.';
      setError(errorMessage);

      const errorObj = err instanceof Error ? err : new Error(errorMessage);
      if (onError) {
        onError(errorObj, variables);
      }

      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
};

export default useMutation;
