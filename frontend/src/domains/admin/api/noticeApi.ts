import apiClient from '@/app/common/api/client';

export interface NoticeListResponseDto {
  id: number;
  category?: string;
  title: string;
  is_public: boolean;
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
  getNoticeList: async (params: { page?: number; size?: number; sort?: string; direction?: 'ASC' | 'DESC'; onlyPublic?: boolean } = {}): Promise<PageResponse<NoticeListResponseDto>> => {
    const { page = 0, size = 50, sort = 'createdAt', direction = 'DESC', onlyPublic = true } = params;
    return apiClient.get<PageResponse<NoticeListResponseDto>>('/notice', {
      params: { page, size, sort, direction, onlyPublic: onlyPublic ? 'true' : 'false' },
    });
  },
};

export default noticeApi;


