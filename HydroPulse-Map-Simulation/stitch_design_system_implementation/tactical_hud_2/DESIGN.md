---
name: Tactical HUD
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0a0f13'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#bbc9ce'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
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
  tertiary: '#ffdeb2'
  on-tertiary: '#442b00'
  tertiary-container: '#ffba4d'
  on-tertiary-container: '#724b00'
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
  tertiary-fixed: '#ffddb1'
  tertiary-fixed-dim: '#ffba4b'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
  telemetry-safe: '#00d9ff'
  telemetry-depth: '#5b7fff'
  telemetry-warn: '#ffb020'
  telemetry-alert: '#ff3b3b'
  glass-surface-bg: rgba(10, 14, 20, 0.6)
  glass-border-base: rgba(0, 217, 255, 0.18)
  glass-border-hover: rgba(0, 217, 255, 0.35)
  glass-glow-base: rgba(0, 217, 255, 0.12)
  glass-glow-hover: rgba(0, 217, 255, 0.25)
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: 0.08em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.06em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0.05em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Metrophobic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Metrophobic
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  telemetry-mono-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
  telemetry-mono-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.04em
  telemetry-mono-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
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

## Brand & Style

The design system embodies a high-precision, tactical command-and-control visual language tailored for mission-critical environmental intelligence, real-time spatial analysis, and emergency routing. The visual identity fuses sci-fi augmented-reality interfaces with engineered data fidelity: ultra-deep atmospheric blacks, illuminated cyan telemetry vectors, and translucent spatial surfaces.

The interface prioritizes operational clarity and structural rigor. Rather than generic corporate minimalism, the design embraces an engineered tactical aesthetic featuring:
- High-contrast monochromatic foundations punctured by selective, meaningful telemetry colors.
- Multi-layered depth using frosted glass refraction and luminescent perimeter highlights.
- Dense information layout with technical monospace data styling alongside clean geometric display typography.
- Real-time reactivity through controlled luminous glows and responsive borders that visually communicate system readiness.

## Colors

The palette operates exclusively within a calibrated dark-mode spectrum. Light is treated as emitted energy rather than ambient illumination.

- **Primary (`#00d9ff`)**: The central safe/active status hue, used for active routes, normal sensor nodes, tactical accents, and luminous borders.
- **Secondary (`#5b7fff`)**: Spatial depth vector and secondary network layers.
- **Tertiary / Warning (`#ffb020`)**: Amber telemetry indicating threshold breaches and moderate hazards.
- **Alert (`#ff3b3b`)**: High-severity alerts, emergency road blockages, and critical drainage overflows.
- **Neutral Surface Hierarchy**: Anchored on deep slate-black tones (`#101419` down to `#0b0e13`) providing absolute backdrop separation for glowing vector components.

## Typography

Typography delivers structural telemetry across three specialized type families:

1. **Headlines (`Space Grotesk`)**: Technical display face set with generous letter-spacing and strong geometric silhouettes for command-tier information hierarchy.
2. **Body Copy (`Metrophobic`)**: Clean, low-friction humanist sans-serif optimized for long-form contextual readouts and physical descriptions against deep dark surfaces.
3. **Telemetry & Chrome (`Lexend`)**: Precision-engineered labels, coordinate readouts, statistics, and sensor indicators ensuring fast numeric recognition without ambiguity.

## Layout & Spacing

Layouts are constructed upon a modular 4px base increment within an adaptable 12-column tactical grid. 

- **Desktop (1024px+)**: 12 columns with 24px gutters and 48px outer margins. Supports persistent floating HUD chrome and multi-panel telemetry sidebars.
- **Tablet (768px - 1023px)**: 8 columns with 20px gutters and 32px outer margins. Chrome panels collapse to contextual bottom and top pinned docking bars.
- **Mobile (< 768px)**: 4 columns with 16px gutters and 20px margins. Telemetry displays condense into single-column vertical flows with stacked status indicators.

## Elevation & Depth

Visual hierarchy uses optical layering and luminous emissive signals rather than traditional physical drop shadows:

1. **Base Layer (Ground Zero)**: Pure deep dark surfaces (`#05070a` – `#101419`) punctuated by low-opacity wireframe lines (8–15% opacity cyan).
2. **Standard Surface Tier**: Layered container steps (`surface-container-low` through `surface-container-highest`) utilizing tonal stepping for base cards and controls.
3. **Glass Panel Surface (Optical Chrome)**: 
   - Optical recipe: Dark translucent fill `rgba(10, 14, 20, 0.6)` combined with `backdrop-filter: blur(16px)`.
   - Perimeter definition: 1px continuous solid border in `rgba(0, 217, 255, 0.18)`.
   - Ambient emission: Soft outward atmospheric glow (`0 0 15px rgba(0, 217, 255, 0.12)`).
   - Interactive hover state: Border shifts to `rgba(0, 217, 255, 0.35)` with radiant glow expansion (`0 0 20px rgba(0, 217, 255, 0.25)`).
4. **Primary Interaction Nodes (Solid Radiance)**: Solid opaque surfaces reserving direct, non-refractive contrast for immediate, decisive tactical triggers.

## Shapes

The geometric framework enforces clean, clipped radii across all interface modules. 

- Standard panels, interactive glass containers, input fields, and standard buttons utilize an 8px radius (`roundedness: 2`, `0.5rem`).
- Badges, status chips, and specialized micro-tags leverage compact 4px radii or full pill geometries where designated to indicate atomic states.
- Structural HUD modules maintain continuous corner continuity with zero irregular asymmetric bevels.

## Components

### Glass Panel
A dedicated, reusable architectural surface designed for floating situational chrome, global navigation bars, status badges, telemetry strips, and context overlays.
- **Usage Restrictions**: Exclusively applied to informational frames, HUD readouts, and floating navigation. Never used for primary call-to-action buttons.
- **Styling**:
  - Background: `rgba(10, 14, 20, 0.6)`
  - Filter: `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);`
  - Border: `1px solid rgba(0, 217, 255, 0.18)`
  - Box Shadow: `0 0 15px rgba(0, 217, 255, 0.12)`
  - Corner Radius: `8px` (`0.5rem`)
- **Interactive State**: When functioning as a clickable HUD dock or interactive filter container:
  - Hover: Border elevates to `rgba(0, 217, 255, 0.35)` and glow intensifies to `0 0 20px rgba(0, 217, 255, 0.25)`.
  - Active: Scale micro-shift (`0.99`) with border illumination at `rgba(0, 217, 255, 0.5)`.

### Buttons
- **Primary CTA**: Solid cyan surface (`#00d9ff`) with contrasting dark text (`#003641`), 8px border radius, high-contrast presence without backdrop blur.
- **Secondary CTA**: Translucent cyan container (`rgba(0, 217, 255, 0.12)`) with bright cyan label text and 1px border (`#00d9ff`).
- **Inverted**: Solid light slate (`#e0e2ea`) with dark slate-black label text (`#101419`) for high-priority operational interrupts.
- **Outlined**: Transparent fill, 1px low-contrast outline (`#859398`), standard neutral hover illumination.

### Chips & Telemetry Badges
- Compact inline badges constructed using mini Glass Panel styling or solid 4px corner tokens with mono-spaced numeric data (`Lexend`).
- Status indicator dots: 6px circular nodes styled with animated pulsing cyan (normal), amber (warning), or red (critical).

### Input Fields
- Dark structural base (`#0b0e13`), 1px outline (`#3c494d`), 8px radius, transitioning to a glowing cyan border (`0 0 8px rgba(0, 217, 255, 0.4)`) on focus.

### Cards & Modular Panels
- Standard informational cards utilize opaque surface tiers (`surface-container`).
- Prominent telemetry cards, pinned narrative modules, and map-overlay inspectors implement the Glass Panel component style to preserve spatial immersion over active visual graphics.