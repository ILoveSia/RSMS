import apiClient from '@/app/common/api/client';

// 직책 현황 행 타입
export interface PositionStatusRow {
  positionsId: number;
  positionsNm: string;
  writeDeptNm: string;
  ownerDeptNms: string;
  adminCount: number;
  ledgerOrdersTitle: string; // 책무번호 제목
  ledgerOrdersStatusCd: string; // 진행상태 코드
}

// 원장차수 SelectBox 옵션 타입
export interface LedgerOrderSelect {
  value: string;
  label: string;
}

// 직책 검색 결과 타입
export interface PositionSearchResult {
  positionsId: number;
  positionsNm: string;
  ledgerOrders: number;
  confirmGubunCd?: string;
  writeDeptCd?: string;
}

// 직책 상세 정보 타입
export interface PositionDetailDto {
  positionsId: number;
  positionsNm: string;
  ledgerOrders: number;
  confirmGubunCd?: string;
  writeDeptCd?: string;
  createdAt?: string;
  updatedAt?: string;
  createdId?: string;
  updatedId?: string;
}

// 직책 검색 요청 타입
export interface PositionSearchRequest {
  ledgerOrders?: number;
  positionsNm?: string;
  writeDeptCd?: string;
  confirmGubunCd?: string;
}

/**
 * Position 도메인 API 서비스 클래스
 */
export class PositionApiService {
  /**
   * 직책 현황 목록 조회
   */
  static async getStatusList(): Promise<PositionStatusRow[]> {
    const response = await apiClient.get<PositionStatusRow[]>('/positions/status-list');
    return response || [];
  }

  /**
   * 직책 일괄 삭제
   * @param ids 삭제할 positionsId 배열
   */
  static async deleteBulk(ids: number[]): Promise<void> {
    await apiClient.delete('/positions/bulk-delete', { positionsIds: ids });
  }

  /**
   * 원장차수+진행상태 목록 조회 (SelectBox)
   */
  static async getLedgerOrderSelectList(): Promise<LedgerOrderSelect[]> {
    const response = await apiClient.get<LedgerOrderSelect[]>(
      '/positions/ledger-orders/select-list'
    );
    return response || [];
  }

  /**
   * 직책 목록 조회 (검색용)
   */
  static async getPositionList(ledgerOrders?: number): Promise<PositionSearchResult[]> {
    try {
      const params: Record<string, string> = {};
      if (ledgerOrders) {
        params.ledgerOrders = ledgerOrders.toString();
      }

      const response = await apiClient.get<PositionSearchResult[]>('/positions/search', { params });
      return response || [];
    } catch (error) {
      console.error('직책 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 직책 검색 (키워드 기반)
   */
  static async searchPositions(searchRequest: PositionSearchRequest): Promise<PositionSearchResult[]> {
    try {
      const response = await apiClient.post<PositionSearchResult[]>('/positions/search', searchRequest);
      return response || [];
    } catch (error) {
      console.error('직책 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 직책 상세 정보 조회
   */
  static async getPositionDetail(positionsId: number): Promise<PositionDetailDto> {
    try {
      const response = await apiClient.get<PositionDetailDto>(`/positions/${positionsId}`);
      return response;
    } catch (error) {
      console.error('직책 상세 정보 조회 실패:', error);
      throw error;
    }
  }
}

// 하위 호환성을 위한 객체 스타일 export
export const positionApi = {
  getStatusList: PositionApiService.getStatusList,
  deleteBulk: PositionApiService.deleteBulk,
  getLedgerOrderSelectList: PositionApiService.getLedgerOrderSelectList,
  getPositionList: PositionApiService.getPositionList,
  searchPositions: PositionApiService.searchPositions,
  getPositionDetail: PositionApiService.getPositionDetail,
};

export default positionApi;
