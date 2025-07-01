import apiClient from '@/app/common/api/client';

export interface LedgerOrderSelect {
  value: string;
  label: string;
}

/**
 * 원장차수+진행상태 목록 조회 (SelectBox)
 */
export async function fetchLedgerOrderSelectList(): Promise<LedgerOrderSelect[]> {
  const res = await apiClient.get('/positions/ledger-orders/select-list');
  return res.data?.data || [];
}
