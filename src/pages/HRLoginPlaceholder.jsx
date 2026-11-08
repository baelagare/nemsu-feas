import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';

/**
 * Institutional Placeholder for HR Authentication route (/hr/login).
 * Refined architectural layout with zero slop.
 */
export default function HRLoginPlaceholder() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* Top Institutional Bar */}
      <header className="bg-[#071D45] text-white border-b border-white/10 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071D45] p-1 border border-white/15">
              <UniversitySeal className="h-full w-full" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm sm:text-base block leading-none">
                NEMSU-FEAS
              </span>
              <span className="text-[11px] text-slate-400 block">
                North Eastern Mindanao State University &bull; Cantilan Campus
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.08] px-2.5 py-1 text-[11px] font-mono text-amber-300 border border-white/10">
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>Authorized Personnel Only</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-lg rounded-xl bg-white p-6 sm:p-8 border border-slate-200 shadow-card text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-[#13469E] border border-slate-200"
            aria-hidden="true"
          >
            <ShieldCheck className="h-6 w-6" />
          </div>

          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wider text-slate-700 border border-slate-200 mb-3">
            HR Personnel Pathway &bull; Protected Portal
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            HR Authentication Module
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
            This module contains the secure HR login interface and performance analytics.
          </p>

          <div>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#13469E] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-subtle transition-colors hover:bg-[#0E367C] focus-visible:outline-2 focus-visible:outline-[#13469E]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Return to Landing Page</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Container */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pb-6">
        <Footer />
      </div>
    </div>
  );
}
