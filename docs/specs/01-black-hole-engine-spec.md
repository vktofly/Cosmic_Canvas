# Feature Spec: Cosmic Canvas 3D Black Hole Engine

## Problem Statement
Astrophysics students, educators, and science communicators lack browser-native, interactive 3D simulations that physically model Kerr/Schwarzschild black hole phenomena like Doppler beaming and gravitational lensing without requiring heavy desktop installations.

## Solution
A web-based interactive 3D motion graphics application featuring a Three.js WebGL particle engine for accretion disk physics, interactive OrbitControls, dynamic Doppler shift rendering, and a glassmorphism control panel.

## User Stories
1. As a science student, I want to rotate the camera around the Black Hole via mouse drag, so that I can inspect the Event Horizon from any 3D angle.
2. As an astrophysics educator, I want to adjust black hole mass and accretion disk spin via interactive sliders, so that I can demonstrate relativistic orbital velocity changes in real-time.
3. As a web user, I want to view real-time FPS performance counters, so that I can verify rendering smoothness on my hardware.
4. As a researcher, I want to observe relativistic Doppler shift color gradients, so that I can visually understand blue-shifting of approaching gas particles.

## Implementation Decisions
- **WebGL Engine**: Encapsulate Three.js scene, camera, particle attributes, and animation loop within a `CosmicEngine` class.
- **Physics Formulas**: Compute Keplerian orbital angular velocity $\omega(r) \propto \sqrt{M} \cdot \text{spin} \cdot r^{-1.5}$ and line-of-sight velocity Doppler shifts per particle frame.
- **UI Overlay**: Build responsive dark space glassmorphism controls with CSS `backdrop-filter`.

## Testing Decisions
- Test external rendering behavior (FPS stability, canvas event dispatching, parameter slider bindings).
- Target modules: `cosmic-engine.js`, `main.js`, `style.css`.
- Prior art: `npx vite build` compilation checks.

## Out of Scope
- Multi-body N-body solar system gravitational collapse simulations.
- User accounts / backend database storage.

## Further Notes
App is hosted static and deployed to GitHub repository `vktofly/Cosmic_Canvas`.
