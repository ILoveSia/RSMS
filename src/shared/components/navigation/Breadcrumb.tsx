import React from 'react';
import {
  Breadcrumbs,
  Link,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useNavigation } from '@/shared/hooks/useNavigation';

interface BreadcrumbProps {
  showHomeIcon?: boolean;
  maxItems?: number;
  separator?: React.ComponentType<any>;
}

/**
 * 동적 Breadcrumb 네비게이션 컴포넌트
 * RouteManager의 메타데이터를 기반으로 자동 생성
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({
  showHomeIcon = true,
  maxItems = 8,
  separator = NavigateNextIcon
}) => {
  const location = useLocation();
  const { breadcrumb, currentRouteMeta } = useNavigation();

  // 로그인 페이지에서는 breadcrumb을 숨김
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  if (breadcrumb.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 1, px: 2 }}>
      <Breadcrumbs
        maxItems={maxItems}
        separator={<separator fontSize="small" />}
        aria-label="breadcrumb"
      >
        {/* Home 아이콘 */}
        {showHomeIcon && (
          <Link
            component={RouterLink}
            to="/main"
            underline="hover"
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            홈
          </Link>
        )}

        {/* Breadcrumb 경로들 */}
        {breadcrumb.map((item, index) => {
          const isLast = index === breadcrumb.length - 1;

          if (isLast) {
            // 마지막 항목은 링크가 아닌 텍스트로 표시
            return (
              <Box key={item.path} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  color="text.primary"
                  fontWeight="medium"
                  variant="body2"
                >
                  {item.title}
                </Typography>
                {/* 현재 페이지가 숨김 처리된 페이지인 경우 표시 */}
                {currentRouteMeta?.hidden && (
                  <Chip
                    label="개발"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            );
          }

          // 중간 경로들은 클릭 가능한 링크로 표시
          return (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              underline="hover"
              color="inherit"
              variant="body2"
              sx={{
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {item.title}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;
