# Product Specification: Cosmic Canvas 3D Engine

## Summary
Cosmic Canvas is a web-native 3D physics visualization engine designed to render Black Hole astrophysics phenomena (Event Horizon, Photon Sphere, Relativistic Accretion Disk, Gravitational Lensing, and Ray-Traced Photon Geodesics) in real-time within standard web browsers.

## Goals
- Deliver 60 FPS WebGL rendering without desktop app installation.
- Provide interactive controls for physical parameters (Mass, Spin, Tilt, Lensing).
- Enable interactive photon launching to visualize light deflection around warped spacetime.

## Non-Goals
- Multi-body N-body gravitational celestial orbit simulations.
- User authentication or database storage.

## Behavior

1. **Initial Page Load**:
   - The web app initializes a Three.js WebGL canvas occupying 100% viewport width and height.
   - Default camera positions at `(0, 4, 12)` pointing at coordinate origin `(0, 0, 0)`.
   - Renders a 1.5-unit black Event Horizon sphere, 1.85-unit glowing Photon Sphere, and 40,000-particle Accretion Disk ranging from inner radius 2.2 to outer radius 7.0.

2. **3D Orbit Controls**:
   - Left-click dragging anywhere on the canvas rotates camera 360 degrees around the black hole.
   - Mouse wheel scrolling zooms camera in/out with hard bounds `[3.0, 30.0]`.
   - Camera movement features smooth momentum damping with `dampingFactor: 0.05`.

3. **Simulation Parameter Adjustments**:
   - **Mass Slider (0.5 – 3.0 M☉)**: Dynamically rescales Event Horizon and Photon Sphere geometry sizes and scales particle Keplerian speeds $\omega \propto \sqrt{M}$.
   - **Spin Slider (0.0 – 3.0x)**: Mutates global accretion disk rotation rate.
   - **Lensing Slider (0.0 – 2.5)**: Updates ShaderMaterial uniform `uLensing` on the Photon Sphere halo.
   - **Tilt Slider (0° – 90°)**: Mutates Accretion Disk $X$-axis rotation angle.

4. **Interactive Photon Ray Launcher**:
   - Clicking **Fire Photon** spawns a new amber photon beam at `(-10, y_offset, 8)`.
   - The photon trajectory updates every frame based on relativistic gravitational acceleration $a = (2.5 \cdot M \cdot \text{lensing}) / r^3$ towards the origin.
   - Photons trapped inside $r < 1.5 M$ terminate.
   - Old photon rays fade out opacity smoothly over 4 seconds and dispose of WebGL geometry/material memory cleanly.

5. **Performance Monitoring**:
   - Header badge displays real-time FPS calculated every 500ms.

6. **Presets**:
   - **Reset View**: Restores all sliders to `1.0` defaults and tilt to `25°`.
   - **Supermassive**: Sets Mass to `2.8 M☉`, Spin to `2.5x`, Lensing to `2.2`, and Tilt to `45°`.
