/**
 * Admin Domain 메인 엔트리 포인트
 * 권한 관리 시스템의 모든 내보내기를 관리합니다.
 */

// API
export { default as adminApi } from './api/adminApi';

// Pages
export { default as MenuPermissionManagePage } from './pages/MenuPermissionManagePage';
export { default as UserPermissionManagePage } from './pages/UserPermissionManagePage';

// Router
export { adminRoutes } from './router';

// Store
export {
  default as adminReducer,
  fetchMenuPermissionMatrix,
  fetchUsers,
  fetchRoles,
  fetchUsersAndRoles,
  fetchPermissionStatistics,
  updateUserRoles,
  updateLocalMenuPermissions,
  clearMenuPermissionError,
  clearUsersError,
  clearStatisticsError,
  selectMenuPermissionMatrix,
  selectMenuPermissionLoading,
  selectMenuPermissionError,
  selectUsers,
  selectRoles,
  selectUsersLoading,
  selectUsersError,
  selectStatistics,
  selectMenuStats,
  selectRoleStats,
  selectStatisticsLoading,
  selectStatisticsError,
} from './store';

// Types
export type {
  MenuInfo,
  PermissionSet,
  MenuPermissionMatrix,
  MenuPermission,
  MenuPermissionUpdate,
  UserRoleInfo,
  PermissionSummary,
  UserWithRoles,
  UserRole,
  UserRoleAssign,
  Role,
  UserStats,
  RoleStats,
  MenuStats,
  PermissionDistribution,
  PermissionStatistics,
  MenuPermissionStat,
  RolePermissionStat,
  PermissionEditState,
  UserRoleEditState,
  MenuPermissionFilter,
  UserFilter,
} from './types';