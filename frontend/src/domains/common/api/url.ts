/**
 * 공통코드 관련 API URL 정의
 */
const url = {
  // 공통코드 조회
  GET_ALL_COMMON_CODES: '/api/common-codes',                    // 모든 공통코드 조회
  GET_USABLE_COMMON_CODES: '/api/common-codes/usable',          // 사용 가능한 공통코드 조회
  GET_GROUPED_COMMON_CODES: '/api/common-codes/grouped',        // 그룹별 공통코드 조회
  GET_USABLE_GROUPED_COMMON_CODES: '/api/common-codes/grouped/usable', // 사용 가능한 그룹별 공통코드 조회
  GET_GROUP_CODES: '/api/common-codes/groups',                  // 그룹코드 목록 조회
  GET_USABLE_GROUP_CODES: '/api/common-codes/groups/usable',    // 사용 가능한 그룹코드 목록 조회
  
  // 특정 그룹 조회
  GET_COMMON_CODES_BY_GROUP: (groupCode: string) => `/api/common-codes/group/${groupCode}`,
  GET_USABLE_COMMON_CODES_BY_GROUP: (groupCode: string) => `/api/common-codes/group/${groupCode}/usable`,
  
  // 특정 코드 조회
  GET_COMMON_CODE: (groupCode: string, code: string) => `/api/common-codes/${groupCode}/${code}`,
  CHECK_COMMON_CODE_EXISTS: (groupCode: string, code: string) => `/api/common-codes/${groupCode}/${code}/exists`,
  
  // 검색
  SEARCH_COMMON_CODES: '/api/common-codes/search',
  SEARCH_COMMON_CODES_BY_NAME: (codeName: string) => `/api/common-codes/search/name/${codeName}`,
  
  // 관리
  CREATE_COMMON_CODE: '/api/common-codes',
  ACTIVATE_COMMON_CODE: (groupCode: string, code: string) => `/api/common-codes/${groupCode}/${code}/activate`,
  DEACTIVATE_COMMON_CODE: (groupCode: string, code: string) => `/api/common-codes/${groupCode}/${code}/deactivate`,
  
  // 통계
  GET_GROUP_COUNT: (groupCode: string) => `/api/common-codes/group/${groupCode}/count`,
} as const;

export default url; 