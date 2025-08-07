import apiClient from '@/app/common/api/client';

export interface ExecOfficer {
  execofficerId: number;
  positionsNm?: string;
  empId: string;
  execofficer_dt: string;
  dualYn: string;
  dualDetails: string;
  userName: string;
  approvalId: number;
  ledgerOrders: number;
  orderStatus: string;
  positionsId?: number;
  empName: string;
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

    // 날짜를 YYYY-MM-DD 형식으로 완벽하게 파싱하는 함수
    const formatDateToYYYYMMDD = (dateInput: any): string | null => {
      if (!dateInput) return null;
      
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return null;
      
      // 로컬 시간대 기준으로 YYYY-MM-DD 형식 생성
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // 백엔드에서 필요한 필드만 추출하여 전송
    const updateData = {
      empId: data.empId,
      execofficer_dt: formatDateToYYYYMMDD(data.execofficer_dt),
      dualYn: data.dualYn,
      dualDetails: data.dualDetails,
      positionsId: data.positionsId,
      approvalId: data.approvalId,
      ledgerOrder: data.ledgerOrder,
      orderStatus: data.orderStatus
    };

    const response = await apiClient.put<ExecOfficer>(`/execofficer/${id}`, updateData);
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
      return response;
    } catch (error) {
      console.error(`Failed to fetch position details for ID ${positionId}:`, error);
      throw error;
    }
  },
};

export default execOfficerApi;
