import { useAuth } from '@/shared/context/AuthContext';
import { Lock as LockIcon } from '@mui/icons-material';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { RouteMeta } from './route-manager';

interface RouteGuardProps {
  children: ReactNode;
  meta?: RouteMeta;
}

/**
 * 라우트 접근 권한을 관리하는 가드 컴포넌트
 * - 인증 상태 확인
 * - 사용자 권한 확인
 * - 접근 거부 시 적절한 리다이렉트
 */
const RouteGuard: React.FC<RouteGuardProps> = ({ children, meta }) => {
  const location = useLocation();
  const { authState, hasAnyRole } = useAuth();

  // 개발 모드에서 인증 체크 건너뛰기 옵션 (필요시 true로 변경)
  const SKIP_AUTH_IN_DEV = false;
  const isDevelopment = import.meta.env.MODE === 'development';

  // 디버깅 로그 추가
  console.log('🛡️ [RouteGuard] 권한 체크 시작:', {
    path: location.pathname,
    requiresAuth: meta?.requiresAuth,
    requiredRoles: meta?.roles,
    isAuthenticated: authState.isAuthenticated,
    userRoles: authState.user?.roles,
    loading: authState.loading,
    skipAuthInDev: SKIP_AUTH_IN_DEV && isDevelopment,
  });

  // 개발 모드에서 인증 체크 건너뛰기
  if (SKIP_AUTH_IN_DEV && isDevelopment && meta?.requiresAuth) {
    console.log('🚀 [RouteGuard] 개발 모드 - 인증 체크 건너뛰기');
    return <>{children}</>;
  }

  // 로딩 중인 경우
  if (authState.loading) {
    console.log('⏳ [RouteGuard] 인증 상태 로딩 중...');
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='100vh'
        flexDirection='column'
      >
        <CircularProgress />
        <Typography variant='body1' sx={{ mt: 2 }}>
          인증 상태를 확인하고 있습니다...
        </Typography>
      </Box>
    );
  }

  // 인증이 필요한 페이지인 경우
  if (meta?.requiresAuth && !authState.isAuthenticated) {
    // 현재 경로가 /login이면 리다이렉트하지 않음
    if (location.pathname === '/login') {
      return <>{children}</>;
    }
    console.log('❌ [RouteGuard] 인증 필요하지만 미인증 상태 -> 로그인 페이지로 리다이렉트');
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 인증이 필요하지 않은 페이지인 경우 (meta.requiresAuth가 false인 경우)
  if (meta?.requiresAuth === false) {
    // 이미 인증된 사용자가 로그인 페이지에 접근하면 메인으로 리다이렉트
    if (location.pathname === '/login' && authState.isAuthenticated) {
      return <Navigate to='/main' replace />;
    }
    return <>{children}</>;
  }

  // 특정 역할이 필요한 페이지인 경우
  if (meta?.roles && meta.roles.length > 0) {
    console.log('🔍 [RouteGuard] 역할 권한 체크 시작:', {
      requiredRoles: meta.roles,
      isAuthenticated: authState.isAuthenticated,
      userRoles: authState.user?.roles,
      user: authState.user,
    });

    // 인증되지 않은 사용자는 로그인 페이지로
    if (!authState.isAuthenticated) {
      console.log('❌ [RouteGuard] 역할 권한 필요하지만 미인증 상태 -> 로그인 페이지로 리다이렉트');
      return <Navigate to='/login' state={{ from: location }} replace />;
    }

    const hasRequiredRole = hasAnyRole(meta.roles);
    console.log('🔍 [RouteGuard] 역할 권한 체크 결과:', {
      requiredRoles: meta.roles,
      userRoles: authState.user?.roles,
      hasRequiredRole,
    });

    if (!hasRequiredRole) {
      console.log('❌ [RouteGuard] 필요한 역할 권한 없음 -> 접근 거부 페이지 표시');
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='100vh'
          flexDirection='column'
        >
          <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant='h4' gutterBottom>
            접근 권한이 없습니다
          </Typography>
          <Typography variant='body1' color='text.secondary' textAlign='center'>
            이 페이지에 접근하기 위해서는 다음 권한이 필요합니다:
          </Typography>
          <Typography variant='body2' sx={{ mt: 1 }}>
            {meta.roles.join(', ')}
          </Typography>
          <Typography variant='body2' sx={{ mt: 1, color: 'info.main' }}>
            현재 사용자 권한: {authState.user?.roles?.join(', ') || '없음'}
          </Typography>
          <Alert severity='warning' sx={{ mt: 2, maxWidth: 400 }}>
            관리자에게 권한 요청을 문의해주세요.
          </Alert>
        </Box>
      );
    }
  }

  // 모든 검증을 통과한 경우 자식 컴포넌트 렌더링
  console.log('✅ [RouteGuard] 모든 권한 체크 통과 -> 페이지 렌더링');
  return <>{children}</>;
};

/**
 * HOC 버전의 RouteGuard
 */
export const withRouteGuard = (Component: React.ComponentType<any>, meta?: RouteMeta) => {
  const GuardedComponent: React.FC<any> = props => {
    return (
      <RouteGuard meta={meta}>
        <Component {...props} />
      </RouteGuard>
    );
  };

  GuardedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`;

  return GuardedComponent;
};

/**
 * 인증 상태 관리 헬퍼 함수들
 */
export const authUtils = {
  /**
   * 로그인 상태 설정
   */
  setAuthState: (user: { id: string; name: string; roles: string[] }) => {
    const authState = {
      isAuthenticated: true,
      user,
    };
    localStorage.setItem('authState', JSON.stringify(authState));
    console.log('✅ 인증 상태 저장 완료:', user);
  },

  /**
   * 로그아웃
   */
  clearAuthState: () => {
    localStorage.removeItem('authState');
    console.log('🚪 인증 상태 제거 완료');
  },

  /**
   * 현재 사용자 정보 조회
   */
  getCurrentUser: () => {
    try {
      const authData = localStorage.getItem('authState');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user;
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
    return null;
  },

  /**
   * 권한 확인
   */
  hasRole: (role: string): boolean => {
    const user = authUtils.getCurrentUser();
    return user?.roles?.includes(role) || false;
  },

  /**
   * 인증 상태 확인
   */
  isAuthenticated: (): boolean => {
    try {
      const authData = localStorage.getItem('authState');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.isAuthenticated || false;
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
    }
    return false;
  },
};

export default RouteGuard;
