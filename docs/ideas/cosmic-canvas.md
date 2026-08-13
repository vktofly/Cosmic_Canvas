# Idea One-Pager: Cosmic Canvas

## Problem Statement
How might we transform complex astrophysics theories and cosmic data into interactive, motion-heavy browser visualizers so educators, students, and truth-seekers can intuitively grasp cosmic phenomena without complex desktop software?

## Recommended Direction
A high-performance WebGL & Canvas single-page web app focusing initially on **Black Hole Accretion & Relativistic Gravitational Lensing**. The app provides interactive real-time controls (mass, spin, photon bending) accompanied by cinematic motion design controls.

## Key Assumptions to Validate
- [ ] WebGL performance holds 60 FPS on standard integrated GPUs during heavy particle/ray calculations
- [ ] Users want interactive sliders over passive video animations
- [ ] Simulated physical models provide enough accuracy while remaining web-performant

## MVP Scope
- **In**: Black Hole Ray-marching / Accretion Disk shader canvas, interactive camera controls, parameter sliders (Mass, Spin, Tilt), dark glassmorphism control drawer.
- **Out**: Multi-body gravitational N-body solar system simulators, user login/accounts, backend database.

## Not Doing (and Why)
- **Native Desktop App / Hardware Acceleration Setup**: Keeps barrier to entry zero (web-native).
- **Complex N-Body Gravity Engine**: High CPU overhead in browser; Ray-marching 1 black hole provides higher visual WOW factor for MVP.
