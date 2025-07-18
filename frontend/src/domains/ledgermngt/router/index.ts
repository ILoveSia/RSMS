﻿/**
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
const StructureSubmissionStatusPage = React.lazy(() => import('../pages/StructureSubmissionStatusPage'));
const ExecutiveStatusPage = React.lazy(() => import('../pages/ExecutiveStatusPage'));
const ExecutiveResponsibilityStatusPage = React.lazy(() => import('../pages/ExecutiveResponsibilityStatusPage'));

// 원장관리 도메인 라우트 정의 (백엔드 메뉴 URL과 일치)
const routes: DomainRoute[] = [
  {
    path: '/ledgermngt/company-status',
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
    path: '/ledgermngt/position-status',
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
    path: '/ledgermngt/db-status',
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
    path: '/ledgermngt/detail-status',
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
    path: '/ledgermngt/business-status',
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
    path: '/ledgermngt/business-detail-status',
    element: ExecutiveResponsibilityStatusPage,
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
    path: '/ledgermngt/internal-control',
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
    path: '/ledgermngt/structure-submission',
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
];

export default routes;
