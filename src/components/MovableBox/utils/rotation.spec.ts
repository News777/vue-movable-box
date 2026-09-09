import { describe, expect, it } from 'vitest';
import { deltaToLocal, normalizeAngle, rotatedAABB } from './rotation';

describe('rotation utilities', () => {
  it('normalizes angles into (-180, 180] and rejects non-finite values', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(45)).toBe(45);
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(365)).toBe(5);
    expect(normalizeAngle(-90)).toBe(-90);
    expect(normalizeAngle(-450)).toBe(-90);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(270)).toBe(-90);
    expect(normalizeAngle('bad')).toBe(0);
    expect(normalizeAngle(undefined)).toBe(0);
  });

  it('keeps the AABB identical for zero rotation', () => {
    const rect = { left: 10, top: 20, width: 100, height: 50 };
    expect(rotatedAABB(rect, 0)).toEqual({ ...rect });
  });

  it('swaps width and height for a quarter turn and keeps the center', () => {
    const rect = { left: 10, top: 20, width: 100, height: 50 };
    const aabb = rotatedAABB(rect, 90);
    // Center (60, 45); the AABB shrinks to 50x100 around the same center.
    expect(aabb).toEqual({ left: 35, top: -5, width: 50, height: 100 });
    expect(aabb.left + aabb.width / 2).toBeCloseTo(rect.left + rect.width / 2);
    expect(aabb.top + aabb.height / 2).toBeCloseTo(rect.top + rect.height / 2);
  });

  it('computes the 45-degree AABB from both axes', () => {
    const rect = { left: 0, top: 0, width: 100, height: 40 };
    const aabb = rotatedAABB(rect, 45);
    const expected = 100 * Math.SQRT1_2 + 40 * Math.SQRT1_2;
    expect(aabb.width).toBeCloseTo(expected, 6);
    expect(aabb.height).toBeCloseTo(expected, 6);
    // Centers stay put: (50, 20).
    expect(aabb.left).toBeCloseTo(50 - expected / 2, 6);
    expect(aabb.top).toBeCloseTo(20 - expected / 2, 6);
  });

  it('maps screen deltas into local space for resize handles', () => {
    expect(deltaToLocal(20, 0, 0)).toEqual({ x: 20, y: 0 });
    // Screen right at 90 degrees is local up (negative y) for the br handle.
    expect(deltaToLocal(20, 0, 90)).toEqual({ x: 0, y: -20 });
    // Screen down at 90 degrees is local right.
    expect(deltaToLocal(0, 20, 90)).toEqual({ x: 20, y: 0 });
    expect(deltaToLocal(10, 10, -90)).toEqual({ x: -10, y: 10 });
  });
});
