/**
 * 공통 컴포넌트들
 */

// 검색 관련 컴포넌트들
export * from './search';

// 부서 검색 관련
export { default as DepartmentSearchPopup } from './search/DepartmentSearchPopup';
export type { Department, DepartmentSearchPopupProps } from './search/DepartmentSearchPopup';

// 직원 검색 관련
export { default as EmployeeSearchPopup } from '../../../app/components/EmployeeSearchPopup';
