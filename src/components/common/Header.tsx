import React from 'react';
import { Search, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="h-16 bg-[#09090B] border-b-2 border-[#3F3F46] sticky top-0 z-30 px-6 flex items-center justify-between font-mono">
      {/* Kinetic Search Bar */}
      <div className="flex items-center space-x-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="SEARCH CLIENTS, PROJECTS, INVOICES... (⌘K)"
            className="w-full bg-[#18181B] border-2 border-[#3F3F46] pl-9 pr-4 py-2 text-xs text-[#FAFAFA] uppercase placeholder-zinc-500 focus:outline-none focus:border-[#DFE104] focus:ring-0 font-mono tracking-tight"
          />
        </div>
      </div>

      {/* Right Controls: System Status Badge, User Profile, Sign Out */}
      <div className="flex items-center space-x-4">
        {/* System Operational Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#18181B] border-2 border-[#3F3F46] text-xs font-bold uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-[#DFE104]" />
          <span className="text-[#FAFAFA]">
            SYSTEM ACTIVE
          </span>
        </div>

        {/* User Profile Badge */}
        {profile && (
          <div className="flex items-center space-x-3 text-xs border-l-2 border-[#3F3F46] pl-4">
            <span className="w-2.5 h-2.5 bg-[#DFE104]"></span>
            <span className="font-bold text-[#FAFAFA] uppercase tracking-wider">{profile.name}</span>
            <span className="text-[10px] font-bold uppercase text-black bg-[#DFE104] px-2 py-0.5 border border-black">
              {profile.title}
            </span>
          </div>
        )}

        {/* Sign Out Trigger */}
        {user && (
          <button
            onClick={signOut}
            className="px-3 py-1.5 bg-[#18181B] hover:bg-rose-600 border-2 border-[#3F3F46] hover:border-rose-600 text-[#FAFAFA] hover:text-white transition-colors font-bold uppercase text-xs flex items-center gap-1.5 tracking-wider"
            title="Sign Out of Growzy OS"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXIT OS</span>
          </button>
        )}
      </div>
    </header>
  );
};
