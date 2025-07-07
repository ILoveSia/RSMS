import apiClient from '@/app/common/api/client';
import type { ApiResponse } from '@/app/types/common';

// 책무 현황 행 타입
export interface ResponsibilityRow {
  responsibilityId: number;
  responsibilityContent: string;
  responsibilityDetailId: number;
  responsibilityDetailContent: string;
  responsibilityMgtSts: string;
  responsibilityRelEvid: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ResponsibilityDbStatusPage용 책무 API 모음
 */
export const responsibilityApi = {
  /**
   * 책무 현황 목록 조회
   * @param responsibilityId 선택적 책무 ID 검색
   */
  getStatusList: async (responsibilityId?: string): Promise<ResponsibilityRow[]> => {
    const params = new URLSearchParams();

    if (responsibilityId) {
      params.append('responsibilityId', responsibilityId);
    }

    const response = await apiClient.get<ApiResponse<ResponsibilityRow[]>>(
      `/api/responsibilities/status?${params.toString()}`
    );

    return response?.data || [];
  },

  /**
   * 책무 단건 조회
   */
  getById: async (responsibilityId: number): Promise<ResponsibilityRow> => {
    const response = await apiClient.get<ApiResponse<ResponsibilityRow>>(
      `/api/responsibilities/${responsibilityId}`
    );

    return response.data;
  },

  /**
   * 책무 생성
   */
  create: async (
    data: Omit<ResponsibilityRow, 'responsibilityId' | 'createdAt' | 'updatedAt'>
  ): Promise<ResponsibilityRow> => {
    const response = await apiClient.post<ApiResponse<ResponsibilityRow>>(
      '/api/responsibilities',
      data
    );

    return response.data;
  },

  /**
   * 책무 수정
   */
  update: async (
    responsibilityId: number,
    data: Partial<ResponsibilityRow>
  ): Promise<ResponsibilityRow> => {
    const response = await apiClient.put<ApiResponse<ResponsibilityRow>>(
      `/api/responsibilities/${responsibilityId}`,
      data
    );

    return response.data;
  },

  /**
   * 책무 삭제
   */
  delete: async (responsibilityId: number): Promise<void> => {
    await apiClient.delete(`/api/responsibilities/${responsibilityId}`);
  },
};

export default responsibilityApi;
