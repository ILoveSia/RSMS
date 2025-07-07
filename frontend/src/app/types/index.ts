export * from './common';
export * from './components';
export * from './router';
export * from './store';
export * from './utils';

/**
 * 애플리케이션 공통 타입 정의
 */

// 공통 API 응답 타입을 import (중복 제거)
export type { ApiError, ApiResponse } from '@/app/common/api/client';

/**
 * 공통 컴포넌트 타입 정의
 */
export interface IComponent<T = unknown> {
  (props: T): React.JSX.Element;
}

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

export interface PositionResponsibility {
  id: number;
  classification: '핵심' | '중요' | '일반';
  positionId: string;
  positionName: string;
  ledgerOrder: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
  lastModifiedDate: string;
}

export interface PositionResponsibilitySearchRequest {
  ledgerOrder?: string;
  positionName?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
