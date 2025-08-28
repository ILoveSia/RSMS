import Button from '@/shared/components/ui/button/Button';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

export type DialogMode = 'create' | 'edit' | 'view' | 'onlyRead';

export interface BaseDialogProps {
  open: boolean;
  mode: DialogMode;
  title: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  keepMounted?: boolean;
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  onModeChange?: (mode: DialogMode) => void;
  disableSave?: boolean;
  customActions?: ReactNode;
  loading?: boolean;
  showEditButton?: boolean; // 수정 버튼 표시 여부
  hideDefaultActions?: boolean;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  mode,
  title,
  maxWidth = 'md',
  fullWidth = true,
  keepMounted,
  children,
  onClose,
  onSave,
  onModeChange,
  disableSave = false,
  customActions,
  loading = false,
  showEditButton = true,
  hideDefaultActions = false,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleEdit = () => {
    onModeChange?.('edit');
  };

  const requestClose = () => {
    if (loading) return;
    onClose();
  };

  const handleCancel = () => {
    if (isEditMode) {
      if (onModeChange) {
        onModeChange('view');
      } else {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      keepMounted={keepMounted}
      onClose={requestClose}
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            component="span"
            sx={{
              fontWeight: 600,
              color: 'var(--bank-text-primary)',
            }}
          >
            {title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={requestClose}
              size="small"
              disabled={loading}
              sx={{
                color: 'var(--bank-text-secondary)',
                '&:hover': {
                  color: 'var(--bank-text-primary)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          p: 3,
          paddingX: 5,
          backgroundColor: 'var(--bank-bg-paper)',
          '& .MuiTextField-root.Mui-disabled': {
            backgroundColor: 'var(--bank-bg-secondary)',
            '& .MuiInputBase-input.Mui-disabled': {
              color: 'var(--bank-text-primary)',
              WebkitTextFillColor: 'var(--bank-text-primary)',
              fontWeight: 600,
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: 'var(--bank-text-primary)',
              fontWeight: 700,
            },
          },
          '& .MuiSelect-select.Mui-disabled': {
            backgroundColor: 'var(--bank-bg-secondary)',
            color: 'var(--bank-text-primary)',
            WebkitTextFillColor: 'var(--bank-text-primary)',
            fontWeight: 600,
          },
          '& .MuiInputLabel-root.Mui-disabled': {
            color: 'var(--bank-text-primary)',
            fontWeight: 700,
          },
        }}
      >
        {children}
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          backgroundColor: 'var(--bank-bg-paper)',
          borderTop: '1px solid var(--bank-border)',
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
        }}
      >
        {/* CustomActions가 있으면 먼저 표시 */}
        {customActions && (
          <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
            {customActions}
          </Box>
        )}

        {/* 기본 버튼들 (customActions와 함께 표시 가능) */}
        {!hideDefaultActions && (
          <>
            {/* 취소/닫기 버튼을 먼저 배치 */}
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              color="primary"
              sx={{
                height: '36px !important',
                minWidth: '80px !important',
                fontSize: '0.875rem !important',
                fontWeight: '600 !important',
                borderRadius: '4px !important',
              }}
            >
              {isEditMode ? '취소' : isCreateMode ? '취소' : '닫기'}
            </Button>
            {/* 수정 버튼 (view 모드에서만) */}
            {isViewMode && showEditButton && (
              <Button
                variant="contained"
                onClick={handleEdit}
                disabled={loading}
                color="warning"
                sx={{
                  height: '36px !important',
                  minWidth: '80px !important',
                  fontSize: '0.875rem !important',
                  fontWeight: '600 !important',
                  borderRadius: '4px !important',
                }}
              >
                수정
              </Button>
            )}
            {/* 저장/등록 버튼 (edit/create 모드에서만) */}
            {(isEditMode || isCreateMode) && onSave && (
              <Button
                variant="contained"
                onClick={onSave}
                disabled={disableSave || loading}
                color={isCreateMode ? 'primary' : 'success'}
                sx={{
                  height: '36px !important',
                  minWidth: '80px !important',
                  fontSize: '0.875rem !important',
                  fontWeight: '600 !important',
                  borderRadius: '4px !이제 `showSaveButton`을 사용하던 부모 컴포넌트를 찾아서 수정하겠습니다. 잠시만 기다려주세요.important',
                }}
              >
                {isCreateMode ? '등록' : '저장'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BaseDialog;
