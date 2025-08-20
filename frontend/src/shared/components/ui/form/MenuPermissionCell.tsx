import React from 'react';
import { Box, Chip, Checkbox, Tooltip, type SxProps, type Theme } from '@mui/material';
import { Visibility as ReadIcon, Edit as WriteIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { PermissionSet } from '@/domains/admin/types'; // Assuming this type is accessible
// 권한 레벨 표시 (MenuPermissionManagePage.tsx에서 이동)
const getPermissionLevel = (permissions: PermissionSet): string => {
  if (permissions.canDelete) return 'FULL';
  if (permissions.canWrite) return 'WRITE';
  if (permissions.canRead) return 'READ';
  return 'NONE';
};

// 권한 레벨 색상 (MenuPermissionManagePage.tsx에서 이동)
const getPermissionColor = (level: string): 'default' | 'primary' | 'secondary' | 'success' => {
  switch (level) {
    case 'FULL': return 'success';
    case 'WRITE': return 'primary';
    case 'READ': return 'secondary';
    default: return 'default';
  }
};

interface MenuPermissionCellProps {
  menuId: number;
  roleName: string;
  permissions: PermissionSet;
  hasChanges: boolean;
  onPermissionChange: (menuId: number, roleName: string, permission: keyof PermissionSet, value: boolean) => void;
  sx?: SxProps<Theme>;
}

/**
 * 메뉴 권한 매트릭스 테이블의 개별 셀을 렌더링하는 컴포넌트입니다.
 * 권한 레벨 칩과 개별 권한(읽기, 쓰기, 삭제) 체크박스를 포함합니다.
 */
export const MenuPermissionCell: React.FC<MenuPermissionCellProps> = ({
  menuId,
  roleName,
  permissions,
  hasChanges,
  onPermissionChange,
  sx,
}) => {
  const level = getPermissionLevel(permissions);

  return (
    <Box sx={sx}>
      {/* 권한 레벨 표시 */}
      <Box mb={1}>
        <Chip
          label={level}
          size="small"
          color={getPermissionColor(level)}
          variant="outlined"
        />
      </Box>

      {/* 개별 권한 체크박스 */}
      <Box display="flex" justifyContent="center" gap={0.5}>
        <Tooltip title="읽기">
          <Checkbox
            icon={<ReadIcon fontSize="small" />}
            checkedIcon={<ReadIcon fontSize="small" color="primary" />}
            checked={permissions.canRead}
            onChange={(e) => onPermissionChange(menuId, roleName, 'canRead', e.target.checked)}
            size="small"
          />
        </Tooltip>
        <Tooltip title="쓰기">
          <Checkbox
            icon={<WriteIcon fontSize="small" />}
            checkedIcon={<WriteIcon fontSize="small" color="primary" />}
            checked={permissions.canWrite}
            onChange={(e) => onPermissionChange(menuId, roleName, 'canWrite', e.target.checked)}
            size="small"
          />
        </Tooltip>
        <Tooltip title="삭제">
          <Checkbox
            icon={<DeleteIcon fontSize="small" />}
            checkedIcon={<DeleteIcon fontSize="small" color="error" />}
            checked={permissions.canDelete}
            onChange={(e) => onPermissionChange(menuId, roleName, 'canDelete', e.target.checked)}
            size="small"
          />
        </Tooltip>
      </Box>
    </Box>
  );
};