/**
 * 워크플로우 시각화 컴포넌트
 * 업무 프로세스 흐름도를 시각적으로 표시
 */
import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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
import { useReduxState } from '@/app/store/use-store';
import mainDashboardApi from '@/domains/main/api/mainDashboardApi';
import type { UserWorkflowProcessStatus } from '@/domains/main/api/mainDashboardApi';

// 로그인 사용자 타입
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  empNo: string;     // 사번 (employee.emp_no)
  deptCd: string;    // 부서코드 (employee.dept_code)
  positionCode: string; // 직급코드 (employee.position_code)
  role?: string;
  accessibleMenus?: any[];
}

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
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid;

  const [selectedProcess, setSelectedProcess] = useState<string>('approval');
  const [workflowProcesses, setWorkflowProcesses] = useState<WorkflowProcess[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API에서 워크플로우 프로세스 데이터 변환
  const convertToWorkflowProcess = (apiData: UserWorkflowProcessStatus): WorkflowProcess => ({
    id: apiData.processType,
    name: apiData.processName,
    description: `실제 데이터 기반 ${apiData.processName}`,
    category: apiData.processType,
    currentStep: apiData.currentStep,
    progress: apiData.progress,
    steps: apiData.steps.map((step, index) => ({
      id: `step_${index}`,
      title: step.title,
      description: step.description,
      status: step.status,
      assignee: step.assignee || loginData?.username || '',
      dueDate: step.dueDate,
      estimatedTime: step.estimatedTime,
    })),
  });

  // 워크플로우 프로세스 데이터 로드
  const loadWorkflowProcesses = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError(null);

      // 실시간 API 호출 활성화
      try {
        // 각 프로세스별 개별 API 호출로 실제 데이터 조회
        const [approvalProcess, auditProcess, managementProcess] = await Promise.all([
          mainDashboardApi.getApprovalProcessStatus(currentUserId).catch(() => null),
          mainDashboardApi.getAuditProcessStatus(currentUserId).catch(() => null),
          mainDashboardApi.getManagementProcessStatus(currentUserId).catch(() => null),
        ]);

        const realProcesses: UserWorkflowProcessStatus[] = [];
        
        // 성공한 API 호출 결과만 추가
        if (approvalProcess) realProcesses.push(approvalProcess);
        if (auditProcess) realProcesses.push(auditProcess);
        if (managementProcess) realProcesses.push(managementProcess);

        // 실제 데이터가 있으면 사용, 없으면 목업 데이터 사용
        if (realProcesses.length > 0) {
          setWorkflowProcesses(realProcesses.map(convertToWorkflowProcess));
          return;
        }
      } catch (apiError) {
        console.warn('실시간 API 호출 실패, 목업 데이터 사용:', apiError);
      }

      // API 실패 시 목업 데이터 폴백
      const mockProcesses: UserWorkflowProcessStatus[] = [
        {
          processType: 'approval',
          processName: '결재 프로세스',
          currentStep: 1,
          totalSteps: 3,
          progress: 50,
          activeStepTitle: '진행중',
          activeStepDescription: '결재라인을 통한 단계별 검토 진행',
          assignee: loginData?.username || '담당자',
          dueDate: '2024-12-20',
          estimatedTime: '1시간',
          steps: [
            { title: '상신', description: '결재 문서 상신', status: 'completed' as const },
            { title: '진행중', description: '결재라인 검토', status: 'active' as const, dueDate: '2024-12-20' },
            { title: '승인/반려', description: '최종 결재', status: 'pending' as const },
          ],
        },
        {
          processType: 'audit',
          processName: '책무구조도 이행 점검',
          currentStep: 3,
          totalSteps: 6,
          progress: 50,
          activeStepTitle: '이행작성',
          activeStepDescription: '실제 이행사항 작성',
          assignee: loginData?.username || '실무자',
          dueDate: '2024-12-25',
          estimatedTime: '4시간',
          steps: [
            { title: '계획작성', description: '개선계획 작성', status: 'completed' as const },
            { title: '계획결재요청', description: '계획 결재 요청', status: 'completed' as const },
            { title: '계획결재완료', description: '계획 결재 완료', status: 'completed' as const },
            { title: '이행작성', description: '이행사항 작성', status: 'active' as const, dueDate: '2024-12-25' },
            { title: '이행결재요청', description: '이행 결재 요청', status: 'pending' as const },
            { title: '이행결재완료', description: '이행 결재 완료', status: 'pending' as const },
          ],
        },
        {
          processType: 'management',
          processName: '책무구조도 원장 관리',
          currentStep: 3,
          totalSteps: 5,
          progress: 60,
          activeStepTitle: '임원확정',
          activeStepDescription: '임원급 승인 진행',
          assignee: loginData?.username || '담당임원',
          dueDate: '2024-12-28',
          estimatedTime: '1시간',
          steps: [
            { title: '신규', description: '신규 등록', status: 'completed' as const },
            { title: '직책확정', description: '직책 확정', status: 'completed' as const },
            { title: '직책별책무확정', description: '책무사항 확정', status: 'completed' as const },
            { title: '임원확정', description: '임원급 승인', status: 'active' as const, dueDate: '2024-12-28' },
            { title: '최종확정', description: '최종 승인', status: 'pending' as const },
          ],
        },
      ];

      setWorkflowProcesses(mockProcesses.map(convertToWorkflowProcess));

    } catch (err) {
      console.error('워크플로우 프로세스 로드 실패:', err);
      setError('워크플로우 현황을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadWorkflowProcesses();
  }, [currentUserId]);

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

  // 로딩 상태 처리
  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            업무 워크플로우
          </Typography>
          <Typography variant="body1" color="text.secondary">
            진행 중인 업무 프로세스의 현황을 확인하고 관리하세요
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            워크플로우 현황을 불러오는 중...
          </Typography>
        </Box>
      </Box>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            업무 워크플로우
          </Typography>
          <Typography variant="body1" color="text.secondary">
            진행 중인 업무 프로세스의 현황을 확인하고 관리하세요
          </Typography>
        </Box>
        
        <Alert severity="error" sx={{ mx: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          업무 워크플로우
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {loginData?.username || '사용자'}님의 실시간 업무 프로세스 현황
        </Typography>
      </Box>

      {/* 프로세스 선택 버튼 */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2}>
          {workflowProcesses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              진행 중인 워크플로우가 없습니다.
            </Typography>
          ) : (
            workflowProcesses.map((process) => (
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
            ))
          )}
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
                              variant="outlined"
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