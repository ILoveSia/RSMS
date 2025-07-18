/**
 * 라우터 생성 유틸리티
 * React Router의 createBrowserRouter를 래핑한 간단한 함수
 */
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';

// 라우터 생성 함수
export const createAppRouter = (routes: RouteObject[], options?: object) => {
  return createBrowserRouter(routes, options);
};

export default createAppRouter;
