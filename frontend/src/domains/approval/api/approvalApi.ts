/**
 * 결재 API 클라이언트
 */
import { apiClient } from '@/app/common/api/client';

// 결재 상신 요청 타입
export interface ApprovalSubmitRequest {
  taskTypeCd: string;
  taskId: number;
  taskTitle: string;
  approvers: string[];
  urgency?: 'NORMAL' | 'URGENT';
  comments?: string;
}

// 결재 처리 요청 타입
export interface ApprovalProcessRequest {
  stepId: number;
  action: 'approve' | 'reject';
  comments: string;
}

// 결재 상신 응답 타입
export interface ApprovalSubmitResponse {
  approvalId: number;
  status: string;
  message: string;
  steps: ApprovalStepInfo[];
}

// 결재 처리 응답 타입
export interface ApprovalProcessResponse {
  approvalId: number;
  status: string;
  message: string;
  nextStep?: number;
  nextApproverName?: string;
  isCompleted: boolean;
}

// 결재 상태 응답 타입
export interface ApprovalStatusResponse {
  approvalId: number;
  taskTypeCd: string;
  taskId: number;
  taskTitle: string;
  requesterId: string;
  requesterName: string;
  status: string;
  statusName: string;
  currentStep?: number;
  totalSteps: number;
  requestDateTime: string;
  approvalDateTime?: string;
  comments?: string;
  steps: ApprovalStepInfo[];
}

// 결재 단계 정보 타입
export interface ApprovalStepInfo {
  stepId?: number;
  stepOrder: number;
  approverId: string;
  approverName: string;
  status: string;
  statusName: string;
  approvedDateTime?: string;
  comments?: string;
  isCurrentUser?: boolean;
}

// 결재 목록 응답 타입
export interface ApprovalListResponse {
  approvalId: number;
  taskTypeCd: string;
  taskTypeName: string;
  taskId: number;
  taskTitle: string;
  requesterId: string;
  requesterName: string;
  status: string;
  statusName: string;
  currentStep?: number;
  totalSteps: number;
  currentApproverName?: string;
  requestDateTime: string;
  urgency?: string;
  isMyTask?: boolean;
}

// 결재 요약 응답 타입
export interface ApprovalSummaryResponse {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  approvedCount: number;
  rejectedCount: number;
  cancelledCount: number;
  avgProcessingHours?: number;
  myPendingCount: number;
}

// 결재자 정보 타입
export interface ApproverInfo {
  userId: string;
  userName: string;
  departmentName: string;
  positionName: string;
  isAvailable: boolean;
}

// API 클라이언트 클래스
class ApprovalApiClient {
  private baseUrl = '/api/approval';

  /**
   * 결재 상신
   */
  async submitApproval(request: ApprovalSubmitRequest): Promise<ApprovalSubmitResponse> {
    const response = await fetch(`${this.baseUrl}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`결재 상신 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 처리 (승인/반려)
   */
  async processApproval(request: ApprovalProcessRequest): Promise<ApprovalProcessResponse> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`결재 처리 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 취소
   */
  async cancelApproval(approvalId: number, requesterId: string): Promise<ApprovalProcessResponse> {
    const response = await fetch(`${this.baseUrl}/${approvalId}/cancel?requesterId=${requesterId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`결재 취소 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 상태 조회 (업무별)
   */
  async getApprovalStatus(taskType: string, taskId: number): Promise<ApprovalStatusResponse | null> {
    const response = await fetch(`${this.baseUrl}/status?taskType=${taskType}&taskId=${taskId}`);

    if (response.status === 404) {
      return null; // 결재가 없는 경우
    }

    if (!response.ok) {
      throw new Error(`결재 상태 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 상세 정보 조회
   */
  async getApprovalDetail(approvalId: number): Promise<ApprovalStatusResponse> {
    const response = await fetch(`${this.baseUrl}/${approvalId}`);

    if (!response.ok) {
      throw new Error(`결재 상세 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 내 결재 대기 목록 조회
   */
  async getMyPendingApprovals(approverId: string): Promise<ApprovalListResponse[]> {
    const response = await fetch(`${this.baseUrl}/my-pending?approverId=${approverId}`);

    if (!response.ok) {
      throw new Error(`내 결재 대기 목록 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 내가 요청한 결재 목록 조회
   */
  async getMyRequestedApprovals(requesterId: string): Promise<ApprovalListResponse[]> {
    const response = await fetch(`${this.baseUrl}/my-requests?requesterId=${requesterId}`);

    if (!response.ok) {
      throw new Error(`내 요청 결재 목록 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 전체 결재 목록 조회
   */
  async getAllApprovals(): Promise<ApprovalListResponse[]> {
    const response = await fetch(`${this.baseUrl}/all`);

    if (!response.ok) {
      throw new Error(`전체 결재 목록 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 요약 정보 조회
   */
  async getApprovalSummary(userId: string): Promise<ApprovalSummaryResponse> {
    const response = await fetch(`${this.baseUrl}/summary?userId=${userId}`);

    if (!response.ok) {
      throw new Error(`결재 요약 정보 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재자 목록 조회
   */
  async getAvailableApprovers(): Promise<ApproverInfo[]> {
    const response = await fetch(`${this.baseUrl}/approvers`);

    if (!response.ok) {
      throw new Error(`결재자 목록 조회 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 라인 미리보기
   */
  async previewApprovalLine(approvers: string[]): Promise<ApprovalStepInfo[]> {
    const response = await fetch(`${this.baseUrl}/preview-line`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvers),
    });

    if (!response.ok) {
      throw new Error(`결재 라인 미리보기 실패: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 결재 권한 확인
   */
  async checkApprovalAuthority(approverId: string, taskType: string, taskId: number): Promise<boolean> {
    const response = await fetch(
      `${this.baseUrl}/check-authority?approverId=${approverId}&taskType=${taskType}&taskId=${taskId}`
    );

    if (!response.ok) {
      throw new Error(`결재 권한 확인 실패: ${response.statusText}`);
    }

    return response.json();
  }
}

// 싱글톤 인스턴스
const approvalApi = new ApprovalApiClient();

export default approvalApi;