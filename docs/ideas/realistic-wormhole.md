# Idea Refinement: Photorealistic Einstein-Rosen Wormhole Engine

## Problem Statement
How might we render an authentic, physically accurate Einstein-Rosen Wormhole in WebGL where the throat acts as a spherical gravitational lens through which an entire alternate starfield galaxy is visibly refracted?

---

## Why Current Wormhole Looks Unrealistic
- **Current implementation**: A simple 3D cylinder mesh with generic color gradients.
- **Physical Reality (General Relativity)**:
  1. A 3D wormhole throat is a **sphere** in 3D space (not an open funnel), acting as an ultra-strong gravitational lens.
  2. Looking at the wormhole sphere shows the **celestial starfield of the other universe** inverted and magnified on the sphere's surface.
  3. The rim exhibits intense **Einstein Ring gravitational distortion** bending light around the throat perimeter.

---

## 3 Architectural Directions to Elevate Realism

### Direction A: Dual-Universe Cubemap Skybox Refraction Shader (Recommended)
- **What**: Render a second alternate galaxy skybox texture inside a custom GLSL fragment shader on the Wormhole sphere.
- **Visual Result**: Looking at the sphere directly shows a different galaxy (e.g. Andromeda/Nebula) through the lens with spherical gravitational distortion.
- **Feasibility**: High (60 FPS on standard GPUs).

### Direction B: Kerr-Throat Spacetime Ray-Marching Volumetric Shader
- **What**: Ray-march each pixel through Ellis-Bronnikov / Morris-Thorne metric equations.
- **Visual Result**: Maximum theoretical accuracy with dual throat warping.
- **Risk**: Heavy GPU load on mobile devices.

### Direction C: Translucent Gravitational Lens Ripple Shell
- **What**: Multi-layered Fresnel glassmorphic sphere with interior particle vortex stream.
- **Visual Result**: High cinematic wow-factor with instant load time.

---

## Recommended Direction & MVP Scope
**Implement Direction A (Dual-Universe Refracted Skybox Shader)**:
1. Procedurally generate a secondary "Alternate Universe" cosmic nebula in WebGL.
2. Apply a spherical refraction GLSL shader with Fresnel Einstein Ring glow on the wormhole perimeter.
3. Allow firing photons straight *through* the spherical throat to traverse between universes.
