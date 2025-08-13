/**
 * 메인 대시보드 API 클라이언트
 */
import apiClient from '@/app/common/api/client';

// 타입 정의
export interface WorkStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  approvalPending: number;
  auditTasks: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  assignee?: string;
  dueDate?: string;
  estimatedTime?: string;
}

export interface WorkflowStatus {
  processId: string;
  processName: string;
  description: string;
  category: string;
  currentStep: number;
  progress: number;
  steps: WorkflowStep[];
}

export interface MonthlyTrend {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

export interface RecentTask {
  taskName: string;
  completedAt: string;
  category: string;
}

// API 함수들
const mainDashboardApi = {
  // 업무 통계 조회
  getWorkStats: async (userId: string): Promise<WorkStats> => {
    const response = await apiClient.get<WorkStats>(`/api/main/stats/${userId}`);
    return response;
  },

  // 워크플로우 현황 조회
  getWorkflowStatus: async (userId: string): Promise<WorkflowStatus[]> => {
    const response = await apiClient.get<WorkflowStatus[]>(`/api/main/workflows/${userId}`);
    return response;
  },

  // 월별 트렌드 데이터 조회
  getMonthlyTrends: async (userId: string): Promise<MonthlyTrend[]> => {
    const response = await apiClient.get<MonthlyTrend[]>(`/api/main/trends/${userId}`);
    return response;
  },

  // 최근 완료 업무 조회
  getRecentTasks: async (userId: string): Promise<RecentTask[]> => {
    const response = await apiClient.get<RecentTask[]>(`/api/main/recent-tasks/${userId}`);
    return response;
  },
};

export default mainDashboardApi;