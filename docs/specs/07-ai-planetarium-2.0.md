# PRD 07: AI-Powered Spacetime Planetarium 2.0 (Bidirectional Voice Q&A & Curated Learning Tours)

**Status**: Approved & In Implementation  
**Category**: Educational UX & Multimodal Spacetime Narration  
**Target Milestone**: v1.1.0  
**PRD Author**: Antigravity Assistant

---

## 1. Objective & Vision
Transform Cosmic Canvas from an interactive simulation studio into an autonomous, voice-interactive educational planetarium. Users can converse in natural spoken language with the simulator to inspect black hole horizons, ask astrophysics questions, and follow structured academic tours.

---

## 2. Core Functional Requirements

### 2.1 Web Speech Recognition (Speech-to-Intent Engine)
- Use browser-native `webkitSpeechRecognition` / `SpeechRecognition` API.
- Support key intent matching:
  - *"Show me Gargantua"* $\to$ switches to extreme spin Gargantua preset.
  - *"What is Doppler beaming?"* $\to$ narrates explanation and highlights relativistic accretion disk.
  - *"Spawn a star"* $\to$ triggers tidal disruption spaghettification.
  - *"Fly the ship"* $\to$ activates WASD relativistic flight simulator.
  - *"Add a black hole"* $\to$ spawns a secondary orbiting singularity in the sandbox.

### 2.2 Curated Spacetime Chapter Tours
- **Chapter 1: The Anatomy of a Black Hole** (Schwarzschild radius, photon sphere, accretion disc).
- **Chapter 2: General Relativity in Action** (Gravitational lensing, Einstein Ring, time dilation).
- **Chapter 3: Gravitational Waves & Binary Inspiral** (LIGO detection, spacetime strain ripples).
- **Chapter 4: The Scale of the Cosmos** (From 20 km Neutron Stars to 390B km TON 618).

### 2.3 Visual Focal Highlighting & UI Indicators
- Add a glowing microphone icon in the header toolbar indicating listening/speaking state.
- Dynamic transcription subtitle banner at the bottom of the screen.

---

## 3. Technical Architecture & Non-Functional Requirements
- **Zero Latency**: Local heuristic regex & NLP intent parser executing in $<10\text{ms}$ without external API round-trips.
- **Graceful Fallback**: If microphone permission is denied or Web Speech API is unsupported, text prompt input is available.
- **Audio Ducking**: Automatically lower background cosmic drone synthesizer volume by 70% during active speech synthesis.
