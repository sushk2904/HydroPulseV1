import React from 'react';
import { smoothScrollTo } from '../lib/utils';

interface AboutSectionProps {
  onLaunchSimulation?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onLaunchSimulation }) => {
  const services = [
    'Hydraulic Modeling',
    'AI Flood Nowcasting',
    'ST-GAT-GRU Routing',
    'Sensor Telemetry',
    'SWMM 5.2 Ingestion',
    'Digital Twin Simulation',
    'PostGIS Overland Heatmaps',
    'Emergency Evacuation',
  ];

  return (
    <section
      id="about"
      className="bg-[#030708] text-white py-20 md:py-28 px-6 md:px-14 lg:px-20 border-t border-white/[0.08] overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Headline with Faculty Glyphic Font in Dark Mode */}
        <div className="space-y-1">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.18] text-white tracking-[-0.01em] drop-shadow-sm"
            style={{ fontFamily: "'Faculty Glyphic', sans-serif" }}
          >
            One unified flood intelligence.
            <br />
            Every surge, conduit, and evacuation corridor.
          </h2>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full h-[1px] bg-white/[0.08]" />

        {/* 2-Column Layout: SOCIALS on the Left, COMPANY on the Right */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-8 pt-2">
          {/* Left: SOCIALS (GitHub Only) */}
          <div className="space-y-5">
            <span className="block font-mono text-[11px] font-bold tracking-[0.22em] text-white/40 uppercase">
              SOCIALS
            </span>
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com/sushk2904/HydroPulseV1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-white/70 hover:text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,217,255,0.25)] transition-all duration-300 group cursor-pointer"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: COMPANY Links (Home, About us, Services, Contact us) */}
          <div className="space-y-5 text-left md:text-right min-w-[220px]">
            <span className="block font-mono text-[11px] font-bold tracking-[0.22em] text-white/40 uppercase">
              COMPANY
            </span>
            <div className="space-y-3 font-sans text-sm">
              <div>
                <a
                  href="#/"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo(0);
                  }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors inline-block cursor-pointer"
                >
                  Home
                </a>
              </div>
              <div>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo('#about');
                  }}
                  className="text-white/70 hover:text-white font-normal transition-colors inline-block cursor-pointer"
                >
                  About us
                </a>
              </div>
              <div>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo('#services-ticker');
                  }}
                  className="text-white/70 hover:text-white font-normal transition-colors inline-block cursor-pointer"
                >
                  Services
                </a>
              </div>
              <div>
                <a
                  href="mailto:contact@hydropulse.ai"
                  className="text-white/70 hover:text-white font-normal transition-colors inline-block"
                >
                  Contact us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: SERVICES Badge & Continuous Infinite Marquee Ticker */}
        <div id="services-ticker" className="pt-10 md:pt-16 space-y-6">
          {/* Services Badge Pill */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-cyan-300 font-mono text-[11px] tracking-[0.2em] font-bold shadow-[0_0_15px_rgba(0,217,255,0.15)]">
            SERVICES
          </div>

          {/* Marquee / Continuous Infinite Ticker in Dark Mode */}
          <div className="relative overflow-hidden w-full py-4 select-none">
            {/* Edge fade gradients for seamless cinematic blend */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#030708] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#030708] to-transparent z-10 pointer-events-none" />

            <div className="flex gap-8 whitespace-nowrap animate-marquee">
              {/* Duplicate array for seamless infinite looping */}
              {[...services, ...services, ...services].map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-8 group cursor-default"
                >
                  <span
                    className="text-2xl sm:text-3xl md:text-5xl font-normal text-white/25 group-hover:text-cyan-300/80 transition-colors duration-300 tracking-tight"
                    style={{ fontFamily: "'Faculty Glyphic', sans-serif" }}
                  >
                    {item}
                  </span>
                  <span className="text-cyan-400/40 text-lg md:text-2xl font-light">·</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Command Deck Callout & Copyright Footer in Dark Mode */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-white/35">
          <p>© {new Date().getFullYear()} HydroPulse Nowcasting System. All rights reserved.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="#privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-white/70 transition-colors">Terms of Service</a>
            <span>•</span>
            <button
              onClick={onLaunchSimulation || (() => { window.location.hash = '#/simulation'; })}
              className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline cursor-pointer"
            >
              Launch Tactical Sim
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
