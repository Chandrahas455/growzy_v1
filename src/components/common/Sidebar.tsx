import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, Trello, Receipt, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { profile, user, signOut } = useAuth();

  const navItems = [
    {
      name: "01. DASHBOARD",
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: '02. CLIENT ACCOUNTS',
      path: '/clients',
      icon: Users,
    },
    {
      name: '03. PROJECTS & HAWKVEC',
      path: '/projects',
      icon: FolderKanban,
    },
    {
      name: '04. EXECUTION BOARD',
      path: '/kanban',
      icon: Trello,
    },
    {
      name: '05. FINANCE LEDGER',
      path: '/finance',
      icon: Receipt,
    },
  ];

  return (
    <aside className="w-64 bg-[#09090B] border-r-2 border-[#3F3F46] flex flex-col h-screen fixed left-0 top-0 z-40 select-none font-mono">
      {/* Kinetic Brand Header */}
      <div className="h-16 px-5 border-b-2 border-[#3F3F46] flex items-center justify-between bg-[#18181B]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#DFE104] text-black flex items-center justify-center font-extrabold text-base border-2 border-black">
            G
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[#FAFAFA] tracking-tighter uppercase font-display leading-none">
              GROWZY
            </h1>
            <p className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-widest mt-0.5">
              AGENCY OS V1.0
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-[#DFE104] text-black border border-black uppercase tracking-wider">
          LIVE DB
        </span>
      </div>

      {/* Navigation Modules */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#A1A1AA]">
          CORE MODULES
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 text-xs font-bold transition-all border-2 ${
                  isActive
                    ? 'bg-[#DFE104] text-black border-[#DFE104] shadow-none translate-x-1'
                    : 'text-[#FAFAFA] border-[#3F3F46] hover:bg-[#18181B] hover:border-[#DFE104] hover:text-[#DFE104]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate tracking-tight uppercase">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Card Footing */}
      {profile && (
        <div className="p-4 border-t-2 border-[#3F3F46] bg-[#18181B]">
          <div className="flex items-center space-x-3">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={profile.name}
              className="w-9 h-9 border-2 border-[#DFE104] object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#FAFAFA] truncate uppercase">{profile.name}</p>
              <p className="text-[10px] text-[#A1A1AA] truncate uppercase tracking-tight">{profile.title}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
