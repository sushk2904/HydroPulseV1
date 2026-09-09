import React from 'react';

export const Navbar: React.FC = () => {
  const navItems = [
    { label: 'SIMULATION', href: '#simulation' },
    { label: 'MAP', href: '#map' },
    { label: 'METRICS', href: '#metrics' },
    { label: 'ABOUT', href: '#about' },
  ];

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      {/* Centered Expanded Pill / Capsule Navbar with VisionOS Glass Finish */}
      <div
        className="flex items-center gap-3 md:gap-4 px-6 py-2.5 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 100%)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Brand Name */}
        <a
          href="#"
          className="font-mono text-[11px] font-bold tracking-[0.22em] text-white uppercase pr-1 hover:opacity-80 transition-opacity"
        >
          HYDROPULSE
        </a>

        {/* Vertical subtle divider */}
        <span className="h-4 w-[1px] bg-white/20" />

        {/* 4 Navigation Buttons */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 rounded-full font-mono text-[10px] md:text-[11px] font-medium tracking-[0.16em] text-white/65 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};
