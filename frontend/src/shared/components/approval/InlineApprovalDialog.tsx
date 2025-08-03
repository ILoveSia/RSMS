/**
 * 인라인 결재 처리 다이얼로그
 * 업무 페이지에서 바로 결재 처리할 수 있는 간소화된 다이얼로그
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { ApprovalStatusResponse } from '../../../domains/approval/api/approvalApi';
import ApprovalStepIndicator from './ApprovalStepIndicator';

// Props 인터페이스
interface InlineApprovalDialogProps {
  open: boolean;
  approvalData: ApprovalStatusResponse;
  action: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (comments: string) => void;
}

/**
 * 인라인 결재 처리 다이얼로그
 */
const InlineApprovalDialog: React.FC<InlineApprovalDialogProps> = ({
  open,
  approvalData,
  action,
  onClose,
  onConfirm,
}) => {
  // 상태 관리
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isApprove = action === 'approve';

  // 확인 핸들러
  const handleConfirm = () => {
    // 반려 시 의견 필수
    if (!isApprove && !comments.trim()) {
      setError('반려 사유를 입력해주세요.');
      return;
    }

    setError(null);
    onConfirm(comments.trim());
  };

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    setComments('');
    setError(null);
    onClose();
  };

  // 현재 단계 정보
  const currentStepInfo = approvalData.steps.find(step => 
    step.status === 'PENDING'
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isApprove ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
          <Typography variant="h6">
            {isApprove ? '결재 승인' : '결재 반려'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 결재 기본 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            결재 정보
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`${approvalData.currentStep}차 결재`} 
              size="small" 
              color="primary" 
            />
            {currentStepInfo && (
              <Chip 
                label={currentStepInfo.approverName} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
          <Typography variant="body2" color="textSecondary">
            업무: {approvalData.taskTitle}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            요청자: {approvalData.requesterName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            요청일: {new Date(approvalData.requestDateTime).toLocaleString()}
          </Typography>
        </Box>

        {/* 결재 단계 표시 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            결재 진행 현황
          </Typography>
          <ApprovalStepIndicator
            steps={approvalData.steps}
            currentStep={approvalData.currentStep}
            orientation="horizontal"
            compact
          />
        </Box>

        {/* 기존 요청 사유 표시 (있는 경우) */}
        {approvalData.comments && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              요청 사유
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {approvalData.comments}
            </Typography>
          </Box>
        )}

        {/* 의견 입력 */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label={isApprove ? "승인 의견" : "반려 사유"}
          placeholder={
            isApprove 
              ? "승인 의견을 입력하세요 (선택사항)" 
              : "반려 사유를 입력하세요 (필수)"
          }
          value={comments}
          onChange={(e) => {
            setComments(e.target.value);
            if (error) setError(null);
          }}
          required={!isApprove}
          error={!isApprove && error !== null}
          helperText={
            !isApprove && error ? error : 
            isApprove ? "승인 의견은 선택사항입니다." : "반려 사유는 필수입니다."
          }
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          취소
        </Button>
        <Button
          variant="contained"
          color={isApprove ? "success" : "error"}
          onClick={handleConfirm}
          disabled={!isApprove && !comments.trim()}
        >
          {isApprove ? '승인' : '반려'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InlineApprovalDialog;