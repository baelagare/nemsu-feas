import React from 'react';

/**
 * Base shimmer block. Size it with Tailwind classes (h-*, w-*, rounded-*).
 */
export default function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

/**
 * Placeholder for the student evaluation form while config/rubric loads.
 */
export function EvaluationFormSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" role="status" aria-label="Loading evaluation form">
      <span className="sr-only">Loading evaluation form...</span>

      {/* Progress header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Form card */}
      <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command flex flex-col gap-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}

        <div className="rounded-2xl border border-slate-100 p-4 space-y-2.5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-11 w-36 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Placeholder for the HR analytics dashboard while data loads.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in" role="status" aria-label="Loading analytics">
      <span className="sr-only">Loading analytics data...</span>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[24px] bg-white p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-3"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-20" />
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Table + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[24px] bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="divide-y divide-slate-100">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16 hidden sm:block" />
                <Skeleton className="h-1.5 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-white p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-4">
          <Skeleton className="h-3 w-28" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

