/**
 * 메인 레이아웃 컴포넌트
 * LeftMenu와 TopHeader를 포함하는 공통 레이아웃
 */
import React from 'react';
import { LeftMenu, TopHeader } from '../../../app/components/layout';
import '../../../assets/scss/style.css';
import type { IComponent } from '../../../app/types';

interface IMainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: IComponent<IMainLayoutProps> = ({ children, className = '' }): React.JSX.Element => {
  return (
    <div className={`main-page ${className}`}>
      {/* 상단 헤더 */}
      <TopHeader />
      
      {/* 메인 콘텐츠 영역 */}
      <div className="main-page__content">
        {/* 좌측 메뉴 */}
        <LeftMenu />
        
        {/* 메인 콘텐츠 */}
        <div className="main-page__main">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout; 