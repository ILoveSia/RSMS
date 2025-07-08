import { apiClient } from '@/app/common/api/client';

// 부서 타입 정의 (백엔드 DTO와 일치)
export interface Department {
  departmentId: string;
  departmentName: string;
  useYn: string;
  isActive: boolean;
  createdId?: string;
  updatedId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 프론트엔드 호환용 간단한 부서 타입
export interface SimpleDepartment {
  deptCode: string;
  deptName: string;
}

// 부서 검색 요청 타입
export interface DepartmentSearchRequest {
  keyword?: string;
  useYn?: string;
  page?: number;
  size?: number;
}

// 부서 생성 요청 타입
export interface DepartmentCreateRequest {
  departmentId: string;
  departmentName: string;
  useYn?: string;
}

// 부서 수정 요청 타입
export interface DepartmentUpdateRequest {
  departmentName?: string;
  useYn?: string;
}

// 페이징 응답 타입
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * 부서 API 클래스
 */
export class DepartmentApi {
  private static readonly BASE_URL = '/departments';

  /**
   * URL 파라미터를 쿼리 스트링으로 변환
   */
  private static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  /**
   * 모든 부서 목록 조회
   */
  static async getAll(): Promise<Department[]> {
    return await apiClient.get<Department[]>(this.BASE_URL);
  }

  /**
   * 활성 부서 목록 조회
   */
  static async getActive(): Promise<Department[]> {
    return await apiClient.get<Department[]>(`${this.BASE_URL}/active`);
  }

  /**
   * 프론트엔드 호환용 부서 목록 조회
   */
  static async getSimple(): Promise<SimpleDepartment[]> {
    return await apiClient.get<SimpleDepartment[]>(`${this.BASE_URL}/simple`);
  }

  /**
   * 부서 검색 (목록)
   */
  static async searchList(params: DepartmentSearchRequest): Promise<Department[]> {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.BASE_URL}/list?${queryString}` : `${this.BASE_URL}/list`;
    return await apiClient.get<Department[]>(url);
  }

  /**
   * 부서 검색 (페이징)
   */
  static async search(params: DepartmentSearchRequest): Promise<PageResponse<Department>> {
    const queryString = this.buildQueryString(params);
    const url = queryString ? `${this.BASE_URL}/search?${queryString}` : `${this.BASE_URL}/search`;
    return await apiClient.get<PageResponse<Department>>(url);
  }

  /**
   * 부서 상세 조회
   */
  static async getById(departmentId: string): Promise<Department> {
    return await apiClient.get<Department>(`${this.BASE_URL}/${departmentId}`);
  }

  /**
   * 부서 생성
   */
  static async create(data: DepartmentCreateRequest): Promise<Department> {
    return await apiClient.post<Department>(this.BASE_URL, data);
  }

  /**
   * 부서 수정
   */
  static async update(departmentId: string, data: DepartmentUpdateRequest): Promise<Department> {
    return await apiClient.put<Department>(`${this.BASE_URL}/${departmentId}`, data);
  }

  /**
   * 부서 삭제 (비활성화)
   */
  static async delete(departmentId: string): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${departmentId}`);
  }

  /**
   * 부서 활성화
   */
  static async activate(departmentId: string): Promise<void> {
    await apiClient.put(`${this.BASE_URL}/${departmentId}/activate`);
  }

  /**
   * 부서명 조회
   */
  static async getName(departmentId: string): Promise<string> {
    return await apiClient.get<string>(`${this.BASE_URL}/${departmentId}/name`);
  }
}

// 기본 export
export default DepartmentApi;
