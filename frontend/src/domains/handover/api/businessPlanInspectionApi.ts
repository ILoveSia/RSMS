/**
 * 사업계획 점검 API
 * 사업계획 점검 관련 API 호출을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 API 호출만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: API 인터페이스 준수
 * - Interface Segregation: 사업계획 점검 관련 API만 제공
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

// 사업계획 점검 DTO
export interface BusinessPlanInspectionDto {
  inspectionId?: number;
  assignmentId: number;
  inspectionTitle: string;
  inspectionType: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'SPECIAL';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // 계획 정보
  planYear: number;
  planQuarter?: number;
  targetDept?: string;
  targetDeptName?: string;
  
  // 점검 내용
  inspectionScope: string;
  inspectionCriteria: string;
  inspectionItems: string;
  
  // 일정 정보
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // 담당자 정보
  inspectorEmpNo?: string;
  inspectorName?: string;
  managerEmpNo?: string;
  managerName?: string;
  
  // 진행 정보
  progressRate?: number;
  currentPhase?: string;
  phaseDescription?: string;
  
  // 결과 정보
  overallScore?: number;
  overallGrade?: string;
  totalIssueCount?: number;
  criticalIssueCount?: number;
  majorIssueCount?: number;
  minorIssueCount?: number;
  
  // 완료 정보
  completionReport?: string;
  recommendations?: string;
  followUpActions?: string;
  
  // 첨부파일
  attachmentCount?: number;
  
  // 감사 필드
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// 점검 항목 DTO
export interface InspectionItemDto {
  itemId?: number;
  inspectionId: number;
  itemCode: string;
  itemName: string;
  itemDescription: string;
  category: string;
  weight: number;
  
  // 점검 결과
  score?: number;
  grade?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_APPLICABLE';
  
  // 발견사항
  findings?: string;
  issues?: string;
  recommendations?: string;
  
  // 담당자
  assigneeEmpNo?: string;
  assigneeName?: string;
  
  // 일정
  dueDate?: string;
  completedDate?: string;
  
  // 감사 필드
  createdAt?: string;
  updatedAt?: string;
}

// 검색 파라미터
export interface InspectionSearchParams {
  assignmentId?: number;
  inspectionType?: string;
  status?: string;
  planYear?: number;
  planQuarter?: number;
  targetDept?: string;
  inspectorEmpNo?: string;
  inspectionTitle?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
}

/**
 * 사업계획 점검 API 클래스
 */
export class BusinessPlanInspectionApi {
  private static readonly BASE_URL = '/api/handover/inspections';

  /**
   * 사업계획 점검 목록 조회
   */
  static async searchInspections(
    searchParams: InspectionSearchParams,
    paginationParams: PaginationParams
  ): Promise<ApiResponse<BusinessPlanInspectionDto[]>> {
    const params = new URLSearchParams();
    
    // 검색 조건 추가
    if (searchParams.assignmentId) params.append('assignmentId', searchParams.assignmentId.toString());
    if (searchParams.inspectionType) params.append('inspectionType', searchParams.inspectionType);
    if (searchParams.status) params.append('status', searchParams.status);
    if (searchParams.planYear) params.append('planYear', searchParams.planYear.toString());
    if (searchParams.planQuarter) params.append('planQuarter', searchParams.planQuarter.toString());
    if (searchParams.targetDept) params.append('targetDept', searchParams.targetDept);
    if (searchParams.inspectorEmpNo) params.append('inspectorEmpNo', searchParams.inspectorEmpNo);
    if (searchParams.inspectionTitle) params.append('inspectionTitle', searchParams.inspectionTitle);
    if (searchParams.plannedStartDate) params.append('plannedStartDate', searchParams.plannedStartDate);
    if (searchParams.plannedEndDate) params.append('plannedEndDate', searchParams.plannedEndDate);
    
    // 페이지네이션 파라미터 추가
    params.append('page', paginationParams.page.toString());
    params.append('size', paginationParams.size.toString());
    if (paginationParams.sort) params.append('sort', paginationParams.sort);
    
    return apiClient.get(`${this.BASE_URL}?${params.toString()}`);
  }

  /**
   * 사업계획 점검 상세 조회
   */
  static async getInspection(inspectionId: number): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.get(`${this.BASE_URL}/${inspectionId}`);
    return response.data;
  }

  /**
   * 사업계획 점검 생성
   */
  static async createInspection(inspectionData: Omit<BusinessPlanInspectionDto, 'inspectionId'>): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(this.BASE_URL, inspectionData);
    return response.data;
  }

  /**
   * 사업계획 점검 수정
   */
  static async updateInspection(inspectionId: number, inspectionData: Partial<BusinessPlanInspectionDto>): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.put(`${this.BASE_URL}/${inspectionId}`, inspectionData);
    return response.data;
  }

  /**
   * 사업계획 점검 삭제
   */
  static async deleteInspection(inspectionId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${inspectionId}`);
  }

  /**
   * 사업계획 점검 시작
   */
  static async startInspection(
    inspectionId: number,
    actorEmpNo: string
  ): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${inspectionId}/start`, {
      actorEmpNo,
    });
    return response.data;
  }

  /**
   * 사업계획 점검 완료
   */
  static async completeInspection(
    inspectionId: number,
    actorEmpNo: string,
    completionData: {
      completionReport: string;
      recommendations?: string;
      followUpActions?: string;
    }
  ): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${inspectionId}/complete`, {
      actorEmpNo,
      ...completionData,
    });
    return response.data;
  }

  /**
   * 사업계획 점검 취소
   */
  static async cancelInspection(
    inspectionId: number,
    actorEmpNo: string,
    reason: string
  ): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${inspectionId}/cancel`, {
      actorEmpNo,
      reason,
    });
    return response.data;
  }

  /**
   * 점검 진행률 업데이트
   */
  static async updateProgress(
    inspectionId: number,
    progressRate: number,
    currentPhase: string,
    phaseDescription: string,
    actorEmpNo: string
  ): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${inspectionId}/progress`, {
      progressRate,
      currentPhase,
      phaseDescription,
      actorEmpNo,
    });
    return response.data;
  }

  /**
   * 점검 항목 목록 조회
   */
  static async getInspectionItems(inspectionId: number): Promise<InspectionItemDto[]> {
    const response = await apiClient.get(`${this.BASE_URL}/${inspectionId}/items`);
    return response.data;
  }

  /**
   * 점검 항목 생성
   */
  static async createInspectionItem(
    inspectionId: number,
    itemData: Omit<InspectionItemDto, 'itemId' | 'inspectionId'>
  ): Promise<InspectionItemDto> {
    const response = await apiClient.post(`${this.BASE_URL}/${inspectionId}/items`, {
      ...itemData,
      inspectionId,
    });
    return response.data;
  }

  /**
   * 점검 항목 수정
   */
  static async updateInspectionItem(
    inspectionId: number,
    itemId: number,
    itemData: Partial<InspectionItemDto>
  ): Promise<InspectionItemDto> {
    const response = await apiClient.put(`${this.BASE_URL}/${inspectionId}/items/${itemId}`, itemData);
    return response.data;
  }

  /**
   * 점검 항목 삭제
   */
  static async deleteInspectionItem(inspectionId: number, itemId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_URL}/${inspectionId}/items/${itemId}`);
  }

  /**
   * 인수인계 지정별 사업계획 점검 목록 조회
   */
  static async getInspectionsByAssignment(assignmentId: number): Promise<BusinessPlanInspectionDto[]> {
    const response = await apiClient.get(`${this.BASE_URL}/assignment/${assignmentId}`);
    return response.data;
  }

  /**
   * 사업계획 점검 통계 조회
   */
  static async getInspectionStatistics(): Promise<{
    totalCount: number;
    plannedCount: number;
    inProgressCount: number;
    completedCount: number;
    cancelledCount: number;
    averageScore: number;
    totalIssueCount: number;
  }> {
    const response = await apiClient.get(`${this.BASE_URL}/statistics`);
    return response.data;
  }

  /**
   * 사업계획 점검 템플릿 목록 조회
   */
  static async getInspectionTemplates(): Promise<Array<{
    templateId: number;
    templateName: string;
    inspectionType: string;
    itemCount: number;
    description: string;
  }>> {
    const response = await apiClient.get(`${this.BASE_URL}/templates`);
    return response.data;
  }

  /**
   * 템플릿으로 점검 생성
   */
  static async createInspectionFromTemplate(
    templateId: number,
    inspectionData: Partial<BusinessPlanInspectionDto>
  ): Promise<BusinessPlanInspectionDto> {
    const response = await apiClient.post(`${this.BASE_URL}/create-from-template`, {
      templateId,
      ...inspectionData,
    });
    return response.data;
  }

  /**
   * 점검 결과 리포트 생성
   */
  static async generateReport(inspectionId: number): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/${inspectionId}/report`);
    return response as any; // Blob 타입으로 처리
  }

  /**
   * 점검 첨부파일 업로드
   */
  static async uploadAttachment(inspectionId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    await apiClient.post(`${this.BASE_URL}/${inspectionId}/attachments`, formData);
  }

  /**
   * 점검 첨부파일 다운로드
   */
  static async downloadAttachment(inspectionId: number, attachmentId: number): Promise<Blob> {
    const response = await apiClient.get(`${this.BASE_URL}/${inspectionId}/attachments/${attachmentId}`);
    return response as any; // Blob 타입으로 처리
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const businessPlanInspectionApi = BusinessPlanInspectionApi;