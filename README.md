# VOLTA — 3D Coffee Brand E-commerce

An animated, 3D coffee storefront inspired by the dark, neon-accent aesthetic of higgsfield.ai.

**Stack:** React 19 · Vite · three.js via @react-three/fiber + drei · framer-motion

## Features
- **3D hero:** procedural glossy cup with rising steam, orbiting coffee beans and sparkles; reacts to pointer and scroll.
- **3D product cards:** procedurally modelled coffee bags with canvas-drawn labels, all rendered through **one shared WebGL canvas** (drei `<View>`), with hover tilt and spin.
- **Product modal:** drag-to-rotate bag viewer, size/grind options, quantity, and live pricing.
- **Cart:** slide-out drawer, quantity edits, free-shipping progress bar. Persisted in `localStorage`.
- **Checkout (`#/checkout`):** 3-step flow (details → delivery → payment) with validation, delivery options, promo codes, an animated flipping card preview (card number check-digit validation), or cash on delivery. Leads to an order confirmation page with tracking (`#/order/:id`).
- **Admin portal (`#/admin`):** dashboard (revenue, orders, AOV, 14-day revenue chart, status breakdown, top products, low stock), orders (search, filter, status updates, detail drawer with timeline), products (edit price/stock, hide/show, add, delete), customers, and promo codes. Opens directly (no login) in this demo.
- **Animations:** word-reveal headline, marquees, roast-filter pills with a shared layout, scroll-linked process section, staggered reveals and a scroll progress bar.
- Responsive layout that respects `prefers-reduced-motion`.

## Run
```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

> Demo storefront: payments are simulated and no real charges are made. There is no backend yet. Products, orders and promo codes live in the browser's `localStorage` (`src/store.jsx`), seeded with sample orders. The admin portal has **no authentication** in this demo. Before going live, move the store actions to an API, protect `#/admin` with server-side authentication, and add a real payment provider (e.g. Stripe).
