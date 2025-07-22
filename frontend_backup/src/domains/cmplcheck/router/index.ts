/**
 * 컴플라이언스 체크(cmplcheck) 도메인 라우터 설정
 */
import { lazy } from 'react';

// Lazy loading으로 컴포넌트 로드
const ReviewPlanPage = lazy(() => import('../pages/ReviewPlanPage'));

export const cmplcheckRoutes = [
  {
    path: '/review-plan',
    element: ReviewPlanPage,
    meta: {
      title: '검토계획 관리',
      requiresAuth: true
    }
  }
];

export default cmplcheckRoutes; 