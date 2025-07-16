/**
 * 부서장 내부통제 항목 API 클라이언트
 *
 * 부서장 내부통제 항목 관련 API 호출을 담당합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: API 호출만 담당
 * - Interface Segregation: 필요한 API만 정의
 * - Dependency Inversion: HTTP 클라이언트 추상화에 의존
 */

import { apiClient, type ApiResponse } from '@/app/common/api/client';

// 부서장 내부통제 항목 데이터 타입
export interface HodICItemRow {
  hodIcItemId: number;
  responsibilityId: number;
  responsibilityContent: string;
  deptCd: string;
  fieldTypeCd: string;
  roleTypeCd: string;
  icTask: string;
  measureDesc: string;
  measureType: string;
  periodCd: string;
  supportDoc: string;
  checkPeriod: string;
  checkWay: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus: string;
  ledgerOrder: string;
}

// 부서장 내부통제 항목 상세 정보 타입
export interface HodICItemDetail {
  hodIcItemId: number;
  responsibilityId: number;
  responsibilityContent: string;
  ledgerOrder: string;
  orderStatus: string;
  approvalId?: number;
  approvalStatus?: string;
  dateExpired: string;
  fieldTypeCd: string;
  roleTypeCd: string;
  deptCd: string;
  icTask: string;
  measureDesc: string;
  measureType: string;
  periodCd: string;
  supportDoc: string;
  checkPeriod: string;
  checkWay: string;
  proofDoc: string;
  createdId: string;
  updatedId: string;
  createdAt: string;
  updatedAt: string;
}

// 부서장 내부통제 항목 등록/수정 요청 타입
export interface HodICItemCreateRequest {
  responsibilityId: number;
  ledgerOrder?: string;
  orderStatus?: string;
  dateExpired?: string;
  fieldTypeCd?: string;
  roleTypeCd?: string;
  deptCd?: string;
  icTask?: string;
  measureDesc?: string;
  measureType?: string;
  periodCd?: string;
  supportDoc?: string;
  checkPeriod?: string;
  checkWay?: string;
  proofDoc?: string;
}

/**
 * 부서장 내부통제 항목 API 클라이언트
 */
export const hodICItemApi = {
  /**
   * 부서장 내부통제 항목 현황 조회
   */
  async getHodICItemStatusList(ledgerOrder?: string): Promise<HodICItemRow[]> {
    const params = ledgerOrder ? { ledgerOrder } : {};
    return apiClient.get('/api/hod-ic-items', { params });
  },

  /**
   * 부서장 내부통제 항목 상세 조회
   */
  async getHodICItemById(hodIcItemId: number): Promise<HodICItemDetail> {
    return apiClient.get(`/api/hod-ic-items/${hodIcItemId}`);
  },

  /**
   * 부서장 내부통제 항목 등록
   */
  async createHodICItem(data: HodICItemCreateRequest): Promise<number> {
    return apiClient.post('/api/hod-ic-items', data);
  },

  /**
   * 부서장 내부통제 항목 수정
   */
  async updateHodICItem(
    hodIcItemId: number,
    data: HodICItemCreateRequest
      ): Promise<HodICItemDetail> {
    return apiClient.put(`/api/hod-ic-items/${hodIcItemId}`, data);
  },

  /**
   * 부서장 내부통제 항목 삭제
   */
  async deleteHodICItem(hodIcItemId: number): Promise<void> {
    return apiClient.delete(`/api/hod-ic-items/${hodIcItemId}`);
  },

  /**
   * 부서장 내부통제 항목 다중 삭제
   */
  async deleteMultipleHodICItems(hodIcItemIds: number[]): Promise<void> {
    return apiClient.delete('/api/hod-ic-items/batch', { data: hodIcItemIds });
  },

  /**
   * 결재 승인 요청
   */
  async requestApproval(hodIcItemId: number): Promise<number> {
    return apiClient.post(`/api/hod-ic-items/${hodIcItemId}/approval`);
  },

  /**
   * 작성자 권한 확인
   */
  async isCreatedBy(hodIcItemId: number): Promise<boolean> {
    return apiClient.get(`/api/hod-ic-items/${hodIcItemId}/is-created-by`);
  },
};
