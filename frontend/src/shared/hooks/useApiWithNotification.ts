import { useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

interface UseApiWithNotificationOptions {
  showSuccessOnLoad?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * API 호출 시 자동으로 알림을 표시하는 훅
 * 
 * @example
 * ```tsx
 * const { callApiWithNotification } = useApiWithNotification({
 *   showSuccessOnLoad: true,
 *   successMessage: '데이터를 성공적으로 불러왔습니다.',
 *   errorMessage: '데이터 로드 중 오류가 발생했습니다.'
 * });
 * 
 * const handleLoadData = async () => {
 *   try {
 *     const result = await api.getData();
 *     callApiWithNotification(() => api.getData(), 'success');
 *   } catch (error) {
 *     // 에러는 자동으로 처리됨
 *   }
 * };
 * ```
 */
export const useApiWithNotification = (options: UseApiWithNotificationOptions = {}) => {
  const { showSuccessLoad, showNotification } = useNotification();
  const { showSuccessOnLoad = true, successMessage="페이지 로드 성공", errorMessage="페이지 로드 실패" } = options;

  const callApiWithNotification = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      successType: 'success_load' | 'custom' = 'success_load'
    ): Promise<T | null> => {
      try {
        const result = await apiCall();
        
        if (successType === 'success_load' && showSuccessOnLoad) {
          showSuccessLoad();
        } else if (successType === 'custom' && successMessage) {
          showNotification(successMessage, 'success');
        }
        
        return result;
      } catch (error) {
        const errorMsg = errorMessage || (error instanceof Error ? error.message : '데이터 로드 중 오류 발생');
        showNotification(errorMsg, 'error');
        return null;
      }
    },
    [showSuccessLoad, showNotification, showSuccessOnLoad, successMessage, errorMessage]
  );

  return {
    callApiWithNotification,
  };
};
