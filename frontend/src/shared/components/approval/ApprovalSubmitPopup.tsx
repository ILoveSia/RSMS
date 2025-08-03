/**
 * 결재 상신 팝업 컴포넌트
 */
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import approvalApi, { ApprovalSubmitRequest } from '@/domains/approval/api/approvalApi';
import ApproverSelector from './ApproverSelector';
import ApprovalStepIndicator from './ApprovalStepIndicator';

// 결재자 선택 정보
interface ApproverSelection {
  step1?: string;
  step2?: string;
  step3?: string;
}

// Props 인터페이스
interface ApprovalSubmitPopupProps {
  open: boolean;
  taskType: string;
  taskId: number;
  taskTitle: string;
  requesterId: string;
  onClose: () => void;
  onSubmitSuccess: (approvalId: number) => void;
}

/**
 * 결재 상신 팝업
 */
const ApprovalSubmitPopup: React.FC<ApprovalSubmitPopupProps> = ({
  open,
  taskType,
  taskId,
  taskTitle,
  requesterId,
  onClose,
  onSubmitSuccess,
}) => {
  // 상태 관리
  const [approvers, setApprovers] = useState<ApproverSelection>({});
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSteps, setPreviewSteps] = useState<any[]>([]);

  // 결재자 선택 변경 핸들러
  const handleApproversChange = (selection: ApproverSelection) => {
    setApprovers(selection);
    setError(null);
    
    // 결재 라인 미리보기 업데이트
    const approverList = [selection.step1, selection.step2, selection.step3]
      .filter(Boolean) as string[];
    
    if (approverList.length > 0) {
      updatePreview(approverList);
    } else {
      setPreviewSteps([]);
    }
  };

  // 결재 라인 미리보기 업데이트
  const updatePreview = async (approverList: string[]) => {
    try {
      const steps = await approvalApi.previewApprovalLine(approverList);
      setPreviewSteps(steps);
    } catch (error) {
      console.error('결재 라인 미리보기 실패:', error);
      setPreviewSteps([]);
    }
  };

  // 결재 상신 핸들러
  const handleSubmit = async () => {
    if (!approvers.step1) {
      setError('1차 결재자는 필수입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 결재자 목록 생성
      const approverList = [approvers.step1, approvers.step2, approvers.step3]
        .filter(Boolean) as string[];

      // 결재 상신 요청
      const request: ApprovalSubmitRequest = {
        taskTypeCd: taskType,
        taskId: taskId,
        taskTitle: taskTitle,
        approvers: approverList,
        urgency: urgency,
        comments: comments.trim() || undefined,
      };

      const response = await approvalApi.submitApproval(request);
      
      if (response.status === 'SUCCESS') {
        onSubmitSuccess(response.approvalId);
        handleClose();
      } else {
        setError(response.message || '결재 상신에 실패했습니다.');
      }
    } catch (error) {
      console.error('결재 상신 실패:', error);
      setError(`결재 상신에 실패했습니다: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    if (!loading) {
      setApprovers({});
      setUrgency('NORMAL');
      setComments('');
      setError(null);
      setPreviewSteps([]);
      onClose();
    }
  };

  // 유효성 검증
  const isValid = approvers.step1 && !loading;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color="primary" />
          <Typography variant="h6">결재 상신</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {taskTitle}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 결재자 선택 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            결재자 선택
          </Typography>
          <ApproverSelector
            value={approvers}
            onChange={handleApproversChange}
            required={[true, false, false]} // 1차만 필수
            disabled={loading}
          />
        </Box>

        {/* 결재 라인 미리보기 */}
        {previewSteps.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              결재 라인 미리보기
            </Typography>
            <ApprovalStepIndicator
              steps={previewSteps}
              currentStep={1}
              orientation="horizontal"
              compact
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 긴급도 선택 */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>긴급도</InputLabel>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as 'NORMAL' | 'URGENT')}
              disabled={loading}
            >
              <MenuItem value="NORMAL">일반</MenuItem>
              <MenuItem value="URGENT">긴급</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {/* 결재 요청 사유 */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="결재 요청 사유"
          placeholder="결재 요청 사유를 입력하세요 (선택사항)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          취소
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!isValid}
          startIcon={loading ? undefined : <SendIcon />}
        >
          {loading ? '상신 중...' : '상신'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalSubmitPopup;