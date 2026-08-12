import React from 'react';
import { Database, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SupabaseBanner: React.FC = () => {
  if (isSupabaseConfigured) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">
              Supabase Project Connection Required
            </p>
            <p className="text-amber-300/80 mt-0.5">
              To activate real PostgreSQL database operations and Auth, add your Supabase credentials to <code className="bg-dark-900 px-1.5 py-0.5 rounded text-white font-mono font-bold">.env.local</code> inside <code className="bg-dark-900 px-1.5 py-0.5 rounded text-white font-mono">growzy_v1</code>.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 font-mono text-[11px] flex-shrink-0">
          <span className="text-slate-400">Step 1: Execute SQL Schema</span>
          <span className="text-slate-400">→</span>
          <span className="text-slate-400">Step 2: Add Keys to .env.local</span>
        </div>
      </div>
    </div>
  );
};
