// 基础工具函数 - 从原始 utils.ts 重新导出
export {
  valIsNaN,
  figureFinalValue,
  setValUnit,
  addEvent,
  removeEvent,
  restrictToBounds,
  keepDecimalsToNum,
  figureRatioMax,
  deepClone,
  getEventCoords
} from '../utils';

// 新增工具函数
export * from './snap';
export * from './collision';
