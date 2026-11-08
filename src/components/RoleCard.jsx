import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Institutional Role Selection Card.
 * Strictly Navy Blue & White hierarchy:
 * - Primary (Student Evaluation): Bold 2px Navy border, solid Navy icon & CTA bar.
 * - Secondary (HR / Admin): Restrained 1px neutral border, subtle slate CTA bar.
 */
export default function RoleCard({
  to,
  variant = 'secondary',
  title,
  badgeText,
  description,
  ctaText,
  icon: Icon,
  testId,
}) {
  const isPrimary = variant === 'primary';

  return (
    <Link
      to={to}
      data-testid={testId}
      className={`group relative flex w-full flex-col justify-between rounded-xl p-6 text-left no-underline transition-all duration-150 select-none ${
        isPrimary
          ? 'bg-white border-2 border-[#0B2545] shadow-card hover:border-[#133C6E] hover:shadow-elevated active:bg-slate-50'
          : 'bg-white border border-slate-200 shadow-subtle hover:border-slate-300 hover:bg-slate-50/60 active:bg-slate-100/80'
      }`}
    >
      <div>
        {/* Role Header */}
        <div className="flex items-start gap-4 mb-3">
          {Icon && (
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
                isPrimary
                  ? 'bg-[#0B2545] text-white'
                  : 'bg-slate-100 text-[#0B2545] border border-slate-200 group-hover:bg-slate-200/70'
              }`}
              aria-hidden="true"
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
            </div>
          )}

          <div className="min-w-0 flex-1">
            {badgeText && (
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wider mb-1 ${
                  isPrimary ? 'text-[#0B2545]' : 'text-slate-500'
                }`}
              >
                {badgeText}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        {/* Role Description */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Explicit Touch-Friendly Action Button Appearance */}
      <div
        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-bold transition-colors duration-150 ${
          isPrimary
            ? 'bg-[#0B2545] text-white group-hover:bg-[#133C6E] active:bg-[#040F21]'
            : 'bg-slate-100 text-[#0B2545] border border-slate-200/80 group-hover:bg-[#0B2545] group-hover:text-white group-hover:border-[#0B2545]'
        }`}
      >
        <span>{ctaText}</span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-current transition-transform duration-150 ease-out group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
