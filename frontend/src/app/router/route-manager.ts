import React, { type LazyExoticComponent } from 'react';
import type { RouteObject } from 'react-router-dom';

// 라우트 메타데이터 인터페이스
export interface RouteMeta {
  title: string;
  requiresAuth?: boolean;
  roles?: string[];
  breadcrumb?: string[];
  icon?: string;
  description?: string;
  hidden?: boolean;
}

// 확장된 라우트 객체 인터페이스
export interface AppRouteObject {
  path?: string;
  index?: boolean;
  element: LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  meta?: RouteMeta;
  children?: AppRouteObject[];
}

// 도메인 라우트 인터페이스
export interface DomainRoute {
  path: string;
  element: LazyExoticComponent<React.ComponentType<any>> | React.ComponentType<any>;
  meta: RouteMeta;
}

/**
 * 중앙화된 라우트 관리 클래스
 * - 도메인별 라우트 자동 등록
 * - 메타데이터 관리
 * - 라우트 가드 적용
 * - Breadcrumb 생성
 */
export class RouteManager {
  private routes: Map<string, AppRouteObject> = new Map();
  private domainRoutes: Map<string, DomainRoute[]> = new Map();

  /**
   * 도메인 라우트 등록
   */
  registerDomainRoutes(domain: string, routes: DomainRoute[]): void {
    this.domainRoutes.set(domain, routes);

    routes.forEach(route => {
      let fullPath: string;

      // 루트 경로("/")인 경우 도메인 접두사를 붙이지 않음
      if (route.path === '/') {
        fullPath = '/';
      }
      // 절대 경로로 시작하는 경우 그대로 사용
      else if (route.path.startsWith('/')) {
        fullPath = route.path;
      }
      // 상대 경로인 경우 도메인 접두사 추가
      else {
        fullPath = `/${domain}/${route.path}`;
      }

      this.routes.set(fullPath, {
        path: fullPath,
        element: route.element,
        meta: route.meta,
      });
    });

  }

  /**
   * 단일 라우트 등록
   */
  registerRoute(path: string, route: AppRouteObject): void {
    this.routes.set(path, route);
  }

  /**
   * React Router 호환 라우트 객체 생성
   */
  generateRouteObjects(): RouteObject[] {
    const routeObjects: RouteObject[] = [];

    // 등록된 모든 라우트를 RouteObject로 변환
    this.routes.forEach(route => {
      routeObjects.push({
        path: route.path,
        element: React.createElement(route.element as React.ComponentType),
      });
    });

    return routeObjects;
  }

  /**
   * 라우트 메타데이터 조회
   */
  getRouteMeta(path: string): RouteMeta | undefined {
    const route = this.routes.get(path);
    return route?.meta;
  }

  /**
   * 인증이 필요한 라우트 목록 조회
   */
  getProtectedRoutes(): string[] {
    const protectedRoutes: string[] = [];

    this.routes.forEach((route, path) => {
      if (route.meta?.requiresAuth) {
        protectedRoutes.push(path);
      }
    });

    return protectedRoutes;
  }

  /**
   * 도메인별 라우트 목록 조회
   */
  getDomainRoutes(domain: string): DomainRoute[] {
    return this.domainRoutes.get(domain) || [];
  }

  /**
   * 모든 라우트 목록 조회 (디버깅용)
   */
  getAllRoutes(): Map<string, AppRouteObject> {
    return new Map(this.routes);
  }

  /**
   * Breadcrumb 생성
   */
  generateBreadcrumb(currentPath: string): Array<{ title: string; path: string }> {
    const route = this.routes.get(currentPath);
    if (!route?.meta?.breadcrumb) return [];

    return route.meta.breadcrumb.map((title, index) => {
      const pathSegments = currentPath.split('/').slice(0, index + 2);
      return {
        title,
        path: pathSegments.join('/'),
      };
    });
  }

  /**
   * 라우트 검색
   */
  searchRoutes(query: string): Array<{ path: string; meta: RouteMeta }> {
    const results: Array<{ path: string; meta: RouteMeta }> = [];

    this.routes.forEach((route, path) => {
      if (route.meta && !route.meta.hidden) {
        const searchText = `${route.meta.title} ${route.meta.description || ''}`.toLowerCase();
        if (searchText.includes(query.toLowerCase())) {
          results.push({ path, meta: route.meta });
        }
      }
    });

    return results;
  }

  /**
   * 네비게이션 메뉴 생성
   */
  generateNavigationMenu(): Array<{
    title: string;
    path: string;
    icon?: string;
    children?: Array<{ title: string; path: string; icon?: string }>;
  }> {
    const menuItems: Array<{
      title: string;
      path: string;
      icon?: string;
      children?: Array<{ title: string; path: string; icon?: string }>;
    }> = [];

    // 도메인별로 그룹화
    const domainGroups = new Map<string, Array<{ title: string; path: string; icon?: string }>>();

    this.routes.forEach((route, path) => {
      if (route.meta && !route.meta.hidden) {
        const domain = path.split('/')[1] || 'root';

        if (!domainGroups.has(domain)) {
          domainGroups.set(domain, []);
        }

        domainGroups.get(domain)?.push({
          title: route.meta.title,
          path,
          icon: route.meta.icon,
        });
      }
    });

    // 메뉴 구조 생성
    domainGroups.forEach((items, domain) => {
      if (domain === 'root') {
        menuItems.push(...items);
      } else {
        menuItems.push({
          title: domain.charAt(0).toUpperCase() + domain.slice(1),
          path: `/${domain}`,
          children: items,
        });
      }
    });

    return menuItems;
  }
}

// 전역 라우트 매니저 인스턴스
export const routeManager = new RouteManager();

// 라우트 등록 헬퍼 함수들
export const registerDomainRoutes = (domain: string, routes: DomainRoute[]) => {
  routeManager.registerDomainRoutes(domain, routes);
};

export const registerRoute = (path: string, route: AppRouteObject) => {
  routeManager.registerRoute(path, route);
};

export const generateRoutes = (): RouteObject[] => {
  return routeManager.generateRouteObjects();
};

export default routeManager;
