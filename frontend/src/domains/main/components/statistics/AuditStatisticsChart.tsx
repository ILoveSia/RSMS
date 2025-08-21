/**
 * 점검항목 통계 차트 컴포넌트
 * 전체, 적정, 미흡, 적정수행율, 이행완료율을 차트로 표시합니다.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Assessment as ChartIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  RemoveCircleOutline as ExcludeIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type AuditStatisticsResponse } from '../../api/newMainDashboardApi';

const AuditStatisticsChart: React.FC = () => {
  const [statistics, setStatistics] = useState<AuditStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await newMainDashboardApi.getAuditStatistics();
        setStatistics(data);
        setError(null);
      } catch (err) {
        console.error('점검 통계 조회 실패:', err);
        setError('점검 통계를 조회할 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            통계 데이터 조회 중...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Paper>
    );
  }

  if (!statistics) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info" sx={{ width: '100%' }}>
          통계 데이터가 없습니다.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 통계 카드들 */}
      <Grid container spacing={1} sx={{ flex: 1 }}>
        {/* 전체 항목 */}
        <Grid item xs={2.4}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f3f4f6', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <AssignmentIcon sx={{ fontSize: 24, color: '#1976d2', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="primary">
                {statistics.totalCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="medium">
                전체 항목
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 적정 항목 */}
        <Grid item xs={2.4}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f0f9f0', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <CheckIcon sx={{ fontSize: 24, color: '#4caf50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {statistics.appropriateCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="medium">
                적정 ({Math.round(statistics.appropriateRate)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 미흡 항목 */}
        <Grid item xs={2.4}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff0f0', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <CancelIcon sx={{ fontSize: 24, color: '#f44336', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {statistics.inadequateCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="medium">
                미흡 ({Math.round((statistics.inadequateCount / statistics.totalCount) * 100)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 제외 항목 */}
        <Grid item xs={2.4}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#f5f5f5', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <ExcludeIcon sx={{ fontSize: 24, color: '#9e9e9e', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="text.secondary">
                {statistics.excludedCount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="medium">
                제외 ({Math.round((statistics.excludedCount / statistics.totalCount) * 100)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 이행 완료율 */}
        <Grid item xs={2.4}>
          <Card sx={{ textAlign: 'center', backgroundColor: '#fff8e1', height: '100%' }}>
            <CardContent sx={{ py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <TrendingUpIcon sx={{ fontSize: 24, color: '#ff9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {Math.round(statistics.completionRate)}%
              </Typography>
              <Typography variant="body2" color="textSecondary" fontWeight="medium">
                이행 완료율
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AuditStatisticsChart;