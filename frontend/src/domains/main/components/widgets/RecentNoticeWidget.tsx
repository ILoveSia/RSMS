/**
 * 최근 공지사항 위젯 컴포넌트
 * 최근 공지사항 3건을 간략하게 표시합니다.
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
  Campaign as NoticeIcon,
  PushPin as PinnedIcon,
  Article as ArticleIcon,
  Visibility as ViewIcon,
  ArrowForward as ArrowIcon,
  FiberNew as NewIcon
} from '@mui/icons-material';
import { newMainDashboardApi, type RecentNoticeResponse } from '../../api/newMainDashboardApi';
import { useTabContext } from '@/shared/context/TabContext';

// NoticePage 동적 import
const NoticePage = React.lazy(() => import('@/domains/admin/pages/NoticePage'));

const RecentNoticeWidget: React.FC = () => {
  const { addTab } = useTabContext();
  const [noticeList, setNoticeList] = useState<RecentNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNoticeClick = () => {
    addTab({
      title: '공지사항',
      path: '/notice',
      component: <NoticePage />,
      closable: true,
    });
  };

  useEffect(() => {
    const fetchRecentNotice = async () => {
      try {
        setLoading(true);
        const data = await newMainDashboardApi.getRecentNotice();
        setNoticeList(data);
        setError(null);
      } catch (err) {
        console.error('최근 공지사항 조회 실패:', err);
        // 에러가 발생해도 빈 배열로 설정하여 "데이터 없음" 상태 표시
        setNoticeList([]);
        setError(null); // 사용자에게 에러 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    fetchRecentNotice();
  }, []);

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

  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3; // 3일 이내면 새글
  };

  const truncateTitle = (title: string, maxLength: number = 35) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case '긴급': return 'error';
      case '중요': return 'warning';
      case '일반': return 'default';
      case '시스템': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <CircularProgress size={20} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            공지사항 조회 중...
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
          <NoticeIcon color="secondary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            공지사항
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          color="secondary"
          onClick={handleNoticeClick}
        >
          <ArrowIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* 공지사항 목록 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {noticeList.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="body2" color="textSecondary">
              최근 공지사항이 없습니다.
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ p: 0 }}>
            {noticeList.slice(0, 2).map((notice, index) => (
              <React.Fragment key={notice.id}>
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
                    {notice.pinned ? (
                      <PinnedIcon sx={{ color: '#ff5722', fontSize: 18 }} />
                    ) : (
                      <ArticleIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                    )}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={notice.pinned ? 'bold' : 'medium'}
                            sx={{ 
                              lineHeight: 1.2,
                              flex: 1,
                              color: notice.pinned ? '#ff5722' : '#333'
                            }}
                          >
                            {truncateTitle(notice.title)}
                          </Typography>
                          
                          {isNew(notice.createdAt) && (
                            <Badge 
                              badgeContent={<NewIcon sx={{ fontSize: 10 }} />} 
                              color="error"
                              sx={{ 
                                '& .MuiBadge-badge': { 
                                  minWidth: 16, 
                                  height: 16,
                                  borderRadius: 2
                                }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          {notice.pinned && (
                            <Chip
                              label="고정"
                              color="error"
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          
                          {notice.category && (
                            <Chip
                              label={notice.category}
                              color={getCategoryColor(notice.category)}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                            <ViewIcon sx={{ fontSize: 12, color: '#999' }} />
                            <Typography variant="caption" color="textSecondary">
                              {notice.viewCount}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(notice.createdAt)}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </ListItem>
                
                {index < Math.min(noticeList.length, 2) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

    </Paper>
  );
};

export default RecentNoticeWidget;