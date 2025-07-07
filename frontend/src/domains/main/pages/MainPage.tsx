import type { IComponent } from '@/app/types';
import React, { useEffect } from 'react';
import MainContent from '../components/MainContent';

interface IMainPageProps {
  className?: string;
}

const MainPage: IComponent<IMainPageProps> = ({ className = '' }): React.JSX.Element => {
  useEffect(() => {
    console.log('[MainPage] 컴포넌트가 마운트되었습니다.');
    return () => {
      console.log('[MainPage] 컴포넌트가 언마운트되었습니다.');
    };
  }, []);

  console.log('[MainPage] 렌더링 중...', { className });

  return <MainContent className={className} />;
};

export default MainPage;
