import apiClient from '@/app/common/api/client';
import type { ApiResponse } from '@/app/types';

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

// 책무 상세 DTO
export interface ResponsibilityDetailDto {
  responsibilityDetailContent: string;
  keyManagementTasks: string;
  relatedBasis: string;
}

// 책무 생성/수정 요청 DTO
export interface ResponsibilityRequestDto {
  responsibilityContent: string;
  details: ResponsibilityDetailDto[];
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
    try {
      const params = new URLSearchParams();

      if (responsibilityId) {
        params.append('responsibilityId', responsibilityId);
      }

      console.log(`[responsibilityApi] getStatusList 호출 - responsibilityId: ${responsibilityId}`);
      console.log(`[responsibilityApi] API URL: /api/responsibilities/status?${params.toString()}`);

      const response = await apiClient.get<ResponsibilityRow[]>(
        `/api/responsibilities/status?${params.toString()}`
      );

      console.log('[responsibilityApi] getStatusList 응답:', response);

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response || [];
      console.log('[responsibilityApi] getStatusList 결과:', result);

      return result;
    } catch (error) {
      console.error('[responsibilityApi] getStatusList 에러:', error);
      throw error;
    }
  },

  /**
   * 책무 단건 조회
   */
  getById: async (responsibilityId: number): Promise<ResponsibilityRow> => {
    try {
      console.log(`[responsibilityApi] getById 호출 - responsibilityId: ${responsibilityId}`);

      const response = await apiClient.get<ResponsibilityRow>(
        `/api/responsibilities/${responsibilityId}`
      );

      console.log('[responsibilityApi] getById 응답:', response);

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response;
      console.log('[responsibilityApi] getById 결과:', result);

      return result;
    } catch (error) {
      console.error('[responsibilityApi] getById 에러:', error);
      throw error;
    }
  },

  /**
   * 책무 생성
   */
  create: async (data: ResponsibilityRequestDto): Promise<ResponsibilityRow> => {
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
    data: ResponsibilityRequestDto
  ): Promise<ResponsibilityRow> => {
    try {
      console.log(
        `[responsibilityApi] update 호출 - responsibilityId: ${responsibilityId}, data:`,
        data
      );

      const response = await apiClient.put<ResponsibilityRow>(
        `/api/responsibilities/${responsibilityId}`,
        data
      );

      console.log('[responsibilityApi] update 응답:', response);

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response;
      console.log('[responsibilityApi] update 결과:', result);

      return result;
    } catch (error) {
      console.error('[responsibilityApi] update 에러:', error);
      throw error;
    }
  },

  /**
   * 책무 삭제
   */
  delete: async (responsibilityId: number): Promise<void> => {
    try {
      console.log(`[responsibilityApi] delete 호출 - responsibilityId: ${responsibilityId}`);

      await apiClient.delete(`/api/responsibilities/${responsibilityId}`);

      console.log('[responsibilityApi] delete 완료');
    } catch (error) {
      console.error('[responsibilityApi] delete 에러:', error);
      throw error;
    }
  },
};

export default responsibilityApi;
