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
} from '@mui/material';
import type { ReactNode } from 'react';
import React from 'react';

export type DialogMode = 'create' | 'edit' | 'view' | 'onlyRead';

export interface BaseDialogProps {
  open: boolean;
  mode: DialogMode;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  onModeChange?: (mode: DialogMode) => void;
  disableSave?: boolean;
  customActions?: ReactNode;
  loading?: boolean;
  showEditButton?: boolean;    // 수정 버튼 표시 여부
  showSaveButton?: boolean;    // 저장 버튼 표시 여부
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  mode,
  title,
  maxWidth = 'md',
  children,
  onClose,
  onSave,
  onModeChange,
  disableSave = false,
  customActions,
  loading = false,
  showEditButton = true,
  showSaveButton = true,
}) => {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  const handleEdit = () => {
    onModeChange?.('edit');
  };

  const handleCancel = () => {
    if (isEditMode) {
      onModeChange?.('view');
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      fullWidth
      onClose={(_, reason) => {
        if (reason !== 'backdropClick' && !loading) {
          onClose();
        }
      }}
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
          <IconButton
            onClick={onClose}
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
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3,
          paddingX: 5,
          backgroundColor: 'var(--bank-bg-paper)',
          '& .MuiTextField-root.Mui-disabled': {
            backgroundColor: '#f8fafc',
            '& .MuiInputBase-input.Mui-disabled': {
              color: 'black',
              WebkitTextFillColor: 'black',
              fontWeight: 600,
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: 'black',
              fontWeight: 700,
            },
          },
          '& .MuiSelect-select.Mui-disabled': {
            backgroundColor: '#f8fafc',
            color: 'black',
            WebkitTextFillColor: 'black',
            fontWeight: 600,
          },
          '& .MuiInputLabel-root.Mui-disabled': {
            color: 'black',
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
      </DialogActions>
    </Dialog>
  );
};

export default BaseDialog;
