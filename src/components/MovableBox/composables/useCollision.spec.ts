import { describe, expect, it } from 'vitest';
import {
  directionFromNormal,
  escapeAllowed,
  overlapByTarget,
  useCollision
} from './useCollision';
import { translateRect, type OrientedRect } from '../utils/oriented';

const rect = (
  left: number,
  top: number,
  width: number,
  height: number,
  angle = 0
): OrientedRect => ({
  left,
  top,
  width,
  height,
  angle,
  origin: { x: width / 2, y: height / 2 }
});

describe('directionFromNormal', () => {
  it('maps axis normals onto the four-way direction vocabulary', () => {
    expect(directionFromNormal({ x: 1, y: 0 })).toBe('right');
    expect(directionFromNormal({ x: -1, y: 0 })).toBe('left');
    expect(directionFromNormal({ x: 0, y: 1 })).toBe('bottom');
    expect(directionFromNormal({ x: 0, y: -1 })).toBe('top');
  });

  it('breaks diagonal ties toward the horizontal axis like the legacy overlap rule', () => {
    // `Math.abs(x) >= Math.abs(y)` mirrors the legacy `overlapX <= overlapY` tie-break;
    // flipping the comparison would swap the reported direction on 45-degree contacts.
    expect(directionFromNormal({ x: Math.SQRT1_2, y: Math.SQRT1_2 })).toBe('right');
    expect(directionFromNormal({ x: -Math.SQRT1_2, y: Math.SQRT1_2 })).toBe('left');
    expect(directionFromNormal({ x: -Math.SQRT1_2, y: -Math.SQRT1_2 })).toBe('left');
    expect(directionFromNormal({ x: Math.SQRT1_2, y: -Math.SQRT1_2 })).toBe('right');
  });
});

describe('resolveOrientedTranslation escape clamping', () => {
  const collision = useCollision(() => ({ enabled: true, allowOverlap: false }));

  it('applies the full escape when the path stays clear of separated targets', () => {
    const box = rect(0, 0, 40, 40);
    const startTarget = rect(30, 0, 40, 40);
    const result = collision.resolveOrientedTranslation(
      box,
      translateRect(box, { x: -50, y: 0 }),
      [startTarget]
    );
    expect(result.accepted).toBe(true);
    expect(result.progress).toBe(1);
    expect(result.rect.left).toBe(-50);
  });

  it('stops an escaping box at the first separated target the path crosses', () => {
    // Regression: the escape branch compared endpoints only, so a start overlapping one
    // target could be dragged straight through a separated wall and end fully clear on
    // the far side of it in a single frame.
    const box = rect(0, 0, 40, 40);
    const startTarget = rect(30, 0, 40, 40);
    const wall = rect(200, 0, 20, 40);
    const result = collision.resolveOrientedTranslation(
      box,
      translateRect(box, { x: 400, y: 0 }),
      [startTarget, wall]
    );
    expect(result.accepted).toBe(true);
    // Contact when the right edge (40 + 400t) reaches the wall at 200: t = 0.4.
    expect(result.rect.left).toBeCloseTo(400 * (0.4 - 1e-3), 5);
    expect(result.rect.left).toBeLessThan(160);
    expect(result.progress).toBeLessThan(1);
  });

  it('rejects an escape whose contact point would deepen the start overlap', () => {
    // Escaping diagonally through the obstacle's interior: the endpoint clears both
    // targets, but the first contact with the separated wall sits deeper inside the
    // initially overlapped target than the start (100px² -> ~400px²), and the
    // per-target rule forbids materializing that deeper state.
    const box = rect(90, 90, 20, 20);
    const startTarget = rect(0, 0, 100, 100);
    const wall = rect(30, 55, 20, 20);
    const result = collision.resolveOrientedTranslation(
      box,
      translateRect(box, { x: -110, y: -110 }),
      [startTarget, wall]
    );
    expect(result.accepted).toBe(false);
    expect(result.rect.left).toBe(90);
    expect(result.progress).toBe(0);
    // The refused frame still reports a collision: the box is stuck against the wall
    // with its start overlap intact, not collision-free.
    expect(result.results.length).toBeGreaterThan(0);
    expect(collision.isColliding.value).toBe(true);
  });

  it('keeps the contact retreat under half a pixel on large single-frame deltas', () => {
    // A dropped frame can hand the resolver deltas of hundreds of pixels; a purely
    // proportional retreat (1e-3 of travel) would leave a visible 2px seam here.
    const box = rect(0, 0, 40, 40);
    const wall = rect(1000, 0, 20, 40);
    const result = collision.resolveOrientedTranslation(
      box,
      translateRect(box, { x: 2000, y: 0 }),
      [wall]
    );
    // Entry at (1000 - 40) / 2000 = 0.48; the gap is capped at an absolute 0.5px.
    expect(result.rect.left).toBeGreaterThan(959);
    expect(result.rect.left).toBeLessThanOrEqual(960);
  });
});

describe('resolveOrientedChange escape clamping', () => {
  const collision = useCollision(() => ({ enabled: true, allowOverlap: false }));

  it('stops a rotating escape at a separated target the sweep crosses', () => {
    // A 120x20 bar overlapping a small target at its right end rotates 90 degrees: the
    // endpoint escapes that overlap, but the right half sweeps across a separated wall
    // mid-turn and comes out clear — only the path crosses it.
    const bar = rect(0, 0, 120, 20);
    const startTarget = rect(80, 0, 30, 20);
    const wall = rect(95, 25, 15, 15);
    const to = { ...bar, angle: 90 };
    expect(overlapByTarget(to, [startTarget, wall]).size).toBe(0);

    const result = collision.resolveOrientedChange(bar, to, [startTarget, wall]);
    expect(result.accepted).toBe(true);
    expect(result.progress).toBeLessThan(1);
    expect(result.rect.angle).toBeGreaterThan(0);
    expect(result.rect.angle).toBeLessThan(90);
    expect(overlapByTarget(result.rect, [wall]).size).toBe(0);
  });
});

describe('overlapByTarget', () => {
  it('reports per-index areas for overlapping targets only', () => {
    const box = rect(0, 0, 40, 40);
    const overlapping = rect(30, 0, 40, 40); // 10 x 40 overlap
    const separated = rect(200, 200, 10, 10);
    const areas = overlapByTarget(box, [overlapping, separated]);
    expect(areas.size).toBe(1);
    expect(areas.get(0)).toBeCloseTo(400, 6);
  });

  it('skips zero-area targets', () => {
    const areas = overlapByTarget(rect(0, 0, 40, 40), [rect(10, 10, 20, 0)]);
    expect(areas.size).toBe(0);
  });
});

describe('escapeAllowed', () => {
  // Shared gradual-escape rule for initially overlapping states; reused by the
  // interaction pipeline, the rounded-rect write-back check, and group followers.
  const box = rect(0, 0, 40, 40);
  const startTarget = rect(30, 0, 40, 40); // overlaps the start box by 400
  // Spans the whole x range of every motion below, so only the y penetration changes.
  const deepeningTarget = rect(-1000, 30, 2000, 40); // overlaps the start box by 400

  it('allows a motion that strictly shrinks every overlap', () => {
    // Move left 5px: the start overlap halves, nothing else is touched.
    const to = translateRect(box, { x: -5, y: 0 });
    expect(
      escapeAllowed(overlapByTarget(box, [startTarget]), overlapByTarget(to, [startTarget]))
    ).toBe(true);
  });

  it('allows a motion that fully separates from every target', () => {
    const to = translateRect(box, { x: -45, y: 0 });
    expect(
      escapeAllowed(overlapByTarget(box, [startTarget]), overlapByTarget(to, [startTarget]))
    ).toBe(true);
  });

  it('rejects a motion that enters a previously separated target despite a shrinking total', () => {
    // Moving left escapes the start target (400 -> 0) but presses into a target that was
    // 40px away (0 -> 80). The total drops from 400 to 80, yet this is a new collision:
    // the total-only rule used to accept it.
    const newTarget = rect(-45, 0, 5, 40);
    const to = translateRect(box, { x: -42, y: 0 });
    const targets = [startTarget, newTarget];
    expect(overlapByTarget(to, targets).get(1)).toBeCloseTo(80, 6);
    expect(escapeAllowed(overlapByTarget(box, targets), overlapByTarget(to, targets))).toBe(false);
  });

  it('rejects a motion that deepens one penetration despite a shrinking total', () => {
    // Moving down-left leaves the start target entirely (400 -> 0) while sinking deeper
    // into the wide target below (400 -> 480); the total still shrinks (800 -> 480),
    // which the total-only rule used to accept.
    const to = translateRect(box, { x: -30, y: 2 });
    const targets = [startTarget, deepeningTarget];
    expect(overlapByTarget(to, targets).get(1)).toBeCloseTo(480, 6);
    expect(overlapByTarget(to, targets).has(0)).toBe(false);
    expect(escapeAllowed(overlapByTarget(box, targets), overlapByTarget(to, targets))).toBe(false);
  });

  it('keeps requiring full separation from an initially separated state', () => {
    const separated = translateRect(box, { x: -200, y: 0 });
    const entering = translateRect(separated, { x: 195, y: 0 });
    expect(overlapByTarget(entering, [startTarget]).size).toBe(1);
    expect(
      escapeAllowed(
        overlapByTarget(separated, [startTarget]),
        overlapByTarget(entering, [startTarget])
      )
    ).toBe(false);
    const staying = translateRect(separated, { x: -10, y: 0 });
    expect(
      escapeAllowed(
        overlapByTarget(separated, [startTarget]),
        overlapByTarget(staying, [startTarget])
      )
    ).toBe(true);
  });

  describe('with rotated targets', () => {
    // A 45-degree square whose left tip pokes into the box's right edge.
    const rotatedTarget = rect(30, 0, 40, 40, 45);
    const rotatedBox = rect(0, 0, 40, 40);

    it('allows shrinking the overlap with a rotated target', () => {
      const fromAreas = overlapByTarget(rotatedBox, [rotatedTarget]);
      const escaped = translateRect(rotatedBox, { x: -5, y: 0 });
      const deepened = translateRect(rotatedBox, { x: 5, y: 0 });
      const escapedArea = overlapByTarget(escaped, [rotatedTarget]).get(0) ?? 0;
      const deepenedArea = overlapByTarget(deepened, [rotatedTarget]).get(0) ?? 0;
      expect(escapedArea).toBeLessThan(fromAreas.get(0)!);
      expect(deepenedArea).toBeGreaterThan(fromAreas.get(0)!);
      expect(escapeAllowed(fromAreas, overlapByTarget(escaped, [rotatedTarget]))).toBe(true);
      expect(escapeAllowed(fromAreas, overlapByTarget(deepened, [rotatedTarget]))).toBe(false);
    });

    it('rejects trading a rotated escape for a newly entered rotated target', () => {
      // Moving left escapes the 45-degree target (335px² tip overlap shrinks to 69px²)
      // while a separated 45-degree target's right tip enters the box (69px²). The total
      // shrinks, but the entry is a new collision under the per-target rule.
      const entering = rect(-50, 0, 40, 40, 45);
      const targets = [rotatedTarget, entering];
      const fromAreas = overlapByTarget(rotatedBox, targets);
      const to = translateRect(rotatedBox, { x: -10, y: 0 });
      const toAreas = overlapByTarget(to, targets);
      expect(fromAreas.get(0)!).toBeGreaterThan(toAreas.get(0)!);
      expect(toAreas.has(1)).toBe(true);
      expect(escapeAllowed(fromAreas, toAreas)).toBe(false);
      // Without the second target the same motion is a plain escape.
      expect(
        escapeAllowed(
          overlapByTarget(rotatedBox, [rotatedTarget]),
          overlapByTarget(to, [rotatedTarget])
        )
      ).toBe(true);
    });
  });
});
