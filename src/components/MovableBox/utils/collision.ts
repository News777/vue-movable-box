import type { CollisionDirection, SnapTarget } from '../types';

export interface CollisionResult {
  colliding: boolean;
  direction?: CollisionDirection;
  overlap?: number;
  overlapArea?: number;
  targetId?: string;
}

interface NumericRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const toFiniteNumber = (value: number | string): number | null => {
  if (typeof value === 'string' && value.trim() === '') return null;
  const converted = Number(value);
  return Number.isFinite(converted) ? converted : null;
};

export interface CollisionPathInterval {
  entry: number;
  exit: number;
}

const toNumericRect = (rect: SnapTarget): NumericRect | null => {
  const left = toFiniteNumber(rect.left);
  const top = toFiniteNumber(rect.top);
  const width = toFiniteNumber(rect.width);
  const height = toFiniteNumber(rect.height);
  if (left === null || top === null || width === null || height === null) return null;
  // Empty rectangles have no collision area. Ignoring them here keeps the path sweep
  // consistent with both `checkCollision` and the precise oriented collision pipeline.
  if (width <= 0 || height <= 0) return null;
  return { left, top, width, height };
};

/** Whether a public collision target describes a finite rectangle with positive area. */
export const isValidCollisionTarget = (target: SnapTarget): boolean =>
  toNumericRect(target) !== null;

const applyLessThan = (
  interval: CollisionPathInterval,
  from: number,
  to: number,
  limit: number
): CollisionPathInterval | null => {
  const delta = to - from;
  if (delta === 0) return from < limit ? interval : null;
  const boundary = (limit - from) / delta;
  return delta > 0
    ? { ...interval, exit: Math.min(interval.exit, boundary) }
    : { ...interval, entry: Math.max(interval.entry, boundary) };
};

const applyGreaterThan = (
  interval: CollisionPathInterval,
  from: number,
  to: number,
  limit: number
): CollisionPathInterval | null => {
  const delta = to - from;
  if (delta === 0) return from > limit ? interval : null;
  const boundary = (limit - from) / delta;
  return delta > 0
    ? { ...interval, entry: Math.max(interval.entry, boundary) }
    : { ...interval, exit: Math.min(interval.exit, boundary) };
};

const getCollisionPathInterval = (
  from: NumericRect,
  to: NumericRect,
  target: NumericRect
): CollisionPathInterval | null => {
  let interval: CollisionPathInterval | null = { entry: 0, exit: 1 };
  interval = applyLessThan(interval, from.left, to.left, target.left + target.width);
  if (!interval) return null;
  interval = applyGreaterThan(
    interval,
    from.left + from.width,
    to.left + to.width,
    target.left
  );
  if (!interval) return null;
  interval = applyLessThan(interval, from.top, to.top, target.top + target.height);
  if (!interval) return null;
  interval = applyGreaterThan(
    interval,
    from.top + from.height,
    to.top + to.height,
    target.top
  );
  if (!interval) return null;

  const entry = Math.max(0, interval.entry);
  const exit = Math.min(1, interval.exit);
  return entry < exit && exit > 0 && entry < 1 ? { entry, exit } : null;
};

export function findFirstCollisionPathInterval(
  from: NumericRect,
  to: NumericRect,
  targets: SnapTarget[]
): CollisionPathInterval | null {
  let first: CollisionPathInterval | null = null;
  for (const target of targets) {
    const rect = toNumericRect(target);
    if (!rect) continue;
    const interval = getCollisionPathInterval(from, to, rect);
    if (interval && (!first || interval.entry < first.entry)) first = interval;
  }
  return first;
}

export function checkCollision(rect1: NumericRect, rect2: NumericRect): CollisionResult {
  const overlapX =
    Math.min(rect1.left + rect1.width, rect2.left + rect2.width) -
    Math.max(rect1.left, rect2.left);
  const overlapY =
    Math.min(rect1.top + rect1.height, rect2.top + rect2.height) -
    Math.max(rect1.top, rect2.top);

  if (overlapX <= 0 || overlapY <= 0) return { colliding: false, overlapArea: 0 };

  const center1X = rect1.left + rect1.width / 2;
  const center1Y = rect1.top + rect1.height / 2;
  const center2X = rect2.left + rect2.width / 2;
  const center2Y = rect2.top + rect2.height / 2;
  const dx = center1X - center2X;
  const dy = center1Y - center2Y;
  const direction: CollisionDirection =
    overlapX <= overlapY ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'bottom' : 'top';

  return {
    colliding: true,
    direction,
    overlap: Math.min(overlapX, overlapY),
    overlapArea: overlapX * overlapY
  };
}

export function checkAllCollisions(
  current: NumericRect,
  targets: SnapTarget[],
  excludeId?: string
): CollisionResult[] {
  const results: CollisionResult[] = [];
  for (const target of targets) {
    if (excludeId && target.id === excludeId) continue;
    const rect = toNumericRect(target);
    if (!rect) continue;
    const result = checkCollision(current, rect);
    if (result.colliding) results.push({ ...result, targetId: target.id });
  }
  return results;
}

export function getDominantCollision(results: CollisionResult[]): CollisionResult | null {
  let dominant: CollisionResult | null = null;
  for (const result of results) {
    if (!dominant || (result.overlapArea ?? 0) > (dominant.overlapArea ?? 0)) dominant = result;
  }
  return dominant;
}

export const getTotalOverlapArea = (results: CollisionResult[]) =>
  results.reduce((total, result) => total + (result.overlapArea ?? 0), 0);

export function preventCollision(
  current: NumericRect,
  targets: NumericRect[],
  bounds?: { minLeft: number; maxLeft: number; minTop: number; maxTop: number }
): { left: number; top: number } {
  let next = { ...current };
  for (const target of targets) {
    const collision = checkCollision(next, target);
    if (!collision.colliding) continue;
    if (collision.direction === 'left') next.left = target.left - next.width;
    if (collision.direction === 'right') next.left = target.left + target.width;
    if (collision.direction === 'top') next.top = target.top - next.height;
    if (collision.direction === 'bottom') next.top = target.top + target.height;
  }
  if (bounds) {
    next.left = Math.max(bounds.minLeft, Math.min(bounds.maxLeft, next.left));
    next.top = Math.max(bounds.minTop, Math.min(bounds.maxTop, next.top));
  }
  return { left: next.left, top: next.top };
}

export function findNearestValidPosition(
  current: NumericRect,
  targets: NumericRect[],
  step = 10,
  maxIterations = 100
): { left: number; top: number; found: boolean } {
  let top = current.top;
  for (let index = 0; index < maxIterations; index += 1) {
    const colliding = targets.some(target => checkCollision({ ...current, top }, target).colliding);
    if (!colliding) return { left: current.left, top, found: true };
    top -= step;
  }
  return { left: current.left, top, found: false };
}
