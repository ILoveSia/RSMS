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
): Promise<void> {
  const formData = new FormData();
  if (data.historyCode?.value) formData.append('historyCode', String(data.historyCode.value));
  if (data.executiveName?.value) formData.append('executiveName', String(data.executiveName.value));
  if (data.position?.value) formData.append('position', String(data.position.value));
  formData.append('submissionDate', data.submissionDate.toISOString().split('T')[0]);
  if (file) formData.append('file', file);
  if (data.remarks?.value) formData.append('remarks', String(data.remarks.value));
  
  // positions 테이블 정보 추가
  if (data.positionsId) formData.append('positionsId', String(data.positionsId));

  const response = await apiClient.post('/submissions', formData);
  if (!response.ok) throw new Error('제출 이력 등록에 실패했습니다.');
}

export async function deleteSubmissionHistory(ids: number[]): Promise<void> {
  const response = await apiClient.delete('/submissions/history', ids);
  if (response.success === false) {
    throw new Error(response.message || '제출 이력 삭제에 실패했습니다.');
  }
}
