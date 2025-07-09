import apiClient from '@/app/common/api/client';
import type { CaseStudyDto } from '@/app/types/caseStudy';
import type { QnaListResponseDto } from '@/app/types/qna';

/**
 * MainPage용 API 모음
 */
export const mainApi = {
  /**
   * 최근 QnA 목록 조회
   * @param limit 조회할 개수 (기본값: 5)
   */
  getRecentQnaList: async (limit: number = 5): Promise<QnaListResponseDto[]> => {
    try {
      console.log(`[mainApi] getRecentQnaList 호출 - limit: ${limit}`);

      const response = await apiClient.get<QnaListResponseDto[]>(`/qna/recent?limit=${limit}`);

      console.log('[mainApi] getRecentQnaList 응답:', response);

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response || [];
      console.log('[mainApi] getRecentQnaList 결과:', result);

      return result;
    } catch (error) {
      console.error('[mainApi] getRecentQnaList 에러:', error);
      throw error;
    }
  },

  /**
   * 최근 케이스 스터디 목록 조회
   * @param limit 조회할 개수 (기본값: 5)
   */
  getRecentCaseStudies: async (limit: number = 5): Promise<CaseStudyDto[]> => {
    try {
      console.log(`[mainApi] getRecentCaseStudies 호출 - limit: ${limit}`);

      const response = await apiClient.get<CaseStudyDto[]>(
        `/api/case-studies/recent?limit=${limit}`
      );

      console.log('[mainApi] getRecentCaseStudies 응답:', response);

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response || [];
      console.log('[mainApi] getRecentCaseStudies 결과:', result);

      return result;
    } catch (error) {
      console.error('[mainApi] getRecentCaseStudies 에러:', error);
      throw error;
    }
  },

  /**
   * 대시보드 통계 정보 조회 (향후 확장용)
   */
  getDashboardStats: async (): Promise<any> => {
    try {
      console.log('[mainApi] getDashboardStats 호출');

      // 향후 대시보드 통계 API 구현 시 사용
      const response = await apiClient.get('/api/dashboard/stats');

      console.log('[mainApi] getDashboardStats 응답:', response);
      return response;
    } catch (error) {
      console.error('[mainApi] getDashboardStats 에러:', error);
      throw error;
    }
  },
};

export default mainApi;
