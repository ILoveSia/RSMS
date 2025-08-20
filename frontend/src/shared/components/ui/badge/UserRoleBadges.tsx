import React from 'react';
import { Box, Chip, type SxProps, type Theme } from '@mui/material';
import type { UserRoleInfo } from '@/domains/admin/types'; // Assuming this type is accessible

// 사용자 권한 컬러 매핑 함수 (UserPermissionManagePage.tsx에서 이동)
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

interface UserRoleBadgesProps {
  roles: UserRoleInfo[];
  sx?: SxProps<Theme>;
}

/**
 * 사용자에게 할당된 역할을 칩(Chip) 형태로 표시하는 컴포넌트입니다.
 * 활성 역할만 표시하며, 역할이 없을 경우 '역할 없음' 칩을 표시합니다.
 */
export const UserRoleBadges: React.FC<UserRoleBadgesProps> = ({ roles, sx }) => {
  const activeRoles = roles.filter(r => r.isActive);

  return (
    <Box display="flex" flexWrap="wrap" gap={0.5} sx={sx}>
      {activeRoles.map(role => (
        <Chip
          key={role.roleId}
          label={role.roleId||'역할 없음'}
          size="small"
          color={getRoleColor(role.roleId)}
          variant="outlined"
        />
      ))}
      {activeRoles.length === 0 && (
        <Chip label="역할 없음" size="small" variant="outlined" />
      )}
    </Box>
  );
};
