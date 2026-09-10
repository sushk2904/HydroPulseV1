import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { smoothScrollTo } from '../lib/utils';
import { ProfileModal, AuthUser } from './ProfileModal';

interface NavbarProps {
  onLaunchSimulation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchSimulation }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Restore session from stored JWT on mount
  useEffect(() => {
    const token = localStorage.getItem('hydropulse_token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Session expired');
          return res.json();
        })
        .then((data) => {
          setCurrentUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem('hydropulse_token');
        });
    }
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
  };

  const handleOpenModal = () => {
    resetForm();
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const handleLogout = () => {
    localStorage.removeItem('hydropulse_token');
    setCurrentUser(null);
    setShowProfileModal(false);
    window.location.hash = '#/';
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        authMode === 'login'
          ? { email, password }
          : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Extract error detail from FastAPI's response
        const detail = data.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors
          const msgs = detail.map((d: any) => d.msg?.replace('Value error, ', '') || d.msg || String(d));
          setError(msgs.join('. '));
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      // Success
      localStorage.setItem('hydropulse_token', data.token);
      setCurrentUser(data.user);
      setSuccessMsg(authMode === 'login' ? 'Login successful! Redirecting...' : 'Account created! Redirecting...');

      setTimeout(() => {
        handleCloseModal();
        if (onLaunchSimulation) {
          onLaunchSimulation();
        } else {
          window.location.hash = '#/simulation';
        }
      }, 650);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Centered Expanded Capsule Navbar */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <div
          className="flex items-center gap-3 md:gap-4 px-6 py-2.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
          }}
        >
          {/* Brand Name — Scrolls smoothly to Top/Landing Page */}
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault();
              smoothScrollTo(0);
            }}
            className="font-mono text-[11px] font-bold tracking-[0.22em] text-white uppercase pr-1 hover:opacity-80 transition-opacity cursor-pointer"
          >
            HYDROPULSE
          </a>

          {/* Vertical subtle divider */}
          <span className="h-4 w-[1px] bg-white/20" />

          {/* Navigation Links with Smooth Scrolling */}
          <nav className="flex items-center gap-1.5">
            <a
              href="#command-deck"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('#command-deck');
              }}
              className="px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-medium tracking-[0.16em] text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              COMMAND DECK
            </a>

            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo('#about');
              }}
              className="px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-medium tracking-[0.16em] text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              ABOUT
            </a>
          </nav>
        </div>
      </header>

      {/* Right Side: Auth / Profile Button */}
      <div className="fixed top-5 right-6 md:right-10 z-40 pointer-events-auto">
        {currentUser ? (
          <div className="flex items-center gap-2">
            {/* Operator Profile Trigger Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.14em] bg-cyan-400/20 text-cyan-300 border border-cyan-400/50 hover:bg-cyan-400/30 hover:border-cyan-300 transition-all duration-200 shadow-[0_0_15px_rgba(0,217,255,0.25)] hover:shadow-[0_0_25px_rgba(0,217,255,0.45)] cursor-pointer group"
            >
              <div className="w-4 h-4 rounded-full bg-cyan-400/30 border border-cyan-400 flex items-center justify-center text-[9px] text-cyan-200">
                👤
              </div>
              <span className="hidden sm:inline group-hover:text-white transition-colors">
                {currentUser.name.toUpperCase()}
              </span>
              <span className="sm:hidden">PROFILE</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.14em] bg-red-500/20 text-red-300 border border-red-400/40 hover:bg-red-500/30 hover:border-red-400 transition-all duration-200 shadow-[0_0_12px_rgba(255,60,60,0.2)] hover:shadow-[0_0_20px_rgba(255,60,60,0.4)] cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenModal}
            className="flex items-center px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-semibold tracking-[0.14em] bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/30 hover:border-cyan-400 transition-all duration-200 shadow-[0_0_12px_rgba(0,217,255,0.2)] hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] cursor-pointer"
          >
            LOGIN / SIGNUP
          </button>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onLogout={handleLogout}
      />

      {/* Authentication Modal */}
      {showAuthModal && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[#0a0e14] border border-cyan-400/40 text-white animate-in fade-in zoom-in-95 duration-200 my-auto"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 217, 255, 0.25)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors font-mono text-sm cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold font-mono tracking-wider text-white">
                {authMode === 'login' ? 'LOGIN' : 'SIGN UP'}
              </h3>
              <p className="text-white/30 text-[10px] font-mono tracking-wide mt-1">
                {authMode === 'login' ? 'Access your operator dashboard' : 'Create your operator account'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] font-mono text-center">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono text-center">
                {successMsg}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs">
              {/* Name Field (signup only) */}
              {authMode === 'signup' && (
                <div className="space-y-1.5 text-left">
                  <label className="text-white/50 text-[10px] tracking-wider uppercase block">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-white/20 transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-white/50 text-[10px] tracking-wider uppercase block">
                  Operator Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@hydropulse.ai"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-white/20 transition-all"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-white/50 text-[10px] tracking-wider uppercase block">
                  Secure Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white placeholder-white/20 transition-all"
                />
                {authMode === 'signup' && (
                  <p className="text-white/25 text-[9px] mt-0.5">Minimum 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold font-mono text-xs tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(0,217,255,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>PROCESSING...</span>
                  </>
                ) : authMode === 'login' ? (
                  'SIGN IN'
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>

              {/* Switch Auth Mode */}
              <div className="pt-1 text-center text-white/40 text-[11px]">
                {authMode === 'login' ? (
                  <span>
                    New operator?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Sign up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;
