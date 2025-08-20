/**
 * 인수인계 관리 API 클라이언트
 * 인수인계 관련 모든 API 호출을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 API 호출만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: API 클라이언트 인터페이스 준수
 * - Interface Segregation: 인수인계 관련 API만 제공
 * - Dependency Inversion: HTTP 클라이언트 추상화에 의존
 */

import apiClient from '@/app/common/api/client';

// 페이지네이션 파라미터 타입
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

// 페이지네이션 응답 타입
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
      orderBy: string;
    };
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    direction: string;
    orderBy: string;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Types
export interface HandoverAssignment {  
  handover_type: string,
  handover_from_emp_no: string,
  handover_to_emp_no: string,
  notes?: string,
}

export interface HandoverAssignmentDto extends HandoverAssignment {
  // 백엔드 응답 필드들 (camelCase)
  assignmentId?: number;
  handoverType: string;
  handoverFromEmpNo: string;
  handoverToEmpNo: string;
  handoverFromName?: string;
  handoverToName?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdId?: string;
  updatedId?: string;

  // 프론트엔드에서 추가로 보강하는 필드들
  assignorName?: string;
  assigneeName?: string;
  assignorDeptCd?: string;
  assignorDeptName?: string;
  assigneeDeptCd?: string;
  assigneeDeptName?: string;
  assignorPositionCd?: string;
  assigneePositionCd?: string;
  assignmentType?: string;
  targetDate?: string;
  description?: string;
  handoverFromEmpName?: string;
  handoverToEmpName?: string;
}

export interface HandoverSearchParams {
  positionId?: number;
  handoverType?: string;
  status?: string;
  handoverFromEmpNo?: string;
  handoverToEmpNo?: string;
  startDate?: string;
  endDate?: string;
  deptCd?: string;
  keyword?: string;
  isDelayed?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

export interface HandoverStatistics {
  totalHandovers: number;
  completedHandovers: number;
  inProgressHandovers: number;
  delayedHandovers: number;
  averageProgress: number;
  completionRate: number;
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  completedCount: number;
}

export interface StatusStatistics {
  status: string;
  count: number;
  percentage: number;
}

/**
 * 인수인계 지정 API 클라이언트
 */
export class HandoverApi {
  private static readonly BASE_PATH = '/handover/assignments';

  /**
   * 인수인계 지정 생성
   */
  static async createHandoverAssignment(data: HandoverAssignmentDto): Promise<HandoverAssignmentDto> {
    return apiClient.post<HandoverAssignmentDto>(this.BASE_PATH, data);
  }

  /**
   * 인수인계 지정 수정
   */
  static async updateHandoverAssignment(
    assignmentId: number,
    data: HandoverAssignmentDto
  ): Promise<HandoverAssignmentDto> {
    return apiClient.put<HandoverAssignmentDto>(`${this.BASE_PATH}/${assignmentId}`, data);
  }

  /**
   * 인수인계 지정 조회
   */
  static async getHandoverAssignment(assignmentId: number): Promise<HandoverAssignment> {
    return apiClient.get<HandoverAssignment>(`${this.BASE_PATH}/${assignmentId}`);
  }

  /**
   * 인수인계 지정 삭제
   */
  static async deleteHandoverAssignment(assignmentId: number): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/${assignmentId}`);
  }

  /**
   * 모든 인수인계 지정 조회 (페이징)
   */
  static async getAllHandoverAssignments(
    params: PaginationParams
  ): Promise<PageResponse<HandoverAssignment>> {
    return apiClient.get<PageResponse<HandoverAssignment>>(this.BASE_PATH, { params });
  }

  /**
   * 인수인계 시작
   */
  static async startHandover(assignmentId: number, actorEmpNo: string): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${assignmentId}/start`, null, {
      params: { actorEmpNo }
    });
  }

  /**
   * 인수인계 완료
   */
  static async completeHandover(assignmentId: number, actorEmpNo: string): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${assignmentId}/complete`, null, {
      params: { actorEmpNo }
    });
  }

  /**
   * 인수인계 취소
   */
  static async cancelHandover(
    assignmentId: number,
    actorEmpNo: string,
    reason?: string
  ): Promise<void> {
    const params: any = { actorEmpNo };
    if (reason) {
      params.reason = reason;
    }
    return apiClient.post(`${this.BASE_PATH}/${assignmentId}/cancel`, null, {
      params
    });
  }

  /**
   * 직책별 인수인계 지정 조회
   */
  static async getHandoverAssignmentsByPosition(
    positionId: number
  ): Promise<HandoverAssignmentDto[]> {
    return apiClient.get<HandoverAssignmentDto[]>(`${this.BASE_PATH}/position/${positionId}`);
  }

  /**
   * 사용자별 인수인계 현황 조회
   */
  static async getHandoverAssignmentsByEmployee(empNo: string): Promise<HandoverAssignmentDto[]> {
    return apiClient.get<HandoverAssignmentDto[]>(`${this.BASE_PATH}/employee/${empNo}`);
  }

  /**
   * 상태별 인수인계 지정 조회
   */
  static async getHandoverAssignmentsByStatus(status: string): Promise<HandoverAssignmentDto[]> {
    return apiClient.get<HandoverAssignmentDto[]>(`${this.BASE_PATH}/status/${status}`);
  }

  /**
   * 진행중인 인수인계 조회
   */
  static async getActiveHandovers(): Promise<HandoverAssignmentDto[]> {
    return apiClient.get<HandoverAssignmentDto[]>(`${this.BASE_PATH}/active`);
  }

  /**
   * 지연된 인수인계 조회
   */
  static async getDelayedHandovers(): Promise<HandoverAssignmentDto[]> {
    return apiClient.get<HandoverAssignmentDto[]>(`${this.BASE_PATH}/delayed`);
  }

  /**
   * 복합 조건 검색
   */
  static async searchHandoverAssignments(
    searchParams: HandoverSearchParams,
    paginationParams: PaginationParams
  ): Promise<PageResponse<HandoverAssignmentDto>> {
    return apiClient.post<PageResponse<HandoverAssignmentDto>>(
      `${this.BASE_PATH}/search`,
      searchParams,
      { params: paginationParams }
    );
  }

  /**
   * 인수인계 지정 검색 (프론트엔드 호환)
   */
  static async searchAssignments(
    searchParams: { status?: string; handoverType?: string },
    paginationParams: PaginationParams
  ): Promise<{ data: HandoverAssignmentDto[] }> {
    const params = new URLSearchParams();
    params.append('page', paginationParams.page.toString());
    params.append('size', paginationParams.size.toString());

    if (searchParams.status) {
      params.append('status', searchParams.status);
    }
    if (searchParams.handoverType) {
      params.append('handoverType', searchParams.handoverType);
    }

    const response = await apiClient.get<PageResponse<HandoverAssignmentDto>>(
      `${this.BASE_PATH}/list?${params.toString()}`
    );

    return { data: response.content || [] };
  }

  /**
   * 인수인계 지정 삭제 (프론트엔드 호환)
   */
  static async deleteAssignment(assignmentId: number): Promise<void> {
    return this.deleteHandoverAssignment(assignmentId);
  }

}

// 싱글톤 인스턴스 생성 및 내보내기
export const handoverApi = HandoverApi;