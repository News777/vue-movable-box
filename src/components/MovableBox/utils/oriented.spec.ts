import { describe, expect, it } from 'vitest';
import {
  anyOrientedOverlap,
  changePathStepCount,
  convexHull,
  escapeImproves,
  interpolateOriented,
  isPureTranslation,
  lastSafeProgress,
  orientedAABB,
  orientedCorners,
  orientedOverlap,
  resolvePathProgress,
  segmentInteriorInterval,
  sweepTranslation,
  type OrientedRect
} from './oriented';

const rect = (
  left: number,
  top: number,
  width: number,
  height: number,
  angle = 0,
  origin?: { x: number; y: number }
): OrientedRect => ({
  left,
  top,
  width,
  height,
  angle,
  origin: origin ?? { x: width / 2, y: height / 2 }
});

const expectPointClose = (point: { x: number; y: number }, x: number, y: number) => {
  expect(point.x).toBeCloseTo(x, 6);
  expect(point.y).toBeCloseTo(y, 6);
};

describe('oriented rectangle geometry', () => {
  it('computes the AABB of a 45-degree rotated square', () => {
    const box = orientedAABB(rect(0, 0, 100, 100, 45));
    expect(box.left).toBeCloseTo(-20.71, 2);
    expect(box.top).toBeCloseTo(-20.71, 2);
    expect(box.width).toBeCloseTo(141.42, 2);
    expect(box.height).toBeCloseTo(141.42, 2);
  });

  it('keeps corners exact at right angles', () => {
    const corners = orientedCorners(rect(10, 10, 100, 50, 90));
    expectPointClose(corners[0], 85, -15);
    expectPointClose(corners[1], 85, 85);
    expectPointClose(corners[2], 35, 85);
    expectPointClose(corners[3], 35, -15);
  });

  it('shifts corners for a non-center transform origin', () => {
    const centered = orientedCorners(rect(0, 0, 100, 100, 90));
    const cornerOrigin = orientedCorners(rect(0, 0, 100, 100, 90, { x: 0, y: 0 }));
    expectPointClose(centered[0], 100, 0);
    // Rotating about the top-left corner keeps it fixed.
    expectPointClose(cornerOrigin[0], 0, 0);
    expectPointClose(cornerOrigin[1], 0, 100);
  });
});

describe('oriented overlap (SAT)', () => {
  it('reports the roadmap false-positive case as separated', () => {
    // AABBs overlap, but the rotated 100x100 contour stays clear of the tiny box.
    const moving = rect(-20, -20, 5, 5);
    const target = rect(0, 0, 100, 100, 45);
    expect(orientedOverlap(moving, target).overlapping).toBe(false);
  });

  it('reports the roadmap missed-case as overlapping', () => {
    // The rotated target's true contour reaches the moving box; ignoring the target
    // angle (legacy AABB mode) misses this collision.
    const moving = rect(110, 45, 5, 10);
    const target = rect(0, 0, 100, 100, 45);
    const overlap = orientedOverlap(moving, target);
    expect(overlap.overlapping).toBe(true);
    expect(overlap.normal).not.toBeNull();
    expect(overlap.overlapArea).toBeGreaterThan(0);
  });

  it('does not treat edge contact as overlap', () => {
    const moving = rect(0, 0, 10, 10);
    const target = rect(10, 0, 10, 10, 0);
    expect(orientedOverlap(moving, target).overlapping).toBe(false);
  });

  it('detects vertex touch of a rotated target as separated', () => {
    // The moving box's bottom-left corner rests exactly on the diamond's top vertex.
    const moving = rect(50, -40.7106781, 20, 20);
    const target = rect(0, 0, 100, 100, 45);
    expect(orientedOverlap(moving, target).overlapping).toBe(false);
  });

  it('points the normal from the target toward the moving box', () => {
    const moving = rect(70, 0, 20, 20);
    const target = rect(50, 0, 40, 20, 0);
    const overlap = orientedOverlap(moving, target);
    expect(overlap.overlapping).toBe(true);
    const centerDelta = { x: 80 - 70, y: 10 - 10 };
    const dot = overlap.normal!.x * centerDelta.x + overlap.normal!.y * centerDelta.y;
    expect(dot).toBeGreaterThan(0);
  });

  it('computes the intersection area of two overlapping squares', () => {
    const overlap = orientedOverlap(rect(0, 0, 20, 20), rect(10, 10, 20, 20));
    expect(overlap.overlapArea).toBeCloseTo(100, 6);
  });
});

describe('translation sweeps', () => {
  it('finds the contact interval along a straight approach', () => {
    const from = rect(0, 0, 50, 50);
    const target = { ...rect(60, 0, 50, 50), id: 'wall' };
    const sweep = sweepTranslation(from, { x: 100, y: 0 }, [target]);
    expect(sweep).not.toBeNull();
    expect(sweep!.interval.entry).toBeCloseTo(0.1, 6);
    expect(sweep!.targetId).toBe('wall');
  });

  it('returns null when the path never overlaps', () => {
    const from = rect(0, 0, 50, 50);
    const sweep = sweepTranslation(from, { x: 100, y: 0 }, [rect(200, 0, 50, 50)]);
    expect(sweep).toBeNull();
  });

  it('catches a high-speed crossing where both endpoints stay safe', () => {
    const from = rect(0, 0, 10, 10);
    const target = rect(50, 0, 20, 20);
    const sweep = sweepTranslation(from, { x: 100, y: 0 }, [target]);
    expect(sweep).not.toBeNull();
    expect(sweep!.interval.entry).toBeGreaterThan(0);
    expect(sweep!.interval.entry).toBeLessThan(1);
  });

  it('sweeps against rotated targets with continuous collision detection', () => {
    // Moving square passes through the diamond's right corner region.
    const from = rect(-60, 40, 10, 10);
    const target = rect(0, 0, 100, 100, 45);
    const sweep = sweepTranslation(from, { x: 160, y: 0 }, [target]);
    expect(sweep).not.toBeNull();
    expect(sweep!.interval.entry).toBeGreaterThan(0);
    expect(sweep!.interval.entry).toBeLessThan(1);
  });

  it('treats a grazing pass as free motion', () => {
    const from = rect(0, 0, 10, 10);
    // The path touches the target's edge exactly at the end.
    const sweep = sweepTranslation(from, { x: 40, y: 0 }, [rect(50, 0, 20, 20)]);
    expect(sweep).toBeNull();
  });

  it('picks the earliest interval across multiple targets', () => {
    const from = rect(0, 0, 10, 10);
    const sweep = sweepTranslation(from, { x: 100, y: 0 }, [
      { ...rect(80, 0, 10, 10), id: 'far' },
      { ...rect(40, 0, 10, 10), id: 'near' }
    ]);
    expect(sweep!.targetId).toBe('near');
  });

  it('skips zero-area targets while sweeping', () => {
    // Same geometry as the contacting case minus the target's height: a degenerate
    // target never blocks the sweep, matching the aabb pipeline's validation rule.
    const from = rect(0, 0, 50, 50);
    const delta = { x: 100, y: 0 };
    expect(sweepTranslation(from, delta, [rect(60, 0, 50, 0)])).toBeNull();
    expect(sweepTranslation(from, delta, [rect(60, 0, 50, 1)])).not.toBeNull();
  });

  it('clips a segment against a convex polygon interior', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 }
    ];
    // A segment along the square's bottom edge stays on the boundary: never inside.
    expect(segmentInteriorInterval({ x: 10, y: 0 }, square)).toBeNull();
    // A wholly separate segment never enters.
    expect(segmentInteriorInterval({ x: 0, y: -20 }, square)).toBeNull();
    // A diagonal through the square spans the whole parameter range.
    const diagonal = segmentInteriorInterval({ x: 10, y: 10 }, square);
    expect(diagonal).not.toBeNull();
    expect(diagonal!.entry).toBeCloseTo(0, 6);
    expect(diagonal!.exit).toBeCloseTo(1, 6);
    // A segment starting inside an off-origin square exits through its right edge.
    const shifted = [
      { x: -5, y: -5 },
      { x: 5, y: -5 },
      { x: 5, y: 5 },
      { x: -5, y: 5 }
    ];
    const exiting = segmentInteriorInterval({ x: 10, y: 0 }, shifted);
    expect(exiting).not.toBeNull();
    expect(exiting!.entry).toBeCloseTo(0, 6);
    expect(exiting!.exit).toBeCloseTo(0.5, 6);
  });
});

describe('change path resolution', () => {
  it('resolves a pure translation with the exact sweep', () => {
    const from = rect(0, 0, 20, 20);
    const to = rect(60, 0, 20, 20);
    const progress = resolvePathProgress(from, to, [rect(40, 0, 20, 20)]);
    // Contact when the moving left edge reaches the target's left edge: t = 20/60.
    expect(progress).toBeCloseTo(1 / 3, 3);
  });

  it('blocks a resize before it reaches a rotated target', () => {
    const from = rect(0, 0, 50, 50);
    const to = rect(0, 0, 200, 50);
    const target = rect(150, 0, 100, 100, 45);
    const progress = resolvePathProgress(from, to, [target]);
    expect(progress).toBeLessThan(1);
    expect(progress).toBeGreaterThan(0);
  });

  it('blocks a resize whose endpoints are safe but whose midpoint collides', () => {
    // A horizontal bar morphing into a vertical bar sweeps its corner region through
    // the target even though both end states stay clear.
    const from = rect(0, 0, 100, 10);
    const to = rect(0, 0, 10, 100);
    const progress = resolvePathProgress(from, to, [rect(40, 40, 20, 20)]);
    expect(progress).toBeGreaterThan(0.2);
    expect(progress).toBeLessThan(0.5);
  });

  it('allows a size change with clear air all the way', () => {
    const from = rect(0, 0, 50, 50);
    const to = rect(0, 0, 80, 50);
    const progress = resolvePathProgress(from, to, [rect(500, 500, 20, 20)]);
    expect(progress).toBe(1);
  });

  it('returns an unblocked path immediately when there are no targets', () => {
    expect(resolvePathProgress(rect(0, 0, 10, 10), rect(100, 0, 4, 10), [])).toBe(1);
  });

  it('samples densely enough to catch a thin obstacle on a long change path', () => {
    // Regression: a fixed 16-sample walk straddled this 10px crossing window (progress
    // 0.482 to 0.498) and tunneled the narrow box through the 6px target.
    const from = rect(0, 0, 4, 40);
    const to = rect(600, 0, 4.5, 41);
    const target = rect(293, 0, 6, 40);
    const progress = resolvePathProgress(from, to, [target]);
    // Contact begins when the moving right edge reaches 293, i.e. left 289: t = 289/600.
    expect(progress).toBeGreaterThan(0.47);
    expect(progress).toBeLessThan(0.483);
    const stopped = interpolateOriented(from, to, progress);
    expect(orientedOverlap(stopped, target).overlapping).toBe(false);
  });

  it('densifies sampling when a rotation arc could step over a thin obstacle', () => {
    // A 1000x8 bar rotating 30 degrees about its center sweeps its ends along a ~500px
    // radius (~262px of arc); per-sample travel must shrink below a quarter of the 8px
    // target, far beyond the previous fixed 16 samples.
    const bar = (angle: number) => rect(0, 0, 1000, 8, angle);
    const target = rect(1200, -4, 8, 8);
    expect(changePathStepCount(bar(0), bar(30), [target])).toBeGreaterThan(48);
    // Short paths keep the cheap baseline.
    expect(changePathStepCount(rect(0, 0, 40, 40), rect(10, 0, 44, 41), [target])).toBe(16);
  });

  it('accounts for the transform origin when a size change moves the far corners', () => {
    // Growing 100x100 -> 300x300 about the top-left corner only carries the pivot term
    // (~283px of far-corner travel). About the bottom-right corner the origin itself also
    // travels ~283px, and the bound sums the |Δorigin| and pivot terms conservatively, so
    // the step count doubles — denser sampling than the geometry strictly needs, bounded
    // by the step cap; the size deltas alone would have under-counted that case.
    const target = rect(1000, 0, 8, 8);
    const topLeft = changePathStepCount(
      rect(0, 0, 100, 100, 0, { x: 0, y: 0 }),
      rect(0, 0, 300, 300, 0, { x: 0, y: 0 }),
      [target]
    );
    const bottomRight = changePathStepCount(
      rect(0, 0, 100, 100, 0, { x: 100, y: 100 }),
      rect(0, 0, 300, 300, 0, { x: 300, y: 300 }),
      [target]
    );
    expect(topLeft).toBe(Math.ceil(Math.hypot(200, 200) / 2));
    expect(bottomRight).toBe(Math.ceil((2 * Math.hypot(200, 200)) / 2));
    expect(bottomRight).toBeGreaterThan(topLeft * 1.9);
  });

  it('interpolates oriented rectangles linearly', () => {
    const from = rect(0, 0, 100, 100, 0, { x: 50, y: 50 });
    const to = rect(10, 20, 200, 300, 90, { x: 100, y: 150 });
    const middle = interpolateOriented(from, to, 0.5);
    expect(middle.left).toBe(5);
    expect(middle.top).toBe(10);
    expect(middle.width).toBe(150);
    expect(middle.angle).toBe(45);
  });

  it('classifies pure translations', () => {
    expect(isPureTranslation(rect(0, 0, 10, 10), rect(5, 5, 10, 10))).toBe(true);
    expect(isPureTranslation(rect(0, 0, 10, 10), rect(5, 5, 12, 10))).toBe(false);
  });
});

describe('convex hull', () => {
  it('returns the hull of a point cloud wound for interior tests', () => {
    const hull = convexHull([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 5, y: 5 },
      { x: 5, y: -2 }
    ]);
    expect(hull).toHaveLength(5);
    expect(hull).toContainEqual({ x: 5, y: -2 });
  });
});

describe('gradual escape rule', () => {
  it('requires strictly shrinking overlap from an overlapping start', () => {
    expect(escapeImproves(10, 5)).toBe(true);
    expect(escapeImproves(10, 10)).toBe(false);
    expect(escapeImproves(10, 12)).toBe(false);
  });

  it('requires full separation from a separated start', () => {
    expect(escapeImproves(0, 0)).toBe(true);
    expect(escapeImproves(0, 3)).toBe(false);
  });
});

describe('last safe progress walk', () => {
  it('returns 1 when no sampled progress violates', () => {
    expect(lastSafeProgress(() => false, 16)).toBe(1);
  });

  it('bisects toward the first violating boundary', () => {
    // Violation starts exactly at progress 0.5: the walk must stop just before it.
    const progress = lastSafeProgress(step => step >= 0.5, 16);
    expect(progress).toBeLessThan(0.5);
    expect(progress).toBeGreaterThanOrEqual(0.5 - 1 / 16);
  });

  it('clamps the step count to at least one sample', () => {
    expect(lastSafeProgress(() => false, 0)).toBe(1);
    expect(lastSafeProgress(() => true, 0)).toBe(0);
  });

  it('fails closed on a non-finite step count', () => {
    // `Math.max(1, NaN)` is NaN, and a NaN loop bound would skip the walk entirely and
    // report the whole path as safe — the guard keeps a bad step count at progress 0.
    expect(lastSafeProgress(() => false, Number.NaN)).toBe(0);
    expect(lastSafeProgress(() => true, Number.NaN)).toBe(0);
    expect(lastSafeProgress(() => false, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('anyOrientedOverlap broad phase', () => {
  it('matches the per-target SAT verdict for overlapping and separated rectangles', () => {
    const box = rect(0, 0, 40, 40, 30);
    const overlapping = rect(30, 10, 20, 20, 70);
    const separated = rect(200, 200, 20, 20);
    expect(anyOrientedOverlap(box, [separated, overlapping])).toBe(true);
    expect(anyOrientedOverlap(box, [separated])).toBe(false);
    expect(anyOrientedOverlap(box, [])).toBe(false);
  });

  it('rejects AABB-overlapping rectangles whose rotated contours stay separated', () => {
    // Two parallel 45-degree bars staggered along their shared axis: their AABBs overlap
    // (the broad phase passes the pair through) but the contours stay ~7.7px apart, so
    // the SAT must reject the pair — the pre-filter may never widen the verdict.
    const bar = rect(0, 0, 100, 10, 45);
    const target = rect(25, 0, 100, 10, 45);
    const barBox = orientedAABB(bar);
    const targetBox = orientedAABB(target);
    expect(
      Math.min(barBox.left + barBox.width, targetBox.left + targetBox.width) -
        Math.max(barBox.left, targetBox.left)
    ).toBeGreaterThan(0);
    expect(
      Math.min(barBox.top + barBox.height, targetBox.top + targetBox.height) -
        Math.max(barBox.top, targetBox.top)
    ).toBeGreaterThan(0);
    expect(anyOrientedOverlap(bar, [target])).toBe(false);
  });

  it('skips zero-area targets like the translation sweep does', () => {
    const box = rect(0, 0, 40, 40);
    const degenerate = rect(10, 10, 20, 0);
    expect(anyOrientedOverlap(box, [degenerate])).toBe(false);
    // The SAT already separates degenerate targets, so the skip is a pure fast path.
    expect(orientedOverlap(box, degenerate).overlapping).toBe(false);
  });

  it('accepts a precomputed sample AABB without changing the verdict', () => {
    const box = rect(0, 0, 40, 40, 30);
    const overlapping = rect(30, 10, 20, 20, 70);
    expect(anyOrientedOverlap(box, [overlapping], orientedAABB(box))).toBe(true);
    expect(anyOrientedOverlap(box, [], orientedAABB(box))).toBe(false);
  });
});
