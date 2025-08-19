import apiClient from '@/app/common/api/client';
import type {
  MenuPermissionMatrix,
  MenuPermission,
  MenuPermissionUpdate,
  UserWithRoles,
  UserRole,
  UserRoleAssign,
  Role,
  EmployeeBasic,
  PermissionStatistics,
  MenuPermissionStat,
  RolePermissionStat,
  CreateUserRequest,
  UpdateUserRequest,
  UserDetailResponse
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
    const response = await apiClient.get<MenuPermissionMatrix>('/admin/menu-permissions');
    return response;
  },

  /**
   * 특정 메뉴의 권한 설정 조회
   */
  getMenuPermissions: async (menuId: number): Promise<MenuPermission[]> => {
    const response = await apiClient.get<MenuPermission[]>(`/admin/menu-permissions/${menuId}`);
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
    const response = await apiClient.get<MenuPermission[]>(`/admin/menu-permissions/role/${roleName}`);
    return response;
  },

  // 사용자 역할 관리

  /**
   * 사용자 목록 조회 (권한 정보 포함)
   */
  getUsers: async (): Promise<UserWithRoles[]> => {
    const response = await apiClient.get<UserWithRoles[]>('/admin/users');
    return response;
  },

  /**
   * 사용자 생성
   */
  createUser: async (payload: CreateUserRequest): Promise<UserWithRoles> => {
    // 백엔드 사용자 생성 API에 맞춰 경로 수정
    const response = await apiClient.post<UserWithRoles>('/users', payload);
    return response;
  },

  /**
   * 사용자 수정
   */
  updateUser: async (id: string, payload: UpdateUserRequest): Promise<UserDetailResponse> => {
    const response = await apiClient.put<UserDetailResponse>(`/users/${id}`, payload);
    return response;
  },

  /** 사용자 상세 조회 */
  getUserDetail: async (id: string): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>(`/users/${id}`);
    return response;
  },

  /**
   * 특정 사용자의 역할 조회
   */
  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const response = await apiClient.get<UserRole[]>(`/admin/users/${userId}/roles`);
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

  /** 사용자 삭제 */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  /**
   * 사용자 역할 일괄 업데이트
   */
  updateUserRoles: async (userId: string, roleIds: string[]): Promise<void> => {
    await apiClient.put(`/admin/users/${userId}/roles`, roleIds);
  },
  getAllUsers: async (): Promise<[UserWithRoles[], Role[], EmployeeBasic[]]> => {
    const response = await Promise.all([
      adminApi.getUsers(),
      adminApi.getRoles(),
      adminApi.getEmployeesBasic(),
    ]);
    return response;
  },
  // 역할 관리

  /**
   * 역할 목록 조회
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/admin/roles');
    return response;
  },

  /** 직원(Users Employees View) 목록 조회 - emp_no 매칭용 */
  getEmployeesBasic: async (): Promise<EmployeeBasic[]> => {
    const response = await apiClient.get<EmployeeBasic[]>('/users/employees');
    return response;
  },

  // 통계 및 모니터링

  /**
   * 권한 통계 조회
   */
  getPermissionStatistics: async (): Promise<PermissionStatistics> => {
    const response = await apiClient.get<PermissionStatistics>('/admin/statistics');
    return response;
  },

  /**
   * 메뉴별 권한 통계 조회
   */
  getMenuPermissionStatistics: async (): Promise<MenuPermissionStat[]> => {
    const response = await apiClient.get<MenuPermissionStat[]>('/admin/statistics/menu-permissions');
    return response;
  },

  /**
   * 역할별 권한 통계 조회
   */
  getRolePermissionStatistics: async (): Promise<RolePermissionStat[]> => {
    const response = await apiClient.get<RolePermissionStat[]>('/admin/statistics/role-permissions');
    return response;
  }
};

export default adminApi;