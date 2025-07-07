import type { DomainRoute } from '@/app/router/route-manager';
import React from 'react';

// Lazy loading을 위한 컴포넌트 import
const LoginPage = React.lazy(() => import('@/domains/login/pages/LoginPage'));

// 로그인 도메인 라우트 정의
const loginRoutes: DomainRoute[] = [
  {
    path: '/',
    element: LoginPage,
    meta: {
      title: '로그인',
      requiresAuth: false,
      roles: [],
      breadcrumb: ['로그인'],
      icon: 'Login',
      description: '시스템 로그인 페이지',
    },
  },
  {
    path: '/login',
    element: LoginPage,
    meta: {
      title: '로그인',
      requiresAuth: false,
      roles: [],
      breadcrumb: ['로그인'],
      icon: 'Login',
      description: '시스템 로그인 페이지',
    },
  },
];

export default loginRoutes;
