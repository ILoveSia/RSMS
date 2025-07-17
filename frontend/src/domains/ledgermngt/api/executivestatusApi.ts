import apiClient from '@/app/common/api/client'; // axios 인스턴스 등

export interface ExecOfficer {
  id: number;
  positionName: string;
  executiveName: string;
  jobTitle: string;
  appointmentDate: string;
  hasConcurrentPosition: boolean;
  concurrentDetails: string;
  positionsId?: number; // Added positionsId field
}

// Position details related interfaces
export interface PositionDetailResponse {
  positionsId: number;
  positionName: string;
  writeDeptCd: string;
  confirmGubunCd: string;
  ownerDepts: OwnerDept[];
  meetings: Meeting[];
  managers: Manager[];
}

export interface OwnerDept {
  deptCode: string;
  deptName: string;
}

export interface Meeting {
  meetingBodyId: string;
  meetingBodyName: string;
  memberGubun: string;
  meetingPeriod: string;
  deliberationContent: string;
}

export interface Manager {
  empNo: string;
  empName: string;
  position: string;
}

// ApiResponse 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const execOfficerApi = {
  getAll: async (): Promise<ExecOfficer[]> => {
    const response = await apiClient.get<ExecOfficer[]>('/execofficer');
    return response;
  },
  create: async (data: Omit<ExecOfficer, 'id'>): Promise<ExecOfficer> => {
    const response = await apiClient.post<ExecOfficer>('/execofficer', data);
    return response;
  },
  update: async (id: number, data: Omit<ExecOfficer, 'id'>): Promise<ExecOfficer> => {
    const response = await apiClient.put<ExecOfficer>(`/execofficer/${id}`, data);
    return response;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/execofficer/${id}`);
  },
  getnameById: async (id: number): Promise<ExecOfficer> => {
    const response = await apiClient.get<ExecOfficer>(`/execofficer/${id}`);
    return response;
  },
  // New function to fetch position details by ID
  getPositionDetails: async (positionId: number): Promise<PositionDetailResponse> => {
    try {
      // apiClient가 이미 ApiResponse wrapper를 unwrap해서 data만 반환하므로
      // 직접 PositionDetailResponse 타입으로 받을 수 있습니다
      const response = await apiClient.get<PositionDetailResponse>(`/positions/${positionId}`);
      console.log("12341234", response);
      return response;
    } catch (error) {
      console.error(`Failed to fetch position details for ID ${positionId}:`, error);
      throw error;
    }
  }
};

export default execOfficerApi;
