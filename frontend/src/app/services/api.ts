/**
 * API 서비스 유틸리티
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config, logger } from '../config/environment';
import type { 
  MeetingBody, 
  MeetingBodySearchRequest, 
  PageableResponse
} from '../types';

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

// API 에러 타입 정의
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Axios 인스턴스 생성
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${config.api.baseUrl}/api`,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // 세션 쿠키 포함
  });

  // 요청 인터셉터
  instance.interceptors.request.use(
    (config) => {
      logger.debug('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
      return config;
    },
    (error) => {
      logger.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      logger.debug('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      logger.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });

      // 에러 메시지 정규화
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.',
        code: error.response?.data?.code || error.code,
        details: error.response?.data,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// API 인스턴스
export const api = createApiInstance();

// 공통 API 메서드들
export const apiService = {
  // GET 요청
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // POST 요청
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PUT 요청
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // PATCH 요청
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  // DELETE 요청
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await api.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};

// 특정 도메인 API 서비스 예시
export const userApi = {
  getProfile: () => apiService.get('/users/profile'),
  updateProfile: (data: unknown) => apiService.put('/users/profile', data),
};

export const healthApi = {
  check: () => apiService.get('/actuator/health'),
};

/**
 * 회의체 API 클라이언트
 */
export const meetingBodyApi = {
  /**
   * 회의체 검색 (페이징)
   */
  search: async (params: MeetingBodySearchRequest): Promise<PageableResponse<MeetingBody>> => {
    const queryParams = new URLSearchParams();
    
    if (params.gubun) queryParams.append('gubun', params.gubun);
    if (params.meetingName) queryParams.append('meetingName', params.meetingName);
    if (params.meetingPeriod) queryParams.append('meetingPeriod', params.meetingPeriod);
    if (params.content) queryParams.append('content', params.content);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    return apiService.get(`/meeting-bodies/search?${queryParams.toString()}`);
  },

  /**
   * 전체 회의체 목록 조회
   */
  getAll: async (): Promise<MeetingBody[]> => {
    return apiService.get('/meeting-bodies');
  },

  /**
   * 회의체 단건 조회
   */
  getById: async (meetingBodyId: string): Promise<MeetingBody> => {
    return apiService.get(`/meeting-bodies/${meetingBodyId}`);
  },

  /**
   * 구분별 회의체 목록 조회
   */
  getByGubun: async (gubun: string): Promise<MeetingBody[]> => {
    return apiService.get(`/meeting-bodies/gubun/${encodeURIComponent(gubun)}`);
  },

  /**
   * 회의체 생성
   */
  create: async (data: Omit<MeetingBody, 'meetingBodyId' | 'createdAt' | 'updatedAt'>): Promise<MeetingBody> => {
    return apiService.post('/meeting-bodies', data);
  },

  /**
   * 회의체 수정
   */
  update: async (meetingBodyId: string, data: Omit<MeetingBody, 'meetingBodyId' | 'createdAt' | 'updatedAt'>): Promise<MeetingBody> => {
    return apiService.put(`/meeting-bodies/${meetingBodyId}`, data);
  },

  /**
   * 회의체 삭제
   */
  delete: async (meetingBodyId: string): Promise<void> => {
    return apiService.delete(`/meeting-bodies/${meetingBodyId}`);
  },

  /**
   * 여러 회의체 일괄 삭제
   */
  deleteBulk: async (ids: string[]): Promise<void> => {
    return api.delete('/meeting-bodies', { data: ids });
  },
};

import type { CaseStudyDto } from '../types/caseStudy';

export const caseStudyApi = {
  getRecent: async (limit: number = 5): Promise<CaseStudyDto[]> => {
    return apiService.get(`/api/case-studies/recent?limit=${limit}`);
  },
};

export default apiService; 