/**
 * 처리 대기 결재 위젯 컴포넌트
 * 로그인 사용자가 처리해야 할 결재 목록을 표시합니다.
 */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Badge
} from '@mui/material';
import {
  PendingActions as PendingIcon,
  Schedule as ClockIcon,
  Person as PersonIcon,
  PriorityHigh as UrgentIcon,
  ArrowForward as ArrowIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type PendingApprovalResponse } from '../../api/newMainDashboardApi';
import { useReduxState } from '@/app/store/use-store';
import { useTabContext } from '@/shared/context/TabContext';

// ApprovalDashboardPage 동적 import
const ApprovalDashboardPage = React.lazy(() => import('@/domains/approval/pages/ApprovalDashboardPage'));

// LoginUser 타입
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  empNo: string;
  deptCd: string;
  positionCode: string;
  role?: string;
  accessibleMenus?: any[];
}

const PendingApprovalsWidget: React.FC = () => {
  const { addTab } = useTabContext();
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const [pendingList, setPendingList] = useState<PendingApprovalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePendingApprovalClick = () => {
    addTab({
      title: '결재 대시보드',
      path: '/approval/dashboard',
      component: <ApprovalDashboardPage />,
      closable: true,
    });
  };

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (!loginData?.userid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await newMainDashboardApi.getPendingApprovals(loginData.userid);
        setPendingList(data);
        setError(null);
      } catch (err) {
        console.error('처리 대기 결재 조회 실패:', err);
        // 에러가 발생해도 빈 배열로 설정하여 "데이터 없음" 상태 표시
        setPendingList([]);
        setError(null); // 사용자에게 에러 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, [loginData?.userid]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return '오늘';
    } else if (diffInDays === 1) {
      return '어제';
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  const isUrgent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays >= 3; // 3일 이상 지나면 긴급
  };

  const getUrgencyColor = (urgency?: string, requestDate?: string) => {
    if (urgency === 'HIGH' || (requestDate && isUrgent(requestDate))) {
      return 'error';
    }
    return 'warning';
  };

  const truncateText = (text: string, maxLength: number = 25) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <CircularProgress size={20} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            처리 대기 결재 조회 중...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%', fontSize: '0.75rem' }}>{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PendingIcon color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            처리 대기 결재
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          color="warning"
          onClick={handlePendingApprovalClick}
        >
          <ArrowIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* 처리 대기 결재 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {pendingList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <TaskIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              처리 대기 중인 결재가 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {pendingList.slice(0, 2).map((approval, index) => {
              const urgent = isUrgent(approval.requestDatetime);
              
              return (
                <React.Fragment key={approval.approvalId}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      backgroundColor: urgent ? '#fff3e0' : 'transparent',
                      '&:hover': {
                        backgroundColor: urgent ? '#ffe0b2' : '#f5f5f5',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {urgent ? (
                        <UrgentIcon sx={{ color: '#f44336', fontSize: 18 }} />
                      ) : (
                        <ClockIcon sx={{ color: '#ff9800', fontSize: 18 }} />
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <>
                          <span style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={urgent ? 'bold' : 'medium'}
                              component="span"
                              sx={{ 
                                lineHeight: 1.2,
                                flex: 1,
                                color: urgent ? '#f44336' : '#333'
                              }}
                            >
                              {truncateText(approval.taskTypeInfo)}
                            </Typography>
                            
                            {urgent && (
                              <Chip
                                label="긴급"
                                color="error"
                                size="small"
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            )}
                          </span>
                          
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <Chip
                              label="대기중"
                              color={getUrgencyColor(approval.urgency, approval.requestDatetime)}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <PersonIcon sx={{ fontSize: 12, color: '#999' }} />
                              <Typography variant="caption" color="textSecondary" component="span">
                                {approval.requesterName}
                              </Typography>
                            </span>
                          </span>
                        </>
                      }
                      secondary={
                        <span style={{ marginTop: '4px', display: 'block' }}>
                          <Typography variant="caption" color="textSecondary" component="span">
                            신청: {formatDate(approval.requestDatetime)}
                          </Typography>
                          {approval.comments && (
                            <Typography 
                              variant="caption" 
                              color="textSecondary" 
                              component="span"
                              sx={{ display: 'block', fontStyle: 'italic' }}
                            >
                              "{truncateText(approval.comments, 40)}"
                            </Typography>
                          )}
                        </span>
                      }
                      sx={{ m: 0 }}
                    />
                  </ListItem>
                  
                  {index < Math.min(pendingList.length, 2) - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>

    </Paper>
  );
};

export default PendingApprovalsWidget;