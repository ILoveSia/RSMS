import React from 'react';
import { Box, Grid, Card, CardContent, Typography, type SxProps, type Theme } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import type { ApprovalSummaryResponse } from '@/domains/approval/api/approvalApi'; // Assuming this type is accessible

interface ApprovalSummaryCardsProps {
  summary: ApprovalSummaryResponse | null;
  sx?: SxProps<Theme>;
}

/**
 * 결재 대시보드의 요약 카드 영역을 표시하는 컴포넌트입니다.
 * 결재 현황(내 결재 대기, 전체 결재, 승인 완료, 반려)을 요약하여 보여줍니다.
 */
export const ApprovalSummaryCards: React.FC<ApprovalSummaryCardsProps> = ({ summary, sx }) => {
  const summaryCards = summary ? [
    {
      title: '내 결재 대기',
      value: summary.myPendingCount,
      color: 'warning' as const,
      icon: <NotificationsIcon />,
      description: '처리해야 할 결재',
    },
    {
      title: '전체 결재',
      value: summary.totalCount,
      color: 'info' as const,
      icon: <AssignmentIcon />,
      description: '전체 결재 건수',
    },
    {
      title: '승인 완료',
      value: summary.approvedCount,
      color: 'success' as const,
      icon: <CheckCircleIcon />,
      description: '승인된 결재',
    },
    {
      title: '반려',
      value: summary.rejectedCount,
      color: 'error' as const,
      icon: <CancelIcon />,
      description: '반려된 결재',
    },
  ] : [];

  if (!summary) {
    return (
      <Box sx={{ px: 2, mb: 3, ...sx }}>
        <Typography variant="body2" color="textSecondary" align="center">
          요약 데이터를 불러오는 중이거나 데이터가 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, mb: 3, ...sx }}>
      <Grid container spacing={1.5}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                border: '1px solid var(--bank-border)',
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 2,
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="h5" 
                      color={`${card.color}.main`}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {card.value.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {card.description}
                    </Typography>
                  </Box>
                  <Box sx={{ color: `${card.color}.main`, fontSize: 32 }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
