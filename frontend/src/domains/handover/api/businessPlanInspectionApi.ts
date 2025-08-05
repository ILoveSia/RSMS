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
import { Utils } from '@/app/utils';
import { getCodeNameSync, getDepartmentName, extractCommonCodes, getEmployeeNameSync } from '@/shared/utils/codeUtils';
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
  inspectionTypeName?: string; // 점검 유형 이름
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  statusName?: string; // 상태 이름

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
  private static readonly BASE_URL = '/handover/inspections';
  private static readonly utils = Utils.getInstance();

  // 공통코드 데이터를 가져오는 헬퍼 메서드
  private static async getCommonCodes() {
    try {
      const response: any = await apiClient.get('/common-codes');
      return extractCommonCodes(response);
    } catch (error) {
      console.error('공통코드 조회 실패:', error);
      return [];
    }
  }

  // 부서 데이터를 가져오는 헬퍼 메서드
  private static async getDepartments() {
    try {
      const response = await apiClient.get('/departments');
      return Array.isArray(response) ? response : response?.data || [];
    } catch (error) {
      console.error('부서 조회 실패:', error);
      return [];
    }
  }

  /**
   * 사업계획 점검 목록 조회
   */
  static async searchInspections(
    searchParams: InspectionSearchParams,
    paginationParams: PaginationParams
  ): Promise<ApiResponse<BusinessPlanInspectionDto[]>> {
    try {
      // 백엔드의 기본 엔드포인트를 호출하여 페이징된 데이터를 가져옴
      const params = new URLSearchParams();
      params.append('page', paginationParams.page.toString());
      params.append('size', paginationParams.size.toString());
      if (paginationParams.sort) {
        params.append('sort', paginationParams.sort);
      }

      const response: any = await apiClient.get(`${this.BASE_URL}/list?${params.toString()}`);

      // 백엔드에서 Page<BusinessPlanInspection> 형태로 반환되므로 content 필드에서 데이터 추출
      let inspectionData = response.content || [];

      // 프론트엔드에서 필터링 처리 (백엔드에서 필터링이 구현되지 않은 경우)
      if (searchParams.inspectionType && searchParams.inspectionType !== 'ALL') {
        inspectionData = inspectionData.filter((item: any) =>
          item.inspectionType === searchParams.inspectionType
        );
      }

      if (searchParams.status && searchParams.status !== 'ALL') {
        inspectionData = inspectionData.filter((item: any) =>
          item.status === searchParams.status
        );
      }

      // 공통코드 및 부서 데이터 가져오기
      const [commonCodes, departments] = await Promise.all([
        this.getCommonCodes(),
        this.getDepartments()
      ]);
      // console.log(commonCodes);
      console.log(departments);
      // DTO 형태로 변환 (사원명 비동기 조회 포함)
      const convertedData: BusinessPlanInspectionDto[] = await Promise.all(
        inspectionData.map(async (item: any) => {
          const [inspectorName, managerName] = await Promise.all([
            getEmployeeNameSync(item.inspectorEmpNo),
            getEmployeeNameSync(item.inspecteeEmpNo)
          ]);

          return {
            inspectionId: item.inspectionId,
            assignmentId: item.inspectionId,
            inspectionTitle: item.inspectionTitle,
            inspectionType: item.inspectionType,
            inspectionTypeName: getCodeNameSync(commonCodes, 'BUSINESSPLAN_STATUS', item.inspectionType),
            status: item.status,
            statusName: getCodeNameSync(commonCodes, 'BUSINESSPLAN_STATUS', item.status),
            planYear: item.inspectionYear,
            planQuarter: item.inspectionQuarter,
            targetDept: item.deptCd,
            targetDeptName: getDepartmentName(departments, item.deptCd),
            inspectionScope: item.inspectionScope,
            inspectionCriteria: item.inspectionCriteria,
            inspectionItems: item.inspectionScope || '', // 임시로 scope를 items로 사용
            plannedStartDate: item.plannedStartDate,
            plannedEndDate: item.plannedEndDate,
            actualStartDate: item.actualStartDate,
            actualEndDate: item.actualEndDate,
            inspectorEmpNo: item.inspectorEmpNo,
            inspectorName: inspectorName,
            managerEmpNo: item.inspecteeEmpNo,
            managerName: managerName,
            progressRate: 0,
            currentPhase: '',
            phaseDescription: '',
            overallScore: 0,
            overallGrade: item.overallGrade,
            totalIssueCount: 0,
            criticalIssueCount: 0,
            majorIssueCount: 0,
            minorIssueCount: 0,
            attachmentCount: 0,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        })
      );

      return {
        data: convertedData,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
      throw error;
    }
  }



  /**
   * 사업계획 점검 상세 조회
   */
  static async getInspection(inspectionId: number): Promise<BusinessPlanInspectionDto> {
    const response: any = await apiClient.get(`${this.BASE_URL}/${inspectionId}`);
    return response.data;
  }

  /**
   * 사업계획 점검 생성
   */
  static async createInspection(inspectionData: Omit<BusinessPlanInspectionDto, 'inspectionId'>): Promise<BusinessPlanInspectionDto> {
    const response: any = await apiClient.post(this.BASE_URL, inspectionData);
    return response.data;
  }

  /**
   * 사업계획 점검 수정
   */
  static async updateInspection(inspectionId: number, inspectionData: Partial<BusinessPlanInspectionDto>): Promise<BusinessPlanInspectionDto> {
    const response: any = await apiClient.put(`${this.BASE_URL}/${inspectionId}`, inspectionData);
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
    const response: any = await apiClient.post(`${this.BASE_URL}/${inspectionId}/start`, {
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
    const response: any = await apiClient.post(`${this.BASE_URL}/${inspectionId}/complete`, {
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
    const response: any = await apiClient.post(`${this.BASE_URL}/${inspectionId}/cancel`, {
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
    const response: any = await apiClient.post(`${this.BASE_URL}/${inspectionId}/progress`, {
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
    const response: any = await apiClient.get(`${this.BASE_URL}/${inspectionId}/items`);
    return response.data;
  }

  /**
   * 점검 항목 생성
   */
  static async createInspectionItem(
    inspectionId: number,
    itemData: Omit<InspectionItemDto, 'itemId' | 'inspectionId'>
  ): Promise<InspectionItemDto> {
    const response: any = await apiClient.post(`${this.BASE_URL}/${inspectionId}/items`, {
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
    const response: any = await apiClient.put(`${this.BASE_URL}/${inspectionId}/items/${itemId}`, itemData);
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
    const response: any = await apiClient.get(`${this.BASE_URL}/assignment/${assignmentId}`);
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
    const response: any = await apiClient.get(`${this.BASE_URL}/statistics`);
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
    const response: any = await apiClient.get(`${this.BASE_URL}/templates`);
    return response.data;
  }

  /**
   * 템플릿으로 점검 생성
   */
  static async createInspectionFromTemplate(
    templateId: number,
    inspectionData: Partial<BusinessPlanInspectionDto>
  ): Promise<BusinessPlanInspectionDto> {
    const response: any = await apiClient.post(`${this.BASE_URL}/create-from-template`, {
      templateId,
      ...inspectionData,
    });
    return response.data;
  }

  /**
   * 점검 결과 리포트 생성
   */
  static async generateReport(inspectionId: number): Promise<Blob> {
    const response: any = await apiClient.get(`${this.BASE_URL}/${inspectionId}/report`);
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
    const response: any = await apiClient.get(`${this.BASE_URL}/${inspectionId}/attachments/${attachmentId}`);
    return response as any; // Blob 타입으로 처리
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const businessPlanInspectionApi = BusinessPlanInspectionApi;