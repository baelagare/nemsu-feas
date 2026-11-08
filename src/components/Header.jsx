import React from 'react';
import UniversitySeal from './UniversitySeal';

/**
 * Institutional Header / System Identity Bar.
 * Strictly Navy Blue & White academic lockup for North Eastern Mindanao State University.
 */
export default function Header() {
  return (
    <header className="relative z-10 flex items-center gap-4">
      {/* Institutional Crest - Framed in crisp white/translucent border */}
      <div className="shrink-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 p-1.5 border border-white/20 shadow-subtle">
          <UniversitySeal className="h-full w-full" />
        </div>
      </div>

      {/* University & Campus Identity */}
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          North Eastern Mindanao State University
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight mt-0.5">
          Cantilan Campus
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-300 mt-0.5">
          Faculty Evaluation and Analytics System (NEMSU-FEAS)
        </p>
      </div>
    </header>
  );
}
