/**
 * 공통 Confirm 컴포넌트
 * 모던하고 세련된 확인 다이얼로그
 */
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import React from 'react';

export interface ConfirmProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'error' | 'success' | 'info';
  showIcon?: boolean;
}

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'error':
      return {
        icon: <ErrorIcon />,
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        confirmColor: 'error' as const,
      };
    case 'warning':
      return {
        icon: <WarningIcon />,
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        confirmColor: 'warning' as const,
      };
    case 'success':
      return {
        icon: <CheckIcon />,
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        confirmColor: 'success' as const,
      };
    case 'info':
    default:
      return {
        icon: <HelpIcon />,
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        confirmColor: 'primary' as const,
      };
  }
};

export const Confirm: React.FC<ConfirmProps> = ({
  open,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'info',
  showIcon = true,
}) => {
  const typeConfig = getTypeConfig(type);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      TransitionComponent={Transition}
      aria-labelledby='confirm-dialog-title'
      aria-describedby='confirm-dialog-description'
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          overflow: 'visible',
          position: 'relative',
        },
      }}
    >
      {/* Header with close button */}
      <Box sx={{ 
        position: 'relative',
        pt: 3,
        pb: 1,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        mb: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showIcon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: typeConfig.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: typeConfig.color,
                '& svg': { fontSize: '24px' },
              }}
            >
              {typeConfig.icon}
            </Box>
          )}
          <DialogTitle 
            id='confirm-dialog-title'
            sx={{ 
              p: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1a202c',
              lineHeight: 1.2,
            }}
          >
            {title}
          </DialogTitle>
        </Box>
        <IconButton
          onClick={onCancel}
          size="small"
          sx={{
            color: '#64748b',
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(100, 116, 139, 0.2)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, pb: 2, pt: 0 }}>
        <DialogContentText 
          id='confirm-dialog-description'
          sx={{
            color: '#4a5568',
            fontSize: '1rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            textAlign: 'left',
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      {/* Actions */}
      <DialogActions 
        sx={{ 
          px: 3, 
          pb: 3, 
          pt: 1,
          gap: 1,
          justifyContent: 'flex-end',
          '& .MuiButton-root': {
            minWidth: '80px',
            height: '40px',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }
        }}
      >
        <Button
          onClick={onCancel}
          variant='outlined'
          color='inherit'
          sx={{
            borderColor: '#d1d5db',
            color: '#6b7280',
            '&:hover': {
              borderColor: '#9ca3af',
              backgroundColor: 'rgba(107, 114, 128, 0.05)',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color={typeConfig.confirmColor}
          sx={{
            boxShadow: `0 4px 12px ${typeConfig.color}30`,
            '&:hover': {
              boxShadow: `0 6px 16px ${typeConfig.color}40`,
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirm;
