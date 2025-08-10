﻿/**
 * ITCEN Solution Frontend Application
 *
 * React 18 + MUI v5 + TypeScript를 활용한 메인 애플리케이션 컴포넌트입니다.
 * 새로운 라우팅 시스템을 사용하여 도메인별 라우트를 자동으로 관리합니다.
 */

import routes from '@/app/router/routes';
import { LoadingProvider } from '@/shared/components/ui/feedback/LoadingProvider';
import { ToastProvider } from '@/shared/components/ui/feedback/ToastProvider';
import { AuthProvider } from '@/shared/context/AuthContext';
import { ThemeProvider } from '@/app/theme/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import '@/assets/css/dark-theme.css';

// useRoutes hook을 사용하여 라우트 객체를 기반으로 라우팅을 설정하는 컴포넌트
const AppRoutes = () => {
  // useRoutes는 routes 배열을 기반으로 적절한 엘리먼트 트리를 반환합니다.
  // 이 hook은 BrowserRouter 컨텍스트 내에서 호출되어야 합니다.
  const element = useRoutes(routes);
  return element;
};

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <LoadingProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

export default App;
