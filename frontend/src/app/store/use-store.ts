/**
 * 간소화된 Redux Store 훅
 * 기본적인 상태 관리 훅만 제공
 */
import apiClient from '@/app/common/api/client';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

// 기본 상태 타입
interface BaseState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// API 호출을 위한 async thunk 생성
export const createApiAction = <RequestType = unknown, ResponseType = unknown>(
  actionType: string,
  url: string
) => {
  return createAsyncThunk<ResponseType, RequestType>(actionType, async (params: RequestType) => {
    const response = await apiClient.get<ResponseType>(url, { params });
    return response.data;
  });
};

// 간소화된 Redux API 훅
export const useReduxAPI = <ResponseType = unknown>(statePath: string) => {
  const dispatch = useDispatch();
  const pathArray = statePath.split('/');

  // 상태 선택
  const state = useSelector((rootState: unknown) => {
    let current = rootState;
    for (const key of pathArray) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return { data: null, loading: false, error: null };
      }
    }
    return current as BaseState<ResponseType>;
  });

  // API 호출 함수
  const fetch = async (params: unknown) => {
    try {
      // 동적으로 액션 생성 및 디스패치
      const actionType = statePath.replace('/', '_');
      const action = createApiAction(actionType, '/api/users');
      const result = await dispatch(action(params) as any);
      return result;
    } catch (error) {
      console.error('[Redux API] Error:', error);
      throw error;
    }
  };

  // 데이터 설정 함수
  const setData = (data: ResponseType) => {
    dispatch({
      type: `${statePath}/setData`,
      payload: data,
    });
  };

  return {
    data: state,
    fetch,
    setData,
  };
};

// 간단한 상태 훅
export const useReduxState = <T = unknown>(statePath: string) => {
  const dispatch = useDispatch();
  const pathArray = statePath.split('/');

  const data = useSelector((rootState: unknown) => {
    // console.log('🔍 [useReduxState] rootState:', rootState);
    // console.log('🔍 [useReduxState] pathArray:', pathArray);

    let current = rootState;
    for (const key of pathArray) {
      // console.log(`🔍 [useReduxState] 현재 키: ${key}, 현재 값:`, current);
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        // console.log(`🔍 [useReduxState] 키 ${key}를 찾을 수 없음`);
        return null;
      }
    }
    // console.log('🔍 [useReduxState] 최종 결과:', current);
    return current as T;
  });

  const setData = (newData: T) => {
    // 올바른 액션 타입으로 dispatch
    const actionType = `${pathArray.join('/')}/setData`;
    // console.log('📤 [useReduxState] dispatch 액션:', actionType, newData);

    dispatch({
      type: actionType,
      payload: newData,
    });
  };

  return { data, setData };
};

// 직접 API 호출 (Redux 없이)
export const fetchAPI = async <T = unknown>(url: string, params?: unknown): Promise<T> => {
  try {
    const response = await apiClient.get<T>(url, { params });
    return response.data;
  } catch (error) {
    console.error('[API] Error:', error);
    throw error;
  }
};
