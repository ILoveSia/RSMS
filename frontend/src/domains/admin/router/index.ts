import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// 페이지 컴포넌트 지연 로딩
const MenuPermissionManagePage = lazy(() => import('../pages/MenuPermissionManagePage'));
const UserPermissionManagePage = lazy(() => import('../pages/UserPermissionManagePage'));

/**
 * 관리자 도메인 라우터 설정
 * 권한 관리 관련 라우트를 정의합니다.
 */
export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    children: [
      {
        path: 'menu-permissions',
        element: <MenuPermissionManagePage />,
      },
      {
        path: 'user-permissions',
        element: <UserPermissionManagePage />,
      }
    ]
  }
];

export default adminRoutes;