import { Backdrop, Box, CircularProgress, Portal, Typography } from '@mui/material';
import React, { createContext, useCallback, useContext, useState } from 'react';
import Loading from './Loading';

// Loading Context 타입 정의
interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

interface LoadingContextType {
  isLoading: boolean;
  loadingStates: LoadingState[];
  showLoading: (message?: string, id?: string) => string;
  hideLoading: (id?: string) => void;
  updateLoadingProgress: (progress: number, id?: string) => void;
  clearAllLoading: () => void;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  backdrop?: boolean;
  disablePortal?: boolean;
  customLoader?: React.ComponentType<any>;
}

// Loading Context 생성
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Loading Provider 컴포넌트
 *
 * 전역적으로 로딩 상태를 관리하는 Context Provider
 * API 호출 시 자동으로 로딩 상태를 표시하고 관리할 수 있습니다.
 *
 * @example
 * ```tsx
 * // App.tsx에서 설정
 * <LoadingProvider backdrop>
 *   <App />
 * </LoadingProvider>
 *
 * // 컴포넌트에서 사용
 * const { showLoading, hideLoading } = useLoading();
 *
 * const handleApiCall = async () => {
 *   const loadingId = showLoading('데이터를 불러오는 중...');
 *   try {
 *     await apiCall();
 *   } finally {
 *     hideLoading(loadingId);
 *   }
 * };
 * ```
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  backdrop = true,
  disablePortal = false,
  customLoader,
}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);

  // 로딩 상태 표시
  const showLoading = useCallback((message?: string, id?: string) => {
    const loadingId = id || `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLoadingState: LoadingState = {
      id: loadingId,
      message,
      timestamp: Date.now(),
    };

    setLoadingStates(prev => [...prev, newLoadingState]);
    return loadingId;
  }, []);

  // 로딩 상태 숨김
  const hideLoading = useCallback((id?: string) => {
    if (id) {
      setLoadingStates(prev => prev.filter(state => state.id !== id));
    } else {
      // ID가 없으면 가장 최근 로딩 상태 제거
      setLoadingStates(prev => prev.slice(0, -1));
    }
  }, []);

  // 로딩 진행률 업데이트
  const updateLoadingProgress = useCallback((progress: number, id?: string) => {
    setLoadingStates(prev =>
      prev.map(state => {
        if (id) {
          return state.id === id ? { ...state, progress } : state;
        } else {
          // ID가 없으면 가장 최근 로딩 상태 업데이트
          return prev.length > 0 && state === prev[prev.length - 1]
            ? { ...state, progress }
            : state;
        }
      })
    );
  }, []);

  // 모든 로딩 상태 제거
  const clearAllLoading = useCallback(() => {
    setLoadingStates([]);
  }, []);

  const isLoading = loadingStates.length > 0;
  const currentLoadingState = loadingStates[loadingStates.length - 1]; // 가장 최근 로딩 상태

  const contextValue: LoadingContextType = {
    isLoading,
    loadingStates,
    showLoading,
    hideLoading,
    updateLoadingProgress,
    clearAllLoading,
  };

  // 커스텀 로더 컴포넌트 렌더링
  const renderLoader = () => {
    if (customLoader) {
      const CustomLoader = customLoader;
      return <CustomLoader loading={isLoading} message={currentLoadingState?.message} />;
    }

    return (
      <Loading
        loading={isLoading}
        overlay={backdrop}
        backdrop={backdrop}
        message={currentLoadingState?.message}
        progress={currentLoadingState?.progress}
        variant={currentLoadingState?.progress !== undefined ? 'linear' : 'circular'}
      />
    );
  };

  // 글로벌 로딩 오버레이 렌더링
  const renderGlobalLoader = () => {
    if (!isLoading) return null;

    const loader = (
      <Backdrop
        open={isLoading}
        sx={{
          zIndex: 9999,
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress color='inherit' size={60} />
        {currentLoadingState?.message && (
          <Typography variant='body1' color='inherit'>
            {currentLoadingState.message}
          </Typography>
        )}
        {currentLoadingState?.progress !== undefined && (
          <Box sx={{ width: '300px', mt: 2 }}>
            <Typography variant='caption' color='inherit' textAlign='center' display='block'>
              {Math.round(currentLoadingState.progress)}%
            </Typography>
          </Box>
        )}
      </Backdrop>
    );

    return disablePortal ? loader : <Portal>{loader}</Portal>;
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {backdrop && renderGlobalLoader()}
    </LoadingContext.Provider>
  );
};

/**
 * Loading Hook
 *
 * 로딩 상태를 관리하기 위한 커스텀 Hook
 *
 * @example
 * ```tsx
 * const { showLoading, hideLoading, isLoading } = useLoading();
 *
 * // 기본 로딩
 * const loadingId = showLoading();
 *
 * // 메시지가 있는 로딩
 * const loadingId = showLoading('데이터를 저장하는 중...');
 *
 * // 진행률 업데이트
 * updateLoadingProgress(50, loadingId);
 *
 * // 로딩 완료
 * hideLoading(loadingId);
 * ```
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

/**
 * API 호출을 위한 Loading Hook
 *
 * API 호출 시 자동으로 로딩 상태를 관리하는 Hook
 *
 * @example
 * ```tsx
 * const { executeWithLoading } = useApiLoading();
 *
 * const handleSave = async () => {
 *   await executeWithLoading(
 *     () => saveData(formData),
 *     '데이터를 저장하는 중...'
 *   );
 * };
 * ```
 */
export const useApiLoading = () => {
  const { showLoading, hideLoading } = useLoading();

  const executeWithLoading = useCallback(
    async function <T>(
      apiCall: () => Promise<T>,
      message?: string,
      onProgress?: (progress: number) => void
    ): Promise<T> {
      const loadingId = showLoading(message);

      try {
        const result = await apiCall();
        return result;
      } finally {
        hideLoading(loadingId);
      }
    },
    [showLoading, hideLoading]
  );

  return { executeWithLoading };
};

/**
 * 편의 메서드들을 제공하는 Hook
 */
export const useLoadingHelpers = () => {
  const { showLoading, hideLoading, updateLoadingProgress } = useLoading();

  return {
    showSaving: (id?: string) => showLoading('저장하는 중...', id),
    showDeleting: (id?: string) => showLoading('삭제하는 중...', id),
    showLoading: (message: string, id?: string) => showLoading(message, id),
    showUploading: (id?: string) => showLoading('업로드하는 중...', id),
    showDownloading: (id?: string) => showLoading('다운로드하는 중...', id),
    hideLoading,
    updateProgress: updateLoadingProgress,
  };
};

export default LoadingProvider;
