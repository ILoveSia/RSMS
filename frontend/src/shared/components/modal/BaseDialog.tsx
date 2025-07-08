import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';
import React, { ReactNode } from 'react';

export type DialogMode = 'create' | 'edit' | 'view';

export interface BaseDialogProps {
  open: boolean;
  mode: DialogMode;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  onModeChange?: (mode: DialogMode) => void;
  disableSave?: boolean;
  customActions?: ReactNode;
  loading?: boolean;
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
      onClose={(event, reason) => {
        if (reason !== 'backdropClick' && !loading) {
          onClose();
        }
      }}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
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
        }}
      >
        {customActions || (
          <>
            {isViewMode && (
              <Button
                variant="contained"
                onClick={handleEdit}
                disabled={loading}
                sx={{
                  backgroundColor: 'var(--bank-warning)',
                  '&:hover': { backgroundColor: 'var(--bank-warning-dark)' },
                  '&.Mui-disabled': {
                    backgroundColor: 'var(--bank-warning-light)',
                  },
                }}
              >
                수정
              </Button>
            )}
            {(isEditMode || isCreateMode) && (
              <Button
                variant="contained"
                onClick={onSave}
                disabled={disableSave || loading}
                sx={{
                  backgroundColor: 'var(--bank-success)',
                  '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
                  '&.Mui-disabled': {
                    backgroundColor: 'var(--bank-success-light)',
                  },
                }}
              >
                {isCreateMode ? '등록' : '저장'}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
              sx={{
                ml: 1,
                borderColor: 'var(--bank-primary)',
                color: 'var(--bank-primary)',
                '&:hover': {
                  borderColor: 'var(--bank-primary-dark)',
                  backgroundColor: 'transparent',
                },
                '&.Mui-disabled': {
                  borderColor: 'var(--bank-primary-light)',
                  color: 'var(--bank-primary-light)',
                },
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
