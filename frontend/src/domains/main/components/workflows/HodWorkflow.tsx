/**
 * 부서장 내부통제 항목 현황 워크플로우 컴포넌트
 * ledger_orders_hod 테이블의 최신 상태를 기반으로 워크플로우를 표시합니다.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type LedgerOrdersHodStatusResponse } from '../../api/newMainDashboardApi';

// 부서장 워크플로우 단계 정의
const HOD_WORKFLOW_STEPS = [
  { code: 'P5', label: '부서장 진행중', description: '부서장 내부통제 항목 진행', icon: InProgressIcon },
  { code: 'P6', label: '부서장확정', description: '부서장 내부통제 항목 확정 완료', icon: CheckIcon }
];

const HodWorkflow: React.FC = () => {
  const [workflowData, setWorkflowData] = useState<LedgerOrdersHodStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        setLoading(true);
        const data = await newMainDashboardApi.getLedgerOrdersHodStatus();
        setWorkflowData(data);
        setError(null);
      } catch (err) {
        console.error('부서장 워크플로우 상태 조회 실패:', err);
        setError('워크플로우 상태를 조회할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowStatus();
  }, []);

  const getCurrentStepIndex = () => {
    if (!workflowData?.ledgerOrdersHodStatusCd) return 0;
    const currentStep = HOD_WORKFLOW_STEPS.findIndex(step => step.code === workflowData.ledgerOrdersHodStatusCd);
    return currentStep >= 0 ? currentStep : 0;
  };

  const getStepStatus = (stepIndex: number, currentIndex: number) => {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number, currentIndex: number) => {
    const status = getStepStatus(stepIndex, currentIndex);
    
    if (status === 'completed') {
      return <CheckIcon sx={{ color: '#4caf50' }} />;
    } else if (status === 'active') {
      return <InProgressIcon sx={{ color: '#ff9800' }} />;
    } else {
      return <PendingIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          워크플로우 상태 조회 중...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <BusinessIcon color="warning" sx={{ mr: 1, fontSize: 18 }} />
        <Typography variant="body1" fontWeight="bold">
          부서장 내부통제 항목 현황
        </Typography>
        <Chip 
          label={workflowData?.ledgerOrdersHodStatusName || '상태 불명'}
          color={getStatusColor(getStepStatus(currentStepIndex, currentStepIndex))}
          size="small"
          sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
        />
      </Box>

      {/* 진행률 바 */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            진행률
          </Typography>
          <Typography variant="caption" fontWeight="bold" color="warning.main">
            {Math.round((currentStepIndex + 1) / HOD_WORKFLOW_STEPS.length * 100)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(currentStepIndex + 1) / HOD_WORKFLOW_STEPS.length * 100}
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: '#fff3e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#ff9800'
            }
          }}
        />
      </Box>

      {/* 간단한 스테퍼 */}
      <Box sx={{ flex: 1 }}>
        {HOD_WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(index, currentStepIndex);
          
          return (
            <Box key={step.code} sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1 }}>
              {getStepIcon(index, currentStepIndex)}
              <Box sx={{ ml: 1, flex: 1 }}>
                <Typography 
                  variant="caption" 
                  fontWeight={status === 'active' ? 'bold' : 'normal'}
                  color={status === 'completed' ? 'success.main' : 
                         status === 'active' ? 'warning.main' : 'text.secondary'}
                >
                  {step.label}
                </Typography>
                {status === 'active' && (
                  <Chip 
                    label="진행중" 
                    color="warning" 
                    size="small" 
                    sx={{ ml: 1, fontSize: '0.6rem', height: 16 }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 상태 요약 */}
      <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="textSecondary" display="block">
          현재: {HOD_WORKFLOW_STEPS[currentStepIndex]?.label || '알 수 없음'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default HodWorkflow;