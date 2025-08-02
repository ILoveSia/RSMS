/**
 * 결재 도메인 라우터 설정
 */
import { lazy } from 'react';
import { RouteConfig } from '@/app/router/types';

// 페이지 컴포넌트 lazy loading
const ApprovalDashboardPage = lazy(() => import('@/domains/approval/pages/ApprovalDashboardPage'));
const MyApprovalListPage = lazy(() => import('@/domains/approval/pages/MyApprovalListPage'));
const ApprovalHistoryPage = lazy(() => import('@/domains/approval/pages/ApprovalHistoryPage'));

/**
 * 결재 도메인 라우트 설정
 */
export const approvalRoutes: RouteConfig[] = [
  {
    path: '/approval',
    element: ApprovalDashboardPage,
    meta: {
      title: '결재 대시보드',
      requiresAuth: true,
      menuId: 'approval-dashboard',
      breadcrumb: '결재 대시보드',
    },
  },
  {
    path: '/approval/my-list',
    element: MyApprovalListPage,
    meta: {
      title: '내 결재 목록',
      requiresAuth: true,
      menuId: 'approval-my-list',
      breadcrumb: '내 결재 목록',
    },
  },
  {
    path: '/approval/history',
    element: ApprovalHistoryPage,
    meta: {
      title: '결재 히스토리',
      requiresAuth: true,
      menuId: 'approval-history',
      breadcrumb: '결재 히스토리',
    },
  },
];

export default approvalRoutes;