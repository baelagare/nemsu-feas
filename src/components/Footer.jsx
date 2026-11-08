import React from 'react';

/**
 * Minimal institutional footer with authentic university attribution.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-8 border-t border-slate-200 pt-5 text-left"
      aria-label="Institutional footer"
    >
      <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-slate-800">
            North Eastern Mindanao State University &ndash; Cantilan Campus
          </p>
          <p className="text-slate-500 mt-0.5">
            Office of the Campus Director &bull; Human Resource Management Office
          </p>
        </div>

        <div className="text-slate-500 sm:text-right shrink-0">
          <p>&copy; {currentYear} NEMSU. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
