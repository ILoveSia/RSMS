/**
 * 인수인계 관리 라우터 설정
 * 인수인계 관련 모든 라우트를 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 라우팅만 담당
 * - Open/Closed: 새로운 라우트 추가 시 확장 가능
 * - Liskov Substitution: React Router 규약 준수
 * - Interface Segregation: 인수인계 관련 라우트만 정의
 * - Dependency Inversion: React Router에 의존
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load components
const HandoverAssignmentListPage = lazy(() => import('../pages/HandoverAssignmentListPage'));
const HandoverAssignmentDetailPage = lazy(() => import('../pages/HandoverAssignmentDetailPage'));
const HandoverAssignmentFormPage = lazy(() => import('../pages/HandoverAssignmentFormPage'));
const ResponsibilityDocumentListPage = lazy(() => import('../pages/ResponsibilityDocumentListPage'));
const ResponsibilityDocumentDetailPage = lazy(() => import('../pages/ResponsibilityDocumentDetailPage'));
const ResponsibilityDocumentFormPage = lazy(() => import('../pages/ResponsibilityDocumentFormPage'));
const HandoverDashboardPage = lazy(() => import('../pages/HandoverDashboardPage'));

// TODO: Phase 2에서 추가 예정
// const InternalControlManualListPage = lazy(() => import('../pages/InternalControlManualListPage'));
// const BusinessPlanInspectionListPage = lazy(() => import('../pages/BusinessPlanInspectionListPage'));

/**
 * 인수인계 관리 라우트 설정
 */
export const handoverRoutes: RouteObject[] = [
  {
    path: 'handover',
    children: [
      {
        path: 'dashboard',
        element: <HandoverDashboardPage />,
      },
      {
        path: 'assignments',
        children: [
          {
            index: true,
            element: <HandoverAssignmentListPage />,
          },
          {
            path: 'new',
            element: <HandoverAssignmentFormPage />,
          },
          {
            path: ':assignmentId',
            element: <HandoverAssignmentDetailPage />,
          },
          {
            path: ':assignmentId/edit',
            element: <HandoverAssignmentFormPage />,
          },
        ],
      },
      {
        path: 'documents',
        children: [
          {
            index: true,
            element: <ResponsibilityDocumentListPage />,
          },
          {
            path: 'new',
            element: <ResponsibilityDocumentFormPage />,
          },
          {
            path: ':documentId',
            element: <ResponsibilityDocumentDetailPage />,
          },
          {
            path: ':documentId/edit',
            element: <ResponsibilityDocumentFormPage />,
          },
        ],
      },
      // TODO: Phase 2에서 추가 예정
      // {
      //   path: 'manuals',
      //   children: [
      //     {
      //       index: true,
      //       element: <InternalControlManualListPage />,
      //     },
      //   ],
      // },
      // {
      //   path: 'inspections',
      //   children: [
      //     {
      //       index: true,
      //       element: <BusinessPlanInspectionListPage />,
      //     },
      //   ],
      // },
    ],
  },
];

/**
 * 인수인계 관리 메뉴 설정
 */
export const handoverMenus = [
  {
    key: 'handover-dashboard',
    label: '인수인계 대시보드',
    path: '/handover/dashboard',
    icon: 'dashboard',
  },
  {
    key: 'handover-assignments',
    label: '인계자 및 인수자 지정',
    path: '/handover/assignments',
    icon: 'assignment',
  },
  {
    key: 'responsibility-documents',
    label: '책무기술서 관리',
    path: '/handover/documents',
    icon: 'document',
  },
  // TODO: Phase 2에서 추가 예정
  // {
  //   key: 'internal-control-manuals',
  //   label: '부서장 내부통제 업무메뉴얼',
  //   path: '/handover/manuals',
  //   icon: 'manual',
  // },
  // {
  //   key: 'business-plan-inspections',
  //   label: '사업계획 점검',
  //   path: '/handover/inspections',
  //   icon: 'inspection',
  // },
];