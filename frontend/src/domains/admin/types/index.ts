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
  address?: string;
  mobile?: string;
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
  /** 매핑된 직원 기본 정보 (users.emp_no ↔ employees.num) */
  employee?: EmployeeBasic;
}

/** 사용자 생성 요청 */
export interface CreateUserRequest {
  /** 백엔드 UserDto.CreateRequest와 일치 */
  id: string;
  password: string;
  empNo?: string;
}

/** 사용자 수정 요청 */
export interface UpdateUserRequest {
  /** 백엔드 UserDto.UpdateRequest와 일치 (선택 필드 업데이트) */
  username?: string;
  empNo?: string;
}

/** 사용자 상세 응답 (GET /users/{id}) */
export interface UserDetailResponse {
  id: string;
  username: string;
  email: string;
  address?: string;
  mobile?: string;
  deptCd?: string;
  num?: string; // 사번
  jobRankCd?: string;
  createdAt?: string;
  updatedAt?: string;
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

/** 직원(Employees) 기본 정보: users.emp_no와 연결용 */
export interface EmployeeBasic {
  id: string;
  num: string;            // 사번 (emp_no)
  username: string;       // 성명
  deptCd: string;         // 부서 코드
  email: string;
  mobile: string;
  jobRankCd?: string;     // 직급 코드
  jobTitleCd?: string;    // 직책 코드
  deptName?: string;      // 부서명 (있을 경우)
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