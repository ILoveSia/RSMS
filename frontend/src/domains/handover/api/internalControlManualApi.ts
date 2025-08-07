/**
 * 내부통제 업무메뉴얼 API
 * 내부통제 업무메뉴얼 관련 API 호출을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 업무메뉴얼 API 호출만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: API 인터페이스 준수
 * - Interface Segregation: 내부통제 업무메뉴얼 관련 API만 제공
 * - Dependency Inversion: HTTP 클라이언트에 의존
 */

import apiClient from '@/app/common/api/client';

// 페이지네이션 파라미터 타입
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 페이지 응답 타입
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

// 내부통제 업무메뉴얼 DTO
export interface InternalControlManualDto {
  manualId?: number;
  deptCd: string;
  manualTitle: string;
  manualVersion?: string;
  manualContent?: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  effectiveDate?: string;
  expiryDate?: string;
  authorEmpNo?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // 조인된 데이터 (백엔드에서 제공하는 경우)
  deptName?: string;
  authorName?: string;
}

// 검색 파라미터
export interface ManualSearchParams {
  deptCd?: string;
  status?: string;
  manualTitle?: string;
  authorEmpNo?: string;
  manualVersion?: string;
  effectiveDate?: string;
  expiryDate?: string;
  manualCategory?: string;
  icTaskCategory?: string;
}

/**
 * 내부통제 업무메뉴얼 API 클래스
 */
export class InternalControlManualApi {
  private static readonly BASE_URL = '/handover/manuals';

  /**
   * 내부통제 업무메뉴얼 목록 조회 (페이징)
   */
  static async getAllManuals(pageable: PaginationParams): Promise<Page<InternalControlManualDto>> {
    const params = new URLSearchParams();
    params.append('page', pageable.page.toString());
    params.append('size', pageable.size.toString());
    if (pageable.sort) params.append('sort', pageable.sort);
    
    return apiClient.get(`${this.BASE_URL}?${params.toString()}`);
  }

  /**
   * 내부통제 업무메뉴얼 복합 조건 검색
   */
  static async searchManuals(
    searchParams: ManualSearchParams,
    paginationParams: PaginationParams
  ): Promise<Page<InternalControlManualDto>> {
    const searchDto = {
      deptCd: searchParams.deptCd,
      status: searchParams.status,
      manualTitle: searchParams.manualTitle,
      authorEmpNo: searchParams.authorEmpNo,
      manualVersion: searchParams.manualVersion,
      effectiveDate: searchParams.effectiveDate,
      expiryDate: searchParams.expiryDate,
    };
    
    const params = new URLSearchParams();
    params.append('page', paginationParams.page.toString());
    params.append('size', paginationParams.size.toString());
    if (paginationParams.sort) params.append('sort', paginationParams.sort);
    
    return apiClient.post(`${this.BASE_URL}/search?${params.toString()}`, searchDto);
  }

  /**
   * 상태별 내부통제 업무메뉴얼 조회
   */
  static async getManualsByStatus(status: string): Promise<InternalControlManualDto[]> {
    return apiClient.get(`${this.BASE_URL}/status/${status}`);
  }

  /**
   * 부서별 내부통제 업무메뉴얼 조회
   */
  static async getManualsByDepartment(deptCd: string): Promise<InternalControlManualDto[]> {
    return apiClient.get(`${this.BASE_URL}/department/${deptCd}`);
  }

  /**
   * 내부통제 업무메뉴얼 상세 조회
   */
  static async getManual(manualId: number): Promise<InternalControlManualDto> {
    const response = await apiClient.get(`${this.BASE_URL}/${manualId}`);
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 생성
   */
  static async createManual(manualData: Omit<InternalControlManualDto, 'manualId'>): Promise<InternalControlManualDto> {
    const response = await apiClient.post(this.BASE_URL, manualData);
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 수정
   */
  static async updateManual(manualId: number, manualData: Partial<InternalControlManualDto>): Promise<InternalControlManualDto> {
    const response = await apiClient.put(`${this.BASE_URL}/${manualId}`, manualData);
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 삭제
   */
  static async deleteManual(manualId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${manualId}`);
  }

  /**
   * 내부통제 업무메뉴얼 검토 제출
   */
  static async submitForReview(
    manualId: number,
    reviewerEmpNo: string,
    submitterEmpNo: string
  ): Promise<InternalControlManualDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${manualId}/submit-review`, {
      reviewerEmpNo,
      submitterEmpNo,
    });
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 승인
   */
  static async approveManual(
    manualId: number,
    approverEmpNo: string,
    reviewerEmpNo: string
  ): Promise<InternalControlManualDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${manualId}/approve`, {
      approverEmpNo,
      reviewerEmpNo,
    });
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 발행
   */
  static async publishManual(
    manualId: number,
    publisherEmpNo: string
  ): Promise<InternalControlManualDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${manualId}/publish`, {
      publisherEmpNo,
    });
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 초안으로 되돌리기
   */
  static async revertToDraft(
    manualId: number,
    actorEmpNo: string,
    reason: string
  ): Promise<InternalControlManualDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${manualId}/revert`, {
      actorEmpNo,
      reason,
    });
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 버전 생성
   */
  static async createVersion(
    manualId: number,
    newVersion: string,
    creatorEmpNo: string
  ): Promise<InternalControlManualDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${manualId}/create-version`, {
      newVersion,
      creatorEmpNo,
    });
    return response.data;
  }

  /**
   * 인수인계 지정별 내부통제 업무메뉴얼 목록 조회
   */
  static async getManualsByAssignment(assignmentId: number): Promise<InternalControlManualDto[]> {
    const response = await apiClient.get(`${this.BASE_URL}/assignment/${assignmentId}`);
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 통계 조회
   */
  static async getManualStatistics(): Promise<{
    totalCount: number;
    draftCount: number;
    reviewCount: number;
    approvedCount: number;
    publishedCount: number;
    expiringCount: number;
  }> {
    const response = await apiClient.get(`${this.BASE_URL}/statistics`);
    return response.data;
  }

  /**
   * 내부통제 업무메뉴얼 첨부파일 업로드
   */
  static async uploadAttachment(manualId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    await apiClient.post(`${this.BASE_URL}/${manualId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 내부통제 업무메뉴얼 첨부파일 다운로드
   */
  static async downloadAttachment(manualId: number, attachmentId: number): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/${manualId}/attachments/${attachmentId}`);
    return response as any; // Blob 타입으로 처리
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const internalControlManualApi = InternalControlManualApi;