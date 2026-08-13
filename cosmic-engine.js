import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CosmicEngine {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.params = {
      mass: 1.0,
      spin: 1.0,
      lensing: 1.0,
      tilt: 25.0
    };

    this.initScene();
    this.createBlackHole();
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

    if (this.eventHorizon) {
      const scale = this.params.mass;
      this.eventHorizon.scale.set(scale, scale, scale);
      this.photonSphere.scale.set(scale, scale, scale);
      this.photonSphere.material.uniforms.uLensing.value = this.params.lensing;
    }

    if (this.accretionDisk) {
      this.accretionDisk.rotation.x = THREE.MathUtils.degToRad(this.params.tilt);
    }
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
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

    const delta = this.clock.getDelta();
    if (this.accretionDisk && this.diskPositions) {
      // Keplerian Velocity: omega = v / r = sqrt(G*M/r^3) -> omega proportional to M^0.5 * r^(-1.5)
      const baseSpeed = 1.8 * Math.sqrt(this.params.mass) * this.params.spin;

      for (let i = 0; i < this.particleCount; i++) {
        const r = this.diskRadii[i];
        const omega = baseSpeed * Math.pow(r, -1.5);
        this.diskAngles[i] += delta * omega;

        const theta = this.diskAngles[i];
        this.diskPositions[i * 3] = r * Math.cos(theta);
        this.diskPositions[i * 3 + 2] = r * Math.sin(theta);
      }

      this.accretionDisk.geometry.attributes.position.needsUpdate = true;
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
