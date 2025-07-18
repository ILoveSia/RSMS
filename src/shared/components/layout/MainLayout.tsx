/**
 * 메인 레이아웃 컴포넌트
 * LeftMenu와 TopHeader, Breadcrumb을 포함하는 공통 레이아웃
 */
import { LeftMenu, TopHeader } from '@/app/components/layout';
import { Breadcrumb } from '@/shared/components/navigation';
import type { IComponent } from '@/app/types';
import React from 'react';
import '../../../assets/scss/style.css';

interface IMainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: IComponent<IMainLayoutProps> = ({
  children,
  className = '',
}: IMainLayoutProps): React.JSX.Element => {
  return (
    <div className={`main-page ${className}`}>
      {/* 상단 헤더 */}
      <TopHeader />

      {/* Breadcrumb 네비게이션 */}
      <div className="breadcrumb-container" style={{
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        minHeight: '48px'
      }}>
        <Breadcrumb />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className='main-page__content'>
        {/* 좌측 메뉴 */}
        <LeftMenu />

        {/* 메인 콘텐츠 */}
        <div className='main-page__main'>{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
