/**
 * 임원 대시보드 API
 * 임원별 소관부서 이행점검 현황 관련 API 호출을 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// API 공통 응답 타입
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 임원 권한 확인 응답 타입 (Backend DTO와 동기화)
export interface ExecutiveAuthResponse {
  isExecutive: boolean;
  execofficerId?: number;
  empId: string;
  positionsId?: number;
  positionsName?: string;
  ledgerOrder?: number;
  departmentCount: number;
}

// 임원 정보 타입
export interface ExecutiveInfo {
  execofficerId: number;
  empId: string;
  positionsId: number;
  positionsName?: string;
  ledgerOrder: number;
  isExecutive: boolean;
  departmentCount?: number;
}

// 소관부서 정보 타입 (Backend DTO와 동기화)
export interface ExecutiveDepartmentInfo {
  deptCd: string;
  deptName: string;
  ownerDeptCd: string;
  positionsId?: number;
  positionsName?: string;
}

// 임원 소관부서 현황 타입
export interface ExecutiveDepartmentStatusDto {
  deptCd: string;
  deptName: string;
  // 점검결과 현황
  totalCount: number;
  appropriateCount: number;
  inadequateCount: number;
  excludedCount: number;
  appropriateRate: number;
  // 개선계획 이행 현황
  planCreatedCount: number;
  resultWrittenCount: number;
  resultApprovedCount: number;
  completionRate: number;
  // audit_result_report 및 approval 정보
  auditProgMngtId?: number;
  auditResultReportId?: number;
  approvalId?: number;
  approvalStatusCd?: string;
  approvalStatusName?: string;
}

// 점검결과보고서 정보 타입
export interface ExecutiveAuditReportInfo {
  auditResultReportId: number;
  auditProgMngtId: number;
  deptCd: string;
  deptName: string;
  reportTitle: string;
  reportContent: string;
  createdAt: string;
  createdBy: string;
  approvalStatusCd?: string;
  approvalStatusName?: string;
}

/**
 * 임원 권한 확인
 */
export const checkExecutiveAuth = async (empId: string): Promise<ExecutiveAuthResponse> => {
  try {
    const response = await apiClient.get<ExecutiveAuthResponse>(`/execofficer/auth/${empId}`);
    
    if (response) {
      return response;
    } else {
      throw new Error('유효하지 않은 응답 구조');
    }
  } catch (error) {
    console.error('임원 권한 확인 오류:', error);
    throw error;
  }
};

/**
 * 임원 소관부서 목록 조회
 */
export const getExecutiveDepartments = async (empId: string): Promise<ExecutiveDepartmentInfo[]> => {
  try {
    const response = await apiClient.get<ExecutiveDepartmentInfo[]>(`/execofficer/departments/${empId}`);
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      return (response as any).data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('임원 소관부서 조회 오류:', error);
    throw error;
  }
};

/**
 * 임원 소관부서별 점검결과 현황 조회
 */
export const getExecutiveAuditResultStatus = async (
  empId: string,
  ledgerOrdersHodId?: number
): Promise<ExecutiveDepartmentStatusDto[]> => {
  try {
    const params: Record<string, string> = {};
    if (ledgerOrdersHodId) params.ledgerOrdersHodId = String(ledgerOrdersHodId);

    const response = await apiClient.get<ExecutiveDepartmentStatusDto[]>(
      `/execofficer/audit-result-status/${empId}`, 
      { params }
    );
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      return (response as any).data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('임원 소관부서 점검결과 현황 조회 오류:', error);
    throw error;
  }
};

/**
 * 임원 소관부서별 개선계획 이행 현황 조회
 */
export const getExecutiveImprovementPlanStatus = async (
  empId: string,
  ledgerOrdersHodId?: number
): Promise<ExecutiveDepartmentStatusDto[]> => {
  try {
    const params: Record<string, string> = {};
    if (ledgerOrdersHodId) params.ledgerOrdersHodId = String(ledgerOrdersHodId);

    const response = await apiClient.get<ExecutiveDepartmentStatusDto[]>(
      `/execofficer/improvement-plan-status/${empId}`, 
      { params }
    );
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      return (response as any).data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('임원 소관부서 개선계획 이행 현황 조회 오류:', error);
    throw error;
  }
};

/**
 * 임원 소관부서 점검결과보고서 목록 조회
 */
export const getExecutiveAuditReports = async (
  empId: string,
  deptCodes?: string[]
): Promise<ExecutiveAuditReportInfo[]> => {
  try {
    const params: Record<string, string> = {};
    if (deptCodes && deptCodes.length > 0) {
      params.deptCodes = deptCodes.join(',');
    }

    const response = await apiClient.get<ExecutiveAuditReportInfo[]>(
      `/executive/audit-reports/${empId}`, 
      { params }
    );
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      return (response as any).data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('임원 소관부서 점검결과보고서 조회 오류:', error);
    throw error;
  }
};

/**
 * 임원 통합 현황 조회 (점검결과 + 개선계획)
 */
export const getExecutiveIntegratedStatus = async (
  empId: string,
  ledgerOrdersHodId?: number
): Promise<ExecutiveDepartmentStatusDto[]> => {
  try {
    const params: Record<string, string> = {};
    if (ledgerOrdersHodId) params.ledgerOrdersHodId = String(ledgerOrdersHodId);

    const response = await apiClient.get<ExecutiveDepartmentStatusDto[]>(
      `/executive/integrated-status/${empId}`, 
      { params }
    );
    
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object' && Array.isArray((response as any).data)) {
      return (response as any).data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('임원 통합 현황 조회 오류:', error);
    throw error;
  }
};

// executiveDashboardApi 객체 생성 및 export
export const executiveDashboardApi = {
  checkExecutiveAuth,
  getExecutiveDepartments,
  getExecutiveAuditResultStatus,
  getExecutiveImprovementPlanStatus,
  getExecutiveAuditReports,
  getExecutiveIntegratedStatus
};

export default executiveDashboardApi;