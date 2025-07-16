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
}

export interface RegistrationData {
  historyCode: SelectOption | null;
  executiveName: SelectOption | null;
  position: SelectOption | null;
  submissionDate: Date;
  attachmentFile: string;
  remarks: SelectOption | null;
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

  const response = await fetch(`/api/submission-history?${queryParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('제출 이력 조회에 실패했습니다.');
  return await response.json();
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

  const response = await apiClient.post('/api/submissions', formData);
  if (!response.ok) throw new Error('제출 이력 등록에 실패했습니다.');
}

export async function deleteSubmissionHistory(ids: number[]): Promise<void> {
  const response = await fetch(`/api/submission-history`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('제출 이력 삭제에 실패했습니다.');
}
