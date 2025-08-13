/**
 * 워크플로우 시각화 컴포넌트
 * 업무 프로세스 흐름도를 시각적으로 표시
 */
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// 워크플로우 단계 타입
interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending' | 'error';
  assignee?: string;
  dueDate?: string;
  estimatedTime?: string;
  dependencies?: string[];
}

// 워크플로우 프로세스 타입
interface WorkflowProcess {
  id: string;
  name: string;
  description: string;
  category: 'approval' | 'audit' | 'management';
  steps: WorkflowStep[];
  currentStep: number;
  progress: number;
}

const WorkflowVisualization: React.FC = () => {
  const [selectedProcess, setSelectedProcess] = useState<string>('approval');

  // 워크플로우 프로세스 데이터 (실제 시스템 반영)
  const workflowProcesses: WorkflowProcess[] = [
    {
      id: 'approval',
      name: '결재 프로세스',
      description: '현재 시스템 결재 워크플로우 (ORDER_STATUS)',
      category: 'approval',
      currentStep: 1,
      progress: 50,
      steps: [
        {
          id: 'submit',
          title: '상신',
          description: '결재 문서 상신 및 결재라인 설정',
          status: 'completed',
          assignee: '김상신',
          estimatedTime: '30분',
        },
        {
          id: 'progress',
          title: '진행중',
          description: '결재라인을 통한 단계별 검토 진행',
          status: 'active',
          assignee: '이검토',
          dueDate: '2024-12-20',
          estimatedTime: '1시간',
        },
        {
          id: 'decision',
          title: '승인/반려',
          description: '최종 결재자의 승인 또는 반려 결정',
          status: 'pending',
          assignee: '박결재',
          estimatedTime: '30분',
        },
      ],
    },
    {
      id: 'audit',
      name: '책무구조도 이행 점검',
      description: '부서장 내부통제 책무구조도 이행 점검',
      category: 'audit',
      currentStep: 2,
      progress: 67,
      steps: [
        {
          id: 'planning',
          title: '점검 계획',
          description: '책무구조도 이행상황 점검 계획 수립',
          status: 'completed',
          assignee: '부서장',
          estimatedTime: '2시간',
        },
        {
          id: 'inspection',
          title: '이행 점검',
          description: '책무구조도 각 항목별 이행상황 점검',
          status: 'completed',
          assignee: '담당자',
          estimatedTime: '4시간',
        },
        {
          id: 'reporting',
          title: '점검 보고',
          description: '이행 점검 결과 보고서 작성 및 제출',
          status: 'active',
          assignee: '점검자',
          dueDate: '2024-12-25',
          estimatedTime: '2시간',
        },
      ],
    },
    {
      id: 'management',
      name: '책무구조도 원장 관리',
      description: '현재 시스템 책무구조도 원장 관리 (ORDER_STATUS)',
      category: 'management',
      currentStep: 3,
      progress: 60,
      steps: [
        {
          id: 'new',
          title: '신규',
          description: '새로운 책무구조도 등록 및 초기 작성',
          status: 'completed',
          assignee: '원장관리자',
          estimatedTime: '2시간',
        },
        {
          id: 'position_confirm',
          title: '직책 확정',
          description: '관련 직책의 확정 및 검토',
          status: 'completed',
          assignee: '직책담당자',
          estimatedTime: '1시간',
        },
        {
          id: 'responsibility_confirm',
          title: '직책별 책무 확정',
          description: '각 직책별 세부 책무사항 확정',
          status: 'completed',
          assignee: '책무담당자',
          estimatedTime: '3시간',
        },
        {
          id: 'executive_confirm',
          title: '임원 확정',
          description: '임원급에서의 승인 및 확정',
          status: 'active',
          assignee: '담당임원',
          dueDate: '2024-12-28',
          estimatedTime: '1시간',
        },
        {
          id: 'final_confirm',
          title: '최종 확정',
          description: '최고 결재권자의 최종 승인 및 확정',
          status: 'pending',
          assignee: '최고책임자',
          estimatedTime: '30분',
        },
      ],
    },
  ];

  const currentProcess = workflowProcesses.find(p => p.id === selectedProcess);

  // 상태별 아이콘 반환
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'active':
        return <PlayArrowIcon sx={{ color: '#2196f3' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return <ScheduleIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  // 상태별 색상 반환
  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'active': return '#2196f3';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          업무 워크플로우
        </Typography>
        <Typography variant="body1" color="text.secondary">
          진행 중인 업무 프로세스의 현황을 확인하고 관리하세요
        </Typography>
      </Box>

      {/* 프로세스 선택 버튼 */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2}>
          {workflowProcesses.map((process) => (
            <Button
              key={process.id}
              variant={selectedProcess === process.id ? 'contained' : 'outlined'}
              onClick={() => setSelectedProcess(process.id)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {process.name}
            </Button>
          ))}
        </Stack>
      </Box>

      {currentProcess && (
        <Box>
          {/* 프로세스 개요 카드 */}
          <Card sx={{ mb: 4, border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {currentProcess.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {currentProcess.description}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {currentProcess.progress}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    진행률
                  </Typography>
                </Box>
              </Box>

              {/* 진행률 바 */}
              <Box sx={{ width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, mb: 2 }}>
                <Box
                  sx={{
                    width: `${currentProcess.progress}%`,
                    height: '100%',
                    backgroundColor: '#2196f3',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>

              {/* 단계 정보 */}
              <Typography variant="body2" color="text.secondary">
                {currentProcess.currentStep + 1} / {currentProcess.steps.length} 단계 진행 중
              </Typography>
            </CardContent>
          </Card>

          {/* 워크플로우 단계 시각화 */}
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                프로세스 단계
              </Typography>

              <Stepper orientation="vertical">
                {currentProcess.steps.map((step, index) => (
                  <Step key={step.id} active={true}>
                    <StepLabel
                      StepIconComponent={() => getStatusIcon(step.status)}
                      sx={{
                        '& .MuiStepLabel-labelContainer': {
                          color: getStatusColor(step.status),
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {step.title}
                        </Typography>
                        <Chip
                          label={step.status === 'completed' ? '완료' : 
                                 step.status === 'active' ? '진행중' : 
                                 step.status === 'error' ? '오류' : '대기중'}
                          color={step.status === 'completed' ? 'success' : 
                                 step.status === 'active' ? 'primary' : 
                                 step.status === 'error' ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ pb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                          {step.assignee && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Typography variant="caption">
                                담당자: {step.assignee}
                              </Typography>
                            </Box>
                          )}
                          
                          {step.estimatedTime && (
                            <Typography variant="caption" color="text.secondary">
                              예상 소요시간: {step.estimatedTime}
                            </Typography>
                          )}
                          
                          {step.dueDate && (
                            <Typography variant="caption" color="error.main">
                              마감일: {step.dueDate}
                            </Typography>
                          )}
                        </Box>

                        {step.status === 'active' && (
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Tooltip title="상세 보기">
                              <IconButton size="small" color="primary">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="편집">
                              <IconButton size="small" color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button 
                              variant="contained" 
                              size="small"
                              startIcon={<AssignmentIcon />}
                              sx={{ ml: 1 }}
                            >
                              작업 수행
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default WorkflowVisualization;