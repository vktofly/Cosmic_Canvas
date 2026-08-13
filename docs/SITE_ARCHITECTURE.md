# Cosmic Canvas: Multi-Page Architecture & Information Architecture Plan

Based on the **Vercel Web Interface Guidelines** and **`docs/POSITIONING_V2.md`**, here is the 4-page architecture to transform Cosmic Canvas from a single-screen engine into a comprehensive, world-class astrophysics platform.

---

## 1. Site Map & Multi-Page Structure

```
Cosmic Canvas
├── / (Home / Interactive 3D Studio)          → Real-time Kerr simulation, Flight simulator, AI Tour
├── /gallery.html (Spacetime Gallery)         → Curated captures, presets, & community 60 FPS simulations
├── /learn.html (Interactive Academy)         → 4 visual chapters explaining General Relativity & Math
└── /about.html (Astrophysics & Engine Docs)  → Mathematical derivations, Schwarzschild metrics, WebGL tech
```

---

## 2. Page Purpose & Key Specs

### Page 1: `/` — **Interactive 3D Studio** *(Current Production App)*
- **Job**: Zero-barrier hands-on interactive playground with cockpit pilot mode, voice Q&A, and scale ladder.
- **Key CTA**: Launch Simulator, Record 5s Video, Start AI Tour.

### Page 2: `/learn.html` — **The Interactive Astrophysics Academy**
- **Job**: Structured, visual educational chapters designed for university students, educators, and curious minds.
- **Key Features**:
  - Interactive interactive widget cards embedding the live Three.js engine for specific principles (e.g. *Metric Tensors*, *Gravitational Lensing Equations*, *Tidal Roche Limits*).
  - Step-by-step interactive quizzes with immediate visual feedback on the black hole.

### Page 3: `/gallery.html` — **Spacetime Video & Presets Showcase**
- **Job**: High-converting gallery of astronomical phenomena.
- **Key Features**:
  - One-click launchable presets: *Gargantua*, *Cygnus X-1*, *Sagittarius A\**, *M87\**, *Binary Coalescence GW150914*.
  - Instant 60 FPS video downloads with customizable export resolutions.

### Page 4: `/about.html` — **Science & Engineering Whitepaper**
- **Job**: Academic credibility, documentation, and open-source engine architecture.
- **Key Features**:
  - Mathematical derivations of Kerr metric approximations, geodesic Raymarching, Doppler beaming ratios ($D^4$), and acoustic redshift formulas.
  - Architecture blueprint explaining WebGL shader pipeline, zero-GC vector pools, and Web Audio synthesis graphs.

---

## 3. Persistent Global Navigation Header
A unified glassmorphic header across all pages:
- **`🌌 Cosmic Canvas`** (Brand Home)
- **`🚀 Studio`** (`/`)
- **`📚 Academy`** (`/learn.html`)
- **`🎬 Gallery`** (`/gallery.html`)
- **`📐 Science & Docs`** (`/about.html`)
