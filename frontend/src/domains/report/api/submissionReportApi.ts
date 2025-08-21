import apiClient from '@/app/common/api/client';
import type { SubmissionReportRow } from '../pages/SubmissionReportPage'; // Assuming the type is exported from the page

// DTOs should ideally be in a separate types file
interface SubmissionReportCreateRequestDto {
  baseDate: string;
  targetInstitution: string;
}

export const submissionReportApi = {
  getSubmissionReports: async (): Promise<SubmissionReportRow[]> => {
    return apiClient.get<SubmissionReportRow[]>('/api/submission-reports');
  },

  createSubmissionReport: async (data: SubmissionReportCreateRequestDto): Promise<SubmissionReportRow> => {
    return apiClient.post<SubmissionReportRow>('/api/submission-reports', data);
  },

  updateSubmissionReport: async (id: number, data: SubmissionReportCreateRequestDto): Promise<SubmissionReportRow> => {
    return apiClient.put<SubmissionReportRow>(`/api/submission-reports/${id}`, data);
  },

  deleteSubmissionReport: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/submission-reports/${id}`);
  },
};
