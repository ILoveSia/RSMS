import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const MainLayout = React.lazy(() => import('@/shared/components/layout/MainLayout'));

// 메인 도메인 라우트 정의
const mainRoutes: DomainRoute[] = [
  {
    path: '/main',
    element: MainLayout,
    meta: {
      title: '메인',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'user', 'admin', 'MANAGER'],
      breadcrumb: ['메인'],
      icon: 'Dashboard',
      description: '시스템 메인 대시보드',
    },
  },
];

export default mainRoutes;
