import { ref } from 'vue';
import {
  checkAllCollisions,
  findFirstCollisionPathInterval,
  getDominantCollision,
  getTotalOverlapArea,
  type CollisionResult
} from '../utils/collision';
import type { SnapTarget } from '../types';

interface UseCollisionOptions {
  enabled: boolean;
  allowOverlap: boolean;
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

export function useCollision(getOptions: () => UseCollisionOptions) {
  const collisions = ref<CollisionResult[]>([]);
  const isColliding = ref(false);

  const evaluate = (rect: NumericRect, targets: SnapTarget[]) => {
    const options = getOptions();
    const results = options.enabled ? checkAllCollisions(rect, targets) : [];
    collisions.value = results;
    isColliding.value = results.length > 0;
    return {
      results,
      dominant: getDominantCollision(results),
      totalOverlapArea: getTotalOverlapArea(results)
    };
  };

  const setCollisionResults = (results: CollisionResult[]) => {
    collisions.value = results;
    isColliding.value = results.length > 0;
    return {
      results,
      dominant: getDominantCollision(results),
      totalOverlapArea: getTotalOverlapArea(results)
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
      return {
        accepted: candidateState.totalOverlapArea < previousOverlap,
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

  return { collisions, isColliding, evaluate, resolveCandidate, clearCollisions };
}
