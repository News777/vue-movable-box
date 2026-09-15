import type { InjectionKey } from 'vue';
import type { ExtendsMovableBox } from '../../types/MovableBox';

/** Area edges resolved by a member box, in the coordinate space shared by the group. */
export interface GroupAreaEdges {
  minLeft: number;
  maxRight: number;
  minTop: number;
  maxBottom: number;
}

/**
 * Visual (axis-aligned) contour of a member in the group coordinate space. For a rotated
 * member this is the AABB of its true rotated rectangle — MovableBox provides it through
 * `getVisualRect` (its geometry probe); it is not the member's model rectangle.
 */
export interface GroupVisualRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Internal API every MovableBox registers with its surrounding MovableGroup. */
export interface GroupMemberApi {
  getRect: () => ExtendsMovableBox;
  /** Visual (rotated AABB) contour of the member, for bounds that see rotation. */
  getVisualRect: () => GroupVisualRect;
  translateTo: (rect: ExtendsMovableBox) => void;
  /** Whether the member currently runs its own drag/resize/rotate interaction. */
  isInteracting: () => boolean;
  getAreaEdges: () => GroupAreaEdges | null;
  /**
   * Largest fraction of a shared translation delta this member can absorb without
   * colliding, in [0, 1], swept from the member's drag-start rectangle (the group
   * re-applies the limited delta to that same rectangle on every frame). A start
   * position already overlapping an obstacle returns 1 only for escape motions, and
   * 0 otherwise; the escape test follows the member's collision mode (precise: per
   * target no-deepening rule, aabb: legacy total-overlap rule).
   */
  sharedDeltaProgress: (
    startRect: ExtendsMovableBox,
    delta: { left: number; top: number }
  ) => number;
}

export interface GroupDragSession {
  leaderId: string;
  startRects: Map<string, ExtendsMovableBox>;
  /** Visual (rotated AABB) contour of each member at drag start, for rotated bounds. */
  startVisuals: Map<string, GroupVisualRect>;
}

export type GroupDragDisposition = 'group' | 'solo' | 'blocked';

/**
 * Contract provided by MovableGroup. MovableBox consumes it optionally, so a box keeps
 * working standalone. All coordinates use the leader's unit space; members are expected
 * to share that space.
 */
export interface GroupContext {
  /**
   * Registers a member under `id`. Returns false when a different member already owns
   * the id, leaving the existing registration untouched — callers must keep their
   * current identity instead of silently hijacking the other member.
   */
  registerMember: (id: string, api: GroupMemberApi) => boolean;
  unregisterMember: (id: string) => void;
  /**
   * Moves a member's registration from `oldId` to `newId` atomically: membership, any
   * active session role, and the selection follow the same component instance. Returns
   * false (no-op) when another member already owns `newId`.
   */
  renameMember: (oldId: string, newId: string, api: GroupMemberApi) => boolean;
  /** Returns whether an id belongs to this group, for excluding internal snap targets. */
  hasMember: (id: string | undefined) => boolean;
  /** Opens a group session, permits a solo drag, or blocks a selected concurrent member. */
  beginDrag: (id: string, source: PointerEvent) => GroupDragDisposition;
  /**
   * Whether a member may start a non-drag interaction (resize, rotate, or a keyboard
   * move). False while the member belongs to an active group drag session: the leader's
   * per-frame translateTo would otherwise overwrite that gesture.
   */
  beginMemberInteraction: (id: string) => boolean;
  /**
   * Constrains the leader candidate so the union of member rectangles stays inside the
   * area, moves every other selected member to the same offset, and returns the
   * adjusted leader rectangle.
   */
  constrainPosition: (id: string, candidate: ExtendsMovableBox) => ExtendsMovableBox;
  /** Publishes the batch move payload after the leader committed its rectangle. */
  notifyMoved: (id: string, leaderRect: ExtendsMovableBox) => void;
  /** Completes the session and emits the immutable batch stop payload. */
  endDrag: (id: string, source: PointerEvent) => void;
  /** Restores every member to its session start rectangle and emits the cancel payload. */
  cancelDrag: (id: string, source: Event | null) => void;
  /**
   * Dissolves the leader's session without restores and emits `move-cancel` (source
   * null); used on forced aborts (disabled/initRect) and leader unmount.
   */
  abortDrag: (id: string) => void;
}

export const GROUP_CONTEXT_KEY: InjectionKey<GroupContext> = Symbol('MovableGroupContext');
