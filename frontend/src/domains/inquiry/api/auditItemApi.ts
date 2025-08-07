/**
 * 점검 현황(항목별) API
 * 점검 현황 항목별 조회 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// 점검 현황(항목별) 조회 응답 타입
export interface AuditItemStatusResponse {
  hodIcItemId: number;              // 부서장 내부통제 항목 ID
  auditProgMngtDetailId: number;    // 점검 계획관리 상세 ID
  responsibilityContent: string;    // 책무 내용
  responsibilityDetailContent: string; // 책무상세 내용
  positionsNm: string;              // 직책명
  deptCd: string;                   // 부서 코드
  fieldTypeCd: string;              // 항목 구분 코드
  roleTypeCd: string;               // 직무 구분 코드
  icTask: string;                   // 내부통제업무
  auditMenId: string;               // 점검자 ID (사원명 또는 ID)
  auditResultStatusCd: string;      // 점검 결과 상태 코드
  roleSumm: string;                 // 책무 개요
  ledgerOrdersHod: number;          // 원장차수
  impPlStatusCd: string;            // 이행완료 예정일자
  auditResult: string;              // 점검결과
  auditDoneDt: string;              // 이행완료 예정일자
  auditDetailcontent: string;      // 점검 세부내용
  auditDoneContent: string;         // 이행결과보고
  auditStatusCd: string;            // 점검상태코드 (audit_prog_mngt 테이블)
  responsibilityId: number;         // 책무 ID
}

// 점검 현황(항목별) 조회 요청 파라미터
export interface AuditItemStatusRequest {
  ledgerOrdersHod?: number;         // 원장차수 (조회조건)
  auditResultStatusCd?: string;     // 점검결과 (조회조건)
}

/**
 * 점검 현황(항목별) 조회
 * 
 * audit_prog_mngt와 audit_prog_mngt_detail 조인 후
 * hod_ic_item과 responsibility, positions 조인
 * role_resp_status는 left outer 조인
 */
export const getAuditItemStatusList = async (
  params: AuditItemStatusRequest
): Promise<AuditItemStatusResponse[]> => {
  try {
    
    const response = await apiClient.get<AuditItemStatusResponse[]>('/audit-prog-mngt/item-status', { 
      params: {
        ledgerOrdersHod: params.ledgerOrdersHod || '',
        auditResultStatusCd: params.auditResultStatusCd || ''
      }
    });
    
    // Spring Boot에서 직접 List<AuditItemStatusResponseDto>를 반환하므로 response.data가 배열이어야 함
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response)) {
      // axios가 직접 배열을 반환하는 경우
      return response;
    } else {
      console.error('예상하지 못한 응답 구조:', response);
      return [];
    }
  } catch (error) {
    console.error('점검 현황(항목별) 조회 오류:', error);
    throw error;
  }
};

/**
 * 전체 점검 현황(항목별) 조회 (조건 없이)
 */
export const getAllAuditItemStatusList = async (): Promise<AuditItemStatusResponse[]> => {
  return getAuditItemStatusList({});
};