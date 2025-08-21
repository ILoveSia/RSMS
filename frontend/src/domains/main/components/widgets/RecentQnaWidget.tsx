/**
 * 최근 QnA 위젯 컴포넌트
 * 최근 QnA 3건을 간략하게 표시합니다.
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
  Divider
} from '@mui/material';
import {
  QuestionAnswer as QnaIcon,
  HelpOutline as QuestionIcon,
  CheckCircle as AnsweredIcon,
  Schedule as PendingIcon,
  Cancel as ClosedIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type RecentQnaResponse } from '../../api/newMainDashboardApi';
import { useTabContext } from '@/shared/context/TabContext';

// QnaPage 동적 import
const QnaPage = React.lazy(() => import('@/domains/admin/pages/QnaPage'));

const RecentQnaWidget: React.FC = () => {
  const { addTab } = useTabContext();
  const [qnaList, setQnaList] = useState<RecentQnaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQnaClick = () => {
    addTab({
      title: 'Q&A 관리',
      path: '/qna',
      component: <QnaPage />,
      closable: true,
    });
  };

  useEffect(() => {
    const fetchRecentQna = async () => {
      try {
        setLoading(true);
        const data = await newMainDashboardApi.getRecentQna();
        setQnaList(data);
        setError(null);
      } catch (err) {
        console.error('최근 QnA 조회 실패:', err);
        // 에러가 발생해도 빈 배열로 설정하여 "데이터 없음" 상태 표시
        setQnaList([]);
        setError(null); // 사용자에게 에러 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    fetchRecentQna();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return <AnsweredIcon sx={{ color: '#4caf50', fontSize: 18 }} />;
      case 'PENDING':
        return <PendingIcon sx={{ color: '#ff9800', fontSize: 18 }} />;
      case 'CLOSED':
        return <ClosedIcon sx={{ color: '#9e9e9e', fontSize: 18 }} />;
      default:
        return <QuestionIcon sx={{ color: '#1976d2', fontSize: 18 }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED': return 'success';
      case 'PENDING': return 'warning';
      case 'CLOSED': return 'default';
      default: return 'primary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ANSWERED': return '답변완료';
      case 'PENDING': return '답변대기';
      case 'CLOSED': return '종료';
      default: return '알수없음';
    }
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

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <CircularProgress size={20} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            QnA 조회 중...
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
          <QnaIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            최근 Q&A
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          color="primary"
          onClick={handleQnaClick}
        >
          <ArrowIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* QnA 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {qnaList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <QuestionIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              최근 Q&A가 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {qnaList.slice(0, 2).map((qna, index) => (
              <React.Fragment key={qna.id}>
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
                    {getStatusIcon(qna.status)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ 
                            lineHeight: 1.2,
                            mb: 0.5,
                            color: qna.status === 'ANSWERED' ? '#333' : '#666'
                          }}
                        >
                          {truncateTitle(qna.title)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={getStatusLabel(qna.status)}
                            color={getStatusColor(qna.status)}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          
                          {qna.category && (
                            <Chip
                              label={qna.category}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                            <ViewIcon sx={{ fontSize: 12, color: '#999' }} />
                            <Typography variant="caption" color="textSecondary">
                              {qna.viewCount}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(qna.createdAt)}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </ListItem>
                
                {index < Math.min(qnaList.length, 2) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

    </Paper>
  );
};

export default RecentQnaWidget;