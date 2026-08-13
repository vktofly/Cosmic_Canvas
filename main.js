import { CosmicEngine } from './cosmic-engine.js';

document.addEventListener('DOMContentLoaded', () => {
  const engine = new CosmicEngine('canvas-container');

  // UI Elements
  const massSlider = document.getElementById('mass-slider');
  const spinSlider = document.getElementById('spin-slider');
  const lensingSlider = document.getElementById('lensing-slider');
  const tiltSlider = document.getElementById('tilt-slider');

  const massVal = document.getElementById('mass-val');
  const spinVal = document.getElementById('spin-val');
  const lensingVal = document.getElementById('lensing-val');
  const tiltVal = document.getElementById('tilt-val');

  const btnReset = document.getElementById('btn-reset');
  const btnSupermassive = document.getElementById('btn-supermassive');

  const modeSelect = document.getElementById('mode-select');
  const infoTitle = document.getElementById('info-title');
  const infoDesc = document.getElementById('info-desc');

  const clockInfinity = document.getElementById('clock-infinity');
  const clockProbe = document.getElementById('clock-probe');
  const dilationFactor = document.getElementById('dilation-factor');

  // Parse Deep-Link URL Search Parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialParams = {};
  if (urlParams.has('mass')) {
    const m = parseFloat(urlParams.get('mass'));
    initialParams.mass = m;
    massSlider.value = m;
    massVal.textContent = m.toFixed(1);
  }
  if (urlParams.has('spin')) {
    const s = parseFloat(urlParams.get('spin'));
    initialParams.spin = s;
    spinSlider.value = s;
    spinVal.textContent = s.toFixed(1);
  }
  if (urlParams.has('tilt')) {
    const t = parseInt(urlParams.get('tilt'), 10);
    initialParams.tilt = t;
    tiltSlider.value = t;
    tiltVal.textContent = t;
  }
  if (urlParams.has('lensing')) {
    const l = parseFloat(urlParams.get('lensing'));
    initialParams.lensing = l;
    lensingSlider.value = l;
    lensingVal.textContent = l.toFixed(1);
  }
  if (urlParams.has('mode')) {
    const mode = urlParams.get('mode');
    if (mode === 'wormhole' || mode === 'binary' || mode === 'multibody') {
      initialParams.mode = mode;
      if (modeSelect) modeSelect.value = mode;
    } else if (mode === 'ton618') {
      const scaleSelectEl = document.getElementById('scale-select');
      if (scaleSelectEl) scaleSelectEl.value = 'ton618';
      engine.setScale('ton618');
    }
  }
  if (Object.keys(initialParams).length > 0) {
    engine.updateParams(initialParams);
  }

  engine.onFpsUpdate = (fps) => {
    if (fpsCounter) {
      fpsCounter.textContent = `${fps} FPS`;
    }
  };

  engine.onTimeDilationUpdate = ({ coordinateTime, probeTime, dilationRatio }) => {
    if (clockInfinity) clockInfinity.textContent = `${coordinateTime.toFixed(1)}s`;
    if (clockProbe) clockProbe.textContent = `${probeTime.toFixed(1)}s`;
    if (dilationFactor) dilationFactor.textContent = `${(dilationRatio * 100).toFixed(1)}%`;
  };

  // AI Voice-Guided Planetarium Tour (Web Speech API)
  const btnTour = document.getElementById('btn-tour');
  let isTourActive = false;
  let tourIndex = 0;

  const tourSteps = [
    {
      title: 'Schwarzschild Event Horizon',
      text: 'Welcome to Cosmic Canvas. You are observing a Kerr-Schwarzschild Black Hole. Notice how light from the accretion disk bends sharply around the photon sphere due to warped spacetime.',
      action: () => {
        if (modeSelect) modeSelect.value = 'blackhole';
        engine.updateParams({ mode: 'blackhole', mass: 1.0, spin: 1.0, lensing: 1.2 });
      }
    },
    {
      title: 'Tidal Disruption Event (TDE)',
      text: 'Watch as an approaching star crosses the Roche tidal limit. Gravitational differential forces pull the stellar core into a spaghettified stream that accretes into the singularity.',
      action: () => {
        engine.spawnStar();
      }
    },
    {
      title: 'Einstein-Rosen Wormhole',
      text: 'Switching to an Einstein-Rosen Bridge. In general relativity, a wormhole throat acts as a spherical gravitational lens through which an entire alternate galaxy is visibly refracted.',
      action: () => {
        if (modeSelect) modeSelect.value = 'wormhole';
        engine.updateParams({ mode: 'wormhole', mass: 1.2, lensing: 1.4 });
      }
    },
    {
      title: 'Binary Black Hole Merger',
      text: 'Observing two co-orbiting black holes emitting gravitational waves. Listen to the acoustic chirp frequency rising as they spiral towards coalescence.',
      action: () => {
        if (modeSelect) modeSelect.value = 'binary';
        engine.updateParams({ mode: 'binary', spin: 1.8 });
      }
    },
    {
      title: 'Powers of Ten Scale: TON 618',
      text: 'Finally, comparing with TON 618, an ultramassive black hole sixty-six billion times the mass of our Sun, easily swallowing our entire solar system.',
      action: () => {
        const scaleSelectEl = document.getElementById('scale-select');
        if (scaleSelectEl) scaleSelectEl.value = 'ton618';
        engine.setScale('ton618');
      }
    }
  ];

  function speakNarration(step) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(step.text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;

    // Display subtitle banner
    const subtitleBanner = document.getElementById('voice-subtitle-banner');
    const subtitleText = document.getElementById('subtitle-text');
    if (subtitleBanner && subtitleText) {
      subtitleBanner.style.display = 'block';
      subtitleText.textContent = `🎙️ [AI Narrator]: "${step.text}"`;
    }

    utterance.onend = () => {
      if (isTourActive) {
        tourIndex = (tourIndex + 1) % tourSteps.length;
        setTimeout(() => {
          if (isTourActive) {
            const nextStep = tourSteps[tourIndex];
            nextStep.action();
            speakNarration(nextStep);
          }
        }, 1500);
      } else if (subtitleBanner) {
        setTimeout(() => { subtitleBanner.style.display = 'none'; }, 3000);
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  // Bidirectional Voice Q&A Intent Parser (Web Speech Recognition)
  const btnVoiceQa = document.getElementById('btn-voice-qa');
  const subtitleBanner = document.getElementById('voice-subtitle-banner');
  const subtitleText = document.getElementById('subtitle-text');
  let recognition = null;
  let isListening = false;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      if (btnVoiceQa) {
        btnVoiceQa.textContent = '🔴 Listening...';
        btnVoiceQa.style.background = 'rgba(239, 68, 68, 0.3)';
        btnVoiceQa.style.borderColor = '#ef4444';
      }
      if (subtitleBanner && subtitleText) {
        subtitleBanner.style.display = 'block';
        subtitleText.textContent = '🎤 Listening... Ask e.g. "Show Gargantua", "Spawn a star", "What is Doppler beaming?", "Fly the ship"';
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (subtitleText) subtitleText.textContent = `🗣️ You asked: "${transcript}"`;

      // Intent Matching
      if (transcript.includes('gargantua')) {
        const btnG = document.getElementById('btn-gargantua');
        if (btnG) btnG.click();
        speakNarration({ text: 'Switching to Gargantua. An extreme Kerr rotating black hole spinning near the theoretical maximum limit.' });
      } else if (transcript.includes('star') || transcript.includes('spaghett')) {
        engine.spawnStar();
        speakNarration({ text: 'Spawning an approaching star undergoing tidal disruption into the singularity.' });
      } else if (transcript.includes('wormhole')) {
        if (modeSelect) modeSelect.value = 'wormhole';
        engine.updateParams({ mode: 'wormhole' });
        speakNarration({ text: 'Opening an Einstein-Rosen wormhole bridge connecting to an alternate galaxy.' });
      } else if (transcript.includes('fly') || transcript.includes('pilot') || transcript.includes('ship')) {
        const isPilot = engine.togglePilotMode();
        speakNarration({ text: isPilot ? 'Flight cockpit mode active. Use W, A, S, D and Space to pilot your spacecraft.' : 'Disengaging flight cockpit mode.' });
      } else if (transcript.includes('doppler') || transcript.includes('bright')) {
        speakNarration({ text: 'Relativistic Doppler beaming causes matter moving towards the observer to appear blueshifted and dramatically brighter.' });
      } else if (transcript.includes('binary') || transcript.includes('wave')) {
        if (modeSelect) modeSelect.value = 'binary';
        engine.updateParams({ mode: 'binary' });
        speakNarration({ text: 'Simulating a binary black hole inspiral emitting quadrupolar gravitational wave strain ripples.' });
      } else if (transcript.includes('ton') || transcript.includes('scale')) {
        const scaleSelectEl = document.getElementById('scale-select');
        if (scaleSelectEl) scaleSelectEl.value = 'ton618';
        engine.setScale('ton618');
        speakNarration({ text: 'Framing TON 618 ultramassive black hole, sixty-six billion times the mass of our Sun.' });
      } else {
        speakNarration({ text: `I heard: ${transcript}. You can ask about Doppler beaming, Gargantua, scale models, or spawning stars.` });
      }
    };

    recognition.onend = () => {
      isListening = false;
      if (btnVoiceQa) {
        btnVoiceQa.textContent = '🎤 Ask Voice';
        btnVoiceQa.style.background = 'rgba(255, 255, 255, 0.05)';
        btnVoiceQa.style.borderColor = '#38bdf8';
      }
    };

    recognition.onerror = (err) => {
      isListening = false;
      if (btnVoiceQa) {
        btnVoiceQa.textContent = '🎤 Ask Voice';
        btnVoiceQa.style.background = 'rgba(255, 255, 255, 0.05)';
        btnVoiceQa.style.borderColor = '#38bdf8';
      }
      if (subtitleText) subtitleText.textContent = `⚠️ Voice recognition error: ${err.error}`;
    };
  }

  if (btnVoiceQa) {
    btnVoiceQa.addEventListener('click', () => {
      if (!recognition) {
        alert('Web Speech Recognition is not supported in this browser. Try Chrome or Edge.');
        return;
      }
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  if (btnTour) {
    btnTour.addEventListener('click', () => {
      isTourActive = !isTourActive;
      if (isTourActive) {
        btnTour.textContent = '🎙️ Tour: PLAYING';
        btnTour.style.background = 'rgba(236, 72, 153, 0.3)';
        btnTour.style.borderColor = '#ec4899';
        tourIndex = 0;
        const firstStep = tourSteps[0];
        firstStep.action();
        speakNarration(firstStep);
      } else {
        btnTour.textContent = '🎙️ AI Tour';
        btnTour.style.background = 'rgba(255, 255, 255, 0.05)';
        btnTour.style.borderColor = '#ec4899';
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (subtitleBanner) subtitleBanner.style.display = 'none';
      }
    });
  }

  const btnAudio = document.getElementById('btn-audio');

  if (btnAudio) {
    btnAudio.addEventListener('click', () => {
      const isRunning = engine.toggleAudio();
      if (isRunning) {
        btnAudio.textContent = '🔊 Cosmic Audio: ON';
        btnAudio.style.background = 'rgba(56, 189, 248, 0.3)';
        btnAudio.style.borderColor = '#38bdf8';
      } else {
        btnAudio.textContent = '🔈 Cosmic Audio: MUTED';
        btnAudio.style.background = 'rgba(255, 255, 255, 0.05)';
        btnAudio.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    });
  }

  const btnVr = document.getElementById('btn-vr');
  if (btnVr) {
    btnVr.addEventListener('click', () => {
      const isGyro = engine.toggleGyroscope();
      if (isGyro) {
        btnVr.textContent = '🥽 Gyro: ACTIVE';
        btnVr.style.background = 'rgba(139, 92, 246, 0.3)';
        btnVr.style.borderColor = '#8b5cf6';
      } else {
        btnVr.textContent = '🥽 Gyro/VR';
        btnVr.style.background = 'rgba(255, 255, 255, 0.05)';
        btnVr.style.borderColor = '#8b5cf6';
      }
    });
  }

  const btnSplit = document.getElementById('btn-split');
  if (btnSplit) {
    btnSplit.addEventListener('click', () => {
      const isSplit = engine.toggleInfallView();
      if (isSplit) {
        btnSplit.textContent = '🪟 Split: ACTIVE';
        btnSplit.style.background = 'rgba(16, 185, 129, 0.3)';
        btnSplit.style.borderColor = '#10b981';
      } else {
        btnSplit.textContent = '🪟 Infall View';
        btnSplit.style.background = 'rgba(255, 255, 255, 0.05)';
        btnSplit.style.borderColor = '#10b981';
      }
    });
  }

  const btnPilot = document.getElementById('btn-pilot');
  const flightHud = document.getElementById('flight-hud');
  const shipVelEl = document.getElementById('ship-vel');
  const shipDistEl = document.getElementById('ship-dist');

  if (btnPilot) {
    btnPilot.addEventListener('click', () => {
      const isPilot = engine.togglePilotMode();
      if (isPilot) {
        btnPilot.textContent = '🚀 Cockpit: ACTIVE';
        btnPilot.style.background = 'rgba(245, 158, 11, 0.3)';
        btnPilot.style.borderColor = '#fbbf24';
        if (flightHud) flightHud.style.display = 'block';
      } else {
        btnPilot.textContent = '🚀 Pilot Ship';
        btnPilot.style.background = 'rgba(255, 255, 255, 0.05)';
        btnPilot.style.borderColor = '#f59e0b';
        if (flightHud) flightHud.style.display = 'none';
      }
    });
  }

  engine.onFlightTelemetryUpdate = ({ speedC, proximityRs }) => {
    if (shipVelEl) shipVelEl.textContent = speedC.toFixed(2);
    if (shipDistEl) shipDistEl.textContent = proximityRs.toFixed(1);
  };

  const scaleSelect = document.getElementById('scale-select');
  if (scaleSelect) {
    scaleSelect.addEventListener('change', (e) => {
      engine.setScale(e.target.value);
    });
  }

  // Event Listeners
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      engine.updateParams({ mode });

      if (mode === 'wormhole') {
        infoTitle.textContent = 'Einstein-Rosen Bridge (Wormhole)';
        infoDesc.textContent = 'A hypothetical topological bridge connecting two distant regions of spacetime. The throat radius determines the cross-sectional geometry through which light and matter could theoretically pass.';
      } else if (mode === 'binary') {
        infoTitle.textContent = 'Binary Black Hole Inspiral & Gravitational Waves';
        infoDesc.textContent = 'Two co-orbiting black holes lose energy to gravitational radiation, spiraling inwards towards coalescence while emitting quadrupolar spacetime metric distortions and acoustic chirps.';
      } else if (mode === 'multibody') {
        infoTitle.textContent = 'Multi-Body Spacetime Gravity Sandbox';
        infoDesc.textContent = 'Interactive N-body gravitational dynamics sandbox. Spawn arbitrary black hole singularities to observe complex inter-body gravitational attractions and chaotic multi-horizon orbital choreographies.';
      } else {
        infoTitle.textContent = 'Event Horizon & Doppler Beaming';
        infoDesc.textContent = 'Light passing near the Schwarzschild radius bends sharply due to warped spacetime. The approaching side of the accretion disk shines brighter due to relativistic Doppler beaming.';
      }
    });
  }
  massSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    massVal.textContent = val.toFixed(1);
    engine.updateParams({ mass: val });
  });

  spinSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    spinVal.textContent = val.toFixed(1);
    engine.updateParams({ spin: val });
  });

  lensingSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    lensingVal.textContent = val.toFixed(1);
    engine.updateParams({ lensing: val });
  });

  tiltSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    tiltVal.textContent = val;
    engine.updateParams({ tilt: val });
  });

  btnReset.addEventListener('click', () => {
    massSlider.value = 1.0;
    spinSlider.value = 1.0;
    lensingSlider.value = 1.0;
    tiltSlider.value = 25;

    massVal.textContent = '1.0';
    spinVal.textContent = '1.0';
    lensingVal.textContent = '1.0';
    tiltVal.textContent = '25';

    engine.updateParams({ mass: 1.0, spin: 1.0, lensing: 1.0, tilt: 25 });
  });

  const btnCygnus = document.getElementById('btn-cygnus');
  if (btnCygnus) {
    btnCygnus.addEventListener('click', () => {
      massSlider.value = 0.8;
      spinSlider.value = 2.8; // High spin stellar mass
      lensingSlider.value = 0.9;
      tiltSlider.value = 60;

      massVal.textContent = '0.8';
      spinVal.textContent = '2.8';
      lensingVal.textContent = '0.9';
      tiltVal.textContent = '60';

      engine.updateParams({ mass: 0.8, spin: 2.8, lensing: 0.9, tilt: 60 });
    });
  }

  const btnSagittarius = document.getElementById('btn-sagittarius');
  if (btnSagittarius) {
    btnSagittarius.addEventListener('click', () => {
      massSlider.value = 2.4;
      spinSlider.value = 0.9;
      lensingSlider.value = 1.8;
      tiltSlider.value = 15;

      massVal.textContent = '2.4';
      spinVal.textContent = '0.9';
      lensingVal.textContent = '1.8';
      tiltVal.textContent = '15';

      engine.updateParams({ mass: 2.4, spin: 0.9, lensing: 1.8, tilt: 15 });
    });
  }

  const btnGargantua = document.getElementById('btn-gargantua');
  if (btnGargantua) {
    btnGargantua.addEventListener('click', () => {
      massSlider.value = 3.0;
      spinSlider.value = 2.9; // Extreme Kerr Spin (a* ~ 0.99)
      lensingSlider.value = 2.4;
      tiltSlider.value = 85; // Edge-on accretion disk

      massVal.textContent = '3.0';
      spinVal.textContent = '2.9';
      lensingVal.textContent = '2.4';
      tiltVal.textContent = '85';

      engine.updateParams({ mass: 3.0, spin: 2.9, lensing: 2.4, tilt: 85 });
    });
  }

  const btnStar = document.getElementById('btn-star');
  if (btnStar) {
    btnStar.addEventListener('click', () => {
      engine.spawnStar();
    });
  }

  const btnSpawnBody = document.getElementById('btn-spawn-body');
  if (btnSpawnBody) {
    btnSpawnBody.addEventListener('click', () => {
      engine.spawnCustomBody();
    });
  }

  const btnPhoton = document.getElementById('btn-photon');

  btnPhoton.addEventListener('click', () => {
    engine.launchPhoton();
  });

  // Drag-to-Aim Continuous Photon Laser Cannon
  let isPointerDown = false;
  let lastLaserTime = 0;
  const canvasEl = engine.renderer.domElement;

  canvasEl.addEventListener('pointerdown', (e) => {
    if (e.target !== canvasEl) return;
    isPointerDown = true;
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  canvasEl.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const now = performance.now();
    if (now - lastLaserTime > 120) { // Limit to 8 lasers/sec
      lastLaserTime = now;
      const rect = canvasEl.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      engine.launchPhoton({ x: ndcX, y: ndcY });
    }
  });

  btnSupermassive.addEventListener('click', () => {
    massSlider.value = 2.8;
    spinSlider.value = 2.5;
    lensingSlider.value = 2.2;
    tiltSlider.value = 45;

    massVal.textContent = '2.8';
    spinVal.textContent = '2.5';
    lensingVal.textContent = '2.2';
    tiltVal.textContent = '45';

    engine.updateParams({ mass: 2.8, spin: 2.5, lensing: 2.2, tilt: 45 });
  });

  const btnRecord = document.getElementById('btn-record');

  btnRecord.addEventListener('click', () => {
    if (engine.isRecording) return;

    btnRecord.textContent = '⏺ Recording 5s Orbit...';
    btnRecord.style.opacity = '0.7';
    engine.isRecording = true;
    engine.recordTheta = 0;

    const canvas = engine.renderer.domElement;
    
    // Create dedicated compositing canvas for watermark & telemetry overlay
    const compCanvas = document.createElement('canvas');
    compCanvas.width = canvas.width;
    compCanvas.height = canvas.height;
    const ctx = compCanvas.getContext('2d');

    let isExportActive = true;

    const drawFrame = () => {
      if (!isExportActive) return;
      ctx.drawImage(canvas, 0, 0);

      // Render sleek semi-transparent watermark in lower-left
      ctx.save();
      ctx.font = '600 18px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText('✦ Rendered on Cosmic Canvas', 24, compCanvas.height - 24);

      // Telemetry metadata tag
      ctx.font = '500 12px monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.fillText(`KERR a*=${engine.params.spin.toFixed(2)} | MASS=${engine.params.mass.toFixed(1)} M☉ | 60 FPS`, 24, compCanvas.height - 48);
      ctx.restore();

      requestAnimationFrame(drawFrame);
    };
    drawFrame();

    const stream = compCanvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      isExportActive = false;
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmic-canvas-orbit-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      engine.isRecording = false;
      btnRecord.textContent = '🎬 Record 5s Orbit (WebM)';
      btnRecord.style.opacity = '1.0';
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  });
});
