// 对齐吸附 composable
import { ref } from 'vue';
import { snapToElements, getSnapGuides, type SnapResult } from '../utils/snap';
import type { MovableBoxRect } from '../types';

interface UseSnapOptions {
  snapToGrid: boolean;
  gridSize: number;
  snapToElements: boolean;
  snapThreshold: number;
}

export function useSnap(
  options: UseSnapOptions,
  getCurrentRect: () => { left: number; top: number; width: number; height: number },
  setPosition: (left: number, top: number) => void
) {
  const guides = ref<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });
  const lastSnapResult = ref<SnapResult | null>(null);

  // 执行对齐吸附
  const applySnap = (targets: MovableBoxRect[]): void => {
    if (!options.snapToElements || targets.length === 0) return;

    const current = getCurrentRect();
    const result = snapToElements(current, targets, options.snapThreshold);

    if (result.snapped) {
      setPosition(result.left, result.top);
      lastSnapResult.value = result;
      
      // 更新辅助线
      guides.value = getSnapGuides(current, targets, options.snapThreshold);
    } else {
      guides.value = { vertical: [], horizontal: [] };
      lastSnapResult.value = null;
    }
  };

  // 清除辅助线
  const clearGuides = () => {
    guides.value = { vertical: [], horizontal: [] };
    lastSnapResult.value = null;
  };

  return {
    guides,
    lastSnapResult,
    applySnap,
    clearGuides
  };
}
