/**
 * 간소화된 Redux Store 헬퍼
 * 기본적인 store 설정 기능만 제공
 */
import { combineReducers } from "@reduxjs/toolkit";
import type { Reducer } from "@reduxjs/toolkit";

// 간소화된 루트 리듀서 설정 함수
export function setRootReducer(storeConfig: Record<string, unknown>) {
  const reducers: Record<string, Reducer> = {};
  
  // 각 도메인 스토어를 루트 리듀서에 추가
  for (const [storeName, storeActions] of Object.entries(storeConfig)) {
    if (storeActions && typeof storeActions === 'object') {
      const storeReducers: Record<string, Reducer> = {};
      
      // 각 액션에 대한 리듀서 생성
      for (const [actionName, actionConfig] of Object.entries(storeActions)) {
        if (actionConfig && typeof actionConfig === 'object') {
          const config = actionConfig as { actionType: string; url?: string };
          
          // 간단한 리듀서 생성
          storeReducers[actionName] = (state = { data: null, loading: false, error: null }, action) => {
            switch (action.type) {
              case `${config.actionType}/pending`:
                return { ...state, loading: true, error: null };
              case `${config.actionType}/fulfilled`:
                return { ...state, loading: false, data: action.payload, error: null };
              case `${config.actionType}/rejected`:
                return { ...state, loading: false, error: action.error?.message || '오류가 발생했습니다.' };
              case `${config.actionType}/setData`:
                return { ...state, data: action.payload, error: null };
              default:
                return state;
            }
          };
        }
      }
      
      reducers[storeName] = combineReducers(storeReducers);
    }
  }
  
  return reducers;
}

// Store의 State 트리를 재귀로 찾는 함수
export const getStateByPath = <T = unknown>(
  state: unknown,
  path: string[]
): T | null => {
  let current = state;
  
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      console.error(`[Store] Path not found: ${path.join('/')}`);
      return null;
    }
  }
  
  return current as T;
};
