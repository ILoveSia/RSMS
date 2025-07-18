/**
 * 적부구조도 이력 점검 도메인 라우트 설정
 * 백엔드 메뉴 URL과 일치하는 라우트 경로 설정
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const InspectionPlanManagementPage = React.lazy(() => import('@/domains/inquiry/pages/InspectionPlanManagementPage'));
const DeptStatusPage = React.lazy(() => import('@/domains/inquiry/pages/DeptStatusPage'));
const DeficiencyStatusPage = React.lazy(() => import('@/domains/inquiry/pages/DeficiencyStatusPage'));

const inquiryRoutes: DomainRoute[] = [
  {
    path: '/inquiry/inspection-plan',
    element: InspectionPlanManagementPage,
    meta: {
      title: '점검 계획 관리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '점검 계획 관리'],
      icon: 'Assignment',
      description: '점검 계획 관리 페이지',
    },
  },
  {
    path: '/inquiry/inspection-depart',
    element: DeptStatusPage,
    meta: {
      title: '점검 현황(부서별)',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '점검 현황(부서별)'],
      icon: 'Business',
      description: '부서별 점검 현황 페이지',
    },
  },
  {
    path: '/inquiry/deficiency-status',
    element: DeficiencyStatusPage,
    meta: {
      title: '미비점 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '미비점 현황'],
      icon: 'Warning',
      description: '미비점 현황 페이지',
    },
  },
];

export default inquiryRoutes;
