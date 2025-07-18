import type { IComponent } from '@/app/types';
import React, { useEffect } from 'react';
import MainContent from '../components/MainContent';

interface IMainPageProps {
  className?: string;
}

const MainPage: IComponent<IMainPageProps> = ({ className = '' }): React.JSX.Element => {

  return <MainContent className={className} />;
};

export default MainPage;
