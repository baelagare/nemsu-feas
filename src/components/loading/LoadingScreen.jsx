import React from 'react';
import { LoadingDots } from './Spinner';

/**
 * Branded loading screen with the NEMSU tile, a pulse ring and an
 * indeterminate progress bar.
 *
 * - `variant="page"` (default): fills the viewport, used for route-level loading.
 * - `variant="overlay"`: blurred fixed overlay on top of the current page,
 *   used for blocking actions such as submitting or signing out.
 */
export default function LoadingScreen({
  message = 'Loading',
  subMessage = 'NEMSU Cantilan \u00B7 FEAS',
  variant = 'page',
}) {
  const isOverlay = variant === 'overlay';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center gap-5 animate-fade-in ${
        isOverlay
          ? 'fixed inset-0 z-[60] bg-[#F8FAFC]/80 backdrop-blur-sm'
          : 'min-h-screen w-full bg-[#F8FAFC]'
      }`}
    >
      {/* Logo tile with pulse ring */}
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-[20px] bg-[#0B2545]/40 animate-ring-pulse" />
        <span
          className="absolute inset-0 rounded-[20px] bg-[#0B2545]/25 animate-ring-pulse"
          style={{ animationDelay: '0.8s' }}
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#0B2545] text-[#F5B800] text-[28px] font-extrabold shadow-command animate-float">
          N
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center px-6">
        <p className="flex items-center gap-2 text-sm sm:text-[15px] font-extrabold tracking-tight text-[#0B2545]">
          <span>{message}</span>
          <LoadingDots className="bg-[#0B2545]" />
        </p>
        {subMessage && (
          <p className="text-xs font-medium text-slate-500">{subMessage}</p>
        )}
      </div>

      {/* Indeterminate progress bar */}
      <div className="h-1 w-36 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full w-2/5 rounded-full bg-[#0B2545] animate-progress-indeterminate" />
      </div>
    </div>
  );
}

