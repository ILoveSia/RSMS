/**
 * 대시보드 도메인 라우트 설정
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const ExecutiveDashboardStatusPage = React.lazy(() => import('../pages/ExecutiveDashboardStatusPage'));

// 대시보드 도메인 라우트 정의
const routes: DomainRoute[] = [
  {
    path: '/dashboard/executive',
    element: ExecutiveDashboardStatusPage,
    meta: {
      title: '임원 대시보드',
      requiresAuth: true,
      roles: ['ADMIN', 'MANAGER', 'USER'], // 임원 권한은 별도 체크
      breadcrumb: ['대시보드', '임원 현황'],
      icon: 'Dashboard',
      description: '임원별 소관부서 이행점검 현황',
    },
  },
];

export default routes;