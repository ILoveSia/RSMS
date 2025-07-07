import apiClient from '@/app/common/api/client';
import type { ApiResponse } from '@/app/types/common';

// 직책 현황 행 타입
export interface PositionStatusRow {
  positionsId: number;
  positionsNm: string;
  writeDeptNm: string;
  ownerDeptNms: string;
  adminCount: number;
}

// 원장차수 SelectBox 옵션 타입
export interface LedgerOrderSelect {
  value: string;
  label: string;
}

/**
 * Position 도메인 API 서비스 클래스
 */
export class PositionApiService {
  /**
   * 직책 현황 목록 조회
   */
  static async getStatusList(): Promise<PositionStatusRow[]> {
    const response = await apiClient.get<ApiResponse<PositionStatusRow[]>>(
      '/positions/status-list'
    );
    return response?.data || [];
  }

  /**
   * 직책 일괄 삭제
   * @param ids 삭제할 positionsId 배열
   */
  static async deleteBulk(ids: number[]): Promise<void> {
    await apiClient.post(
      '/positions/bulk-delete',
      { positionsIds: ids },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * 원장차수+진행상태 목록 조회 (SelectBox)
   */
  static async getLedgerOrderSelectList(): Promise<LedgerOrderSelect[]> {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: LedgerOrderSelect[];
      timestamp: string;
    }>('/positions/ledger-orders/select-list');

    return response.data || [];
  }
}

// 하위 호환성을 위한 객체 스타일 export
export const positionApi = {
  getStatusList: PositionApiService.getStatusList,
  deleteBulk: PositionApiService.deleteBulk,
  getLedgerOrderSelectList: PositionApiService.getLedgerOrderSelectList,
};

export default positionApi;
