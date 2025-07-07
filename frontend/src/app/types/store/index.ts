// RequestMethod 타입 정의
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IRootState<T = unknown> {
  value: T | null;
  status: 'Loading' | 'Complete' | 'Fail' | '';
}

export interface IActionObject {
  actionType: string;
  url?: string;
  type?: 'async' | 'sync';
  useState?: boolean;
}

export interface ISliceObject {
  [key: string]: {
    key: string;
    url: string;
    stateTree: string;
    asyncThunk: any;
    reducer: any;
  };
}

export interface IGenerateSlice {
  sliceList: ISliceObject;
  generateAsyncThunk(url: string, key: string, methodType?: RequestMethod): any;
  generateSlice(key: string, stateTree: string, url?: string): any;
  getnerateSyncSlice(key: string, stateTree: string): any;
  getReducer(key: string, stateTree: string, url?: string): any;
  getAsyncThunk<T = string>(utl: T, methodType?: RequestMethod): any;
}
