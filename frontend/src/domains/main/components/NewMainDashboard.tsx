/**
 * 새로운 메인 대시보드 컴포넌트
 * Tab 없는 단일 페이지 스크롤 형태로 구성
 * 워크플로우, 통계, QnA/공지사항, 결재 위젯을 포함합니다.
 */
import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';

// 워크플로우 컴포넌트들
import LedgerOrdersWorkflow from './workflows/LedgerOrdersWorkflow';
import HodWorkflow from './workflows/HodWorkflow';

// 통계 컴포넌트
import AuditStatisticsChart from './statistics/AuditStatisticsChart';

// 위젯 컴포넌트들
import RecentQnaWidget from './widgets/RecentQnaWidget';
import RecentNoticeWidget from './widgets/RecentNoticeWidget';
import MyApprovalRequestsWidget from './widgets/MyApprovalRequestsWidget';
import PendingApprovalsWidget from './widgets/PendingApprovalsWidget';

const NewMainDashboard: React.FC = () => {
  const [ledgerOrdersId, setLedgerOrdersId] = useState<number | null>(null);

  // LedgerOrdersWorkflow에서 ledger_orders_id를 받는 콜백
  const handleLedgerOrdersIdReceived = useCallback((id: number) => {
    setLedgerOrdersId(id);
  }, []);
  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageHeader
        title="[001] 메인 대시보드"
        icon={<DashboardIcon />}
        description="업무 현황과 워크플로우를 한눈에 확인할 수 있는 통합 대시보드입니다."
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          mb: 1,
        }}
      />
      
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          p: 1,
          backgroundColor: '#f8fafc'
        }}
      >
        {/* 전체 컨테이너 - 고정 높이로 스크롤 방지 */}
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* 워크플로우 섹션 - 높이 제한 */}
          <Box sx={{ mb: 4, flex: '0 0 auto', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold" color="primary">
                워크플로우 현황
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ height: '180px' }}>
              {/* 책무구조도 원장 관리 워크플로우 */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%' }}>
                  <LedgerOrdersWorkflow onLedgerOrdersIdReceived={handleLedgerOrdersIdReceived} />
                </Box>
              </Grid>
              
              {/* 부서장 내부통제 항목 현황 워크플로우 */}
              <Grid item xs={12} md={6}>
                <Box sx={{ height: '100%' }}>
                  <HodWorkflow ledgerOrdersId={ledgerOrdersId} />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 통계 섹션 - 높이 제한 */}
          <Box sx={{ mb: 4, flex: '0 0 auto', pt: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold" color="secondary">
                점검항목 통계
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ height: '150px' }}>
              <Grid item xs={12}>
                <Box sx={{ height: '100%' }}>
                  <AuditStatisticsChart ledgerOrdersId={ledgerOrdersId} />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* 하단 섹션 - 높이 제한 */}
          <Box sx={{ flex: '0 0 auto', maxHeight: '140px', minHeight: '120px' }}>
            <Grid container spacing={2} sx={{ height: '120px' }}>
              {/* QnA 위젯 */}
              <Grid item xs={12} lg={3}>
                <Box sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationIcon color="info" sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1" fontWeight="bold" color="info.main">
                      최근 Q&A
                    </Typography>
                  </Box>
                  <RecentQnaWidget />
                </Box>
              </Grid>
              
              {/* 공지사항 위젯 */}
              <Grid item xs={12} lg={3}>
                <Box sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationIcon color="secondary" sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1" fontWeight="bold" color="secondary.main">
                      공지사항
                    </Typography>
                  </Box>
                  <RecentNoticeWidget />
                </Box>
              </Grid>
              
              {/* 내 결재 신청 위젯 */}
              <Grid item xs={12} lg={3}>
                <Box sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      내 결재 신청
                    </Typography>
                  </Box>
                  <MyApprovalRequestsWidget />
                </Box>
              </Grid>
              
              {/* 처리 대기 결재 위젯 */}
              <Grid item xs={12} lg={3}>
                <Box sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssignmentIcon color="warning" sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                      처리 대기 결재
                    </Typography>
                  </Box>
                  <PendingApprovalsWidget />
                </Box>
              </Grid>
            </Grid>
          </Box>
          
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default NewMainDashboard;