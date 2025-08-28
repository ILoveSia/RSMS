import TitleSearch from '@/domains/admin/components/TitleSearch';
import { Button } from '@/shared/components/ui/button'; // Modified import
import { MenuPermissionCell } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { useApiWithNotification } from '@/shared/hooks';
import { Security as SecurityIcon } from '@mui/icons-material';
import { Alert, Box, CircularProgress, FormControl, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import type {
  MenuPermissionFilter,
  MenuPermissionMatrix,
  MenuPermissionUpdate,
  PermissionSet
} from '../types';

/**
 * 메뉴 권한 관리 페이지
 * 모든 메뉴와 역할별 권한을 매트릭스 형태로 표시하고 관리합니다.
 */

const MenuPermissionManagePage: React.FC = () => {
  // API 알림 훅
  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
    errorMessage: '메뉴 권한 정보를 불러오는 중 오류가 발생했습니다.',
  });

  // 상태 관리
  const [matrix, setMatrix] = useState<MenuPermissionMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, MenuPermissionUpdate>>(new Map());
  const [filter, setFilter] = useState<MenuPermissionFilter>({});

  // 데이터 로드
  const loadMatrix = useCallback(async () => {
    setLoading(true);
    
    const data = await callApiWithNotification(() => adminApi.getMenuPermissionMatrix());
    if (data) {
      setMatrix(data);
      setChanges(new Map());
    }
    
    setLoading(false);
  }, [callApiWithNotification]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  // 필터링된 메뉴 목록
  const filteredMenus = useMemo(() => {
    if (!matrix) return [];
    
    const filtered = matrix.menus.filter(menu => {
      // 메뉴명 필터
      if (filter.menuName && !menu.menuName.includes(filter.menuName)) {
        return false;
      }
      
      // 권한 레벨 필터
      if (filter.permissionLevel) {
        const hasMatchingPermission = matrix.roles.some(role => {
          const permissions = matrix.permissionMatrix[menu.menuId]?.[role];
          if (!permissions) return filter.permissionLevel === 'NONE';
          
          switch (filter.permissionLevel) {
            case 'NONE':
              return !permissions.canRead && !permissions.canWrite && !permissions.canDelete;
            case 'READ':
              return permissions.canRead && !permissions.canWrite && !permissions.canDelete;
            case 'WRITE':
              return permissions.canRead && permissions.canWrite && !permissions.canDelete;
            case 'FULL':
              return permissions.canRead && permissions.canWrite && permissions.canDelete;
            default:
              return false;
          }
        });
        
        if (!hasMatchingPermission) {
          return false;
        }
      }
      
      return true;
    });
    
    return filtered;
  }, [matrix, filter]);

  // 권한 변경 처리
  const handlePermissionChange = (menuId: number, roleName: string, permission: keyof PermissionSet, value: boolean) => {
    if (!matrix) return;
    
    const key = `${menuId}-${roleName}`;
    const currentPermissions = matrix.permissionMatrix[menuId]?.[roleName] || { canRead: false, canWrite: false, canDelete: false };
    
    // 새로운 권한 계산
    const newPermissions = { ...currentPermissions, [permission]: value };
    
    // 권한 의존성 처리
    if (permission === 'canDelete' && value) {
      newPermissions.canRead = true;
      newPermissions.canWrite = true;
    } else if (permission === 'canWrite' && value) {
      newPermissions.canRead = true;
    } else if (permission === 'canRead' && !value) {
      newPermissions.canWrite = false;
      newPermissions.canDelete = false;
    } else if (permission === 'canWrite' && !value) {
      newPermissions.canDelete = false;
    }
    
    // 매트릭스 업데이트
    const newMatrix = {
      ...matrix,
      permissionMatrix: {
        ...matrix.permissionMatrix,
        [menuId]: {
          ...matrix.permissionMatrix[menuId],
          [roleName]: newPermissions
        }
      }
    };
    setMatrix(newMatrix);
    
    // 변경사항 추가
    const newChanges = new Map(changes);
    newChanges.set(key, {
      roleName,
      canRead: newPermissions.canRead,
      canWrite: newPermissions.canWrite,
      canDelete: newPermissions.canDelete
    });
    setChanges(newChanges);
  };

  // 변경사항 저장
  const handleSave = useCallback(async () => {
    if (changes.size === 0) {
      callApiWithNotification(
        () => Promise.reject(new Error('저장할 변경사항이 없습니다.')),
        'custom'
      );
      return;
    }

    setSaving(true);
    
    try {
      // 메뉴별로 변경사항 그룹핑
      const changesByMenu = new Map<number, MenuPermissionUpdate[]>();
      changes.forEach((change, key) => {
        const menuId = parseInt(key.split('-')[0]);
        if (!changesByMenu.has(menuId)) {
          changesByMenu.set(menuId, []);
        }
        changesByMenu.get(menuId)!.push(change);
      });

      // 각 메뉴별로 저장
      const result = await callApiWithNotification(
        async () => {
          for (const [menuId, updates] of changesByMenu) {
            await adminApi.updateMenuPermissions(menuId, updates);
          }
          return changesByMenu.size;
        },
        'custom'
      );

      if (result) {
        setChanges(new Map());
      }
    } finally {
      setSaving(false);
    }
  }, [changes, callApiWithNotification]);

  // 필터 초기화 핸들러
  const handleReset = useCallback(() => {
    setFilter({});
  }, []);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    loadMatrix();
  }, [loadMatrix]);

  // 권한 레벨 표시
  const getPermissionLevel = (permissions: PermissionSet): string => {
    if (permissions.canDelete) return 'FULL';
    if (permissions.canWrite) return 'WRITE';
    if (permissions.canRead) return 'READ';
    return 'NONE';
  };

  // 권한 레벨 색상
  const getPermissionColor = (level: string): 'default' | 'primary' | 'secondary' | 'success' => {
    switch (level) {
      case 'FULL': return 'success';
      case 'WRITE': return 'primary';
      case 'READ': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!matrix) {
    return (
      <PageContainer>
        <Alert severity="error">메뉴 권한 정보를 불러올 수 없습니다.</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="[900] 화면별 권한 관리"
        icon={<SecurityIcon />}
        description="메뉴별 역할 권한을 매트릭스 형태로 관리합니다"
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
        <TitleSearch
          value={filter.menuName || ''}
          onChange={(value) => setFilter({ ...filter, menuName: value })}
          onEnter={handleSearch}
          disabled={loading}
          after={
            <>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>권한레벨</span>
              <FormControl size="small" sx={{ minWidth: 120, maxWidth: 180 }}>
                <Select
                  value={filter.permissionLevel || ''}
                  onChange={(e) => setFilter({ ...filter, permissionLevel: e.target.value as any })}
                  displayEmpty
                >
                  <MenuItem value="">전체</MenuItem>
                  <MenuItem value="NONE">권한 없음</MenuItem>
                  <MenuItem value="READ">읽기 전용</MenuItem>
                  <MenuItem value="WRITE">읽기/쓰기</MenuItem>
                  <MenuItem value="FULL">전체 권한</MenuItem>
                </Select>
              </FormControl>
              <Button
                preset="search" // Modified
                onClick={handleSearch}
                loading={loading}
                disabled={loading}
              />
              <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <Button
                  preset="save" // Modified
                  onClick={handleSave}
                  disabled={saving || changes.size === 0}
                  loading={saving}
                  children={saving ? '저장 중...' : `변경사항 저장 (${changes.size})`} // Modified
                />
                <Button preset="refresh" disabled={loading} onClick={loadMatrix} /> {/* Modified */}
              </Box>
            </>
          }
        />

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
              <Typography variant="h5" color="primary" fontWeight="bold">{matrix.menus.length}</Typography>
              <Typography variant="caption" color="textSecondary">전체 메뉴</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="secondary" fontWeight="bold">{matrix.roles.length}</Typography>
              <Typography variant="caption" color="textSecondary">전체 역할</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="success.main" fontWeight="bold">{filteredMenus.length}</Typography>
              <Typography variant="caption" color="textSecondary">필터된 메뉴</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" color="warning.main" fontWeight="bold">{changes.size}</Typography>
              <Typography variant="caption" color="textSecondary">변경사항</Typography>
            </Box>
          </Box>
        </Box>

        {/* 권한 매트릭스 테이블 */}
        <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e0e3e7',
            borderRadius: '8px',
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
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
                backgroundColor: '#f4f6f8 !important',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e0e3e7',
                color: '#1c2025',
                padding: '12px 16px',
                borderRight: '1px solid #e0e3e7',
                '&:last-child': {
                  borderRight: 'none',
                }
              },
              '& .MuiTableBody-root .MuiTableRow-root': {
                cursor: 'pointer',
                borderBottom: '1px solid #e0e3e7',
                '&:hover': {
                  backgroundColor: '#f4f6f8',
                },
                '&:last-child': {
                  borderBottom: 'none',
                }
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                borderBottom: '1px solid #e0e3e7',
                borderRight: '1px solid #e0e3e7',
                padding: '12px 16px',
                fontSize: '0.875rem',
                '&:last-child': {
                  borderRight: 'none',
                },
                '&:first-of-type': {
                  fontWeight: 500,
                }
              },
            }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Typography variant="subtitle2" fontWeight="bold">메뉴</Typography>
                  </TableCell>
                  {matrix.roles.map(role => (
                    <TableCell key={role} align="center" sx={{ minWidth: 120 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{role}</Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMenus.map(menu => (
                  <TableRow key={menu.menuId} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {menu.menuName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {menu.menuPath}
                        </Typography>
                      </Box>
                    </TableCell>
                    {matrix.roles.map(role => {
                      const permissions = matrix.permissionMatrix[menu.menuId]?.[role] || 
                                        { canRead: false, canWrite: false, canDelete: false };
                      const level = getPermissionLevel(permissions);
                      const hasChanges = changes.has(`${menu.menuId}-${role}`);
                      
                      return (
                        <TableCell key={`${menu.menuId}-${role}`} align="center">
                          <MenuPermissionCell
                            menuId={menu.menuId}
                            roleName={role}
                            permissions={permissions}
                            hasChanges={hasChanges}
                            onPermissionChange={handlePermissionChange}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* 변경사항 알림 */}
        {changes.size > 0 && (
          <Alert severity="info" sx={{ mt: 2, mb: 1, flexShrink: 0 }}>
            {changes.size}개의 권한 변경사항이 있습니다. 저장 버튼을 클릭하여 적용하세요.
          </Alert>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default MenuPermissionManagePage;
