/**
 * Q&A 관련 타입 정의
 */

// Q&A 상태 const assertion
export const QnaStatus = {
  PENDING: 'PENDING',
  ANSWERED: 'ANSWERED',
  CLOSED: 'CLOSED',
} as const;

export type QnaStatus = (typeof QnaStatus)[keyof typeof QnaStatus];

// Q&A 우선순위 const assertion
export const QnaPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
} as const;

export type QnaPriority = (typeof QnaPriority)[keyof typeof QnaPriority];

// Q&A 목록 응답 DTO
export interface QnaListResponseDto {
  id: number;
  department: string;
  title: string;
  questionerName: string;
  answererName?: string;
  status: QnaStatus;
  statusDescription: string;
  priority: QnaPriority;
  priorityDescription: string;
  category: string;
  isPublic: boolean;
  viewCount: number;
  attachmentCount: number;
  createdAt: string;
  createdAtFormatted: string;
  answeredAt?: string;
  answeredAtFormatted?: string;
}

// Q&A 검색 요청 DTO
export interface QnaSearchRequestDto {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  keyword?: string;
  category?: string;
  status?: QnaStatus;
  priority?: QnaPriority;
  department?: string;
  questionerId?: string;
  answererId?: string;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
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
