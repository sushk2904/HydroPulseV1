---
name: Tactical HUD
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#181c21'
  surface-container: '#1d2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#32353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#bbc9ce'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3036'
  outline: '#859398'
  outline-variant: '#3c494d'
  surface-tint: '#00d9ff'
  primary: '#afecff'
  on-primary: '#003641'
  primary-container: '#00d9ff'
  on-primary-container: '#005b6c'
  inverse-primary: '#00687b'
  secondary: '#b7c4ff'
  on-secondary: '#002681'
  secondary-container: '#023dbf'
  on-secondary-container: '#a8b9ff'
  tertiary: '#ffdeaa'
  on-tertiary: '#422d00'
  tertiary-container: '#ffbb2a'
  on-tertiary-container: '#6e4d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#aeecff'
  primary-fixed-dim: '#00d9ff'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5d'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#ffdea9'
  tertiary-fixed-dim: '#febb29'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4100'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#32353b'
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: 0.08em
  body-lg:
    fontFamily: Metrophobic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  telemetry-mono-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-unit: 4px
  space-2xs: 4px
  space-xs: 8px
  space-sm: 12px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
  space-2xl: 48px
  space-3xl: 64px
  space-4xl: 96px
  gutter-desktop: 24px
  gutter-mobile: 16px
  margin-desktop: 48px
  margin-mobile: 20px
---

# HydroPulse — DESIGN.md

## Product
HydroPulse is a flood-aware emergency routing system for Mumbai. It replaces static
flood maps with an actionable route: given real SWMM-simulated flood physics and a
trained surrogate model, it tells an ambulance, rescue team, or commuter which roads
are still safe during a storm — not just where water currently is.

## Aesthetic Direction
A sci-fi holographic command-center HUD — the genre of cinematic AI-assistant
interfaces (think: an engineer's augmented-reality workbench, not a marketing site).
Cyan/electric-blue wireframe lines on a near-black background. Glassmorphic panels
with thin glowing borders. Monospace or technical-geometric typography for data
labels. Subtle scanline/glow micro-texture. Color is functional, not decorative —
reserved for telemetry states (see palette below). The interface should feel
*engineered*: every visual element should look like it's rendering real data, because
it is.

## Typography
- **Display/headline:** bold, wide letter-spacing, near-uppercase — "Space Grotesk"
- **Data/labels/UI chrome:** technical sans — "Lexend"
- **Body copy:** a clean, highly legible sans — "Metrophobic"

## Color System
- Background: near-black, `#05070A` to `#0A0E14` range
- Primary accent (safe/normal telemetry): electric cyan, `#00D9FF` range
- Secondary accent (depth/layering): soft blue-violet, `#5B7FFF` range
- Alert — moderate flood risk: amber, `#FFB020`
- Alert — severe flood risk: red, `#FF3B3B`
- Grid lines / wireframe: cyan at 8–15% opacity over the dark background
- Glass panels: dark translucent fill (`rgba(10,14,20,0.6)`) with a 1px glowing cyan
  border and soft outer glow

## Page Narrative (scroll-driven, top to bottom)
1. **Hero** — full-viewport. Soft, slowly-drifting cloud/atmosphere backdrop. Product
   name, one-line mission statement, minimal scroll cue. Calm before the storm, quite
   literally.
2. **Descent transition** — as the user scrolls, the cloud layer parts and the camera
   appears to descend; a stylized city skyline silhouette resolves out of the mist.
3. **Grid-skeleton reveal (centerpiece)** — the skyline dissolves into a wireframe
   grid-skeleton 3D city model: buildings as translucent extruded wireframe volumes,
   streets as glowing edge-lines on the ground plane. This is the section judges
   should stop scrolling to look at.
4. **Drainage water visualization** — camera pushes below the street grid; particles
   flow along the underground drainage network. Particle density/speed/color is
   driven by **real per-node `overflow_cms` and `depth_m` values** from an actual
   historical event replay (recommend the 2005 Deluge or 2019 Monsoon run — your
   most dramatic real data, not synthetic filler). This is the single highest-value
   visual in the whole site: it's real science, not decoration, and it should be
   labeled as such on-screen.
5. **Alternating info cards** — glassmorphic cards slide in from alternating
   left/right as the user continues scrolling, each briefly pinned. Content pulled
   from your actual pipeline: the real OSM/DEM data acquisition, the synthetic
   drainage network + SWMM physics, the GNN surrogate model, the routing engine.
   Use real numbers from your manifest/validation reports — not placeholder stats.
6. **Horizontal scroll module** — a dedicated section that briefly hijacks scroll
   direction for a horizontal carousel. Good fit: "How It Works" as a pipeline of
   steps, or a gallery letting the user flip between different historical storm
   replays.
7. **Live demo / CTA** — the actual interactive routing demo: pick a start and end
   point, see the flood-aware route computed live against the trained model. This is
   the payoff — everything before it is setup.

## Animation Stack (build in Antigravity, not Stitch)
- **GSAP + ScrollTrigger** — scroll-linked timeline choreography: section pinning,
  scrubbed camera motion, cross-fades between narrative beats
- **React Three Fiber (Three.js)** — the 3D grid-skeleton scene and drainage
  particle system
- **Framer Motion** (VengeanceUI's components are Framer-Motion-based and drop in
  cleanly here) — 2D micro-interactions: card reveals, button states, HUD text
  flip/fade effects
- Respect `prefers-reduced-motion` — provide a static fallback path

## Content Integrity
Every number, node count, and validation result shown must trace back to a real file
in the pipeline (`manifest.csv`, `validation.json`, simulation output metadata) —
never a placeholder or rounded-for-effect figure. This is a hackathon judged partly
on engineering credibility; the UI should visibly earn that credibility, not just
perform it.

## Explicit Non-Goal
This brief describes a genre — holographic sci-fi command-center HUD — not a
recreation of any specific studio's copyrighted interface assets. Keep all visual
elements original.