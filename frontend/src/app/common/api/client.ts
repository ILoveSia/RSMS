/**
 * 통합 API 클라이언트
 * 모든 API 호출을 중앙에서 관리하고 공통 설정을 제공합니다.
 *
 * 책임:
 * - API 기본 설정 관리
 * - 요청/응답 인터셉터 제공
 * - 에러 처리 표준화
 * - 인증 토큰 관리
 *
 * 기존 axios 기반 구현을 대체하는 통합 클라이언트입니다.
 */

import { config, logger } from '@/app/config/environment';

/**
 * API 응답 타입 정의
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

/**
 * API 에러 타입 정의
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

/**
 * 요청 옵션 타입 정의
 */
export interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
  params?: Record<string, string | number>;
}

/**
 * API 클라이언트 클래스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: API 통신만 담당
 * - Open/Closed: 인터셉터를 통한 확장 가능
 * - Liskov Substitution: 표준 fetch API와 호환
 * - Interface Segregation: 필요한 메서드만 노출
 * - Dependency Inversion: 설정에 의존하여 구체적 구현에 의존하지 않음
 */
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = '/api'; // API 요청의 기본 경로를 /api로 설정
    this.defaultTimeout = config.api.timeout;
  }

  /**
   * API URL 생성
   * @param endpoint - API 엔드포인트
   * @param params - 쿼리 파라미터
   * @returns 완전한 API URL
   */
  private createUrl(endpoint: string, params?: Record<string, string | number>): string {
    const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.replace(/^\//, '');
    let url = `${cleanBaseUrl}/${cleanEndpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * 요청 헤더 생성
   * @param options - 요청 옵션
   * @returns 헤더 객체
   */
  private createHeaders(options: RequestOptions = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 인증이 필요한 경우 토큰 추가 (향후 구현)
    if (!options.skipAuth) {
      // const token = getAuthToken();
      // if (token) {
      //   headers.Authorization = `Bearer ${token}`;
      // }
    }

    return headers;
  }

  /**
   * 타임아웃 처리를 위한 AbortController 생성
   * @param timeout - 타임아웃 시간 (ms)
   * @returns AbortController
   */
  private createAbortController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /**
   * 응답 처리
   * @param response - fetch 응답
   * @returns 파싱된 응답 데이터
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    let data: unknown;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        message: typeof data === 'string' ? data : 'API 요청이 실패했습니다.',
        status: response.status,
        details: data,
      };

      logger.error('API 요청 실패:', error);
      throw error;
    }

    // 백엔드 ApiResponse 래퍼 unwrap
    if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
      const apiResponse = data as { data: T; success: boolean; message?: string };
      if (apiResponse.success) {
        logger.debug('API 응답 성공:', { status: response.status, data: apiResponse.data });
        return apiResponse.data;
      } else {
        const error: ApiError = {
          message: apiResponse.message || 'API 요청이 실패했습니다.',
          status: response.status,
          details: data,
        };
        logger.error('API 비즈니스 로직 실패:', error);
        throw error;
      }
    }

    logger.debug('API 응답 성공:', { status: response.status, data });
    return data as T;
  }

  /**
   * 에러 처리
   * @param error - 발생한 에러
   * @param endpoint - 요청한 엔드포인트
   */
  private handleError(error: unknown, endpoint: string): never {
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError: ApiError = {
        message: '요청 시간이 초과되었습니다.',
        status: 408,
        code: 'TIMEOUT',
      };
      logger.error('API 타임아웃:', { endpoint, timeout: this.defaultTimeout });
      throw timeoutError;
    }

    if (error && typeof error === 'object' && 'status' in error) {
      throw error; // 이미 처리된 ApiError
    }

    const unknownError: ApiError = {
      message: '알 수 없는 오류가 발생했습니다.',
      status: 500,
      code: 'UNKNOWN_ERROR',
      details: error,
    };

    logger.error('API 알 수 없는 오류:', { endpoint, error });
    throw unknownError;
  }

  /**
   * 공통 요청 메서드
   * @param endpoint - API 엔드포인트
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...requestOptions } = options;
    const url = this.createUrl(endpoint, params);
    const timeout = options.timeout || this.defaultTimeout;
    const controller = this.createAbortController(timeout);

    const finalRequestOptions: RequestInit = {
      ...requestOptions,
      headers: this.createHeaders(requestOptions),
      credentials: 'include', // 세션 쿠키 포함
      signal: controller.signal,
    };

    logger.debug('API 요청 시작:', {
      method: requestOptions.method || 'GET',
      url,
      options: finalRequestOptions,
    });

    try {
      const response = await fetch(url, finalRequestOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  /**
   * GET 요청
   * @param endpoint - API 엔드포인트
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  async get<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 요청
   * @param endpoint - API 엔드포인트
   * @param data - 요청 데이터
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 요청
   * @param endpoint - API 엔드포인트
   * @param data - 요청 데이터
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 요청
   * @param endpoint - API 엔드포인트
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  async delete<T>(
    endpoint: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH 요청
   * @param endpoint - API 엔드포인트
   * @param data - 요청 데이터
   * @param options - 요청 옵션
   * @returns 응답 데이터
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();
export default apiClient;
