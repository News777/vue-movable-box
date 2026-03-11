// 键盘控制 composable
import { ref, computed } from 'vue';
import { snapToGrid } from '../utils/snap';

interface UseKeyboardOptions {
  enabled: boolean;
  step: number;
  dragDirections: string[];
  snapToGrid?: boolean;
  gridSize?: number;
}

export function useKeyboard(
  options: UseKeyboardOptions,
  getPosition: () => { left: number; top: number },
  setPosition: (left: number, top: number) => void,
  getBounds: () => { minLeft: number; maxLeft: number; minTop: number; maxTop: number },
  emit: (event: string, ...args: any[]) => void
) {
  const active = ref(false);

  const isDirectionAllowed = (direction: string): boolean => {
    return options.dragDirections.includes(direction);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!options.enabled || !active.value) return;

    const step = options.step || 1;
    let moved = false;
    let newLeft = getPosition().left;
    let newTop = getPosition().top;

    switch (event.key) {
      case 'ArrowUp':
        if (isDirectionAllowed('top')) {
          newTop -= step;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (isDirectionAllowed('bottom')) {
          newTop += step;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (isDirectionAllowed('left')) {
          newLeft -= step;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (isDirectionAllowed('right')) {
          newLeft += step;
          moved = true;
        }
        break;
      case 'Escape':
        active.value = false;
        return;
      default:
        return;
    }

    if (moved) {
      event.preventDefault();

      // 网格吸附
      if (options.snapToGrid) {
        newLeft = snapToGrid(newLeft, options.gridSize || 20);
        newTop = snapToGrid(newTop, options.gridSize || 20);
      }

      // 边界检查
      const bounds = getBounds();
      newLeft = Math.max(bounds.minLeft, Math.min(bounds.maxLeft, newLeft));
      newTop = Math.max(bounds.minTop, Math.min(bounds.maxTop, newTop));

      setPosition(newLeft, newTop);
      emit('move', { left: newLeft, top: newTop });
    }
  };

  const activate = () => {
    active.value = true;
  };

  const deactivate = () => {
    active.value = false;
  };

  return {
    active,
    handleKeyDown,
    activate,
    deactivate
  };
}
