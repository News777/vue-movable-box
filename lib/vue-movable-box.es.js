import { computed as ot, ref as q, defineComponent as St, reactive as an, watch as st, inject as ln, getCurrentInstance as sn, onMounted as rn, onUnmounted as cn, openBlock as et, createElementBlock as nt, normalizeStyle as xt, normalizeClass as ue, Fragment as Wt, renderList as $t, unref as fe, withDirectives as dn, withModifiers as un, vShow as fn, renderSlot as Ie, provide as pn } from "vue";
import gn from "decimal.js";
const hn = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, mn = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, vn = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function bn(n, o) {
  return { handleKeyDown: (e) => {
    const l = n(), s = l.interacting;
    if (!s && (!l.enabled || l.disabled || !l.active)) return;
    if (e.key === "Escape") {
      e.preventDefault(), s ? o.cancel(e) : o.deactivate();
      return;
    }
    if (s || l.readOnly) return;
    const m = hn[e.key];
    if (!m) return;
    const c = Number.isFinite(l.step) && l.step > 0 ? l.step : 1;
    if (l.focusedHandle && l.resizeDirections.includes(l.focusedHandle)) {
      if (!mn[l.focusedHandle].includes(m)) return;
      e.preventDefault(), o.resize(
        l.focusedHandle,
        e.shiftKey ? vn[m] : m,
        c
      );
      return;
    }
    if (e.shiftKey) {
      const z = l.resizeDirections.includes("br") ? "br" : l.resizeDirections[0];
      if (!z) return;
      e.preventDefault(), o.resize(z, m, c);
      return;
    }
    l.dragDirections.includes(m) && (e.preventDefault(), o.move(m, c));
  } };
}
const Mt = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, yn = (n) => {
  const o = Mt(n.left), r = Mt(n.top), e = Mt(n.width), l = Mt(n.height);
  return o === null || r === null || e === null || l === null || e < 0 || l < 0 ? null : { left: o, top: r, width: e, height: l };
};
function In(n, o) {
  const r = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(n / r) * r;
}
const pe = (n, o, r) => o.distance > r ? n : !n || o.distance < n.distance ? o : n, we = ["alignment", "spacing"], ge = (n, o, r, e, l) => {
  const s = l.length > 0 ? l : we;
  for (const m of s) {
    const c = m === "alignment" ? o : r;
    if (c && c.distance <= e) {
      if (m === "alignment") {
        const w = c;
        return {
          candidate: w,
          spacing: null,
          guides: [w.guide],
          spacingInfo: null,
          value: w.value
        };
      }
      const z = c;
      return {
        candidate: null,
        spacing: z,
        guides: z.guides,
        spacingInfo: {
          axis: n,
          gap: z.gap,
          targetIds: z.targetIds,
          guides: z.guides
        },
        value: z.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, he = (n, o, r, e, l) => {
  const s = (a) => n === "horizontal" ? a.left : a.top, m = (a) => n === "horizontal" ? a.left + a.width : a.top + a.height, c = [], z = [];
  for (const a of l)
    m(a.rect) <= o && c.push(a), s(a.rect) >= o + r && z.push(a);
  let w = null;
  for (const a of c)
    for (const D of z) {
      const N = s(D.rect) - m(a.rect) - r;
      if (N < 0) continue;
      const H = N / 2, V = m(a.rect) + H, E = Math.abs(o - V);
      E > e || (!w || E < w.distance) && (w = {
        distance: E,
        value: V,
        gap: H,
        guides: [m(a.rect), s(D.rect)],
        targetIds: [a.id, D.id]
      });
    }
  return w;
};
function wn(n, o, r = 10, e = { horizontal: !0, vertical: !0 }, l = {}) {
  const s = Math.max(0, Number.isFinite(r) ? r : 10), m = n.left + n.width, c = n.top + n.height, z = n.left + n.width / 2, w = n.top + n.height / 2, a = l.priority ?? we, D = (x, v) => l.filter ? l.filter(x, v) !== !1 : !0;
  let N = null, H = null;
  const V = [], E = [];
  for (const x of o) {
    const v = yn(x);
    if (!v) continue;
    const M = e.horizontal && D(x, "horizontal"), B = e.vertical && D(x, "vertical");
    if (M && V.push({ rect: v, id: x.id }), B && E.push({ rect: v, id: x.id }), !M && !B) continue;
    const k = v.left + v.width, K = v.top + v.height, C = v.left + v.width / 2, Y = v.top + v.height / 2, O = x.id, X = [
      {
        distance: Math.abs(n.left - v.left),
        value: v.left,
        guide: v.left,
        point: "left",
        targetId: O
      },
      {
        distance: Math.abs(m - k),
        value: k - n.width,
        guide: k,
        point: "right",
        targetId: O
      },
      {
        distance: Math.abs(n.left - k),
        value: k,
        guide: k,
        point: "left",
        targetId: O
      },
      {
        distance: Math.abs(m - v.left),
        value: v.left - n.width,
        guide: v.left,
        point: "right",
        targetId: O
      },
      {
        distance: Math.abs(z - C),
        value: C - n.width / 2,
        guide: C,
        point: "center-x",
        targetId: O
      }
    ], ht = [
      {
        distance: Math.abs(n.top - v.top),
        value: v.top,
        guide: v.top,
        point: "top",
        targetId: O
      },
      {
        distance: Math.abs(c - K),
        value: K - n.height,
        guide: K,
        point: "bottom",
        targetId: O
      },
      {
        distance: Math.abs(n.top - K),
        value: K,
        guide: K,
        point: "top",
        targetId: O
      },
      {
        distance: Math.abs(c - v.top),
        value: v.top - n.height,
        guide: v.top,
        point: "bottom",
        targetId: O
      },
      {
        distance: Math.abs(w - Y),
        value: Y - n.height / 2,
        guide: Y,
        point: "center-y",
        targetId: O
      }
    ];
    if (M)
      for (const at of X) N = pe(N, at, s);
    if (B)
      for (const at of ht) H = pe(H, at, s);
  }
  const R = e.horizontal ? ge(
    "horizontal",
    N,
    he(
      "horizontal",
      n.left,
      n.width,
      s,
      V
    ),
    s,
    a
  ) : null, T = e.vertical ? ge(
    "vertical",
    H,
    he("vertical", n.top, n.height, s, E),
    s,
    a
  ) : null, P = (R == null ? void 0 : R.candidate) ?? null, d = (T == null ? void 0 : T.candidate) ?? null, p = [P == null ? void 0 : P.point, d == null ? void 0 : d.point].filter(
    (x) => !!x
  ), g = [R == null ? void 0 : R.spacingInfo, T == null ? void 0 : T.spacingInfo].filter(
    (x) => !!x
  );
  return {
    left: (R == null ? void 0 : R.value) ?? n.left,
    top: (T == null ? void 0 : T.value) ?? n.top,
    snapped: p.length > 0 || g.length > 0,
    snapPoint: p[0],
    points: p,
    targetId: (P == null ? void 0 : P.targetId) ?? (d == null ? void 0 : d.targetId),
    targetIds: { horizontal: P == null ? void 0 : P.targetId, vertical: d == null ? void 0 : d.targetId },
    guides: {
      vertical: (R == null ? void 0 : R.guides) ?? [],
      horizontal: (T == null ? void 0 : T.guides) ?? []
    },
    spacing: g
  };
}
function xn(n) {
  const o = (l) => {
    const s = n();
    return s.snapToGrid ? In(l, s.gridSize) : l;
  }, r = (l, s) => ({
    left: o(l),
    top: o(s)
  }), e = ot(() => {
    const l = n();
    return l.snapToGrid ? {
      size: Number.isFinite(l.gridSize) && l.gridSize > 0 ? l.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: r, gridInfo: e };
}
const Vt = () => ({ vertical: [], horizontal: [] });
function Mn(n) {
  const o = q(Vt()), r = q(null);
  return { guides: o, lastSnapResult: r, resolveSnap: (m, c, z) => {
    const w = n(), a = w.enabled ? wn(m, c, w.threshold, z, {
      filter: w.filter,
      priority: w.priority
    }) : {
      ...m,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Vt(),
      spacing: []
    };
    return o.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    o.value = Vt(), r.value = null;
  }, setGuides: (m) => {
    o.value = m;
  } };
}
const zt = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const o = Number(n);
  return Number.isFinite(o) ? o : null;
}, xe = (n) => {
  const o = zt(n.left), r = zt(n.top), e = zt(n.width), l = zt(n.height);
  return o === null || r === null || e === null || l === null || e < 0 || l < 0 ? null : { left: o, top: r, width: e, height: l };
}, me = (n, o, r, e) => {
  const l = r - o;
  if (l === 0) return o < e ? n : null;
  const s = (e - o) / l;
  return l > 0 ? { ...n, exit: Math.min(n.exit, s) } : { ...n, entry: Math.max(n.entry, s) };
}, ve = (n, o, r, e) => {
  const l = r - o;
  if (l === 0) return o > e ? n : null;
  const s = (e - o) / l;
  return l > 0 ? { ...n, entry: Math.max(n.entry, s) } : { ...n, exit: Math.min(n.exit, s) };
}, zn = (n, o, r) => {
  let e = { entry: 0, exit: 1 };
  if (e = me(e, n.left, o.left, r.left + r.width), !e || (e = ve(
    e,
    n.left + n.width,
    o.left + o.width,
    r.left
  ), !e) || (e = me(e, n.top, o.top, r.top + r.height), !e) || (e = ve(
    e,
    n.top + n.height,
    o.top + o.height,
    r.top
  ), !e)) return null;
  const l = Math.max(0, e.entry), s = Math.min(1, e.exit);
  return l < s && s > 0 && l < 1 ? { entry: l, exit: s } : null;
};
function Tt(n, o, r) {
  let e = null;
  for (const l of r) {
    const s = xe(l);
    if (!s) continue;
    const m = zn(n, o, s);
    m && (!e || m.entry < e.entry) && (e = m);
  }
  return e;
}
function Rn(n, o) {
  const r = Math.min(n.left + n.width, o.left + o.width) - Math.max(n.left, o.left), e = Math.min(n.top + n.height, o.top + o.height) - Math.max(n.top, o.top);
  if (r <= 0 || e <= 0) return { colliding: !1, overlapArea: 0 };
  const l = n.left + n.width / 2, s = n.top + n.height / 2, m = o.left + o.width / 2, c = o.top + o.height / 2, z = l - m, w = s - c;
  return {
    colliding: !0,
    direction: r <= e ? z > 0 ? "right" : "left" : w > 0 ? "bottom" : "top",
    overlap: Math.min(r, e),
    overlapArea: r * e
  };
}
function Kt(n, o, r) {
  const e = [];
  for (const l of o) {
    const s = xe(l);
    if (!s) continue;
    const m = Rn(n, s);
    m.colliding && e.push({ ...m, targetId: l.id });
  }
  return e;
}
function be(n) {
  let o = null;
  for (const r of n)
    (!o || (r.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = r);
  return o;
}
const Yt = (n) => n.reduce((o, r) => o + (r.overlapArea ?? 0), 0), Me = (n, o, r) => ({
  left: n.left + (o.left - n.left) * r,
  top: n.top + (o.top - n.top) * r,
  width: n.width + (o.width - n.width) * r,
  height: n.height + (o.height - n.height) * r
}), Dn = (n, o) => n.left === o.left && n.top === o.top && n.width === o.width && n.height === o.height, Xt = (n, o, r, e) => {
  if (!Tt(n, o, r)) return o;
  let l = 0, s = 1, m = n;
  for (let c = 0; c < 24; c += 1) {
    const z = (l + s) / 2, w = e(Me(n, o, z));
    Tt(n, w, r) ? s = z : (m = w, l = z);
  }
  return m;
};
function En(n) {
  const o = q([]), r = q(!1), e = (c, z) => {
    const a = n().enabled ? Kt(c, z) : [];
    return o.value = a, r.value = a.length > 0, {
      results: a,
      dominant: be(a),
      totalOverlapArea: Yt(a)
    };
  }, l = (c) => (o.value = c, r.value = c.length > 0, {
    results: c,
    dominant: be(c),
    totalOverlapArea: Yt(c)
  });
  return { collisions: o, isColliding: r, evaluate: e, resolveCandidate: (c, z, w, a = (N) => N, D = "path") => {
    const N = n(), H = e(c, w);
    if (!N.enabled || N.allowOverlap)
      return { accepted: !0, rect: c, ...H };
    const V = Kt(z, w), E = Yt(V);
    if (E > 0)
      return {
        accepted: H.totalOverlapArea < E,
        rect: c,
        ...H
      };
    const R = Tt(z, c, w);
    if (H.results.length === 0 && !R)
      return { accepted: !0, rect: c, ...H };
    let T = H;
    if (H.results.length === 0 && R) {
      const d = Me(
        z,
        c,
        R.entry + (R.exit - R.entry) * 1e-3
      );
      T = l(Kt(d, w));
    }
    let P = null;
    if (D === "slide") {
      const d = Xt(
        z,
        { ...z, left: c.left },
        w,
        a
      ), p = Xt(
        z,
        { ...z, top: c.top },
        w,
        a
      ), g = a({
        ...c,
        left: d.left,
        top: p.top
      });
      Tt(z, g, w) || (P = g);
    }
    return P ?? (P = Xt(z, c, w, a)), {
      accepted: !Dn(P, z),
      rect: P,
      ...T
    };
  }, clearCollisions: () => {
    o.value = [], r.value = !1;
  } };
}
const h = (n, o = 0) => {
  if (n == null || n === "")
    return o;
  const r = typeof n == "string" ? Number(n) : n;
  return Number.isFinite(r) ? r : o;
}, gt = (n, o, r) => Math.min(Math.max(n, o), r), Tn = (n, o) => h(n.left) === h(o.left) && h(n.top) === h(o.top) && h(n.width) === h(o.width) && h(n.height) === h(o.height), ze = Symbol("MovableGroupContext"), Sn = 2, it = (n, o = 1) => {
  if (n == null || n === "")
    return o;
  const r = typeof n == "string" ? parseFloat(n) : n;
  return isNaN(r) ? o : r;
}, Rt = (n, o = "px") => n == null || n === "" ? "0" : `${n}${o}`;
function Dt(n, o, r, e) {
  n && n.addEventListener(o, r, e);
}
function Et(n, o, r, e) {
  n && n.removeEventListener(o, r, e);
}
const ye = (n, o = 1, r = Sn) => {
  const e = new gn(n).toDecimalPlaces(r).toNumber();
  return it(e, o);
}, rt = (n) => {
  if (n === null || typeof n != "object")
    return n;
  if (n instanceof Date)
    return new Date(n.getTime());
  if (n instanceof Array)
    return n.map((o) => rt(o));
  if (n instanceof Object) {
    const o = {};
    for (const r in n)
      n.hasOwnProperty(r) && (o[r] = rt(n[r]));
    return o;
  }
  return n;
}, An = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Cn = St({
  name: "VueMovableBox"
}), Pn = /* @__PURE__ */ St({
  ...Cn,
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
    /** Return false to exclude a snap target from snapping on the given axis. */
    snapFilter: {
      type: Function,
      default: void 0
    },
    /** Strategy consultation order per axis. Default: alignment wins over spacing. */
    snapPriority: {
      type: Array,
      default: () => ["alignment", "spacing"]
    },
    collisionEnabled: { type: Boolean, default: !1 },
    allowOverlap: { type: Boolean, default: !1 },
    snapTargets: { type: Array, default: () => [] },
    /** Stable identifier used by a surrounding MovableGroup; auto-generated when omitted. */
    memberId: String
  },
  emits: ["update:modelValue", "drag", "drag-start", "drag-stop", "resize-start", "resize-stop", "drag-cancel", "resize-cancel", "resize", "move", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "snap", "guides", "collision"],
  setup(n, { expose: o, emit: r }) {
    var ae;
    const e = n, l = r, s = (t) => rt(t), m = q(), c = q(s(e.modelValue)), z = s(e.modelValue), w = q(null), a = an({
      active: e.active,
      isDragging: !1,
      isResizing: !1,
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: s(e.modelValue),
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    st(
      () => e.modelValue,
      (t) => {
        c.value = s(t);
      },
      { deep: !0 }
    ), st(
      () => e.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? yt() : R(t);
      },
      { flush: "sync" }
    ), st(
      () => e.disabled,
      (t) => {
        l("disabled", t), t && yt();
      }
    ), st(
      () => e.initRect,
      (t) => {
        t && yt();
      }
    ), st(
      () => e.isKeepDecimals,
      (t, i) => {
        !t && i && E({
          ...c.value,
          left: Math.round(h(c.value.left)),
          top: Math.round(h(c.value.top)),
          width: Math.round(h(c.value.width)),
          height: Math.round(h(c.value.height))
        });
      }
    );
    const D = ot(() => e.resizable ?? e.resizeable ?? !0), N = ot(() => e.unitType === "%"), H = ot(() => ({
      "--movable-box-theme": e.theme,
      borderColor: e.disabled ? e.inActiveColor : a.active ? e.theme : e.inActiveColor,
      left: Rt(c.value.left, e.unitType),
      top: Rt(c.value.top, e.unitType),
      width: Rt(c.value.width, e.unitType),
      height: Rt(c.value.height, e.unitType),
      zIndex: c.value.zIndex,
      cursor: e.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : "default",
      pointerEvents: e.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: "translateZ(0)",
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: e.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), V = ot(() => ({
      borderColor: D.value ? e.theme : e.inActiveColor,
      scale: ye(1 / it(e.scale, 1), 1)
    })), E = (t) => {
      const i = s(t);
      return c.value = i, l("update:modelValue", s(i)), i;
    };
    function R(t) {
      a.active !== t && (a.active = t, l(t ? "active" : "inactive", s(c.value)), t || Ct());
    }
    const T = () => {
      var i, u, f;
      let t = null;
      if (e.limitAreaClass)
        try {
          t = document.querySelector(e.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((i = m.value) == null ? void 0 : i.parentElement) ?? null, a.parentWidth = ((u = a.parentElement) == null ? void 0 : u.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, P = (t) => Math.max(0, Number(t) || 0), d = () => {
      const t = P(e.edgeDistance);
      return {
        top: t + P(e.boundsMargin.top),
        right: t + P(e.boundsMargin.right),
        bottom: t + P(e.boundsMargin.bottom),
        left: t + P(e.boundsMargin.left)
      };
    }, p = () => {
      const t = d(), i = N.value ? 100 : a.parentWidth, u = N.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, i - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, u - t.bottom)
      };
    }, g = (t) => {
      const i = p();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - h(t.width)),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - h(t.height))
      };
    }, x = (t) => {
      if (!a.parentElement) return;
      const i = p(), u = h(t.left), f = h(t.top), b = u + h(t.width), y = f + h(t.height);
      u < i.minLeft && l("out-of-bounds", "left"), b > i.maxRight && l("out-of-bounds", "right"), f < i.minTop && l("out-of-bounds", "top"), y > i.maxBottom && l("out-of-bounds", "bottom");
    }, v = (t) => {
      if (!e.limitAreaForParent || !a.parentElement) return t;
      const i = g(t);
      return {
        ...t,
        left: gt(h(t.left), i.minLeft, i.maxLeft),
        top: gt(h(t.top), i.minTop, i.maxTop)
      };
    }, M = ln(ze, null), B = e.memberId ?? `member-${((ae = sn()) == null ? void 0 : ae.uid) ?? Math.random().toString(36).slice(2)}`;
    let k = !1;
    const K = {
      getRect: () => s(c.value),
      translateTo: (t) => {
        E(t);
      },
      getAreaEdges: () => (T(), a.parentElement ? p() : null)
    };
    rn(() => M == null ? void 0 : M.registerMember(B, K));
    const C = (t) => e.isKeepDecimals ? ye(t, 0, e.decimalPlaces) : Math.round(t), Y = (t, i) => {
      const u = it(e.scale, 1), f = t / (u === 0 ? 1 : u);
      if (!N.value) return C(f);
      const b = i === "horizontal" ? a.parentWidth : a.parentHeight;
      return b > 0 ? C(f / b * 100) : 0;
    }, O = xn(() => ({ snapToGrid: e.snapToGrid, gridSize: e.gridSize })), X = Mn(() => ({
      enabled: e.snapToElements,
      threshold: e.snapThreshold,
      filter: e.snapFilter,
      priority: e.snapPriority
    })), ht = En(() => ({
      enabled: e.collisionEnabled,
      allowOverlap: e.allowOverlap
    })), at = X.guides;
    let ct = "clear", dt = "clear", ut = "clear";
    const mt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), vt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), At = (t) => {
      const i = {
        horizontal: t.points.some((I) => mt.has(I)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((I) => vt.has(I)) ? t.targetIds.vertical : void 0
      }, u = t.snapped ? rt(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: i,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, b = JSON.stringify({
        payload: f,
        targetIds: i,
        left: t.points.some((I) => mt.has(I)) ? t.left : void 0,
        top: t.points.some((I) => vt.has(I)) ? t.top : void 0
      });
      b !== ct && ((t.snapped || ct !== "clear") && l("snap", f), ct = t.snapped ? b : "clear");
      const y = JSON.stringify({ guides: t.guides, targetIds: i });
      y !== dt && ((t.snapped || dt !== "clear") && l("guides", rt(t.guides)), dt = t.snapped ? y : "clear");
    }, Ee = (t) => {
      const i = t.dominant, u = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId
      } : { colliding: !1 }, f = JSON.stringify(u);
      f !== ut && ((i || ut !== "clear") && l("collision", u), ut = i ? f : "clear");
    }, Ct = () => {
      ct !== "clear" && l("snap", { snapped: !1 }), dt !== "clear" && l("guides", { vertical: [], horizontal: [] }), ut !== "clear" && l("collision", { colliding: !1 }), ct = "clear", dt = "clear", ut = "clear", X.clearGuides(), ht.clearCollisions();
    }, ft = (t) => ({
      left: h(t.left),
      top: h(t.top),
      width: h(t.width),
      height: h(t.height)
    }), Pt = (t, i, u = "path") => {
      const f = ht.resolveCandidate(
        ft(t),
        ft(i),
        e.snapTargets,
        (b) => ({
          left: C(b.left),
          top: C(b.top),
          width: C(b.width),
          height: C(b.height)
        }),
        u
      );
      return Ee(f), f.accepted ? { ...t, ...f.rect } : null;
    }, _t = (t, i, u, f, b) => {
      let y = s(t);
      f.horizontal && (y.left = O.snapValue(h(t.left))), f.vertical && (y.top = O.snapValue(h(t.top)));
      let I = {
        ...ft(y),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u ? (I = X.resolveSnap(ft(y), e.snapTargets, f), y = { ...y, left: I.left, top: I.top }) : X.clearGuides(), b) {
        const L = h(b.left), S = h(b.top);
        e.dragDirections.includes("left") || (y.left = Math.max(L, h(y.left))), e.dragDirections.includes("right") || (y.left = Math.min(L, h(y.left))), e.dragDirections.includes("top") || (y.top = Math.max(S, h(y.top))), e.dragDirections.includes("bottom") || (y.top = Math.min(S, h(y.top)));
      }
      x(y), y = v(y);
      const G = Pt(y, i, "slide");
      if (!G)
        return At({
          ...I,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), X.clearGuides(), null;
      if (y = G, I.snapped) {
        const L = h(y.left) !== I.left, S = h(y.top) !== I.top, F = I.points.filter((A) => mt.has(A) ? !L : vt.has(A) ? !S : !1), $ = F.some((A) => mt.has(A)), J = F.some((A) => vt.has(A)), U = I.spacing.filter(
          (A) => A.axis === "horizontal" ? !L : !S
        ), W = {
          vertical: U.flatMap((A) => A.axis === "horizontal" ? A.guides : []),
          horizontal: U.flatMap((A) => A.axis === "vertical" ? A.guides : [])
        };
        I = {
          ...I,
          left: h(y.left),
          top: h(y.top),
          snapped: F.length > 0 || U.length > 0,
          snapPoint: F[0],
          points: F,
          targetId: $ ? I.targetIds.horizontal : J ? I.targetIds.vertical : void 0,
          targetIds: {
            horizontal: $ ? I.targetIds.horizontal : void 0,
            vertical: J ? I.targetIds.vertical : void 0
          },
          guides: {
            vertical: $ ? I.guides.vertical : W.vertical,
            horizontal: J ? I.guides.horizontal : W.horizontal
          },
          spacing: U
        }, I.snapped ? X.setGuides(I.guides) : X.clearGuides();
      }
      return At(I), y;
    }, Nt = (t) => e.resizeDirections.includes(t), Ut = (t, i, u, f) => {
      const b = h(t.left), y = h(t.top), I = h(t.width), G = h(t.height);
      let L = b, S = b + I, F = y, $ = y + G;
      i.includes("l") && (L += u), i.includes("r") && (S += u), i.includes("t") && (F += f), i.includes("b") && ($ += f);
      const J = (L + S) / 2, U = (F + $) / 2;
      let W = Math.max(0, S - L), A = Math.max(0, $ - F);
      const lt = I > 0 && G > 0 ? I / G : 1, kt = (tt) => {
        W = tt, i.includes("l") ? L = S - W : i.includes("r") ? S = L + W : (L = J - W / 2, S = J + W / 2);
      }, Gt = (tt) => {
        A = tt, i.includes("t") ? F = $ - A : i.includes("b") ? $ = F + A : (F = U - A / 2, $ = U + A / 2);
      };
      if (e.ratioLock) {
        const tt = Math.abs(W - I), on = Math.abs(A - G) * lt;
        i === "tm" || i === "bm" || on > tt ? kt(A * lt) : Gt(W / lt);
      }
      const Z = p(), le = e.limitAreaForParent && !!a.parentElement, en = le ? i.includes("l") ? Math.max(0, S - Z.minLeft) : i.includes("r") ? Math.max(0, Z.maxRight - L) : Math.max(
        0,
        2 * Math.min(J - Z.minLeft, Z.maxRight - J)
      ) : 1 / 0, nn = le ? i.includes("t") ? Math.max(0, $ - Z.minTop) : i.includes("b") ? Math.max(0, Z.maxBottom - F) : Math.max(
        0,
        2 * Math.min(U - Z.minTop, Z.maxBottom - U)
      ) : 1 / 0, se = Math.max(0, it(e.minWidth, 0)), re = Math.max(0, it(e.minHeight, 0)), ce = it(e.maxWidth, 1 / 0), de = it(e.maxHeight, 1 / 0);
      let pt = Math.min(ce > 0 ? ce : 1 / 0, en), Ot = Math.min(de > 0 ? de : 1 / 0, nn);
      if (e.ratioLock) {
        pt = Math.min(pt, Ot * lt);
        const tt = Math.max(se, re * lt);
        kt(gt(W, tt, pt)), Gt(W / lt);
      } else
        kt(gt(W, Math.min(se, pt), pt)), Gt(gt(A, Math.min(re, Ot), Ot));
      return {
        ...t,
        left: C(L),
        top: C(F),
        width: C(S - L),
        height: C($ - F)
      };
    };
    let _ = null, Q = null;
    const qt = (t) => {
      if (e.disabled || e.initRect || !a.isDragging && !a.isResizing) return;
      const i = Y(t.clientX - a.initX, "horizontal"), u = Y(t.clientY - a.initY, "vertical"), f = s(c.value);
      if (a.isDragging) {
        const b = a.beforeInteraction;
        let y = h(b.left) + i, I = h(b.top) + u;
        const G = {
          horizontal: i < 0 && e.dragDirections.includes("left") || i > 0 && e.dragDirections.includes("right"),
          vertical: u < 0 && e.dragDirections.includes("top") || u > 0 && e.dragDirections.includes("bottom")
        };
        G.horizontal || (y = h(b.left)), G.vertical || (I = h(b.top));
        const L = {
          ...b,
          left: C(y),
          top: C(I)
        };
        let S = _t(L, f, e.snapToElements, G, b);
        if (S && k && (S = (M == null ? void 0 : M.constrainPosition(B, S)) ?? null), S) {
          const F = E(S);
          l("move", s(F)), l("drag", s(F)), k && (M == null || M.notifyMoved(B, s(F)));
        }
      }
      if (a.isResizing && a.handle) {
        At({
          ...ft(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), X.clearGuides();
        const b = Ut(a.beforeInteraction, a.handle, i, u);
        x(b);
        const y = Pt(b, f);
        if (y) {
          const I = E(y);
          l("resize", s(I));
        }
      }
    }, Te = (t) => {
      !a.active || e.disabled || e.initRect || (Q = t, _ === null && (_ = requestAnimationFrame(() => {
        _ = null;
        const i = Q;
        Q = null, i && qt(i);
      })));
    }, bt = (t) => a.pointerId === null || t.pointerId === a.pointerId, Jt = (t) => {
      bt(t) && Te(t);
    }, Zt = (t) => {
      bt(t) && Le(t);
    }, Qt = (t) => {
      bt(t) && It(t);
    }, jt = (t) => {
      bt(t) && (a.isDragging || a.isResizing) && It(t);
    }, Se = () => {
      const t = a.eventElement;
      if (!t) return;
      const i = { passive: !1 };
      Dt(t, "pointermove", Jt, i), Dt(t, "pointerup", Zt, i), Dt(t, "pointercancel", Qt, i);
      const u = m.value;
      u && Dt(u, "lostpointercapture", jt, i);
    }, Ae = () => {
      const t = a.eventElement;
      if (!t) return;
      Et(t, "pointermove", Jt, !1), Et(t, "pointerup", Zt, !1), Et(t, "pointercancel", Qt, !1);
      const i = m.value;
      i && Et(i, "lostpointercapture", jt, !1), a.eventElement = null;
    }, Ce = () => {
      const t = m.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, Pe = () => {
      const t = m.value, i = a.pointerId;
      if (a.pointerId = null, !(!t || i === null))
        try {
          t.hasPointerCapture(i) && t.releasePointerCapture(i);
        } catch {
        }
    };
    function Bt() {
      _ !== null && (cancelAnimationFrame(_), _ = null), Q = null;
    }
    function Lt() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, k = !1, Ae(), Pe();
    }
    function te() {
      Ct(), e.active || R(!1);
    }
    function ee() {
      Lt(), te();
    }
    function yt() {
      Bt(), k && (M == null || M.abortDrag(B)), ee();
    }
    function It(t = null) {
      const i = a.isDragging, u = a.isResizing, f = k;
      if (Bt(), Lt(), i || u) {
        const b = s(a.beforeInteraction);
        E(b), l(i ? "drag-cancel" : "resize-cancel", t, b, s(b)), i && f && (M == null || M.cancelDrag(B, t));
      }
      te();
    }
    function ne() {
      yt(), R(!1);
    }
    const Ne = (t, i) => {
      var f, b;
      if (e.disabled || e.initRect || a.isDragging || a.isResizing || i && (!D.value || !Nt(i)) || !i && !e.draggable) return;
      const u = s(c.value);
      if (i) {
        if (((f = e.canResize) == null ? void 0 : f.call(e, u, i)) === !1) return;
      } else if (((b = e.canDrag) == null ? void 0 : b.call(e, u)) === !1)
        return;
      k = !i && M !== null, k && (M == null || M.beginDrag(B, t)), T(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = s(c.value), a.handle = i, a.isDragging = !i, a.isResizing = !!i, R(!0), a.isDragging && l("drag-start", t, s(a.beforeInteraction)), a.isResizing && l("resize-start", t, s(a.beforeInteraction)), a.eventElement = document.documentElement, Se(), Ce();
    }, Be = (t) => {
      if (!(t instanceof Element)) return !0;
      const i = m.value;
      if (!i) return !0;
      const u = (f) => {
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
        const f = u(e.dragCancel);
        if (!f.valid || f.matched) return !1;
      }
      if (e.dragHandle) {
        const f = u(e.dragHandle);
        return f.valid && f.matched;
      }
      return !0;
    }, ie = (t, i) => {
      !t.isPrimary || t.button !== 0 || !i && !Be(t.target) || Ne(t, i);
    };
    function Le(t) {
      _ !== null && (cancelAnimationFrame(_), _ = null), Q && (qt(Q), Q = null), a.isDragging && (l("drag-stop", t, s(a.beforeInteraction), s(c.value)), k && (M == null || M.endDrag(B, t))), a.isResizing && l("resize-stop", t, s(a.beforeInteraction), s(c.value)), ee();
    }
    const Fe = (t, i) => {
      var y;
      T();
      const u = s(c.value);
      if (((y = e.canDrag) == null ? void 0 : y.call(e, s(u))) === !1) return;
      const f = s(u);
      t === "left" && (f.left = h(f.left) - i), t === "right" && (f.left = h(f.left) + i), t === "top" && (f.top = h(f.top) - i), t === "bottom" && (f.top = h(f.top) + i);
      const b = _t(f, u, e.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, u);
      if (b) {
        const I = E(b);
        l("move", s(I));
      }
    }, He = (t, i, u) => {
      var S;
      if (!D.value || !Nt(t)) return;
      T();
      const f = s(c.value);
      if (((S = e.canResize) == null ? void 0 : S.call(e, s(f), t)) === !1) return;
      const b = i === "left" ? -u : i === "right" ? u : 0, y = i === "top" ? -u : i === "bottom" ? u : 0, I = Ut(f, t, b, y);
      x(I);
      const G = Pt(I, f);
      if (!G || Tn(G, f)) return;
      const L = E(G);
      l("resize", s(L));
    }, ke = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Ge = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), j = (t) => Ge.has(t), Oe = (t) => j(t) ? "group" : "separator", We = (t) => j(t) ? "two-axis resize handle" : void 0, $e = (t) => `Resize ${ke[t]}`, Ve = (t) => {
      if (!j(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, wt = (t) => t === "ml" || t === "mr", oe = (t) => {
      if (!j(t))
        return h(
          wt(t) ? c.value.width : c.value.height
        );
    }, Ke = (t) => {
      if (!j(t))
        return h(wt(t) ? e.minWidth : e.minHeight);
    }, Ye = (t) => {
      if (j(t)) return;
      const i = wt(t) ? e.maxWidth : e.maxHeight;
      if (i === void 0) return;
      const u = h(i);
      return Number.isFinite(u) ? u : void 0;
    }, Xe = (t) => {
      const i = oe(t);
      if (i !== void 0)
        return e.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, _e = (t) => {
      if (e.keyboardEnabled)
        return j(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : wt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, Ue = (t) => {
      t.target === m.value && e.keyboardEnabled && !e.disabled && !e.initRect && R(!0);
    }, qe = [
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
    ].join(","), Je = (t) => {
      const i = t.target, u = m.value;
      if (!(i instanceof Element) || !u || i === u || i.closest(".handle")) return !1;
      const f = i.closest(qe);
      return f !== null && f !== u && u.contains(f);
    }, Ze = bn(
      () => ({
        enabled: e.keyboardEnabled,
        step: e.keyboardStep,
        disabled: e.disabled,
        readOnly: e.initRect,
        active: a.active,
        dragDirections: e.dragDirections,
        resizeDirections: e.resizeDirections,
        focusedHandle: w.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: Fe,
        resize: He,
        deactivate: ne,
        cancel: (t) => It(t)
      }
    ), Qe = (t) => {
      Je(t) || Ze.handleKeyDown(t);
    }, Ft = (t) => N.value ? t / 100 * a.parentWidth : t, Ht = (t) => N.value ? t / 100 * a.parentHeight : t, je = (t) => ({
      left: `${Ft(t) - Ft(h(c.value.left))}px`,
      top: `${-Ht(h(c.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: e.theme
    }), tn = (t) => ({
      top: `${Ht(t) - Ht(h(c.value.top))}px`,
      left: `${-Ft(h(c.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: e.theme
    });
    return o({
      getConfig: () => s(c.value),
      setPosition: (t, i) => E({ ...c.value, left: t, top: i }),
      setSize: (t, i) => E({ ...c.value, width: t, height: i }),
      reset: () => E(s(z)),
      activate: () => R(!0),
      deactivate: ne,
      cancelInteraction: (t = null) => It(t)
    }), cn(() => {
      Bt(), Lt(), M == null || M.unregisterMember(B), Ct();
    }), (t, i) => (et(), nt("div", {
      ref_key: "movableRef",
      ref: m,
      class: ue(["auto-draggable", {
        "select-none": n.disabledUserSelect,
        "is-disabled": n.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": n.initRect
      }]),
      style: xt(H.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (u) => ie(u, null)),
      onDblclick: i[2] || (i[2] = (u) => l("dblclick", u)),
      onFocus: Ue,
      onKeydown: Qe
    }, [
      (et(!0), nt(Wt, null, $t(fe(at).vertical, (u, f) => (et(), nt("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: xt(je(u))
      }, null, 4))), 128)),
      (et(!0), nt(Wt, null, $t(fe(at).horizontal, (u, f) => (et(), nt("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: xt(tn(u))
      }, null, 4))), 128)),
      (et(!0), nt(Wt, null, $t(n.handles, (u) => dn((et(), nt("div", {
        key: u,
        class: ue(["handle", `handle-${u}`]),
        style: xt(V.value),
        role: Oe(u),
        "aria-roledescription": We(u),
        "aria-orientation": Ve(u),
        "aria-label": $e(u),
        "aria-valuenow": oe(u),
        "aria-valuemin": Ke(u),
        "aria-valuemax": Ye(u),
        "aria-valuetext": Xe(u),
        "aria-keyshortcuts": _e(u),
        tabindex: n.keyboardEnabled ? 0 : void 0,
        onPointerdown: un((f) => ie(f, u), ["stop", "prevent"]),
        onFocus: (f) => w.value = u,
        onBlur: i[0] || (i[0] = (f) => w.value = null)
      }, null, 46, An)), [
        [fn, a.active && D.value && !n.disabled && Nt(u)]
      ])), 128)),
      Ie(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Nn = (n, o) => {
  const r = n.__vccOpts || n;
  for (const [e, l] of o)
    r[e] = l;
  return r;
}, Bn = /* @__PURE__ */ Nn(Pn, [["__scopeId", "data-v-51546be7"]]), Ln = St({
  name: "MovableGroup"
}), Fn = /* @__PURE__ */ St({
  ...Ln,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(n, { expose: o, emit: r }) {
    const e = n, l = r, s = /* @__PURE__ */ new Map(), m = q([]), c = q(null), z = ot(() => e.selected !== void 0), w = ot({
      get: () => z.value ? e.selected ?? [] : m.value,
      set: (d) => {
        m.value = d, l("update:selected", d);
      }
    });
    st(
      () => e.selected,
      (d) => {
        d !== void 0 && (m.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => rt(d), D = (d) => {
      const p = typeof d == "number" ? d : Number(d);
      return Number.isFinite(p) ? p : 0;
    }, N = (d, p, g) => ({
      ...d,
      left: D(d.left) + p,
      top: D(d.top) + g
    }), H = (d) => d.reduce(
      (p, g) => ({
        minLeft: Math.min(p.minLeft, D(g.left)),
        minTop: Math.min(p.minTop, D(g.top)),
        maxRight: Math.max(p.maxRight, D(g.left) + D(g.width)),
        maxBottom: Math.max(p.maxBottom, D(g.top) + D(g.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), V = (d, p, g) => {
      const x = H([...d.values()]);
      return {
        left: Math.min(
          Math.max(p.left, g.minLeft - x.minLeft),
          g.maxRight - x.maxRight
        ),
        top: Math.min(
          Math.max(p.top, g.minTop - x.minTop),
          g.maxBottom - x.maxBottom
        )
      };
    }, E = (d) => {
      const p = [];
      for (const [g, x] of d) {
        const v = s.get(g);
        v && p.push({ id: g, rect: a(v.getRect()), startRect: a(x) });
      }
      return p;
    }, R = (d) => d.map(({ id: p, rect: g }) => ({ id: p, rect: g })), T = (d) => {
      const p = d.filter((x) => s.has(x)), g = w.value;
      g.length === p.length && g.every((x, v) => x === p[v]) || (w.value = p);
    };
    return pn(ze, {
      registerMember: (d, p) => {
        s.set(d, p);
      },
      unregisterMember: (d) => {
        var p;
        if (s.delete(d), ((p = c.value) == null ? void 0 : p.leaderId) === d) {
          c.value = null;
          return;
        }
        c.value && c.value.startRects.delete(d), w.value.includes(d) && T(w.value.filter((g) => g !== d));
      },
      beginDrag: (d, p) => {
        if (!s.has(d)) return;
        w.value.includes(d) || T([d]);
        const g = /* @__PURE__ */ new Map();
        for (const v of w.value) {
          const M = s.get(v);
          M && g.set(v, a(M.getRect()));
        }
        c.value = { leaderId: d, startRects: g };
        const x = [];
        for (const [v, M] of g) x.push({ id: v, rect: a(M) });
        l("move-start", { leaderId: d, source: p, rects: x });
      },
      constrainPosition: (d, p) => {
        var k, K;
        const g = c.value, x = g == null ? void 0 : g.startRects.get(d);
        if (!g || !x || !s.has(d)) return p;
        let v = D(p.left) - D(x.left), M = D(p.top) - D(x.top);
        if (e.sharedBounds) {
          const C = (k = s.get(d)) == null ? void 0 : k.getAreaEdges();
          if (C) {
            const Y = V(g.startRects, { left: v, top: M }, C);
            v = Y.left, M = Y.top;
          }
        }
        const B = { left: v, top: M };
        for (const [C, Y] of g.startRects)
          C !== d && ((K = s.get(C)) == null || K.translateTo(N(Y, B.left, B.top)));
        return N(x, B.left, B.top);
      },
      notifyMoved: (d, p) => {
        const g = c.value;
        if (!g || g.leaderId !== d) return;
        const x = R(E(g.startRects)).map(
          (v) => v.id === d ? { id: d, rect: a(p) } : v
        );
        l("move", { leaderId: d, rects: x });
      },
      endDrag: (d, p) => {
        const g = c.value;
        if (!g || g.leaderId !== d) return;
        const x = E(g.startRects);
        c.value = null, l("move-stop", { leaderId: d, source: p, rects: x });
      },
      cancelDrag: (d, p) => {
        var v;
        const g = c.value;
        if (!g || g.leaderId !== d) return;
        for (const [M, B] of g.startRects)
          M !== d && ((v = s.get(M)) == null || v.translateTo(a(B)));
        const x = E(g.startRects);
        c.value = null, l("move-cancel", { leaderId: d, source: p, rects: x });
      },
      abortDrag: (d) => {
        var p;
        ((p = c.value) == null ? void 0 : p.leaderId) === d && (c.value = null);
      }
    }), o({
      getSelected: () => [...w.value],
      select: (d) => T(d ?? [...s.keys()]),
      getMemberRects: () => [...s.entries()].map(([d, p]) => ({ id: d, rect: a(p.getRect()) }))
    }), (d, p) => Ie(d.$slots, "default");
  }
}), Re = "VueMovableBox", De = (n) => {
  n.component(Re, Bn), n.component("MovableGroup", Fn);
}, Gn = {
  name: Re,
  version: "2.2.0",
  install: De
};
typeof window < "u" && window.Vue && window.Vue.use({ install: De });
export {
  Bn as MovableBox,
  Fn as MovableGroup,
  Gn as default,
  Re as name
};
