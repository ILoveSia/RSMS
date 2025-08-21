/**
 * 새로운 메인 대시보드 API
 * 워크플로우, 통계, QnA, 공지사항, 결재 관련 API를 담당합니다.
 */

import { apiClient } from '@/app/common/api/client';

// 원장 상태 워크플로우 응답 타입
export interface LedgerOrdersStatusResponse {
  ledgerOrdersId: number;
  ledgerOrdersTitle: string;
  ledgerOrdersStatusCd: string;
  ledgerOrdersStatusName: string;
  createdAt: string;
  updatedAt: string;
}

// 부서장 내부통제 워크플로우 응답 타입
export interface LedgerOrdersHodStatusResponse {
  ledgerOrdersId: number;
  ledgerOrdersHodId: number;
  ledgerOrdersHodTitle: string;
  ledgerOrdersHodStatusCd: string;
  ledgerOrdersHodStatusName: string;
  createdAt: string;
  updatedAt: string;
}

// 점검 통계 응답 타입
export interface AuditStatisticsResponse {
  totalCount: number;
  appropriateCount: number;
  inadequateCount: number;
  excludedCount: number;
  appropriateRate: number;
  completionRate: number;
  lastUpdated: string;
}

// 최근 QnA 응답 타입
export interface RecentQnaResponse {
  id: number;
  title: string;
  category: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  questionerEmpNo: string;
  createdAt: string;
  viewCount: number;
  isAnswered: boolean;
}

// 최근 공지사항 응답 타입
export interface RecentNoticeResponse {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  viewCount: number;
  pinned: boolean;
}

// 내 결재 신청 응답 타입
export interface MyApprovalRequestResponse {
  approvalId: number;
  taskTypeCd: string;
  taskTypeInfo: string;
  taskId: number;
  apprStatCd: string;
  apprStatName: string;
  requestDatetime: string;
  approverId?: string;
  approverName?: string;
  comments?: string;
}

// 처리 대기 결재 응답 타입
export interface PendingApprovalResponse {
  approvalId: number;
  taskTypeCd: string;
  taskTypeInfo: string;
  taskId: number;
  requesterId: string;
  requesterName: string;
  requestDatetime: string;
  comments?: string;
  urgency?: string;
}

/**
 * 최신 원장 상태 조회 (MAX ledger_orders_id)
 */
export const getLedgerOrdersStatus = async (): Promise<LedgerOrdersStatusResponse> => {
  try {
    const response = await apiClient.get<LedgerOrdersStatusResponse>('/main/ledger-orders-status');
    return response;
  } catch (error) {
    console.error('원장 상태 조회 오류:', error);
    throw error;
  }
};

/**
 * 최신 부서장 내부통제 상태 조회 (MAX ledger_orders_hod_id)
 */
export const getLedgerOrdersHodStatus = async (): Promise<LedgerOrdersHodStatusResponse> => {
  try {
    const response = await apiClient.get<LedgerOrdersHodStatusResponse>('/main/ledger-orders-hod-status');
    return response;
  } catch (error) {
    console.error('부서장 내부통제 상태 조회 오류:', error);
    throw error;
  }
};

/**
 * 전체 점검 통계 조회 (부서별 집계)
 */
export const getAuditStatistics = async (): Promise<AuditStatisticsResponse> => {
  try {
    const response = await apiClient.get<AuditStatisticsResponse>('/main/audit-statistics');
    return response;
  } catch (error) {
    console.error('점검 통계 조회 오류:', error);
    throw error;
  }
};

/**
 * 최근 QnA 3건 조회
 */
export const getRecentQna = async (): Promise<RecentQnaResponse[]> => {
  try {
    const response = await apiClient.get<RecentQnaResponse[]>('/main/qna-recent');
    return response;
  } catch (error) {
    console.error('최근 QnA 조회 오류:', error);
    throw error;
  }
};

/**
 * 최근 공지사항 3건 조회
 */
export const getRecentNotice = async (): Promise<RecentNoticeResponse[]> => {
  try {
    const response = await apiClient.get<RecentNoticeResponse[]>('/main/notice-recent');
    return response;
  } catch (error) {
    console.error('최근 공지사항 조회 오류:', error);
    throw error;
  }
};

/**
 * 내 결재 신청 목록 조회 (로그인 아이디 기준)
 * 쿼리: SELECT * FROM approval WHERE requester_id = 'testuser' AND appr_stat_cd = 'IN_PROGRESS'
 */
export const getMyApprovalRequests = async (userid: string): Promise<MyApprovalRequestResponse[]> => {
  try {
    const response = await apiClient.get<MyApprovalRequestResponse[]>(`/main/my-approval-requests-by-userid/${userid}`);
    return response;
  } catch (error) {
    console.error('내 결재 신청 조회 오류:', error);
    throw error;
  }
};

/**
 * 처리 대기 결재 목록 조회 (로그인 아이디 기준)
 * 쿼리: SELECT * FROM approval_steps WHERE approver_id = 'bossuser02' AND step_status = 'PENDING'
 */
export const getPendingApprovals = async (userid: string): Promise<PendingApprovalResponse[]> => {
  try {
    const response = await apiClient.get<PendingApprovalResponse[]>(`/main/pending-approvals-by-userid/${userid}`);
    return response;
  } catch (error) {
    console.error('처리 대기 결재 조회 오류:', error);
    throw error;
  }
};

// 통합 API 객체
export const newMainDashboardApi = {
  getLedgerOrdersStatus,
  getLedgerOrdersHodStatus,
  getAuditStatistics,
  getRecentQna,
  getRecentNotice,
  getMyApprovalRequests,
  getPendingApprovals
};

export default newMainDashboardApi;