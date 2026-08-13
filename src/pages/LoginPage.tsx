import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogIn, UserPlus, Lock, Mail, User, AlertCircle } from 'lucide-react';
import Marquee from 'react-fast-marquee';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isConfigured } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name, title);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between selection:bg-[#DFE104] selection:text-black font-sans bg-noise">
      {/* High Energy Ticker Marquee */}
      <div className="bg-[#DFE104] text-black py-2.5 font-mono text-xs font-black tracking-widest border-b-2 border-black">
        <Marquee speed={70} gradient={false}>
          <span className="mx-8 uppercase">⚡ GROWZY OS V1.0 /// HIGH PERFORMANCE AGENCY SYSTEM</span>
          <span className="mx-8 uppercase">★ HAWKVEC MILESTONE ENGINE /// REAL-TIME DELIVERABLES</span>
          <span className="mx-8 uppercase">⚡ FOUNDER'S OPERATIONAL MATRIX /// KINETIC TYPOGRAPHY SYSTEM</span>
          <span className="mx-8 uppercase">★ PRODUCTION AGENCY DIRECTORY /// INVOICE LEDGER</span>
        </Marquee>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#09090B] border-2 border-[#3F3F46] p-8 md:p-12 space-y-8 shadow-none">
          {/* Header Branding */}
          <div className="space-y-3">
            <div className="w-14 h-14 bg-[#DFE104] text-black flex items-center justify-center font-display font-black text-3xl border-2 border-black">
              G
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter font-display text-[#FAFAFA]">
              GROWZY OPERATING SYSTEM
            </h1>
            <p className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              {mode === 'login' ? '01. ENTER EXECUTIVE CREDENTIALS' : '02. ONBOARD NEW AGENCY PARTNER'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold uppercase p-1 bg-[#18181B] border-2 border-[#3F3F46]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 transition-colors ${
                mode === 'login'
                  ? 'bg-[#DFE104] text-black font-extrabold border border-black'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              01. SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2.5 transition-colors ${
                mode === 'signup'
                  ? 'bg-[#DFE104] text-black font-extrabold border border-black'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              02. REGISTER PARTNER
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-4 bg-rose-950/80 border-2 border-rose-600 text-rose-300 text-xs font-mono flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block mb-1">AUTH ERROR REPORTED</span>
                {error}
              </div>
            </div>
          )}

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-[#A1A1AA] tracking-wider block">
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ENTER YOUR FULL NAME"
                      className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] pl-10 pr-4 py-3 text-sm font-mono text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase text-[#A1A1AA] tracking-wider block">
                    AGENCY ROLE / TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ENTER YOUR ROLE (E.G. FOUNDER)"
                    className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] px-4 py-3 text-sm font-mono text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-[#A1A1AA] tracking-wider block">
                PARTNER EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="NAME@AGENCY.COM"
                  className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] pl-10 pr-4 py-3 text-sm font-mono text-[#FAFAFA] uppercase placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-[#A1A1AA] tracking-wider block">
                PASSWORD SECURITY
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  className="w-full bg-[#18181B] border-b-2 border-[#3F3F46] focus:border-[#DFE104] pl-10 pr-4 py-3 text-sm font-mono text-[#FAFAFA] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#DFE104] hover:bg-[#c7c902] active:scale-[0.99] text-black font-extrabold text-sm uppercase tracking-wider transition-all border-2 border-black flex items-center justify-center space-x-2 font-mono"
            >
              {loading ? (
                <span>AUTHENTICATING AGENT...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>SIGN IN TO GROWZY OS</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>CREATE AGENCY ACCOUNT</span>
                </>
              )}
            </button>
          </form>

          {/* Footing note */}
          <div className="pt-4 border-t-2 border-[#3F3F46] flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#DFE104]" />
              <span>ENTERPRISE END-TO-END SECURITY ACTIVE</span>
            </span>
            <span>V1.0.0</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t-2 border-[#3F3F46] text-center font-mono text-xs text-[#A1A1AA] uppercase">
        GROWZY OS /// HIGH PERFORMANCE AGENCY OPERATING SYSTEM
      </div>
    </div>
  );
};
