# Task Plan: Cosmic Canvas Development Roadmap

## Project Vision
A web-native, interactive 3D astrophysics visualization engine built using Three.js WebGL and modern Glassmorphism UI.

## Current Milestone: Accretion Disk Physics Precision

### Tasks & Checklist

- [x] **Task 1: Basic WebGL Engine & Glassmorphism Overlay**
  - Setup Vite + Three.js + index.html + style.css.
  - Render Event Horizon sphere & 40,000 particle accretion disk.

- [x] **Task 2: Interactive Camera Controls**
  - Integrate Three.js `OrbitControls` for drag rotation & scroll zoom.

- [x] **Task 3: Keplerian Orbital Velocity ($v \propto r^{-1/2}$)**
  - Update `cosmic-engine.js` particle update loop with radius-dependent orbital speeds.
  - Tie speeds to `spin` and `mass` parameter sliders.

- [ ] **Task 4: FPS & Performance Monitoring**
  - Add real-time FPS counter logic in header.

- [ ] **Task 5: Doppler Shift Shader & Gravitational Relativistic Redshift**
  - Enhance photon sphere and accretion disk shaders for spectral shift visualization.
