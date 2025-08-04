import { useState, useCallback } from 'react';
import type { AlertColor } from '@mui/material/Alert';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface UseSnackbarReturn {
  snackbar: SnackbarState;
  showSnackbar: (message: string, severity?: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideSnackbar: () => void;
}

/**
 * 스낵바 관리 훅
 * Toast 컴포넌트와 함께 사용하여 알림 메시지를 표시합니다.
 * 
 * @example
 * ```tsx
 * const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
 * 
 * // 성공 메시지
 * showSnackbar('저장되었습니다.', 'success');
 * 
 * // 에러 메시지
 * showSnackbar('오류가 발생했습니다.', 'error');
 * 
 * // JSX에서 사용
 * return (
 *   <>
 *     <Button onClick={() => showSnackbar('테스트 메시지')}>
 *       테스트
 *     </Button>
 *     <Toast
 *       open={snackbar.open}
 *       message={snackbar.message}
 *       severity={snackbar.severity}
 *       onClose={hideSnackbar}
 *     />
 *   </>
 * );
 * ```
 */
export const useSnackbar = (): UseSnackbarReturn => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  // 편의 함수들
  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };
};

export default useSnackbar;