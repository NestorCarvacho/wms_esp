import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppNoIndex } from '@/components/seo/AppNoIndex';
import { TopNavigation } from './MainMenu';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen">
    <AppNoIndex />
    <TopNavigation />

    <main className="main-content-padding">
      {children || <Outlet />}
    </main>
  </div>
);

export default MainLayout;
