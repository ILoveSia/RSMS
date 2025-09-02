import type { IComponent } from '@/app/types';
import React from 'react';
import NewMainDashboard from '../components/NewMainDashboard';

interface IMainPageProps {
  className?: string;
}

const MainPage: IComponent<IMainPageProps> = ({ className = '' }): React.JSX.Element => {
  return <NewMainDashboard />;
};

export default MainPage;
