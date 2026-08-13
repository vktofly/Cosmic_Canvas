import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CosmicEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.params = {
      mode: 'blackhole',
      mass: 1.0,
      spin: 1.0,
      lensing: 1.0,
      tilt: 25.0
    };

    this.initScene();
    this.createBlackHole();
    this.createWormhole();
    this.createBinaryBlackHoles();
    this.createScaleComparisonObjects();
    this.scene.add(this.multiBodyGroup);
    this.createAccretionDisk();
    this.createStarfield();
    this.addEventListeners();
    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 4, 12);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 3.0;
    this.controls.maxDistance = 30.0;

    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.fps = 60;
    this.onFpsUpdate = null;
    this.isRecording = false;
    this.recordTheta = 0;
    this.photonRays = [];
    this.stellarDebris = [];

    // Gyroscope / Device Orientation
    this.isGyroActive = false;
    this.gyroAlpha = 0;
    this.gyroBeta = 0;
    this.gyroGamma = 0;

    // Infall Observer Split View
    this.isInfallActive = false;
    this.infallRadius = 14.0;
    this.infallCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );

    // Relativistic Flight Simulator Mode
    this.isPilotMode = false;
    this.shipVelocity = new THREE.Vector3();
    this.shipSpeedC = 0; // Speed in units of c
    this.keys = { forward: false, backward: false, left: false, right: false, up: false, down: false };
    this.onFlightTelemetryUpdate = null;

    // Multi-Body Spacetime Gravity Sandbox
    this.multiBodies = [];
    this.multiBodyGroup = new THREE.Group();

    // Scale Comparison Meshes
    this.currentScale = 'none';
    this.scaleMeshes = {};

    // Time Dilation State
    this.coordinateTime = 0;
    this.probeTime = 0;
    this.probeRadius = 2.2; // Probe position in Schwarzschild radii units
    this.onTimeDilationUpdate = null;

    // Web Audio Synthesizer
    this.audioCtx = null;
    this.droneOsc = null;
    this.gainNode = null;
    this.isAudioEnabled = false;
  }

  initAudio() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.pannerNode = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.25, this.audioCtx.currentTime); // Audible volume

    if (this.pannerNode) {
      this.pannerNode.connect(this.audioCtx.destination);
      this.gainNode.connect(this.pannerNode);
    } else {
      this.gainNode.connect(this.audioCtx.destination);
    }

    // Deep Sub-Bass Spacetime Drone (Dual rich harmonics)
    this.droneOsc = this.audioCtx.createOscillator();
    this.droneOsc.type = 'triangle'; // Richer audible waveform
    this.droneOsc.frequency.setValueAtTime(110 * this.params.spin, this.audioCtx.currentTime);
    this.droneOsc.connect(this.gainNode);
    this.droneOsc.start();
  }

  toggleAudio() {
    if (!this.audioCtx) {
      this.initAudio();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.isAudioEnabled = true;
      return true;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
      this.isAudioEnabled = true;
      return true;
    } else {
      this.audioCtx.suspend();
      this.isAudioEnabled = false;
      return false;
    }
  }

  playPhotonSound() {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.35);
  }

  updateAudioParams() {
    if (this.droneOsc && this.audioCtx && this.audioCtx.state === 'running') {
      // Gravitational Redshift Factor: z = 1 / sqrt(1 - Rs/r) -> f_observed = f_emit * sqrt(1 - Rs/r)
      const camDist = this.camera.position.length();
      const rs = 1.5 * this.params.mass;
      const redshiftRatio = Math.sqrt(Math.max(0.15, 1.0 - (rs / Math.max(rs + 0.1, camDist))));

      if (this.pannerNode) {
        // Stereo panning based on camera azimuth angle in X-Z plane
        const pan = THREE.MathUtils.clamp(this.camera.position.x / 14.0, -0.9, 0.9);
        this.pannerNode.pan.setTargetAtTime(pan, this.audioCtx.currentTime, 0.1);
      }

      if (this.params.mode === 'binary') {
        // Gravitational Wave Chirp: f_GW = 2 * f_orbit
        const gwFreq = 160.0 * Math.max(0.5, this.params.spin) / Math.max(0.8, this.binarySeparation || 2.5);
        this.droneOsc.frequency.setTargetAtTime(gwFreq * redshiftRatio, this.audioCtx.currentTime, 0.05);
      } else {
        const baseFreq = 110.0 * Math.max(0.5, this.params.spin) / Math.max(0.5, this.params.mass);
        this.droneOsc.frequency.setTargetAtTime(baseFreq * redshiftRatio, this.audioCtx.currentTime, 0.1);
      }
    }
  }

  createBlackHole() {
    // Event Horizon Sphere
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.eventHorizon = new THREE.Mesh(geometry, material);
    this.scene.add(this.eventHorizon);

    // Photon Sphere Glow Halo
    const haloGeometry = new THREE.SphereGeometry(1.85, 64, 64);
    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float uLensing;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.2, 0.7, 1.0, intensity * uLensing * 0.8);
        }
      `,
      uniforms: {
        uLensing: { value: this.params.lensing }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    this.photonSphere = new THREE.Mesh(haloGeometry, haloMaterial);
    this.scene.add(this.photonSphere);
  }

  createWormhole() {
    // 3D Spherical Wormhole Throat (Interstellar-style Spherical Gravitational Lens)
    const sphereGeo = new THREE.SphereGeometry(2.0, 64, 64);
    const wormholeMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPosition.xyz;
          vViewDir = normalize(cameraPosition - worldPosition.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        varying vec3 vViewDir;
        uniform float uTime;
        uniform float uLensing;

        // Procedural Starfield & Alternate Nebula
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        void main() {
          // Spherical Gravitational Refraction Angle
          vec3 refRay = refract(-vViewDir, vNormal, 0.75);
          if (length(refRay) == 0.0) refRay = reflect(-vViewDir, vNormal);

          // Alternate Universe Celestial Coordinate Space
          vec3 altCoord = refRay * 4.0 + vec3(sin(uTime * 0.2), cos(uTime * 0.15), 0.0);
          float stars = step(0.985, hash(floor(altCoord * 16.0)));

          // Magenta/Teal Alternate Galaxy Core Nebula
          float nebula = 0.5 + 0.5 * sin(altCoord.x * 2.0 + altCoord.y * 3.0 + uTime * 0.3);
          vec3 galaxyColor = mix(vec3(0.1, 0.5, 0.9), vec3(0.9, 0.2, 0.7), nebula);
          galaxyColor += vec3(stars * 1.5);

          // Einstein Ring Lensing Perimeter Glow
          float rim = 1.0 - max(0.0, dot(vViewDir, vNormal));
          float einsteinRing = pow(rim, 3.5) * uLensing * 2.2;
          vec3 ringColor = vec3(0.3, 0.8, 1.0) * einsteinRing;

          gl_FragColor = vec4(galaxyColor * 0.9 + ringColor, 0.95);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uLensing: { value: this.params.lensing }
      },
      transparent: true,
      side: THREE.DoubleSide
    });

    this.wormholeThroat = new THREE.Mesh(sphereGeo, wormholeMat);
    this.wormholeThroat.visible = false;
    this.scene.add(this.wormholeThroat);
  }

  createBinaryBlackHoles() {
    this.binaryGroup = new THREE.Group();
    this.binaryGroup.visible = false;

    // BH 1
    const bh1Geo = new THREE.SphereGeometry(0.8, 32, 32);
    const bh1Mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.bh1 = new THREE.Mesh(bh1Geo, bh1Mat);
    this.binaryGroup.add(this.bh1);

    // BH 2
    const bh2Geo = new THREE.SphereGeometry(0.8, 32, 32);
    const bh2Mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.bh2 = new THREE.Mesh(bh2Geo, bh2Mat);
    this.binaryGroup.add(this.bh2);

    // Gravitational Spacetime Wave Distortion Ripples (Plane)
    const waveGeo = new THREE.RingGeometry(0.5, 14.0, 64, 16);
    const waveMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          float dist = length(vUv - vec2(0.5));
          float wave = sin(dist * 40.0 - uTime * 8.0);
          float alpha = smoothstep(0.0, 0.4, dist) * (1.0 - smoothstep(0.3, 0.5, dist)) * abs(wave);
          gl_FragColor = vec4(0.2, 0.8, 1.0, alpha * 0.7);
        }
      `,
      uniforms: {
        uTime: { value: 0 }
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    this.gwWaves = new THREE.Mesh(waveGeo, waveMat);
    this.gwWaves.rotation.x = Math.PI / 2;
    this.binaryGroup.add(this.gwWaves);

    this.scene.add(this.binaryGroup);
    this.binaryTheta = 0;
    this.binarySeparation = 4.0;
  }

  createScaleComparisonObjects() {
    this.scaleGroup = new THREE.Group();

    // 0. Neutron Star / Pulsar (Ultra-compact 20km with bipolar magnetic jets)
    const neutronGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const neutronMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
    const neutronMesh = new THREE.Mesh(neutronGeo, neutronMat);
    neutronMesh.position.set(2.0, 0, 0);

    // Pulsar Jet Cone
    const jetGeo = new THREE.CylinderGeometry(0.01, 0.25, 2.5, 16);
    const jetMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const jetMesh = new THREE.Mesh(jetGeo, jetMat);
    jetMesh.position.set(2.0, 0, 0);

    const neutronGroup = new THREE.Group();
    neutronGroup.add(neutronMesh);
    neutronGroup.add(jetMesh);
    neutronGroup.visible = false;
    this.scaleGroup.add(neutronGroup);
    this.scaleMeshes['neutron'] = neutronGroup;

    // 1. Earth Scale Mesh (Tiny blue sphere next to black hole)
    const earthGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(2.8, 0, 0);

    // Earth Orbit Ring
    const earthRingGeo = new THREE.RingGeometry(2.78, 2.82, 64);
    const earthRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const earthRing = new THREE.Mesh(earthRingGeo, earthRingMat);
    earthRing.rotation.x = Math.PI / 2;

    const earthGroup = new THREE.Group();
    earthGroup.add(earthMesh);
    earthGroup.add(earthRing);
    earthGroup.visible = false;
    this.scaleGroup.add(earthGroup);
    this.scaleMeshes['earth'] = earthGroup;

    // 2. Our Sun Scale Mesh (Golden glowing sphere)
    const sunGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(4.5, 0, 0);

    const sunRingGeo = new THREE.RingGeometry(4.46, 4.54, 64);
    const sunRingMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const sunRing = new THREE.Mesh(sunRingGeo, sunRingMat);
    sunRing.rotation.x = Math.PI / 2;

    const sunGroup = new THREE.Group();
    sunGroup.add(sunMesh);
    sunGroup.add(sunRing);
    sunGroup.visible = false;
    this.scaleGroup.add(sunGroup);
    this.scaleMeshes['sun'] = sunGroup;

    // 3. Solar System Scale Orbit (Outer Pluto/Kuiper Orbit Ellipse)
    const ssGeo = new THREE.RingGeometry(8.0, 8.1, 96);
    const ssMat = new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    const ssRing = new THREE.Mesh(ssGeo, ssMat);
    ssRing.rotation.x = Math.PI / 2;

    const ssGroup = new THREE.Group();
    ssGroup.add(ssRing);
    ssGroup.visible = false;
    this.scaleGroup.add(ssGroup);
    this.scaleMeshes['solarsystem'] = ssGroup;

    // 4. TON 618 Ultramassive Black Hole Horizon (Gigantic 18.0 unit sphere swallowing entire scene)
    const tonGeo = new THREE.SphereGeometry(14.0, 64, 64);
    const tonMat = new THREE.MeshBasicMaterial({ color: 0x030712, wireframe: true, transparent: true, opacity: 0.4 });
    const tonMesh = new THREE.Mesh(tonGeo, tonMat);
    
    const tonGlowGeo = new THREE.RingGeometry(13.9, 14.2, 96);
    const tonGlowMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const tonRing = new THREE.Mesh(tonGlowGeo, tonGlowMat);
    tonRing.rotation.x = Math.PI / 2;

    const tonGroup = new THREE.Group();
    tonGroup.add(tonMesh);
    tonGroup.add(tonRing);
    tonGroup.visible = false;
    this.scaleGroup.add(tonGroup);
    this.scaleMeshes['ton618'] = tonGroup;

    this.scene.add(this.scaleGroup);
  }

  setScale(scaleName) {
    this.currentScale = scaleName;
    Object.keys(this.scaleMeshes).forEach((key) => {
      this.scaleMeshes[key].visible = (key === scaleName);
    });

    // Auto-frame camera based on scale ladder
    if (scaleName === 'ton618') {
      this.camera.position.set(0, 18, 36);
      this.controls.maxDistance = 60.0;
    } else if (scaleName === 'neutron') {
      this.camera.position.set(0, 2, 6);
    } else {
      this.controls.maxDistance = 30.0;
    }
  }

  createAccretionDisk() {
    this.particleCount = 40000;
    const geometry = new THREE.BufferGeometry();
    this.diskPositions = new Float32Array(this.particleCount * 3);
    this.diskRadii = new Float32Array(this.particleCount);
    this.diskAngles = new Float32Array(this.particleCount);
    this.diskYOffsets = new Float32Array(this.particleCount);
    const colors = new Float32Array(this.particleCount * 3);

    const innerRadius = 2.2;
    const outerRadius = 7.0;

    for (let i = 0; i < this.particleCount; i++) {
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      const theta = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.15 * (r / outerRadius);

      this.diskRadii[i] = r;
      this.diskAngles[i] = theta;
      this.diskYOffsets[i] = yOffset;

      this.diskPositions[i * 3] = r * Math.cos(theta);
      this.diskPositions[i * 3 + 1] = yOffset;
      this.diskPositions[i * 3 + 2] = r * Math.sin(theta);

      // Doppler color gradient (Blue hot inner, Amber cool outer)
      const ratio = (r - innerRadius) / (outerRadius - innerRadius);
      const color = new THREE.Color();
      if (ratio < 0.3) {
        color.setHSL(0.55 + ratio * 0.1, 0.9, 0.7);
      } else {
        color.setHSL(0.08 - (ratio - 0.3) * 0.05, 0.95, 0.55);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.diskPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85
    });

    this.accretionDisk = new THREE.Points(geometry, material);
    this.accretionDisk.rotation.x = THREE.MathUtils.degToRad(this.params.tilt);
    this.scene.add(this.accretionDisk);
  }

  createStarfield() {
    const starsCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.6 });
    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  updateParams(newParams) {
    this.params = { ...this.params, ...newParams };

    const isWormhole = this.params.mode === 'wormhole';
    const isBinary = this.params.mode === 'binary';

    if (this.eventHorizon && this.photonSphere) {
      this.eventHorizon.visible = !isWormhole && !isBinary;
      this.photonSphere.visible = !isWormhole && !isBinary;
      const scale = this.params.mass;
      this.eventHorizon.scale.set(scale, scale, scale);
      this.photonSphere.scale.set(scale, scale, scale);
      this.photonSphere.material.uniforms.uLensing.value = this.params.lensing;
    }

    if (this.wormholeThroat) {
      this.wormholeThroat.visible = isWormhole;
      const scale = this.params.mass;
      this.wormholeThroat.scale.set(scale, 1.0, scale);
    }

    if (this.binaryGroup) {
      this.binaryGroup.visible = isBinary;
    }

    if (this.accretionDisk) {
      this.accretionDisk.visible = !isBinary;
      this.accretionDisk.rotation.x = THREE.MathUtils.degToRad(this.params.tilt);
    }

    this.updateAudioParams();
  }

  launchPhoton(screenPos = null) {
    this.playPhotonSound();
    
    let startPos, velocity;
    if (screenPos) {
      // Unproject screen NDC into 3D world space
      const vector = new THREE.Vector3(screenPos.x, screenPos.y, 0.5);
      vector.unproject(this.camera);
      const dir = vector.sub(this.camera.position).normalize();
      startPos = this.camera.position.clone().add(dir.clone().multiplyScalar(4));
      velocity = dir.multiplyScalar(16);
    } else {
      startPos = new THREE.Vector3(-12, (Math.random() - 0.5) * 2, 8);
      velocity = new THREE.Vector3(10, 0, -5).normalize().multiplyScalar(15);
    }

    // Dynamic traveling photon projectile with trailing tail
    const maxTail = 25;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxTail * 3);
    for (let i = 0; i < maxTail * 3; i += 3) {
      positions[i] = startPos.x;
      positions[i + 1] = startPos.y;
      positions[i + 2] = startPos.z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: screenPos ? 0x38bdf8 : 0xf59e0b,
      linewidth: 3,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    this.photonRays.push({
      mesh: line,
      pos: startPos.clone(),
      vel: velocity.clone(),
      history: [startPos.clone()],
      createdAt: performance.now(),
      absorbed: false
    });
  }

  spawnStar() {
    this.playPhotonSound();

    // 1200 particles representing a star undergoing Tidal Disruption Event (TDE)
    const starCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const velocities = [];

    // Spawn in front of the active camera view
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    const origin = this.camera.position.clone().add(camDir.clone().multiplyScalar(6.0)).add(new THREE.Vector3(-4, 2, 0));
    const target = new THREE.Vector3(0, 0, 0);
    const baseVel = target.clone().sub(origin).normalize().multiplyScalar(5.5);

    for (let i = 0; i < starCount; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 1.2
      );
      const pos = origin.clone().add(offset);
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(baseVel.clone().add(offset.clone().multiplyScalar(0.3)));

      // Glowing ultra-bright golden stellar core
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.45, // High visibility
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.stellarDebris.push({
      mesh: points,
      velocities: velocities,
      createdAt: performance.now()
    });
  }

  spawnCustomBody() {
    this.playPhotonSound();

    // Spawn a new orbiting black hole singularity with photon halo
    const mass = 0.6 + Math.random() * 0.8;
    const radius = 1.5 * mass;

    const bhGeo = new THREE.SphereGeometry(radius * 0.5, 32, 32);
    const bhMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bhMesh = new THREE.Mesh(bhGeo, bhMat);

    const haloGeo = new THREE.RingGeometry(radius * 0.5, radius * 0.9, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.9, 0.6),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;

    const group = new THREE.Group();
    group.add(bhMesh);
    group.add(haloMesh);

    // Initial position on an orbital trajectory in X-Z plane
    const angle = Math.random() * Math.PI * 2;
    const dist = 5.0 + Math.random() * 6.0;
    const pos = new THREE.Vector3(Math.cos(angle) * dist, (Math.random() - 0.5) * 1.5, Math.sin(angle) * dist);
    group.position.copy(pos);

    // Tangential orbital velocity: v = sqrt(G*M_center / r)
    const speed = Math.sqrt((32.0 * this.params.mass) / dist);
    const vel = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).multiplyScalar(speed);

    this.multiBodyGroup.add(group);
    this.multiBodies.push({
      group: group,
      pos: pos.clone(),
      vel: vel.clone(),
      mass: mass
    });
  }

  toggleGyroscope() {
    this.isGyroActive = !this.isGyroActive;
    if (this.isGyroActive) {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then((response) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', this.handleOrientation.bind(this), true);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', this.handleOrientation.bind(this), true);
      }
    } else {
      window.removeEventListener('deviceorientation', this.handleOrientation.bind(this), true);
      this.camera.position.set(0, 4, 12);
      this.camera.lookAt(0, 0, 0);
    }
    return this.isGyroActive;
  }

  handleOrientation(event) {
    if (!this.isGyroActive) return;
    const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
    const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;
    const radius = 12.0;

    this.camera.position.x = radius * Math.sin(gamma);
    this.camera.position.y = 4.0 + radius * Math.sin(beta) * 0.5;
    this.camera.position.z = radius * Math.cos(gamma);
    this.camera.lookAt(0, 0, 0);
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (!this.isPilotMode) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;
      if (e.code === 'Space') this.keys.up = true;
      if (e.code === 'ShiftLeft' || e.code === 'KeyC') this.keys.down = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
      if (e.code === 'Space') this.keys.up = false;
      if (e.code === 'ShiftLeft' || e.code === 'KeyC') this.keys.down = false;
    });
  }

  togglePilotMode() {
    this.isPilotMode = !this.isPilotMode;
    if (this.isPilotMode) {
      this.controls.enabled = false;
      this.shipVelocity.set(0, 0, 0);
      this.camera.position.set(0, 0, 14);
      this.camera.lookAt(0, 0, 0);
    } else {
      this.controls.enabled = true;
      this.camera.fov = 60;
      this.camera.updateProjectionMatrix();
    }
    return this.isPilotMode;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    this.frameCount++;
    if (now - this.lastFpsTime >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
      if (typeof this.onFpsUpdate === 'function') {
        this.onFpsUpdate(this.fps);
      }
    }

    // Animate Traveling Photon Laser Beams (Spacetime Geodesics & Horizon Capture)
    const dtPhoton = 0.025;
    for (let i = this.photonRays.length - 1; i >= 0; i--) {
      const ray = this.photonRays[i];
      const age = (now - ray.createdAt) / 1000;

      if (age > 4.0 || ray.absorbed) {
        this.scene.remove(ray.mesh);
        ray.mesh.geometry.dispose();
        ray.mesh.material.dispose();
        this.photonRays.splice(i, 1);
        continue;
      }

      const r = ray.pos.length();
      if (r < 1.45 * this.params.mass) {
        // Photon crossed the event horizon: swallowed and vanishes
        ray.absorbed = true;
        continue;
      }

      // Relativistic geodesic acceleration: a = - (2.8 * M * lensing) / r^3 * pos
      const accelMag = (2.8 * this.params.mass * this.params.lensing) / (r * r * r);
      const accel = ray.pos.clone().negate().multiplyScalar(accelMag);

      ray.vel.add(accel.multiplyScalar(dtPhoton));
      ray.pos.add(ray.vel.clone().multiplyScalar(dtPhoton));

      ray.history.push(ray.pos.clone());
      if (ray.history.length > 25) {
        ray.history.shift();
      }

      // Update line buffer with traveling tail
      const posAttr = ray.mesh.geometry.attributes.position;
      const arr = posAttr.array;
      for (let h = 0; h < 25; h++) {
        const p = ray.history[Math.min(h, ray.history.length - 1)];
        arr[h * 3] = p.x;
        arr[h * 3 + 1] = p.y;
        arr[h * 3 + 2] = p.z;
      }
      posAttr.needsUpdate = true;
    }
    for (let i = this.stellarDebris.length - 1; i >= 0; i--) {
      const debris = this.stellarDebris[i];
      const age = (now - debris.createdAt) / 1000;
      if (age > 6.0) {
        this.scene.remove(debris.mesh);
        debris.mesh.geometry.dispose();
        debris.mesh.material.dispose();
        this.stellarDebris.splice(i, 1);
        continue;
      }

      const posAttr = debris.mesh.geometry.attributes.position;
      const positions = posAttr.array;
      const count = positions.length / 3;

      for (let p = 0; p < count; p++) {
        const px = positions[p * 3];
        const py = positions[p * 3 + 1];
        const pz = positions[p * 3 + 2];
        const r = Math.sqrt(px * px + py * py + pz * pz);

        if (r > 1.3 * this.params.mass) {
          // Strong General Relativistic gravity acceleration: a = G*M / r^2.2
          const accelMag = (55.0 * this.params.mass) / Math.pow(r, 2.2);
          const vel = debris.velocities[p];
          vel.x += (-px / r) * accelMag * 0.016;
          vel.y += (-py / r) * accelMag * 0.016;
          vel.z += (-pz / r) * accelMag * 0.016;

          // Tidal elongation (spaghettification along radial vector)
          positions[p * 3] += vel.x * 0.016;
          positions[p * 3 + 1] += vel.y * 0.016;
          positions[p * 3 + 2] += vel.z * 0.016;
        } else {
          // Captured inside event horizon: vanish into singularity
          positions[p * 3] = 0;
          positions[p * 3 + 1] = 0;
          positions[p * 3 + 2] = 0;
          debris.velocities[p].set(0, 0, 0);
        }
      }
      posAttr.needsUpdate = true;
      if (age > 4.5) {
        debris.mesh.material.opacity = (6.0 - age) / 1.5;
      }
    }

    const delta = this.clock.getDelta();
    // Update General Relativistic Time Dilation
    this.coordinateTime += delta;
    const rs = 1.5 * this.params.mass;
    const rProbe = this.probeRadius * this.params.mass;
    // dtau = dt * sqrt(1 - rs / r)
    const dilationRatio = Math.sqrt(Math.max(0.01, 1.0 - (rs / rProbe)));
    this.probeTime += delta * dilationRatio;

    if (this.onTimeDilationUpdate) {
      this.onTimeDilationUpdate({
        coordinateTime: this.coordinateTime,
        probeTime: this.probeTime,
        dilationRatio: dilationRatio
      });
    }

    // Multi-Body Spacetime Gravity Sandbox N-Body Physics Solver
    for (let i = 0; i < this.multiBodies.length; i++) {
      const b1 = this.multiBodies[i];
      // Central black hole gravity
      const rCenter = b1.pos.length();
      const accelCenter = (32.0 * this.params.mass) / Math.max(1.0, rCenter * rCenter);
      b1.vel.add(b1.pos.clone().negate().normalize().multiplyScalar(accelCenter * delta));

      // Inter-body gravitational attraction between custom singularities
      for (let j = i + 1; j < this.multiBodies.length; j++) {
        const b2 = this.multiBodies[j];
        const diff = b2.pos.clone().sub(b1.pos);
        const dist = Math.max(0.5, diff.length());
        const force = (12.0 * b1.mass * b2.mass) / (dist * dist);
        const dir = diff.normalize();

        b1.vel.add(dir.clone().multiplyScalar((force / b1.mass) * delta));
        b2.vel.add(dir.clone().negate().multiplyScalar((force / b2.mass) * delta));
      }

      b1.pos.add(b1.vel.clone().multiplyScalar(delta));
      b1.group.position.copy(b1.pos);
    }

    if (this.params.mode === 'wormhole' && this.wormholeThroat) {
      this.wormholeThroat.material.uniforms.uTime.value = now * 0.001;
      this.wormholeThroat.material.uniforms.uLensing.value = this.params.lensing;
    }

    if (this.params.mode === 'binary' && this.binaryGroup) {
      // Binary orbital decay and inspiral: omega proportional to r^(-1.5)
      this.binarySeparation = 2.5 + Math.sin(now * 0.001) * 0.8;
      const omega = (3.5 * this.params.spin) * Math.pow(this.binarySeparation, -1.5);
      this.binaryTheta += delta * omega;

      const r = this.binarySeparation;
      this.bh1.position.set(r * Math.cos(this.binaryTheta), 0, r * Math.sin(this.binaryTheta));
      this.bh2.position.set(-r * Math.cos(this.binaryTheta), 0, -r * Math.sin(this.binaryTheta));

      if (this.gwWaves) {
        this.gwWaves.material.uniforms.uTime.value = now * 0.003;
      }
    }

    this.updateAudioParams();

    if (this.accretionDisk && this.accretionDisk.visible) {
      // Keplerian Velocity: omega = v / r = sqrt(G*M/r^3) -> omega proportional to M^0.5 * r^(-1.5)
      const baseSpeed = 1.8 * Math.sqrt(this.params.mass) * this.params.spin;

      const colorsAttr = this.accretionDisk.geometry.attributes.color;
      const colors = colorsAttr.array;

      for (let i = 0; i < this.particleCount; i++) {
        const r = this.diskRadii[i];
        const omega = baseSpeed * Math.pow(r, -1.5);
        this.diskAngles[i] += delta * omega;

        const theta = this.diskAngles[i];
        const px = r * Math.cos(theta);
        const pz = r * Math.sin(theta);

        this.diskPositions[i * 3] = px;
        this.diskPositions[i * 3 + 2] = pz;

        // Line-of-sight velocity toward observer for relativistic Doppler shift
        const vTangentialX = -pz * omega;
        const dopplerFactor = Math.min(Math.max(vTangentialX * 0.15, -0.35), 0.35);

        const ratio = (r - 2.2) / 4.8;
        const baseHue = ratio < 0.3 ? (0.55 + ratio * 0.1) : (0.08 - (ratio - 0.3) * 0.05);
        const shiftedHue = THREE.MathUtils.clamp(baseHue + dopplerFactor * 0.1, 0.0, 0.7);
        const lightness = THREE.MathUtils.clamp(0.55 + dopplerFactor * 0.3, 0.2, 0.95);

        const color = new THREE.Color();
        color.setHSL(shiftedHue, 0.95, lightness);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }

      this.accretionDisk.geometry.attributes.position.needsUpdate = true;
      this.accretionDisk.geometry.attributes.color.needsUpdate = true;
    }

    if (this.isPilotMode) {
      // General Relativistic Flight Controls & Orbital Physics
      const thrust = new THREE.Vector3();
      const forwardDir = new THREE.Vector3();
      this.camera.getWorldDirection(forwardDir);
      const rightDir = new THREE.Vector3().crossVectors(forwardDir, this.camera.up).normalize();

      if (this.keys.forward) thrust.add(forwardDir.clone().multiplyScalar(18.0));
      if (this.keys.backward) thrust.add(forwardDir.clone().multiplyScalar(-14.0));
      if (this.keys.right) thrust.add(rightDir.clone().multiplyScalar(12.0));
      if (this.keys.left) thrust.add(rightDir.clone().multiplyScalar(-12.0));
      if (this.keys.up) thrust.add(this.camera.up.clone().multiplyScalar(12.0));
      if (this.keys.down) thrust.add(this.camera.up.clone().multiplyScalar(-12.0));

      // Gravitational pull toward singularity: a = - GM / r^2
      const pos = this.camera.position;
      const r = pos.length();
      const rs = 1.5 * this.params.mass;
      const gravity = pos.clone().negate().normalize().multiplyScalar((28.0 * this.params.mass) / Math.max(1.0, r * r));

      this.shipVelocity.add(thrust.multiplyScalar(delta));
      this.shipVelocity.add(gravity.multiplyScalar(delta));
      this.shipVelocity.multiplyScalar(0.98); // Space drag damping

      this.camera.position.add(this.shipVelocity.clone().multiplyScalar(delta));

      // Prevent falling completely through singularity (bounce/orbit)
      if (this.camera.position.length() < rs + 0.1) {
        this.camera.position.normalize().multiplyScalar(rs + 0.1);
        this.shipVelocity.multiplyScalar(-0.5);
      }

      // Relativistic Velocity Aberration: FOV expands/tunnels forward as speed approaches c
      this.shipSpeedC = Math.min(0.92, this.shipVelocity.length() / 25.0);
      this.camera.fov = 60.0 + this.shipSpeedC * 40.0; // Forward tunnel warping
      this.camera.updateProjectionMatrix();

      if (this.onFlightTelemetryUpdate) {
        this.onFlightTelemetryUpdate({
          speedC: this.shipSpeedC,
          proximityRs: r / rs
        });
      }
    } else if (this.isRecording) {
      this.recordTheta += delta * (Math.PI * 2 / 5.0); // 360 degrees in 5 seconds
      const radius = 12.0;
      this.camera.position.x = radius * Math.sin(this.recordTheta);
      this.camera.position.z = radius * Math.cos(this.recordTheta);
      this.camera.position.y = 4.0 + Math.sin(this.recordTheta * 2) * 1.5;
      this.camera.lookAt(0, 0, 0);
    } else if (this.controls) {
      this.controls.update();
    }

    if (this.isInfallActive) {
      // Infalling Astronaut Geodesic Descent (r -> Rs)
      this.infallRadius -= delta * 1.8;
      const rs = 1.5 * this.params.mass;
      if (this.infallRadius < rs + 0.05) {
        this.infallRadius = 14.0; // Reset infall cycle
      }

      this.infallCamera.position.set(0, 0.4, this.infallRadius);
      this.infallCamera.lookAt(0, 0, 0);

      // Scissor Split Screen: Left = Distant Observer, Right = Infalling Astronaut
      const width = window.innerWidth;
      const height = window.innerHeight;
      const halfWidth = width / 2;

      this.renderer.setScissorTest(true);

      // View 1: Left Viewport (Distant Coordinate Observer)
      this.renderer.setViewport(0, 0, halfWidth, height);
      this.renderer.setScissor(0, 0, halfWidth, height);
      this.camera.aspect = halfWidth / height;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);

      // View 2: Right Viewport (Infalling Astronaut POV)
      this.renderer.setViewport(halfWidth, 0, halfWidth, height);
      this.renderer.setScissor(halfWidth, 0, halfWidth, height);
      this.infallCamera.aspect = halfWidth / height;
      this.infallCamera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.infallCamera);

      this.renderer.setScissorTest(false);
    } else {
      this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }
  }

  toggleInfallView() {
    this.isInfallActive = !this.isInfallActive;
    this.infallRadius = 14.0;
    return this.isInfallActive;
  }
}
