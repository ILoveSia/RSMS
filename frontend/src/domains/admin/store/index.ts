import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../api/adminApi';
import type {
  MenuPermissionMatrix,
  UserWithRoles,
  Role,
  PermissionStatistics,
  MenuPermissionStat,
  RolePermissionStat
} from '../types';

// 상태 타입 정의
interface AdminState {
  // 메뉴 권한 관리
  menuPermissionMatrix: MenuPermissionMatrix | null;
  menuPermissionLoading: boolean;
  menuPermissionError: string | null;
  
  // 사용자 권한 관리
  users: UserWithRoles[];
  roles: Role[];
  usersLoading: boolean;
  usersError: string | null;
  
  // 통계
  statistics: PermissionStatistics | null;
  menuStats: MenuPermissionStat[];
  roleStats: RolePermissionStat[];
  statisticsLoading: boolean;
  statisticsError: string | null;
}

// 초기 상태
const initialState: AdminState = {
  menuPermissionMatrix: null,
  menuPermissionLoading: false,
  menuPermissionError: null,
  
  users: [],
  roles: [],
  usersLoading: false,
  usersError: null,
  
  statistics: null,
  menuStats: [],
  roleStats: [],
  statisticsLoading: false,
  statisticsError: null,
};

// 비동기 액션 생성자들

// 메뉴 권한 매트릭스 조회
export const fetchMenuPermissionMatrix = createAsyncThunk(
  'admin/fetchMenuPermissionMatrix',
  async () => {
    return await adminApi.getMenuPermissionMatrix();
  }
);

// 사용자 목록 조회
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    return await adminApi.getUsers();
  }
);

// 역할 목록 조회
export const fetchRoles = createAsyncThunk(
  'admin/fetchRoles',
  async () => {
    return await adminApi.getRoles();
  }
);

// 사용자와 역할 동시 조회
export const fetchUsersAndRoles = createAsyncThunk(
  'admin/fetchUsersAndRoles',
  async () => {
    const [users, roles] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getRoles()
    ]);
    return { users, roles };
  }
);

// 권한 통계 조회
export const fetchPermissionStatistics = createAsyncThunk(
  'admin/fetchPermissionStatistics',
  async () => {
    const [statistics, menuStats, roleStats] = await Promise.all([
      adminApi.getPermissionStatistics(),
      adminApi.getMenuPermissionStatistics(),
      adminApi.getRolePermissionStatistics()
    ]);
    return { statistics, menuStats, roleStats };
  }
);

// 사용자 역할 업데이트
export const updateUserRoles = createAsyncThunk(
  'admin/updateUserRoles',
  async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
    await adminApi.updateUserRoles(userId, roleIds);
    return { userId, roleIds };
  }
);

// 슬라이스 생성
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // 메뉴 권한 매트릭스 로컬 업데이트
    updateLocalMenuPermissions: (state, action: PayloadAction<{
      menuId: number;
      roleName: string;
      permissions: { canRead: boolean; canWrite: boolean; canDelete: boolean };
    }>) => {
      if (state.menuPermissionMatrix) {
        const { menuId, roleName, permissions } = action.payload;
        if (!state.menuPermissionMatrix.permissionMatrix[menuId]) {
          state.menuPermissionMatrix.permissionMatrix[menuId] = {};
        }
        state.menuPermissionMatrix.permissionMatrix[menuId][roleName] = permissions;
      }
    },
    
    // 에러 초기화
    clearMenuPermissionError: (state) => {
      state.menuPermissionError = null;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
    clearStatisticsError: (state) => {
      state.statisticsError = null;
    },
  },
  extraReducers: (builder) => {
    // 메뉴 권한 매트릭스
    builder
      .addCase(fetchMenuPermissionMatrix.pending, (state) => {
        state.menuPermissionLoading = true;
        state.menuPermissionError = null;
      })
      .addCase(fetchMenuPermissionMatrix.fulfilled, (state, action) => {
        state.menuPermissionLoading = false;
        state.menuPermissionMatrix = action.payload;
      })
      .addCase(fetchMenuPermissionMatrix.rejected, (state, action) => {
        state.menuPermissionLoading = false;
        state.menuPermissionError = action.error.message || '메뉴 권한 정보 조회에 실패했습니다.';
      });

    // 사용자 목록
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.error.message || '사용자 정보 조회에 실패했습니다.';
      });

    // 역할 목록
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.error.message || '역할 정보 조회에 실패했습니다.';
      });

    // 사용자와 역할 동시 조회
    builder
      .addCase(fetchUsersAndRoles.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsersAndRoles.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.roles = action.payload.roles;
      })
      .addCase(fetchUsersAndRoles.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.error.message || '사용자 및 역할 정보 조회에 실패했습니다.';
      });

    // 권한 통계
    builder
      .addCase(fetchPermissionStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(fetchPermissionStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload.statistics;
        state.menuStats = action.payload.menuStats;
        state.roleStats = action.payload.roleStats;
      })
      .addCase(fetchPermissionStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.error.message || '권한 통계 조회에 실패했습니다.';
      });

    // 사용자 역할 업데이트
    builder
      .addCase(updateUserRoles.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(updateUserRoles.fulfilled, (state, action) => {
        state.usersLoading = false;
        // 로컬 상태 업데이트
        const { userId, roleIds } = action.payload;
        const userIndex = state.users.findIndex(u => u.userId === userId);
        if (userIndex !== -1) {
          // 역할 정보 업데이트 (실제로는 서버에서 다시 조회해야 하지만 여기서는 간단히 처리)
          state.users[userIndex].roles = state.roles
            .filter(role => roleIds.includes(role.roleId))
            .map(role => ({
              roleId: role.roleId,
              roleName: role.roleName,
              roleDescription: role.roleDescription,
              assignedAt: new Date().toISOString(),
              assignedBy: 'current-user',
              isActive: true
            }));
        }
      })
      .addCase(updateUserRoles.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.error.message || '사용자 역할 업데이트에 실패했습니다.';
      });
  },
});

// 액션 내보내기
export const {
  updateLocalMenuPermissions,
  clearMenuPermissionError,
  clearUsersError,
  clearStatisticsError,
} = adminSlice.actions;

// 셀렉터
export const selectMenuPermissionMatrix = (state: { admin: AdminState }) => state.admin.menuPermissionMatrix;
export const selectMenuPermissionLoading = (state: { admin: AdminState }) => state.admin.menuPermissionLoading;
export const selectMenuPermissionError = (state: { admin: AdminState }) => state.admin.menuPermissionError;

export const selectUsers = (state: { admin: AdminState }) => state.admin.users;
export const selectRoles = (state: { admin: AdminState }) => state.admin.roles;
export const selectUsersLoading = (state: { admin: AdminState }) => state.admin.usersLoading;
export const selectUsersError = (state: { admin: AdminState }) => state.admin.usersError;

export const selectStatistics = (state: { admin: AdminState }) => state.admin.statistics;
export const selectMenuStats = (state: { admin: AdminState }) => state.admin.menuStats;
export const selectRoleStats = (state: { admin: AdminState }) => state.admin.roleStats;
export const selectStatisticsLoading = (state: { admin: AdminState }) => state.admin.statisticsLoading;
export const selectStatisticsError = (state: { admin: AdminState }) => state.admin.statisticsError;

// 리듀서 내보내기
export default adminSlice.reducer;