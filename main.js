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

  const btnPhoton = document.getElementById('btn-photon');

  btnPhoton.addEventListener('click', () => {
    engine.launchPhoton();
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
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
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
