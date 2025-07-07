import apiClient from '@/app/common/api/client';
import type { MeetingBody, MeetingBodySearchRequest, PageableResponse } from '@/app/types';

/**
 * MeetingStatusPage용 회의체 API 모음
 */
export const meetingStatusApi = {
  /**
   * 회의체 검색 (페이징)
   */
  search: async (params: MeetingBodySearchRequest): Promise<PageableResponse<MeetingBody>> => {
    const queryParams = new URLSearchParams();

    if (params.gubun) queryParams.append('gubun', params.gubun);
    if (params.meetingName) queryParams.append('meetingName', params.meetingName);
    if (params.meetingPeriod) queryParams.append('meetingPeriod', params.meetingPeriod);
    if (params.content) queryParams.append('content', params.content);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const response = await apiClient.get<PageableResponse<MeetingBody>>(
      `/meeting-bodies/search?${queryParams.toString()}`
    );
    return response;
  },

  /**
   * 전체 회의체 목록 조회
   */
  getAll: async (): Promise<MeetingBody[]> => {
    const response = await apiClient.get<MeetingBody[]>('/meeting-bodies');
    return response;
  },

  /**
   * 회의체 단건 조회
   */
  getById: async (meetingBodyId: string): Promise<MeetingBody> => {
    const response = await apiClient.get<MeetingBody>(`/meeting-bodies/${meetingBodyId}`);
    return response;
  },

  /**
   * 구분별 회의체 목록 조회
   */
  getByGubun: async (gubun: string): Promise<MeetingBody[]> => {
    const response = await apiClient.get<MeetingBody[]>(
      `/meeting-bodies/gubun/${encodeURIComponent(gubun)}`
    );
    return response;
  },

  /**
   * 회의체 생성
   */
  create: async (
    data: Omit<MeetingBody, 'meetingBodyId' | 'createdAt' | 'updatedAt'>
  ): Promise<MeetingBody> => {
    const response = await apiClient.post<MeetingBody>('/meeting-bodies', data);
    return response;
  },

  /**
   * 회의체 수정
   */
  update: async (
    meetingBodyId: string,
    data: Omit<MeetingBody, 'meetingBodyId' | 'createdAt' | 'updatedAt'>
  ): Promise<MeetingBody> => {
    const response = await apiClient.put<MeetingBody>(`/meeting-bodies/${meetingBodyId}`, data);
    return response;
  },

  /**
   * 회의체 삭제
   */
  delete: async (meetingBodyId: string): Promise<void> => {
    await apiClient.delete(`/meeting-bodies/${meetingBodyId}`);
  },

  /**
   * 여러 회의체 일괄 삭제
   */
  deleteBulk: async (ids: string[]): Promise<void> => {
    await apiClient.post('/meeting-bodies/bulk-delete', { ids });
  },
};

export default meetingStatusApi;
