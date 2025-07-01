/**
 * 간소화된 API 클라이언트
 * 기본적인 HTTP 요청 기능만 제공
 */
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

// API 클라이언트 클래스
class ApiClient {
  private static instance: ApiClient;
  public axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: '', // 프록시를 통해 호출하므로 빈 문자열 (vite.config.ts의 프록시 설정 활용)
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // 세션 쿠키 포함
    });

    // 요청 인터셉터 - 로깅
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
        console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터 - 로깅 및 에러 처리
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const fullUrl = response.config.baseURL ? 
          `${response.config.baseURL}${response.config.url}` : 
          response.config.url;
        console.log(`[API Response] ${response.status} ${fullUrl}`);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', error.response?.status, error.message);
        // CORS 에러 특별 처리
        if (error.code === 'ERR_NETWORK') {
          console.error('[CORS Error] 백엔드 서버의 CORS 설정을 확인하세요.');
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient();
    }
    return this.instance;
  }

  // GET 요청
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  // POST 요청
  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  // PUT 요청
  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  // DELETE 요청
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  // 일반 요청 (기존 호환성 유지)
  public async request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  // 에러 처리 (기존 호환성 유지)
  public handleError(error: Error | unknown, context?: unknown): void {
    console.error('[API Error]', error, context);
  }
}

// 싱글톤 인스턴스 내보내기
export default ApiClient.getInstance();
