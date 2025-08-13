import apiClient from '@/app/common/api/client';

export interface NoticeListResponseDto {
  id: number;
  category?: string;
  title: string;
  content?: string;
  pinned?: boolean;
  view_count: number;
  created_at?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const noticeApi = {
  getNoticeList: async (params: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC' } = {}): Promise<PageResponse<NoticeListResponseDto>> => {
    const { page = 0, size = 50, sort = 'createdAt', direction = 'DESC' } = params;
    return apiClient.get<PageResponse<NoticeListResponseDto>>('/notice', {
      params: { page, size, sort, direction },
    });
  },
  getNoticeDetail: async (id: number): Promise<NoticeListResponseDto> => {
    return apiClient.get<NoticeListResponseDto>(`/notice/${id}`);
  },
  createNotice: async (
    data: { category?: string; title: string; content?: string; pinned?: boolean },
    user: { userId: string }
  ): Promise<number> => {
    return apiClient.post<number>(
      '/notice',
      data,
      { headers: { 'X-User-Id': user.userId } }
    );
  },
};

export default noticeApi;


