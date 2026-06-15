import React from "react";

export const NormalModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className={className}>
    <rect x="0" y="0.5" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
    <rect x="0" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="0" y="6" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
    <rect x="0" y="8.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="0" y="11.5" width="16" height="1" rx="0.5" fill="currentColor" opacity="0.25" />
    <rect x="0" y="13" width="16" height="1" rx="0.5" fill="currentColor" opacity="0.25" />
  </svg>
);

export const TabsModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className={className}>
    <line x1="1" y1="2" x2="17" y2="2" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <line x1="1" y1="4.4" x2="17" y2="4.4" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <line x1="1" y1="6.8" x2="17" y2="6.8" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <line x1="1" y1="9.2" x2="17" y2="9.2" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <line x1="1" y1="11.6" x2="17" y2="11.6" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <line x1="1" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    <text x="3.5" y="10" fontSize="6" fontWeight="700" fill="currentColor" fontFamily="system-ui">TAB</text>
  </svg>
);

export const LyricsModeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className={className}>
    <rect x="0" y="1.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="0" y="5" width="11" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="0" y="8.5" width="16" height="1.5" rx="0.75" fill="currentColor" />
    <rect x="0" y="12" width="10" height="1.5" rx="0.75" fill="currentColor" />
  </svg>
);
