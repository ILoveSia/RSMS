/**
 * 점검결과보고 API
 * 점검결과보고서 CRUD 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// 점검결과보고서 DTO 타입
export interface AuditResultReportDto {
  auditResultReportId?: number;     // 점검결과보고ID
  auditProgMngtId: number;          // 점검계획관리ID
  deptCd: string;                   // 결과보고 작성 부서코드
  deptName?: string;                // 결과보고 작성 부서명 (조회용)
  empNo: string;                    // 결과보고 작성 부서장 사번
  empName?: string;                 // 결과보고 작성 부서장명 (조회용)
  auditResultContent?: string;      // 부서장 종합의견
  empNo01?: string;                 // 1차 승인자 사번
  empName01?: string;               // 1차 승인자명 (조회용)
  auditResultContent01?: string;    // 1차 승인자 종합의견
  empNo02?: string;                 // 2차 승인자 사번
  empName02?: string;               // 2차 승인자명 (조회용)
  auditResultContent02?: string;    // 2차 승인자 종합의견
  reqMemo?: string;                 // 점검항목 요구사항
  auditTitle?: string;              // 점검계획명 (조회용)
  createdAt?: string;               // 생성일시 (조회용)
  updatedAt?: string;               // 수정일시 (조회용)
  createdId?: string;               // 생성자 ID
  updatedId?: string;               // 수정자 ID
}

/**
 * 점검결과보고서 등록
 */
export const createAuditResultReport = async (dto: AuditResultReportDto): Promise<AuditResultReportDto> => {
  try {
    const response = await apiClient.post<AuditResultReportDto>('/audit-result-report', dto);
    return response;
  } catch (error) {
    console.error('점검결과보고서 등록 오류:', error);
    throw error;
  }
};

/**
 * 점검결과보고서 수정
 */
export const updateAuditResultReport = async (auditResultReportId: number, dto: AuditResultReportDto): Promise<AuditResultReportDto> => {
  try {
    const response = await apiClient.put<AuditResultReportDto>(`/audit-result-report/${auditResultReportId}`, dto);
    return response;
  } catch (error) {
    console.error('점검결과보고서 수정 오류:', error);
    throw error;
  }
};

/**
 * 점검결과보고서 상세 조회
 */
export const getAuditResultReport = async (auditResultReportId: number): Promise<AuditResultReportDto> => {
  try {
    const response = await apiClient.get<AuditResultReportDto>(`/audit-result-report/${auditResultReportId}`);
    return response;
  } catch (error) {
    console.error('점검결과보고서 상세 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리ID로 결과보고서 조회
 */
export const getAuditResultReportByAuditProgMngtId = async (auditProgMngtId: number): Promise<AuditResultReportDto> => {
  try {
    const response = await apiClient.get<AuditResultReportDto>(`/audit-result-report/by-audit-prog-mngt/${auditProgMngtId}`);
    return response;
  } catch (error) {
    console.error('점검계획관리ID로 결과보고서 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리ID와 부서코드로 결과보고서 조회
 */
export const getAuditResultReportByAuditProgMngtIdAndDeptCd = async (
  auditProgMngtId: number,
  deptCd: string
): Promise<AuditResultReportDto | null> => {
  try {
    const response = await apiClient.get<AuditResultReportDto>(`/audit-result-report/by-audit-prog-mngt/${auditProgMngtId}/dept/${deptCd}`);
    return response;
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) {
      return null; // 데이터가 없는 경우
    }
    console.error('점검계획관리ID와 부서코드로 결과보고서 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검계획관리ID로 모든 부서 결과보고서 목록 조회
 */
export const getAuditResultReportsByAuditProgMngtId = async (auditProgMngtId: number): Promise<AuditResultReportDto[]> => {
  try {
    const response = await apiClient.get<AuditResultReportDto[]>(`/audit-result-report/list/by-audit-prog-mngt/${auditProgMngtId}`);
    return response;
  } catch (error) {
    console.error('점검계획관리ID로 모든 부서 결과보고서 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검결과보고서 삭제
 */
export const deleteAuditResultReport = async (auditResultReportId: number): Promise<void> => {
  try {
    await apiClient.delete(`/audit-result-report/${auditResultReportId}`);
  } catch (error) {
    console.error('점검결과보고서 삭제 오류:', error);
    throw error;
  }
};