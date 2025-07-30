/**
 * 점검계획관리 API
 * 점검계획관리 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// API 공통 응답 타입
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 점검계획관리 현황 조회 응답 타입
export interface AuditProgMngtStatusResponse {
  auditProgMngtCd: string;          // 점검계획코드
  auditProgName: string;            // 점검계획명
  auditTypeCd: string;              // 점검유형코드
  auditTypeName: string;            // 점검유형명
  ledgerOrdersHod: string;          // 책무번호
  auditTarget: string;              // 점검대상
  auditStartDate: string;           // 점검기간 시작일
  auditEndDate: string;             // 점검기간 종료일
  auditTeamLeader: string;          // 점검팀장
  auditTeamMembers: string;         // 점검팀원
  auditStatusCd: string;            // 점검상태코드
  auditStatusName: string;          // 점검상태명
  targetItemCount: number;          // 대상 점검항목수
  approvalId?: number;              // 결재ID
  approvalStatus?: string;          // 결재상태코드
  remarks?: string;                 // 비고
  createdAt: string;                // 등록일자
  updatedAt: string;                // 최종수정일자
  createdId: string;                // 생성자 ID
  updatedId: string;                // 수정자 ID
}

// 점검계획관리 현황 조회 요청 파라미터
export interface AuditProgMngtStatusRequest {
  auditTypeCd?: string;             // 점검유형코드
  auditStatusCd?: string;           // 점검상태코드
  auditTeamLeader?: string;         // 점검팀장
  startDate?: string;               // 시작일 (YYYY-MM-DD)
  endDate?: string;                 // 종료일 (YYYY-MM-DD)
}

// 점검 대상 상세 정보 타입
export interface TargetItemData {
  hodIcItemId: number;             // 부서장 내부통제 항목 ID
  responsibilityId: number;        // 책무 ID
  responsibilityDetailId: number;  // 책무상세 ID
}

// 점검계획관리 등록/수정 요청 타입
export interface AuditProgMngtRequest {
  auditProgMngtCd?: string;         // 점검계획코드 (수정시)
  ledgerOrdersHod: string;          // 책무번호
  auditTitle: string;               // 점검회차명
  auditStartDt: string;             // 점검시작일 (YYYY-MM-DD)
  auditEndDt: string;               // 점검종료일 (YYYY-MM-DD)
  auditStatusCd?: string;           // 점검상태코드
  auditContents?: string;           // 비고
  targetItemIds?: number[];         // 선택된 점검 대상 항목 ID 목록 (호환성 유지)
  targetItemData?: TargetItemData[]; // 선택된 점검 대상 상세 정보
}

/**
 * 점검계획관리 현황 목록 조회
 */
export const getAuditProgMngtStatusList = async (
  params: AuditProgMngtStatusRequest
): Promise<AuditProgMngtStatusResponse[]> => {
  try {
    const response = await apiClient.get<ApiResponse<AuditProgMngtStatusResponse[]>>('/audit-prog-mngt/status', { params });
    
    // 응답 구조 확인 후 적절한 데이터 반환
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('예상하지 못한 응답 구조:', response);
      return [];
    }
  } catch (error) {
    console.error('점검계획관리 현황 조회 오류:', error);
    throw error;
  }
};

/**
 * 전체 점검계획관리 현황 목록 조회
 */
export const getAllAuditProgMngtStatusList = async (
  startDate?: string,
  endDate?: string
): Promise<AuditProgMngtStatusResponse[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  try {
    const response = await apiClient.get<AuditProgMngtStatusResponse[]>('/audit-prog-mngt/status/all', { params });
    console.log('API 전체 응답:', response);
    console.log('API response.data:', response.data);
    console.log('API response.data type:', typeof response.data);
    console.log('API response.data is array:', Array.isArray(response.data));
    
    // Spring Boot에서 직접 List<AuditProgMngtDto>를 반환하므로 response.data가 배열이어야 함
    if (Array.isArray(response)) {
      console.log('응답 데이터 배열 길이:', response.length);
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      // 혹시 ApiResponse 구조로 감싸져 있는 경우
      console.log('ApiResponse 구조로 감싸진 데이터 길이:', (response as any).data.length);
      return (response as any).data;
    } else {
      console.error('예상하지 못한 응답 구조:', response);
      return [];
    }
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리 상세 조회
 */
export const getAuditProgMngtByCode = async (
  auditProgMngtCd: string
): Promise<AuditProgMngtStatusResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<AuditProgMngtStatusResponse>>(`/audit-prog-mngt/${auditProgMngtCd}`);
    
    // 응답 구조 확인 후 적절한 데이터 반환
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('유효하지 않은 응답 구조');
    }
  } catch (error) {
    console.error('점검계획관리 상세 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리 등록
 */
export const createAuditProgMngt = async (
  data: AuditProgMngtRequest
): Promise<{ auditProgMngtCd: string }> => {
  try {
    const response = await apiClient.post<ApiResponse<{ auditProgMngtCd: string }>>('/audit-prog-mngt', data);

    console.log('점검계획관리 등록 응답-------------:', response);
    
    // 응답 구조 확인 후 적절한 데이터 반환
    if (response && (response as any).auditProgMngtCd) {
      return { auditProgMngtCd: (response as any).auditProgMngtCd };
    } else if (response.data && response.data.auditProgMngtCd) {
      return { auditProgMngtCd: response.data.auditProgMngtCd };
    } else {
      throw new Error('유효하지 않은 응답 구조');
    }
  } catch (error) {
    console.error('점검계획관리 등록 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리 수정
 */
export const updateAuditProgMngt = async (
  auditProgMngtCd: string,
  data: AuditProgMngtRequest
): Promise<AuditProgMngtStatusResponse> => {
    try {
    const response = await apiClient.put<ApiResponse<AuditProgMngtStatusResponse>>(`/audit-prog-mngt/${auditProgMngtCd}`, data);
    
    // 응답 구조 확인 후 적절한 데이터 반환
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('유효하지 않은 응답 구조');
    }
  } catch (error) {
    console.error('점검계획관리 수정 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리 삭제
 */
export const deleteAuditProgMngt = async (
  auditProgMngtCd: string
): Promise<void> => {
  try {
    const response = await apiClient.delete(`/audit-prog-mngt/${auditProgMngtCd}`);
  } catch (error) {
    console.error('점검계획관리 삭제 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리 다중 삭제
 */
export const deleteMultipleAuditProgMngt = async (
  auditProgMngtCds: string[]
): Promise<void> => {
  try {
    console.log('삭제 요청 데이터:', { auditProgMngtCds });
    console.log('삭제 요청 auditProgMngtCds:', auditProgMngtCds);
    
    const response = await apiClient.post('/audit-prog-mngt/multiple/delete', {
      auditProgMngtCds
    });
  } catch (error) {
    console.error('점검계획관리 다중 삭제 오류:', error);
    throw error;
  }
};