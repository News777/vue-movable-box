import { ref } from 'vue';
import { snapToElements, type SnapAxes, type SnapOptions, type SnapResult } from '../utils/snap';
import type { GuidesEventPayload, SnapTarget } from '../types';

interface UseSnapOptions extends SnapOptions {
  enabled: boolean;
  threshold: number;
}

const emptyGuides = (): GuidesEventPayload => ({ vertical: [], horizontal: [] });

export function useSnap(getOptions: () => UseSnapOptions) {
  const guides = ref<GuidesEventPayload>(emptyGuides());
  const lastSnapResult = ref<SnapResult | null>(null);

  const resolveSnap = (
    current: { left: number; top: number; width: number; height: number },
    targets: SnapTarget[],
    axes?: SnapAxes
  ): SnapResult => {
    const options = getOptions();
    const result = options.enabled
      ? snapToElements(current, targets, options.threshold, axes, {
          filter: options.filter,
          priority: options.priority
        })
      : {
          ...current,
          snapped: false,
          points: [],
          targetIds: {},
          guides: emptyGuides(),
          spacing: []
        };
    guides.value = result.guides;
    lastSnapResult.value = result.snapped ? result : null;
    return result;
  };

  const clearGuides = () => {
    guides.value = emptyGuides();
    lastSnapResult.value = null;
  };

  const setGuides = (value: GuidesEventPayload) => {
    guides.value = value;
  };

  return { guides, lastSnapResult, resolveSnap, clearGuides, setGuides };
}
