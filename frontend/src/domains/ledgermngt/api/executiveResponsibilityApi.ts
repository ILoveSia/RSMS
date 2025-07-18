import apiClient from '@/app/common/api/client';

export interface ExecutiveResponsibility {
  id: number;
  position: string;          // 직책
  jobTitle: string;          // 직위
  empNo: string;             // 사번
  executiveName: string;     // 성명
  responsibility: string;    // 책무
  responsibilityDetail: string; // 책무 세부내용
  managementDuty: string;    // 책무이행을 위한 주요 관리의무
  relatedBasis: string;      // 관련근거
}

export interface ExecutiveResponsibilitySearchParams {
  ledgerOrder?: string;      // 책무번호
  positionId?: string;       // 직책 ID
}

const executiveResponsibilityApi = {
  /**
   * 임원별 책무 현황 조회 (검색 조건 포함)
   * @param params 검색 조건
   * @returns 임원별 책무 현황 목록
   */
        getAll:async():Promise<ExecutiveResponsibility[]> => {
    const response = await apiClient.get<ExecutiveResponsibility[]>('/executive-responsibilities');
    return response;
  }
};

export default executiveResponsibilityApi;
