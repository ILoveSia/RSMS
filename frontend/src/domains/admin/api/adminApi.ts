import apiClient from '@/app/common/api/client';
import type {
  MenuPermissionMatrix,
  MenuPermission,
  MenuPermissionUpdate,
  UserWithRoles,
  UserRole,
  UserRoleAssign,
  Role,
  PermissionStatistics,
  MenuPermissionStat,
  RolePermissionStat
} from '../types';

/**
 * 관리자 API
 * 권한 관리 관련 API 호출을 담당합니다.
 */
export const adminApi = {
  // 메뉴 권한 관리
  
  /**
   * 메뉴 권한 매트릭스 조회
   */
  getMenuPermissionMatrix: async (): Promise<MenuPermissionMatrix> => {
    const response = await apiClient.get('/admin/menu-permissions');
    return response;
  },

  /**
   * 특정 메뉴의 권한 설정 조회
   */
  getMenuPermissions: async (menuId: number): Promise<MenuPermission[]> => {
    const response = await apiClient.get(`/admin/menu-permissions/${menuId}`);
    return response;
  },

  /**
   * 메뉴 권한 업데이트
   */
  updateMenuPermissions: async (menuId: number, updates: MenuPermissionUpdate[]): Promise<void> => {
    await apiClient.put(`/admin/menu-permissions/${menuId}`, updates);
  },

  /**
   * 특정 역할의 메뉴 권한 조회
   */
  getRoleMenuPermissions: async (roleName: string): Promise<MenuPermission[]> => {
    const response = await apiClient.get(`/admin/menu-permissions/role/${roleName}`);
    return response;
  },

  // 사용자 역할 관리

  /**
   * 사용자 목록 조회 (권한 정보 포함)
   */
  getUsers: async (): Promise<UserWithRoles[]> => {
    const response = await apiClient.get('/admin/users');
    return response;
  },

  /**
   * 특정 사용자의 역할 조회
   */
  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const response = await apiClient.get(`/admin/users/${userId}/roles`);
    return response;
  },

  /**
   * 사용자에게 역할 할당
   */
  assignUserRole: async (userId: string, assignData: UserRoleAssign): Promise<void> => {
    await apiClient.post(`/admin/users/${userId}/roles`, assignData);
  },

  /**
   * 사용자의 역할 해제
   */
  revokeUserRole: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}/roles/${roleId}`);
  },

  /**
   * 사용자 역할 일괄 업데이트
   */
  updateUserRoles: async (userId: string, roleIds: string[]): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/roles`, roleIds);
  },

  // 역할 관리

  /**
   * 역할 목록 조회
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/admin/roles');
    return response;
  },

  // 통계 및 모니터링

  /**
   * 권한 통계 조회
   */
  getPermissionStatistics: async (): Promise<PermissionStatistics> => {
    const response = await apiClient.get('/admin/statistics');
    return response;
  },

  /**
   * 메뉴별 권한 통계 조회
   */
  getMenuPermissionStatistics: async (): Promise<MenuPermissionStat[]> => {
    const response = await apiClient.get('/admin/statistics/menu-permissions');
    return response;
  },

  /**
   * 역할별 권한 통계 조회
   */
  getRolePermissionStatistics: async (): Promise<RolePermissionStat[]> => {
    const response = await apiClient.get('/admin/statistics/role-permissions');
    return response;
  }
};

export default adminApi;