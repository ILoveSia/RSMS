import apiClient from '@/app/common/api/client';

export interface LedgerOrderSelect {
  value: string;
  label: string;
}

/**
 * 원장차수+진행상태 목록 조회 (SelectBox)
 */
export async function fetchLedgerOrderSelectList(): Promise<LedgerOrderSelect[]> {
  const response = await apiClient.get<{
    success: boolean;
    message: string;
    data: LedgerOrderSelect[];
    timestamp: string;
  }>('/positions/ledger-orders/select-list');

  // apiClient는 API 응답을 직접 반환하므로 response.data가 실제 데이터 배열
  return response.data || [];
}
