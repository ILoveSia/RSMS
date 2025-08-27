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
  /**
   * 사용자 권한 정보 배열. 'ADMIN'|'MANAGER'|'USER'|'AUDITOR' 안에서 필요한 것들을 Array 형식으로 나열
   */
  roles: UserRoleInfo[];
}

export const UserRoleBadges: React.FC<UserRoleBadgesProps> = ({ roles }) => {
  const activeRoles = roles.filter(r => r.isActive);

  return (
    <Box display="flex" flexWrap="wrap" gap={0.5}>
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
