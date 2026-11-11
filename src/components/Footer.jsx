import React from 'react';

/**
 * Minimalist institutional footer with Data Privacy Act of 2012 (RA 10173) notice.
 */
export default function Footer({ className = '' }) {
  return (
    <footer
      className={`w-full border-t border-slate-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 ${className}`}
      aria-label="Institutional footer"
    >
      <p>Protected under the Data Privacy Act of 2012 (RA 10173).</p>
      <p>&copy; 2026 NEMSU Cantilan</p>
    </footer>
  );
}
