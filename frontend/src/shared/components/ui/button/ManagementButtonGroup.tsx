/**
 * 관리 버튼 그룹 컴포넌트
 * 등록, 수정, 삭제 등 데이터 관리용 버튼들을 제공합니다.
 */
import React from 'react';
import { Box, Button } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface ManagementButtonGroupProps {
  onRegister?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
  
  // 버튼 활성화/비활성화
  registerDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  saveDisabled?: boolean;
  cancelDisabled?: boolean;
  refreshDisabled?: boolean;
  
  // 로딩 상태
  registerLoading?: boolean;
  editLoading?: boolean;
  deleteLoading?: boolean;
  saveLoading?: boolean;
  cancelLoading?: boolean;
  refreshLoading?: boolean;
  
  // 버튼 표시/숨김
  showRegister?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSave?: boolean;
  showCancel?: boolean;
  showRefresh?: boolean;
  
  // 스타일
  spacing?: number;
  align?: 'left' | 'center' | 'right';
  sx?: any;
}

/**
 * 관리 버튼 그룹 컴포넌트
 */
const ManagementButtonGroup: React.FC<ManagementButtonGroupProps> = ({
  onRegister,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onRefresh,
  
  registerDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  saveDisabled = false,
  cancelDisabled = false,
  refreshDisabled = false,
  
  registerLoading = false,
  editLoading = false,
  deleteLoading = false,
  saveLoading = false,
  cancelLoading = false,
  refreshLoading = false,
  
  showRegister = true,
  showEdit = false,
  showDelete = true,
  showSave = false,
  showCancel = false,
  showRefresh = false,
  
  spacing = 1,
  align = 'right',
  sx,
}) => {
  // 정렬 설정
  const getJustifyContent = () => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      default:
        return 'flex-end';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: spacing,
        justifyContent: getJustifyContent(),
        alignItems: 'center',
        mb: 1,
        flexShrink: 0,
        ...sx,
      }}
    >
      {/* 새로고침 버튼 */}
      {showRefresh && onRefresh && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshDisabled || refreshLoading}
          sx={{
            height: '32px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {refreshLoading ? '새로고침중...' : '새로고침'}
        </Button>
      )}

      {/* 등록 버튼 */}
      {showRegister && onRegister && (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<AddIcon />}
          onClick={onRegister}
          disabled={registerDisabled || registerLoading}
          sx={{
            height: '32px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {registerLoading ? '등록중...' : '등록'}
        </Button>
      )}

      {/* 수정 버튼 */}
      {showEdit && onEdit && (
        <Button
          variant="contained"
          color="warning"
          size="small"
          startIcon={<EditIcon />}
          onClick={onEdit}
          disabled={editDisabled || editLoading}
          sx={{
            minWidth: '80px',
            fontWeight: 600,
            color: 'var(--bank-text-primary)',
            '& .MuiSvgIcon-root': { color: 'var(--bank-text-primary)' },
          }}
        >
          {editLoading ? '수정중...' : '수정'}
        </Button>
      )}

      {/* 저장 버튼 */}
      {showSave && onSave && (
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={saveDisabled || saveLoading}
          sx={{
            height: '32px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {saveLoading ? '저장중...' : '저장'}
        </Button>
      )}

      {/* 취소 버튼 */}
      {showCancel && onCancel && (
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<CancelIcon />}
          onClick={onCancel}
          disabled={cancelDisabled || cancelLoading}
          sx={{
            height: '32px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {cancelLoading ? '취소중...' : '취소'}
        </Button>
      )}

      {/* 삭제 버튼 */}
      {showDelete && onDelete && (
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          disabled={deleteDisabled || deleteLoading}
          sx={{
            height: '32px',
            minWidth: '80px',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {deleteLoading ? '삭제중...' : '삭제'}
        </Button>
      )}
    </Box>
  );
};

export default ManagementButtonGroup;