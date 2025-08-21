/**
 * 책무구조도 원장 관리 워크플로우 컴포넌트 (Bar 타입)
 * ledger_orders 테이블의 최신 상태를 기반으로 진행 상황을 Bar 형태로 표시합니다.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  AccountTree as WorkflowIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Schedule as InProgressIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type LedgerOrdersStatusResponse } from '../../api/newMainDashboardApi';

// 워크플로우 단계 정의
const WORKFLOW_STEPS = [
  { code: 'P1', label: '신규', description: '원장생성' },
  { code: 'P2', label: '직책확정', description: '직책 정보 확정' },
  { code: 'P3', label: '직책별책무확정', description: '직책별 책무 확정' },
  { code: 'P4', label: '임원확정', description: '임원 승인 완료' },
  { code: 'P5', label: '최종확정', description: '전체 프로세스 완료' }
];

const LedgerOrdersWorkflow: React.FC = () => {
  const [workflowData, setWorkflowData] = useState<LedgerOrdersStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflowStatus = async () => {
      try {
        setLoading(true);
        const data = await newMainDashboardApi.getLedgerOrdersStatus();
        setWorkflowData(data);
        setError(null);
      } catch (err) {
        console.error('워크플로우 상태 조회 실패:', err);
        setError('워크플로우 상태를 조회할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowStatus();
  }, []);

  const getCurrentStepIndex = () => {
    if (!workflowData?.ledgerOrdersStatusCd) return 0;
    const currentStep = WORKFLOW_STEPS.findIndex(step => step.code === workflowData.ledgerOrdersStatusCd);
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
      return <InProgressIcon sx={{ color: '#1976d2' }} />;
    } else {
      return <PendingIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'primary';
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
  const progressPercentage = ((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100;

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <WorkflowIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
        <Typography variant="body1" fontWeight="bold">
          책무구조도 원장 관리
        </Typography>
        <Chip 
          label={workflowData?.ledgerOrdersStatusName || '상태 불명'}
          color={getStatusColor(getStepStatus(currentStepIndex, currentStepIndex))}
          size="small"
          sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
        />
      </Box>

      {/* 진행률 바 */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            현재 상태: {workflowData?.ledgerOrdersStatusName}
          </Typography>
          <Typography variant="caption" fontWeight="bold" color="primary">
            {Math.round(progressPercentage)}% 완료
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: '#1976d2'
            }
          }}
        />
      </Box>

      {/* 단계별 표시 (Bar 형태) */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <Box key={step.code} sx={{ textAlign: 'center', flex: 1 }}>
                <Box sx={{ 
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#4caf50' : '#e0e0e0',
                  color: isCompleted ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 0.5,
                  border: isCurrent ? '2px solid #1976d2' : 'none',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {isCompleted ? '✓' : index + 1}
                </Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    color: isCurrent ? '#1976d2' : 'textSecondary'
                  }}
                >
                  {step.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    fontSize: '0.6rem',
                    color: 'textSecondary'
                  }}
                >
                  [{step.description}]
                </Typography>
              </Box>
            );
          })}
        </Box>

      </Box>
    </Paper>
  );
};

export default LedgerOrdersWorkflow;