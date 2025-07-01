import apiClient from '@/app/common/api/client';

/**
 * 직책 일괄 삭제 API
 * @param ids 삭제할 positionsId 배열
 */
export async function deleteBulkPositions(ids: number[]): Promise<void> {
  await apiClient.delete('/positions/bulk-delete', {
    body: JSON.stringify({ positionsIds: ids }),
    headers: { 'Content-Type': 'application/json' },
  });
}
