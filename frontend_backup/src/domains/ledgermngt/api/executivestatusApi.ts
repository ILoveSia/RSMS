import apiClient from '@/app/common/api/client'; // axios 인스턴스 등

export interface ExecOfficer {
  id: number;
  positionName: string;
  executiveName: string;
  jobTitle: string;
  appointmentDate: string;
  hasConcurrentPosition: boolean;
  concurrentDetails: string;
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
  }
};

export default execOfficerApi;
