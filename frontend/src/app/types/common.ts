/**
 * 공통코드 관련 타입 정의
 */

// 공통코드 기본 타입
export interface CommonCode {
  groupCode: string;
  code: string;
  codeName: string;
  description?: string;
  sortOrder: number;
  useYn: string;
  createdAt: string;
  updatedAt: string;
}

// 그룹별 공통코드 타입
export interface CommonCodeGroup {
  groupCode: string;
  groupName: string;
  codes: CommonCode[];
}

// 공통코드 검색 요청 타입
export interface CommonCodeSearchRequest {
  groupCode?: string;
  code?: string;
  codeName?: string;
  useYn?: string;
  sortBy?: string;
  sortDirection?: string;
}

// 공통코드 생성 요청 타입
export interface CommonCodeCreateRequest {
  groupCode: string;
  code: string;
  codeName: string;
  description?: string;
  sortOrder?: number;
  useYn?: string;
}

// API 응답 타입은 공통 클라이언트에서 import
// export interface ApiResponse<T> - 중복 제거됨

// 공통코드 관련 상태 타입
export interface CommonCodeState {
  // 모든 공통코드
  allCodes: CommonCode[] | null;
  // 사용 가능한 공통코드
  usableCodes: CommonCode[] | null;
  // 그룹별 공통코드
  groupedCodes: CommonCodeGroup[] | null;
  // 사용 가능한 그룹별 공통코드
  usableGroupedCodes: CommonCodeGroup[] | null;
  // 그룹코드 목록
  groupCodes: string[] | null;
  // 사용 가능한 그룹코드 목록
  usableGroupCodes: string[] | null;
  // 로딩 상태
  loading: boolean;
  // 에러 메시지
  error: string | null;
}
