# PRD 02: Cinematic Motion Recording & Export System

## Overview
Enable educators, science communicators, and users to record 5-second cinematic 360-degree camera orbits of the Black Hole simulation and export as WebM/MP4 video clips or animated GIFs.

## Status
- Completion: 100%

## Requirements
- [x] Add `MediaRecorder` canvas stream capture module in `main.js` / `cosmic-engine.js`.
- [x] Add "Record Orbit" action button to the glassmorphism controls drawer.
- [x] Implement auto 360-degree camera spin during recording duration (5 seconds).
- [x] Provide instant download prompt for the exported video file.

## Success Criteria
- One click generates and downloads a smooth 60 FPS video clip of the orbiting black hole.
- No impact on rendering frame rate during capture.
