/**
 * 점검결과 API
 * 점검결과 작성 및 조회 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// HOD IC ITEM 상세 정보 응답 타입 (실제 API 응답 기반)
export interface HodIcItemDetailResponse {
  id: number;                           // hodIcItemId
  responsibilityId: number;             // 책무 ID
  responsibilityContent: string;        // 책무 내용
  responsibilityDetailId: number;       // 책무상세 ID
  responsibilityDetailContent: string;  // 책무상세 내용
  ledgerOrders: number;                 // 원장순서
  orderStatus?: string;                // 순서상태 (선택적)
  approvalId?: number;                 // 승인 ID (선택적)
  dateExpired: string;                 // 만료일자 (YYYY-MM-DD)
  fieldTypeCd: string;                 // 항목구분
  roleTypeCd: string;                  // 직무구분
  deptCd: string;                      // 부서코드
  icTask: string;                      // 내부통제업무
  measureId: string;                   // 조치 ID
  measureType: string;                 // 조치유형
  measureDesc: string;                 // 조치활동
  periodCd: string;                    // 주기
  supportDoc: string;                  // 관련근거
  checkPeriod: string;                 // 점검시기
  checkWay: string;                    // 점검방법
  proofDoc: string;                    // 증빙자료
}

// 점검결과 저장 요청 타입
export interface AuditResultSaveRequest {
  auditProgMngtDetailIds: number[];    // 점검계획상세 ID 목록
  auditResultStatusCd: string;         // 점검결과
  auditResult: string;                 // 점검결과작성
  beforeAuditYn: string;              // 이전회차 개선과제 동일 여부
  auditDetailContent: string;          // 개선계획 세부내용
  auditDoneDt: string;                // 이행완료 예정일자 (YYYY-MM-DD)
  attachments: AttachmentData[];       // 첨부파일 데이터
}

// 첨부파일 데이터 타입
export interface AttachmentData {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string;  // Base64 encoded
}

// 점검결과 저장 응답 타입
export interface AuditResultSaveResponse {
  success: boolean;
  message: string;
  updatedCount: number;
  attachmentIds: number[];
}

// 점검결과 조회 응답 타입
export interface AuditResultDetailResponse {
  auditProgMngtDetailId: number;
  auditResultStatusCd: string;
  auditResult: string;
  beforeAuditYn: string;
  auditDetailContent: string;
  auditDoneDt: string;
  attachments: ExistingAttachment[];
}

// 기존 첫부파일 타입
export interface ExistingAttachment {
  attachId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDt: string;
}

/**
 * HOD IC ITEM 상세 정보 조회
 * 
 * @param hodIcItemId 부서장 내부통제 항목 ID
 */
export const getHodIcItemDetail = async (
  hodIcItemId: number
): Promise<HodIcItemDetailResponse> => {
  try {
    
    const response = await apiClient.get<HodIcItemDetailResponse>(
      `/inquiry/hod-ic-items/${hodIcItemId}/detail`
    );
    
    // apiClient.get은 이미 데이터를 반환하므로 response.data가 아니라 response 자체를 반환
    return response;
  } catch (error) {
    console.error('HOD IC ITEM 상세 정보 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검결과 저장
 * 
 * @param data 점검결과 데이터
 */
export const saveAuditResult = async (
  data: AuditResultSaveRequest
): Promise<AuditResultSaveResponse> => {
  try {
    
    const response = await apiClient.post<AuditResultSaveResponse>(
      '/inquiry/audit-result/save',
      data
    );
    
    return response;
    
  } catch (error) {
    console.error('점검결과 저장 오류:', error);
    throw error;
  }
};

/**
 * 점검결과 상세 조회
 * 
 * @param auditProgMngtDetailIds 점검계획상세 ID 목록
 */
export const getAuditResultDetail = async (
  auditProgMngtDetailIds: number[]
): Promise<AuditResultDetailResponse[]> => {
  try {
    
    const response = await apiClient.post<AuditResultDetailResponse[]>(
      '/inquiry/audit-result/detail',
      { auditProgMngtDetailIds }
    );
    
    // apiClient가 이미 데이터를 unwrap하므로 response 자체가 데이터일 수 있음
    if (Array.isArray(response)) {
      return response;
    } else if (response && 'data' in response) {
      return (response as any).data;
    } else {
      console.log('예상하지 못한 응답 구조');
      return [];
    }
  } catch (error) {
    console.error('점검결과 상세 조회 오류:', error);
    throw error;
  }
};

/**
 * 점검결과 수정
 * 
 * @param data 점검결과 데이터
 */
export const updateAuditResult = async (
  data: AuditResultSaveRequest
): Promise<AuditResultSaveResponse> => {
  try {
    const response = await apiClient.put<AuditResultSaveResponse>(
      '/inquiry/audit-result/update',
      data
    );
    return response;
  } catch (error) {
    console.error('점검결과 수정 오류:', error);
    throw error;
  }
};

/**
 * 파일을 Base64로 변환하는 유틸리티 함수
 * 
 * @param file 변환할 파일
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // data:mime/type;base64, 부분 제거하고 base64 데이터만 반환
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};