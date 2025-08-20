/**
 * 미흡상황 현황 API
 * 미흡상황 현황 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// API 공통 응답 타입
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 미흡상황 현황 조회 응답 타입 (백엔드 DTO와 일치)
export interface DeficiencyStatusResponse {
  // audit_prog_mngt_detail 테이블 관련 필드 (실제 DB 컬럼)
  auditProgMngtDetailId: number;    // 점검계획상세 ID
  auditProgMngtId: number;          // 점검계획 ID
  hodIcItemId?: number;             // 부서장 내부통제 항목 ID
  auditMenId?: string;              // 점검자 지정
  auditResult?: string;             // 점검 결과 작성
  auditResultStatusCd?: string;     // 점검결과상태코드
  beforeAuditYn?: string;           // 이전회차 동일건 여부
  auditDetailContent?: string;      // 개선계획 세부내용
  auditDoneDt?: string;             // 이행완료 예정일자
  auditDoneContent?: string;        // 이행결과 내용
  impPlStatusCd?: string;           // 개선계획상태코드

  // 화면 표시용 필드
  id: number;                       // auditProgMngtDetailId 매핑용
  deficiencyContent: string;        // 미흡사항 (audit_result 매핑)
  improvementPlan: string;          // 개선계획
  implementationResult: string;     // 이행결과
  inspector: string;                // 점검자
  inspectorId?: string;             // 점검자 ID
  writeDate: string;                // 작성일자
  dueDate?: string;                 // 완료예정일
  completionDate?: string;          // 완료일자
  statusCode: string;               // 상태코드
  statusName: string;               // 상태명

  // audit_prog_mngt 테이블 관련 필드
  auditProgMngtCd?: string;         // 점검계획코드
  ledgerOrdersHod?: number;         // 책무번호
  auditTitle?: string;              // 점검회차명
  auditStartDt?: string;            // 점검시작일
  auditEndDt?: string;              // 점검종료일
  auditStatusCd?: string;           // 점검상태코드
  auditContents?: string;           // 점검내용

  // 추가 정보 필드
  inspectionRound: string;          // 점검회차
  department: string;               // 부서
  priority?: string;                // 우선순위
  remarks?: string;                 // 비고
  createdAt?: string;               // 등록일자
  updatedAt?: string;               // 최종수정일자
  createdId?: string;               // 생성자 ID
  updatedId?: string;               // 수정자 ID
}

// 미흡상황 현황 조회 요청 파라미터
export interface DeficiencyStatusRequest {
  inspectionRound?: string;         // 점검회차
  department?: string;              // 부서
  statusCode?: string;              // 상태코드
  inspector?: string;               // 점검자
  startDate?: string;               // 시작일 (YYYY-MM-DD)
  endDate?: string;                 // 종료일 (YYYY-MM-DD)
  priority?: string;                // 우선순위
}

// 미흡상황 등록/수정 요청 타입
export interface DeficiencyRequest {
  id?: number;                      // 미흡상황 ID (수정시)
  inspectionRound: string;          // 점검회차
  department: string;               // 부서
  deficiencyContent: string;        // 미흡사항
  improvementPlan: string;          // 개선계획
  implementationResult?: string;    // 이행결과
  inspector: string;                // 점검자
  inspectorId: string;              // 점검자 ID
  dueDate?: string;                 // 완료예정일
  completionDate?: string;          // 완료일자
  statusCode: string;               // 상태코드
  priority?: string;                // 우선순위
  remarks?: string;                 // 비고
}

// 개선계획 변경 요청 타입
export interface ImprovementPlanUpdateRequest {
  ids: number[];                    // 미흡상황 ID 목록
  improvementPlan: string;          // 새로운 개선계획
  dueDate?: string;                 // 완료예정일
  remarks?: string;                 // 비고
}

// 이행결과 작성 요청 타입
export interface ImplementationResultRequest {
  ids: number[];                    // 미흡상황 ID 목록
  implementationResult: string;     // 이행결과
  completionDate?: string;          // 완료일자
  statusCode: string;               // 상태코드
  remarks?: string;                 // 비고
}

// 이행결과 업데이트 요청 타입 (Backend API 호출용)
export interface ImplementationResultUpdateRequest {
  auditProgMngtDetailId: number;    // 점검 계획관리 상세 ID
  auditDoneContent: string;         // 이행결과 내용
}

// 이행결과 업데이트 응답 타입 (Backend API 응답)
export interface ImplementationResultUpdateResponse {
  success: boolean;                 // 업데이트 성공 여부
  message: string;                  // 메시지
  auditProgMngtDetailId: number;    // 업데이트된 점검 계획관리 상세 ID
  impPlStatusCd: string;            // 업데이트된 imp_pl_status_cd 값
}

// 승인 요청 타입
export interface ApprovalRequest {
  ids: number[];                    // 미흡상황 ID 목록
  approvalStatus: string;           // 승인상태
  approvalComments?: string;        // 승인의견
}


/**
 * 전체 미흡상황 현황 목록 조회
 */
export const getAllDeficiencyStatusList = async (
  startDate?: string,
  endDate?: string
): Promise<DeficiencyStatusResponse[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  try {
    const response = await apiClient.get<DeficiencyStatusResponse[]>('/deficiency-status/all', { params });

    // apiClient가 이미 응답을 처리했으므로 response가 직접 배열이어야 함
    if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  } catch (error) {
    console.error('API 호출 에러:', error);
    throw error;
  }
};

/**
 * 미흡상황 수정
 */
export const updateDeficiencyStatus = async (
  id: number,
  data: DeficiencyRequest
): Promise<DeficiencyStatusResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<DeficiencyStatusResponse>>(`/deficiency-status/${id}`, data);

    // 응답 구조 확인 후 적절한 데이터 반환
    if (response.data && (response.data as any).data) {
      return (response.data as any).data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('유효하지 않은 응답 구조');
    }
  } catch (error) {
    console.error('미흡상황 수정 오류:', error);
    throw error;
  }
};

/**
 * 미흡상황 삭제
 */
export const deleteDeficiencyStatus = async (
  id: number
): Promise<void> => {
  try {
    await apiClient.delete(`/deficiency-status/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * 미흡상황 다중 삭제
 */
export const deleteMultipleDeficiencyStatus = async (
  ids: number[]
): Promise<void> => {
  try {
    await apiClient.post('/deficiency-status/multiple/delete', {
      ids
    });
  } catch (error) {
    throw error;
  }
};

/**
 * 이행결과 작성
 */
export const updateImplementationResult = async (
  data: ImplementationResultRequest
): Promise<void> => {
  try {
    await apiClient.post('/deficiency-status/implementation-result/update', data);
  } catch (error) {
    throw error;
  }
};

/**
 * 이행결과 업데이트 (ImplementationResultDialog용)
 */
const updateImplementationResultDialog = async (
  data: ImplementationResultUpdateRequest
): Promise<ImplementationResultUpdateResponse> => {
  try {
    const response = await apiClient.put<ImplementationResultUpdateResponse>(
      '/inquiry/audit-result/implementation-result', 
      data
    );
    return response;
  } catch (error) {
    console.error('이행결과 업데이트 오류:', error);
    throw error;
  }
};

/**
 * 승인 처리
 */
export const approveDeficiencyStatus = async (
  data: ApprovalRequest
): Promise<void> => {
  try {
    await apiClient.post('/deficiency-status/approve', data);
  } catch (error) {
    throw error;
  }
};

/**
 * 점검회차 목록 조회
 */
export const getInspectionRoundList = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await apiClient.get<ApiResponse<string[]>>('/deficiency-status/inspection-rounds');

    const rounds = response.data && (response.data as any).data ? (response.data as any).data : response.data || [];

    return (rounds as string[]).map((round: string) => ({
      value: round,
      label: round
    }));
  } catch (error) {
    // 에러 시 기본값 반환
    return [
      { value: 'ERROR', label: 'ERROR' }
    ];
  }
};

/**
 * 부서 목록 조회
 */
export const getDepartmentList = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await apiClient.get<ApiResponse<string[]>>('/deficiency-status/departments');

    const departments = response.data && (response.data as any).data ? (response.data as any).data : response.data || [];

    return [
      { value: '전체', label: '전체' },
      ...(departments as string[]).map((dept: string) => ({
        value: dept,
        label: dept
      }))
    ];
  } catch (error) {
    // 에러 시 기본값 반환
    return [
      { value: 'ERROR', label: 'ERROR' }
    ];
  }
};


// 개별 export 추가
export { updateImplementationResultDialog };

export default {
  getAllDeficiencyStatusList,
  updateDeficiencyStatus,
  deleteDeficiencyStatus,
  deleteMultipleDeficiencyStatus,
  updateImplementationResult,
  updateImplementationResultDialog,
  approveDeficiencyStatus,
  getInspectionRoundList,
  getDepartmentList,
};