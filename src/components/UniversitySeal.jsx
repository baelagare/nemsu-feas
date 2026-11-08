import React from 'react';

/**
 * Dignified, high-resolution SVG Institutional Crest for NEMSU-FEAS.
 * Combines traditional academic heraldry (shield, open book, stars)
 * with modern data nodes, reflecting both university heritage and analytical capability.
 */
export default function UniversitySeal({ className = 'h-12 w-12', isCompact = false }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NEMSU Institutional Crest"
      role="img"
    >
      <defs>
        <linearGradient id="nemsuGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBD560" />
          <stop offset="50%" stopColor="#F5B800" />
          <stop offset="100%" stopColor="#D99B2B" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#13469E" />
          <stop offset="100%" stopColor="#071D45" />
        </linearGradient>
      </defs>

      {/* Outer Golden Ring */}
      <circle cx="50" cy="50" r="46" stroke="url(#nemsuGold)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 3" />

      {/* Academic Shield Base */}
      <path
        d="M50 16 L76 25 C76 52 50 78 50 78 C50 78 24 52 24 25 Z"
        fill="url(#shieldGrad)"
        stroke="url(#nemsuGold)"
        strokeWidth="2.2"
      />

      {/* Open Book of Knowledge */}
      <path
        d="M34 46 C40 43 46 45 50 48 C54 45 60 43 66 46 L66 60 C60 57 54 59 50 62 C46 59 40 57 34 60 Z"
        fill="#FFFFFF"
      />
      <path
        d="M50 48 L50 62"
        stroke="#071D45"
        strokeWidth="1.5"
      />
      {/* Book page lines */}
      <path d="M38 49 C42 47 46 48 48 50" stroke="#71829A" strokeWidth="1" strokeLinecap="round" />
      <path d="M38 53 C42 51 46 52 48 54" stroke="#71829A" strokeWidth="1" strokeLinecap="round" />
      <path d="M52 50 C54 48 58 47 62 49" stroke="#71829A" strokeWidth="1" strokeLinecap="round" />
      <path d="M52 54 C54 52 58 51 62 53" stroke="#71829A" strokeWidth="1" strokeLinecap="round" />

      {/* Three Stars (Knowledge, Excellence, Service) */}
      <polygon points="50,23 51.5,27 55.5,27 52.2,29.5 53.5,33.5 50,31 46.5,33.5 47.8,29.5 44.5,27 48.5,27" fill="url(#nemsuGold)" />
      <polygon points="36,30 37,33 40,33 37.5,35 38.5,38 36,36 33.5,38 34.5,35 32,33 35,33" fill="url(#nemsuGold)" />
      <polygon points="64,30 65,33 68,33 65.5,35 66.5,38 64,36 61.5,38 62.5,35 60,33 63,33" fill="url(#nemsuGold)" />

      {/* Analytics Constellation / Star at bottom of shield */}
      <circle cx="50" cy="70" r="2.5" fill="#F5B800" />
      <circle cx="43" cy="67" r="1.5" fill="#FBD560" />
      <circle cx="57" cy="67" r="1.5" fill="#FBD560" />
      <path d="M43 67 L50 70 L57 67" stroke="#F5B800" strokeWidth="1" strokeDasharray="1 1" />

      {/* Lower Ribbon with NEMSU text */}
      <path
        d="M26 80 L50 76 L74 80 L70 88 L50 84 L30 88 Z"
        fill="#071D45"
        stroke="url(#nemsuGold)"
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="83"
        fill="#F5B800"
        fontSize="6.5"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="1"
        fontFamily="sans-serif"
      >
        NEMSU
      </text>
    </svg>
  );
}
