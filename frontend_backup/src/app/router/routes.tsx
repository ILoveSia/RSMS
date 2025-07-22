import React from 'react';
import type { RouteObject } from 'react-router-dom';
import RouteGuard from './route-guard';
import { RouteManager } from './route-manager';

// 도메인별 라우트 import
import inquiryRoutes from '@/domains/inquiry/router';
import ledgermngtRoutes from '@/domains/ledgermngt/router';
import loginRoutes from '@/domains/login/router';
import mainRoutes from '@/domains/main/router';

// 라우트 매니저 인스턴스 생성
const routeManager = new RouteManager();

// 도메인별 라우트 등록
routeManager.registerDomainRoutes('login', loginRoutes);
routeManager.registerDomainRoutes('main', mainRoutes);
routeManager.registerDomainRoutes('ledgermngt', ledgermngtRoutes);
routeManager.registerDomainRoutes('inquiry', inquiryRoutes);

// React Router용 RouteObject 생성
const generateRoutes = (): RouteObject[] => {
  const appRoutes = routeManager.generateRouteObjects();

  // 각 라우트에 RouteGuard 적용
  return appRoutes.map(route => {
    const appRoute = routeManager.getAllRoutes().get(route.path || '');

    return {
      path: route.path,
      element: appRoute?.meta ? (
        <RouteGuard meta={appRoute.meta}>
          <React.Suspense fallback={<div>Loading...</div>}>{route.element}</React.Suspense>
        </RouteGuard>
      ) : (
        <React.Suspense fallback={<div>Loading...</div>}>{route.element}</React.Suspense>
      ),
    };
  });
};

// 라우트 배열 생성
export const routes = generateRoutes();

// 라우트 매니저 인스턴스 내보내기 (다른 곳에서 사용할 수 있도록)
export { routeManager };

export default routes;
