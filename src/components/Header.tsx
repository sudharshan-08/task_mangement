'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/task';
import { LogOut, CheckCircle, ShieldCheck, User } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => Promise<void>;
  isDemo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, isDemo = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <CheckCircle size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-lg">TaskFlow</span>
              {isDemo && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Demo Session
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Task Management Application</p>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Welcome User display */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center border border-indigo-200 shrink-0">
              {user?.avatar_url && !imageError ? (
                <Image
                  src={user.avatar_url}
                  alt={displayName}
                  fill
                  sizes="32px"
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : initials ? (
                <span>{initials}</span>
              ) : (
                <User size={16} />
              )}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                {user?.email || 'Authenticated'}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors disabled:opacity-50"
            title="Sign out of TaskFlow"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
