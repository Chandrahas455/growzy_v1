import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans bg-noise">
      <div className="flex flex-1 min-h-0">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <Outlet context={{ currentProfile: profile }} />
          </main>
        </div>
      </div>
    </div>
  );
};
