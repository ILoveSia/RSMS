/**
 * 직책 관련 타입 정의
 */

// 직책 책무 타입
export interface PositionResponsibility {
  id: number;
  classification: string;
  positionId: string;
  positionName: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
  lastModifiedDate: string;
  createdAt: string;
  updatedAt: string;
}

// 직책 책무 상세 DTO
export interface PositionResponsibilityDetailDto {
  responsibilityDetailContent: string;
  keyManagementTasks: string;
  relatedBasis: string;
}

// 직책 책무 생성/수정 요청 DTO
export interface PositionResponsibilityRequestDto {
  classification: string;
  positionId: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
}
