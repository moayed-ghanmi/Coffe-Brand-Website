# VOLTA — 3D Coffee Brand E-commerce

An animated, 3D coffee storefront inspired by the dark, neon-accent aesthetic of higgsfield.ai.

**Stack:** React 19 · Vite · three.js via @react-three/fiber + drei · framer-motion

## Features
- **3D hero:** procedural glossy cup with rising steam, orbiting coffee beans and sparkles; reacts to pointer and scroll.
- **3D product cards:** procedurally modelled coffee bags with canvas-drawn labels, all rendered through **one shared WebGL canvas** (drei `<View>`), with hover tilt and spin.
- **Product modal:** drag-to-rotate bag viewer, size/grind options, quantity, and live pricing.
- **Cart:** slide-out drawer, quantity edits, free-shipping progress bar, mock checkout. Persisted in `localStorage`.
- **Animations:** word-reveal headline, marquees, roast-filter pills with a shared layout, scroll-linked process section, staggered reveals and a scroll progress bar.
- Responsive layout that respects `prefers-reduced-motion`.

## Run
```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

> Demo storefront: checkout is simulated and no payments are processed.
