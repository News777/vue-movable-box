// 碰撞检测功能
import type { MovableBoxRect } from '../types';

export interface CollisionResult {
  colliding: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom' | 'overlap';
  overlap?: number;
}

/**
 * 检测两个矩形是否碰撞
 */
export function checkCollision(
  rect1: { left: number; top: number; width: number; height: number },
  rect2: { left: number; top: number; width: number; height: number }
): CollisionResult {
  const r1Right = rect1.left + rect1.width;
  const r1Bottom = rect1.top + rect1.height;
  const r2Right = rect2.left + rect2.width;
  const r2Bottom = rect2.top + rect2.height;

  // 检查是否重叠
  const overlapX = Math.min(r1Right, r2Right) - Math.max(rect1.left, rect2.left);
  const overlapY = Math.min(r1Bottom, r2Bottom) - Math.max(rect1.top, rect2.top);

  if (overlapX <= 0 || overlapY <= 0) {
    return { colliding: false };
  }

  // 确定碰撞方向
  const overlap = Math.min(overlapX, overlapY);
  let direction: CollisionResult['direction'];

  // 计算碰撞方向
  const center1X = rect1.left + rect1.width / 2;
  const center1Y = rect1.top + rect1.height / 2;
  const center2X = rect2.left + rect2.width / 2;
  const center2Y = rect2.top + rect2.height / 2;

  const dx = center1X - center2X;
  const dy = center1Y - center2Y;

  if (Math.abs(dx) > Math.abs(dy)) {
    direction = dx > 0 ? 'right' : 'left';
  } else {
    direction = dy > 0 ? 'bottom' : 'top';
  }

  return { colliding: true, direction, overlap };
}

/**
 * 检测与所有目标元素的碰撞
 */
export function checkAllCollisions(
  current: { left: number; top: number; width: number; height: number },
  targets: MovableBoxRect[],
  excludeId?: string
): CollisionResult[] {
  const results: CollisionResult[] = [];

  for (const target of targets) {
    const rect2 = {
      left: Number(target.left),
      top: Number(target.top),
      width: Number(target.width),
      height: Number(target.height)
    };

    const result = checkCollision(current, rect2);
    if (result.colliding) {
      results.push(result);
    }
  }

  return results;
}

/**
 * 防止碰撞：调整位置使不重叠
 */
export function preventCollision(
  current: { left: number; top: number; width: number; height: number },
  targets: { left: number; top: number; width: number; height: number }[],
  bounds?: { minLeft: number; maxLeft: number; minTop: number; maxTop: number }
): { left: number; top: number } {
  let newLeft = current.left;
  let newTop = current.top;

  for (const target of targets) {
    const collision = checkCollision(current, target);
    if (collision.colliding && collision.overlap) {
      switch (collision.direction) {
        case 'left':
          newLeft = target.left - current.width;
          break;
        case 'right':
          newLeft = target.left + target.width;
          break;
        case 'top':
          newTop = target.top - current.height;
          break;
        case 'bottom':
          newTop = target.top + target.height;
          break;
      }
    }
  }

  // 应用边界限制
  if (bounds) {
    newLeft = Math.max(bounds.minLeft, Math.min(bounds.maxLeft, newLeft));
    newTop = Math.max(bounds.minTop, Math.min(bounds.maxTop, newTop));
  }

  return { left: newLeft, top: newTop };
}

/**
 * 查找最近的非碰撞位置
 */
export function findNearestValidPosition(
  current: { left: number; top: number; width: number; height: number },
  targets: { left: number; top: number; width: number; height: number }[],
  step = 10,
  maxIterations = 100
): { left: number; top: number; found: boolean } {
  let left = current.left;
  let top = current.top;

  for (let i = 0; i < maxIterations; i++) {
    const collision = checkAllCollisions({ left, top, width: current.width, height: current.height }, 
      targets.map(t => ({ left: t.left, top: t.top, width: t.width, height: t.height })) as any);

    if (collision.length === 0) {
      return { left, top, found: true };
    }

    // 尝试向上移动
    top -= step;
  }

  return { left, top, found: false };
}
