import { Box, Portal } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import Toast from './Toast';

// Toast 관련 타입 정의
interface ToastMessage {
  id: string;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  action?: ReactNode;
  timestamp: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: Omit<ToastMessage, 'id' | 'timestamp'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultPosition?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  defaultAutoHideDuration?: number;
}

// Toast Context 생성
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider 컴포넌트
 *
 * 전역적으로 Toast 메시지를 관리하는 Context Provider
 * 여러 Toast 메시지를 동시에 표시하고 관리할 수 있습니다.
 *
 * @example
 * ```tsx
 * // App.tsx에서 설정
 * <ToastProvider maxToasts={5}>
 *   <App />
 * </ToastProvider>
 *
 * // 컴포넌트에서 사용
 * const { showToast } = useToast();
 *
 * const handleSuccess = () => {
 *   showToast({
 *     message: '저장되었습니다.',
 *     severity: 'success'
 *   });
 * };
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultPosition = { vertical: 'bottom', horizontal: 'left' },
  defaultAutoHideDuration = 6000,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast 메시지 표시
  const showToast = useCallback(
    (message: Omit<ToastMessage, 'id' | 'timestamp'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastMessage = {
        id,
        ...message,
        position: message.position || defaultPosition,
        autoHideDuration: message.autoHideDuration || defaultAutoHideDuration,
        timestamp: Date.now(),
      };

      setToasts(prev => {
        const updatedToasts = [...prev, newToast];
        // 최대 Toast 개수 제한
        if (updatedToasts.length > maxToasts) {
          return updatedToasts.slice(-maxToasts);
        }
        return updatedToasts;
      });

      return id;
    },
    [maxToasts, defaultPosition, defaultAutoHideDuration]
  );

  // Toast 메시지 숨김
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 모든 Toast 메시지 제거
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 위치별로 Toast 그룹화
  const groupedToasts = toasts.reduce((groups, toast) => {
    const key = `${toast.position?.vertical}-${toast.position?.horizontal}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(toast);
    return groups;
  }, {} as Record<string, ToastMessage[]>);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Portal을 사용하여 Toast를 body에 렌더링 */}
      <Portal>
        {Object.entries(groupedToasts).map(([position, positionToasts]) => {
          const firstToast = positionToasts[0];
          if (!firstToast) return null;

          return (
            <Box
              key={position}
              sx={{
                position: 'fixed',
                zIndex: 1400,
                pointerEvents: 'none',
                ...getPositionStyles(firstToast.position),
              }}
            >
              {positionToasts.map((toast, index) => (
                <Box
                  key={toast.id}
                  sx={{
                    mb: index < positionToasts.length - 1 ? 1 : 0,
                    pointerEvents: 'auto',
                  }}
                >
                  <Toast
                    open={true}
                    message={toast.message}
                    severity={toast.severity}
                    autoHideDuration={toast.autoHideDuration}
                    onClose={() => hideToast(toast.id)}
                    position={toast.position}
                    action={toast.action}
                  />
                </Box>
              ))}
            </Box>
          );
        })}
      </Portal>
    </ToastContext.Provider>
  );
};

// 위치에 따른 스타일 계산
const getPositionStyles = (position?: {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}) => {
  const { vertical = 'bottom', horizontal = 'left' } = position || {};

  const styles: Record<string, any> = {};

  // 수직 위치
  if (vertical === 'top') {
    styles.top = 24;
  } else {
    styles.bottom = 24;
  }

  // 수평 위치
  if (horizontal === 'left') {
    styles.left = 24;
  } else if (horizontal === 'right') {
    styles.right = 24;
  } else {
    styles.left = '50%';
    styles.transform = 'translateX(-50%)';
  }

  return styles;
};

/**
 * Toast Hook
 *
 * Toast 기능을 사용하기 위한 커스텀 Hook
 *
 * @example
 * ```tsx
 * const { showToast, hideToast, clearAllToasts } = useToast();
 *
 * // 성공 메시지
 * showToast({
 *   message: '저장되었습니다.',
 *   severity: 'success'
 * });
 *
 * // 에러 메시지
 * showToast({
 *   message: '오류가 발생했습니다.',
 *   severity: 'error',
 *   autoHideDuration: 0 // 자동 숨김 비활성화
 * });
 *
 * // 커스텀 위치
 * showToast({
 *   message: '상단 중앙에 표시',
 *   position: { vertical: 'top', horizontal: 'center' }
 * });
 * ```
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// 편의 메서드들
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    showSuccess: (message: string, options?: Partial<ToastMessage>) =>
      showToast({ ...options, message, severity: 'success' }),

    showError: (message: string, options?: Partial<ToastMessage>) =>
      showToast({ ...options, message, severity: 'error' }),

    showWarning: (message: string, options?: Partial<ToastMessage>) =>
      showToast({ ...options, message, severity: 'warning' }),

    showInfo: (message: string, options?: Partial<ToastMessage>) =>
      showToast({ ...options, message, severity: 'info' }),
  };
};

export default ToastProvider;
