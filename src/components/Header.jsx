import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimalist Institutional Header for NEMSU Cantilan FEAS.
 * Matches the portal landing design across all pages and modules.
 */
export default function Header({
  subtitle = 'Faculty Evaluation \u00B7 FEAS',
  rightContent = null,
  maxWidthClass = 'max-w-6xl',
  className = '',
}) {
  return (
    <header
      className={`w-full ${maxWidthClass} mx-auto px-6 sm:px-10 pt-6 sm:pt-8 flex items-center justify-between gap-4 ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-3 group rounded-xl focus-visible:outline-2 focus-visible:outline-[#0B2545]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-[#F5B800] font-extrabold text-base shadow-subtle">
          N
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-[15px] font-extrabold tracking-tight text-[#0B2545] leading-tight">
            NEMSU Cantilan
          </span>
          <span className="text-xs font-medium text-slate-500 leading-tight mt-0.5">
            {subtitle}
          </span>
        </div>
      </Link>

      {rightContent && <div className="flex items-center gap-3 shrink-0">{rightContent}</div>}
    </header>
  );
}
