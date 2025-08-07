/**
 * 권한 관리 도메인 라우트 설정
 * 새로운 라우트 관리 시스템 적용
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const MenuPermissionManagePage = React.lazy(() => import('../pages/MenuPermissionManagePage'));
const UserPermissionManagePage = React.lazy(() => import('../pages/UserPermissionManagePage'));

// 권한 관리 도메인 라우트 정의
const routes: DomainRoute[] = [
  {
    path: '/admin/menu-permissions',
    element: MenuPermissionManagePage,
    meta: {
      title: '화면별 권한 관리',
      requiresAuth: true,
      roles: ['ADMIN', 'MANAGER'], // 관리자 전용 페이지
      breadcrumb: ['권한 관리', '화면별 권한 관리'],
      icon: 'Security',
      description: '메뉴별 역할 권한 매트릭스 관리',
    },
  },
  {
    path: '/admin/user-permissions',
    element: UserPermissionManagePage,
    meta: {
      title: '사용자 권한 관리',
      requiresAuth: true,
      roles: ['ADMIN', 'MANAGER'], // 관리자 전용 페이지
      breadcrumb: ['권한 관리', '사용자 권한 관리'],
      icon: 'Person',
      description: '사용자별 역할 할당 및 해제 관리',
    },
  },
];

export default routes;