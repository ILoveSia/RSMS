// 공통코드 API
export { default as commonCodeUrl } from './url';

// 부서 API
export { default as DepartmentApi } from './departmentApi';
export type {
  Department as ApiDepartment,
  DepartmentCreateRequest,
  DepartmentSearchRequest,
  DepartmentUpdateRequest,
  SimpleDepartment,
} from './departmentApi';
