import { computed as nt, ref as V, defineComponent as Dt, reactive as en, watch as ot, inject as nn, getCurrentInstance as on, onMounted as an, onUnmounted as ln, openBlock as j, createElementBlock as tt, normalizeStyle as yt, normalizeClass as de, Fragment as kt, renderList as Gt, unref as fe, withDirectives as rn, withModifiers as sn, vShow as cn, renderSlot as be, provide as un } from "vue";
import dn from "decimal.js";
const fn = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, pn = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, mn = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function hn(n, o) {
  return { handleKeyDown: (e) => {
    const l = n(), r = l.interacting;
    if (!r && (!l.enabled || l.disabled || !l.active)) return;
    if (e.key === "Escape") {
      e.preventDefault(), r ? o.cancel(e) : o.deactivate();
      return;
    }
    if (r || l.readOnly) return;
    const y = fn[e.key];
    if (!y) return;
    const u = Number.isFinite(l.step) && l.step > 0 ? l.step : 1;
    if (l.focusedHandle && l.resizeDirections.includes(l.focusedHandle)) {
      if (!pn[l.focusedHandle].includes(y)) return;
      e.preventDefault(), o.resize(
        l.focusedHandle,
        e.shiftKey ? mn[y] : y,
        u
      );
      return;
    }
    if (e.shiftKey) {
      const M = l.resizeDirections.includes("br") ? "br" : l.resizeDirections[0];
      if (!M) return;
      e.preventDefault(), o.resize(M, y, u);
      return;
    }
    l.dragDirections.includes(y) && (e.preventDefault(), o.move(y, u));
  } };
}
const xt = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, gn = (n) => {
  const o = xt(n.left), s = xt(n.top), e = xt(n.width), l = xt(n.height);
  return o === null || s === null || e === null || l === null || e < 0 || l < 0 ? null : { left: o, top: s, width: e, height: l };
};
function vn(n, o) {
  const s = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(n / s) * s;
}
const pe = (n, o, s) => o.distance > s ? n : !n || o.distance < n.distance ? o : n;
function bn(n, o, s = 10, e = { horizontal: !0, vertical: !0 }) {
  const l = Math.max(0, Number.isFinite(s) ? s : 10), r = n.left + n.width, y = n.top + n.height, u = n.left + n.width / 2, M = n.top + n.height / 2;
  let v = null, a = null;
  for (const C of o) {
    const I = gn(C);
    if (!I) continue;
    const k = I.left + I.width, R = I.top + I.height, N = I.left + I.width / 2, L = I.top + I.height / 2, T = C.id, d = [
      {
        distance: Math.abs(n.left - I.left),
        value: I.left,
        guide: I.left,
        point: "left",
        targetId: T
      },
      {
        distance: Math.abs(r - k),
        value: k - n.width,
        guide: k,
        point: "right",
        targetId: T
      },
      {
        distance: Math.abs(n.left - k),
        value: k,
        guide: k,
        point: "left",
        targetId: T
      },
      {
        distance: Math.abs(r - I.left),
        value: I.left - n.width,
        guide: I.left,
        point: "right",
        targetId: T
      },
      {
        distance: Math.abs(u - N),
        value: N - n.width / 2,
        guide: N,
        point: "center-x",
        targetId: T
      }
    ], h = [
      {
        distance: Math.abs(n.top - I.top),
        value: I.top,
        guide: I.top,
        point: "top",
        targetId: T
      },
      {
        distance: Math.abs(y - R),
        value: R - n.height,
        guide: R,
        point: "bottom",
        targetId: T
      },
      {
        distance: Math.abs(n.top - R),
        value: R,
        guide: R,
        point: "top",
        targetId: T
      },
      {
        distance: Math.abs(y - I.top),
        value: I.top - n.height,
        guide: I.top,
        point: "bottom",
        targetId: T
      },
      {
        distance: Math.abs(M - L),
        value: L - n.height / 2,
        guide: L,
        point: "center-y",
        targetId: T
      }
    ];
    if (e.horizontal)
      for (const p of d) v = pe(v, p, l);
    if (e.vertical)
      for (const p of h) a = pe(a, p, l);
  }
  const D = [v == null ? void 0 : v.point, a == null ? void 0 : a.point].filter(
    (C) => !!C
  );
  return {
    left: (v == null ? void 0 : v.value) ?? n.left,
    top: (a == null ? void 0 : a.value) ?? n.top,
    snapped: D.length > 0,
    snapPoint: D[0],
    points: D,
    targetId: (v == null ? void 0 : v.targetId) ?? (a == null ? void 0 : a.targetId),
    targetIds: { horizontal: v == null ? void 0 : v.targetId, vertical: a == null ? void 0 : a.targetId },
    guides: {
      vertical: v ? [v.guide] : [],
      horizontal: a ? [a.guide] : []
    }
  };
}
function yn(n) {
  const o = (l) => {
    const r = n();
    return r.snapToGrid ? vn(l, r.gridSize) : l;
  }, s = (l, r) => ({
    left: o(l),
    top: o(r)
  }), e = nt(() => {
    const l = n();
    return l.snapToGrid ? {
      size: Number.isFinite(l.gridSize) && l.gridSize > 0 ? l.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: s, gridInfo: e };
}
const Ot = () => ({ vertical: [], horizontal: [] });
function xn(n) {
  const o = V(Ot()), s = V(null);
  return { guides: o, lastSnapResult: s, resolveSnap: (y, u, M) => {
    const v = n(), a = v.enabled ? bn(y, u, v.threshold, M) : {
      ...y,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Ot()
    };
    return o.value = a.guides, s.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    o.value = Ot(), s.value = null;
  }, setGuides: (y) => {
    o.value = y;
  } };
}
const wt = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, ye = (n) => {
  const o = wt(n.left), s = wt(n.top), e = wt(n.width), l = wt(n.height);
  return o === null || s === null || e === null || l === null || e < 0 || l < 0 ? null : { left: o, top: s, width: e, height: l };
}, me = (n, o, s, e) => {
  const l = s - o;
  if (l === 0) return o < e ? n : null;
  const r = (e - o) / l;
  return l > 0 ? { ...n, exit: Math.min(n.exit, r) } : { ...n, entry: Math.max(n.entry, r) };
}, he = (n, o, s, e) => {
  const l = s - o;
  if (l === 0) return o > e ? n : null;
  const r = (e - o) / l;
  return l > 0 ? { ...n, entry: Math.max(n.entry, r) } : { ...n, exit: Math.min(n.exit, r) };
}, wn = (n, o, s) => {
  let e = { entry: 0, exit: 1 };
  if (e = me(e, n.left, o.left, s.left + s.width), !e || (e = he(
    e,
    n.left + n.width,
    o.left + o.width,
    s.left
  ), !e) || (e = me(e, n.top, o.top, s.top + s.height), !e) || (e = he(
    e,
    n.top + n.height,
    o.top + o.height,
    s.top
  ), !e)) return null;
  const l = Math.max(0, e.entry), r = Math.min(1, e.exit);
  return l < r && r > 0 && l < 1 ? { entry: l, exit: r } : null;
};
function Rt(n, o, s) {
  let e = null;
  for (const l of s) {
    const r = ye(l);
    if (!r) continue;
    const y = wn(n, o, r);
    y && (!e || y.entry < e.entry) && (e = y);
  }
  return e;
}
function In(n, o) {
  const s = Math.min(n.left + n.width, o.left + o.width) - Math.max(n.left, o.left), e = Math.min(n.top + n.height, o.top + o.height) - Math.max(n.top, o.top);
  if (s <= 0 || e <= 0) return { colliding: !1, overlapArea: 0 };
  const l = n.left + n.width / 2, r = n.top + n.height / 2, y = o.left + o.width / 2, u = o.top + o.height / 2, M = l - y, v = r - u;
  return {
    colliding: !0,
    direction: s <= e ? M > 0 ? "right" : "left" : v > 0 ? "bottom" : "top",
    overlap: Math.min(s, e),
    overlapArea: s * e
  };
}
function Wt(n, o, s) {
  const e = [];
  for (const l of o) {
    const r = ye(l);
    if (!r) continue;
    const y = In(n, r);
    y.colliding && e.push({ ...y, targetId: l.id });
  }
  return e;
}
function ge(n) {
  let o = null;
  for (const s of n)
    (!o || (s.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = s);
  return o;
}
const $t = (n) => n.reduce((o, s) => o + (s.overlapArea ?? 0), 0), xe = (n, o, s) => ({
  left: n.left + (o.left - n.left) * s,
  top: n.top + (o.top - n.top) * s,
  width: n.width + (o.width - n.width) * s,
  height: n.height + (o.height - n.height) * s
}), Mn = (n, o) => n.left === o.left && n.top === o.top && n.width === o.width && n.height === o.height, Kt = (n, o, s, e) => {
  if (!Rt(n, o, s)) return o;
  let l = 0, r = 1, y = n;
  for (let u = 0; u < 24; u += 1) {
    const M = (l + r) / 2, v = e(xe(n, o, M));
    Rt(n, v, s) ? r = M : (y = v, l = M);
  }
  return y;
};
function zn(n) {
  const o = V([]), s = V(!1), e = (u, M) => {
    const a = n().enabled ? Wt(u, M) : [];
    return o.value = a, s.value = a.length > 0, {
      results: a,
      dominant: ge(a),
      totalOverlapArea: $t(a)
    };
  }, l = (u) => (o.value = u, s.value = u.length > 0, {
    results: u,
    dominant: ge(u),
    totalOverlapArea: $t(u)
  });
  return { collisions: o, isColliding: s, evaluate: e, resolveCandidate: (u, M, v, a = (C) => C, D = "path") => {
    const C = n(), I = e(u, v);
    if (!C.enabled || C.allowOverlap)
      return { accepted: !0, rect: u, ...I };
    const k = Wt(M, v), R = $t(k);
    if (R > 0)
      return {
        accepted: I.totalOverlapArea < R,
        rect: u,
        ...I
      };
    const N = Rt(M, u, v);
    if (I.results.length === 0 && !N)
      return { accepted: !0, rect: u, ...I };
    let L = I;
    if (I.results.length === 0 && N) {
      const d = xe(
        M,
        u,
        N.entry + (N.exit - N.entry) * 1e-3
      );
      L = l(Wt(d, v));
    }
    let T = null;
    if (D === "slide") {
      const d = Kt(
        M,
        { ...M, left: u.left },
        v,
        a
      ), h = Kt(
        M,
        { ...M, top: u.top },
        v,
        a
      ), p = a({
        ...u,
        left: d.left,
        top: h.top
      });
      Rt(M, p, v) || (T = p);
    }
    return T ?? (T = Kt(M, u, v, a)), {
      accepted: !Mn(T, M),
      rect: T,
      ...L
    };
  }, clearCollisions: () => {
    o.value = [], s.value = !1;
  } };
}
const m = (n, o = 0) => {
  if (n == null || n === "")
    return o;
  const s = typeof n == "string" ? Number(n) : n;
  return Number.isFinite(s) ? s : o;
}, ut = (n, o, s) => Math.min(Math.max(n, o), s), Rn = (n, o) => m(n.left) === m(o.left) && m(n.top) === m(o.top) && m(n.width) === m(o.width) && m(n.height) === m(o.height), we = Symbol("MovableGroupContext"), Dn = 2, et = (n, o = 1) => {
  if (n == null || n === "")
    return o;
  const s = typeof n == "string" ? parseFloat(n) : n;
  return isNaN(s) ? o : s;
}, It = (n, o = "px") => n == null || n === "" ? "0" : `${n}${o}`;
function Mt(n, o, s, e) {
  n && n.addEventListener(o, s, e);
}
function zt(n, o, s, e) {
  n && n.removeEventListener(o, s, e);
}
const ve = (n, o = 1, s = Dn) => {
  const e = new dn(n).toDecimalPlaces(s).toNumber();
  return et(e, o);
}, dt = (n) => {
  if (n === null || typeof n != "object")
    return n;
  if (n instanceof Date)
    return new Date(n.getTime());
  if (n instanceof Array)
    return n.map((o) => dt(o));
  if (n instanceof Object) {
    const o = {};
    for (const s in n)
      n.hasOwnProperty(s) && (o[s] = dt(n[s]));
    return o;
  }
  return n;
}, Tn = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Sn = Dt({
  name: "VueMovableBox"
}), An = /* @__PURE__ */ Dt({
  ...Sn,
  props: {
    theme: { type: String, default: "#409EFD" },
    inActiveColor: { type: String, default: "#666666" },
    unitType: { type: String, default: "px" },
    scale: { type: [Number, String], default: 1 },
    isKeepDecimals: { type: Boolean, default: !1 },
    decimalPlaces: { type: Number, default: 2 },
    draggable: { type: Boolean, default: !0 },
    dragHandle: String,
    dragCancel: String,
    canDrag: {
      type: Function,
      default: void 0
    },
    canResize: {
      type: Function,
      default: void 0
    },
    resizable: { type: Boolean, default: void 0 },
    resizeable: { type: Boolean, default: void 0 },
    limitAreaForParent: { type: Boolean, default: !0 },
    limitAreaClass: String,
    modelValue: {
      type: Object,
      default: () => ({ left: 0, top: 0, width: 200, height: 100, zIndex: 1 })
    },
    maxWidth: [Number, String],
    maxHeight: [Number, String],
    minWidth: { type: [Number, String], default: 0 },
    minHeight: { type: [Number, String], default: 0 },
    ratioLock: { type: Boolean, default: !1 },
    active: { type: Boolean, default: !1 },
    disabledUserSelect: { type: Boolean, default: !0 },
    handles: {
      type: Array,
      default: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"]
    },
    disabled: { type: Boolean, default: !1 },
    initRect: { type: Boolean, default: !1 },
    edgeDistance: { type: Number, default: 0 },
    snapToGrid: { type: Boolean, default: !1 },
    gridSize: { type: Number, default: 20 },
    dragDirections: {
      type: Array,
      default: () => ["top", "bottom", "left", "right"]
    },
    resizeDirections: {
      type: Array,
      default: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"]
    },
    enableTransition: { type: Boolean, default: !1 },
    keyboardEnabled: { type: Boolean, default: !1 },
    keyboardStep: { type: Number, default: 1 },
    boundsMargin: {
      type: Object,
      default: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
    },
    snapToElements: { type: Boolean, default: !1 },
    snapThreshold: { type: Number, default: 10 },
    collisionEnabled: { type: Boolean, default: !1 },
    allowOverlap: { type: Boolean, default: !1 },
    snapTargets: { type: Array, default: () => [] },
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: String
  },
  emits: ["update:modelValue", "drag", "drag-start", "drag-stop", "resize-start", "resize-stop", "drag-cancel", "resize-cancel", "resize", "move", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "snap", "guides", "collision"],
  setup(n, { expose: o, emit: s }) {
    var ae;
    const e = n, l = s, r = (t) => dt(t), y = V(), u = V(r(e.modelValue)), M = r(e.modelValue), v = V(null), a = en({
      active: e.active,
      isDragging: !1,
      isResizing: !1,
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: r(e.modelValue),
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    ot(
      () => e.modelValue,
      (t) => {
        u.value = r(t);
      },
      { deep: !0 }
    ), ot(
      () => e.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? gt() : N(t);
      },
      { flush: "sync" }
    ), ot(
      () => e.disabled,
      (t) => {
        l("disabled", t), t && gt();
      }
    ), ot(
      () => e.initRect,
      (t) => {
        t && gt();
      }
    ), ot(
      () => e.isKeepDecimals,
      (t, i) => {
        !t && i && R({
          ...u.value,
          left: Math.round(m(u.value.left)),
          top: Math.round(m(u.value.top)),
          width: Math.round(m(u.value.width)),
          height: Math.round(m(u.value.height))
        });
      }
    );
    const D = nt(() => e.resizable ?? e.resizeable ?? !0), C = nt(() => e.unitType === "%"), I = nt(() => ({
      "--movable-box-theme": e.theme,
      borderColor: e.disabled ? e.inActiveColor : a.active ? e.theme : e.inActiveColor,
      left: It(u.value.left, e.unitType),
      top: It(u.value.top, e.unitType),
      width: It(u.value.width, e.unitType),
      height: It(u.value.height, e.unitType),
      zIndex: u.value.zIndex,
      cursor: e.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : "default",
      pointerEvents: e.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: "translateZ(0)",
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: e.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), k = nt(() => ({
      borderColor: D.value ? e.theme : e.inActiveColor,
      scale: ve(1 / et(e.scale, 1), 1)
    })), R = (t) => {
      const i = r(t);
      return u.value = i, l("update:modelValue", r(i)), i;
    };
    function N(t) {
      a.active !== t && (a.active = t, l(t ? "active" : "inactive", r(u.value)), t || St());
    }
    const L = () => {
      var i, c, f;
      let t = null;
      if (e.limitAreaClass)
        try {
          t = document.querySelector(e.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((i = y.value) == null ? void 0 : i.parentElement) ?? null, a.parentWidth = ((c = a.parentElement) == null ? void 0 : c.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, T = (t) => Math.max(0, Number(t) || 0), d = () => {
      const t = T(e.edgeDistance);
      return {
        top: t + T(e.boundsMargin.top),
        right: t + T(e.boundsMargin.right),
        bottom: t + T(e.boundsMargin.bottom),
        left: t + T(e.boundsMargin.left)
      };
    }, h = () => {
      const t = d(), i = C.value ? 100 : a.parentWidth, c = C.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, i - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, c - t.bottom)
      };
    }, p = (t) => {
      const i = h();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - m(t.width)),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - m(t.height))
      };
    }, z = (t) => {
      if (!a.parentElement) return;
      const i = h(), c = m(t.left), f = m(t.top), b = c + m(t.width), g = f + m(t.height);
      c < i.minLeft && l("out-of-bounds", "left"), b > i.maxRight && l("out-of-bounds", "right"), f < i.minTop && l("out-of-bounds", "top"), g > i.maxBottom && l("out-of-bounds", "bottom");
    }, A = (t) => {
      if (!e.limitAreaForParent || !a.parentElement) return t;
      const i = p(t);
      return {
        ...t,
        left: ut(m(t.left), i.minLeft, i.maxLeft),
        top: ut(m(t.top), i.minTop, i.maxTop)
      };
    }, x = nn(we, null), H = e.memberId ?? `member-${((ae = on()) == null ? void 0 : ae.uid) ?? Math.random().toString(36).slice(2)}`;
    let O = !1;
    const ft = {
      getRect: () => r(u.value),
      translateTo: (t) => {
        R(t);
      },
      getAreaEdges: () => (L(), a.parentElement ? h() : null)
    };
    an(() => x == null ? void 0 : x.registerMember(H, ft));
    const P = (t) => e.isKeepDecimals ? ve(t, 0, e.decimalPlaces) : Math.round(t), q = (t, i) => {
      const c = et(e.scale, 1), f = t / (c === 0 ? 1 : c);
      if (!C.value) return P(f);
      const b = i === "horizontal" ? a.parentWidth : a.parentHeight;
      return b > 0 ? P(f / b * 100) : 0;
    }, Vt = yn(() => ({ snapToGrid: e.snapToGrid, gridSize: e.gridSize })), _ = xn(() => ({ enabled: e.snapToElements, threshold: e.snapThreshold })), _t = zn(() => ({
      enabled: e.collisionEnabled,
      allowOverlap: e.allowOverlap
    })), Ut = _.guides;
    let at = "clear", lt = "clear", rt = "clear";
    const pt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), mt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Tt = (t) => {
      const i = {
        horizontal: t.points.some((g) => pt.has(g)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((g) => mt.has(g)) ? t.targetIds.vertical : void 0
      }, c = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: i
      } : { snapped: !1 }, f = JSON.stringify({
        payload: c,
        targetIds: i,
        left: t.points.some((g) => pt.has(g)) ? t.left : void 0,
        top: t.points.some((g) => mt.has(g)) ? t.top : void 0
      });
      f !== at && ((t.snapped || at !== "clear") && l("snap", c), at = t.snapped ? f : "clear");
      const b = JSON.stringify({ guides: t.guides, targetIds: i });
      b !== lt && ((t.snapped || lt !== "clear") && l("guides", dt(t.guides)), lt = t.snapped ? b : "clear");
    }, ze = (t) => {
      const i = t.dominant, c = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId
      } : { colliding: !1 }, f = JSON.stringify(c);
      f !== rt && ((i || rt !== "clear") && l("collision", c), rt = i ? f : "clear");
    }, St = () => {
      at !== "clear" && l("snap", { snapped: !1 }), lt !== "clear" && l("guides", { vertical: [], horizontal: [] }), rt !== "clear" && l("collision", { colliding: !1 }), at = "clear", lt = "clear", rt = "clear", _.clearGuides(), _t.clearCollisions();
    }, st = (t) => ({
      left: m(t.left),
      top: m(t.top),
      width: m(t.width),
      height: m(t.height)
    }), At = (t, i, c = "path") => {
      const f = _t.resolveCandidate(
        st(t),
        st(i),
        e.snapTargets,
        (b) => ({
          left: P(b.left),
          top: P(b.top),
          width: P(b.width),
          height: P(b.height)
        }),
        c
      );
      return ze(f), f.accepted ? { ...t, ...f.rect } : null;
    }, Xt = (t, i, c, f, b) => {
      let g = r(t);
      f.horizontal && (g.left = Vt.snapValue(m(t.left))), f.vertical && (g.top = Vt.snapValue(m(t.top)));
      let w = {
        ...st(g),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] }
      };
      if (c ? (w = _.resolveSnap(st(g), e.snapTargets, f), g = { ...g, left: w.left, top: w.top }) : _.clearGuides(), b) {
        const B = m(b.left), S = m(b.top);
        e.dragDirections.includes("left") || (g.left = Math.max(B, m(g.left))), e.dragDirections.includes("right") || (g.left = Math.min(B, m(g.left))), e.dragDirections.includes("top") || (g.top = Math.max(S, m(g.top))), e.dragDirections.includes("bottom") || (g.top = Math.min(S, m(g.top)));
      }
      z(g), g = A(g);
      const F = At(g, i, "slide");
      if (!F)
        return Tt({
          ...w,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), _.clearGuides(), null;
      if (g = F, w.snapped) {
        const B = m(g.left) !== w.left, S = m(g.top) !== w.top, E = w.points.filter((W) => pt.has(W) ? !B : mt.has(W) ? !S : !1), G = E.some((W) => pt.has(W)), U = E.some((W) => mt.has(W));
        w = {
          ...w,
          left: m(g.left),
          top: m(g.top),
          snapped: E.length > 0,
          snapPoint: E[0],
          points: E,
          targetId: G ? w.targetIds.horizontal : U ? w.targetIds.vertical : void 0,
          targetIds: {
            horizontal: G ? w.targetIds.horizontal : void 0,
            vertical: U ? w.targetIds.vertical : void 0
          },
          guides: {
            vertical: G ? w.guides.vertical : [],
            horizontal: U ? w.guides.horizontal : []
          }
        }, w.snapped ? _.setGuides(w.guides) : _.clearGuides();
      }
      return Tt(w), g;
    }, Et = (t) => e.resizeDirections.includes(t), Yt = (t, i, c, f) => {
      const b = m(t.left), g = m(t.top), w = m(t.width), F = m(t.height);
      let B = b, S = b + w, E = g, G = g + F;
      i.includes("l") && (B += c), i.includes("r") && (S += c), i.includes("t") && (E += f), i.includes("b") && (G += f);
      const U = (B + S) / 2, W = (E + G) / 2;
      let $ = Math.max(0, S - B), X = Math.max(0, G - E);
      const it = w > 0 && F > 0 ? w / F : 1, Lt = (Q) => {
        $ = Q, i.includes("l") ? B = S - $ : i.includes("r") ? S = B + $ : (B = U - $ / 2, S = U + $ / 2);
      }, Ht = (Q) => {
        X = Q, i.includes("t") ? E = G - X : i.includes("b") ? G = E + X : (E = W - X / 2, G = W + X / 2);
      };
      if (e.ratioLock) {
        const Q = Math.abs($ - w), tn = Math.abs(X - F) * it;
        i === "tm" || i === "bm" || tn > Q ? Lt(X * it) : Ht($ / it);
      }
      const Y = h(), le = e.limitAreaForParent && !!a.parentElement, Qe = le ? i.includes("l") ? Math.max(0, S - Y.minLeft) : i.includes("r") ? Math.max(0, Y.maxRight - B) : Math.max(
        0,
        2 * Math.min(U - Y.minLeft, Y.maxRight - U)
      ) : 1 / 0, je = le ? i.includes("t") ? Math.max(0, G - Y.minTop) : i.includes("b") ? Math.max(0, Y.maxBottom - E) : Math.max(
        0,
        2 * Math.min(W - Y.minTop, Y.maxBottom - W)
      ) : 1 / 0, re = Math.max(0, et(e.minWidth, 0)), se = Math.max(0, et(e.minHeight, 0)), ce = et(e.maxWidth, 1 / 0), ue = et(e.maxHeight, 1 / 0);
      let ct = Math.min(ce > 0 ? ce : 1 / 0, Qe), Ft = Math.min(ue > 0 ? ue : 1 / 0, je);
      if (e.ratioLock) {
        ct = Math.min(ct, Ft * it);
        const Q = Math.max(re, se * it);
        Lt(ut($, Q, ct)), Ht($ / it);
      } else
        Lt(ut($, Math.min(re, ct), ct)), Ht(ut(X, Math.min(se, Ft), Ft));
      return {
        ...t,
        left: P(B),
        top: P(E),
        width: P(S - B),
        height: P(G - E)
      };
    };
    let K = null, J = null;
    const qt = (t) => {
      if (e.disabled || e.initRect || !a.isDragging && !a.isResizing) return;
      const i = q(t.clientX - a.initX, "horizontal"), c = q(t.clientY - a.initY, "vertical"), f = r(u.value);
      if (a.isDragging) {
        const b = a.beforeInteraction;
        let g = m(b.left) + i, w = m(b.top) + c;
        const F = {
          horizontal: i < 0 && e.dragDirections.includes("left") || i > 0 && e.dragDirections.includes("right"),
          vertical: c < 0 && e.dragDirections.includes("top") || c > 0 && e.dragDirections.includes("bottom")
        };
        F.horizontal || (g = m(b.left)), F.vertical || (w = m(b.top));
        const B = {
          ...b,
          left: P(g),
          top: P(w)
        };
        let S = Xt(B, f, e.snapToElements, F, b);
        if (S && O && (S = (x == null ? void 0 : x.constrainPosition(H, S)) ?? null), S) {
          const E = R(S);
          l("move", r(E)), l("drag", r(E)), O && (x == null || x.notifyMoved(H, r(E)));
        }
      }
      if (a.isResizing && a.handle) {
        Tt({
          ...st(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] }
        }), _.clearGuides();
        const b = Yt(a.beforeInteraction, a.handle, i, c);
        z(b);
        const g = At(b, f);
        if (g) {
          const w = R(g);
          l("resize", r(w));
        }
      }
    }, Re = (t) => {
      !a.active || e.disabled || e.initRect || (J = t, K === null && (K = requestAnimationFrame(() => {
        K = null;
        const i = J;
        J = null, i && qt(i);
      })));
    }, ht = (t) => a.pointerId === null || t.pointerId === a.pointerId, Jt = (t) => {
      ht(t) && Re(t);
    }, Zt = (t) => {
      ht(t) && Ne(t);
    }, Qt = (t) => {
      ht(t) && vt(t);
    }, jt = (t) => {
      ht(t) && (a.isDragging || a.isResizing) && vt(t);
    }, De = () => {
      const t = a.eventElement;
      if (!t) return;
      const i = { passive: !1 };
      Mt(t, "pointermove", Jt, i), Mt(t, "pointerup", Zt, i), Mt(t, "pointercancel", Qt, i);
      const c = y.value;
      c && Mt(c, "lostpointercapture", jt, i);
    }, Te = () => {
      const t = a.eventElement;
      if (!t) return;
      zt(t, "pointermove", Jt, !1), zt(t, "pointerup", Zt, !1), zt(t, "pointercancel", Qt, !1);
      const i = y.value;
      i && zt(i, "lostpointercapture", jt, !1), a.eventElement = null;
    }, Se = () => {
      const t = y.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, Ae = () => {
      const t = y.value, i = a.pointerId;
      if (a.pointerId = null, !(!t || i === null))
        try {
          t.hasPointerCapture(i) && t.releasePointerCapture(i);
        } catch {
        }
    };
    function Ct() {
      K !== null && (cancelAnimationFrame(K), K = null), J = null;
    }
    function Nt() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, O = !1, Te(), Ae();
    }
    function te() {
      St(), e.active || N(!1);
    }
    function ee() {
      Nt(), te();
    }
    function gt() {
      Ct(), O && (x == null || x.abortDrag(H)), ee();
    }
    function vt(t = null) {
      const i = a.isDragging, c = a.isResizing, f = O;
      if (Ct(), Nt(), i || c) {
        const b = r(a.beforeInteraction);
        R(b), l(i ? "drag-cancel" : "resize-cancel", t, b, r(b)), i && f && (x == null || x.cancelDrag(H, t));
      }
      te();
    }
    function ne() {
      gt(), N(!1);
    }
    const Ee = (t, i) => {
      var f, b;
      if (e.disabled || e.initRect || a.isDragging || a.isResizing || i && (!D.value || !Et(i)) || !i && !e.draggable) return;
      const c = r(u.value);
      if (i) {
        if (((f = e.canResize) == null ? void 0 : f.call(e, c, i)) === !1) return;
      } else if (((b = e.canDrag) == null ? void 0 : b.call(e, c)) === !1)
        return;
      O = !i && x !== null, O && (x == null || x.beginDrag(H, t)), L(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = r(u.value), a.handle = i, a.isDragging = !i, a.isResizing = !!i, N(!0), a.isDragging && l("drag-start", t, r(a.beforeInteraction)), a.isResizing && l("resize-start", t, r(a.beforeInteraction)), a.eventElement = document.documentElement, De(), Se();
    }, Ce = (t) => {
      if (!(t instanceof Element)) return !0;
      const i = y.value;
      if (!i) return !0;
      const c = (f) => {
        try {
          const b = t.closest(f);
          return {
            valid: !0,
            matched: b instanceof Element && i.contains(b)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (e.dragCancel) {
        const f = c(e.dragCancel);
        if (!f.valid || f.matched) return !1;
      }
      if (e.dragHandle) {
        const f = c(e.dragHandle);
        return f.valid && f.matched;
      }
      return !0;
    }, ie = (t, i) => {
      !t.isPrimary || t.button !== 0 || !i && !Ce(t.target) || Ee(t, i);
    };
    function Ne(t) {
      K !== null && (cancelAnimationFrame(K), K = null), J && (qt(J), J = null), a.isDragging && (l("drag-stop", t, r(a.beforeInteraction), r(u.value)), O && (x == null || x.endDrag(H, t))), a.isResizing && l("resize-stop", t, r(a.beforeInteraction), r(u.value)), ee();
    }
    const Pe = (t, i) => {
      var g;
      L();
      const c = r(u.value);
      if (((g = e.canDrag) == null ? void 0 : g.call(e, r(c))) === !1) return;
      const f = r(c);
      t === "left" && (f.left = m(f.left) - i), t === "right" && (f.left = m(f.left) + i), t === "top" && (f.top = m(f.top) - i), t === "bottom" && (f.top = m(f.top) + i);
      const b = Xt(f, c, e.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, c);
      if (b) {
        const w = R(b);
        l("move", r(w));
      }
    }, Be = (t, i, c) => {
      var S;
      if (!D.value || !Et(t)) return;
      L();
      const f = r(u.value);
      if (((S = e.canResize) == null ? void 0 : S.call(e, r(f), t)) === !1) return;
      const b = i === "left" ? -c : i === "right" ? c : 0, g = i === "top" ? -c : i === "bottom" ? c : 0, w = Yt(f, t, b, g);
      z(w);
      const F = At(w, f);
      if (!F || Rn(F, f)) return;
      const B = R(F);
      l("resize", r(B));
    }, Le = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, He = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Z = (t) => He.has(t), Fe = (t) => Z(t) ? "group" : "separator", ke = (t) => Z(t) ? "two-axis resize handle" : void 0, Ge = (t) => `Resize ${Le[t]}`, Oe = (t) => {
      if (!Z(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, bt = (t) => t === "ml" || t === "mr", oe = (t) => {
      if (!Z(t))
        return m(
          bt(t) ? u.value.width : u.value.height
        );
    }, We = (t) => {
      if (!Z(t))
        return m(bt(t) ? e.minWidth : e.minHeight);
    }, $e = (t) => {
      if (Z(t)) return;
      const i = bt(t) ? e.maxWidth : e.maxHeight;
      if (i === void 0) return;
      const c = m(i);
      return Number.isFinite(c) ? c : void 0;
    }, Ke = (t) => {
      const i = oe(t);
      if (i !== void 0)
        return e.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, Ve = (t) => {
      if (e.keyboardEnabled)
        return Z(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : bt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, _e = (t) => {
      t.target === y.value && e.keyboardEnabled && !e.disabled && !e.initRect && N(!0);
    }, Ue = [
      "a[href]",
      "button",
      "input",
      "select",
      "textarea",
      '[contenteditable]:not([contenteditable="false"])',
      '[role="button"]',
      '[role="link"]',
      '[role="textbox"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="slider"]',
      '[role="spinbutton"]',
      '[role="switch"]',
      '[role="combobox"]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(","), Xe = (t) => {
      const i = t.target, c = y.value;
      if (!(i instanceof Element) || !c || i === c || i.closest(".handle")) return !1;
      const f = i.closest(Ue);
      return f !== null && f !== c && c.contains(f);
    }, Ye = hn(
      () => ({
        enabled: e.keyboardEnabled,
        step: e.keyboardStep,
        disabled: e.disabled,
        readOnly: e.initRect,
        active: a.active,
        dragDirections: e.dragDirections,
        resizeDirections: e.resizeDirections,
        focusedHandle: v.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: Pe,
        resize: Be,
        deactivate: ne,
        cancel: (t) => vt(t)
      }
    ), qe = (t) => {
      Xe(t) || Ye.handleKeyDown(t);
    }, Pt = (t) => C.value ? t / 100 * a.parentWidth : t, Bt = (t) => C.value ? t / 100 * a.parentHeight : t, Je = (t) => ({
      left: `${Pt(t) - Pt(m(u.value.left))}px`,
      top: `${-Bt(m(u.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: e.theme
    }), Ze = (t) => ({
      top: `${Bt(t) - Bt(m(u.value.top))}px`,
      left: `${-Pt(m(u.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: e.theme
    });
    return o({
      getConfig: () => r(u.value),
      setPosition: (t, i) => R({ ...u.value, left: t, top: i }),
      setSize: (t, i) => R({ ...u.value, width: t, height: i }),
      reset: () => R(r(M)),
      activate: () => N(!0),
      deactivate: ne,
      cancelInteraction: (t = null) => vt(t)
    }), ln(() => {
      Ct(), Nt(), x == null || x.unregisterMember(H), St();
    }), (t, i) => (j(), tt("div", {
      ref_key: "movableRef",
      ref: y,
      class: de(["auto-draggable", {
        "select-none": n.disabledUserSelect,
        "is-disabled": n.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": n.initRect
      }]),
      style: yt(I.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (c) => ie(c, null)),
      onDblclick: i[2] || (i[2] = (c) => l("dblclick", c)),
      onFocus: _e,
      onKeydown: qe
    }, [
      (j(!0), tt(kt, null, Gt(fe(Ut).vertical, (c, f) => (j(), tt("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: yt(Je(c))
      }, null, 4))), 128)),
      (j(!0), tt(kt, null, Gt(fe(Ut).horizontal, (c, f) => (j(), tt("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: yt(Ze(c))
      }, null, 4))), 128)),
      (j(!0), tt(kt, null, Gt(n.handles, (c) => rn((j(), tt("div", {
        key: c,
        class: de(["handle", `handle-${c}`]),
        style: yt(k.value),
        role: Fe(c),
        "aria-roledescription": ke(c),
        "aria-orientation": Oe(c),
        "aria-label": Ge(c),
        "aria-valuenow": oe(c),
        "aria-valuemin": We(c),
        "aria-valuemax": $e(c),
        "aria-valuetext": Ke(c),
        "aria-keyshortcuts": Ve(c),
        tabindex: n.keyboardEnabled ? 0 : void 0,
        onPointerdown: sn((f) => ie(f, c), ["stop", "prevent"]),
        onFocus: (f) => v.value = c,
        onBlur: i[0] || (i[0] = (f) => v.value = null)
      }, null, 46, Tn)), [
        [cn, a.active && D.value && !n.disabled && Et(c)]
      ])), 128)),
      be(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), En = (n, o) => {
  const s = n.__vccOpts || n;
  for (const [e, l] of o)
    s[e] = l;
  return s;
}, Cn = /* @__PURE__ */ En(An, [["__scopeId", "data-v-d9168b30"]]), Nn = Dt({
  name: "MovableGroup"
}), Pn = /* @__PURE__ */ Dt({
  ...Nn,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(n, { expose: o, emit: s }) {
    const e = n, l = s, r = /* @__PURE__ */ new Map(), y = V([]), u = V(null), M = nt(() => e.selected !== void 0), v = nt({
      get: () => M.value ? e.selected ?? [] : y.value,
      set: (d) => {
        y.value = d, l("update:selected", d);
      }
    });
    ot(
      () => e.selected,
      (d) => {
        d !== void 0 && (y.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => dt(d), D = (d) => {
      const h = typeof d == "number" ? d : Number(d);
      return Number.isFinite(h) ? h : 0;
    }, C = (d, h, p) => ({
      ...d,
      left: D(d.left) + h,
      top: D(d.top) + p
    }), I = (d) => d.reduce(
      (h, p) => ({
        minLeft: Math.min(h.minLeft, D(p.left)),
        minTop: Math.min(h.minTop, D(p.top)),
        maxRight: Math.max(h.maxRight, D(p.left) + D(p.width)),
        maxBottom: Math.max(h.maxBottom, D(p.top) + D(p.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), k = (d, h, p) => {
      const z = I([...d.values()]);
      return {
        left: Math.min(
          Math.max(h.left, p.minLeft - z.minLeft),
          p.maxRight - z.maxRight
        ),
        top: Math.min(
          Math.max(h.top, p.minTop - z.minTop),
          p.maxBottom - z.maxBottom
        )
      };
    }, R = (d) => {
      const h = [];
      for (const [p, z] of d) {
        const A = r.get(p);
        A && h.push({ id: p, rect: a(A.getRect()), startRect: a(z) });
      }
      return h;
    }, N = (d) => d.map(({ id: h, rect: p }) => ({ id: h, rect: p })), L = (d) => {
      const h = d.filter((z) => r.has(z)), p = v.value;
      p.length === h.length && p.every((z, A) => z === h[A]) || (v.value = h);
    };
    return un(we, {
      registerMember: (d, h) => {
        r.set(d, h);
      },
      unregisterMember: (d) => {
        var h;
        if (r.delete(d), ((h = u.value) == null ? void 0 : h.leaderId) === d) {
          u.value = null;
          return;
        }
        u.value && u.value.startRects.delete(d), v.value.includes(d) && L(v.value.filter((p) => p !== d));
      },
      beginDrag: (d, h) => {
        if (!r.has(d)) return;
        v.value.includes(d) || L([d]);
        const p = /* @__PURE__ */ new Map();
        for (const A of v.value) {
          const x = r.get(A);
          x && p.set(A, a(x.getRect()));
        }
        u.value = { leaderId: d, startRects: p };
        const z = [];
        for (const [A, x] of p) z.push({ id: A, rect: a(x) });
        l("move-start", { leaderId: d, source: h, rects: z });
      },
      constrainPosition: (d, h) => {
        var O, ft;
        const p = u.value, z = p == null ? void 0 : p.startRects.get(d);
        if (!p || !z || !r.has(d)) return h;
        let A = D(h.left) - D(z.left), x = D(h.top) - D(z.top);
        if (e.sharedBounds) {
          const P = (O = r.get(d)) == null ? void 0 : O.getAreaEdges();
          if (P) {
            const q = k(p.startRects, { left: A, top: x }, P);
            A = q.left, x = q.top;
          }
        }
        const H = { left: A, top: x };
        for (const [P, q] of p.startRects)
          P !== d && ((ft = r.get(P)) == null || ft.translateTo(C(q, H.left, H.top)));
        return C(z, H.left, H.top);
      },
      notifyMoved: (d, h) => {
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        const z = N(R(p.startRects)).map(
          (A) => A.id === d ? { id: d, rect: a(h) } : A
        );
        l("move", { leaderId: d, rects: z });
      },
      endDrag: (d, h) => {
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        const z = R(p.startRects);
        u.value = null, l("move-stop", { leaderId: d, source: h, rects: z });
      },
      cancelDrag: (d, h) => {
        var A;
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        for (const [x, H] of p.startRects)
          x !== d && ((A = r.get(x)) == null || A.translateTo(a(H)));
        const z = R(p.startRects);
        u.value = null, l("move-cancel", { leaderId: d, source: h, rects: z });
      },
      abortDrag: (d) => {
        var h;
        ((h = u.value) == null ? void 0 : h.leaderId) === d && (u.value = null);
      }
    }), o({
      getSelected: () => [...v.value],
      select: (d) => L(d ?? [...r.keys()]),
      getMemberRects: () => [...r.entries()].map(([d, h]) => ({ id: d, rect: a(h.getRect()) }))
    }), (d, h) => be(d.$slots, "default");
  }
}), Ie = "VueMovableBox", Me = (n) => {
  n.component(Ie, Cn), n.component("MovableGroup", Pn);
}, Hn = {
  name: Ie,
  version: "2.1.0",
  install: Me
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Me });
export {
  Cn as MovableBox,
  Pn as MovableGroup,
  Hn as default,
  Ie as name
};
