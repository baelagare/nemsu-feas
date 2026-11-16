import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Re-mounts its children on every route change so each page fades/slides in,
 * and resets the scroll position to the top.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
