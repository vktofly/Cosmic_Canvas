# PRD 08: Multi-Page Interactive Feature Expansion & Pro Experience

**Status**: Proposed  
**Category**: Multi-Page Immersion & Interactivity  
**Target Milestone**: v1.1.0  
**Author**: Product Management Trio

---

## 1. Page-by-Page Feature Recommendations

### 🌌 1. Studio Page (`/` — `index.html`)
- **Feature**: **Interactive Camera Bookmarks & Cinematic Fly-Arounds**
  - Add 4 preset camera hotkeys (1: Isometric Orbit, 2: Polar Jet View, 3: Horizon Equator, 4: Free Flight).
- **Feature**: **Audio-Reactive Accretion Disk Flares**
  - Accretion particles pulse in luminosity with the Web Audio bass drone harmonics.

### 📚 2. Academy Page (`/learn.html`)
- **Feature**: **Interactive Gravitational Lensing Sandbox Widget**
  - Drag-and-drop mass slider embedded directly inside Chapter 2 to see an Einstein ring refract on a micro-canvas.
- **Feature**: **Chapter Progress Tracker & Completion Badges**
  - LocalStorage-backed progress bar tracking completed chapters and quizzes with a downloadable certificate badge.

### 🎬 3. Gallery Page (`/gallery.html`)
- **Feature**: **Preset Comparison Slider (Side-by-Side Dual Black Hole View)**
  - Compare two different black holes (e.g. *Cygnus X-1* vs *TON 618*) side-by-side on screen.
- **Feature**: **One-Click Video Clip Trimmer & Resolution Selector**
  - Choose between 1080p WebM, 720p 60 FPS, or animated GIF export.

### 🔭 4. Astronomical Directory Page (`/explore.html`)
- **Feature**: **Constellation & Distance Sky Map Filter**
  - Filter black holes by distance from Earth (e.g. Milky Way, Virgo Cluster, Deep Cosmos).
- **Feature**: **Observational Discovery Timeline**
  - Interactive chronological slider showing black hole discoveries from Cygnus X-1 (1964) to EHT M87* (2019).

### 📐 5. Science Docs Page (`/about.html`)
- **Feature**: **Interactive Kerr Metric Equation Calculator**
  - Input custom $M$ and $a^*$ to calculate exact $R_s$, $R_{\text{photon}}$, and $R_{\text{ergo}}(\theta)$ in real time.
- **Feature**: **WebGL Shader Code Inspector**
  - Interactive tabbed code block displaying the live GLSL vertex and fragment shader source.

---

## 2. Prioritized Implementation Recommendation
1. **Interactive Kerr Metric Calculator on `/about.html`**: Zero-latency mathematical tool.
2. **Preset Comparison Slider on `/gallery.html`**: Instant visual differentiation.
3. **Observational Discovery Timeline on `/explore.html`**: Historical narrative.
