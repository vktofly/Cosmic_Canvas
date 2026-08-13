# Technology Stack Blueprint: Cosmic Canvas

## Project Metadata
- **Project Name**: Cosmic Canvas
- **Type**: Web-Native 3D Astrophysics & Motion Engine
- **Repository**: [vktofly/Cosmic_Canvas](https://github.com/vktofly/Cosmic_Canvas)

## 1. Core Stack & Dependencies

### Runtime & Core Framework
- **Runtime**: Web Browser (ESNext / ESM module system)
- **Language**: JavaScript (ES2023+ modern syntax)
- **Styling**: Vanilla CSS3 (Custom Glassmorphism design system)

### Production Dependencies (`package.json`)
- **`three`** (`^0.174.0`): WebGL 3D rendering library (Event Horizon geometry, ShaderMaterial, BufferGeometry particle engine, OrbitControls).

### Dev Tooling
- **`vite`** (`^6.2.1`): High-performance web development server & Rollup bundler.

## 2. Architecture & File Blueprint

```
/
├── index.html          # Application shell, glassmorphic UI overlay, DOM controls
├── style.css           # CSS design system (variables, glassmorphism, sliders, layout)
├── main.js             # Application entry point & DOM event wiring
├── cosmic-engine.js    # Three.js WebGL Engine (Scene, Shaders, Particles, OrbitControls)
├── CONTEXT.md          # Domain model & glossary
├── .planning/          # PWF task tracking (task_plan.md)
└── docs/               # Product idea specs & documentation
```

## 3. Key Implementation Patterns

### Three.js WebGL Engine Pattern (`cosmic-engine.js`)
- **Keplerian Orbital Angular Velocity**: $\omega(r) = 1.8 \cdot \sqrt{M} \cdot \text{spin} \cdot r^{-1.5}$
- **Dynamic Doppler Shift**: Calculates line-of-sight velocity ($v_x = -p_z \cdot \omega$) to mutate particle HSL colors & lightness dynamically per frame.
- **Controls**: `OrbitControls` with soft damping (`0.05`).

### Glassmorphism Design Tokens (`style.css`)
- `--panel-bg`: `rgba(15, 23, 42, 0.65)`
- `--panel-border`: `rgba(255, 255, 255, 0.12)`
- `--accent-cyan`: `#38bdf8`
- `--accent-amber`: `#fbbf24`

## 4. Build & Deployment Commands

```bash
# Start local dev server (port 3000)
npx vite --port 3000

# Production build
npx vite build
```
