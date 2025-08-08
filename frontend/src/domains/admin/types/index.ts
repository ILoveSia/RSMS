/**
 * 관리자 도메인 타입 정의
 * 권한 관리 관련 타입들을 정의합니다.
 */

// 메뉴 권한 관련 타입
export interface MenuInfo {
  menuId: number;
  menuName: string;
  menuPath: string;
  menuOrder: number;
  parentId: number | null;
  level: number;
}

export interface PermissionSet {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface MenuPermissionMatrix {
  menus: MenuInfo[];
  roles: string[];
  permissionMatrix: Record<number, Record<string, PermissionSet>>;
}

export interface MenuPermission {
  id?: number;
  menuId: number;
  menuName: string;
  menuPath: string;
  roleName: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface MenuPermissionUpdate {
  roleName: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

// 사용자 역할 관련 타입
export interface UserRoleInfo {
  roleId: string;
  roleName?: string;
  roleDescription?: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface PermissionSummary {
  totalMenus: number;
  accessibleMenus: number;
  readableMenus: number;
  writableMenus: number;
  deletableMenus: number;
  highestRole: string;
}

export interface UserWithRoles {
  userId: string;
  userName: string;
  email: string;
  empNo?: string;
  department?: string;        // 부서코드
  departmentName?: string;    // 부서명
  position?: string;          // 직급코드
  positionName?: string;      // 직급명
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roles: UserRoleInfo[];
  permissionSummary?: PermissionSummary;
}

/** 사용자 생성 요청 */
export interface CreateUserRequest {
  userId: string;
  userName: string;
  email: string;
  empNo?: string;
  // DB 컬럼 호환 필드 (스키마 준수)
  address?: string;
  mobile?: string;
  password?: string;
  deptCd?: string;
  jobRankCd?: string;
  // 프론트 편의 필드
  department?: string;
  departmentName?: string;
  position?: string;
  positionName?: string;
  isActive?: boolean;
  /** 초기 할당할 역할 ID 목록 */
  roleIds?: string[];
}

export interface UserRole {
  userId: string;
  roleId: string;
  roleName?: string;
  roleDescription?: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface UserRoleAssign {
  roleId: string;
  assignedBy?: string;
}

// 역할 관련 타입
export interface Role {
  roleId: string;
  roleName: string;
  roleDescription?: string;
  roleLevel?: number;
  isActive: boolean;
  userCount: number;
  permissionCount: number;
}

// 통계 관련 타입
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersWithRoles: number;
  usersWithMultipleRoles: number;
  averageRolesPerUser: number;
}

export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  rolesInUse: number;
  mostUsedRole: string;
  leastUsedRole: string;
}

export interface MenuStats {
  totalMenus: number;
  menusWithPermissions: number;
  publicMenus: number;
  restrictedMenus: number;
  averagePermissionsPerMenu: number;
}

export interface PermissionDistribution {
  roleName: string;
  readPermissions: number;
  writePermissions: number;
  deletePermissions: number;
  permissionCoverage: number;
}

export interface PermissionStatistics {
  userStats: UserStats;
  roleStats: RoleStats;
  menuStats: MenuStats;
  permissionDistribution: PermissionDistribution[];
}

export interface MenuPermissionStat {
  menuId: number;
  menuName: string;
  menuPath: string;
  menuOrder: number;
  readCount: number;
  writeCount: number;
  deleteCount: number;
  totalRoles: number;
}

export interface RolePermissionStat {
  roleName: string;
  roleDescription?: string;
  userCount: number;
  readCount: number;
  writeCount: number;
  deleteCount: number;
  totalMenus: number;
}

// UI 상태 관련 타입
export interface PermissionEditState {
  menuId: number;
  roleName: string;
  permissions: PermissionSet;
  isEditing: boolean;
}

export interface UserRoleEditState {
  userId: string;
  selectedRoles: string[];
  isEditing: boolean;
}

// 필터 및 검색 관련 타입
export interface MenuPermissionFilter {
  menuName?: string;
  roleName?: string;
  permissionLevel?: 'NONE' | 'READ' | 'WRITE' | 'FULL';
}

export interface UserFilter {
  userName?: string;
  department?: string;
  roleName?: string;
  isActive?: boolean;
}