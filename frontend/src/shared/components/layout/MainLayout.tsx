/**
 * 메인 레이아웃 컴포넌트
 * LeftMenu와 TopHeader, TabContainer를 포함하는 공통 레이아웃
 */
import { LeftMenu, TopHeader } from '@/app/components/layout';
import type { IComponent } from '@/app/types';
import MainPage from '@/domains/main/pages/MainPage';
import { TabContainer, TabProvider } from '@/shared/components/tabs';
import { useAuth } from '@/shared/context/AuthContext';
import { useTabContext } from '@/shared/context/TabContext';
import { PageComponentMapper } from '@/shared/utils/pageComponentMapper';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../../../assets/scss/style.css';

interface IMainLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

// 홈 탭 초기화 컴포넌트
const HomeTabInitializer: React.FC = () => {
  const { addTab, tabs = [] } = useTabContext(); // 기본값 설정으로 안전한 접근
  const location = useLocation();

  useEffect(() => {
    // 현재 URL에 해당하는 페이지 정보 가져오기
    const currentPageInfo = PageComponentMapper.getPageInfo(location.pathname);
    const currentComponent = PageComponentMapper.getComponent(location.pathname);

    // 홈 탭이 이미 존재하는지 확인 (방어 코드 추가)
    const homeTabExists = Array.isArray(tabs) && tabs.some(tab => tab.path === '/main');

    // 현재 경로에 해당하는 탭이 이미 존재하는지 확인
    const currentTabExists = Array.isArray(tabs) && tabs.some(tab => tab.path === location.pathname);

    // 홈 탭이 없으면 추가
    if (!homeTabExists) {
      addTab({
        title: '홈',
        path: '/main',
        component: MainPage,
        closable: false,
        icon: 'home',
      });
    }

    // 현재 URL이 메인이 아니고, 해당하는 탭이 없으면 추가
    if (location.pathname !== '/main' && !currentTabExists && currentPageInfo && currentComponent) {
      addTab({
        title: currentPageInfo.title,
        path: location.pathname,
        component: currentComponent,
        closable: true,
        icon: currentPageInfo.icon,
      });
    }
  }, [addTab, tabs, location.pathname]);

  return null;
};

const MainLayout: IComponent<IMainLayoutProps> = ({
  className = '',
}: IMainLayoutProps): React.JSX.Element => {
  const { authState } = useAuth();

  console.log('🏠 [MainLayout] 렌더링 시작:', {
    className,
    isAuthenticated: authState.isAuthenticated,
    userRoles: authState.user?.roles,
    user: authState.user,
    loading: authState.loading,
  });
  console.log('🏠 [MainLayout] TopHeader:', TopHeader);
  console.log('🏠 [MainLayout] LeftMenu:', LeftMenu);

  // 인증 상태 로딩 중일 때
  if (authState.loading) {
    console.log('⏳ [MainLayout] 인증 상태 로딩 중...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>인증 상태를 확인하고 있습니다...</div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!authState.isAuthenticated) {
    console.log('❌ [MainLayout] 인증되지 않은 사용자');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>인증이 필요합니다.</div>
      </div>
    );
  }

  return (
    <TabProvider>
      <div className={`main-page ${className}`} style={{ width: '100%', height: '100vh' }}>
        {/* 상단 헤더 */}
        <TopHeader
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '10px',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            height: '60px',
          }}
        />

        {/* 메인 콘텐츠 영역 */}
        <div
          className='main-page__content'
          style={{
            display: 'flex',
            marginTop: '60px',
            height: 'calc(100vh - 60px)',
          }}
        >
          {/* 좌측 메뉴 */}
          <LeftMenu
            style={{
              backgroundColor: '#f5f5f5',
              width: '250px',
              borderRight: '1px solid #ddd',
              overflow: 'auto',
            }}
          />

          {/* 메인 콘텐츠: 탭 시스템 */}
          <div
            className='main-page__main'
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
            }}
          >
            <HomeTabInitializer />
            <TabContainer />
          </div>
        </div>
      </div>
    </TabProvider>
  );
};

export default MainLayout;
