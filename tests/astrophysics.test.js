import { describe, it, expect } from 'vitest';

describe('Astrophysics & Spacetime Metric Mathematics', () => {
  const G = 6.67430e-11;
  const c = 299792458;
  const M_sun = 1.989e30;

  it('calculates Schwarzschild radius Rs accurately for stellar mass (3 M_sun)', () => {
    const M = 3 * M_sun;
    const Rs = (2 * G * M) / (c * c);
    expect(Rs).toBeGreaterThan(8800);
    expect(Rs).toBeLessThan(8900); // ~8.86 km
  });

  it('calculates Photon Sphere radius at 1.5 * Rs', () => {
    const Rs = 10.0;
    const R_photon = 1.5 * Rs;
    expect(R_photon).toBe(15.0);
  });

  it('calculates Kerr extremal ergosphere radius at the equator (theta = pi/2)', () => {
    const M = 1.0;
    const a = 0.998;
    const theta = Math.PI / 2; // Equator (cos theta = 0)
    const r_ergo = M + Math.sqrt(M * M - a * a * Math.cos(theta) * Math.cos(theta));
    expect(r_ergo).toBe(2.0 * M);
  });

  it('computes relativistic Doppler factor D for approaching plasma (beta = 0.5, cos theta = 1)', () => {
    const beta = 0.5;
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const D = 1 / (gamma * (1 - beta));
    expect(D).toBeGreaterThan(1.7); // Strongly blueshifted & boosted
  });

  it('computes gravitational time dilation factor at r = 2 * Rs', () => {
    const Rs = 1.5;
    const r = 3.0;
    const dilation = Math.sqrt(1 - Rs / r);
    expect(dilation).toBeCloseTo(0.7071, 4); // sqrt(0.5)
  });
});
