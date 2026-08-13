# Codebase Design & Deep Module Architecture: Cosmic Canvas

## 1. Architectural Seams & Depth Assessment

### Current Core: `CosmicEngine` (High Depth)
- **Small Interface**:
  - `updateParams({ mode, mass, spin, lensing, tilt })`
  - `launchPhoton(screenPos)`
  - `spawnStar()`
  - `setScale(scaleName)`
  - `toggleAudio()` / `toggleGyroscope()` / `toggleInfallView()` / `togglePilotMode()`
- **Deep Implementation Hidden Behind Interface**:
  - 40,000-particle Keplerian relativistic accretion disk & line-of-sight Doppler beaming.
  - General Relativistic geodesic integration for continuous photon curvature & event horizon capture.
  - Spherical wormhole refraction GLSL shaders with procedural starfield and Einstein Ring.
  - Web Audio oscillator frequency modulation for gravitational redshift & 3D stereo panning.
  - Two-viewport scissor rendering engine for simultaneous distant vs infalling astronaut perspectives.
  - Keyboard thruster orbital spaceflight with velocity aberration optical tunnel expansion.

---

## 2. Deepening Opportunities (Clean Seam Separation)

### Seam A: Spacetime Geodesic Physics Worker / Module (`src/physics/geodesics.js`)
- **Interface**: `integrateRay(startPos, velocity, mass, lensing, dt, maxSteps) -> Array<Vector3>`
- **Depth**: Encapsulates 4th-order Runge-Kutta / Euler relativistic geodesic integration away from rendering meshes.

### Seam B: Acoustic Spacetime Synthesizer (`src/audio/spacetime-synth.js`)
- **Interface**: `setMetrics({ mass, spin, distance, mode, azimuth })`
- **Depth**: Hides Web Audio graph construction, oscillator ramps, and binaural stereo panning.

### Seam C: Telemetry & Observer Clocks (`src/physics/proper-time.js`)
- **Interface**: `computeProperTime(delta, mass, radius) -> { tau, dilationRatio }`
- **Depth**: Pure numerical Schwarzschild coordinate time integration without side effects.

---

## 3. Leverage & Locality Scorecard

| Module | Interface Surface Area | Implementation Complexity | Leverage Score |
| :--- | :--- | :--- | :--- |
| **CosmicEngine** | 8 methods | Shaders, WebGL Scissor, OrbitControls, Audio | 🟢 **Very Deep** |
| **AI Planetarium Narrator** | 2 methods (`speak`, `cancel`) | Web Speech API, step sequencer, UI synchronization | 🟢 **Deep** |
| **Flight Simulator** | `togglePilotMode()`, keys | Velocity aberration, gravity vector, FOV warp | 🟢 **Deep** |
