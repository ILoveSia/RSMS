/**
 * 장부관리(ledgermngt) 도메인 라우터 설정
 */
import { lazy } from 'react';

// Lazy loading으로 컴포넌트 로드
const MeetingStatusPage = lazy(() => import('../pages/MeetingStatusPage'));
const PositionStatusPage = lazy(() => import('../pages/PositionStatusPage'));
const ResponsibilityDbStatusPage = lazy(() => import('../pages/ResponsibilityDbStatusPage'));
const ResponsibilityDetailPage = lazy(() => import('../pages/ResponsibilityDetailPage'));

export const ledgermngtRoutes = [
  {
    path: '/meeting-status',
    element: MeetingStatusPage,
    meta: {
      title: '회의체 현황',
      requiresAuth: true
    }
  },
  {
    path: '/position-status',
    element: PositionStatusPage,
    meta: {
      title: '직책 현황',
      requiresAuth: true
    }
  },
  {
    path: '/responsibility-status',
    element: ResponsibilityDbStatusPage,
    meta: {
      title: '책무DB 현황',
      requiresAuth: true
    }
  },
  {
    path: '/responsibility-status/:id',
    element: ResponsibilityDetailPage,
    meta: {
      title: '책무 상세',
      requiresAuth: true
    }
  }
];

export default ledgermngtRoutes; 