import apiClient from '@/app/common/api/client';
import type { CaseStudyDto } from '@/app/types/caseStudy';

export const mainApi = {
  /**
   * 최근 케이스 스터디 목록 조회
   * @param limit 조회할 개수 (기본값: 5)
   */
  getRecentCaseStudies: async (limit: number = 5): Promise<CaseStudyDto[]> => {
    try {
      // API URL 중복 경로 수정: /api는 apiClient에서 자동 추가됨
      const response = await apiClient.get<CaseStudyDto[]>(
        `/case-studies/recent?limit=${limit}`
      );

      // apiClient가 이미 ApiResponse를 unwrap하므로 response 직접 사용
      const result = response || [];

      return result;
    } catch (error) {
      console.error('[mainApi] getRecentCaseStudies 에러:', error);
      throw error;
    }
  },
};

export default mainApi;
