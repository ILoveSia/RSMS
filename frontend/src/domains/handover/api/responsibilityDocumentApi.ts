/**
 * 책무기술서 API 클라이언트
 * 책무기술서 관련 모든 API 호출을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 API 호출만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: API 클라이언트 인터페이스 준수
 * - Interface Segregation: 책무기술서 관련 API만 제공
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
export interface ResponsibilityDocument {
  documentId?: number;
  documentTitle: string;
  documentVersion: string;
  documentContent: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';
  approvalId?: number;
  effectiveDate?: string;
  expiryDate?: string;
  authorEmpNo: string;
  reviewerEmpNo?: string;
  approverEmpNo?: string;
}

export interface ResponsibilityDocumentDto extends ResponsibilityDocument {
  authorName?: string;
  reviewerName?: string;
  approverName?: string;
  isValid?: boolean;
  isExpiring?: boolean;
  daysUntilExpiry?: number;
  workflowStatus?: string;
  deptCd?: string;
  deptName?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByName?: string;
  updatedByName?: string;
  attachmentCount?: number;
  attachmentFileNames?: string;
}

export interface DocumentSearchParams {
  status?: string;
  authorEmpNo?: string;
  documentTitle?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  documentVersion?: string;
  reviewerEmpNo?: string;
  approverEmpNo?: string;
  isValid?: boolean;
  isExpiring?: boolean;
  daysUntilExpiry?: number;
}

export interface DocumentStatistics {
  totalDocuments: number;
  draftDocuments: number;
  publishedDocuments: number;
  expiringDocuments: number;
  approvalRate: number;
}

export interface DocumentStatusStatistics {
  status: string;
  count: number;
  percentage: number;
}

/**
 * 책무기술서 API 클라이언트
 */
export class ResponsibilityDocumentApi {
  private static readonly BASE_PATH = '/handover/documents';

  /**
   * 책무기술서 생성
   */
  static async createDocument(data: ResponsibilityDocument): Promise<ResponsibilityDocument> {
    return apiClient.post<ResponsibilityDocument>(this.BASE_PATH, data);
  }

  /**
   * 책무기술서 수정
   */
  static async updateDocument(
    documentId: number,
    data: ResponsibilityDocument
  ): Promise<void> {
    return apiClient.put<void>(`${this.BASE_PATH}/${documentId}`, data);
  }

  /**
   * 책무기술서 조회
   */
  static async getDocument(documentId: number): Promise<ResponsibilityDocument> {
    return apiClient.get<ResponsibilityDocument>(`${this.BASE_PATH}/${documentId}`);
  }

  /**
   * 책무기술서 삭제
   */
  static async deleteDocument(documentId: number): Promise<void> {
    return apiClient.delete(`${this.BASE_PATH}/${documentId}`);
  }

  /**
   * 모든 책무기술서 조회 (페이징)
   */
  static async getAllDocuments(
    params: PaginationParams
  ): Promise<PageResponse<ResponsibilityDocument>> {
    return apiClient.get<PageResponse<ResponsibilityDocument>>(this.BASE_PATH, { params });
  }

  /**
   * 검토 단계로 제출
   */
  static async submitForReview(
    documentId: number,
    reviewerEmpNo: string,
    actorEmpNo: string
  ): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${documentId}/submit`, null, {
      params: { reviewerEmpNo, actorEmpNo }
    });
  }

  /**
   * 문서 승인
   */
  static async approveDocument(
    documentId: number,
    approverEmpNo: string,
    actorEmpNo: string
  ): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${documentId}/approve`, null, {
      params: { approverEmpNo, actorEmpNo }
    });
  }

  /**
   * 문서 발행
   */
  static async publishDocument(documentId: number, actorEmpNo: string): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${documentId}/publish`, null, {
      params: { actorEmpNo }
    });
  }

  /**
   * 초안으로 되돌리기
   */
  static async revertToDraft(
    documentId: number,
    actorEmpNo: string,
    reason?: string
  ): Promise<void> {
    const params: any = { actorEmpNo };
    if (reason) {
      params.reason = reason;
    }
    return apiClient.post(`${this.BASE_PATH}/${documentId}/revert`, null, {
      params
    });
  }

  /**
   * 문서 버전 업데이트
   */
  static async updateVersion(
    documentId: number,
    newVersion: string,
    actorEmpNo: string
  ): Promise<ResponsibilityDocument> {
    return apiClient.post<ResponsibilityDocument>(
      `${this.BASE_PATH}/${documentId}/version`,
      null,
      { params: { newVersion, actorEmpNo } }
    );
  }



  /**
   * 상태별 책무기술서 조회
   */
  static async getDocumentsByStatus(status: string): Promise<ResponsibilityDocumentDto[]> {
    return apiClient.get<ResponsibilityDocumentDto[]>(`${this.BASE_PATH}/status/${status}`);
  }

  /**
   * 작성자별 책무기술서 조회
   */
  static async getDocumentsByAuthor(authorEmpNo: string): Promise<ResponsibilityDocumentDto[]> {
    return apiClient.get<ResponsibilityDocumentDto[]>(`${this.BASE_PATH}/author/${authorEmpNo}`);
  }



  /**
   * 유효한 문서 조회
   */
  static async getValidDocuments(): Promise<ResponsibilityDocumentDto[]> {
    return apiClient.get<ResponsibilityDocumentDto[]>(`${this.BASE_PATH}/valid`);
  }

  /**
   * 만료 예정 문서 조회
   */
  static async getExpiringDocuments(daysFromNow = 30): Promise<ResponsibilityDocumentDto[]> {
    return apiClient.get<ResponsibilityDocumentDto[]>(`${this.BASE_PATH}/expiring`, {
      params: { daysFromNow }
    });
  }

  /**
   * 승인 대기중인 문서 조회
   */
  static async getPendingApprovalDocuments(): Promise<ResponsibilityDocumentDto[]> {
    return apiClient.get<ResponsibilityDocumentDto[]>(`${this.BASE_PATH}/pending-approval`);
  }

  /**
   * 복합 조건 검색
   */
  static async searchDocuments(
    searchParams: DocumentSearchParams,
    paginationParams: PaginationParams
  ): Promise<PageResponse<ResponsibilityDocumentDto>> {
    return apiClient.post<PageResponse<ResponsibilityDocumentDto>>(
      `${this.BASE_PATH}/search`,
      searchParams,
      { params: paginationParams }
    );
  }

  /**
   * 문서 통계
   */
  static async getDocumentStatistics(): Promise<DocumentStatistics> {
    return apiClient.get<DocumentStatistics>(`${this.BASE_PATH}/statistics`);
  }

  /**
   * 월별 생성 통계
   */
  static async getMonthlyCreationStatistics(): Promise<MonthlyStatistics[]> {
    return apiClient.get<MonthlyStatistics[]>(`${this.BASE_PATH}/statistics/monthly`);
  }

  /**
   * 상태별 통계
   */
  static async getStatusStatistics(): Promise<DocumentStatusStatistics[]> {
    return apiClient.get<DocumentStatusStatistics[]>(`${this.BASE_PATH}/statistics/status`);
  }
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  createdCount: number;
}

// 싱글톤 인스턴스 생성 및 내보내기
export const responsibilityDocumentApi = ResponsibilityDocumentApi;