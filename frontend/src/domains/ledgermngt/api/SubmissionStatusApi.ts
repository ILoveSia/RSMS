import type { SelectOption } from '@/shared/types/common';
import apiClient from '@/app/common/api/client';

export interface SubmissionHistoryRow {
  id: number;
  historyCode: string;
  executiveName: string;
  position: string;
  submissionDate: string;
  isModified: boolean;
  modificationDate?: string;
  attachmentFile?: string;
  remarks?: string;
  
  // positions 테이블과 조인된 정보
  positionsId?: number;
  positionsNm?: string;  // positions 테이블의 직책명
  ledgerOrder?: string;
  confirmGubunCd?: string;
  writeDeptCd?: string;
}

export interface RegistrationData {
  submitHistCd: string;
  execofficerId?: string | null; // 직원 ID 추가
  historyCode: SelectOption | null;
  executiveName: SelectOption | null;
  position: SelectOption | null;
  submissionDate: Date;
  attachmentFile: string;
  remarks: SelectOption | null;
  
  // positions 테이블 정보
  positionsId?: number | null;
  positionsNm?: string;
  ledgerOrder?: string;
}

export async function fetchSubmissionHistory(
  startDate?: Date | null,
  endDate?: Date | null,
  ledgerOrder?: string
): Promise<SubmissionHistoryRow[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate.toISOString().split('T')[0]);
  if (endDate) queryParams.append('endDate', endDate.toISOString().split('T')[0]);
  if (ledgerOrder) queryParams.append('ledgerOrder', ledgerOrder);

  const response = await apiClient.get(`/submissions/history?${queryParams.toString()}`);
  if (response.success !== false) {
    const submissions = response.data || response || [];
    // 백엔드 데이터를 프론트엔드 형식으로 변환
    return submissions.map((item: any) => ({
      ...item,
      isModified: false, // 기본값 설정
      modificationDate: undefined, // 현재 사용하지 않음
      position: item.positionsNm || item.position || '', // positions 테이블의 직책명 우선 사용
    }));
  } else {
    throw new Error(response.message || '제출 이력 조회에 실패했습니다.');
  }
}

export async function submitSubmissionHistory(
  data: RegistrationData,
  file?: File
): Promise<{ id: number }> {
  const requestData = {
    submitHistCd: data.submitHistCd || null,
    execofficerId: data.execofficerId || null, // 직원 ID 전달 (문자열 타입)
    rmSubmitDt: data.submissionDate.toISOString().split('T')[0],
    updateYn: 'N',
    rmSubmitRemarks: data.remarks?.value || null,
    positionsId: data.positionsId || null,
    // 프론트엔드 호환성을 위한 필드들 (deprecated)
    historyCode: data.historyCode?.value || null,
    executiveName: data.executiveName?.value || null,
    position: data.position?.value || null,
    submissionDate: data.submissionDate.toISOString().split('T')[0],
    remarks: data.remarks?.value || null,
    attachmentFile: file?.name || null
  };

  console.log('제출 요청 데이터:', requestData);
  
  const response = await apiClient.post<any>('/submissions', requestData);
  console.log('제출 응답:', response);
  
  // API 클라이언트가 자동으로 ApiResponse wrapper를 unwrap하므로
  // response는 이미 SubmissionDto 데이터입니다
  console.log('응답 ID:', response?.id);
  
  if (!response || !response.id) {
    throw new Error('서버에서 유효한 ID를 반환하지 않았습니다.');
  }
  
  return { id: response.id };
}

export async function deleteSubmissionHistory(ids: number[]): Promise<void> {
  const response = await apiClient.delete('/submissions/history', ids);
  if (response.success === false) {
    throw new Error(response.message || '제출 이력 삭제에 실패했습니다.');
  }
}
