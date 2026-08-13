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

  // Event Listeners
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
});
