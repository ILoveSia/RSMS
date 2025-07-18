/**
 * 공통 Confirm 컴포넌트
 * MUI Dialog를 기반으로 한 확인 다이얼로그
 */
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

export interface ConfirmProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const Confirm: React.FC<ConfirmProps> = ({
  open,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby='confirm-dialog-title'
      aria-describedby='confirm-dialog-description'
    >
      <DialogTitle id='confirm-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='confirm-dialog-description'>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '8px 8px', display: 'flex', mr:1, justifyContent: 'flex-end' }}>
        <Button
          onClick={onConfirm}
          variant='contained'
          color='error'
          size='small'
        >
          {confirmText}
        </Button>
        <Button
          onClick={onCancel}
          variant='contained'
          color='inherit'
          size='small'
        >
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Confirm;
