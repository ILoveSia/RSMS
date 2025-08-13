import type { IComponent } from '@/app/types';
import React from 'react';
import NewMainContent from '../components/NewMainContent';

interface IMainPageProps {
  className?: string;
}

const MainPage: IComponent<IMainPageProps> = ({ className = '' }): React.JSX.Element => {
  return <NewMainContent />;
};

export default MainPage;
