import apiClient from '@/app/common/api/client';

export interface ExecOfficer {
  execofficerId: number;
  positionNameMapped?: string;
  empId: string;
  execofficerDt: string;
  dualYn: string;
  dualDetails: string;
  userName: string;
  positionsId?: number;
}

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

const execOfficerApi = {
  getAll: async (): Promise<ExecOfficer[]> => {
    const response = await apiClient.get<ExecOfficer[]>('/execofficer');
    return response;
  },
  create: async (data: Omit<ExecOfficer, 'execofficerId'>): Promise<ExecOfficer> => {
    const response = await apiClient.post<ExecOfficer>('/execofficer', data);
    return response;
  },
  update: async (id: number, data: Omit<ExecOfficer, 'execofficerId'>): Promise<ExecOfficer> => {
    if (data.dualYn === 'N') {
      data.dualDetails = '';
    }
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
  getPositionDetails: async (positionId: number): Promise<PositionDetailResponse> => {
    try {
      const response = await apiClient.get<PositionDetailResponse>(`/positions/${positionId}`);
      console.log('12341234', response);
      return response;
    } catch (error) {
      console.error(`Failed to fetch position details for ID ${positionId}:`, error);
      throw error;
    }
  },
};

export default execOfficerApi;
