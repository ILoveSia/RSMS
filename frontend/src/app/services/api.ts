/**
 * API 서비스 유틸리티
 */

import { config, logger } from '@/app/config/environment';
import type { ApiResponse } from '@/app/types';
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

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
    (config: any) => {
      logger.debug('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
      return config;
    },
    (error: any) => {
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
    (error: any) => {
      logger.error('API Response Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });

      // 에러 메시지 정규화
      const apiError: ApiError = {
        message:
          error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.',
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

export default apiService;
