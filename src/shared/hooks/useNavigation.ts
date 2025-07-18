import { useLocation } from 'react-router-dom';
import { routeManager } from '@/app/router/routes';
import type { RouteMeta } from '@/app/router/route-manager';

export interface BreadcrumbItem {
  title: string;
  path: string;
}

export interface NavigationMenuItem {
  title: string;
  path: string;
  icon?: string;
  children?: NavigationMenuItem[];
}

/**
 * 네비게이션 관련 기능을 제공하는 커스텀 훅
 */
export const useNavigation = () => {
  const location = useLocation();

  /**
   * 현재 경로의 메타데이터 조회
   */
  const getCurrentRouteMeta = (): RouteMeta | undefined => {
    return routeManager.getRouteMeta(location.pathname);
  };

  /**
   * 현재 경로의 Breadcrumb 생성
   */
  const getCurrentBreadcrumb = (): BreadcrumbItem[] => {
    return routeManager.generateBreadcrumb(location.pathname);
  };

  /**
   * 전체 네비게이션 메뉴 생성
   */
  const getNavigationMenu = (): NavigationMenuItem[] => {
    return routeManager.generateNavigationMenu();
  };

  /**
   * 라우트 검색
   */
  const searchRoutes = (query: string) => {
    return routeManager.searchRoutes(query);
  };

  /**
   * 인증이 필요한 라우트 목록
   */
  const getProtectedRoutes = (): string[] => {
    return routeManager.getProtectedRoutes();
  };

  /**
   * 현재 페이지 제목 조회
   */
  const getCurrentPageTitle = (): string => {
    const meta = getCurrentRouteMeta();
    return meta?.title || '페이지';
  };

  return {
    currentPath: location.pathname,
    currentRouteMeta: getCurrentRouteMeta(),
    breadcrumb: getCurrentBreadcrumb(),
    navigationMenu: getNavigationMenu(),
    currentPageTitle: getCurrentPageTitle(),
    searchRoutes,
    getProtectedRoutes,
  };
};

export default useNavigation;
