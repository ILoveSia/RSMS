import React from 'react';
import { MainLayout } from '../../../shared/components/layout';
import MainContent from '../components/MainContent';
import type { IComponent } from '../../../app/types';

interface IMainPageProps {
  className?: string;
}

const MainPage: IComponent<IMainPageProps> = ({ className = '' }): React.JSX.Element => {
  return (
    <MainLayout className={className}>
      <MainContent />
    </MainLayout>
  );
};

export default MainPage; 