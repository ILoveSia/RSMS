import apiClient from '@/app/common/api/client';
import type { PageableResponse, PositionResponsibility, PositionResponsibilitySearchRequest } from '@/app/types';

/**
 * 직책별 책무 현황 API 모음
 */
export const positionResponsibilityApi = {
  /**
   * 직책별 책무 현황 검색 (페이징)
   */
  search: async (params: PositionResponsibilitySearchRequest): Promise<PageableResponse<PositionResponsibility>> => {
    const queryParams = new URLSearchParams();

    if (params.ledgerOrder) queryParams.append('ledgerOrder', params.ledgerOrder);
    if (params.positionName) queryParams.append('positionName', params.positionName);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const response = await apiClient.get<PageableResponse<PositionResponsibility>>(
      `/position-responsibilities/search?${queryParams.toString()}`
    );
    return response;
  },

  /**
   * 직책별 책무 상세 조회
   */
  getById: async (id: number): Promise<PositionResponsibility> => {
    const response = await apiClient.get<PositionResponsibility>(`/position-responsibilities/${id}`);
    return response;
  },

  /**
   * 직책별 책무 수정
   */
  update: async (id: number, data: Partial<PositionResponsibility>): Promise<PositionResponsibility> => {
    const response = await apiClient.put<PositionResponsibility>(`/position-responsibilities/${id}`, data);
    return response;
  },

  /**
   * 엑셀 업로드
   */
  uploadExcel: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post('/position-responsibilities/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 엑셀 다운로드
   */
  downloadExcel: async (params?: PositionResponsibilitySearchRequest): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.ledgerOrder) queryParams.append('ledgerOrder', params.ledgerOrder);
      if (params.positionName) queryParams.append('positionName', params.positionName);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    }

    const response = await apiClient.get(`/position-responsibilities/download?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * 변경 이력 조회
   */
  getHistory: async (id: number): Promise<PageableResponse<any>> => {
    const response = await apiClient.get<PageableResponse<any>>(`/position-responsibilities/${id}/history`);
    return response;
  }
};

export default positionResponsibilityApi;
