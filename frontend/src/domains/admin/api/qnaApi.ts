import apiClient from '@/app/common/api/client';
import type { PageResponse, QnaListResponseDto, QnaSearchRequestDto, QnaPriority } from '@/app/types/qna';

export interface QnaDetailResponseDto {
  id: number;
  department: string;
  title: string;
  content: string;
  questionerId: string;
  questionerName: string;
  answerContent?: string;
  answererId?: string;
  answererName?: string;
  status: string;
  statusDescription: string;
  priority?: string;
  priorityDescription?: string;
  category?: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  createdAtFormatted: string;
  updatedAt?: string;
  updatedAtFormatted?: string;
  answeredAt?: string;
  answeredAtFormatted?: string;
}

export const qnaApi = {
  /**
   * Q&A 목록 조회 (서버 페이지네이션)
   */
  getQnaList: async (params: Partial<QnaSearchRequestDto> = {}): Promise<PageResponse<QnaListResponseDto>> => {
    const {
      page = 0,
      size = 10,
      sort = 'createdAt',
      direction = 'DESC',
      keyword,
      category,
      status,
      priority,
      department,
      questionerId,
      answererId,
      isPublic,
      startDate,
      endDate,
    } = params;

    const response = await apiClient.get<PageResponse<QnaListResponseDto>>('/qna', {
      params: {
        page,
        size,
        sort,
        direction,
        keyword: keyword ?? '',
        category: category ?? '',
        status: status ?? '',
        priority: priority ?? '',
        department: department ?? '',
        questionerId: questionerId ?? '',
        answererId: answererId ?? '',
        isPublic: typeof isPublic === 'boolean' ? Number(isPublic) : '',
        startDate: startDate ?? '',
        endDate: endDate ?? '',
      },
    });

    return response;
  },
  /**
   * Q&A 상세 조회
   */
  getQnaDetail: async (id: number): Promise<QnaDetailResponseDto> => {
    return apiClient.get<QnaDetailResponseDto>(`/qna/${id}`);
  },

  /**
   * Q&A 생성
   */
  createQna: async (
    data: {
      department: string;
      title: string;
      content?: string;
      priority?: QnaPriority;
      category?: string;
      isPublic: boolean;
    },
    user: { userId: string; userName: string }
  ): Promise<number> => {
    return apiClient.post<number>(
      '/qna',
      data,
      {
        headers: {
          'X-User-Id': user.userId,
          'X-User-Name': user.userName,
        },
      }
    );
  },
};

export default qnaApi;


