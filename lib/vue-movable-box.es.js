import { computed as ot, ref as q, defineComponent as ue, reactive as _e, watch as nt, onUnmounted as qe, openBlock as X, createElementBlock as Y, normalizeStyle as ut, normalizeClass as oe, Fragment as Tt, renderList as Nt, unref as le, withDirectives as Je, withModifiers as Ze, vShow as Qe, renderSlot as je } from "vue";
import tn from "decimal.js";
const en = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, nn = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, on = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function ln(n, o) {
  return { handleKeyDown: (e) => {
    const a = n(), d = a.interacting;
    if (!d && (!a.enabled || a.disabled || !a.active)) return;
    if (e.key === "Escape") {
      e.preventDefault(), d ? o.cancel(e) : o.deactivate();
      return;
    }
    if (d || a.readOnly) return;
    const g = en[e.key];
    if (!g) return;
    const u = Number.isFinite(a.step) && a.step > 0 ? a.step : 1;
    if (a.focusedHandle && a.resizeDirections.includes(a.focusedHandle)) {
      if (!nn[a.focusedHandle].includes(g)) return;
      e.preventDefault(), o.resize(
        a.focusedHandle,
        e.shiftKey ? on[g] : g,
        u
      );
      return;
    }
    if (e.shiftKey) {
      const y = a.resizeDirections.includes("br") ? "br" : a.resizeDirections[0];
      if (!y) return;
      e.preventDefault(), o.resize(y, g, u);
      return;
    }
    a.dragDirections.includes(g) && (e.preventDefault(), o.move(g, u));
  } };
}
const ft = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, an = (n) => {
  const o = ft(n.left), r = ft(n.top), e = ft(n.width), a = ft(n.height);
  return o === null || r === null || e === null || a === null || e < 0 || a < 0 ? null : { left: o, top: r, width: e, height: a };
};
function rn(n, o) {
  const r = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(n / r) * r;
}
const ae = (n, o, r) => o.distance > r ? n : !n || o.distance < n.distance ? o : n;
function sn(n, o, r = 10, e = { horizontal: !0, vertical: !0 }) {
  const a = Math.max(0, Number.isFinite(r) ? r : 10), d = n.left + n.width, g = n.top + n.height, u = n.left + n.width / 2, y = n.top + n.height / 2;
  let m = null, l = null;
  for (const D of o) {
    const b = an(D);
    if (!b) continue;
    const N = b.left + b.width, w = b.top + b.height, M = b.left + b.width / 2, P = b.top + b.height / 2, x = D.id, G = [
      {
        distance: Math.abs(n.left - b.left),
        value: b.left,
        guide: b.left,
        point: "left",
        targetId: x
      },
      {
        distance: Math.abs(d - N),
        value: N - n.width,
        guide: N,
        point: "right",
        targetId: x
      },
      {
        distance: Math.abs(n.left - N),
        value: N,
        guide: N,
        point: "left",
        targetId: x
      },
      {
        distance: Math.abs(d - b.left),
        value: b.left - n.width,
        guide: b.left,
        point: "right",
        targetId: x
      },
      {
        distance: Math.abs(u - M),
        value: M - n.width / 2,
        guide: M,
        point: "center-x",
        targetId: x
      }
    ], V = [
      {
        distance: Math.abs(n.top - b.top),
        value: b.top,
        guide: b.top,
        point: "top",
        targetId: x
      },
      {
        distance: Math.abs(g - w),
        value: w - n.height,
        guide: w,
        point: "bottom",
        targetId: x
      },
      {
        distance: Math.abs(n.top - w),
        value: w,
        guide: w,
        point: "top",
        targetId: x
      },
      {
        distance: Math.abs(g - b.top),
        value: b.top - n.height,
        guide: b.top,
        point: "bottom",
        targetId: x
      },
      {
        distance: Math.abs(y - P),
        value: P - n.height / 2,
        guide: P,
        point: "center-y",
        targetId: x
      }
    ];
    if (e.horizontal)
      for (const L of G) m = ae(m, L, a);
    if (e.vertical)
      for (const L of V) l = ae(l, L, a);
  }
  const T = [m == null ? void 0 : m.point, l == null ? void 0 : l.point].filter(
    (D) => !!D
  );
  return {
    left: (m == null ? void 0 : m.value) ?? n.left,
    top: (l == null ? void 0 : l.value) ?? n.top,
    snapped: T.length > 0,
    snapPoint: T[0],
    points: T,
    targetId: (m == null ? void 0 : m.targetId) ?? (l == null ? void 0 : l.targetId),
    targetIds: { horizontal: m == null ? void 0 : m.targetId, vertical: l == null ? void 0 : l.targetId },
    guides: {
      vertical: m ? [m.guide] : [],
      horizontal: l ? [l.guide] : []
    }
  };
}
function cn(n) {
  const o = (a) => {
    const d = n();
    return d.snapToGrid ? rn(a, d.gridSize) : a;
  }, r = (a, d) => ({
    left: o(a),
    top: o(d)
  }), e = ot(() => {
    const a = n();
    return a.snapToGrid ? {
      size: Number.isFinite(a.gridSize) && a.gridSize > 0 ? a.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: r, gridInfo: e };
}
const Pt = () => ({ vertical: [], horizontal: [] });
function dn(n) {
  const o = q(Pt()), r = q(null);
  return { guides: o, lastSnapResult: r, resolveSnap: (g, u, y) => {
    const m = n(), l = m.enabled ? sn(g, u, m.threshold, y) : {
      ...g,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Pt()
    };
    return o.value = l.guides, r.value = l.snapped ? l : null, l;
  }, clearGuides: () => {
    o.value = Pt(), r.value = null;
  }, setGuides: (g) => {
    o.value = g;
  } };
}
const pt = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, fe = (n) => {
  const o = pt(n.left), r = pt(n.top), e = pt(n.width), a = pt(n.height);
  return o === null || r === null || e === null || a === null || e < 0 || a < 0 ? null : { left: o, top: r, width: e, height: a };
}, re = (n, o, r, e) => {
  const a = r - o;
  if (a === 0) return o < e ? n : null;
  const d = (e - o) / a;
  return a > 0 ? { ...n, exit: Math.min(n.exit, d) } : { ...n, entry: Math.max(n.entry, d) };
}, se = (n, o, r, e) => {
  const a = r - o;
  if (a === 0) return o > e ? n : null;
  const d = (e - o) / a;
  return a > 0 ? { ...n, entry: Math.max(n.entry, d) } : { ...n, exit: Math.min(n.exit, d) };
}, un = (n, o, r) => {
  let e = { entry: 0, exit: 1 };
  if (e = re(e, n.left, o.left, r.left + r.width), !e || (e = se(
    e,
    n.left + n.width,
    o.left + o.width,
    r.left
  ), !e) || (e = re(e, n.top, o.top, r.top + r.height), !e) || (e = se(
    e,
    n.top + n.height,
    o.top + o.height,
    r.top
  ), !e)) return null;
  const a = Math.max(0, e.entry), d = Math.min(1, e.exit);
  return a < d && d > 0 && a < 1 ? { entry: a, exit: d } : null;
};
function vt(n, o, r) {
  let e = null;
  for (const a of r) {
    const d = fe(a);
    if (!d) continue;
    const g = un(n, o, d);
    g && (!e || g.entry < e.entry) && (e = g);
  }
  return e;
}
function fn(n, o) {
  const r = Math.min(n.left + n.width, o.left + o.width) - Math.max(n.left, o.left), e = Math.min(n.top + n.height, o.top + o.height) - Math.max(n.top, o.top);
  if (r <= 0 || e <= 0) return { colliding: !1, overlapArea: 0 };
  const a = n.left + n.width / 2, d = n.top + n.height / 2, g = o.left + o.width / 2, u = o.top + o.height / 2, y = a - g, m = d - u;
  return {
    colliding: !0,
    direction: r <= e ? y > 0 ? "right" : "left" : m > 0 ? "bottom" : "top",
    overlap: Math.min(r, e),
    overlapArea: r * e
  };
}
function Bt(n, o, r) {
  const e = [];
  for (const a of o) {
    const d = fe(a);
    if (!d) continue;
    const g = fn(n, d);
    g.colliding && e.push({ ...g, targetId: a.id });
  }
  return e;
}
function ce(n) {
  let o = null;
  for (const r of n)
    (!o || (r.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = r);
  return o;
}
const Ht = (n) => n.reduce((o, r) => o + (r.overlapArea ?? 0), 0), pe = (n, o, r) => ({
  left: n.left + (o.left - n.left) * r,
  top: n.top + (o.top - n.top) * r,
  width: n.width + (o.width - n.width) * r,
  height: n.height + (o.height - n.height) * r
}), pn = (n, o) => n.left === o.left && n.top === o.top && n.width === o.width && n.height === o.height, Lt = (n, o, r, e) => {
  if (!vt(n, o, r)) return o;
  let a = 0, d = 1, g = n;
  for (let u = 0; u < 24; u += 1) {
    const y = (a + d) / 2, m = e(pe(n, o, y));
    vt(n, m, r) ? d = y : (g = m, a = y);
  }
  return g;
};
function hn(n) {
  const o = q([]), r = q(!1), e = (u, y) => {
    const l = n().enabled ? Bt(u, y) : [];
    return o.value = l, r.value = l.length > 0, {
      results: l,
      dominant: ce(l),
      totalOverlapArea: Ht(l)
    };
  }, a = (u) => (o.value = u, r.value = u.length > 0, {
    results: u,
    dominant: ce(u),
    totalOverlapArea: Ht(u)
  });
  return { collisions: o, isColliding: r, evaluate: e, resolveCandidate: (u, y, m, l = (D) => D, T = "path") => {
    const D = n(), b = e(u, m);
    if (!D.enabled || D.allowOverlap)
      return { accepted: !0, rect: u, ...b };
    const N = Bt(y, m), w = Ht(N);
    if (w > 0)
      return {
        accepted: b.totalOverlapArea < w,
        rect: u,
        ...b
      };
    const M = vt(y, u, m);
    if (b.results.length === 0 && !M)
      return { accepted: !0, rect: u, ...b };
    let P = b;
    if (b.results.length === 0 && M) {
      const G = pe(
        y,
        u,
        M.entry + (M.exit - M.entry) * 1e-3
      );
      P = a(Bt(G, m));
    }
    let x = null;
    if (T === "slide") {
      const G = Lt(
        y,
        { ...y, left: u.left },
        m,
        l
      ), V = Lt(
        y,
        { ...y, top: u.top },
        m,
        l
      ), L = l({
        ...u,
        left: G.left,
        top: V.top
      });
      vt(y, L, m) || (x = L);
    }
    return x ?? (x = Lt(y, u, m, l)), {
      accepted: !pn(x, y),
      rect: x,
      ...P
    };
  }, clearCollisions: () => {
    o.value = [], r.value = !1;
  } };
}
const f = (n, o = 0) => {
  if (n == null || n === "")
    return o;
  const r = typeof n == "string" ? Number(n) : n;
  return Number.isFinite(r) ? r : o;
}, it = (n, o, r) => Math.min(Math.max(n, o), r), gn = (n, o) => f(n.left) === f(o.left) && f(n.top) === f(o.top) && f(n.width) === f(o.width) && f(n.height) === f(o.height), mn = 2, _ = (n, o = 1) => {
  if (n == null || n === "")
    return o;
  const r = typeof n == "string" ? parseFloat(n) : n;
  return isNaN(r) ? o : r;
}, ht = (n, o = "px") => n == null || n === "" ? "0" : `${n}${o}`;
function gt(n, o, r, e) {
  n && n.addEventListener(o, r, e);
}
function mt(n, o, r, e) {
  n && n.removeEventListener(o, r, e);
}
const de = (n, o = 1, r = mn) => {
  const e = new tn(n).toDecimalPlaces(r).toNumber();
  return _(e, o);
}, bt = (n) => {
  if (n === null || typeof n != "object")
    return n;
  if (n instanceof Date)
    return new Date(n.getTime());
  if (n instanceof Array)
    return n.map((o) => bt(o));
  if (n instanceof Object) {
    const o = {};
    for (const r in n)
      n.hasOwnProperty(r) && (o[r] = bt(n[r]));
    return o;
  }
  return n;
}, vn = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], bn = ue({
  name: "VueMovableBox"
}), yn = /* @__PURE__ */ ue({
  ...bn,
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
    snapTargets: { type: Array, default: () => [] }
  },
  emits: ["update:modelValue", "drag", "drag-start", "drag-stop", "resize-start", "resize-stop", "drag-cancel", "resize-cancel", "resize", "move", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "snap", "guides", "collision"],
  setup(n, { expose: o, emit: r }) {
    const e = n, a = r, d = (t) => bt(t), g = q(), u = q(d(e.modelValue)), y = d(e.modelValue), m = q(null), l = _e({
      active: e.active,
      isDragging: !1,
      isResizing: !1,
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: d(e.modelValue),
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    nt(
      () => e.modelValue,
      (t) => {
        u.value = d(t);
      },
      { deep: !0 }
    ), nt(
      () => e.active,
      (t) => {
        !t && (l.isDragging || l.isResizing) ? st() : M(t);
      },
      { flush: "sync" }
    ), nt(
      () => e.disabled,
      (t) => {
        a("disabled", t), t && st();
      }
    ), nt(
      () => e.initRect,
      (t) => {
        t && st();
      }
    ), nt(
      () => e.isKeepDecimals,
      (t, i) => {
        !t && i && w({
          ...u.value,
          left: Math.round(f(u.value.left)),
          top: Math.round(f(u.value.top)),
          width: Math.round(f(u.value.width)),
          height: Math.round(f(u.value.height))
        });
      }
    );
    const T = ot(() => e.resizable ?? e.resizeable ?? !0), D = ot(() => e.unitType === "%"), b = ot(() => ({
      "--movable-box-theme": e.theme,
      borderColor: e.disabled ? e.inActiveColor : l.active ? e.theme : e.inActiveColor,
      left: ht(u.value.left, e.unitType),
      top: ht(u.value.top, e.unitType),
      width: ht(u.value.width, e.unitType),
      height: ht(u.value.height, e.unitType),
      zIndex: u.value.zIndex,
      cursor: e.disabled ? "not-allowed" : l.isDragging ? "move" : l.isResizing ? "nwse-resize" : "default",
      pointerEvents: e.disabled ? "none" : "auto",
      opacity: l.active ? 1 : 0.9,
      transform: "translateZ(0)",
      willChange: l.isDragging || l.isResizing ? "left, top, width, height" : "auto",
      transition: e.enableTransition && !l.isDragging && !l.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), N = ot(() => ({
      borderColor: T.value ? e.theme : e.inActiveColor,
      scale: de(1 / _(e.scale, 1), 1)
    })), w = (t) => {
      const i = d(t);
      return u.value = i, a("update:modelValue", d(i)), i;
    };
    function M(t) {
      l.active !== t && (l.active = t, a(t ? "active" : "inactive", d(u.value)), t || wt());
    }
    const P = () => {
      var i, s, c;
      let t = null;
      if (e.limitAreaClass)
        try {
          t = document.querySelector(e.limitAreaClass);
        } catch {
          t = null;
        }
      l.parentElement = t ?? ((i = g.value) == null ? void 0 : i.parentElement) ?? null, l.parentWidth = ((s = l.parentElement) == null ? void 0 : s.clientWidth) ?? 0, l.parentHeight = ((c = l.parentElement) == null ? void 0 : c.clientHeight) ?? 0;
    }, x = (t) => Math.max(0, Number(t) || 0), G = () => {
      const t = x(e.edgeDistance);
      return {
        top: t + x(e.boundsMargin.top),
        right: t + x(e.boundsMargin.right),
        bottom: t + x(e.boundsMargin.bottom),
        left: t + x(e.boundsMargin.left)
      };
    }, V = () => {
      const t = G(), i = D.value ? 100 : l.parentWidth, s = D.value ? 100 : l.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, i - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, s - t.bottom)
      };
    }, L = (t) => {
      const i = V();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - f(t.width)),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - f(t.height))
      };
    }, yt = (t) => {
      if (!l.parentElement) return;
      const i = V(), s = f(t.left), c = f(t.top), h = s + f(t.width), p = c + f(t.height);
      s < i.minLeft && a("out-of-bounds", "left"), h > i.maxRight && a("out-of-bounds", "right"), c < i.minTop && a("out-of-bounds", "top"), p > i.maxBottom && a("out-of-bounds", "bottom");
    }, me = (t) => {
      if (!e.limitAreaForParent || !l.parentElement) return t;
      const i = L(t);
      return {
        ...t,
        left: it(f(t.left), i.minLeft, i.maxLeft),
        top: it(f(t.top), i.minTop, i.maxTop)
      };
    }, A = (t) => e.isKeepDecimals ? de(t, 0, e.decimalPlaces) : Math.round(t), Ft = (t, i) => {
      const s = _(e.scale, 1), c = t / (s === 0 ? 1 : s);
      if (!D.value) return A(c);
      const h = i === "horizontal" ? l.parentWidth : l.parentHeight;
      return h > 0 ? A(c / h * 100) : 0;
    }, kt = cn(() => ({ snapToGrid: e.snapToGrid, gridSize: e.gridSize })), F = dn(() => ({ enabled: e.snapToElements, threshold: e.snapThreshold })), Ot = hn(() => ({
      enabled: e.collisionEnabled,
      allowOverlap: e.allowOverlap
    })), Wt = F.guides;
    let Z = "clear", Q = "clear", j = "clear";
    const lt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), at = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), xt = (t) => {
      const i = {
        horizontal: t.points.some((p) => lt.has(p)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((p) => at.has(p)) ? t.targetIds.vertical : void 0
      }, s = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: i
      } : { snapped: !1 }, c = JSON.stringify({
        payload: s,
        targetIds: i,
        left: t.points.some((p) => lt.has(p)) ? t.left : void 0,
        top: t.points.some((p) => at.has(p)) ? t.top : void 0
      });
      c !== Z && ((t.snapped || Z !== "clear") && a("snap", s), Z = t.snapped ? c : "clear");
      const h = JSON.stringify({ guides: t.guides, targetIds: i });
      h !== Q && ((t.snapped || Q !== "clear") && a("guides", bt(t.guides)), Q = t.snapped ? h : "clear");
    }, ve = (t) => {
      const i = t.dominant, s = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId
      } : { colliding: !1 }, c = JSON.stringify(s);
      c !== j && ((i || j !== "clear") && a("collision", s), j = i ? c : "clear");
    }, wt = () => {
      Z !== "clear" && a("snap", { snapped: !1 }), Q !== "clear" && a("guides", { vertical: [], horizontal: [] }), j !== "clear" && a("collision", { colliding: !1 }), Z = "clear", Q = "clear", j = "clear", F.clearGuides(), Ot.clearCollisions();
    }, tt = (t) => ({
      left: f(t.left),
      top: f(t.top),
      width: f(t.width),
      height: f(t.height)
    }), zt = (t, i, s = "path") => {
      const c = Ot.resolveCandidate(
        tt(t),
        tt(i),
        e.snapTargets,
        (h) => ({
          left: A(h.left),
          top: A(h.top),
          width: A(h.width),
          height: A(h.height)
        }),
        s
      );
      return ve(c), c.accepted ? { ...t, ...c.rect } : null;
    }, Gt = (t, i, s, c, h) => {
      let p = d(t);
      c.horizontal && (p.left = kt.snapValue(f(t.left))), c.vertical && (p.top = kt.snapValue(f(t.top)));
      let v = {
        ...tt(p),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] }
      };
      if (s ? (v = F.resolveSnap(tt(p), e.snapTargets, c), p = { ...p, left: v.left, top: v.top }) : F.clearGuides(), h) {
        const z = f(h.left), I = f(h.top);
        e.dragDirections.includes("left") || (p.left = Math.max(z, f(p.left))), e.dragDirections.includes("right") || (p.left = Math.min(z, f(p.left))), e.dragDirections.includes("top") || (p.top = Math.max(I, f(p.top))), e.dragDirections.includes("bottom") || (p.top = Math.min(I, f(p.top)));
      }
      yt(p), p = me(p);
      const R = zt(p, i, "slide");
      if (!R)
        return xt({
          ...v,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), F.clearGuides(), null;
      if (p = R, v.snapped) {
        const z = f(p.left) !== v.left, I = f(p.top) !== v.top, C = v.points.filter((E) => lt.has(E) ? !z : at.has(E) ? !I : !1), S = C.some((E) => lt.has(E)), k = C.some((E) => at.has(E));
        v = {
          ...v,
          left: f(p.left),
          top: f(p.top),
          snapped: C.length > 0,
          snapPoint: C[0],
          points: C,
          targetId: S ? v.targetIds.horizontal : k ? v.targetIds.vertical : void 0,
          targetIds: {
            horizontal: S ? v.targetIds.horizontal : void 0,
            vertical: k ? v.targetIds.vertical : void 0
          },
          guides: {
            vertical: S ? v.guides.vertical : [],
            horizontal: k ? v.guides.horizontal : []
          }
        }, v.snapped ? F.setGuides(v.guides) : F.clearGuides();
      }
      return xt(v), p;
    }, It = (t) => e.resizeDirections.includes(t), Vt = (t, i, s, c) => {
      const h = f(t.left), p = f(t.top), v = f(t.width), R = f(t.height);
      let z = h, I = h + v, C = p, S = p + R;
      i.includes("l") && (z += s), i.includes("r") && (I += s), i.includes("t") && (C += c), i.includes("b") && (S += c);
      const k = (z + I) / 2, E = (C + S) / 2;
      let B = Math.max(0, I - z), O = Math.max(0, S - C);
      const J = v > 0 && R > 0 ? v / R : 1, At = (U) => {
        B = U, i.includes("l") ? z = I - B : i.includes("r") ? I = z + B : (z = k - B / 2, I = k + B / 2);
      }, St = (U) => {
        O = U, i.includes("t") ? C = S - O : i.includes("b") ? S = C + O : (C = E - O / 2, S = E + O / 2);
      };
      if (e.ratioLock) {
        const U = Math.abs(B - v), Ye = Math.abs(O - R) * J;
        i === "tm" || i === "bm" || Ye > U ? At(O * J) : St(B / J);
      }
      const W = V(), jt = e.limitAreaForParent && !!l.parentElement, Ue = jt ? i.includes("l") ? Math.max(0, I - W.minLeft) : i.includes("r") ? Math.max(0, W.maxRight - z) : Math.max(
        0,
        2 * Math.min(k - W.minLeft, W.maxRight - k)
      ) : 1 / 0, Xe = jt ? i.includes("t") ? Math.max(0, S - W.minTop) : i.includes("b") ? Math.max(0, W.maxBottom - C) : Math.max(
        0,
        2 * Math.min(E - W.minTop, W.maxBottom - E)
      ) : 1 / 0, te = Math.max(0, _(e.minWidth, 0)), ee = Math.max(0, _(e.minHeight, 0)), ne = _(e.maxWidth, 1 / 0), ie = _(e.maxHeight, 1 / 0);
      let et = Math.min(ne > 0 ? ne : 1 / 0, Ue), Et = Math.min(ie > 0 ? ie : 1 / 0, Xe);
      if (e.ratioLock) {
        et = Math.min(et, Et * J);
        const U = Math.max(te, ee * J);
        At(it(B, U, et)), St(B / J);
      } else
        At(it(B, Math.min(te, et), et)), St(it(O, Math.min(ee, Et), Et));
      return {
        ...t,
        left: A(z),
        top: A(C),
        width: A(I - z),
        height: A(S - C)
      };
    };
    let H = null, K = null;
    const Kt = (t) => {
      if (e.disabled || e.initRect || !l.isDragging && !l.isResizing) return;
      const i = Ft(t.clientX - l.initX, "horizontal"), s = Ft(t.clientY - l.initY, "vertical"), c = d(u.value);
      if (l.isDragging) {
        const h = l.beforeInteraction;
        let p = f(h.left) + i, v = f(h.top) + s;
        const R = {
          horizontal: i < 0 && e.dragDirections.includes("left") || i > 0 && e.dragDirections.includes("right"),
          vertical: s < 0 && e.dragDirections.includes("top") || s > 0 && e.dragDirections.includes("bottom")
        };
        R.horizontal || (p = f(h.left)), R.vertical || (v = f(h.top));
        const z = Gt(
          { ...h, left: A(p), top: A(v) },
          c,
          e.snapToElements,
          R,
          h
        );
        if (z) {
          const I = w(z);
          a("move", d(I)), a("drag", d(I));
        }
      }
      if (l.isResizing && l.handle) {
        xt({
          ...tt(c),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] }
        }), F.clearGuides();
        const h = Vt(l.beforeInteraction, l.handle, i, s);
        yt(h);
        const p = zt(h, c);
        if (p) {
          const v = w(p);
          a("resize", d(v));
        }
      }
    }, be = (t) => {
      !l.active || e.disabled || e.initRect || (K = t, H === null && (H = requestAnimationFrame(() => {
        H = null;
        const i = K;
        K = null, i && Kt(i);
      })));
    }, rt = (t) => l.pointerId === null || t.pointerId === l.pointerId, $t = (t) => {
      rt(t) && be(t);
    }, Ut = (t) => {
      rt(t) && De(t);
    }, Xt = (t) => {
      rt(t) && ct(t);
    }, Yt = (t) => {
      rt(t) && (l.isDragging || l.isResizing) && ct(t);
    }, ye = () => {
      const t = l.eventElement;
      if (!t) return;
      const i = { passive: !1 };
      gt(t, "pointermove", $t, i), gt(t, "pointerup", Ut, i), gt(t, "pointercancel", Xt, i);
      const s = g.value;
      s && gt(s, "lostpointercapture", Yt, i);
    }, xe = () => {
      const t = l.eventElement;
      if (!t) return;
      mt(t, "pointermove", $t, !1), mt(t, "pointerup", Ut, !1), mt(t, "pointercancel", Xt, !1);
      const i = g.value;
      i && mt(i, "lostpointercapture", Yt, !1), l.eventElement = null;
    }, we = () => {
      const t = g.value;
      if (!(!t || l.pointerId === null))
        try {
          t.setPointerCapture(l.pointerId);
        } catch {
        }
    }, ze = () => {
      const t = g.value, i = l.pointerId;
      if (l.pointerId = null, !(!t || i === null))
        try {
          t.hasPointerCapture(i) && t.releasePointerCapture(i);
        } catch {
        }
    };
    function Mt() {
      H !== null && (cancelAnimationFrame(H), H = null), K = null;
    }
    function Dt() {
      l.isDragging = !1, l.isResizing = !1, l.handle = null, xe(), ze();
    }
    function _t() {
      wt(), e.active || M(!1);
    }
    function qt() {
      Dt(), _t();
    }
    function st() {
      Mt(), qt();
    }
    function ct(t = null) {
      const i = l.isDragging, s = l.isResizing;
      if (Mt(), Dt(), i || s) {
        const c = d(l.beforeInteraction);
        w(c), a(i ? "drag-cancel" : "resize-cancel", t, c, d(c));
      }
      _t();
    }
    function Jt() {
      st(), M(!1);
    }
    const Ie = (t, i) => {
      var c, h;
      if (e.disabled || e.initRect || l.isDragging || l.isResizing || i && (!T.value || !It(i)) || !i && !e.draggable) return;
      const s = d(u.value);
      if (i) {
        if (((c = e.canResize) == null ? void 0 : c.call(e, s, i)) === !1) return;
      } else if (((h = e.canDrag) == null ? void 0 : h.call(e, s)) === !1)
        return;
      P(), l.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, l.initX = t.clientX, l.initY = t.clientY, l.beforeInteraction = d(u.value), l.handle = i, l.isDragging = !i, l.isResizing = !!i, M(!0), l.isDragging && a("drag-start", t, d(l.beforeInteraction)), l.isResizing && a("resize-start", t, d(l.beforeInteraction)), l.eventElement = document.documentElement, ye(), we();
    }, Me = (t) => {
      if (!(t instanceof Element)) return !0;
      const i = g.value;
      if (!i) return !0;
      const s = (c) => {
        try {
          const h = t.closest(c);
          return {
            valid: !0,
            matched: h instanceof Element && i.contains(h)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (e.dragCancel) {
        const c = s(e.dragCancel);
        if (!c.valid || c.matched) return !1;
      }
      if (e.dragHandle) {
        const c = s(e.dragHandle);
        return c.valid && c.matched;
      }
      return !0;
    }, Zt = (t, i) => {
      !t.isPrimary || t.button !== 0 || !i && !Me(t.target) || Ie(t, i);
    };
    function De(t) {
      H !== null && (cancelAnimationFrame(H), H = null), K && (Kt(K), K = null), l.isDragging && a("drag-stop", t, d(l.beforeInteraction), d(u.value)), l.isResizing && a("resize-stop", t, d(l.beforeInteraction), d(u.value)), qt();
    }
    const Re = (t, i) => {
      var p;
      P();
      const s = d(u.value);
      if (((p = e.canDrag) == null ? void 0 : p.call(e, d(s))) === !1) return;
      const c = d(s);
      t === "left" && (c.left = f(c.left) - i), t === "right" && (c.left = f(c.left) + i), t === "top" && (c.top = f(c.top) - i), t === "bottom" && (c.top = f(c.top) + i);
      const h = Gt(c, s, e.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, s);
      if (h) {
        const v = w(h);
        a("move", d(v));
      }
    }, Ce = (t, i, s) => {
      var I;
      if (!T.value || !It(t)) return;
      P();
      const c = d(u.value);
      if (((I = e.canResize) == null ? void 0 : I.call(e, d(c), t)) === !1) return;
      const h = i === "left" ? -s : i === "right" ? s : 0, p = i === "top" ? -s : i === "bottom" ? s : 0, v = Vt(c, t, h, p);
      yt(v);
      const R = zt(v, c);
      if (!R || gn(R, c)) return;
      const z = w(R);
      a("resize", d(z));
    }, Ae = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Se = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), $ = (t) => Se.has(t), Ee = (t) => $(t) ? "group" : "separator", Te = (t) => $(t) ? "two-axis resize handle" : void 0, Ne = (t) => `Resize ${Ae[t]}`, Pe = (t) => {
      if (!$(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, dt = (t) => t === "ml" || t === "mr", Qt = (t) => {
      if (!$(t))
        return f(
          dt(t) ? u.value.width : u.value.height
        );
    }, Be = (t) => {
      if (!$(t))
        return f(dt(t) ? e.minWidth : e.minHeight);
    }, He = (t) => {
      if ($(t)) return;
      const i = dt(t) ? e.maxWidth : e.maxHeight;
      if (i === void 0) return;
      const s = f(i);
      return Number.isFinite(s) ? s : void 0;
    }, Le = (t) => {
      const i = Qt(t);
      if (i !== void 0)
        return e.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, Fe = (t) => {
      if (e.keyboardEnabled)
        return $(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : dt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, ke = (t) => {
      t.target === g.value && e.keyboardEnabled && !e.disabled && !e.initRect && M(!0);
    }, Oe = [
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
    ].join(","), We = (t) => {
      const i = t.target, s = g.value;
      if (!(i instanceof Element) || !s || i === s || i.closest(".handle")) return !1;
      const c = i.closest(Oe);
      return c !== null && c !== s && s.contains(c);
    }, Ge = ln(
      () => ({
        enabled: e.keyboardEnabled,
        step: e.keyboardStep,
        disabled: e.disabled,
        readOnly: e.initRect,
        active: l.active,
        dragDirections: e.dragDirections,
        resizeDirections: e.resizeDirections,
        focusedHandle: m.value,
        interacting: l.isDragging || l.isResizing
      }),
      {
        move: Re,
        resize: Ce,
        deactivate: Jt,
        cancel: (t) => ct(t)
      }
    ), Ve = (t) => {
      We(t) || Ge.handleKeyDown(t);
    }, Rt = (t) => D.value ? t / 100 * l.parentWidth : t, Ct = (t) => D.value ? t / 100 * l.parentHeight : t, Ke = (t) => ({
      left: `${Rt(t) - Rt(f(u.value.left))}px`,
      top: `${-Ct(f(u.value.top))}px`,
      height: `${l.parentHeight}px`,
      borderColor: e.theme
    }), $e = (t) => ({
      top: `${Ct(t) - Ct(f(u.value.top))}px`,
      left: `${-Rt(f(u.value.left))}px`,
      width: `${l.parentWidth}px`,
      borderColor: e.theme
    });
    return o({
      getConfig: () => d(u.value),
      setPosition: (t, i) => w({ ...u.value, left: t, top: i }),
      setSize: (t, i) => w({ ...u.value, width: t, height: i }),
      reset: () => w(d(y)),
      activate: () => M(!0),
      deactivate: Jt,
      cancelInteraction: (t = null) => ct(t)
    }), qe(() => {
      Mt(), Dt(), wt();
    }), (t, i) => (X(), Y("div", {
      ref_key: "movableRef",
      ref: g,
      class: oe(["auto-draggable", {
        "select-none": n.disabledUserSelect,
        "is-disabled": n.disabled,
        "is-active": l.active,
        "is-dragging": l.isDragging,
        "is-resizing": l.isResizing,
        "is-readonly": n.initRect
      }]),
      style: ut(b.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (s) => Zt(s, null)),
      onDblclick: i[2] || (i[2] = (s) => a("dblclick", s)),
      onFocus: ke,
      onKeydown: Ve
    }, [
      (X(!0), Y(Tt, null, Nt(le(Wt).vertical, (s, c) => (X(), Y("div", {
        key: `vertical-${c}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: ut(Ke(s))
      }, null, 4))), 128)),
      (X(!0), Y(Tt, null, Nt(le(Wt).horizontal, (s, c) => (X(), Y("div", {
        key: `horizontal-${c}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: ut($e(s))
      }, null, 4))), 128)),
      (X(!0), Y(Tt, null, Nt(n.handles, (s) => Je((X(), Y("div", {
        key: s,
        class: oe(["handle", `handle-${s}`]),
        style: ut(N.value),
        role: Ee(s),
        "aria-roledescription": Te(s),
        "aria-orientation": Pe(s),
        "aria-label": Ne(s),
        "aria-valuenow": Qt(s),
        "aria-valuemin": Be(s),
        "aria-valuemax": He(s),
        "aria-valuetext": Le(s),
        "aria-keyshortcuts": Fe(s),
        tabindex: n.keyboardEnabled ? 0 : void 0,
        onPointerdown: Ze((c) => Zt(c, s), ["stop", "prevent"]),
        onFocus: (c) => m.value = s,
        onBlur: i[0] || (i[0] = (c) => m.value = null)
      }, null, 46, vn)), [
        [Qe, l.active && T.value && !n.disabled && It(s)]
      ])), 128)),
      je(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), xn = (n, o) => {
  const r = n.__vccOpts || n;
  for (const [e, a] of o)
    r[e] = a;
  return r;
}, wn = /* @__PURE__ */ xn(yn, [["__scopeId", "data-v-d365edc3"]]), he = "VueMovableBox", ge = (n) => {
  n.component(he, wn);
}, Mn = {
  name: he,
  version: "2.0.0-beta.1",
  install: ge
};
typeof window < "u" && window.Vue && window.Vue.use({ install: ge });
export {
  wn as MovableBox,
  Mn as default,
  he as name
};
