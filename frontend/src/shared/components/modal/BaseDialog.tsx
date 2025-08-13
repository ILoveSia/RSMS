import Button from '@/shared/components/ui/button/Button';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  type SxProps,
  type Theme,
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
  fullScreen?: boolean;
  keepMounted?: boolean;
  children: ReactNode;
  onClose: () => void;
  onBeforeClose?: () => boolean | Promise<boolean>;
  onSave?: () => void;
  onModeChange?: (mode: DialogMode) => void;
  disableSave?: boolean;
  customActions?: ReactNode;
  loading?: boolean;
  showEditButton?: boolean;    // 수정 버튼 표시 여부
  showSaveButton?: boolean;    // 저장 버튼 표시 여부
  /* Behavior */
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  /* Styling */
  paperSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  actionsSx?: SxProps<Theme>;
  dialogSx?: SxProps<Theme>;
  dividers?: boolean;
  hideCloseButton?: boolean;
  titleActions?: ReactNode;
  hideDefaultActions?: boolean;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  mode,
  title,
  maxWidth = 'md',
  fullWidth = true,
  fullScreen = false,
  keepMounted,
  children,
  onClose,
  onBeforeClose,
  onSave,
  onModeChange,
  disableSave = false,
  customActions,
  loading = false,
  showEditButton = true,
  showSaveButton = true,
  hideDefaultActions = false, 
  disableBackdropClick,
  disableEscapeKeyDown,
  paperSx,
  contentSx,
  actionsSx,
  dialogSx,
  dividers = true,
  hideCloseButton,
  titleActions,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleEdit = () => {
    onModeChange?.('edit');
  };

  const requestClose = async () => {
    if (loading) return;
    if (onBeforeClose) {
      const allow = await onBeforeClose();
      if (!allow) return;
    }
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
      fullScreen={fullScreen}
      keepMounted={keepMounted}
      onClose={(_, reason) => {
        if (reason === 'backdropClick' && disableBackdropClick) return;
        if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
        requestClose();
      }}
      PaperProps={{
        sx: {
          height: 'auto',
          maxHeight: '90vh',
          ...paperSx,
        },
      }}
      sx={dialogSx}
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
            {titleActions}
            {!hideCloseButton && (
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
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent
        dividers={dividers}
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
          ...contentSx,
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
          ...actionsSx,
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
            {(isEditMode || isCreateMode) && showSaveButton && (
              <Button
                variant="contained"
                onClick={onSave}
                disabled={disableSave || loading}
                color="success"
                sx={{
                  height: '36px !important',
                  minWidth: '80px !important',
                  fontSize: '0.875rem !important',
                  fontWeight: '600 !important',
                  borderRadius: '4px !important',
                }}
              >
                {isCreateMode ? '등록' : '저장'}
              </Button>
            )}
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
              {isEditMode ? '취소' : '닫기'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BaseDialog;
