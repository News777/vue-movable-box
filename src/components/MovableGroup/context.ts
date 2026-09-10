import type { InjectionKey } from 'vue';
import type { ExtendsMovableBox } from '../../types/MovableBox';

/** Area edges resolved by a member box, in the coordinate space shared by the group. */
export interface GroupAreaEdges {
  minLeft: number;
  maxRight: number;
  minTop: number;
  maxBottom: number;
}

/** Internal API every MovableBox registers with its surrounding MovableGroup. */
export interface GroupMemberApi {
  getRect: () => ExtendsMovableBox;
  translateTo: (rect: ExtendsMovableBox) => void;
  getAreaEdges: () => GroupAreaEdges | null;
}

export interface GroupDragSession {
  leaderId: string;
  startRects: Map<string, ExtendsMovableBox>;
}

export type GroupDragDisposition = 'group' | 'solo' | 'blocked';

/**
 * Contract provided by MovableGroup. MovableBox consumes it optionally, so a box keeps
 * working standalone. All coordinates use the leader's unit space; members are expected
 * to share that space.
 */
export interface GroupContext {
  registerMember: (id: string, api: GroupMemberApi) => void;
  unregisterMember: (id: string) => void;
  /** Returns whether an id belongs to this group, for excluding internal snap targets. */
  hasMember: (id: string | undefined) => boolean;
  /** Opens a group session, permits a solo drag, or blocks a selected concurrent member. */
  beginDrag: (id: string, source: PointerEvent) => GroupDragDisposition;
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
  /** Ends a session without events or restores; used on forced aborts (disabled/initRect). */
  abortDrag: (id: string) => void;
}

export const GROUP_CONTEXT_KEY: InjectionKey<GroupContext> = Symbol('MovableGroupContext');
