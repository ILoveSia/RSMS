/**
 * 인수인계 관리 도메인 라우트 설정
 * RouteManager와 호환되는 DomainRoute 형식으로 구성
 * 
 * UI/UX 통일화로 인해 다이얼로그 통합됨:
 * - Detail/Form 페이지들은 삭제되고 각 ListPage + Dialog로 통합
 * - 총 4개 주요 관리 페이지로 구성
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import (다이얼로그 통합 버전)
const HandoverAssignmentListPage = React.lazy(() => import('../pages/HandoverAssignmentListPage'));
const ResponsibilityDocumentListPage = React.lazy(() => import('../pages/ResponsibilityDocumentListPage'));
const InternalControlManualListPage = React.lazy(() => import('../pages/InternalControlManualListPage'));
const BusinessPlanInspectionListPage = React.lazy(() => import('../pages/BusinessPlanInspectionListPage'));

const handoverRoutes: DomainRoute[] = [
  {
    path: '/handover/assignments',
    element: HandoverAssignmentListPage,
    meta: {
      title: '인계자 및 인수자 지정',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['인수인계 관리', '인계자 및 인수자 지정'],
      icon: 'Assignment',
      description: '인수인계 지정 목록 관리 (다이얼로그 통합)',
    },
  },
  {
    path: '/handover/documents',
    element: ResponsibilityDocumentListPage,
    meta: {
      title: '책무기술서 관리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['인수인계 관리', '책무기술서 관리'],
      icon: 'Description',
      description: '직책별 책무기술서 관리 (다이얼로그 통합)',
    },
  },
  {
    path: '/handover/manuals',
    element: InternalControlManualListPage,
    meta: {
      title: '내부통제 업무메뉴얼 관리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['인수인계 관리', '내부통제 업무메뉴얼 관리'],
      icon: 'MenuBook',
      description: '내부통제 업무메뉴얼 관리 (다이얼로그 통합)',
    },
  },
  {
    path: '/handover/inspections',
    element: BusinessPlanInspectionListPage,
    meta: {
      title: '사업계획 점검 관리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN', 'MANAGER'],
      breadcrumb: ['인수인계 관리', '사업계획 점검 관리'],
      icon: 'Assessment',
      description: '부서별 사업계획 점검 관리 (다이얼로그 통합)',
    },
  },
];

export default handoverRoutes;