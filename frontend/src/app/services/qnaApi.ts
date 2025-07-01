/**
 * Q&A API 서비스
 */

import { apiService } from './api';
import type { QnaListResponseDto, QnaSearchRequestDto, PageResponse } from '../types/qna';

export const qnaApi = {
  /**
   * Q&A 목록 조회
   * @param searchRequest 검색 조건
   * @returns Q&A 목록 페이지
   */
  getQnaList: async (searchRequest?: QnaSearchRequestDto): Promise<PageResponse<QnaListResponseDto>> => {
    const params = new URLSearchParams();
    
    if (searchRequest) {
      Object.entries(searchRequest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/qna?${queryString}` : '/qna';
    
    return apiService.get<PageResponse<QnaListResponseDto>>(url);
  },

  /**
   * 최근 Q&A 목록 조회
   * @param limit 조회할 개수 (기본값: 10)
   * @returns 최근 Q&A 목록
   */
  getRecentQnaList: async (limit: number = 10): Promise<QnaListResponseDto[]> => {
    return apiService.get<QnaListResponseDto[]>(`/qna/recent?limit=${limit}`);
  },

  /**
   * 인기 Q&A 목록 조회
   * @param limit 조회할 개수 (기본값: 10)
   * @returns 인기 Q&A 목록
   */
  getPopularQnaList: async (limit: number = 10): Promise<QnaListResponseDto[]> => {
    return apiService.get<QnaListResponseDto[]>(`/qna/popular?limit=${limit}`);
  },

  /**
   * Q&A 상세 조회
   * @param id Q&A ID
   * @returns Q&A 상세 정보
   */
  getQnaDetail: async (id: number) => {
    return apiService.get(`/qna/${id}`);
  },

  /**
   * Q&A 생성
   * @param createRequest 생성 요청 데이터
   * @returns 생성된 Q&A ID
   */
  createQna: async (createRequest: unknown): Promise<number> => {
    return apiService.post<number>('/qna', createRequest);
  },

  /**
   * Q&A 수정
   * @param id Q&A ID
   * @param updateRequest 수정 요청 데이터
   */
  updateQna: async (id: number, updateRequest: unknown): Promise<void> => {
    return apiService.put<void>(`/qna/${id}`, updateRequest);
  },

  /**
   * Q&A 삭제
   * @param id Q&A ID
   */
  deleteQna: async (id: number): Promise<void> => {
    return apiService.delete<void>(`/qna/${id}`);
  },
};

export default qnaApi; 