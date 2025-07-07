import apiClient from '@/app/common/api/client';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(window as any).__HOST_STORE__) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__HOST_STORE__ = {
    main: null,
  };
}

// 호스트 스토어 이름 세팅
export const setGlobalStore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__HOST_STORE_NAME__ = 'main';
};

export const configureAppStore = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducerObj: any
) => {
  const store = configureStore({ reducer: reducerObj });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__HOST_STORE__.main = store;
  return store;
};

// useAPI 훅을 위한 타입 정의
interface FetchOption {
  method?: 'get' | 'post' | 'put' | 'delete';
  headers?: Record<string, string>;
  allowDuplicate?: boolean;
  disableLoadingSpinner?: boolean;
  params?: Record<string, string | number>;
  dataType?: 'single' | 'list'; // 단건 조회 vs 여러건 조회
  extractFirst?: boolean; // 리스트에서 첫 번째 항목만 추출
  saveToStore?: boolean; // Redux Store에 저장할지 여부 (기본값: true)
}

interface FetchParams {
  [key: string]: unknown;
  _fetchOption_?: FetchOption;
}

// 전역 액션 레지스트리 (각 도메인의 store에서 등록)
const actionRegistry: Record<string, { url: string; [key: string]: unknown }> = {};

// 액션 등록 함수 (각 도메인에서 호출)
export const registerActions = (actions: Record<string, { actionType: string; url?: string }>) => {
  Object.entries(actions).forEach(([, action]) => {
    if (action.url) {
      actionRegistry[action.actionType] = { url: action.url };
    }
  });
};

// 로딩 상태 관리
const loadingStates: Record<string, boolean> = {};
const duplicateRequests: Record<string, Promise<unknown>> = {};

/**
 * 공통 API 호출 훅
 * @param actionType 'storeName/actionName' 형태의 액션 타입
 * @returns {data, fetch, setData} 객체
 */
export const useAPI = <T = unknown>(actionType: string) => {
  const dispatch = useDispatch();

  // Redux state에서 데이터 가져오기
  const data = useSelector((rootState: unknown) => {
    const pathArray = actionType.split('/');
    let current = rootState;

    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }

    // 리듀서 구조가 { data, loading, error }인 경우 data 필드 반환
    if (current && typeof current === 'object' && 'data' in current) {
      const stateObj = current as { data: unknown; loading: boolean; error: string | null };
      return stateObj.data as T;
    }

    return current as T;
  });

  // URL 파라미터 치환 함수
  const replaceUrlParams = (url: string, params: Record<string, string | number>): string => {
    let replacedUrl = url;
    Object.entries(params).forEach(([key, value]) => {
      replacedUrl = replacedUrl.replace(`:${key}`, String(value));
    });
    return replacedUrl;
  };

  // API 호출 함수
  const fetch = async (params: FetchParams = {}): Promise<T> => {
    const { _fetchOption_, ...requestData } = params;
    const options: FetchOption = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Accept: 'application/json',
      },
      allowDuplicate: false,
      disableLoadingSpinner: false,
      saveToStore: true, // 기본값: Redux Store에 저장
      ...(_fetchOption_ || {}),
    };

    // 액션 레지스트리에서 URL 가져오기
    const actionConfig = actionRegistry[actionType];
    if (!actionConfig?.url) {
      throw new Error(
        `Action type '${actionType}' not found in registry. Please register it first.`
      );
    }

    let apiUrl = actionConfig.url;

    // Dynamic URL 파라미터 처리
    if (options.params) {
      apiUrl = replaceUrlParams(apiUrl, options.params);
    }

    // 중복 요청 방지
    const requestKey = `${actionType}_${JSON.stringify(params)}`;
    const existingRequest = duplicateRequests[requestKey];
    if (!options.allowDuplicate && existingRequest) {
      return (await existingRequest) as T;
    }

    // 로딩 상태 시작 (saveToStore 옵션이 true인 경우에만)
    if (!options.disableLoadingSpinner && options.saveToStore) {
      loadingStates[actionType] = true;
      dispatch({
        type: `${actionType}/setLoading`,
        payload: true,
      });
    }

    const apiCall = async (): Promise<T> => {
      try {
        let response;

        switch (options.method) {
          case 'get':
            response = await apiClient.get(apiUrl, {
              params: requestData,
              headers: options.headers,
            });
            break;
          case 'post':
            response = await apiClient.post(apiUrl, requestData, {
              headers: options.headers,
            });
            break;
          case 'put':
            response = await apiClient.put(apiUrl, requestData, {
              headers: options.headers,
            });
            break;
          case 'delete':
            response = await apiClient.delete(apiUrl, {
              headers: options.headers,
            });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${options.method}`);
        }

        // 백엔드 ApiResponse 구조 처리
        let responseData = (response as any).data?.data || (response as any).data;

        // 데이터 타입에 따른 처리
        if (options.dataType === 'list' && options.extractFirst) {
          // 리스트에서 첫 번째 항목 추출
          if (responseData && typeof responseData === 'object' && 'content' in responseData) {
            const content = (responseData as { content: unknown[] }).content;
            responseData = content && content.length > 0 ? content[0] : null;
          }
        } else if (options.dataType === 'single') {
          // 단건 조회: 이미 responseData가 올바른 형태
          // 추가 처리 없음
        }
        // dataType이 'list'이고 extractFirst가 false면 전체 리스트 데이터 사용

        // Redux store에 데이터 저장 (saveToStore 옵션이 true인 경우에만)
        if (options.saveToStore) {
          dispatch({
            type: `${actionType}/setData`,
            payload: responseData,
          });

          // 에러 상태 초기화
          dispatch({
            type: `${actionType}/setError`,
            payload: null,
          });
        }

        return responseData as T;
      } catch (error: unknown) {
        // 에러 상태 저장 (saveToStore 옵션이 true인 경우에만)
        if (options.saveToStore) {
          let errorMessage = 'API 호출에 실패했습니다.';
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as {
              response?: { data?: { message?: string } };
              message?: string;
            };
            errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
          }

          dispatch({
            type: `${actionType}/setError`,
            payload: errorMessage,
          });
        }

        throw error;
      } finally {
        // 로딩 상태 종료 (saveToStore 옵션이 true인 경우에만)
        if (!options.disableLoadingSpinner && options.saveToStore) {
          loadingStates[actionType] = false;
          dispatch({
            type: `${actionType}/setLoading`,
            payload: false,
          });
        }

        // 중복 요청 방지 해제
        delete duplicateRequests[requestKey];
      }
    };

    // 중복 요청 방지를 위해 Promise 저장
    if (!options.allowDuplicate) {
      duplicateRequests[requestKey] = apiCall();
      return duplicateRequests[requestKey] as Promise<T>;
    }

    return apiCall();
  };

  // 데이터 직접 설정 함수
  const setData = (newData: T) => {
    dispatch({
      type: `${actionType}/setData`,
      payload: newData,
    });
  };

  return {
    data,
    fetch,
    setData,
  };
};

export * from './helper';
export * from './use-store';
