'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithGoogle, startDemoSession, getCurrentUser } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());

    // Check if user is already logged in
    getCurrentUser().then((user) => {
      if (user) {
        router.replace('/dashboard');
      }
    });

    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'auth_callback_failed') {
        setErrorMessage('Authentication callback failed. Please try signing in again.');
      } else {
        setErrorMessage('Authentication error occurred. Please verify your credentials.');
      }
    }
  }, [router, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const result = await signInWithGoogle();
    if (!result.success) {
      setIsLoading(false);
      setErrorMessage(result.error || 'Failed to initialize Google Sign In.');
    }
  };

  const handleDemoSignIn = () => {
    setIsLoading(true);
    startDemoSession();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <CheckCircle2 size={28} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">TaskFlow</h1>
            <p className="text-xs text-indigo-600 font-semibold tracking-wider uppercase">
              Task Management
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-900">
          Welcome to your workspace
        </h2>
        <p className="mt-1 text-center text-xs text-slate-600 max-w-sm mx-auto">
          A modern, focused task management application with Google Authentication and Supabase Row Level Security.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl border border-slate-200/80 sm:px-10 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Sign in Notice</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Configuration Status pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Backend Provider</span>
            <div className="flex items-center gap-1.5 font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className={isConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                {isConfigured ? 'Supabase Connected' : 'Demo / Standby'}
              </span>
            </div>
          </div>

          {/* Primary Action: Google Sign In Button */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Quick Demo Access (for seamless local evaluation) */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or instant preview</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-700 text-xs font-semibold hover:bg-indigo-100/70 transition-colors"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>Explore Demo Workspace (Instant Access)</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Security & Feature points */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-indigo-600 shrink-0" />
              <span>Row Level Security (RLS) protects your tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>Strict 3-stage workflow: Planned, In Progress, Complete</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400">
          TaskFlow &copy; 2026. Built with Next.js, Supabase and Tailwind CSS.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
