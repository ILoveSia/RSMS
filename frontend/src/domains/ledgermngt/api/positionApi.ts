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
  ledgerOrdersId: number;
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

// 책무번호 생성 응답 타입
export interface LedgerOrdersGenerateResponse {
  ledgerOrdersId: number;
  ledgerOrdersTitle: string;
  ledgerOrdersStatusCd: string;
  previousTitle: string;
  message: string;
}

// 책무번호 상태 확인 응답 타입
export interface LedgerOrdersStatusCheckResponse {
  currentLedgerOrdersId?: number;
  currentTitle?: string;
  currentStatusCd?: string;
  canGenerate: boolean;
  message: string;
  hasData: boolean;
}

/**
 * Position 도메인 API 서비스 클래스
 */
export class PositionApiService {
  /**
   * 직책 현황 목록 조회
   */
  static async getStatusList(ledgerOrdersId?: number): Promise<PositionStatusRow[]> {
    const url = ledgerOrdersId 
      ? `/positions/status-list?ledgerOrdersId=${ledgerOrdersId}`
      : '/positions/status-list';
    const response = await apiClient.get<PositionStatusRow[]>(url);
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

  /**
   * 현재 원장차수 상태 확인
   */
  static async checkLedgerOrderStatus(): Promise<LedgerOrdersStatusCheckResponse> {
    try {
      const response = await apiClient.get<LedgerOrdersStatusCheckResponse>('/ledger-orders/status');
      return response;
    } catch (error) {
      console.error('책무번호 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 책무번호(원장차수) 생성
   */
  static async generateLedgerOrder(): Promise<LedgerOrdersGenerateResponse> {
    try {
      const response = await apiClient.post<LedgerOrdersGenerateResponse>('/ledger-orders/generate', {});
      return response;
    } catch (error) {
      console.error('책무번호 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 원장차수 제목으로 ledger_orders_id 조회
   */
  static async getLedgerOrdersIdByTitle(title: string): Promise<number> {
    try {
      const response = await apiClient.get<{ledgerOrdersId: number}>(`/ledger-orders/id-by-title?title=${encodeURIComponent(title)}`);
      return response.ledgerOrdersId;
    } catch (error) {
      console.error('원장차수 ID 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 원장차수 확정 처리 (상태를 P2로 변경)
   */
  static async confirmLedgerOrder(ledgerOrderValue: string): Promise<{message: string}> {
    try {
      const response = await apiClient.put<{message: string}>(`/ledger-orders/confirm`, {
        ledgerOrderValue: ledgerOrderValue
      });
      return response;
    } catch (error) {
      console.error('원장차수 확정 실패:', error);
      throw error;
    }
  }

  /**
   * 원장차수 확정취소 처리 (상태를 P1로 변경)
   */
  static async cancelConfirmLedgerOrder(ledgerOrderValue: string): Promise<{message: string}> {
    try {
      const response = await apiClient.put<{message: string}>(`/ledger-orders/cancel-confirm`, {
        ledgerOrderValue: ledgerOrderValue
      });
      return response;
    } catch (error) {
      console.error('원장차수 확정취소 실패:', error);
      throw error;
    }
  }

  /**
   * 원장차수 상태 업데이트 (ledger_orders_status_cd 변경)
   */
  static async updateLedgerOrderStatus(ledgerOrdersId: number, statusCd: string): Promise<{message: string}> {
    try {
      const response = await apiClient.put<{message: string}>(`/ledger-orders/${ledgerOrdersId}/status`, {
        ledgerOrdersStatusCd: statusCd
      });
      return response;
    } catch (error) {
      console.error('원장차수 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 직책별 책무 확정 처리 (P2 → P3)
   */
  static async confirmPositionResponsibility(ledgerOrderValue: string): Promise<{message: string}> {
    try {
      const response = await apiClient.put<{message: string}>(`/ledger-orders/position-responsibility-confirm`, {
        ledgerOrderValue: ledgerOrderValue
      });
      return response;
    } catch (error) {
      console.error('직책별 책무 확정 실패:', error);
      throw error;
    }
  }

  /**
   * 직책별 책무 확정취소 처리 (P3 → P2)
   */
  static async cancelPositionResponsibility(ledgerOrderValue: string): Promise<{message: string}> {
    try {
      const response = await apiClient.put<{message: string}>(`/ledger-orders/position-responsibility-cancel`, {
        ledgerOrderValue: ledgerOrderValue
      });
      return response;
    } catch (error) {
      console.error('직책별 책무 확정취소 실패:', error);
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
  checkLedgerOrderStatus: PositionApiService.checkLedgerOrderStatus,
  generateLedgerOrder: PositionApiService.generateLedgerOrder,
  getLedgerOrdersIdByTitle: PositionApiService.getLedgerOrdersIdByTitle,
  confirmLedgerOrder: PositionApiService.confirmLedgerOrder,
  cancelConfirmLedgerOrder: PositionApiService.cancelConfirmLedgerOrder,
  updateLedgerOrderStatus: PositionApiService.updateLedgerOrderStatus,
  confirmPositionResponsibility: PositionApiService.confirmPositionResponsibility,
  cancelPositionResponsibility: PositionApiService.cancelPositionResponsibility,
};

export default positionApi;
