import React, { useState, useEffect } from 'react';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  created_at?: string | null;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  onUpdateUser: (updatedUser: AuthUser) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'telemetry'>('profile');
  
  // Edit profile state
  const [editName, setEditName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
    setProfileSuccess('');
    setProfileError('');
    setPasswordSuccess('');
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Get initials for avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'OP';

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Operator';

  // Handle name update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!editName.trim()) {
      setProfileError('Operator name cannot be empty');
      return;
    }

    const token = localStorage.getItem('hydropulse_token');
    if (!token) {
      setProfileError('Session expired. Please log in again.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.detail || 'Failed to update profile');
        return;
      }

      onUpdateUser(data.user);
      setProfileSuccess('Operator profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch {
      setProfileError('Network error. Failed to reach server.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const token = localStorage.getItem('hydropulse_token');
    if (!token) {
      setPasswordError('Session expired. Please log in again.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.detail || 'Failed to change password');
        return;
      }

      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch {
      setPasswordError('Network error. Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#090d13] border border-cyan-500/30 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 217, 255, 0.15)',
        }}
      >
        {/* Top Decorative Scanning Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00d9ff]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="font-mono text-xs tracking-[0.2em] text-cyan-300 font-semibold uppercase">
              OPERATOR PROFILE // COMMAND DECK
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors font-mono text-xs cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* User Identity Header Card */}
        <div className="px-6 py-5 bg-gradient-to-b from-cyan-950/20 to-transparent border-b border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 flex items-center justify-center font-mono text-xl font-bold text-cyan-300 shadow-[0_0_20px_rgba(0,217,255,0.25)]">
              {initials}
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-mono text-[9px] tracking-wider font-semibold">
              ACTIVE
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold font-mono tracking-wide text-white">
                {user.name}
              </h2>
              <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] tracking-wider">
                ID: HP-OP-{String(user.id).padStart(4, '0')}
              </span>
            </div>
            <p className="text-white/60 font-mono text-xs">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[10px] font-mono text-white/40">
              <span>MEMBER SINCE: {memberSince}</span>
              <span>•</span>
              <span className="text-cyan-400/80">CLEARANCE LEVEL 4</span>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 hover:border-red-400 font-mono text-[11px] tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>SIGN OUT</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-white/10 bg-black/30 font-mono text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 font-medium tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-400/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span>OPERATOR INFO</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 border-b-2 font-medium tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-400/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span>SECURITY & PASSWORD</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 border-b-2 font-medium tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-400/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span>SYSTEM PERMISSIONS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: Profile Info & Name Change */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {profileSuccess && (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs text-center animate-in fade-in">
                  ✓ {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-xs text-center animate-in fade-in">
                  ✕ {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] uppercase tracking-wider block">
                    Operator Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] uppercase tracking-wider block">
                    Registered Email (Read Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white/50 cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-white/30">Email is locked to primary verified credentials.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-white/40 block">ASSIGNED COMMAND</span>
                    <span className="text-xs font-semibold text-white tracking-wide">MUMBAI DISPATCH SECTOR 1</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <span className="text-[10px] text-white/40 block">PHYSICS ENGINE</span>
                    <span className="text-xs font-semibold text-emerald-400 tracking-wide">SWMM 5.2 Dynamic Wave</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile || editName === user.name}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUpdatingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Change Password */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {passwordSuccess && (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs text-center animate-in fade-in">
                  ✓ {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-xs text-center animate-in fade-in">
                  ✕ {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] uppercase tracking-wider block">
                    Current Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] uppercase tracking-wider block">
                    New Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] uppercase tracking-wider block">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white transition-all font-mono"
                  />
                </div>

                {/* Password visibility toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="showPass"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="rounded border-white/20 bg-black/50 text-cyan-400 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="showPass" className="text-white/60 text-[11px] cursor-pointer">
                    Show password characters
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,217,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isChangingPassword ? 'CHANGING PASSWORD...' : 'UPDATE PASSWORD'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Telemetry & Permissions */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">AUTHENTICATION ALGORITHM</span>
                  <span className="text-cyan-300 font-semibold">JWT-HS256 + BCRYPT(12)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">GRAPH TOPOLOGY ACCESS</span>
                  <span className="text-emerald-400 font-semibold">36,862 NODES // 34,620 EDGES</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">SPATIO-TEMPORAL GNN ENGINE</span>
                  <span className="text-emerald-400 font-semibold">ONLINE (best_mumbai_stgnn.pt)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">DATABASE STORAGE</span>
                  <span className="text-cyan-300 font-semibold">SQLITE SECURE PERSISTENCE</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  ⚡
                </div>
                <div className="text-[11px] text-white/70">
                  Your session is actively authenticated. Changes made to your profile take effect immediately across all HydroPulse command modules.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
