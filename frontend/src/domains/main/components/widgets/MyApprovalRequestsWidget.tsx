/**
 * 내 결재 신청 위젯 컴포넌트
 * 로그인 사용자가 신청한 결재 목록을 표시합니다.
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
  Assignment as ApprovalIcon,
  Send as SendIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  ArrowForward as ArrowIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type MyApprovalRequestResponse } from '../../api/newMainDashboardApi';
import { useReduxState } from '@/app/store/use-store';
import { useTabContext } from '@/shared/context/TabContext';

// MyApprovalListPage 동적 import
const MyApprovalListPage = React.lazy(() => import('@/domains/approval/pages/MyApprovalListPage'));

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

const MyApprovalRequestsWidget: React.FC = () => {
  const { addTab } = useTabContext();
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const [approvalList, setApprovalList] = useState<MyApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMyApprovalClick = () => {
    addTab({
      title: '내 결재 신청',
      path: '/approval/my-list',
      component: <MyApprovalListPage />,
      closable: true,
    });
  };

  useEffect(() => {
    const fetchMyApprovalRequests = async () => {
      if (!loginData?.userid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await newMainDashboardApi.getMyApprovalRequests(loginData.userid);
        setApprovalList(data);
        setError(null);
      } catch (err) {
        console.error('내 결재 신청 조회 실패:', err);
        // 에러가 발생해도 빈 배열로 설정하여 "데이터 없음" 상태 표시
        setApprovalList([]);
        setError(null); // 사용자에게 에러 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    fetchMyApprovalRequests();
  }, [loginData?.userid]);

  const getStatusIcon = (statusCd: string) => {
    switch (statusCd) {
      case 'APPROVED':
        return <ApprovedIcon sx={{ color: '#4caf50', fontSize: 18 }} />;
      case 'REJECTED':
        return <RejectedIcon sx={{ color: '#f44336', fontSize: 18 }} />;
      case 'PENDING':
        return <PendingIcon sx={{ color: '#ff9800', fontSize: 18 }} />;
      default:
        return <SendIcon sx={{ color: '#1976d2', fontSize: 18 }} />;
    }
  };

  const getStatusColor = (statusCd: string) => {
    switch (statusCd) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusLabel = (statusName: string) => {
    return statusName || '상태불명';
  };

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
            결재 신청 조회 중...
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
          <ApprovalIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            내 결재 신청
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          color="primary"
          onClick={handleMyApprovalClick}
        >
          <ArrowIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* 결재 신청 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {approvalList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <SendIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              신청한 결재가 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {approvalList.slice(0, 2).map((approval, index) => (
              <React.Fragment key={approval.approvalId}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getStatusIcon(approval.apprStatCd)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          component="span"
                          sx={{ 
                            lineHeight: 1.2,
                            display: 'block',
                            mb: 0.5,
                            color: approval.apprStatCd === 'APPROVED' ? '#4caf50' : 
                                   approval.apprStatCd === 'REJECTED' ? '#f44336' : '#333'
                          }}
                        >
                          {truncateText(approval.taskTypeInfo)}
                        </Typography>
                        
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <Chip
                            label={getStatusLabel(approval.apprStatName)}
                            color={getStatusColor(approval.apprStatCd)}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          
                          {approval.approverName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <PersonIcon sx={{ fontSize: 12, color: '#999' }} />
                              <Typography variant="caption" color="textSecondary" component="span">
                                {approval.approverName}
                              </Typography>
                            </span>
                          )}
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
                
                {index < Math.min(approvalList.length, 2) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

    </Paper>
  );
};

export default MyApprovalRequestsWidget;