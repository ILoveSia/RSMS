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

// 결재 요청 데이터 타입
export interface ApprovalStartRequest {
  taskTypeCode: string;
  taskId: number;
  title: string;
  description: string;
}

// 첨부파일 정보 타입
export interface AttachmentInfo {
  attachId: number;
  originalName: string;
  storedName: string;
  fileSize: number;
  mimeType?: string;
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
  // 첨부파일 관련 (백엔드와 동기화)
  attachmentCount?: number;
  attachments?: AttachmentInfo[];
  // 결재 연동 필드 - 백엔드에서 COALESCE(ap.appr_stat_cd, 'NONE')로 전달
  approvalStatus?: string; // 'NONE' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'SUBMITTED' | 'APPROVED' 등
  requesterId?: string;
  requesterName?: string;
  currentApproverId?: string;
  currentApproverName?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
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
   * 결재 테이블과 조인하여 문서 검색
   */
  static async searchDocumentsWithApproval(
    searchParams: DocumentSearchParams,
    paginationParams: PaginationParams
  ): Promise<PageResponse<ResponsibilityDocumentDto>> {
    return apiClient.post<PageResponse<ResponsibilityDocumentDto>>(
      `${this.BASE_PATH}/search-with-approval`,
      searchParams,
      { params: paginationParams }
    );
  }

  /**
   * 결재 요청 시작
   */
  static async startApproval(
    documentId: number,
    approvalRequest: ApprovalStartRequest
  ): Promise<void> {
    return apiClient.post(
      `${this.BASE_PATH}/${documentId}/approval/start`,
      approvalRequest
    );
  }

  /**
   * 결재 승인
   */
  static async approveApproval(
    documentId: number,
    comment?: string
  ): Promise<void> {
    return apiClient.post(
      `${this.BASE_PATH}/${documentId}/approval/approve`,
      { comment }
    );
  }

  /**
   * 결재 반려
   */
  static async rejectApproval(
    documentId: number,
    reason: string
  ): Promise<void> {
    return apiClient.post(
      `${this.BASE_PATH}/${documentId}/approval/reject`,
      { reason }
    );
  }

  /**
   * 결재 취소
   */
  static async cancelApproval(documentId: number): Promise<void> {
    return apiClient.post(`${this.BASE_PATH}/${documentId}/approval/cancel`);
  }
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  createdCount: number;
}

// 싱글톤 인스턴스 생성 및 내보내기
export const responsibilityDocumentApi = ResponsibilityDocumentApi;