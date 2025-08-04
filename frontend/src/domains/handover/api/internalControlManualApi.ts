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

// 내부통제 업무메뉴얼 DTO
export interface InternalControlManualDto {
  manualId?: number;
  assignmentId: number;
  manualTitle: string;
  manualContent: string;
  manualVersion?: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  
  // 부서 정보
  deptCd?: string;
  deptName?: string;
  
  // 작성자 정보
  authorEmpNo?: string;
  authorName?: string;
  
  // 검토자 정보
  reviewerEmpNo?: string;
  reviewerName?: string;
  
  // 승인자 정보
  approverEmpNo?: string;
  approverName?: string;
  
  // 일정 정보
  effectiveDate?: string;
  expiryDate?: string;
  
  // 상태 정보
  isValid?: boolean;
  isExpiring?: boolean;
  daysUntilExpiry?: number;
  workflowStatus?: string;
  
  // 첨부파일
  attachmentCount?: number;
  
  // 감사 필드
  createdAt?: string;
  updatedAt?: string;
}

// 검색 파라미터
export interface ManualSearchParams {
  assignmentId?: number;
  deptCd?: string;
  status?: string;
  manualTitle?: string;
  authorEmpNo?: string;
  manualVersion?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

/**
 * 내부통제 업무메뉴얼 API 클래스
 */
export class InternalControlManualApi {
  private static readonly BASE_URL = '/api/handover/manuals';

  /**
   * 내부통제 업무메뉴얼 목록 조회
   */
  static async searchManuals(
    searchParams: ManualSearchParams,
    paginationParams: PaginationParams
  ): Promise<ApiResponse<InternalControlManualDto[]>> {
    const params = new URLSearchParams();
    
    // 검색 조건 추가
    if (searchParams.assignmentId) params.append('assignmentId', searchParams.assignmentId.toString());
    if (searchParams.deptCd) params.append('deptCd', searchParams.deptCd);
    if (searchParams.status) params.append('status', searchParams.status);
    if (searchParams.manualTitle) params.append('manualTitle', searchParams.manualTitle);
    if (searchParams.authorEmpNo) params.append('authorEmpNo', searchParams.authorEmpNo);
    if (searchParams.manualVersion) params.append('manualVersion', searchParams.manualVersion);
    if (searchParams.effectiveDate) params.append('effectiveDate', searchParams.effectiveDate);
    if (searchParams.expiryDate) params.append('expiryDate', searchParams.expiryDate);
    
    // 페이지네이션 파라미터 추가
    params.append('page', paginationParams.page.toString());
    params.append('size', paginationParams.size.toString());
    if (paginationParams.sort) params.append('sort', paginationParams.sort);
    
    return apiClient.get(`${this.BASE_URL}?${params.toString()}`);
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