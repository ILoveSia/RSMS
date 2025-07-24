/**
 * 간소화된 Redux Slice 유틸리티
 * Redux Toolkit의 표준 방식을 사용한 간단한 slice 생성
 */
import apiClient from '@/app/common/api/client';
import type { IRootState, ISliceObject } from '@/app/types/store';
import type { Draft, PayloadAction } from '@reduxjs/toolkit';
import { combineReducers, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 기본 상태 타입
export interface BaseState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 초기 상태 생성 함수
export const createInitialState = <T = unknown>(): BaseState<T> => ({
  data: null,
  loading: false,
  error: null,
});

// API 호출을 위한 async thunk 생성 함수
export const createApiThunk = <RequestType = unknown, ResponseType = unknown>(
  name: string,
  url: string
) => {
  return createAsyncThunk<ResponseType, RequestType>(name, async (params: RequestType) => {
    const response = await apiClient.get<ResponseType>(url, {
      params: params as Record<string, string | number>,
    });
    return response;
  });
};

// 기본 slice 생성 함수
export const createBaseSlice = <T = unknown>(
  name: string,
  initialState: BaseState<T>,
  asyncThunk?: ReturnType<typeof createApiThunk>
) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      // 데이터 설정
      setData: (state, action: PayloadAction<T | null>) => {
        state.data = action.payload as Draft<T> | null;
        state.error = null;
      },
      // 에러 설정
      setError: (state, action: PayloadAction<string>) => {
        state.error = action.payload;
        state.loading = false;
      },
      // 상태 초기화
      reset: state => {
        state.data = null;
        state.loading = false;
        state.error = null;
      },
    },
    extraReducers: builder => {
      if (asyncThunk) {
        builder
          .addCase(asyncThunk.pending, state => {
            state.loading = true;
            state.error = null;
          })
          .addCase(asyncThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload as Draft<T> | null;
            state.error = null;
          })
          .addCase(asyncThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || '오류가 발생했습니다.';
          });
      }
    },
  });
};

// Root Reducer 생성 함수 추가
export const setRootReducer = (reducers: Record<string, unknown>, storeName: string) => {

  // 각 도메인의 action 객체를 실제 reducer로 변환
  const processedReducers: Record<string, unknown> = {};

  Object.entries(reducers).forEach(([key, value]) => {

    if (value && typeof value === 'object') {
      // action 객체를 reducer 객체로 변환
      const domainReducers: Record<string, unknown> = {};

      Object.entries(value as Record<string, unknown>).forEach(([actionKey, actionValue]) => {
        if (actionValue && typeof actionValue === 'object' && 'actionType' in actionValue) {
          const actionObj = actionValue as { actionType: string; url?: string };

          // 간단한 reducer 생성
          const slice = createSlice({
            name: actionObj.actionType,
            initialState: { data: null as unknown, loading: false, error: null as string | null },
            reducers: {
              setData: (state, action: PayloadAction<unknown>) => {
                state.data = action.payload;
                state.error = null;
              },
              setError: (state, action: PayloadAction<string>) => {
                state.error = action.payload;
                state.loading = false;
              },
              reset: state => {
                state.data = null;
                state.loading = false;
                state.error = null;
              },
            },
          });

          domainReducers[actionKey] = slice.reducer;
        }
      });

      processedReducers[key] = combineReducers(domainReducers);
    } else {
      processedReducers[key] = value;
    }
  });

  return combineReducers(processedReducers);
};

// 기존 호환성을 위한 클래스 (간소화됨)
export default class GenerateSlice {
  private static instance: GenerateSlice;
  public sliceList = {};

  public static getInstance(): GenerateSlice {
    if (!this.instance) {
      this.instance = new GenerateSlice();
    }
    return this.instance;
  }

  // 간소화된 fetcher
  private fetcher = async <ResponseType = unknown>(
    url: string,
    param: object
  ) => {
    try {
      const response = await apiClient.get<ResponseType>(url, {
        params: param as Record<string, string | number>,
      });
      return response;
    } catch (err: Error | unknown) {
      console.error('[Call API] ERROR : ', err);
      throw err;
    }
  };

  // async thunk 생성
  public generateAsyncThunk<RequestType, ResponseType>(url: string, key: string) {
    return createAsyncThunk(key, async (arg?: RequestType) => {
      return this.fetcher<RequestType, ResponseType>(url, arg as object);
    });
  }

  // slice 생성 (기존 호환성 유지)
  public generateSlice<RequestType, ResponseType>(key: string, stateTree: string, url?: string) {
    let asyncThunk: unknown = null;
    let slice = null;

    if (url) {
      asyncThunk = this.generateAsyncThunk<RequestType, ResponseType>(url, key);

      slice = createSlice({
        name: `reducer-${key}`,
        initialState: {
          value: null,
          status: '',
        } as IRootState,
        reducers: {
          setData: (state: IRootState, action: PayloadAction<unknown>) => {
            state.value = action.payload;
          },
        },
        extraReducers: builder => {
          if (asyncThunk) {
            const typedAsyncThunk = asyncThunk as ReturnType<typeof createAsyncThunk>;
            builder
              .addCase(typedAsyncThunk.pending, (state: IRootState) => {
                state.status = 'Loading';
              })
              .addCase(typedAsyncThunk.fulfilled, (state: IRootState, action) => {
                state.status = 'Complete';
                state.value = action.payload;
              })
              .addCase(typedAsyncThunk.rejected, (state: IRootState) => {
                state.status = 'Fail';
              });
          }
        },
      });
    }

    if (!Object.prototype.hasOwnProperty.call(this.sliceList, key)) {
      this.sliceList = Object.assign(this.sliceList, {
        [key]: {
          key,
          url,
          stateTree,
          asyncThunk,
          reducer: slice ? slice.reducer : null,
          actions: slice ? slice.actions : null,
        },
      });
    }
  }

  public getReducer<RequestType, ResponseType>(key: string, stateTree: string, url?: string) {
    const inst = GenerateSlice.getInstance();

    if (url) {
      inst.generateSlice<RequestType, ResponseType>(key, stateTree, url);
    }

    const selectSlice = (this.sliceList as ISliceObject)[key];
    return selectSlice.reducer;
  }

  public getAsyncThunk<T = string>(key: T) {
    if (!(this.sliceList as ISliceObject)[key as string]) {
      console.error(
        `[ERROR] : Store에 (${key}) ActionType설정이 잘못 되었거나, State가 생성 되어 있지 않습니다.`
      );
      return false;
    }
    return (this.sliceList as ISliceObject)[key as string].asyncThunk;
  }
}
