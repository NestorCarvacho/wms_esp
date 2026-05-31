import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavigation } from './MainMenu';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen">
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <main className="main-content-padding">
        <div>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  </div>
);

export default MainLayout;
