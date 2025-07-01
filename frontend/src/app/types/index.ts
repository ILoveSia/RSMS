export * from "./common";
export * from "./router";
export * from "./utils";
export * from "./store";
export * from "./components";

/**
 * 회의체 관련 타입 정의
 */
export interface MeetingBody {
  meetingBodyId: string;
  gubun: string;
  meetingName: string;
  meetingPeriod: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingBodySearchRequest {
  gubun?: string;
  meetingName?: string;
  meetingPeriod?: string;
  content?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
