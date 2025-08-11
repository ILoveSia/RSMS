import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  IconButton,

  FormControl,
  Select,
  MenuItem,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  Clear as ClearIcon,

} from '@mui/icons-material';
import { PersonAddAlt1 as PersonAddAlt1Icon } from '@mui/icons-material';

import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { SearchButton, ExcelDownloadButton, Button as SharedButton } from '@/shared/components/ui/button';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
// no-op
import CreateUserDialog from '@/domains/admin/components/CreateUserDialog';
import { adminApi } from '../api/adminApi';
import EmployeeSelect from '@/domains/handover/components/EmployeeSelect';
import DepartmentSelect, { type DepartmentSearchResult } from '@/shared/components/ui/form/DepartmentSelect';
import type {
  UserWithRoles, 
  Role, 
  UserFilter,
  UserRoleInfo
} from '../types';

/**
 * 사용자 권한 컬러 매핑 함수
 * - SRP: 역할 ID → 칩 컬러 결정만 담당
 * - OCP: 새로운 역할 추가 시 switch 확장으로 대응 (기존 분기 변경 최소화)
 */
const getRoleColor = (
  roleId: string
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (roleId) {
    case 'ADMIN':
      return 'error';
    case 'MANAGER':
      return 'primary';
    case 'USER':
      return 'secondary';
    case 'AUDITOR':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * 사용자 권한 레벨 산출 함수
 * - SRP: 활성 역할 리스트를 받아 가장 높은 권한 레벨 문자열만 반환
 * - LSP/ISP: 데이터 구조에 의존하지 않고 필요한 정보만 이용
 */
const getPermissionLevel = (roles: UserRoleInfo[]): string => {
  const activeRoles = roles.filter(r => r.isActive);
  if (activeRoles.some(r => r.roleId === 'ADMIN')) return 'ADMIN';
  if (activeRoles.some(r => r.roleId === 'MANAGER')) return 'MANAGER';
  if (activeRoles.some(r => r.roleId === 'AUDITOR')) return 'AUDITOR';
  if (activeRoles.some(r => r.roleId === 'USER')) return 'USER';
  return 'NONE';
};

/**
 * 사용자 권한 관리 페이지
 * 사용자별 역할 할당 및 권한 관리를 제공합니다.
 * 
 * 설계 메모 (SOLID):
 * - SRP: 본 컴포넌트는 사용자 권한 관리 화면의 상태/렌더링을 담당합니다.
 * - OCP: 필터/표/다이얼로그 확장은 영역별 함수와 UI 블록을 분리하여 용이하게 합니다.
 * - LSP: React 컴포넌트 규약을 준수하며 교체 가능성을 보장합니다.
 * - ISP: 페이지 역할에 필요한 인터페이스(adminApi, 훅)만 의존합니다.
 * - DIP: 데이터 요청은 `adminApi`(추상화)에 의존하여 구체 네트워크 구현에서 분리합니다.
 */
const UserPermissionManagePage: React.FC = () => {
  // 상태 관리
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<UserFilter>({});
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);

  // 사용자 등록 다이얼로그 상태
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // create dialog saving state handled inside dialog component

  // 검색 팝업 상태 및 선택값
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentSearchResult | null>(null);

  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      showError('사용자 권한 정보를 불러오는데 실패했습니다.');
      console.error('사용자 권한 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 사용자명 필터
      if (filter.userName && !user.userName.includes(filter.userName)) {
        return false;
      }
      
      // 부서 필터
      if (filter.department && !user.department?.includes(filter.department)) {
        return false;
      }
      
      // 역할 필터
      if (filter.roleName) {
        const hasRole = user.roles.some(role => 
          role.roleId.includes(filter.roleName!) && role.isActive
        );
        if (!hasRole) return false;
      }
      
      // 활성 상태 필터
      if (filter.isActive !== undefined && user.isActive !== filter.isActive) {
        return false;
      }
      
      return true;
    });
  }, [users, filter]);

  // 통계 수치 메모이제이션: 렌더 비용과 불필요한 재계산을 줄임
  const totalUsers = users.length;
  const activeRoleUsersCount = useMemo(
    () => users.filter(u => u.roles.some(r => r.isActive)).length,
    [users]
  );
  const filteredUsersCount = filteredUsers.length;

  // 역할 편집 다이얼로그 열기
  const handleEditUser = useCallback((user: UserWithRoles) => {
    setSelectedUser(user);
    setEditingRoles(user.roles.filter(r => r.isActive).map(r => r.roleId));
    setEditDialogOpen(true);
  }, []);

  // 역할 토글
  const handleRoleToggle = (roleId: string) => {
    setEditingRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // 역할 변경 저장
  const handleSaveRoles = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      await adminApi.updateUserRoles(selectedUser.userId, editingRoles);
      
      // 로컬 상태 업데이트
      setUsers(prev => prev.map(user => 
        user.userId === selectedUser.userId 
          ? {
              ...user,
              roles: roles
                .filter(role => editingRoles.includes(role.roleId))
                .map(role => ({
                  roleId: role.roleId,
                  roleName: role.roleName,
                  roleDescription: role.roleDescription,
                  assignedAt: new Date().toISOString(),
                  assignedBy: 'current-user', // 실제로는 현재 사용자 ID
                  isActive: true
                }))
            }
          : user
      ));
      
      setEditDialogOpen(false);
      showSuccess('사용자 역할이 성공적으로 업데이트되었습니다.');
      
    } catch (error) {
      showError('역할 업데이트에 실패했습니다.');
      console.error('역할 업데이트 실패:', error);
    } finally {
      setSaving(false);
    }
  }, [selectedUser, editingRoles, roles, showSuccess, showError]);

  // 등록 버튼 및 다이얼로그 핸들러
  const openCreateDialog = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const closeCreateDialog = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const handleCreated = useCallback(async () => {
    showSuccess('사용자가 등록되었습니다.');
    setCreateDialogOpen(false);
    await loadData();
  }, [loadData, showSuccess]);

  // 사원/부서 선택 적용

  // 부서 선택은 DepartmentSelect에서 직접 처리하므로 별도 핸들러 불필요

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="[901] 사용자 권한 관리"
        icon={<PersonIcon />}
        description="사용자별 역할 할당 및 권한을 관리합니다"
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      />
      
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >
        {/* 검색 조건 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>사용자명</span>
          <EmployeeSelect
            value={selectedEmployee}
            onChange={(emp) => { setSelectedEmployee(emp); setFilter(prev => ({ ...prev, userName: emp?.username || '' })); }}
            size="small"
            placeholder="사원 선택"
            sx={{ minWidth: 180, maxWidth: 240 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>부서</span>
          <DepartmentSelect
            value={selectedDepartment}
            onChange={(dept) => {
              setSelectedDepartment(dept);
              setFilter(prev => ({ ...prev, department: dept?.deptName || '' }));
            }}
            size="small"
            placeholder="부서 선택"
            minWidth={160}
            maxWidth={220}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>역할</span>
          <FormControl size="small" sx={{ minWidth: 120, maxWidth: 180 }}>
            <Select
              value={filter.roleName || ''}
              onChange={(e) => setFilter({ ...filter, roleName: e.target.value })}
              displayEmpty
            >
              <MenuItem value="">전체</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <SearchButton
            onClick={loadData}
            loading={loading}
            disabled={loading}
          />
          <Button
            startIcon={<ClearIcon />}
            onClick={() => setFilter({})}
            variant="outlined"
            size="small"
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            초기화
          </Button>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              disabled={loading}
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              새로고침
            </Button>
          </Box>
        </Box>

        {/* 통계 정보 및 액션 버튼 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
          p: 2,
          backgroundColor: 'var(--bank-bg-secondary)',
          border: '1px solid var(--bank-border)',
          borderRadius: '4px',
        }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box textAlign="center">
              <Typography variant="h5" color="primary" fontWeight="bold">{totalUsers}</Typography>
              <Typography variant="caption" color="textSecondary">전체 사용자</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="secondary" fontWeight="bold">{activeRoleUsersCount}</Typography>
              <Typography variant="caption" color="textSecondary">역할 보유 사용자</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="success.main" fontWeight="bold">{filteredUsersCount}</Typography>
              <Typography variant="caption" color="textSecondary">필터된 사용자</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="warning.main" fontWeight="bold">{roles.length}</Typography>
              <Typography variant="caption" color="textSecondary">전체 역할</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <SharedButton
              onClick={openCreateDialog}
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<PersonAddAlt1Icon />}
              sx={{ fontWeight: 700 }}
            >
              사용자 등록
            </SharedButton>
            <ExcelDownloadButton
              onDownload={() => {}}
              filename="user_permissions_list"
              disabled={loading}
              loading={loading}
            />
          </Box>
        </Box>

        {/* 사용자 목록 테이블 */}
        <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <TableContainer sx={{ 
              flex: 1, 
              maxHeight: 'calc(100vh - 280px)',
              minHeight: 480,
              overflow: 'auto',
              position: 'relative',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '4px',
              },
            }}>
              <Table stickyHeader size="small" sx={{
                '& .MuiTableHead-root .MuiTableCell-root': {
                  backgroundColor: 'var(--bank-bg-secondary) !important',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                },
                '& .MuiTableRow-root': {
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'var(--bank-bg-hover)',
                  },
                },
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight="bold">사용자</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Typography variant="subtitle2" fontWeight="bold">부서/직급</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight="bold">할당된 역할</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">권한 레벨</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">최근 로그인</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      <Typography variant="subtitle2" fontWeight="bold">관리</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.userId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {user.userName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.userName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {user.departmentName || user.department || '-'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.positionName || user.position || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {user.roles.filter(r => r.isActive).map(role => (
                            <Chip
                              key={role.roleId}
                              label={role.roleId}
                              size="small"
                              color={getRoleColor(role.roleId)}
                              variant="outlined"
                            />
                          ))}
                          {user.roles.filter(r => r.isActive).length === 0 && (
                            <Chip label="역할 없음" size="small" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPermissionLevel(user.roles)}
                          size="small"
                          color={getPermissionLevel(user.roles) === 'ADMIN' ? 'error' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '미접속'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* 역할 편집 다이얼로그 */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <GroupIcon />
                사용자 역할 편집
              </Box>
              <IconButton onClick={() => setEditDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            {selectedUser && (
              <Box>
                {/* 사용자 정보 */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedUser.userName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedUser.userName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {selectedUser.email}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {selectedUser.departmentName || selectedUser.department || '-'} | {selectedUser.positionName || selectedUser.position || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Divider sx={{ my: 2 }} />

                {/* 역할 선택 */}
                <Typography variant="subtitle1" gutterBottom>
                  역할 할당
                </Typography>
                <List>
                  {roles.map(role => (
                    <ListItem key={role.roleId} divider>
                      <ListItemText
                        primary={role.roleName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {role.roleDescription}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              할당된 사용자: {role.userCount}명 | 권한 수: {role.permissionCount}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editingRoles.includes(role.roleId)}
                              onChange={() => handleRoleToggle(role.roleId)}
                              color="primary"
                            />
                          }
                          label=""
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveRoles}
              disabled={saving}
              startIcon={<SaveIcon />}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </DialogActions>
        </Dialog>
      </PageContent>
      
      {/* 사용자 등록 다이얼로그 */}
      <CreateUserDialog
        open={createDialogOpen}
        roles={roles}
        onClose={closeCreateDialog}
        onCreated={handleCreated}
      />



      {/* 부서 검색 팝업 제거: DepartmentSelect 사용으로 대체 */}

      {/* Toast 컴포넌트 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </PageContainer>
  );
};

export default UserPermissionManagePage;