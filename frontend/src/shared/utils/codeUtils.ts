/**
 * 공통코드 및 부서 관련 유틸리티 함수
 */

// 공통코드 타입
export interface CommonCode {
  groupCode: string;
  code: string;
  codeName: string;
  description?: string;
  sortOrder?: number;
  useYn: string;
  createdAt?: string;
  updatedAt?: string;
}

// 부서 정보 타입
export interface Department {
  departmentId: string;
  departmentName: string;
  useYn: string;
  isActive: boolean;
}

/**
 * 공통코드명 가져오기 함수
 * @param allCodes 전체 공통코드 배열
 * @param groupCode 그룹코드
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getCodeName = (
  allCodes: CommonCode[] | null | undefined,
  groupCode: string,
  codeValue: string
): string => {
  if (!codeValue) return '';
  if (!allCodes || allCodes.length === 0) {
    return codeValue;
  }
  
  const code = allCodes.find(
    (c) => c.groupCode === groupCode && c.code === codeValue
  );
  
  return code ? code.codeName : codeValue;
};

/**
 * 직무구분 코드명 가져오기 함수
 * UNI_ROLE_TYPE 또는 COM_ROLE_TYPE 그룹에서 찾기
 * @param allCodes 전체 공통코드 배열
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getRoleTypeName = (
  allCodes: CommonCode[] | null | undefined,
  codeValue: string
): string => {
  if (!codeValue) return '';
  if (!allCodes || allCodes.length === 0) {
    return codeValue;
  }
  
  // UNI_ROLE_TYPE에서 먼저 찾기
  const uniRoleName = getCodeName(allCodes, 'UNI_ROLE_TYPE', codeValue);
  if (uniRoleName !== codeValue) return uniRoleName;
  
  // COM_ROLE_TYPE에서 찾기
  return getCodeName(allCodes, 'COM_ROLE_TYPE', codeValue);
};

/**
 * 부서명 가져오기 함수
 * @param departments 부서 정보 배열
 * @param deptCd 부서코드
 * @returns 부서명 (없으면 부서코드 그대로 반환)
 */
export const getDepartmentName = (
  departments: Department[] | null | undefined,
  deptCd: string
): string => {
  if (!deptCd) return '';
  if (!departments || departments.length === 0) {
    return deptCd;
  }
  
  const dept = departments.find(d => d.departmentId === deptCd);
  return dept ? dept.departmentName : deptCd;
};

/**
 * 공통코드 배열 추출 함수
 * Redux store에서 가져온 데이터가 배열이거나 { data: CommonCode[] } 형태일 수 있음
 * @param allCodesData Redux store에서 가져온 공통코드 데이터
 * @returns 공통코드 배열
 */
export const extractCommonCodes = (
  allCodesData: { data: CommonCode[] } | CommonCode[] | null | undefined
): CommonCode[] => {
  if (!allCodesData) return [];
  return Array.isArray(allCodesData) ? allCodesData : allCodesData?.data || [];
};