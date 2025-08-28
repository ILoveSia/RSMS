/**
 * ModernAlert 컴포넌트
 * 
 * 모던한 디자인의 알림 다이얼로그 컴포넌트
 * 확인/취소 버튼을 포함한 사용자 알림을 위한 공통 컴포넌트
 */

import Alert from '@/shared/components/ui/feedback/Alert';
import Button from '@/shared/components/ui/button/Button';
import { Box, type SxProps, type Theme } from '@mui/material';
import React from 'react';

export interface ModernAlertProps {
  open: boolean;
  severity?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

const ModernAlert: React.FC<ModernAlertProps> = ({
  open,
  severity = 'warning',
  title = '알림',
  message,
  confirmText = '확인',
  cancelText = '취소',
  showCancel = false,
  onConfirm,
  onCancel,
  onClose,
  sx,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const handleBackdropClick = () => {
    if (showCancel) {
      handleCancel();
    } else {
      handleConfirm();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* 백드롭 오버레이 */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1299,
          animation: 'fadeIn 0.3s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
        onClick={handleBackdropClick}
      />
      
      {/* 모던 알림창 */}
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1300,
          minWidth: '420px',
          maxWidth: '500px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          animation: 'slideIn 0.3s ease-out',
          overflow: 'hidden',
          '@keyframes slideIn': {
            from: {
              opacity: 0,
              transform: 'translate(-50%, -60%) scale(0.9)',
            },
            to: {
              opacity: 1,
              transform: 'translate(-50%, -50%) scale(1)',
            },
          },
          ...sx,
        }}
      >
        {/* 알림 헤더 */}
        <Alert
          severity={severity}
          title={title}
          closable={!showCancel}
          onClose={showCancel ? undefined : handleConfirm}
          sx={{
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
            backgroundColor: 'transparent',
            '& .MuiAlert-icon': {
              fontSize: '28px',
              color: severity === 'warning' ? '#ff9800' : 
                     severity === 'error' ? '#f44336' :
                     severity === 'success' ? '#4caf50' : '#2196f3',
            },
            '& .MuiAlertTitle-root': {
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#333',
              mb: 1,
            },
            '& .MuiAlert-message': {
              fontSize: '1rem',
              color: '#555',
              lineHeight: 1.6,
            },
          }}
        >
          {message}
        </Alert>
        
        {/* 버튼 영역 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            padding: '16px 24px',
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
          }}
        >
          {showCancel && (
            <Button
              onClick={handleCancel}
              variant="outlined"
              color="primary"
              sx={{
                height: '36px',
                minWidth: '100px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={severity === 'error' ? 'error' : 'primary'}
            sx={{
              height: '36px',
              minWidth: '100px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            {confirmText}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ModernAlert;