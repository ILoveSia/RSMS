/**
 * 공통 검색 팝업 컴포넌트들
 */

// 직원 검색 팝업
export { default as EmployeeSearchPopup } from '@/app/components/EmployeeSearchPopup';
export type { EmployeeSearchResult } from '@/app/components/EmployeeSearchPopup';

// 회의체 검색 팝업
export { default as MeetingBodySearchDialog } from './MeetingBodySearchDialog';
export type { MeetingBodySearchDialogProps, MeetingBodySearchResult } from './MeetingBodySearchDialog';
