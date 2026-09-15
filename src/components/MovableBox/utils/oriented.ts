/**
 * Oriented (rotated) rectangle geometry in a single pixel coordinate space.
 *
 * The precise collision pipeline represents both the moving box and every target as an
 * `OrientedRect`: position, size, rotation angle, and transform origin. Interactions are
 * resolved against the true rotated contours:
 * - static overlap uses the separating axis theorem (edge contact is not overlap);
 * - translation uses continuous collision detection: the sweep of the moving rectangle is
 *   intersected with the Minkowski sum of the target and the reflected rectangle, giving
 *   the exact earliest contact along the whole motion segment (not just its endpoints);
 * - size and angle changes walk the change path with obstacle-aware sampling plus
 *   bisection refinement, because no closed-form solver exists for those sweeps. Sampling
 *   density adapts to the path length and the thinnest target, so crossings that span
 *   more than the per-sample step are caught mid-path; grazing crossings shallower than
 *   the per-sample step can still slip through (up to the step cap) and stay separated,
 *   so nothing re-detects them — the cap knowingly trades that residual risk for a
 *   bounded worst-case cost.
 */

import { angleToRadians, normalizeAngle, type TransformOrigin } from './rotation';

export interface OrientedRect {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  origin: TransformOrigin;
  /** Stable identifier carried through to collision event payloads. */
  id?: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface AxisRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Penetrations thinner than this (px) and grazing contacts count as separated. */
const EPSILON = 1e-7;

const clean = (value: number) => Math.round(value * 1e9) / 1e9;

const cleanPoint = (point: Vec2): Vec2 => ({ x: clean(point.x), y: clean(point.y) });

/**
 * World-space corners of the rotated rectangle. Wound in element-local order so the
 * interior lies on the `cross(edge, p - edgeStart) > 0` side of every edge — the same
 * convention `convexHull` output follows, which `clipConvex` and the sweep rely on.
 */
export const orientedCorners = (rect: OrientedRect): Vec2[] => {
  const angle = normalizeAngle(rect.angle);
  const rad = angleToRadians(angle);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const originX = rect.origin.x;
  const originY = rect.origin.y;
  const locals: Vec2[] = [
    { x: 0, y: 0 },
    { x: rect.width, y: 0 },
    { x: rect.width, y: rect.height },
    { x: 0, y: rect.height }
  ];
  return locals.map(point => {
    const dx = point.x - originX;
    const dy = point.y - originY;
    return cleanPoint({
      x: rect.left + originX + dx * cos - dy * sin,
      y: rect.top + originY + dx * sin + dy * cos
    });
  });
};

/** Axis-aligned bounding box of the rotated rectangle. */
export const orientedAABB = (rect: OrientedRect): AxisRect => {
  if (normalizeAngle(rect.angle) === 0) {
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  }
  const corners = orientedCorners(rect);
  const xs = corners.map(point => point.x);
  const ys = corners.map(point => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    left: minX,
    top: minY,
    width: clean(Math.max(...xs) - minX),
    height: clean(Math.max(...ys) - minY)
  };
};

// Target rectangles are stable between cache invalidations, so their broad-phase boxes
// are memoized: group-wide sweeps re-probe every target on every frame.
const aabbCache = new WeakMap<OrientedRect, AxisRect>();

export const orientedAABBCached = (rect: OrientedRect): AxisRect => {
  let box = aabbCache.get(rect);
  if (!box) {
    box = orientedAABB(rect);
    aabbCache.set(rect, box);
  }
  return box;
};

const cross = (a: Vec2, b: Vec2) => a.x * b.y - a.y * b.x;

const projectOntoAxis = (polygon: Vec2[], axis: Vec2): { min: number; max: number } => {
  let min = Infinity;
  let max = -Infinity;
  for (const point of polygon) {
    const projection = point.x * axis.x + point.y * axis.y;
    if (projection < min) min = projection;
    if (projection > max) max = projection;
  }
  return { min, max };
};

const polygonAxes = (polygon: Vec2[]): Vec2[] => {
  const axes: Vec2[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const next = polygon[(index + 1) % polygon.length];
    const edgeX = next.x - polygon[index].x;
    const edgeY = next.y - polygon[index].y;
    const length = Math.hypot(edgeX, edgeY);
    if (length < EPSILON) continue;
    axes.push({ x: -edgeY / length, y: edgeX / length });
  }
  return axes;
};

const centroidOf = (polygon: Vec2[]): Vec2 => ({
  x: polygon.reduce((sum, point) => sum + point.x, 0) / polygon.length,
  y: polygon.reduce((sum, point) => sum + point.y, 0) / polygon.length
});

/** Sutherland–Hodgman clipping of `subject` against the convex `clip` polygon interior. */
const clipConvex = (subject: Vec2[], clip: Vec2[]): Vec2[] => {
  let output = subject;
  for (let edgeIndex = 0; edgeIndex < clip.length && output.length > 0; edgeIndex += 1) {
    const current = clip[edgeIndex];
    const next = clip[(edgeIndex + 1) % clip.length];
    const edge: Vec2 = { x: next.x - current.x, y: next.y - current.y };
    const sideOf = (point: Vec2) => cross(edge, { x: point.x - current.x, y: point.y - current.y });
    const input = output;
    output = [];
    let previous = input[input.length - 1];
    let previousSide = sideOf(previous);
    for (const point of input) {
      const pointSide = sideOf(point);
      if (pointSide >= 0) {
        if (previousSide < 0) {
          const t = previousSide / (previousSide - pointSide);
          output.push({
            x: previous.x + (point.x - previous.x) * t,
            y: previous.y + (point.y - previous.y) * t
          });
        }
        output.push(point);
      } else if (previousSide >= 0) {
        const t = previousSide / (previousSide - pointSide);
        output.push({
          x: previous.x + (point.x - previous.x) * t,
          y: previous.y + (point.y - previous.y) * t
        });
      }
      previous = point;
      previousSide = pointSide;
    }
  }
  return output;
};

const polygonArea = (polygon: Vec2[]): number => {
  if (polygon.length < 3) return 0;
  let total = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const next = polygon[(index + 1) % polygon.length];
    total += polygon[index].x * next.y - next.x * polygon[index].y;
  }
  return Math.abs(total) / 2;
};

export interface OrientedOverlap {
  overlapping: boolean;
  /** Smallest separating-axis penetration depth in px. */
  depth: number;
  /** Unit contact normal pointing from the target polygon toward the moving polygon. */
  normal: Vec2 | null;
  /** Intersection area in px²; zero when separated or touching. */
  overlapArea: number;
}

/** Precise overlap test between two oriented rectangles. */
export const orientedOverlap = (moving: OrientedRect, target: OrientedRect): OrientedOverlap => {
  const movingCorners = orientedCorners(moving);
  const targetCorners = orientedCorners(target);
  let minDepth = Infinity;
  let normal: Vec2 | null = null;
  const movingCenter = centroidOf(movingCorners);
  const targetCenter = centroidOf(targetCorners);
  const axes = [...polygonAxes(targetCorners), ...polygonAxes(movingCorners)];
  for (const axis of axes) {
    const movingRange = projectOntoAxis(movingCorners, axis);
    const targetRange = projectOntoAxis(targetCorners, axis);
    const overlap =
      Math.min(movingRange.max, targetRange.max) - Math.max(movingRange.min, targetRange.min);
    if (overlap <= EPSILON) {
      return { overlapping: false, depth: 0, normal: null, overlapArea: 0 };
    }
    const improves = overlap < minDepth - EPSILON;
    // Depth ties prefer the more horizontal axis so `direction` matches the legacy
    // AABB semantics (horizontal wins when both separations are equal).
    const tieBreaks =
      !improves &&
      overlap <= minDepth + EPSILON &&
      (normal === null || Math.abs(axis.x) > Math.abs(normal.x));
    if (improves || tieBreaks) {
      minDepth = Math.min(minDepth, overlap);
      const sign =
        (movingCenter.x - targetCenter.x) * axis.x + (movingCenter.y - targetCenter.y) * axis.y >= 0
          ? 1
          : -1;
      normal = { x: axis.x * sign, y: axis.y * sign };
    }
  }
  const intersection = clipConvex(movingCorners, targetCorners);
  return {
    overlapping: true,
    depth: minDepth,
    normal: normal ?? { x: 0, y: 0 },
    overlapArea: polygonArea(intersection)
  };
};

/**
 * Convex hull via Andrew's monotone chain. The output winding places the interior on the
 * `cross(edge, p - edgeStart) > 0` side of every edge (matching `orientedCorners`).
 * Collinear points are removed.
 */
export const convexHull = (points: Vec2[]): Vec2[] => {
  const unique = Array.from(
    new Map(points.map(point => [`${point.x},${point.y}`, point])).values()
  ).sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (unique.length <= 2) return unique;
  const crossProduct = (origin: Vec2, a: Vec2, b: Vec2) =>
    (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
  const lower: Vec2[] = [];
  for (const point of unique) {
    while (
      lower.length >= 2 &&
      crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper: Vec2[] = [];
  for (let index = unique.length - 1; index >= 0; index -= 1) {
    const point = unique[index];
    while (
      upper.length >= 2 &&
      crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
};

/**
 * Set of translations `v` where the moved rectangle overlaps the target: the Minkowski sum
 * of the target polygon and the reflected moving polygon. Interior points are true
 * overlaps; boundary points are mere contacts.
 */
const minkowskiTranslationPolygon = (moving: OrientedRect, target: OrientedRect): Vec2[] => {
  const movingCorners = orientedCorners(moving);
  const targetCorners = orientedCorners(target);
  const sums: Vec2[] = [];
  for (const targetPoint of targetCorners) {
    for (const movingPoint of movingCorners) {
      sums.push({ x: targetPoint.x - movingPoint.x, y: targetPoint.y - movingPoint.y });
    }
  }
  return convexHull(sums);
};

export interface SweepInterval {
  entry: number;
  exit: number;
}

/**
 * Intersects the translation segment `delta * t, t in [0, 1]` with the interior of the
 * convex translation polygon. Returns null when the segment never enters the interior,
 * i.e. the motion stays free or merely grazes the contour.
 */
export const segmentInteriorInterval = (delta: Vec2, polygon: Vec2[]): SweepInterval | null => {
  if (polygon.length < 3) return null;
  let entry = 0;
  let exit = 1;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const edge: Vec2 = { x: next.x - current.x, y: next.y - current.y };
    // Interior condition: cross(edge, t*delta - current) > 0, i.e. t*deltaCross > offset.
    const deltaCross = cross(edge, delta);
    const offset = cross(edge, current);
    if (Math.abs(deltaCross) < EPSILON) {
      if (offset > -EPSILON) return null;
      continue;
    }
    const boundary = offset / deltaCross;
    if (deltaCross > 0) entry = Math.max(entry, boundary);
    else exit = Math.min(exit, boundary);
  }
  return entry < exit - EPSILON && exit > EPSILON && entry < 1 - EPSILON ? { entry, exit } : null;
};

export interface TranslationSweep {
  interval: SweepInterval;
  target: OrientedRect;
  targetId?: string;
}

/**
 * Continuous collision detection for a pure translation (sizes and angles constant).
 * Returns the overlap interval with the earliest entry across targets.
 */
export const sweepTranslation = (
  moving: OrientedRect,
  delta: Vec2,
  targets: OrientedRect[]
): TranslationSweep | null => {
  if (delta.x === 0 && delta.y === 0) return null;
  let first: TranslationSweep | null = null;
  const movingBox = orientedAABB(moving);
  for (const target of targets) {
    if (target.width <= 0 || target.height <= 0) continue;
    // Broad phase: moving AABB stretched along delta versus target AABB.
    const targetBox = orientedAABBCached(target);
    const overlapX =
      Math.min(
        movingBox.left + movingBox.width + Math.max(delta.x, 0),
        targetBox.left + targetBox.width
      ) - Math.max(movingBox.left + Math.min(delta.x, 0), targetBox.left);
    const overlapY =
      Math.min(
        movingBox.top + movingBox.height + Math.max(delta.y, 0),
        targetBox.top + targetBox.height
      ) - Math.max(movingBox.top + Math.min(delta.y, 0), targetBox.top);
    if (overlapX <= EPSILON || overlapY <= EPSILON) continue;
    const polygon = minkowskiTranslationPolygon(moving, target);
    const interval = segmentInteriorInterval(delta, polygon);
    if (interval && (!first || interval.entry < first.interval.entry)) {
      first = { interval, target, targetId: target.id };
    }
  }
  return first;
};

export const translateRect = (rect: OrientedRect, delta: Vec2): OrientedRect => ({
  ...rect,
  left: rect.left + delta.x,
  top: rect.top + delta.y
});

export const interpolateOriented = (
  from: OrientedRect,
  to: OrientedRect,
  progress: number
): OrientedRect => ({
  left: from.left + (to.left - from.left) * progress,
  top: from.top + (to.top - from.top) * progress,
  width: from.width + (to.width - from.width) * progress,
  height: from.height + (to.height - from.height) * progress,
  angle: from.angle + (to.angle - from.angle) * progress,
  origin: {
    x: from.origin.x + (to.origin.x - from.origin.x) * progress,
    y: from.origin.y + (to.origin.y - from.origin.y) * progress
  }
});

export const isPureTranslation = (from: OrientedRect, to: OrientedRect): boolean =>
  from.width === to.width &&
  from.height === to.height &&
  normalizeAngle(from.angle) === normalizeAngle(to.angle) &&
  from.origin.x === to.origin.x &&
  from.origin.y === to.origin.y;

/**
 * Gradual-escape rule for an initially overlapping state, expressed on overlap-area
 * totals: motion is only allowed while the overlap strictly shrinks. Inputs are
 * non-negative overlap areas; `fromOverlap === 0` means the previous state was fully
 * separated, in which case only a fully separated result is accepted. The per-target
 * refinement of this rule (no deepening penetration, no entering a new target) lives in
 * `escapeAllowed` in `useCollision`.
 */
export const escapeImproves = (fromOverlap: number, toOverlap: number): boolean =>
  fromOverlap > 0 ? toOverlap < fromOverlap : toOverlap === 0;

/**
 * True when `rect` overlaps any target's interior. A cached-AABB broad phase rejects
 * far-apart targets before the SAT runs: sampling loops probe every target on every step
 * (up to the step cap), and most probes in a large scene are rectangles that a four-way
 * comparison can dismiss. Callers that already hold the sample's AABB pass it as `box`
 * so a probe computes it once. Zero-area targets are skipped, matching
 * `sweepTranslation` (the SAT separates degenerate targets anyway — pure fast path).
 */
export const anyOrientedOverlap = (
  rect: OrientedRect,
  targets: OrientedRect[],
  box: AxisRect = orientedAABB(rect)
): boolean => {
  if (targets.length === 0) return false;
  for (const target of targets) {
    if (target.width <= 0 || target.height <= 0) continue;
    const targetBox = orientedAABBCached(target);
    const overlapX =
      Math.min(box.left + box.width, targetBox.left + targetBox.width) -
      Math.max(box.left, targetBox.left);
    const overlapY =
      Math.min(box.top + box.height, targetBox.top + targetBox.height) -
      Math.max(box.top, targetBox.top);
    if (overlapX <= 0 || overlapY <= 0) continue;
    if (orientedOverlap(rect, target).overlapping) return true;
  }
  return false;
};

/**
 * Uniform sampling plus bisection refinement over progress [0, 1] against a violation
 * predicate; returns the largest known-safe progress. Progress 0 must be safe; `steps`
 * is clamped to at least 1. A non-finite step count is a caller bug and fails closed
 * (progress 0): `Math.max(1, NaN)` would otherwise skip the walk and report the whole
 * path as safe.
 */
export const lastSafeProgress = (
  violates: (progress: number) => boolean,
  steps: number,
  refinements = 20
): number => {
  if (!Number.isFinite(steps)) return 0;
  const count = Math.max(1, Math.floor(steps));
  let safe = 0;
  let upper = 1;
  let blocked = false;
  for (let index = 1; index <= count; index += 1) {
    const progress = index / count;
    if (violates(progress)) {
      upper = progress;
      blocked = true;
      break;
    }
    safe = progress;
  }
  if (!blocked) return 1;
  for (let index = 0; index < refinements; index += 1) {
    const middle = (safe + upper) / 2;
    if (violates(middle)) upper = middle;
    else safe = middle;
  }
  return safe;
};

/**
 * Largest known-safe progress along the interpolation path from `from` to `to`. Progress 0
 * must be safe; callers handle an already-overlapping start before calling.
 */
export const resolvePathProgress = (
  from: OrientedRect,
  to: OrientedRect,
  targets: OrientedRect[]
): number => {
  if (targets.length === 0) return 1;
  if (isPureTranslation(from, to)) {
    const sweep = sweepTranslation(from, { x: to.left - from.left, y: to.top - from.top }, targets);
    if (!sweep) return 1;
    return Math.max(0, sweep.interval.entry - EPSILON);
  }
  const violates = (progress: number) =>
    anyOrientedOverlap(interpolateOriented(from, to, progress), targets);
  // Never shortcut on a safe endpoint: a size or angle change can sweep through an
  // obstacle mid-path and come out clear on the other side.
  return lastSafeProgress(violates, changePathStepCount(from, to, targets));
};

/** Smallest positive side across targets; Infinity when no target has area. */
const thinnestTargetSide = (targets: OrientedRect[]): number => {
  let thinnest = Infinity;
  for (const target of targets) {
    if (target.width <= 0 || target.height <= 0) continue;
    thinnest = Math.min(thinnest, target.width, target.height);
  }
  return thinnest;
};

const MIN_CHANGE_STEPS = 16;
const MAX_CHANGE_STEPS = 512;
const FALLBACK_STEP_SPAN = 8;

/**
 * Uniform-sample count for the change path from `from` to `to`. Every point of the
 * rectangle is a convex combination of its corners, so a bound on corner travel also
 * bounds the per-step travel of any point. Interpolation is linear in every field, so a
 * corner `pos + origin + R(angle)·(local − origin)` moves per unit progress by at most
 * |Δpos| + |Δorigin| + |Δlocal − Δorigin| + radius·|Δangle| (the pivot vector is linear
 * in progress, so its norm peaks at an endpoint). The origin terms matter: with a corner
 * origin a size change moves the far corner twice as far as the size delta alone.
 * Steps keep the per-step travel below a quarter of the thinnest target side, which
 * catches crossings that span a comparable fraction of the target; a grazing crossing
 * whose violation window along the path is thinner than the target's narrowest side
 * (diagonal sweeps against thin obstacles) can still slip between neighbors. The cap
 * bounds the worst-case cost for very long paths, where only such shallow crossings get
 * through.
 */
export const changePathStepCount = (
  from: OrientedRect,
  to: OrientedRect,
  targets: OrientedRect[]
): number => {
  const radiusAboutOrigin = (rect: OrientedRect, corner: Vec2) =>
    Math.hypot(corner.x - rect.left - rect.origin.x, corner.y - rect.top - rect.origin.y);
  const maxRadius = Math.max(
    ...orientedCorners(from).map(corner => radiusAboutOrigin(from, corner)),
    ...orientedCorners(to).map(corner => radiusAboutOrigin(to, corner))
  );
  const originShiftX = to.origin.x - from.origin.x;
  const originShiftY = to.origin.y - from.origin.y;
  const sizeShiftX = to.width - from.width;
  const sizeShiftY = to.height - from.height;
  // Local corner offsets are (0|width, 0|height), so their deltas are (0|Δwidth, 0|Δheight).
  const pivotShift = Math.max(
    Math.hypot(-originShiftX, -originShiftY),
    Math.hypot(sizeShiftX - originShiftX, -originShiftY),
    Math.hypot(-originShiftX, sizeShiftY - originShiftY),
    Math.hypot(sizeShiftX - originShiftX, sizeShiftY - originShiftY)
  );
  const travel =
    Math.abs(to.left - from.left) +
    Math.abs(to.top - from.top) +
    Math.hypot(originShiftX, originShiftY) +
    pivotShift +
    maxRadius * angleToRadians(Math.abs(to.angle - from.angle));
  if (!Number.isFinite(travel) || travel <= 0) return MIN_CHANGE_STEPS;
  const thinnest = thinnestTargetSide(targets);
  const stepSpan = Number.isFinite(thinnest) ? Math.max(1, thinnest / 4) : FALLBACK_STEP_SPAN;
  return Math.min(MAX_CHANGE_STEPS, Math.max(MIN_CHANGE_STEPS, Math.ceil(travel / stepSpan)));
};
