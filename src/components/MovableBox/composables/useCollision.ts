// 碰撞检测 composable
import { ref } from 'vue';
import { checkCollision, preventCollision, type CollisionResult } from '../utils/collision';
import type { MovableBoxRect } from '../types';

interface UseCollisionOptions {
  enabled: boolean;
  allowOverlap: boolean;
}

export function useCollision(
  options: UseCollisionOptions,
  getCurrentRect: () => { left: number; top: number; width: number; height: number },
  setPosition: (left: number, top: number) => void,
  getBounds: () => { minLeft: number; maxLeft: number; minTop: number; maxTop: number }
) {
  const collisions = ref<CollisionResult[]>([]);
  const isColliding = ref(false);

  // 检测碰撞
  const detectCollisions = (targets: MovableBoxRect[]): CollisionResult[] => {
    if (!options.enabled || targets.length === 0) {
      collisions.value = [];
      isColliding.value = false;
      return [];
    }

    const current = getCurrentRect();
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

    collisions.value = results;
    isColliding.value = results.length > 0;

    return results;
  };

  // 防止碰撞 - 调整位置
  const resolveCollision = (targets: MovableBoxRect[]): void => {
    if (!options.enabled || options.allowOverlap || targets.length === 0) return;

    const current = getCurrentRect();
    const bounds = getBounds();

    const rects = targets.map(t => ({
      left: Number(t.left),
      top: Number(t.top),
      width: Number(t.width),
      height: Number(t.height)
    }));

    const newPos = preventCollision(current, rects, bounds);

    if (newPos.left !== current.left || newPos.top !== current.top) {
      setPosition(newPos.left, newPos.top);
    }
  };

  // 检测即将发生的碰撞（预测）
  const predictCollision = (
    newLeft: number,
    newTop: number,
    targets: MovableBoxRect[]
  ): CollisionResult | null => {
    if (!options.enabled || targets.length === 0) return null;

    const current = getCurrentRect();
    const predicted = { ...current, left: newLeft, top: newTop };

    for (const target of targets) {
      const rect2 = {
        left: Number(target.left),
        top: Number(target.top),
        width: Number(target.width),
        height: Number(target.height)
      };

      const result = checkCollision(predicted, rect2);
      if (result.colliding) {
        return result;
      }
    }

    return null;
  };

  // 清除碰撞状态
  const clearCollisions = () => {
    collisions.value = [];
    isColliding.value = false;
  };

  return {
    collisions,
    isColliding,
    detectCollisions,
    resolveCollision,
    predictCollision,
    clearCollisions
  };
}
