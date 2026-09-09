import { computed as nt, ref as j, defineComponent as Ct, reactive as fn, watch as ut, inject as pn, getCurrentInstance as hn, onMounted as gn, onUnmounted as mn, openBlock as st, createElementBlock as lt, normalizeStyle as Tt, normalizeClass as be, Fragment as _t, renderList as Xt, unref as ye, withDirectives as vn, withModifiers as bn, vShow as yn, renderSlot as Ae, provide as xn } from "vue";
import Mn from "decimal.js";
const wn = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, In = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, zn = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function Rn(n, i) {
  return { handleKeyDown: (e) => {
    const s = n(), l = s.interacting;
    if (!l && (!s.enabled || s.disabled || !s.active)) return;
    if (e.key === "Escape") {
      e.preventDefault(), l ? i.cancel(e) : i.deactivate();
      return;
    }
    if (l || s.readOnly) return;
    const h = wn[e.key];
    if (!h) return;
    const c = Number.isFinite(s.step) && s.step > 0 ? s.step : 1;
    if (s.focusedHandle && s.resizeDirections.includes(s.focusedHandle)) {
      if (!In[s.focusedHandle].includes(h)) return;
      e.preventDefault(), i.resize(
        s.focusedHandle,
        e.shiftKey ? zn[h] : h,
        c
      );
      return;
    }
    if (e.shiftKey) {
      const y = s.resizeDirections.includes("br") ? "br" : s.resizeDirections[0];
      if (!y) return;
      e.preventDefault(), i.resize(y, h, c);
      return;
    }
    s.dragDirections.includes(h) && (e.preventDefault(), i.move(h, c));
  } };
}
const At = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const i = Number(n);
  return Number.isFinite(i) ? i : null;
}, Dn = (n) => {
  const i = At(n.left), r = At(n.top), e = At(n.width), s = At(n.height);
  return i === null || r === null || e === null || s === null || e < 0 || s < 0 ? null : { left: i, top: r, width: e, height: s };
};
function Tn(n, i) {
  const r = Number.isFinite(i) && i > 0 ? i : 20;
  return Math.round(n / r) * r;
}
const xe = (n, i, r) => i.distance > r ? n : !n || i.distance < n.distance ? i : n, Ee = ["alignment", "spacing"], Me = (n, i, r, e, s) => {
  const l = s.length > 0 ? s : Ee;
  for (const h of l) {
    const c = h === "alignment" ? i : r;
    if (c && c.distance <= e) {
      if (h === "alignment") {
        const M = c;
        return {
          candidate: M,
          spacing: null,
          guides: [M.guide],
          spacingInfo: null,
          value: M.value
        };
      }
      const y = c;
      return {
        candidate: null,
        spacing: y,
        guides: y.guides,
        spacingInfo: {
          axis: n,
          gap: y.gap,
          targetIds: y.targetIds,
          guides: y.guides
        },
        value: y.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, we = (n, i, r, e, s) => {
  const l = (a) => n === "horizontal" ? a.left : a.top, h = (a) => n === "horizontal" ? a.left + a.width : a.top + a.height, c = [], y = [];
  for (const a of s)
    h(a.rect) <= i && c.push(a), l(a.rect) >= i + r && y.push(a);
  let M = null;
  for (const a of c)
    for (const H of y) {
      const k = l(H.rect) - h(a.rect) - r;
      if (k < 0) continue;
      const B = k / 2, $ = h(a.rect) + B, V = Math.abs(i - $);
      V > e || (!M || V < M.distance) && (M = {
        distance: V,
        value: $,
        gap: B,
        guides: [h(a.rect), l(H.rect)],
        targetIds: [a.id, H.id]
      });
    }
  return M;
};
function An(n, i, r = 10, e = { horizontal: !0, vertical: !0 }, s = {}) {
  const l = Math.max(0, Number.isFinite(r) ? r : 10), h = n.left + n.width, c = n.top + n.height, y = n.left + n.width / 2, M = n.top + n.height / 2, a = s.priority ?? Ee, H = (T, w) => s.filter ? s.filter(T, w) !== !1 : !0;
  let k = null, B = null;
  const $ = [], V = [];
  for (const T of i) {
    const w = Dn(T);
    if (!w) continue;
    const F = e.horizontal && H(T, "horizontal"), J = e.vertical && H(T, "vertical");
    if (F && $.push({ rect: w, id: T.id }), J && V.push({ rect: w, id: T.id }), !F && !J) continue;
    const K = w.left + w.width, Y = w.top + w.height, I = w.left + w.width / 2, O = w.top + w.height / 2, P = T.id, ft = [
      {
        distance: Math.abs(n.left - w.left),
        value: w.left,
        guide: w.left,
        point: "left",
        targetId: P
      },
      {
        distance: Math.abs(h - K),
        value: K - n.width,
        guide: K,
        point: "right",
        targetId: P
      },
      {
        distance: Math.abs(n.left - K),
        value: K,
        guide: K,
        point: "left",
        targetId: P
      },
      {
        distance: Math.abs(h - w.left),
        value: w.left - n.width,
        guide: w.left,
        point: "right",
        targetId: P
      },
      {
        distance: Math.abs(y - I),
        value: I - n.width / 2,
        guide: I,
        point: "center-x",
        targetId: P
      }
    ], L = [
      {
        distance: Math.abs(n.top - w.top),
        value: w.top,
        guide: w.top,
        point: "top",
        targetId: P
      },
      {
        distance: Math.abs(c - Y),
        value: Y - n.height,
        guide: Y,
        point: "bottom",
        targetId: P
      },
      {
        distance: Math.abs(n.top - Y),
        value: Y,
        guide: Y,
        point: "top",
        targetId: P
      },
      {
        distance: Math.abs(c - w.top),
        value: w.top - n.height,
        guide: w.top,
        point: "bottom",
        targetId: P
      },
      {
        distance: Math.abs(M - O),
        value: O - n.height / 2,
        guide: O,
        point: "center-y",
        targetId: P
      }
    ];
    if (F)
      for (const ct of ft) k = xe(k, ct, l);
    if (J)
      for (const ct of L) B = xe(B, ct, l);
  }
  const D = e.horizontal ? Me(
    "horizontal",
    k,
    we(
      "horizontal",
      n.left,
      n.width,
      l,
      $
    ),
    l,
    a
  ) : null, N = e.vertical ? Me(
    "vertical",
    B,
    we("vertical", n.top, n.height, l, V),
    l,
    a
  ) : null, d = (D == null ? void 0 : D.candidate) ?? null, g = (N == null ? void 0 : N.candidate) ?? null, v = [d == null ? void 0 : d.point, g == null ? void 0 : g.point].filter(
    (T) => !!T
  ), z = [D == null ? void 0 : D.spacingInfo, N == null ? void 0 : N.spacingInfo].filter(
    (T) => !!T
  );
  return {
    left: (D == null ? void 0 : D.value) ?? n.left,
    top: (N == null ? void 0 : N.value) ?? n.top,
    snapped: v.length > 0 || z.length > 0,
    snapPoint: v[0],
    points: v,
    targetId: (d == null ? void 0 : d.targetId) ?? (g == null ? void 0 : g.targetId),
    targetIds: { horizontal: d == null ? void 0 : d.targetId, vertical: g == null ? void 0 : g.targetId },
    guides: {
      vertical: (D == null ? void 0 : D.guides) ?? [],
      horizontal: (N == null ? void 0 : N.guides) ?? []
    },
    spacing: z
  };
}
function En(n) {
  const i = (s) => {
    const l = n();
    return l.snapToGrid ? Tn(s, l.gridSize) : s;
  }, r = (s, l) => ({
    left: i(s),
    top: i(l)
  }), e = nt(() => {
    const s = n();
    return s.snapToGrid ? {
      size: Number.isFinite(s.gridSize) && s.gridSize > 0 ? s.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: i, snapPosition: r, gridInfo: e };
}
const Ut = () => ({ vertical: [], horizontal: [] });
function Sn(n) {
  const i = j(Ut()), r = j(null);
  return { guides: i, lastSnapResult: r, resolveSnap: (h, c, y) => {
    const M = n(), a = M.enabled ? An(h, c, M.threshold, y, {
      filter: M.filter,
      priority: M.priority
    }) : {
      ...h,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Ut(),
      spacing: []
    };
    return i.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    i.value = Ut(), r.value = null;
  }, setGuides: (h) => {
    i.value = h;
  } };
}
const Et = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const i = Number(n);
  return Number.isFinite(i) ? i : null;
}, Se = (n) => {
  const i = Et(n.left), r = Et(n.top), e = Et(n.width), s = Et(n.height);
  return i === null || r === null || e === null || s === null || e < 0 || s < 0 ? null : { left: i, top: r, width: e, height: s };
}, Ie = (n, i, r, e) => {
  const s = r - i;
  if (s === 0) return i < e ? n : null;
  const l = (e - i) / s;
  return s > 0 ? { ...n, exit: Math.min(n.exit, l) } : { ...n, entry: Math.max(n.entry, l) };
}, ze = (n, i, r, e) => {
  const s = r - i;
  if (s === 0) return i > e ? n : null;
  const l = (e - i) / s;
  return s > 0 ? { ...n, entry: Math.max(n.entry, l) } : { ...n, exit: Math.min(n.exit, l) };
}, Bn = (n, i, r) => {
  let e = { entry: 0, exit: 1 };
  if (e = Ie(e, n.left, i.left, r.left + r.width), !e || (e = ze(
    e,
    n.left + n.width,
    i.left + i.width,
    r.left
  ), !e) || (e = Ie(e, n.top, i.top, r.top + r.height), !e) || (e = ze(
    e,
    n.top + n.height,
    i.top + i.height,
    r.top
  ), !e)) return null;
  const s = Math.max(0, e.entry), l = Math.min(1, e.exit);
  return s < l && l > 0 && s < 1 ? { entry: s, exit: l } : null;
};
function Lt(n, i, r) {
  let e = null;
  for (const s of r) {
    const l = Se(s);
    if (!l) continue;
    const h = Bn(n, i, l);
    h && (!e || h.entry < e.entry) && (e = h);
  }
  return e;
}
function Pn(n, i) {
  const r = Math.min(n.left + n.width, i.left + i.width) - Math.max(n.left, i.left), e = Math.min(n.top + n.height, i.top + i.height) - Math.max(n.top, i.top);
  if (r <= 0 || e <= 0) return { colliding: !1, overlapArea: 0 };
  const s = n.left + n.width / 2, l = n.top + n.height / 2, h = i.left + i.width / 2, c = i.top + i.height / 2, y = s - h, M = l - c;
  return {
    colliding: !0,
    direction: r <= e ? y > 0 ? "right" : "left" : M > 0 ? "bottom" : "top",
    overlap: Math.min(r, e),
    overlapArea: r * e
  };
}
function qt(n, i, r) {
  const e = [];
  for (const s of i) {
    const l = Se(s);
    if (!l) continue;
    const h = Pn(n, l);
    h.colliding && e.push({ ...h, targetId: s.id });
  }
  return e;
}
function Re(n) {
  let i = null;
  for (const r of n)
    (!i || (r.overlapArea ?? 0) > (i.overlapArea ?? 0)) && (i = r);
  return i;
}
const Jt = (n) => n.reduce((i, r) => i + (r.overlapArea ?? 0), 0), Be = (n, i, r) => ({
  left: n.left + (i.left - n.left) * r,
  top: n.top + (i.top - n.top) * r,
  width: n.width + (i.width - n.width) * r,
  height: n.height + (i.height - n.height) * r
}), Ln = (n, i) => n.left === i.left && n.top === i.top && n.width === i.width && n.height === i.height, Zt = (n, i, r, e) => {
  if (!Lt(n, i, r)) return i;
  let s = 0, l = 1, h = n;
  for (let c = 0; c < 24; c += 1) {
    const y = (s + l) / 2, M = e(Be(n, i, y));
    Lt(n, M, r) ? l = y : (h = M, s = y);
  }
  return h;
};
function Cn(n) {
  const i = j([]), r = j(!1), e = (c, y) => {
    const a = n().enabled ? qt(c, y) : [];
    return i.value = a, r.value = a.length > 0, {
      results: a,
      dominant: Re(a),
      totalOverlapArea: Jt(a)
    };
  }, s = (c) => (i.value = c, r.value = c.length > 0, {
    results: c,
    dominant: Re(c),
    totalOverlapArea: Jt(c)
  });
  return { collisions: i, isColliding: r, evaluate: e, resolveCandidate: (c, y, M, a = (k) => k, H = "path") => {
    const k = n(), B = e(c, M);
    if (!k.enabled || k.allowOverlap)
      return { accepted: !0, rect: c, ...B };
    const $ = qt(y, M), V = Jt($);
    if (V > 0)
      return {
        accepted: B.totalOverlapArea < V,
        rect: c,
        ...B
      };
    const D = Lt(y, c, M);
    if (B.results.length === 0 && !D)
      return { accepted: !0, rect: c, ...B };
    let N = B;
    if (B.results.length === 0 && D) {
      const g = Be(
        y,
        c,
        D.entry + (D.exit - D.entry) * 1e-3
      );
      N = s(qt(g, M));
    }
    let d = null;
    if (H === "slide") {
      const g = Zt(
        y,
        { ...y, left: c.left },
        M,
        a
      ), v = Zt(
        y,
        { ...y, top: c.top },
        M,
        a
      ), z = a({
        ...c,
        left: g.left,
        top: v.top
      });
      Lt(y, z, M) || (d = z);
    }
    return d ?? (d = Zt(y, c, M, a)), {
      accepted: !Ln(d, y),
      rect: d,
      ...N
    };
  }, clearCollisions: () => {
    i.value = [], r.value = !1;
  } };
}
const p = (n, i = 0) => {
  if (n == null || n === "")
    return i;
  const r = typeof n == "string" ? Number(n) : n;
  return Number.isFinite(r) ? r : i;
}, rt = (n, i, r) => Math.min(Math.max(n, i), r), Nn = (n, i) => p(n.left) === p(i.left) && p(n.top) === p(i.top) && p(n.width) === p(i.width) && p(n.height) === p(i.height), Nt = (n) => {
  const i = typeof n == "number" ? n : Number(n ?? 0);
  if (!Number.isFinite(i)) return 0;
  const r = (i % 360 + 360) % 360;
  return r > 180 ? r - 360 : r;
}, Ft = (n) => n * Math.PI / 180, q = (n) => Math.round(n * 1e9) / 1e9, Fn = (n, i) => {
  const r = Nt(i);
  if (r === 0) return { ...n };
  const e = Ft(r), s = Math.cos(e), l = Math.sin(e), h = Math.abs(n.width * s) + Math.abs(n.height * l), c = Math.abs(n.width * l) + Math.abs(n.height * s);
  return {
    left: q(n.left + (n.width - h) / 2),
    top: q(n.top + (n.height - c) / 2),
    width: q(h),
    height: q(c)
  };
}, Hn = (n, i, r) => {
  const e = { x: i / 2, y: r / 2 };
  if (!n) return e;
  const s = n.trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 2);
  if (s.length === 0) return e;
  let l = null, h = null;
  const c = (y) => {
    l === null ? l = y : h === null && (h = y);
  };
  for (const y of s)
    if (y === "left") l = 0;
    else if (y === "right") l = i;
    else if (y === "top") h = 0;
    else if (y === "bottom") h = r;
    else if (y === "center") c(l === null ? i / 2 : r / 2);
    else if (y.endsWith("%")) {
      const M = Number(y.slice(0, -1));
      if (!Number.isFinite(M)) return e;
      c(M / 100 * (l === null ? i : r));
    } else {
      const M = Number.parseFloat(y);
      if (!Number.isFinite(M)) return e;
      c(M);
    }
  return { x: l ?? i / 2, y: h ?? r / 2 };
}, kn = (n, i, r) => {
  const e = Fn(n, i), s = Nt(i);
  if (s === 0) return e;
  const l = Ft(s), h = Math.cos(l), c = Math.sin(l), y = n.width / 2 - r.x, M = n.height / 2 - r.y, a = q(y * h - M * c - y), H = q(y * c + M * h - M);
  return {
    left: q(e.left + a),
    top: q(e.top + H),
    width: e.width,
    height: e.height
  };
}, De = (n, i, r) => {
  const e = Nt(r);
  if (e === 0) return { x: n, y: i };
  const s = Ft(e), l = Math.cos(s), h = Math.sin(s);
  return {
    x: q(n * l + i * h),
    y: q(-n * h + i * l)
  };
}, Pe = Symbol("MovableGroupContext"), On = 2, Q = (n, i = 1) => {
  if (n == null || n === "")
    return i;
  const r = typeof n == "string" ? parseFloat(n) : n;
  return isNaN(r) ? i : r;
}, St = (n, i = "px") => n == null || n === "" ? "0" : `${n}${i}`;
function Bt(n, i, r, e) {
  n && n.addEventListener(i, r, e);
}
function Pt(n, i, r, e) {
  n && n.removeEventListener(i, r, e);
}
const Te = (n, i = 1, r = On) => {
  const e = new Mn(n).toDecimalPlaces(r).toNumber();
  return Q(e, i);
}, dt = (n) => {
  if (n === null || typeof n != "object")
    return n;
  if (n instanceof Date)
    return new Date(n.getTime());
  if (n instanceof Array)
    return n.map((i) => dt(i));
  if (n instanceof Object) {
    const i = {};
    for (const r in n)
      n.hasOwnProperty(r) && (i[r] = dt(n[r]));
    return i;
  }
  return n;
}, Wn = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Gn = Ct({
  name: "VueMovableBox"
}), $n = /* @__PURE__ */ Ct({
  ...Gn,
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
    memberId: String,
    /** Clockwise rotation in degrees; geometry uses the rotated AABB (see README). */
    rotate: { type: [Number, String], default: 0 },
    /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
    transformOrigin: { type: String, default: "center" }
  },
  emits: ["update:modelValue", "drag", "drag-start", "drag-stop", "resize-start", "resize-stop", "drag-cancel", "resize-cancel", "resize", "move", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "snap", "guides", "collision"],
  setup(n, { expose: i, emit: r }) {
    var pe;
    const e = n, s = r, l = (t) => dt(t), h = j(), c = j(l(e.modelValue)), y = l(e.modelValue), M = j(null), a = fn({
      active: e.active,
      isDragging: !1,
      isResizing: !1,
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: l(e.modelValue),
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    ut(
      () => e.modelValue,
      (t) => {
        c.value = l(t);
      },
      { deep: !0 }
    ), ut(
      () => e.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? zt() : N(t);
      },
      { flush: "sync" }
    ), ut(
      () => e.disabled,
      (t) => {
        s("disabled", t), t && zt();
      }
    ), ut(
      () => e.initRect,
      (t) => {
        t && zt();
      }
    ), ut(
      () => e.isKeepDecimals,
      (t, o) => {
        !t && o && D({
          ...c.value,
          left: Math.round(p(c.value.left)),
          top: Math.round(p(c.value.top)),
          width: Math.round(p(c.value.width)),
          height: Math.round(p(c.value.height))
        });
      }
    );
    const H = nt(() => e.resizable ?? e.resizeable ?? !0), k = nt(() => e.unitType === "%"), B = nt(() => Nt(e.rotate)), $ = nt(() => ({
      "--movable-box-theme": e.theme,
      borderColor: e.disabled ? e.inActiveColor : a.active ? e.theme : e.inActiveColor,
      left: St(c.value.left, e.unitType),
      top: St(c.value.top, e.unitType),
      width: St(c.value.width, e.unitType),
      height: St(c.value.height, e.unitType),
      zIndex: c.value.zIndex,
      cursor: e.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : "default",
      pointerEvents: e.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: B.value ? `rotate(${B.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: e.transformOrigin,
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: e.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), V = nt(() => ({
      borderColor: H.value ? e.theme : e.inActiveColor,
      scale: Te(1 / Q(e.scale, 1), 1)
    })), D = (t) => {
      const o = l(t);
      return c.value = o, s("update:modelValue", l(o)), o;
    };
    function N(t) {
      a.active !== t && (a.active = t, s(t ? "active" : "inactive", l(c.value)), t || kt());
    }
    const d = () => {
      var o, u, f;
      let t = null;
      if (e.limitAreaClass)
        try {
          t = document.querySelector(e.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((o = h.value) == null ? void 0 : o.parentElement) ?? null, a.parentWidth = ((u = a.parentElement) == null ? void 0 : u.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, g = (t) => Math.max(0, Number(t) || 0), v = () => {
      const t = g(e.edgeDistance);
      return {
        top: t + g(e.boundsMargin.top),
        right: t + g(e.boundsMargin.right),
        bottom: t + g(e.boundsMargin.bottom),
        left: t + g(e.boundsMargin.left)
      };
    }, z = () => {
      const t = v(), o = k.value ? 100 : a.parentWidth, u = k.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, o - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, u - t.bottom)
      };
    }, T = (t) => {
      const o = z();
      return {
        minLeft: o.minLeft,
        maxLeft: Math.max(o.minLeft, o.maxRight - t.width),
        minTop: o.minTop,
        maxTop: Math.max(o.minTop, o.maxBottom - t.height)
      };
    }, w = (t) => ({
      left: p(t.left),
      top: p(t.top),
      width: p(t.width),
      height: p(t.height)
    }), F = (t) => {
      const o = w(t), u = B.value;
      if (!u) return o;
      const f = Hn(e.transformOrigin, o.width, o.height);
      return kn(o, u, f);
    }, J = (t, o) => {
      const u = B.value;
      if (!u || !e.limitAreaForParent || !a.parentElement) return t;
      const f = z(), b = Math.max(0, f.maxRight - f.minLeft), m = Math.max(0, f.maxBottom - f.minTop), x = Ft(u), S = Math.abs(Math.cos(x)) < 1e-9 ? 0 : Math.abs(Math.cos(x)), R = Math.abs(Math.sin(x)) < 1e-9 ? 0 : Math.abs(Math.sin(x)), A = p(t.width), E = p(t.height), W = S * A + R * E, _ = R * A + S * E;
      if (e.ratioLock) {
        const yt = Math.min(
          1,
          W > b ? b / W : 1,
          _ > m ? m / _ : 1
        );
        return yt >= 1 ? t : { ...t, width: L(A * yt), height: L(E * yt) };
      }
      const X = Math.min(
        S > 0 ? (b - R * E) / S : 1 / 0,
        R > 0 ? (m - S * E) / R : 1 / 0
      ), G = Math.min(
        R > 0 ? (b - S * A) / R : 1 / 0,
        S > 0 ? (m - R * A) / S : 1 / 0
      ), C = Math.max(0, Q(e.minWidth, 0)), et = Math.max(0, Q(e.minHeight, 0)), mt = o === null || o.includes("l") || o.includes("r"), vt = o === null || o.includes("t") || o.includes("b"), U = mt ? Math.max(C, Math.min(A, X)) : A, bt = vt ? Math.max(et, Math.min(E, G)) : E;
      return U === A && bt === E ? t : { ...t, width: L(U), height: L(bt) };
    }, K = (t) => {
      if (!a.parentElement) return;
      const o = z(), u = F(t), f = u.left, b = u.top, m = f + u.width, x = b + u.height;
      f < o.minLeft && s("out-of-bounds", "left"), m > o.maxRight && s("out-of-bounds", "right"), b < o.minTop && s("out-of-bounds", "top"), x > o.maxBottom && s("out-of-bounds", "bottom");
    }, Y = (t) => {
      if (!e.limitAreaForParent || !a.parentElement) return t;
      const o = F(t), u = T(o), f = rt(o.left, u.minLeft, u.maxLeft), b = rt(o.top, u.minTop, u.maxTop);
      return B.value ? {
        ...t,
        left: L(p(t.left) + (f - o.left)),
        top: L(p(t.top) + (b - o.top))
      } : {
        ...t,
        left: f,
        top: b
      };
    }, I = pn(Pe, null), O = e.memberId || `member-${((pe = hn()) == null ? void 0 : pe.uid) ?? Math.random().toString(36).slice(2)}`;
    let P = !1;
    const ft = {
      getRect: () => l(c.value),
      translateTo: (t) => {
        D(t);
      },
      getAreaEdges: () => (d(), a.parentElement ? z() : null)
    };
    gn(() => I == null ? void 0 : I.registerMember(O, ft));
    const L = (t) => e.isKeepDecimals ? Te(t, 0, e.decimalPlaces) : Math.round(t), ct = (t, o) => {
      const u = Q(e.scale, 1), f = t / (u === 0 ? 1 : u);
      if (!k.value) return L(f);
      const b = o === "horizontal" ? a.parentWidth : a.parentHeight;
      return b > 0 ? L(f / b * 100) : 0;
    }, Qt = En(() => ({ snapToGrid: e.snapToGrid, gridSize: e.gridSize })), tt = Sn(() => ({
      enabled: e.snapToElements,
      threshold: e.snapThreshold,
      filter: e.snapFilter,
      priority: e.snapPriority
    })), jt = Cn(() => ({
      enabled: e.collisionEnabled,
      allowOverlap: e.allowOverlap
    })), te = tt.guides;
    let pt = "clear", ht = "clear", gt = "clear";
    const Mt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), wt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Ht = (t) => {
      const o = {
        horizontal: t.points.some((x) => Mt.has(x)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((x) => wt.has(x)) ? t.targetIds.vertical : void 0
      }, u = t.snapped ? dt(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: o,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, b = JSON.stringify({
        payload: f,
        left: t.points.some((x) => Mt.has(x)) ? t.left : void 0,
        top: t.points.some((x) => wt.has(x)) ? t.top : void 0
      });
      b !== pt && ((t.snapped || pt !== "clear") && s("snap", f), pt = t.snapped ? b : "clear");
      const m = JSON.stringify({ guides: t.guides, targetIds: o });
      m !== ht && ((t.snapped || ht !== "clear") && s("guides", dt(t.guides)), ht = t.snapped ? m : "clear");
    }, Ne = (t) => {
      const o = t.dominant, u = o ? {
        colliding: !0,
        direction: o.direction,
        targetId: o.targetId
      } : { colliding: !1 }, f = JSON.stringify(u);
      f !== gt && ((o || gt !== "clear") && s("collision", u), gt = o ? f : "clear");
    }, kt = () => {
      pt !== "clear" && s("snap", { snapped: !1 }), ht !== "clear" && s("guides", { vertical: [], horizontal: [] }), gt !== "clear" && s("collision", { colliding: !1 }), pt = "clear", ht = "clear", gt = "clear", tt.clearGuides(), jt.clearCollisions();
    }, Ot = (t, o, u = "path") => {
      const f = F(t), b = jt.resolveCandidate(
        f,
        F(o),
        e.snapTargets,
        (m) => ({
          left: L(m.left),
          top: L(m.top),
          width: L(m.width),
          height: L(m.height)
        }),
        u
      );
      return Ne(b), b.accepted ? B.value ? {
        ...t,
        left: L(p(t.left) + (b.rect.left - f.left)),
        top: L(p(t.top) + (b.rect.top - f.top))
      } : { ...t, ...b.rect } : null;
    }, ee = (t, o, u, f, b) => {
      let m = l(t);
      f.horizontal && (m.left = Qt.snapValue(p(t.left))), f.vertical && (m.top = Qt.snapValue(p(t.top)));
      let x = {
        ...w(m),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const R = F(m);
        x = tt.resolveSnap(R, e.snapTargets, f), B.value ? m = {
          ...m,
          left: L(p(m.left) + (x.left - R.left)),
          top: L(p(m.top) + (x.top - R.top))
        } : m = { ...m, left: x.left, top: x.top };
      } else
        tt.clearGuides();
      if (b) {
        const R = p(b.left), A = p(b.top);
        e.dragDirections.includes("left") || (m.left = Math.max(R, p(m.left))), e.dragDirections.includes("right") || (m.left = Math.min(R, p(m.left))), e.dragDirections.includes("top") || (m.top = Math.max(A, p(m.top))), e.dragDirections.includes("bottom") || (m.top = Math.min(A, p(m.top)));
      }
      K(m), m = Y(m);
      const S = Ot(m, o, "slide");
      if (!S)
        return Ht({
          ...x,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), tt.clearGuides(), null;
      if (m = S, x.snapped) {
        const R = p(m.left) !== x.left, A = p(m.top) !== x.top, E = x.points.filter((C) => Mt.has(C) ? !R : wt.has(C) ? !A : !1), W = E.some((C) => Mt.has(C)), _ = E.some((C) => wt.has(C)), X = x.spacing.filter(
          (C) => C.axis === "horizontal" ? !R : !A
        ), G = {
          vertical: X.flatMap((C) => C.axis === "horizontal" ? C.guides : []),
          horizontal: X.flatMap((C) => C.axis === "vertical" ? C.guides : [])
        };
        x = {
          ...x,
          left: p(m.left),
          top: p(m.top),
          snapped: E.length > 0 || X.length > 0,
          snapPoint: E[0],
          points: E,
          targetId: W ? x.targetIds.horizontal : _ ? x.targetIds.vertical : void 0,
          targetIds: {
            horizontal: W ? x.targetIds.horizontal : void 0,
            vertical: _ ? x.targetIds.vertical : void 0
          },
          guides: {
            vertical: W ? x.guides.vertical : G.vertical,
            horizontal: _ ? x.guides.horizontal : G.horizontal
          },
          spacing: X
        }, x.snapped ? tt.setGuides(x.guides) : tt.clearGuides();
      }
      return Ht(x), m;
    }, Wt = (t) => e.resizeDirections.includes(t), ne = (t, o, u, f) => {
      const b = p(t.left), m = p(t.top), x = p(t.width), S = p(t.height);
      let R = b, A = b + x, E = m, W = m + S;
      o.includes("l") && (R += u), o.includes("r") && (A += u), o.includes("t") && (E += f), o.includes("b") && (W += f);
      const _ = (R + A) / 2, X = (E + W) / 2;
      let G = Math.max(0, A - R), C = Math.max(0, W - E);
      const et = x > 0 && S > 0 ? x / S : 1, mt = (at) => {
        G = at, o.includes("l") ? R = A - G : o.includes("r") ? A = R + G : (R = _ - G / 2, A = _ + G / 2);
      }, vt = (at) => {
        C = at, o.includes("t") ? E = W - C : o.includes("b") ? W = E + C : (E = X - C / 2, W = X + C / 2);
      };
      if (e.ratioLock) {
        const at = Math.abs(G - x), dn = Math.abs(C - S) * et;
        o === "tm" || o === "bm" || dn > at ? mt(C * et) : vt(G / et);
      }
      const U = z(), bt = e.limitAreaForParent && !!a.parentElement, yt = bt ? o.includes("l") ? Math.max(0, A - U.minLeft) : o.includes("r") ? Math.max(0, U.maxRight - R) : Math.max(
        0,
        2 * Math.min(_ - U.minLeft, U.maxRight - _)
      ) : 1 / 0, un = bt ? o.includes("t") ? Math.max(0, W - U.minTop) : o.includes("b") ? Math.max(0, U.maxBottom - E) : Math.max(
        0,
        2 * Math.min(X - U.minTop, U.maxBottom - X)
      ) : 1 / 0, he = Math.max(0, Q(e.minWidth, 0)), ge = Math.max(0, Q(e.minHeight, 0)), me = Q(e.maxWidth, 1 / 0), ve = Q(e.maxHeight, 1 / 0);
      let xt = Math.min(me > 0 ? me : 1 / 0, yt), Yt = Math.min(ve > 0 ? ve : 1 / 0, un);
      if (e.ratioLock) {
        xt = Math.min(xt, Yt * et);
        const at = Math.max(he, ge * et);
        mt(rt(G, at, xt)), vt(G / et);
      } else
        mt(rt(G, Math.min(he, xt), xt)), vt(rt(C, Math.min(ge, Yt), Yt));
      return {
        ...t,
        left: L(R),
        top: L(E),
        width: L(A - R),
        height: L(W - E)
      };
    };
    let Z = null, it = null;
    const ie = (t) => {
      if (e.disabled || e.initRect || !a.isDragging && !a.isResizing) return;
      const o = ct(t.clientX - a.initX, "horizontal"), u = ct(t.clientY - a.initY, "vertical"), f = l(c.value);
      if (a.isDragging) {
        const b = a.beforeInteraction;
        let m = p(b.left) + o, x = p(b.top) + u;
        const S = {
          horizontal: o < 0 && e.dragDirections.includes("left") || o > 0 && e.dragDirections.includes("right"),
          vertical: u < 0 && e.dragDirections.includes("top") || u > 0 && e.dragDirections.includes("bottom")
        };
        S.horizontal || (m = p(b.left)), S.vertical || (x = p(b.top));
        const R = {
          ...b,
          left: L(m),
          top: L(x)
        };
        let A = ee(R, f, e.snapToElements, S, b);
        if (A && P && (A = (I == null ? void 0 : I.constrainPosition(O, A)) ?? null), A) {
          const E = D(A);
          s("move", l(E)), s("drag", l(E)), P && (I == null || I.notifyMoved(O, l(E)));
        }
      }
      if (a.isResizing && a.handle) {
        Ht({
          ...w(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), tt.clearGuides();
        const b = De(o, u, B.value);
        let m = ne(
          a.beforeInteraction,
          a.handle,
          b.x,
          b.y
        );
        B.value && (m = J(m, a.handle), m = Y(m)), K(m);
        const x = Ot(m, f);
        if (x) {
          const S = D(x);
          s("resize", l(S));
        }
      }
    }, Fe = (t) => {
      !a.active || e.disabled || e.initRect || (it = t, Z === null && (Z = requestAnimationFrame(() => {
        Z = null;
        const o = it;
        it = null, o && ie(o);
      })));
    }, It = (t) => a.pointerId === null || t.pointerId === a.pointerId, oe = (t) => {
      It(t) && Fe(t);
    }, ae = (t) => {
      It(t) && Ve(t);
    }, se = (t) => {
      It(t) && Rt(t);
    }, le = (t) => {
      It(t) && (a.isDragging || a.isResizing) && Rt(t);
    }, He = () => {
      const t = a.eventElement;
      if (!t) return;
      const o = { passive: !1 };
      Bt(t, "pointermove", oe, o), Bt(t, "pointerup", ae, o), Bt(t, "pointercancel", se, o);
      const u = h.value;
      u && Bt(u, "lostpointercapture", le, o);
    }, ke = () => {
      const t = a.eventElement;
      if (!t) return;
      Pt(t, "pointermove", oe, !1), Pt(t, "pointerup", ae, !1), Pt(t, "pointercancel", se, !1);
      const o = h.value;
      o && Pt(o, "lostpointercapture", le, !1), a.eventElement = null;
    }, Oe = () => {
      const t = h.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, We = () => {
      const t = h.value, o = a.pointerId;
      if (a.pointerId = null, !(!t || o === null))
        try {
          t.hasPointerCapture(o) && t.releasePointerCapture(o);
        } catch {
        }
    };
    function Gt() {
      Z !== null && (cancelAnimationFrame(Z), Z = null), it = null;
    }
    function $t() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, P = !1, ke(), We();
    }
    function re() {
      kt(), e.active || N(!1);
    }
    function ce() {
      $t(), re();
    }
    function zt() {
      Gt(), P && (I == null || I.abortDrag(O)), ce();
    }
    function Rt(t = null) {
      const o = a.isDragging, u = a.isResizing, f = P;
      if (Gt(), $t(), o || u) {
        const b = l(a.beforeInteraction);
        D(b), s(o ? "drag-cancel" : "resize-cancel", t, b, l(b)), o && f && (I == null || I.cancelDrag(O, t));
      }
      re();
    }
    function ue() {
      zt(), N(!1);
    }
    const Ge = (t, o) => {
      var f, b;
      if (e.disabled || e.initRect || a.isDragging || a.isResizing || o && (!H.value || !Wt(o)) || !o && !e.draggable) return;
      const u = l(c.value);
      if (o) {
        if (((f = e.canResize) == null ? void 0 : f.call(e, u, o)) === !1) return;
      } else if (((b = e.canDrag) == null ? void 0 : b.call(e, u)) === !1)
        return;
      P = !o && I !== null, P && (I == null || I.beginDrag(O, t)), d(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = l(c.value), a.handle = o, a.isDragging = !o, a.isResizing = !!o, N(!0), a.isDragging && s("drag-start", t, l(a.beforeInteraction)), a.isResizing && s("resize-start", t, l(a.beforeInteraction)), a.eventElement = document.documentElement, He(), Oe();
    }, $e = (t) => {
      if (!(t instanceof Element)) return !0;
      const o = h.value;
      if (!o) return !0;
      const u = (f) => {
        try {
          const b = t.closest(f);
          return {
            valid: !0,
            matched: b instanceof Element && o.contains(b)
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
    }, de = (t, o) => {
      !t.isPrimary || t.button !== 0 || !o && !$e(t.target) || Ge(t, o);
    };
    function Ve(t) {
      Z !== null && (cancelAnimationFrame(Z), Z = null), it && (ie(it), it = null), a.isDragging && (s("drag-stop", t, l(a.beforeInteraction), l(c.value)), P && (I == null || I.endDrag(O, t))), a.isResizing && s("resize-stop", t, l(a.beforeInteraction), l(c.value)), ce();
    }
    const Ke = (t, o) => {
      var m;
      d();
      const u = l(c.value);
      if (((m = e.canDrag) == null ? void 0 : m.call(e, l(u))) === !1) return;
      const f = l(u);
      t === "left" && (f.left = p(f.left) - o), t === "right" && (f.left = p(f.left) + o), t === "top" && (f.top = p(f.top) - o), t === "bottom" && (f.top = p(f.top) + o);
      const b = ee(f, u, e.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, u);
      if (b) {
        const x = D(b);
        s("move", l(x));
      }
    }, Ye = (t, o, u) => {
      var E;
      if (!H.value || !Wt(t)) return;
      d();
      const f = l(c.value);
      if (((E = e.canResize) == null ? void 0 : E.call(e, l(f), t)) === !1) return;
      const b = o === "left" ? -u : o === "right" ? u : 0, m = o === "top" ? -u : o === "bottom" ? u : 0, x = De(b, m, B.value);
      let S = ne(f, t, x.x, x.y);
      B.value && (S = J(S, t), S = Y(S)), K(S);
      const R = Ot(S, f);
      if (!R || Nn(R, f)) return;
      const A = D(R);
      s("resize", l(A));
    }, _e = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Xe = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), ot = (t) => Xe.has(t), Ue = (t) => ot(t) ? "group" : "separator", qe = (t) => ot(t) ? "two-axis resize handle" : void 0, Je = (t) => `Resize ${_e[t]}`, Ze = (t) => {
      if (!ot(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, Dt = (t) => t === "ml" || t === "mr", fe = (t) => {
      if (!ot(t))
        return p(
          Dt(t) ? c.value.width : c.value.height
        );
    }, Qe = (t) => {
      if (!ot(t))
        return p(Dt(t) ? e.minWidth : e.minHeight);
    }, je = (t) => {
      if (ot(t)) return;
      const o = Dt(t) ? e.maxWidth : e.maxHeight;
      if (o === void 0) return;
      const u = p(o);
      return Number.isFinite(u) ? u : void 0;
    }, tn = (t) => {
      const o = fe(t);
      if (o !== void 0)
        return e.unitType === "%" ? `${o} percent` : `${o} pixels`;
    }, en = (t) => {
      if (e.keyboardEnabled)
        return ot(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : Dt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, nn = (t) => {
      t.target === h.value && e.keyboardEnabled && !e.disabled && !e.initRect && N(!0);
    }, on = [
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
    ].join(","), an = (t) => {
      const o = t.target, u = h.value;
      if (!(o instanceof Element) || !u || o === u || o.closest(".handle")) return !1;
      const f = o.closest(on);
      return f !== null && f !== u && u.contains(f);
    }, sn = Rn(
      () => ({
        enabled: e.keyboardEnabled,
        step: e.keyboardStep,
        disabled: e.disabled,
        readOnly: e.initRect,
        active: a.active,
        dragDirections: e.dragDirections,
        resizeDirections: e.resizeDirections,
        focusedHandle: M.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: Ke,
        resize: Ye,
        deactivate: ue,
        cancel: (t) => Rt(t)
      }
    ), ln = (t) => {
      an(t) || sn.handleKeyDown(t);
    }, Vt = (t) => k.value ? t / 100 * a.parentWidth : t, Kt = (t) => k.value ? t / 100 * a.parentHeight : t, rn = (t) => ({
      left: `${Vt(t) - Vt(p(c.value.left))}px`,
      top: `${-Kt(p(c.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: e.theme
    }), cn = (t) => ({
      top: `${Kt(t) - Kt(p(c.value.top))}px`,
      left: `${-Vt(p(c.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: e.theme
    });
    return i({
      getConfig: () => l(c.value),
      setPosition: (t, o) => D({ ...c.value, left: t, top: o }),
      setSize: (t, o) => D({ ...c.value, width: t, height: o }),
      reset: () => D(l(y)),
      activate: () => N(!0),
      deactivate: ue,
      cancelInteraction: (t = null) => Rt(t)
    }), mn(() => {
      Gt(), $t(), I == null || I.unregisterMember(O), kt();
    }), (t, o) => (st(), lt("div", {
      ref_key: "movableRef",
      ref: h,
      class: be(["auto-draggable", {
        "select-none": n.disabledUserSelect,
        "is-disabled": n.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": n.initRect
      }]),
      style: Tt($.value),
      tabindex: "0",
      onPointerdown: o[1] || (o[1] = (u) => de(u, null)),
      onDblclick: o[2] || (o[2] = (u) => s("dblclick", u)),
      onFocus: nn,
      onKeydown: ln
    }, [
      (st(!0), lt(_t, null, Xt(ye(te).vertical, (u, f) => (st(), lt("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: Tt(rn(u))
      }, null, 4))), 128)),
      (st(!0), lt(_t, null, Xt(ye(te).horizontal, (u, f) => (st(), lt("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: Tt(cn(u))
      }, null, 4))), 128)),
      (st(!0), lt(_t, null, Xt(n.handles, (u) => vn((st(), lt("div", {
        key: u,
        class: be(["handle", `handle-${u}`]),
        style: Tt(V.value),
        role: Ue(u),
        "aria-roledescription": qe(u),
        "aria-orientation": Ze(u),
        "aria-label": Je(u),
        "aria-valuenow": fe(u),
        "aria-valuemin": Qe(u),
        "aria-valuemax": je(u),
        "aria-valuetext": tn(u),
        "aria-keyshortcuts": en(u),
        tabindex: n.keyboardEnabled ? 0 : void 0,
        onPointerdown: bn((f) => de(f, u), ["stop", "prevent"]),
        onFocus: (f) => M.value = u,
        onBlur: o[0] || (o[0] = (f) => M.value = null)
      }, null, 46, Wn)), [
        [yn, a.active && H.value && !n.disabled && Wt(u)]
      ])), 128)),
      Ae(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Vn = (n, i) => {
  const r = n.__vccOpts || n;
  for (const [e, s] of i)
    r[e] = s;
  return r;
}, Kn = /* @__PURE__ */ Vn($n, [["__scopeId", "data-v-da8dac0b"]]), Yn = Ct({
  name: "MovableGroup"
}), _n = /* @__PURE__ */ Ct({
  ...Yn,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(n, { expose: i, emit: r }) {
    const e = n, s = r, l = /* @__PURE__ */ new Map(), h = j([]), c = j(null), y = nt(() => e.selected !== void 0), M = nt({
      get: () => y.value ? e.selected ?? [] : h.value,
      set: (d) => {
        h.value = d, s("update:selected", d);
      }
    });
    ut(
      () => e.selected,
      (d) => {
        d !== void 0 && (h.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => dt(d), H = (d, g, v) => ({
      ...d,
      left: p(d.left) + g,
      top: p(d.top) + v
    }), k = (d) => d.reduce(
      (g, v) => ({
        minLeft: Math.min(g.minLeft, p(v.left)),
        minTop: Math.min(g.minTop, p(v.top)),
        maxRight: Math.max(g.maxRight, p(v.left) + p(v.width)),
        maxBottom: Math.max(g.maxBottom, p(v.top) + p(v.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), B = (d, g, v) => {
      const z = k([...d.values()]);
      return {
        left: Math.min(
          Math.max(g.left, v.minLeft - z.minLeft),
          v.maxRight - z.maxRight
        ),
        top: Math.min(
          Math.max(g.top, v.minTop - z.minTop),
          v.maxBottom - z.maxBottom
        )
      };
    }, $ = (d) => {
      const g = [];
      for (const [v, z] of d) {
        const T = l.get(v);
        T && g.push({ id: v, rect: a(T.getRect()), startRect: a(z) });
      }
      return g;
    }, V = (d) => d.map(({ id: g, rect: v }) => ({ id: g, rect: v })), D = (d) => {
      const g = d.filter((z) => l.has(z)), v = M.value;
      v.length === g.length && v.every((z, T) => z === g[T]) || (M.value = g);
    };
    return xn(Pe, {
      registerMember: (d, g) => {
        l.set(d, g);
      },
      unregisterMember: (d) => {
        var g;
        if (l.delete(d), ((g = c.value) == null ? void 0 : g.leaderId) === d) {
          c.value = null;
          return;
        }
        c.value && c.value.startRects.delete(d), M.value.includes(d) && D(M.value.filter((v) => v !== d));
      },
      beginDrag: (d, g) => {
        if (c.value && c.value.leaderId !== d || !l.has(d)) return;
        M.value.includes(d) || D([d]);
        const v = /* @__PURE__ */ new Map();
        for (const T of M.value) {
          const w = l.get(T);
          w && v.set(T, a(w.getRect()));
        }
        c.value = { leaderId: d, startRects: v };
        const z = [];
        for (const [T, w] of v) z.push({ id: T, rect: a(w) });
        s("move-start", { leaderId: d, source: g, rects: z });
      },
      constrainPosition: (d, g) => {
        var J, K, Y;
        const v = c.value, z = v == null ? void 0 : v.startRects.get(d);
        if (!v || !z || !l.has(d)) return g;
        const T = p(g.left) - p(z.left), w = p(g.top) - p(z.top), F = (J = l.get(d)) == null ? void 0 : J.getAreaEdges();
        if (e.sharedBounds) {
          let I = { left: T, top: w };
          F && (I = B(v.startRects, I, F));
          for (const [O, P] of v.startRects)
            O !== d && ((K = l.get(O)) == null || K.translateTo(H(P, I.left, I.top)));
          return H(z, I.left, I.top);
        }
        if (F)
          for (const [I, O] of v.startRects) {
            if (I === d) continue;
            const P = H(O, T, w), ft = Math.max(F.minLeft, F.maxRight - p(O.width)), L = Math.max(F.minTop, F.maxBottom - p(O.height));
            P.left = rt(p(P.left), F.minLeft, ft), P.top = rt(p(P.top), F.minTop, L), (Y = l.get(I)) == null || Y.translateTo(P);
          }
        return g;
      },
      notifyMoved: (d, g) => {
        const v = c.value;
        if (!v || v.leaderId !== d) return;
        const z = V($(v.startRects)).map(
          (T) => T.id === d ? { id: d, rect: a(g) } : T
        );
        s("move", { leaderId: d, rects: z });
      },
      endDrag: (d, g) => {
        const v = c.value;
        if (!v || v.leaderId !== d) return;
        const z = $(v.startRects);
        c.value = null, s("move-stop", { leaderId: d, source: g, rects: z });
      },
      cancelDrag: (d, g) => {
        var T;
        const v = c.value;
        if (!v || v.leaderId !== d) return;
        for (const [w, F] of v.startRects)
          w !== d && ((T = l.get(w)) == null || T.translateTo(a(F)));
        const z = $(v.startRects);
        c.value = null, s("move-cancel", { leaderId: d, source: g, rects: z });
      },
      abortDrag: (d) => {
        var g;
        ((g = c.value) == null ? void 0 : g.leaderId) === d && (c.value = null);
      }
    }), i({
      getSelected: () => [...M.value],
      select: (d) => D(d ?? [...l.keys()]),
      getMemberRects: () => [...l.entries()].map(([d, g]) => ({ id: d, rect: a(g.getRect()) }))
    }), (d, g) => Ae(d.$slots, "default");
  }
}), Le = "VueMovableBox", Ce = (n) => {
  n.component(Le, Kn), n.component("MovableGroup", _n);
}, qn = {
  name: Le,
  version: "3.0.0",
  install: Ce
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Ce });
export {
  Kn as MovableBox,
  _n as MovableGroup,
  qn as default,
  Le as name
};
