import { ref } from 'vue';
import {
  checkAllCollisions,
  findFirstCollisionPathInterval,
  getDominantCollision,
  getTotalOverlapArea,
  type CollisionResult
} from '../utils/collision';
import {
  escapeImproves,
  interpolateOriented,
  isPureTranslation,
  orientedOverlap,
  resolvePathProgress,
  sweepTranslation,
  translateRect,
  type OrientedRect,
  type Vec2
} from '../utils/oriented';
import type { CollisionDirection, SnapTarget } from '../../../types/MovableBox';

export type CollisionMode = 'precise' | 'aabb';

interface UseCollisionOptions {
  enabled: boolean;
  allowOverlap: boolean;
}

export interface OrientedCollisionResult extends CollisionResult {
  /** Unit contact normal in container pixel space, pointing from target to box. */
  normal?: Vec2;
}

interface NumericRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

type CollisionResolution = 'path' | 'slide';

const interpolateRect = (from: NumericRect, to: NumericRect, progress: number): NumericRect => ({
  left: from.left + (to.left - from.left) * progress,
  top: from.top + (to.top - from.top) * progress,
  width: from.width + (to.width - from.width) * progress,
  height: from.height + (to.height - from.height) * progress
});

const sameRect = (first: NumericRect, second: NumericRect) =>
  first.left === second.left &&
  first.top === second.top &&
  first.width === second.width &&
  first.height === second.height;

const resolveAlongPath = (
  previous: NumericRect,
  candidate: NumericRect,
  targets: SnapTarget[],
  normalize: (rect: NumericRect) => NumericRect
) => {
  if (!findFirstCollisionPathInterval(previous, candidate, targets)) {
    return { rect: candidate, progress: 1 };
  }

  let lower = 0;
  let upper = 1;
  let resolved = previous;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const progress = (lower + upper) / 2;
    const current = normalize(interpolateRect(previous, candidate, progress));
    if (!findFirstCollisionPathInterval(previous, current, targets)) {
      resolved = current;
      lower = progress;
    } else {
      upper = progress;
    }
  }
  return { rect: resolved, progress: lower };
};

/** Maps a contact normal onto the legacy four-way direction vocabulary. */
export const directionFromNormal = (normal: Vec2): CollisionDirection =>
  Math.abs(normal.x) >= Math.abs(normal.y)
    ? normal.x > 0
      ? 'right'
      : 'left'
    : normal.y > 0
      ? 'bottom'
      : 'top';

const roundedNormal = (normal: Vec2): Vec2 => ({
  x: Math.round(normal.x * 1e4) / 1e4,
  y: Math.round(normal.y * 1e4) / 1e4
});

/**
 * Retreat fraction along the incoming motion that keeps a resolved contact strictly
 * outside the obstacle. The leftover gap must stay sub-pixel whatever the frame's
 * travel: a purely proportional retreat leaves a visible seam on the large single-frame
 * deltas a dropped frame can produce, so the fraction is capped at an absolute 0.5px.
 */
const contactRetreat = (travel: number, entry: number): number =>
  Math.min(1e-3, 0.5 / Math.max(1, travel), entry);

interface CollisionSummary {
  results: OrientedCollisionResult[];
  dominant: OrientedCollisionResult | null;
  totalOverlapArea: number;
}

const summarize = (results: OrientedCollisionResult[]): CollisionSummary => ({
  results,
  dominant: getDominantCollision(results),
  totalOverlapArea: getTotalOverlapArea(results)
});

/** Overlap area per still-overlapping target, keyed by the target's array index. */
export const overlapByTarget = (
  rect: OrientedRect,
  targets: OrientedRect[]
): Map<number, number> => {
  const areas = new Map<number, number>();
  targets.forEach((target, index) => {
    if (target.width <= 0 || target.height <= 0) return;
    const overlap = orientedOverlap(rect, target);
    if (overlap.overlapping) areas.set(index, overlap.overlapArea);
  });
  return areas;
};

/**
 * Gradual-escape rule for an initially overlapping state: total overlap must shrink,
 * no existing penetration may deepen, and no previously separated target may be entered.
 */
export const escapeAllowed = (
  fromAreas: Map<number, number>,
  toAreas: Map<number, number>
): boolean => {
  let fromTotal = 0;
  fromAreas.forEach(area => {
    fromTotal += area;
  });
  let toTotal = 0;
  for (const [index, area] of toAreas) {
    toTotal += area;
    const previous = fromAreas.get(index);
    if (previous === undefined || area > previous) return false;
  }
  return escapeImproves(fromTotal, toTotal);
};

/**
 * Targets the box did not overlap at the start of the motion; index keys match
 * `overlapByTarget`.
 */
export const separatedTargets = (
  targets: OrientedRect[],
  fromAreas: Map<number, number>
): OrientedRect[] => targets.filter((_, index) => !fromAreas.has(index));

interface OrientedResolution {
  accepted: boolean;
  rect: OrientedRect;
  progress: number;
  results: OrientedCollisionResult[];
  dominant: OrientedCollisionResult | null;
  totalOverlapArea: number;
}

const sameOrientedPosition = (first: OrientedRect, second: OrientedRect) =>
  first.left === second.left &&
  first.top === second.top &&
  first.width === second.width &&
  first.height === second.height;

export function useCollision(getOptions: () => UseCollisionOptions) {
  const collisions = ref<OrientedCollisionResult[]>([]);
  const isColliding = ref(false);

  const setCollisionResults = (results: OrientedCollisionResult[]): CollisionSummary => {
    collisions.value = results;
    isColliding.value = results.length > 0;
    return summarize(results);
  };

  /** Legacy AABB evaluation; kept for `collisionMode="aabb"`. */
  const evaluate = (rect: NumericRect, targets: SnapTarget[]) => {
    const options = getOptions();
    const results = options.enabled ? checkAllCollisions(rect, targets) : [];
    return setCollisionResults(results);
  };

  /** Precise oriented evaluation against true rotated contours. */
  const evaluateOriented = (rect: OrientedRect, targets: OrientedRect[]): CollisionSummary => {
    const options = getOptions();
    if (!options.enabled) return setCollisionResults([]);
    const results: OrientedCollisionResult[] = [];
    for (const target of targets) {
      if (target.width <= 0 || target.height <= 0) continue;
      const overlap = orientedOverlap(rect, target);
      if (!overlap.overlapping) continue;
      results.push({
        colliding: true,
        direction: overlap.normal ? directionFromNormal(overlap.normal) : undefined,
        normal: overlap.normal ? roundedNormal(overlap.normal) : undefined,
        overlap: overlap.depth,
        overlapArea: overlap.overlapArea,
        targetId: target.id
      });
    }
    return setCollisionResults(results);
  };

  /**
   * Precise translation resolution: exact continuous sweep with tangent sliding, so a box
   * dragged against a rotated edge keeps moving along that edge instead of stopping dead.
   */
  const resolveOrientedTranslation = (
    from: OrientedRect,
    to: OrientedRect,
    targets: OrientedRect[]
  ): OrientedResolution => {
    const options = getOptions();
    const candidateState = evaluateOriented(to, targets);
    if (!options.enabled || options.allowOverlap) {
      return { accepted: true, rect: to, progress: 1, ...candidateState };
    }

    const fromAreas = overlapByTarget(from, targets);
    if (fromAreas.size > 0) {
      // Initial overlap: allow gradual escape only, never a deeper penetration and
      // never entering a target that was previously separated.
      const allowed = escapeAllowed(fromAreas, overlapByTarget(to, targets));
      if (!allowed) {
        return { accepted: false, rect: from, progress: 0, ...candidateState };
      }
      // The endpoint escapes, but the motion may still cross a target that was
      // separated at the start: sweep those targets and clamp to the first contact,
      // exactly like the separated-start path below, instead of applying the whole
      // delta in one frame.
      const delta: Vec2 = { x: to.left - from.left, y: to.top - from.top };
      const sweep =
        delta.x === 0 && delta.y === 0
          ? null
          : sweepTranslation(from, delta, separatedTargets(targets, fromAreas));
      if (!sweep) {
        return { accepted: true, rect: to, progress: 1, ...candidateState };
      }
      const retreat = contactRetreat(Math.hypot(delta.x, delta.y), sweep.interval.entry);
      const contactProgress = Math.max(0, sweep.interval.entry - retreat);
      const contact = translateRect(from, {
        x: delta.x * contactProgress,
        y: delta.y * contactProgress
      });
      // Report from just past the contact: the frame was stopped by the separated
      // target, even while the box still overlaps where it started. The dominant entry
      // is the largest overlap, which can be the start overlap rather than the blocker.
      const witness = translateRect(from, {
        x: delta.x * (sweep.interval.entry + (sweep.interval.exit - sweep.interval.entry) * 0.001),
        y: delta.y * (sweep.interval.entry + (sweep.interval.exit - sweep.interval.entry) * 0.001)
      });
      const witnessState = evaluateOriented(witness, targets);
      // The contact may sit deeper inside the initially overlapped targets than the
      // start — escape overlap is not monotone along the path — and materializing a
      // deeper state is exactly what the per-target rule forbids. Refuse the frame in
      // that case: only the endpoints of the clamped motion ever materialize, so the
      // mid-path deepening of a through-exit stays acceptable while a deeper landing
      // does not. The refused frame still reports the blocking contact — spreading the
      // cleared endpoint's empty state would claim "no collision" on a stuck box.
      if (!escapeAllowed(fromAreas, overlapByTarget(contact, targets))) {
        const rejectState =
          witnessState.results.length > 0 ? witnessState : evaluateOriented(from, targets);
        return { accepted: false, rect: from, progress: 0, ...rejectState };
      }
      const finalState =
        witnessState.results.length > 0 ? witnessState : evaluateOriented(contact, targets);
      // Edge note: for an extremely thin blocking target the 0.001 witness factor can
      // land below the SAT epsilon, and a contact already clear of every start overlap
      // then reports no collision on a stopped frame — same edge as the separated-start
      // path's flush-contact reporting.
      return {
        accepted: !sameOrientedPosition(contact, from),
        rect: contact,
        progress: contactProgress,
        ...finalState
      };
    }

    const delta: Vec2 = { x: to.left - from.left, y: to.top - from.top };
    if (delta.x === 0 && delta.y === 0) {
      return { accepted: true, rect: to, progress: 1, ...candidateState };
    }

    const sweep = sweepTranslation(from, delta, targets);
    if (!sweep) {
      return { accepted: true, rect: to, progress: 1, ...candidateState };
    }

    const { interval } = sweep;
    // Retreat a hair along the incoming motion so the contact position sits strictly
    // outside the obstacle: sliding sweeps that start exactly on the contact boundary
    // are numerically ambiguous, and the gap stays sub-pixel after rounding.
    const retreat = contactRetreat(Math.hypot(delta.x, delta.y), interval.entry);
    const contact = translateRect(from, {
      x: delta.x * (interval.entry - retreat),
      y: delta.y * (interval.entry - retreat)
    });
    // Push a hair past contact to recover the blocking edge normal for sliding.
    const witness = translateRect(from, {
      x: delta.x * (interval.entry + (interval.exit - interval.entry) * 0.001),
      y: delta.y * (interval.entry + (interval.exit - interval.entry) * 0.001)
    });
    const witnessOverlap = orientedOverlap(witness, sweep.target);
    const remaining: Vec2 = {
      x: delta.x * (1 - interval.entry),
      y: delta.y * (1 - interval.entry)
    };

    // Slides advance as far as the sweep allows: a wall that ends mid-slide yields a
    // partial move, and the unconsumed residual motion is retried on each axis.
    const slideResult = (origin: OrientedRect, direction: Vec2): OrientedRect => {
      const slide = sweepTranslation(origin, direction, targets);
      if (!slide) return translateRect(origin, direction);
      const retreatT = contactRetreat(Math.hypot(direction.x, direction.y), slide.interval.entry);
      return translateRect(origin, {
        x: direction.x * (slide.interval.entry - retreatT),
        y: direction.y * (slide.interval.entry - retreatT)
      });
    };

    let resolved = contact;
    const normal = witnessOverlap.normal;
    if (normal) {
      const tangent: Vec2 = { x: -normal.y, y: normal.x };
      const alignment = tangent.x * remaining.x + tangent.y * remaining.y;
      const sign = alignment >= 0 ? 1 : -1;
      if (Math.abs(alignment) > 1e-9) {
        resolved = slideResult(resolved, {
          x: tangent.x * sign * Math.abs(alignment),
          y: tangent.y * sign * Math.abs(alignment)
        });
      }
    }
    const consumed: Vec2 = { x: resolved.left - contact.left, y: resolved.top - contact.top };
    // Residual axis retries only continue the original motion direction; a tangent that
    // moved opposite an axis must not drag the box backwards along it.
    const residualX = remaining.x - consumed.x;
    const residualY = remaining.y - consumed.y;
    if (residualX !== 0 && Math.sign(residualX) === Math.sign(remaining.x)) {
      resolved = slideResult(resolved, { x: residualX, y: 0 });
    }
    if (residualY !== 0 && Math.sign(residualY) === Math.sign(remaining.y)) {
      resolved = slideResult(resolved, { x: 0, y: residualY });
    }

    const resolvedState = evaluateOriented(resolved, targets);
    // A box stopped flush against the obstacle does not overlap it, but the frame was
    // still blocked: report the collision from just past the contact point, matching the
    // legacy event semantics for constrained motion.
    const finalState =
      resolvedState.results.length > 0 ? resolvedState : evaluateOriented(witness, targets);
    const progress =
      delta.x * delta.x + delta.y * delta.y > 0
        ? ((resolved.left - from.left) * delta.x + (resolved.top - from.top) * delta.y) /
          (delta.x * delta.x + delta.y * delta.y)
        : 1;
    return {
      accepted: !sameOrientedPosition(resolved, from),
      rect: resolved,
      progress: Math.max(0, Math.min(1, progress)),
      ...finalState
    };
  };

  /**
   * Precise resolution for changes beyond pure translation (resize, rotation), walking the
   * whole interpolation path instead of only checking its end state.
   */
  const resolveOrientedChange = (
    from: OrientedRect,
    to: OrientedRect,
    targets: OrientedRect[]
  ): OrientedResolution => {
    const options = getOptions();
    const candidateState = evaluateOriented(to, targets);
    if (!options.enabled || options.allowOverlap) {
      return { accepted: true, rect: to, progress: 1, ...candidateState };
    }

    const fromAreas = overlapByTarget(from, targets);
    if (fromAreas.size > 0) {
      const allowed = escapeAllowed(fromAreas, overlapByTarget(to, targets));
      if (!allowed) {
        return { accepted: false, rect: from, progress: 0, ...candidateState };
      }
      // The endpoint escapes, but the change path (resize or rotation sweep) may still
      // cross a target that was separated at the start: clamp to the first contact
      // along the interpolation path, mirroring the translation escape clamp.
      const separated = separatedTargets(targets, fromAreas);
      const progress = separated.length > 0 ? resolvePathProgress(from, to, separated) : 1;
      if (progress >= 1) {
        return { accepted: true, rect: to, progress: 1, ...candidateState };
      }
      const resolved = interpolateOriented(from, to, progress);
      // Prefer the just-past-contact witness so the reported collision is the target
      // that stopped the frame, not the overlap the box started with.
      const witness = interpolateOriented(from, to, progress + (1 - progress) * 0.001);
      const witnessState = evaluateOriented(witness, targets);
      // Same no-deepening guard as the translation escape: a clamped landing deeper
      // inside the initially overlapped targets than the start is refused, reporting
      // the blocking contact rather than the cleared endpoint's empty state.
      if (!escapeAllowed(fromAreas, overlapByTarget(resolved, targets))) {
        const rejectState =
          witnessState.results.length > 0 ? witnessState : evaluateOriented(from, targets);
        return { accepted: false, rect: from, progress: 0, ...rejectState };
      }
      const finalState =
        witnessState.results.length > 0 ? witnessState : evaluateOriented(resolved, targets);
      return {
        accepted: progress > 0,
        rect: resolved,
        progress,
        ...finalState
      };
    }

    if (isPureTranslation(from, to)) {
      return resolveOrientedTranslation(from, to, targets);
    }

    const progress = resolvePathProgress(from, to, targets);
    const resolved = interpolateOriented(from, to, progress);
    const resolvedState = evaluateOriented(resolved, targets);
    // A path blocked before its end still interacted with an obstacle: report the
    // collision from a hair past the resolved progress when the endpoint itself is flush.
    let finalState = resolvedState;
    if (resolvedState.results.length === 0 && progress < 1) {
      const witness = interpolateOriented(from, to, progress + (1 - progress) * 0.001);
      finalState = evaluateOriented(witness, targets);
    }
    return {
      accepted: progress > 0,
      rect: resolved,
      progress,
      ...finalState
    };
  };

  const resolveCandidate = (
    candidate: NumericRect,
    previous: NumericRect,
    targets: SnapTarget[],
    normalize: (rect: NumericRect) => NumericRect = rect => rect,
    resolution: CollisionResolution = 'path'
  ) => {
    const options = getOptions();
    const candidateState = evaluate(candidate, targets);
    if (!options.enabled || options.allowOverlap) {
      return { accepted: true, rect: candidate, progress: 1, ...candidateState };
    }

    const previousResults = checkAllCollisions(previous, targets);
    const previousOverlap = getTotalOverlapArea(previousResults);
    if (previousOverlap > 0) {
      // Legacy mode keeps the pre-v3.2 total-only escape rule on purpose: this pipeline
      // exists so `collisionMode="aabb"` preserves the old behavior. The precise pipeline
      // above uses the stricter per-target `escapeAllowed` (no new targets, no deepening).
      return {
        accepted: escapeImproves(previousOverlap, candidateState.totalOverlapArea),
        rect: candidate,
        progress: 1,
        ...candidateState
      };
    }

    const pathInterval = findFirstCollisionPathInterval(previous, candidate, targets);
    if (candidateState.results.length === 0 && !pathInterval) {
      return { accepted: true, rect: candidate, progress: 1, ...candidateState };
    }

    let collisionState = candidateState;
    if (candidateState.results.length === 0 && pathInterval) {
      const witness = interpolateRect(
        previous,
        candidate,
        pathInterval.entry + (pathInterval.exit - pathInterval.entry) * 0.001
      );
      collisionState = setCollisionResults(checkAllCollisions(witness, targets));
    }

    let resolved: { rect: NumericRect; progress?: number } | null = null;
    if (resolution === 'slide') {
      const horizontal = resolveAlongPath(
        previous,
        { ...previous, left: candidate.left },
        targets,
        normalize
      );
      const vertical = resolveAlongPath(
        previous,
        { ...previous, top: candidate.top },
        targets,
        normalize
      );
      const sliding = normalize({
        ...candidate,
        left: horizontal.rect.left,
        top: vertical.rect.top
      });
      if (!findFirstCollisionPathInterval(previous, sliding, targets)) {
        resolved = { rect: sliding };
      }
    }

    resolved ??= resolveAlongPath(previous, candidate, targets, normalize);

    return {
      accepted: !sameRect(resolved.rect, previous),
      rect: resolved.rect,
      progress: resolved.progress,
      ...collisionState
    };
  };

  const clearCollisions = () => {
    collisions.value = [];
    isColliding.value = false;
  };

  return {
    collisions,
    isColliding,
    evaluate,
    evaluateOriented,
    resolveCandidate,
    resolveOrientedTranslation,
    resolveOrientedChange,
    clearCollisions
  };
}
