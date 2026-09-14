import { describe, expect, it } from 'vitest';
import { anchorLocal, localToWorld, resizeWithFixedAnchor } from './fixed-anchor';
import type { HandlePosition } from '../../../types/MovableBox';

const START = { left: 10, top: 20, width: 100, height: 50 };

describe('resizeWithFixedAnchor', () => {
  it('keeps the opposite corner anchored for an unrotated box', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 30, y: 20 }
    });
    expect(result.width).toBeCloseTo(130, 6);
    expect(result.height).toBeCloseTo(70, 6);
    // The top-left anchor does not move.
    expect(result.left).toBeCloseTo(START.left, 6);
    expect(result.top).toBeCloseTo(START.top, 6);
  });

  it('keeps the rotated anchor corner pinned at its world position', () => {
    const angle = 30;
    const before = localToWorld(START, angle, 'center', { x: 0, y: 0 });
    const result = resizeWithFixedAnchor({
      start: START,
      angle,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 40, y: 10 }
    });
    const after = localToWorld(result, angle, 'center', { x: 0, y: 0 });
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
    // The dragged corner follows the pointer delta in world space.
    const dragged = localToWorld(result, angle, 'center', {
      x: result.width,
      y: result.height
    });
    const startDragged = localToWorld(START, angle, 'center', {
      x: START.width,
      y: START.height
    });
    expect(dragged.x - startDragged.x).toBeCloseTo(40, 4);
    expect(dragged.y - startDragged.y).toBeCloseTo(10, 4);
  });

  it('pins the opposite edge midpoint for edge handles and keeps the other axis', () => {
    const angle = 45;
    const anchorBefore = localToWorld(START, angle, 'center', { x: 0, y: START.height / 2 });
    const result = resizeWithFixedAnchor({
      start: START,
      angle,
      originSpec: 'center',
      handle: 'mr',
      pointerDelta: { x: 30, y: 30 }
    });
    expect(result.height).toBeCloseTo(START.height, 6);
    const anchorAfter = localToWorld(result, angle, 'center', { x: 0, y: result.height / 2 });
    expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 6);
    expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 6);
  });

  it('respects min and max size limits', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: -95, y: -45 },
      minWidth: 20,
      minHeight: 20
    });
    expect(result.width).toBe(20);
    expect(result.height).toBe(20);
    const maxed = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 500, y: 500 },
      maxWidth: 200,
      maxHeight: 100
    });
    expect(maxed.width).toBe(200);
    expect(maxed.height).toBe(100);
  });

  it('keeps the ratio locked while anchoring', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 60, y: 5 },
      ratio: 2
    });
    expect(result.width / result.height).toBeCloseTo(2, 6);
    const anchor = localToWorld(START, 0, 'center', { x: 0, y: 0 });
    const anchorAfter = localToWorld(result, 0, 'center', { x: 0, y: 0 });
    expect(anchorAfter.x).toBeCloseTo(anchor.x, 6);
    expect(anchorAfter.y).toBeCloseTo(anchor.y, 6);
  });

  it('does not exceed max width when the locked ratio conflicts with min height', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 100, y: 0 },
      minHeight: 80,
      maxWidth: 100,
      ratio: 2
    });

    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
    expect(result.left).toBe(START.left);
    expect(result.top).toBe(START.top);
  });

  it('does not exceed max height when the locked ratio conflicts with min width', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'br',
      pointerDelta: { x: 0, y: 100 },
      minWidth: 160,
      maxHeight: 50,
      ratio: 2
    });

    expect(result.width).toBe(100);
    expect(result.height).toBe(50);
    expect(result.left).toBe(START.left);
    expect(result.top).toBe(START.top);
  });

  it('leaves the non-dragged dimension untouched for middle handles', () => {
    const result = resizeWithFixedAnchor({
      start: START,
      angle: 0,
      originSpec: 'center',
      handle: 'tm' as HandlePosition,
      pointerDelta: { x: 0, y: -20 }
    });
    // The top edge follows the upward pointer, growing the box upward.
    expect(result.width).toBeCloseTo(START.width, 6);
    expect(result.height).toBeCloseTo(START.height + 20, 6);
    expect(result.top).toBeCloseTo(START.top - 20, 6);
  });

  it.each([
    ['tl', -1, -1],
    ['tm', 0, -1],
    ['tr', 1, -1],
    ['ml', -1, 0],
    ['mr', 1, 0],
    ['bl', -1, 1],
    ['bm', 0, 1],
    ['br', 1, 1]
  ] as const)('keeps the %s anchor stable with a non-center origin', (handle, xSign, ySign) => {
    const angle = 37;
    const radians = (angle * Math.PI) / 180;
    const localChange = { x: xSign * 20, y: ySign * 10 };
    const pointerDelta = {
      x: localChange.x * Math.cos(radians) - localChange.y * Math.sin(radians),
      y: localChange.x * Math.sin(radians) + localChange.y * Math.cos(radians)
    };
    const before = localToWorld(
      START,
      angle,
      '25% 75%',
      anchorLocal(handle, START.width, START.height)
    );
    const result = resizeWithFixedAnchor({
      start: START,
      angle,
      originSpec: '25% 75%',
      handle,
      pointerDelta
    });
    const after = localToWorld(
      result,
      angle,
      '25% 75%',
      anchorLocal(handle, result.width, result.height)
    );

    expect(result.width).toBeCloseTo(START.width + Math.abs(xSign) * 20, 6);
    expect(result.height).toBeCloseTo(START.height + Math.abs(ySign) * 10, 6);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
  });
});
