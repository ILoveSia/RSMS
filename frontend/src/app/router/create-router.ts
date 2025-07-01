/**
 * 라우터 생성 유틸리티
 * React Router의 createBrowserRouter를 래핑한 간단한 함수
 */
import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import LoginPage from '.../login/pages/LoginPage';

// 라우터 생성 함수
export const createAppRouter = (routes: RouteObject[], options?: object) => {
  return createBrowserRouter(routes, options);
};

export default createAppRouter;
