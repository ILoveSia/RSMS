/**
 * 결재 현황 표시 다이얼로그
 * 결재 상세 정보와 진행 현황을 표시합니다.
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import type { ApprovalStatusResponse } from '../../../domains/approval/api/approvalApi';
import ApprovalStepIndicator from './ApprovalStepIndicator';
import { getCodeNameSync, useCommonCodes } from '@/shared/utils/codeUtils';

// Props 인터페이스
interface ApprovalStatusDialogProps {
  open: boolean;
  approvalData: ApprovalStatusResponse;
  onClose: () => void;
}

/**
 * 결재 현황 다이얼로그
 */
const ApprovalStatusDialog: React.FC<ApprovalStatusDialogProps> = ({
  open,
  approvalData,
  onClose,
}) => {
  // 공통코드 데이터 가져오기
  const allCodes = useCommonCodes();

  // 업무 타입 코드명 가져오기
  const getTaskTypeName = (taskTypeCd: string) => {
    return getCodeNameSync(allCodes, 'TASK_TYPE', taskTypeCd);
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'IN_PROGRESS':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'info';
    }
  };

  // 진행률 계산
  const getProgressRate = () => {
    const completedSteps = approvalData.steps.filter(step => 
      step.status === 'APPROVED'
    ).length;
    return Math.round((completedSteps / approvalData.totalSteps) * 100);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="primary" />
          <Typography variant="h6">결재 현황</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* 기본 정보 */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {getTaskTypeName(approvalData.taskTypeCd || approvalData.taskTitle)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={approvalData.statusName}
                    color={getStatusColor(approvalData.status) as any}
                  />
                  <Chip
                    size="small"
                    label={`${getProgressRate()}% 완료`}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">요청자</Typography>
                </Box>
                <Typography variant="body2">{approvalData.requesterName}</Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">요청일시</Typography>
                </Box>
                <Typography variant="body2">
                  {new Date(approvalData.requestDateTime).toLocaleString()}
                </Typography>
              </Box>

              {approvalData.approvalDateTime && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2">완료일시</Typography>
                  </Box>
                  <Typography variant="body2">
                    {new Date(approvalData.approvalDateTime).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssignmentIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2">진행단계</Typography>
                </Box>
                <Typography variant="body2">
                  {approvalData.currentStep || 0} / {approvalData.totalSteps}
                </Typography>
              </Box>
            </Box>

            {/* 요청 사유 */}
            {approvalData.comments && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  요청 사유
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {approvalData.comments}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        {/* 결재 단계 상세 */}
        <Box>
          <Typography variant="h6" gutterBottom>
            결재 진행 현황
          </Typography>
          <ApprovalStepIndicator
            steps={approvalData.steps}
            currentStep={approvalData.currentStep}
            orientation="vertical"
            showDetails={true}
          />
        </Box>

        {/* 단계별 상세 정보 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            단계별 상세 정보
          </Typography>
          {approvalData.steps.map((step) => (
            <Card key={step.stepOrder} sx={{ mb: 1 }} variant="outlined">
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {step.stepOrder}차 결재: {step.approverName}
                      </Typography>
                      <Chip
                        size="small"
                        label={step.statusName}
                        color={getStatusColor(step.status) as any}
                      />
                    </Box>
                    
                    {step.approvedDateTime && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        처리일시: {new Date(step.approvedDateTime).toLocaleString()}
                      </Typography>
                    )}
                    
                    {step.comments && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        의견: {step.comments}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalStatusDialog;