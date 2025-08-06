/**
 * 공통코드 및 부서 관련 유틸리티 함수
 */
import { useCallback, useMemo, useEffect, useState } from "react";
import { useReduxState } from "@/app/store/use-store";
import apiClient from "@/app/common/api/client";

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
 * 공통코드명 가져오기 함수 (순수 함수)
 * @param allCodes 전체 공통코드 배열
 * @param groupCode 그룹코드
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getCodeNameSync = (
  allCodes: CommonCode[] | null | undefined,
  groupCode: string,
  codeValue: string
): string => {
  if (!codeValue) return '';
  if (!allCodes || allCodes.length === 0) {
    return codeValue;
  }

  const code = allCodes.find(
    (c: CommonCode) => c.groupCode === groupCode && c.code === codeValue
  );

  return code ? code.codeName : codeValue;
};

/**
 * 공통코드명 가져오기 함수 (Hook 버전)
 * React 컴포넌트에서 직접 사용 가능
 * @param groupCode 그룹코드
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getCodeName = (
  groupCode: string,
  codeValue: string
): string => {
  const allCodes = useCommonCodes();
  return getCodeNameSync(allCodes, groupCode, codeValue);
};

/**
 * 콜백 함수에서 사용할 수 있는 getCodeName 함수를 반환하는 Hook
 * @returns getCodeName 함수
 */
export const useGetCodeName = () => {
  const allCodes = useCommonCodes();
  return useCallback((groupCode: string, codeValue: string) =>
    getCodeNameSync(allCodes, groupCode, codeValue), [allCodes]);
};

/**
 * 직무구분 코드명 가져오기 함수 (순수 함수)
 * UNI_ROLE_TYPE 또는 COM_ROLE_TYPE 그룹에서 찾기
 * @param allCodes 전체 공통코드 배열
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getRoleTypeNameSync = (
  allCodes: CommonCode[] | null | undefined,
  codeValue: string
): string => {
  if (!codeValue) return '';
  if (!allCodes || allCodes.length === 0) {
    return codeValue;
  }

  // UNI_ROLE_TYPE에서 먼저 찾기
  const uniRoleName = getCodeNameSync(allCodes, 'UNI_ROLE_TYPE', codeValue);
  if (uniRoleName !== codeValue) return uniRoleName;

  // COM_ROLE_TYPE에서 찾기
  return getCodeNameSync(allCodes, 'COM_ROLE_TYPE', codeValue);
};

/**
 * 직무구분 코드명 가져오기 함수 (Hook 버전)
 * React 컴포넌트에서 직접 사용 가능
 * @param codeValue 코드값
 * @returns 코드명 (없으면 코드값 그대로 반환)
 */
export const getRoleTypeName = (codeValue: string): string => {
  const allCodes = useCommonCodes();
  return getRoleTypeNameSync(allCodes, codeValue);
};

/**
 * 콜백 함수에서 사용할 수 있는 getRoleTypeName 함수를 반환하는 Hook
 * @returns getRoleTypeName 함수
 */
export const useGetRoleTypeName = () => {
  const allCodes = useCommonCodes();
  return useCallback((codeValue: string) =>
    getRoleTypeNameSync(allCodes, codeValue), [allCodes]);
};

/**
 * 부서명 가져오기 함수 (순수 함수)
 * @param departments 부서 정보 배열
 * @param deptCd 부서코드
 * @returns 부서명 (없으면 부서코드 그대로 반환)
 */
export const getDepartmentNameSync = (
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
 * 부서명 가져오기 함수 (Hook 버전)
 * React 컴포넌트에서 직접 사용 가능
 * @param deptCd 부서코드
 * @returns 부서명 (없으면 부서코드 그대로 반환)
 */
export const getDepartmentName = (deptCd: string): string => {
  const departments = useDepartments();
  return getDepartmentNameSync(departments, deptCd);
};

/**
 * 콜백 함수에서 사용할 수 있는 getDepartmentName 함수를 반환하는 Hook
 * @returns getDepartmentName 함수
 */
export const useGetDepartmentName = () => {
  const departments = useDepartments();
  return useCallback((deptCd: string) =>
    getDepartmentNameSync(departments, deptCd), [departments]);
};

/**
 * 사원번호로 사원명 가져오기 함수 (순수 함수)
 * @param empNo 사원번호
 * @returns 사원명 (없으면 사원번호 그대로 반환)
 */
export const getEmployeeNameSync = async (empNo: string): Promise<string> => {
  if (!empNo) return '';

  try {
    const response: any = await apiClient.get(`/users/num/${empNo}`);
    return response?.username || empNo;
  } catch (error) {
    console.error('사원 정보 조회 실패:', error);
    return empNo;
  }
};

/**
 * 사원번호로 사원명 가져오기 함수 (Hook 버전)
 * React 컴포넌트에서 직접 사용 가능
 * @param empNo 사원번호
 * @returns 사원명 (없으면 사원번호 그대로 반환)
 */
export const getEmployeeName = (empNo: string): string => {
  const [empName, setEmpName] = useState<string>(empNo);

  useEffect(() => {
    if (empNo) {
      getEmployeeNameSync(empNo).then(setEmpName);
    }
  }, [empNo]);

  return empName;
};

/**
 * 콜백 함수에서 사용할 수 있는 getEmployeeName 함수를 반환하는 Hook
 * @returns getEmployeeName 함수
 */
export const useGetEmployeeName = () => {
  return useCallback((empNo: string) => getEmployeeNameSync(empNo), []);
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

/**
 * 부서 배열 추출 함수
 * Redux store에서 가져온 데이터가 배열이거나 { data: Department[] } 형태일 수 있음
 * @param departmentsData Redux store에서 가져온 부서 데이터
 * @returns 부서 배열
 */
export const extractDepartments = (
  departmentsData: { data: Department[] } | Department[] | null | undefined
): Department[] => {
  if (!departmentsData) return [];
  return Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || [];
};

/**
 * 공통코드 가져오기 Hook
 * React 컴포넌트에서만 사용 가능
 * 데이터가 비어있을 때 자동으로 API 호출하여 Redux store에 저장
 */
export const useCommonCodes = (): CommonCode[] => {
  const { data: allCodesData, setData } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 데이터가 비어있을 때 자동으로 API 호출
  useEffect(() => {
    const fetchCommonCodes = async () => {
      try {
        const response = await apiClient.get('/common-codes');
        if (response && Array.isArray(response)) {
          setData({ data: response });
        }
      } catch (error) {
        console.error('공통코드 조회 실패:', error);
      }
    };

    if (!allCodesData || (Array.isArray(allCodesData) && allCodesData.length === 0)) {
      fetchCommonCodes();
    }
  }, [allCodesData]);

  return useMemo(() => extractCommonCodes(allCodesData), [allCodesData]);
};

/**
 * 부서 정보 가져오기 Hook
 * React 컴포넌트에서만 사용 가능
 * 데이터가 비어있을 때 자동으로 API 호출하여 Redux store에 저장
 */
export const useDepartments = (): Department[] => {
  // 임시로 로컬 상태 사용해서 테스트
  const [localDepartments, setLocalDepartments] = useState<Department[]>([]);
  const { data: departmentsData, setData } = useReduxState<{ data: Department[] } | Department[]>('departmentStore/departments');

  // 데이터가 비어있을 때 자동으로 API 호출
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiClient.get('/departments');
        if (response && Array.isArray(response)) {
          setData({ data: response });
          // 임시로 로컬 상태에도 저장
          setLocalDepartments(response);
        }
      } catch (error) {
        console.error('부서 정보 조회 실패:', error);
      }
    };

    if ((!departmentsData || (Array.isArray(departmentsData) && departmentsData.length === 0)) && localDepartments.length === 0) {
      fetchDepartments();
    }
  }, [departmentsData, localDepartments.length]);

  // Redux에서 데이터가 있으면 Redux 사용, 없으면 로컬 상태 사용
  const result = useMemo(() => {
    const reduxResult = extractDepartments(departmentsData);
    if (reduxResult.length > 0) {
      return reduxResult;
    }
    return localDepartments;
  }, [departmentsData, localDepartments]);

  return result;
};