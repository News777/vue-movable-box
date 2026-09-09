import type { ExtendsMovableBox } from './MovableBox';

/** One member of a group move: the member identifier and its current rectangle. */
export interface GroupMemberRect<T extends object = object> {
  id: string;
  rect: ExtendsMovableBox<T>;
}

/** A member recorded when a group move finishes: current rectangle plus the rectangle it started from. */
export interface GroupMemberMoveRecord<T extends object = object> extends GroupMemberRect<T> {
  startRect: ExtendsMovableBox<T>;
}

export interface GroupMoveStartPayload<T extends object = object> {
  /** Identifier of the box whose pointer interaction leads the formation. */
  leaderId: string;
  source: PointerEvent;
  rects: GroupMemberRect<T>[];
}

export interface GroupMovePayload<T extends object = object> {
  leaderId: string;
  rects: GroupMemberRect<T>[];
}

export interface GroupMoveStopPayload<T extends object = object> {
  leaderId: string;
  source: PointerEvent;
  rects: GroupMemberMoveRecord<T>[];
}

export interface GroupMoveCancelPayload<T extends object = object> {
  leaderId: string;
  source: Event | null;
  /** All records carry rect === startRect because a cancel restores the formation. */
  rects: GroupMemberMoveRecord<T>[];
}

export interface MovableGroupProps {
  /** Selected member ids. Bound with v-model:selected; dragging an unselected box replaces the selection. */
  selected?: string[];
  /**
   * Keep the union of selected rectangles inside the bounds area while the group moves.
   * When false every member is clamped individually. Default true.
   */
  sharedBounds?: boolean;
}

export interface MovableGroupExpose {
  /** Currently selected member ids. */
  getSelected: () => string[];
  /** Replaces the selection; unknown ids are ignored. Pass no argument to keep every member. */
  select: (ids?: string[]) => void;
  /** Rectangles of every registered member, in registration order. */
  getMemberRects: () => GroupMemberRect[];
}
