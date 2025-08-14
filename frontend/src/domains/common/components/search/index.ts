/**
 * 공통 검색 팝업 컴포넌트들
 */

// 부서 검색 팝업
export { default as DepartmentSearchPopup } from './DepartmentSearchPopup';
export type { Department, DepartmentSearchPopupProps } from './DepartmentSearchPopup';

// 직원 검색 팝업
export { default as EmployeeSearchPopup } from './EmployeeSearchPopup';
export type { EmployeeSearchPopupProps, EmployeeSearchResult } from './EmployeeSearchPopup';

// 회의체 검색 팝업
export { default as MeetingBodySearchPopup } from './MeetingBodySearchPopup';
export type {
  MeetingBodySearchPopupProps,
  MeetingBodySearchResult,
} from './MeetingBodySearchPopup';

// 책무 검색 팝업
export { default as ResponsibilitySearchPopup } from './ResponsibilitySearchPopup';
export type { ResponsibilitySearchResult, ResponsibilitySearchPopupProps } from './ResponsibilitySearchPopup';

// 직책 검색 팝업
export { default as PositionSearchPopup } from './PositionSearchPopup';
export type { PositionSearchResult, PositionSearchPopupProps } from './PositionSearchPopup';
