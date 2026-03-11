// 网格吸附 composable
import { computed, type Ref } from 'vue';
import { snapToGrid } from '../utils/snap';

interface UseGridOptions {
  snapToGrid: boolean;
  gridSize: number;
}

export function useGrid(
  options: UseGridOptions,
  getPosition: () => { left: number; top: number },
  setPosition: (left: number, top: number) => void
) {
  const snapValue = (value: number): number => {
    if (!options.snapToGrid) return value;
    return snapToGrid(value, options.gridSize);
  };

  const snapPosition = (left: number, top: number): { left: number; top: number } => {
    return {
      left: snapValue(left),
      top: snapValue(top)
    };
  };

  // 计算网格信息（用于辅助线显示）
  const gridInfo = computed(() => {
    if (!options.snapToGrid) return null;
    return {
      size: options.gridSize,
      color: 'rgba(64, 158, 255, 0.3)'
    };
  });

  return {
    snapValue,
    snapPosition,
    gridInfo
  };
}
