/**
 * 점검자 관련 API
 * 점검자 조회 및 지정 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// 점검자 정보 인터페이스
export interface AuditorInfo {
  empNo: string;        // 사번
  empName: string;      // 성명
  deptName: string;     // 부서명
  positionName: string; // 직급명
  email?: string;       // 이메일
  phoneNo?: string;     // 전화번호
  useYn: string;        // 사용여부
}

// 점검자 검색 요청 인터페이스
export interface AuditorSearchRequest {
  empName?: string;     // 성명 (검색조건)
  deptCode?: string;    // 부서코드 (검색조건)
  useYn?: string;       // 사용여부 (기본값: Y)
}

// 점검자 지정 요청 인터페이스
export interface AuditorAssignmentRequest {
  hodIcItemIds: string[];   // 부서장 내부통제 항목 ID 배열
  auditorEmpNo: string;     // 지정할 점검자 사번
  auditorName: string;      // 지정할 점검자 성명
}

// 점검자 지정 응답 인터페이스
export interface AuditorAssignmentResponse {
  updatedCount: number;     // 업데이트된 건수
  auditorEmpNo: string;     // 지정된 점검자 사번
  auditorName: string;      // 지정된 점검자 성명
  message: string;          // 처리 결과 메시지
}

/**
 * 성명으로 점검자 검색
 * 
 * @param empName 성명 (부분일치)
 * @returns 점검자 목록
 */
export const searchAuditorsByName = async (empName: string): Promise<AuditorInfo[]> => {
  try {
    console.log('점검자 검색 요청:', { empName });
    
    const response = await apiClient.get<AuditorInfo[]>('/auditors/search', {
      params: { empName: empName || '' }
    });
    
    console.log('점검자 검색 응답:', response);
    
    // ApiResponse 구조 처리
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data || [];
    }
    
    // 직접 배열인 경우
    if (Array.isArray(response)) {
      return response;
    }
    
    console.error('예상하지 못한 응답 구조:', response);
    return [];
    
  } catch (error) {
    console.error('점검자 검색 오류:', error);
    throw error;
  }
};

/**
 * 점검자 상세 검색
 * 
 * @param searchRequest 검색 조건
 * @returns 점검자 목록
 */
export const searchAuditors = async (searchRequest: AuditorSearchRequest): Promise<AuditorInfo[]> => {
  try {
    console.log('점검자 상세 검색 요청:', searchRequest);
    
    const response = await apiClient.post<AuditorInfo[]>('/auditors/search', searchRequest);
    
    console.log('점검자 상세 검색 응답:', response);
    
    // ApiResponse 구조 처리
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data || [];
    }
    
    // 직접 배열인 경우
    if (Array.isArray(response)) {
      return response;
    }
    
    console.error('예상하지 못한 응답 구조:', response);
    return [];
    
  } catch (error) {
    console.error('점검자 상세 검색 오류:', error);
    throw error;
  }
};

/**
 * 점검자 지정
 * 
 * @param assignmentRequest 점검자 지정 요청
 * @returns 점검자 지정 결과
 */
export const assignAuditor = async (assignmentRequest: AuditorAssignmentRequest): Promise<AuditorAssignmentResponse> => {
  try {
    console.log('점검자 지정 요청:', assignmentRequest);
    
    const response = await apiClient.post<AuditorAssignmentResponse>('/auditors/assign', assignmentRequest);
    
    console.log('점검자 지정 응답:', response);
    
    // ApiResponse 구조 처리
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as any).data;
    }
    
    // 직접 객체인 경우
    if (response && typeof response === 'object') {
      return response as AuditorAssignmentResponse;
    }
    
    throw new Error('점검자 지정 응답 구조가 올바르지 않습니다.');
    
  } catch (error) {
    console.error('점검자 지정 오류:', error);
    throw error;
  }
};