/**
 * 결재 도메인 라우터 설정
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// 페이지 컴포넌트 lazy loading
const ApprovalDashboardPage = React.lazy(() => import('@/domains/approval/pages/ApprovalDashboardPage'));
const MyApprovalListPage = React.lazy(() => import('@/domains/approval/pages/MyApprovalListPage'));
const ApprovalHistoryPage = React.lazy(() => import('@/domains/approval/pages/ApprovalHistoryPage'));

/**
 * 결재 도메인 라우트 설정
 */
const approvalRoutes: DomainRoute[] = [
  {
    path: '/approval',
    element: ApprovalDashboardPage,
    meta: {
      title: '결재 대시보드',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['결재 관리', '결재 대시보드'],
      icon: 'Dashboard',
      description: '결재 현황을 한눈에 확인하고 관리합니다.',
    },
  },
  {
    path: '/approval/my-list',
    element: MyApprovalListPage,
    meta: {
      title: '내 결재 목록',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['결재 관리', '내 결재 목록'],
      icon: 'Assignment',
      description: '내가 처리해야 할 결재 목록을 확인합니다.',
    },
  },
  {
    path: '/approval/history',
    element: ApprovalHistoryPage,
    meta: {
      title: '결재 히스토리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['결재 관리', '결재 히스토리'],
      icon: 'History',
      description: '결재 처리 이력을 조회합니다.',
    },
  },
];

export default approvalRoutes;