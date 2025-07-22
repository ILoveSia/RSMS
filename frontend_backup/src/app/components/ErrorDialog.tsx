/**
 * 오류 다이얼로그 컴포넌트
 * Dialog 컴포넌트를 기반으로 한 오류 표시용 다이얼로그
 */
import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import Dialog from './Dialog';

export interface ErrorDialogProps {
  /** 다이얼로그 열림/닫힘 상태 */
  open: boolean;
  /** 다이얼로그 제목 텍스트 */
  title?: string;
  /** 오류 내용 텍스트 */
  errorMessage: string;
  /** 닫기 버튼 텍스트 */
  closeText?: string;
  /** 닫기 버튼 클릭 시 호출되는 함수 */
  onClose: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  title = '오류',
  errorMessage,
  closeText = '닫기',
  onClose,
}) => {
  const actions = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button 
        onClick={onClose} 
        color="primary" 
        variant="contained"
        autoFocus
      >
        {closeText}
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      title={title}
      maxWidth="sm"
      fullWidth
      onClose={onClose}
      actions={actions}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 2, 
          py: 1 
        }}
      >
        <ErrorIcon 
          sx={{ 
            color: 'error.main', 
            fontSize: 28,
            mt: 0.5,
            flexShrink: 0
          }} 
        />
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.primary',
            lineHeight: 1.6,
            wordBreak: 'break-word'
          }}
        >
          {errorMessage}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default ErrorDialog;
