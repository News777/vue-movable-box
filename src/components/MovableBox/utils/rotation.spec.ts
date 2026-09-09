import { describe, expect, it } from 'vitest';
import {
  deltaToLocal,
  normalizeAngle,
  resolveTransformOrigin,
  rotatedAABB,
  rotatedAABBAt
} from './rotation';

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

  it('resolves transform-origin keywords, percentages, and lengths', () => {
    expect(resolveTransformOrigin('center', 120, 80)).toEqual({ x: 60, y: 40 });
    expect(resolveTransformOrigin('', 120, 80)).toEqual({ x: 60, y: 40 });
    expect(resolveTransformOrigin('nonsense', 120, 80)).toEqual({ x: 60, y: 40 });
    expect(resolveTransformOrigin('top left', 120, 80)).toEqual({ x: 0, y: 0 });
    expect(resolveTransformOrigin('left', 120, 80)).toEqual({ x: 0, y: 40 });
    expect(resolveTransformOrigin('bottom', 120, 80)).toEqual({ x: 60, y: 80 });
    expect(resolveTransformOrigin('50% 25%', 120, 80)).toEqual({ x: 60, y: 20 });
    expect(resolveTransformOrigin('10px 20px', 120, 80)).toEqual({ x: 10, y: 20 });
    expect(resolveTransformOrigin('100% 100%', 120, 80)).toEqual({ x: 120, y: 80 });
    // A third (z) token is ignored; unitless prefixes of other units parse as numbers;
    // calc() cannot parse and falls back to center.
    expect(resolveTransformOrigin('50% 50% 5px', 120, 80)).toEqual({ x: 60, y: 40 });
    expect(resolveTransformOrigin('5rem center', 120, 80)).toEqual({ x: 5, y: 40 });
    expect(resolveTransformOrigin('calc(50%) top', 120, 80)).toEqual({ x: 60, y: 40 });
  });

  it('shifts the AABB for non-center transform origins and keeps translation equivariant', () => {
    const rect = { left: 100, top: 100, width: 120, height: 80 };
    const origin = resolveTransformOrigin('top left', rect.width, rect.height);
    const visual = rotatedAABBAt(rect, 90, origin);
    // Hand-computed corners rotated about (100, 100): x in [20, 100], y in [100, 220].
    expect(visual).toEqual({ left: 20, top: 100, width: 80, height: 120 });

    // Same geometry shifted by (10, 10): the AABB shifts 1:1.
    const moved = rotatedAABBAt({ ...rect, left: 110, top: 110 }, 90, origin);
    expect(moved).toEqual({ left: 30, top: 110, width: 80, height: 120 });

    // Center origin matches the plain center AABB.
    const center = resolveTransformOrigin('center', rect.width, rect.height);
    expect(rotatedAABBAt(rect, 90, center)).toEqual(rotatedAABB(rect, 90));
  });
});
