/**
 * 결재 단계 표시 컴포넌트
 * 결재 진행 단계를 시각적으로 표시합니다.
 */
import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { ApprovalStepInfo } from '../../../domains/approval/api/approvalApi';

// Props 인터페이스
interface ApprovalStepIndicatorProps {
  steps: ApprovalStepInfo[];
  currentStep?: number;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
  showDetails?: boolean;
}

/**
 * 결재 단계 표시기
 */
const ApprovalStepIndicator: React.FC<ApprovalStepIndicatorProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  compact = false,
  showDetails = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 모바일에서는 자동으로 vertical 방향으로 변경
  const actualOrientation = isMobile ? 'vertical' : orientation;

  // 단계별 상태 아이콘
  const getStepIcon = (step: ApprovalStepInfo) => {
    switch (step.status) {
      case 'APPROVED':
        return <CheckCircleIcon color="success" />;
      case 'REJECTED':
        return <CancelIcon color="error" />;
      case 'PENDING':
        return <HourglassEmptyIcon color="warning" />;
      case 'WAITING':
        return <ScheduleIcon color="disabled" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  // 단계별 상태 색상
  const getStepColor = (step: ApprovalStepInfo) => {
    switch (step.status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      case 'WAITING':
        return 'default';
      default:
        return 'default';
    }
  };

  // 활성 단계 계산
  const getActiveStep = () => {
    if (currentStep !== undefined) {
      return currentStep - 1; // 0 기반 인덱스
    }
    
    // 현재 진행 중인 단계 찾기
    const pendingStepIndex = steps.findIndex(step => step.status === 'PENDING');
    if (pendingStepIndex >= 0) {
      return pendingStepIndex;
    }
    
    // 마지막 완료된 단계
    const lastApprovedIndex = steps.map(s => s.status).lastIndexOf('APPROVED');
    return lastApprovedIndex >= 0 ? lastApprovedIndex + 1 : 0;
  };

  // 컴팩트 모드 렌더링
  const renderCompactMode = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {steps.map((step, index) => (
        <React.Fragment key={step.stepOrder}>
          <Tooltip 
            title={`${step.stepOrder}차: ${step.approverName} (${step.statusName})`}
            arrow
          >
            <Chip
              size="small"
              avatar={
                <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                  {step.stepOrder}
                </Avatar>
              }
              label={step.approverName}
              color={getStepColor(step) as any}
              variant={step.status === 'PENDING' ? 'filled' : 'outlined'}
              icon={getStepIcon(step)}
            />
          </Tooltip>
          {index < steps.length - 1 && (
            <Typography variant="caption" color="textSecondary">
              →
            </Typography>
          )}
        </React.Fragment>
      ))}
    </Box>
  );

  // 상세 모드 렌더링
  const renderDetailedMode = () => (
    <Stepper 
      activeStep={getActiveStep()} 
      orientation={actualOrientation}
      sx={{ width: '100%' }}
    >
      {steps.map((step) => (
        <Step key={step.stepOrder} completed={step.status === 'APPROVED'}>
          <StepLabel
            error={step.status === 'REJECTED'}
            icon={getStepIcon(step)}
            sx={{
              '& .MuiStepLabel-labelContainer': {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2">
                {step.stepOrder}차 결재: {step.approverName}
              </Typography>
              <Chip
                size="small"
                label={step.statusName}
                color={getStepColor(step) as any}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </StepLabel>
          
          {actualOrientation === 'vertical' && showDetails && (
            <StepContent>
              {step.approvedDateTime && (
                <Typography variant="caption" color="textSecondary">
                  처리일시: {new Date(step.approvedDateTime).toLocaleString()}
                </Typography>
              )}
              {step.comments && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  의견: {step.comments}
                </Typography>
              )}
            </StepContent>
          )}
        </Step>
      ))}
    </Stepper>
  );

  if (steps.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography color="textSecondary">결재 단계가 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {compact ? renderCompactMode() : renderDetailedMode()}
    </Box>
  );
};

export default ApprovalStepIndicator;