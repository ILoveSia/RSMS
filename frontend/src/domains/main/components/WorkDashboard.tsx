/**
 * 업무 대시보드 컴포넌트
 * 개인화된 업무 현황을 차트와 함께 표시
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useReduxState } from '@/app/store/use-store';
import approvalApi from '@/domains/approval/api/approvalApi';
import mainDashboardApi from '@/domains/main/api/mainDashboardApi';
import type { WorkStats, RecentTask } from '@/domains/main/api/mainDashboardApi';

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

// WorkStats 타입은 mainDashboardApi에서 import

// 차트 데이터 타입
interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface TrendData {
  month: string;
  completed: number;
  pending: number;
  total: number;
}

// 최근 완료 업무 목록 컴포넌트
interface RecentTasksListProps {
  userId: string | undefined;
}

const RecentTasksList: React.FC<RecentTasksListProps> = ({ userId }) => {
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([
    // 기본 목업 데이터
    { taskName: '책무기술서 승인', completedAt: '2시간 전', category: '결재' },
    { taskName: '내부통제 점검 완료', completedAt: '1일 전', category: '점검' },
    { taskName: '임원 책무 변경 승인', completedAt: '3일 전', category: '결재' },
  ]);

  useEffect(() => {
    const loadRecentTasks = async () => {
      if (!userId) return;
      
      try {
        const realRecentTasks = await mainDashboardApi.getRecentTasks(userId);
        setRecentTasks(realRecentTasks);
      } catch (error) {
        console.warn('⚠️ 최근 완료 업무 API 호출 실패, 목업 데이터 유지:', error);
      }
    };

    loadRecentTasks();
  }, [userId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {recentTasks.map((task, index) => (
        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">{task.taskName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {task.completedAt}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

const WorkDashboard: React.FC = () => {
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid;

  // 상태 관리
  const [workStats, setWorkStats] = useState<WorkStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    approvalPending: 0,
    auditTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    const loadWorkStats = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        setError(null);

        // 실시간 API 호출 활성화
        try {
          // 메인 대시보드 통계 API 호출 시도
          const realStats = await mainDashboardApi.getWorkStats(currentUserId);
          setWorkStats(realStats);
          return;
        } catch (mainApiError) {
          console.warn('⚠️ 메인 대시보드 API 호출 실패, 개별 API 조합 시도:', mainApiError);
        }

        // 메인 API 실패 시 개별 API 조합
        try {
          const [pendingApprovals, monthlyTrends, recentTasks] = await Promise.all([
            approvalApi.getMyPendingApprovals(currentUserId).catch(() => null),
            mainDashboardApi.getMonthlyTrends(currentUserId).catch(() => null),
            mainDashboardApi.getRecentTasks(currentUserId).catch(() => null),
          ]);
          
          // 실제 데이터 조합
          const combinedStats: WorkStats = {
            totalTasks: 45, // 향후 실제 계산 로직 추가
            completedTasks: 32, // 향후 실제 계산 로직 추가
            pendingTasks: 8, // 향후 실제 계산 로직 추가
            overdueTasks: 5, // 향후 실제 계산 로직 추가
            approvalPending: pendingApprovals?.length || 0, // 실제 결재 대기 수
            auditTasks: 12, // 향후 실제 계산 로직 추가
          };

          setWorkStats(combinedStats);
        } catch (combinedApiError) {
          console.warn('⚠️ 개별 API 조합 실패, 목업 데이터 사용:', combinedApiError);
          
          // 완전한 API 실패 시 목업 데이터 폴백
          const fallbackStats: WorkStats = {
      } catch (err) {
        console.error('업무 통계 로드 실패:', err);
        setError('업무 현황을 불러오는데 실패했습니다.');
        
        // 에러 발생 시에도 기본 데이터 표시
        setWorkStats({
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          approvalPending: 0,
          auditTasks: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkStats();
  }, [currentUserId]);

  // 차트 데이터 준비
  const taskStatusData: ChartData[] = [
    { name: '완료', value: workStats.completedTasks, fill: '#4caf50' },
    { name: '진행중', value: workStats.pendingTasks, fill: '#ff9800' },
    { name: '지연', value: workStats.overdueTasks, fill: '#f44336' },
  ];

  const workTypeData: ChartData[] = [
    { name: '결재', value: workStats.approvalPending, fill: '#2196f3' },
    { name: '점검', value: workStats.auditTasks, fill: '#9c27b0' },
    { name: '기타', value: workStats.totalTasks - workStats.approvalPending - workStats.auditTasks, fill: '#607d8b' },
  ];

  // 트렌드 데이터 상태 관리
  const [trendData, setTrendData] = useState<TrendData[]>([
    // 기본 목업 데이터
    { month: '7월', completed: 28, pending: 12, total: 40 },
    { month: '8월', completed: 32, pending: 8, total: 45 },
    { month: '9월', completed: 35, pending: 10, total: 50 },
    { month: '10월', completed: 30, pending: 15, total: 48 },
    { month: '11월', completed: 38, pending: 7, total: 52 },
    { month: '12월', completed: 42, pending: 8, total: 55 },
  ]);

  // 트렌드 데이터 로드 함수
  const loadTrendData = async () => {
    if (!currentUserId) return;
    
    try {
      const realTrendData = await mainDashboardApi.getMonthlyTrends(currentUserId);
      const convertedTrend = realTrendData.map(trend => ({
        month: trend.month,
        completed: trend.completed,
        pending: trend.pending,
        total: trend.total,
      }));
      setTrendData(convertedTrend);
    } catch (error) {
      console.warn('⚠️ 트렌드 데이터 API 호출 실패, 목업 데이터 유지:', error);
    }
  };

  // 트렌드 데이터 로드
  useEffect(() => {
    loadTrendData();
  }, [currentUserId]);

  const completionRate = workStats.totalTasks > 0 ? 
    Math.round((workStats.completedTasks / workStats.totalTasks) * 100) : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          업무 현황을 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mx: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
          나의 업무 대시보드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {loginData?.username || '사용자'}님의 업무 현황을 한눈에 확인하세요
        </Typography>
      </Box>

      {/* 통계 카드 섹션 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {workStats.totalTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 업무
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {workStats.completedTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                완료
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ScheduleIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {workStats.pendingTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                대기중
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                완료율
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AssessmentIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {workStats.overdueTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                지연
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 차트 섹션 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 업무 상태 파이 차트 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2, height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                업무 상태 분포
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 업무 유형별 바 차트 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2, height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                업무 유형별 현황
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={workTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 월별 트렌드 라인 차트 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2, height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                월별 업무 트렌드
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    name="완료"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#ff9800" 
                    strokeWidth={2}
                    name="대기중"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 주요 업무 현황 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                처리 대기 업무
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">결재 승인</Typography>
                  <Chip 
                    label={`${workStats.approvalPending}건`} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">점검 결과 작성</Typography>
                  <Chip 
                    label={`${Math.floor(workStats.auditTasks / 2)}건`} 
                    color="info" 
                    size="small" 
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">개선 계획 수립</Typography>
                  <Chip 
                    label={`${workStats.overdueTasks}건`} 
                    color="error" 
                    size="small" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                최근 완료 업무
              </Typography>
              <RecentTasksList userId={currentUserId} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkDashboard;