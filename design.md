# NMTHub — Design System

## Inspiration
Dark modern SaaS/edu site: near-black background, vibrant purple/cyan 3D floating elements, asymmetric layout, bold typography, glassmorphism cards.

## Colors
```css
--bg-primary: #07070d
--bg-secondary: #0f0f1a
--bg-card: rgba(255,255,255,0.04)
--accent-purple: #7c3aed
--accent-cyan: #06b6d4
--accent-pink: #ec4899
--accent-green: #10b981
--text-primary: #ffffff
--text-secondary: #a0a0b8
--border: rgba(255,255,255,0.08)
--glow-purple: rgba(124,58,237,0.3)
--glow-cyan: rgba(6,182,212,0.3)
```

## Typography
- **Display/Headings:** `Syne` (Google Fonts) — bold, geometric
- **Body:** `Inter` — clean, readable
- **Accent/Labels:** uppercase letter-spacing

## Layout
- Max width: 1280px, centered
- Asymmetric grid sections — alternate image-left/text-right
- Generous padding: 80px–120px vertical sections
- Overlapping elements, negative margins for depth

## Components
- **Cards:** glassmorphism — `backdrop-blur`, `bg-white/4`, `border border-white/8`, subtle glow on hover
- **Buttons:** primary = gradient purple→cyan with glow shadow; secondary = outlined
- **Stats:** large numbers with gradient text
- **Subject cards:** colored icon + glow ring on hover
- **Badges:** pill shape, semi-transparent colored bg

## Motion
- Staggered fade-up on scroll (CSS @keyframes + IntersectionObserver)
- Floating animation on hero elements
- Counter animation on stats when in view
- Gradient orbs in background (blurred, animated)

## Background
- Deep near-black base
- 2–3 large blurred gradient orbs (purple, cyan, pink) — absolute positioned
- Subtle grid/dot pattern overlay at low opacity

## Sections
1. Hero — headline + CTA + floating subject cards
2. Subjects/Courses — 8 subject cards grid
3. Stats — animated numbers
4. Teachers — team cards
5. Practice Tests — preview cards
6. Testimonials — quote carousel
7. Pricing — 3 tiers
8. Contact — form + info
