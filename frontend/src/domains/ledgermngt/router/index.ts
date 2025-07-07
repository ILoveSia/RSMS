/**
 * 원장관리 도메인 라우트 설정
 * 새로운 라우트 관리 시스템 적용
 */
import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const MeetingStatusPage = React.lazy(() => import('../pages/MeetingStatusPage'));
const PositionStatusPage = React.lazy(() => import('../pages/PositionStatusPage'));
const ResponsibilityDbStatusPage = React.lazy(() => import('../pages/ResponsibilityDbStatusPage'));
const PositionResponsibilityStatusPage = React.lazy(() => import('../pages/PositionResponsibilityStatusPage'));
const TestGrid = React.lazy(() => import('../pages/TestGrid'));
const NewComponentsTestPage = React.lazy(() => import('../pages/NewComponentsTestPage'));
const PositionCardTestPage = React.lazy(() => import('../pages/PositionCardTestPage'));
const StructureSubmissionStatusPage = React.lazy(() => import('../pages/StructureSubmissionStatusPage'));
const ExecutiveStatusPage = React.lazy(() => import('../pages/ExecutiveStatusPage'));

// 원장관리 도메인 라우트 정의 (백엔드 메뉴 URL과 일치)
const ledgermngtRoutes: DomainRoute[] = [
  {
    path: '/ledger/company-status',
    element: MeetingStatusPage,
    meta: {
      title: '회의채 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '회사별 현황'],
      icon: 'Business',
      description: '회사별 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/position-status',
    element: PositionStatusPage,
    meta: {
      title: '직책 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '직책 현황'],
      icon: 'Person',
      description: '직책 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/db-status',
    element: ResponsibilityDbStatusPage,
    meta: {
      title: '책무 DB현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '책무 DB현황'],
      icon: 'Assignment',
      description: '책무 데이터베이스 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/detail-status',
    element: PositionResponsibilityStatusPage,
    meta: {
      title: '직책별 책무 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '직책별 책무 현황'],
      icon: 'list_alt',
      description: '직책별 책무 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/business-status',
    element: ExecutiveStatusPage,
    meta: {
      title: '임원 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '임원 현황'],
      icon: 'Work',
      description: '임원 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/business-detail-status',
    element: TestGrid,
    meta: {
      title: '임원별 책무 현황',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '임원별 책무 현황'],
      icon: 'Analytics',
      description: '임원별 책무 현황 관리 페이지',
    },
  },
  {
    path: '/ledger/internal-control',
    element: TestGrid,
    meta: {
      title: '부서장 내부통제 항목',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '부서장 내부통제 항목'],
      icon: 'Security',
      description: '부서장 내부통제 항목 관리 페이지',
    },
  },
  {
    path: '/ledger/structure-submission',
    element: StructureSubmissionStatusPage,
    meta: {
      title: '적부구조도 제출 관리',
      requiresAuth: true,
      roles: ['USER', 'ADMIN'],
      breadcrumb: ['책무구조도 원장 관리', '적부구조도 제출 관리'],
      icon: 'Upload',
      description: '적부구조도 제출 관리 페이지',
    },
  },
  // 테스트 페이지들 (숨김 메뉴)
  {
    path: '/ledger/new-components-test',
    element: NewComponentsTestPage,
    meta: {
      title: '새 컴포넌트 테스트',
      requiresAuth: true,
      roles: ['ADMIN'],
      breadcrumb: ['적부구조 원장 관리', '새 컴포넌트 테스트'],
      icon: 'Science',
      description: '새로운 컴포넌트 테스트 페이지',
      hidden: true,
    },
  },
  {
    path: '/ledger/position-card-test',
    element: PositionCardTestPage,
    meta: {
      title: '직책 카드 테스트',
      requiresAuth: true,
      roles: ['ADMIN'],
      breadcrumb: ['적부구조 원장 관리', '직책 카드 테스트'],
      icon: 'Science',
      description: '직책 카드 컴포넌트 테스트 페이지',
      hidden: true,
    },
  },
];

export default ledgermngtRoutes;
