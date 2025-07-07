/**
 * 적부구조도 이력 점검 도메인 라우트 설정
 * 백엔드 메뉴 URL과 일치하는 라우트 경로 설정
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const InspectionSchedulePage = React.lazy(
  () => import('@/domains/inquiry/pages/InspectionSchedulePage')
);
const MonthlyStatusPage = React.lazy(() => import('@/domains/inquiry/pages/MonthlyStatusPage'));
const DeptStatusPage = React.lazy(() => import('@/domains/inquiry/pages/DeptStatusPage'));
const NonEmployeePage = React.lazy(() => import('@/domains/inquiry/pages/NonEmployeePage'));

// 적부구조도 이력 점검 도메인 라우트 정의 (백엔드 메뉴 URL과 일치)
const inquiryRoutes: DomainRoute[] = [
  {
    path: '/inquiry/schedule',
    element: InspectionSchedulePage,
    meta: {
      title: '점검 계획',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '점검 계획'],
      icon: 'Schedule',
      description: '점검 계획 관리 페이지',
    },
  },
  {
    path: '/inquiry/monthly-status',
    element: MonthlyStatusPage,
    meta: {
      title: '점검 현황(월별)',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '점검 현황(월별)'],
      icon: 'CalendarToday',
      description: '월별 점검 현황 페이지',
    },
  },
  {
    path: '/inquiry/dept-status',
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
    path: '/inquiry/non-employee',
    element: NonEmployeePage,
    meta: {
      title: '미종사자 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['적부구조도 이력 점검', '미종사자 현황'],
      icon: 'PersonOff',
      description: '미종사자 현황 관리 페이지',
    },
  },
];

export default inquiryRoutes;
