import { computed as tt, ref as J, defineComponent as St, reactive as fn, watch as ut, inject as pn, getCurrentInstance as hn, onMounted as gn, onUnmounted as mn, openBlock as ot, createElementBlock as at, normalizeStyle as It, normalizeClass as ve, Fragment as Kt, renderList as Yt, unref as be, withDirectives as vn, withModifiers as bn, vShow as yn, renderSlot as Te, provide as xn } from "vue";
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
function Rn(e, i) {
  return { handleKeyDown: (n) => {
    const l = e(), s = l.interacting;
    if (!s && (!l.enabled || l.disabled || !l.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), s ? i.cancel(n) : i.deactivate();
      return;
    }
    if (s || l.readOnly) return;
    const h = wn[n.key];
    if (!h) return;
    const c = Number.isFinite(l.step) && l.step > 0 ? l.step : 1;
    if (l.focusedHandle && l.resizeDirections.includes(l.focusedHandle)) {
      if (!In[l.focusedHandle].includes(h)) return;
      n.preventDefault(), i.resize(
        l.focusedHandle,
        n.shiftKey ? zn[h] : h,
        c
      );
      return;
    }
    if (n.shiftKey) {
      const y = l.resizeDirections.includes("br") ? "br" : l.resizeDirections[0];
      if (!y) return;
      n.preventDefault(), i.resize(y, h, c);
      return;
    }
    l.dragDirections.includes(h) && (n.preventDefault(), i.move(h, c));
  } };
}
const zt = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const i = Number(e);
  return Number.isFinite(i) ? i : null;
}, Dn = (e) => {
  const i = zt(e.left), r = zt(e.top), n = zt(e.width), l = zt(e.height);
  return i === null || r === null || n === null || l === null || n < 0 || l < 0 ? null : { left: i, top: r, width: n, height: l };
};
function Tn(e, i) {
  const r = Number.isFinite(i) && i > 0 ? i : 20;
  return Math.round(e / r) * r;
}
const ye = (e, i, r) => i.distance > r ? e : !e || i.distance < e.distance ? i : e, Ae = ["alignment", "spacing"], xe = (e, i, r, n, l) => {
  const s = l.length > 0 ? l : Ae;
  for (const h of s) {
    const c = h === "alignment" ? i : r;
    if (c && c.distance <= n) {
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
          axis: e,
          gap: y.gap,
          targetIds: y.targetIds,
          guides: y.guides
        },
        value: y.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, Me = (e, i, r, n, l) => {
  const s = (a) => e === "horizontal" ? a.left : a.top, h = (a) => e === "horizontal" ? a.left + a.width : a.top + a.height, c = [], y = [];
  for (const a of l)
    h(a.rect) <= i && c.push(a), s(a.rect) >= i + r && y.push(a);
  let M = null;
  for (const a of c)
    for (const H of y) {
      const k = s(H.rect) - h(a.rect) - r;
      if (k < 0) continue;
      const S = k / 2, G = h(a.rect) + S, W = Math.abs(i - G);
      W > n || (!M || W < M.distance) && (M = {
        distance: W,
        value: G,
        gap: S,
        guides: [h(a.rect), s(H.rect)],
        targetIds: [a.id, H.id]
      });
    }
  return M;
};
function An(e, i, r = 10, n = { horizontal: !0, vertical: !0 }, l = {}) {
  const s = Math.max(0, Number.isFinite(r) ? r : 10), h = e.left + e.width, c = e.top + e.height, y = e.left + e.width / 2, M = e.top + e.height / 2, a = l.priority ?? Ae, H = (D, w) => l.filter ? l.filter(D, w) !== !1 : !0;
  let k = null, S = null;
  const G = [], W = [];
  for (const D of i) {
    const w = Dn(D);
    if (!w) continue;
    const F = n.horizontal && H(D, "horizontal"), X = n.vertical && H(D, "vertical");
    if (F && G.push({ rect: w, id: D.id }), X && W.push({ rect: w, id: D.id }), !F && !X) continue;
    const $ = w.left + w.width, V = w.top + w.height, I = w.left + w.width / 2, O = w.top + w.height / 2, B = D.id, ft = [
      {
        distance: Math.abs(e.left - w.left),
        value: w.left,
        guide: w.left,
        point: "left",
        targetId: B
      },
      {
        distance: Math.abs(h - $),
        value: $ - e.width,
        guide: $,
        point: "right",
        targetId: B
      },
      {
        distance: Math.abs(e.left - $),
        value: $,
        guide: $,
        point: "left",
        targetId: B
      },
      {
        distance: Math.abs(h - w.left),
        value: w.left - e.width,
        guide: w.left,
        point: "right",
        targetId: B
      },
      {
        distance: Math.abs(y - I),
        value: I - e.width / 2,
        guide: I,
        point: "center-x",
        targetId: B
      }
    ], C = [
      {
        distance: Math.abs(e.top - w.top),
        value: w.top,
        guide: w.top,
        point: "top",
        targetId: B
      },
      {
        distance: Math.abs(c - V),
        value: V - e.height,
        guide: V,
        point: "bottom",
        targetId: B
      },
      {
        distance: Math.abs(e.top - V),
        value: V,
        guide: V,
        point: "top",
        targetId: B
      },
      {
        distance: Math.abs(c - w.top),
        value: w.top - e.height,
        guide: w.top,
        point: "bottom",
        targetId: B
      },
      {
        distance: Math.abs(M - O),
        value: O - e.height / 2,
        guide: O,
        point: "center-y",
        targetId: B
      }
    ];
    if (F)
      for (const rt of ft) k = ye(k, rt, s);
    if (X)
      for (const rt of C) S = ye(S, rt, s);
  }
  const R = n.horizontal ? xe(
    "horizontal",
    k,
    Me(
      "horizontal",
      e.left,
      e.width,
      s,
      G
    ),
    s,
    a
  ) : null, N = n.vertical ? xe(
    "vertical",
    S,
    Me("vertical", e.top, e.height, s, W),
    s,
    a
  ) : null, d = (R == null ? void 0 : R.candidate) ?? null, g = (N == null ? void 0 : N.candidate) ?? null, b = [d == null ? void 0 : d.point, g == null ? void 0 : g.point].filter(
    (D) => !!D
  ), z = [R == null ? void 0 : R.spacingInfo, N == null ? void 0 : N.spacingInfo].filter(
    (D) => !!D
  );
  return {
    left: (R == null ? void 0 : R.value) ?? e.left,
    top: (N == null ? void 0 : N.value) ?? e.top,
    snapped: b.length > 0 || z.length > 0,
    snapPoint: b[0],
    points: b,
    targetId: (d == null ? void 0 : d.targetId) ?? (g == null ? void 0 : g.targetId),
    targetIds: { horizontal: d == null ? void 0 : d.targetId, vertical: g == null ? void 0 : g.targetId },
    guides: {
      vertical: (R == null ? void 0 : R.guides) ?? [],
      horizontal: (N == null ? void 0 : N.guides) ?? []
    },
    spacing: z
  };
}
function En(e) {
  const i = (l) => {
    const s = e();
    return s.snapToGrid ? Tn(l, s.gridSize) : l;
  }, r = (l, s) => ({
    left: i(l),
    top: i(s)
  }), n = tt(() => {
    const l = e();
    return l.snapToGrid ? {
      size: Number.isFinite(l.gridSize) && l.gridSize > 0 ? l.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: i, snapPosition: r, gridInfo: n };
}
const _t = () => ({ vertical: [], horizontal: [] });
function Sn(e) {
  const i = J(_t()), r = J(null);
  return { guides: i, lastSnapResult: r, resolveSnap: (h, c, y) => {
    const M = e(), a = M.enabled ? An(h, c, M.threshold, y, {
      filter: M.filter,
      priority: M.priority
    }) : {
      ...h,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: _t(),
      spacing: []
    };
    return i.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    i.value = _t(), r.value = null;
  }, setGuides: (h) => {
    i.value = h;
  } };
}
const Rt = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const i = Number(e);
  return Number.isFinite(i) ? i : null;
}, Ee = (e) => {
  const i = Rt(e.left), r = Rt(e.top), n = Rt(e.width), l = Rt(e.height);
  return i === null || r === null || n === null || l === null || n < 0 || l < 0 ? null : { left: i, top: r, width: n, height: l };
}, we = (e, i, r, n) => {
  const l = r - i;
  if (l === 0) return i < n ? e : null;
  const s = (n - i) / l;
  return l > 0 ? { ...e, exit: Math.min(e.exit, s) } : { ...e, entry: Math.max(e.entry, s) };
}, Ie = (e, i, r, n) => {
  const l = r - i;
  if (l === 0) return i > n ? e : null;
  const s = (n - i) / l;
  return l > 0 ? { ...e, entry: Math.max(e.entry, s) } : { ...e, exit: Math.min(e.exit, s) };
}, Bn = (e, i, r) => {
  let n = { entry: 0, exit: 1 };
  if (n = we(n, e.left, i.left, r.left + r.width), !n || (n = Ie(
    n,
    e.left + e.width,
    i.left + i.width,
    r.left
  ), !n) || (n = we(n, e.top, i.top, r.top + r.height), !n) || (n = Ie(
    n,
    e.top + e.height,
    i.top + i.height,
    r.top
  ), !n)) return null;
  const l = Math.max(0, n.entry), s = Math.min(1, n.exit);
  return l < s && s > 0 && l < 1 ? { entry: l, exit: s } : null;
};
function Et(e, i, r) {
  let n = null;
  for (const l of r) {
    const s = Ee(l);
    if (!s) continue;
    const h = Bn(e, i, s);
    h && (!n || h.entry < n.entry) && (n = h);
  }
  return n;
}
function Pn(e, i) {
  const r = Math.min(e.left + e.width, i.left + i.width) - Math.max(e.left, i.left), n = Math.min(e.top + e.height, i.top + i.height) - Math.max(e.top, i.top);
  if (r <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const l = e.left + e.width / 2, s = e.top + e.height / 2, h = i.left + i.width / 2, c = i.top + i.height / 2, y = l - h, M = s - c;
  return {
    colliding: !0,
    direction: r <= n ? y > 0 ? "right" : "left" : M > 0 ? "bottom" : "top",
    overlap: Math.min(r, n),
    overlapArea: r * n
  };
}
function Xt(e, i, r) {
  const n = [];
  for (const l of i) {
    const s = Ee(l);
    if (!s) continue;
    const h = Pn(e, s);
    h.colliding && n.push({ ...h, targetId: l.id });
  }
  return n;
}
function ze(e) {
  let i = null;
  for (const r of e)
    (!i || (r.overlapArea ?? 0) > (i.overlapArea ?? 0)) && (i = r);
  return i;
}
const Ut = (e) => e.reduce((i, r) => i + (r.overlapArea ?? 0), 0), Se = (e, i, r) => ({
  left: e.left + (i.left - e.left) * r,
  top: e.top + (i.top - e.top) * r,
  width: e.width + (i.width - e.width) * r,
  height: e.height + (i.height - e.height) * r
}), Cn = (e, i) => e.left === i.left && e.top === i.top && e.width === i.width && e.height === i.height, qt = (e, i, r, n) => {
  if (!Et(e, i, r)) return i;
  let l = 0, s = 1, h = e;
  for (let c = 0; c < 24; c += 1) {
    const y = (l + s) / 2, M = n(Se(e, i, y));
    Et(e, M, r) ? s = y : (h = M, l = y);
  }
  return h;
};
function Nn(e) {
  const i = J([]), r = J(!1), n = (c, y) => {
    const a = e().enabled ? Xt(c, y) : [];
    return i.value = a, r.value = a.length > 0, {
      results: a,
      dominant: ze(a),
      totalOverlapArea: Ut(a)
    };
  }, l = (c) => (i.value = c, r.value = c.length > 0, {
    results: c,
    dominant: ze(c),
    totalOverlapArea: Ut(c)
  });
  return { collisions: i, isColliding: r, evaluate: n, resolveCandidate: (c, y, M, a = (k) => k, H = "path") => {
    const k = e(), S = n(c, M);
    if (!k.enabled || k.allowOverlap)
      return { accepted: !0, rect: c, ...S };
    const G = Xt(y, M), W = Ut(G);
    if (W > 0)
      return {
        accepted: S.totalOverlapArea < W,
        rect: c,
        ...S
      };
    const R = Et(y, c, M);
    if (S.results.length === 0 && !R)
      return { accepted: !0, rect: c, ...S };
    let N = S;
    if (S.results.length === 0 && R) {
      const g = Se(
        y,
        c,
        R.entry + (R.exit - R.entry) * 1e-3
      );
      N = l(Xt(g, M));
    }
    let d = null;
    if (H === "slide") {
      const g = qt(
        y,
        { ...y, left: c.left },
        M,
        a
      ), b = qt(
        y,
        { ...y, top: c.top },
        M,
        a
      ), z = a({
        ...c,
        left: g.left,
        top: b.top
      });
      Et(y, z, M) || (d = z);
    }
    return d ?? (d = qt(y, c, M, a)), {
      accepted: !Cn(d, y),
      rect: d,
      ...N
    };
  }, clearCollisions: () => {
    i.value = [], r.value = !1;
  } };
}
const p = (e, i = 0) => {
  if (e == null || e === "")
    return i;
  const r = typeof e == "string" ? Number(e) : e;
  return Number.isFinite(r) ? r : i;
}, st = (e, i, r) => Math.min(Math.max(e, i), r), Ln = (e, i) => p(e.left) === p(i.left) && p(e.top) === p(i.top) && p(e.width) === p(i.width) && p(e.height) === p(i.height), Bt = (e) => {
  const i = typeof e == "number" ? e : Number(e ?? 0);
  if (!Number.isFinite(i)) return 0;
  const r = (i % 360 + 360) % 360;
  return r > 180 ? r - 360 : r;
}, Pt = (e) => e * Math.PI / 180, _ = (e) => Math.round(e * 1e9) / 1e9, Fn = (e, i) => {
  const r = Bt(i);
  if (r === 0) return { ...e };
  const n = Pt(r), l = Math.cos(n), s = Math.sin(n), h = Math.abs(e.width * l) + Math.abs(e.height * s), c = Math.abs(e.width * s) + Math.abs(e.height * l);
  return {
    left: _(e.left + (e.width - h) / 2),
    top: _(e.top + (e.height - c) / 2),
    width: _(h),
    height: _(c)
  };
}, Hn = (e, i, r) => {
  const n = { x: i / 2, y: r / 2 };
  if (!e) return n;
  const l = e.trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 2);
  if (l.length === 0) return n;
  let s = null, h = null;
  const c = (y) => {
    s === null ? s = y : h === null && (h = y);
  };
  for (const y of l)
    if (y === "left") s = 0;
    else if (y === "right") s = i;
    else if (y === "top") h = 0;
    else if (y === "bottom") h = r;
    else if (y === "center") c(i / 2);
    else if (y.endsWith("%")) {
      const M = Number(y.slice(0, -1));
      if (!Number.isFinite(M)) return n;
      c(M / 100 * (s === null ? i : r));
    } else {
      const M = Number.parseFloat(y);
      if (!Number.isFinite(M)) return n;
      c(M);
    }
  return { x: s ?? i / 2, y: h ?? r / 2 };
}, kn = (e, i, r) => {
  const n = Fn(e, i), l = Bt(i);
  if (l === 0) return n;
  const s = Pt(l), h = Math.cos(s), c = Math.sin(s), y = e.width / 2 - r.x, M = e.height / 2 - r.y, a = _(y * h - M * c - y), H = _(y * c + M * h - M);
  return {
    left: _(n.left + a),
    top: _(n.top + H),
    width: n.width,
    height: n.height
  };
}, Re = (e, i, r) => {
  const n = Bt(r);
  if (n === 0) return { x: e, y: i };
  const l = Pt(n), s = Math.cos(l), h = Math.sin(l);
  return {
    x: _(e * s + i * h),
    y: _(-e * h + i * s)
  };
}, Be = Symbol("MovableGroupContext"), On = 2, lt = (e, i = 1) => {
  if (e == null || e === "")
    return i;
  const r = typeof e == "string" ? parseFloat(e) : e;
  return isNaN(r) ? i : r;
}, Dt = (e, i = "px") => e == null || e === "" ? "0" : `${e}${i}`;
function Tt(e, i, r, n) {
  e && e.addEventListener(i, r, n);
}
function At(e, i, r, n) {
  e && e.removeEventListener(i, r, n);
}
const De = (e, i = 1, r = On) => {
  const n = new Mn(e).toDecimalPlaces(r).toNumber();
  return lt(n, i);
}, dt = (e) => {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Array)
    return e.map((i) => dt(i));
  if (e instanceof Object) {
    const i = {};
    for (const r in e)
      e.hasOwnProperty(r) && (i[r] = dt(e[r]));
    return i;
  }
  return e;
}, Gn = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Wn = St({
  name: "VueMovableBox"
}), $n = /* @__PURE__ */ St({
  ...Wn,
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
  setup(e, { expose: i, emit: r }) {
    var de;
    const n = e, l = r, s = (t) => dt(t), h = J(), c = J(s(n.modelValue)), y = s(n.modelValue), M = J(null), a = fn({
      active: n.active,
      isDragging: !1,
      isResizing: !1,
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: s(n.modelValue),
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    ut(
      () => n.modelValue,
      (t) => {
        c.value = s(t);
      },
      { deep: !0 }
    ), ut(
      () => n.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? xt() : N(t);
      },
      { flush: "sync" }
    ), ut(
      () => n.disabled,
      (t) => {
        l("disabled", t), t && xt();
      }
    ), ut(
      () => n.initRect,
      (t) => {
        t && xt();
      }
    ), ut(
      () => n.isKeepDecimals,
      (t, o) => {
        !t && o && R({
          ...c.value,
          left: Math.round(p(c.value.left)),
          top: Math.round(p(c.value.top)),
          width: Math.round(p(c.value.width)),
          height: Math.round(p(c.value.height))
        });
      }
    );
    const H = tt(() => n.resizable ?? n.resizeable ?? !0), k = tt(() => n.unitType === "%"), S = tt(() => Bt(n.rotate)), G = tt(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : a.active ? n.theme : n.inActiveColor,
      left: Dt(c.value.left, n.unitType),
      top: Dt(c.value.top, n.unitType),
      width: Dt(c.value.width, n.unitType),
      height: Dt(c.value.height, n.unitType),
      zIndex: c.value.zIndex,
      cursor: n.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: S.value ? `rotate(${S.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: n.transformOrigin,
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: n.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), W = tt(() => ({
      borderColor: H.value ? n.theme : n.inActiveColor,
      scale: De(1 / lt(n.scale, 1), 1)
    })), R = (t) => {
      const o = s(t);
      return c.value = o, l("update:modelValue", s(o)), o;
    };
    function N(t) {
      a.active !== t && (a.active = t, l(t ? "active" : "inactive", s(c.value)), t || Nt());
    }
    const d = () => {
      var o, u, f;
      let t = null;
      if (n.limitAreaClass)
        try {
          t = document.querySelector(n.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((o = h.value) == null ? void 0 : o.parentElement) ?? null, a.parentWidth = ((u = a.parentElement) == null ? void 0 : u.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, g = (t) => Math.max(0, Number(t) || 0), b = () => {
      const t = g(n.edgeDistance);
      return {
        top: t + g(n.boundsMargin.top),
        right: t + g(n.boundsMargin.right),
        bottom: t + g(n.boundsMargin.bottom),
        left: t + g(n.boundsMargin.left)
      };
    }, z = () => {
      const t = b(), o = k.value ? 100 : a.parentWidth, u = k.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, o - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, u - t.bottom)
      };
    }, D = (t) => {
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
      const o = w(t), u = S.value;
      if (!u) return o;
      const f = Hn(n.transformOrigin, o.width, o.height);
      return kn(o, u, f);
    }, X = (t) => {
      const o = S.value;
      if (!o || !n.limitAreaForParent || !a.parentElement) return t;
      const u = z(), f = Math.max(0, u.maxRight - u.minLeft), x = Math.max(0, u.maxBottom - u.minTop), m = Pt(o), v = Math.abs(Math.cos(m)), E = Math.abs(Math.sin(m));
      let T = p(t.width), A = p(t.height);
      for (let P = 0; P < 2; P += 1)
        v * T + E * A > f && (v >= E ? T = Math.max(0, (f - E * A) / (v || 1)) : A = Math.max(0, (f - v * T) / (E || 1))), E * T + v * A > x && (E >= v ? T = Math.max(0, (x - v * A) / (E || 1)) : A = Math.max(0, (x - E * T) / (v || 1)));
      return { ...t, width: C(T), height: C(A) };
    }, $ = (t) => {
      if (!a.parentElement) return;
      const o = z(), u = F(t), f = u.left, x = u.top, m = f + u.width, v = x + u.height;
      f < o.minLeft && l("out-of-bounds", "left"), m > o.maxRight && l("out-of-bounds", "right"), x < o.minTop && l("out-of-bounds", "top"), v > o.maxBottom && l("out-of-bounds", "bottom");
    }, V = (t) => {
      if (!n.limitAreaForParent || !a.parentElement) return t;
      const o = F(t), u = D(o), f = st(o.left, u.minLeft, u.maxLeft), x = st(o.top, u.minTop, u.maxTop);
      return S.value ? {
        ...t,
        left: C(p(t.left) + (f - o.left)),
        top: C(p(t.top) + (x - o.top))
      } : {
        ...t,
        left: f,
        top: x
      };
    }, I = pn(Be, null), O = n.memberId || `member-${((de = hn()) == null ? void 0 : de.uid) ?? Math.random().toString(36).slice(2)}`;
    let B = !1;
    const ft = {
      getRect: () => s(c.value),
      translateTo: (t) => {
        R(t);
      },
      getAreaEdges: () => (d(), a.parentElement ? z() : null)
    };
    gn(() => I == null ? void 0 : I.registerMember(O, ft));
    const C = (t) => n.isKeepDecimals ? De(t, 0, n.decimalPlaces) : Math.round(t), rt = (t, o) => {
      const u = lt(n.scale, 1), f = t / (u === 0 ? 1 : u);
      if (!k.value) return C(f);
      const x = o === "horizontal" ? a.parentWidth : a.parentHeight;
      return x > 0 ? C(f / x * 100) : 0;
    }, Jt = En(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Z = Sn(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), Zt = Nn(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), Qt = Z.guides;
    let pt = "clear", ht = "clear", gt = "clear";
    const vt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), bt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Ct = (t) => {
      const o = {
        horizontal: t.points.some((v) => vt.has(v)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((v) => bt.has(v)) ? t.targetIds.vertical : void 0
      }, u = t.snapped ? dt(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: o,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, x = JSON.stringify({
        payload: f,
        left: t.points.some((v) => vt.has(v)) ? t.left : void 0,
        top: t.points.some((v) => bt.has(v)) ? t.top : void 0
      });
      x !== pt && ((t.snapped || pt !== "clear") && l("snap", f), pt = t.snapped ? x : "clear");
      const m = JSON.stringify({ guides: t.guides, targetIds: o });
      m !== ht && ((t.snapped || ht !== "clear") && l("guides", dt(t.guides)), ht = t.snapped ? m : "clear");
    }, Ne = (t) => {
      const o = t.dominant, u = o ? {
        colliding: !0,
        direction: o.direction,
        targetId: o.targetId
      } : { colliding: !1 }, f = JSON.stringify(u);
      f !== gt && ((o || gt !== "clear") && l("collision", u), gt = o ? f : "clear");
    }, Nt = () => {
      pt !== "clear" && l("snap", { snapped: !1 }), ht !== "clear" && l("guides", { vertical: [], horizontal: [] }), gt !== "clear" && l("collision", { colliding: !1 }), pt = "clear", ht = "clear", gt = "clear", Z.clearGuides(), Zt.clearCollisions();
    }, Lt = (t, o, u = "path") => {
      const f = F(t), x = Zt.resolveCandidate(
        f,
        F(o),
        n.snapTargets,
        (m) => ({
          left: C(m.left),
          top: C(m.top),
          width: C(m.width),
          height: C(m.height)
        }),
        u
      );
      return Ne(x), x.accepted ? S.value ? {
        ...t,
        left: C(p(t.left) + (x.rect.left - f.left)),
        top: C(p(t.top) + (x.rect.top - f.top))
      } : { ...t, ...x.rect } : null;
    }, jt = (t, o, u, f, x) => {
      let m = s(t);
      f.horizontal && (m.left = Jt.snapValue(p(t.left))), f.vertical && (m.top = Jt.snapValue(p(t.top)));
      let v = {
        ...w(m),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const T = F(m);
        v = Z.resolveSnap(T, n.snapTargets, f), S.value ? m = {
          ...m,
          left: C(p(m.left) + (v.left - T.left)),
          top: C(p(m.top) + (v.top - T.top))
        } : m = { ...m, left: v.left, top: v.top };
      } else
        Z.clearGuides();
      if (x) {
        const T = p(x.left), A = p(x.top);
        n.dragDirections.includes("left") || (m.left = Math.max(T, p(m.left))), n.dragDirections.includes("right") || (m.left = Math.min(T, p(m.left))), n.dragDirections.includes("top") || (m.top = Math.max(A, p(m.top))), n.dragDirections.includes("bottom") || (m.top = Math.min(A, p(m.top)));
      }
      $(m), m = V(m);
      const E = Lt(m, o, "slide");
      if (!E)
        return Ct({
          ...v,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Z.clearGuides(), null;
      if (m = E, v.snapped) {
        const T = p(m.left) !== v.left, A = p(m.top) !== v.top, P = v.points.filter((L) => vt.has(L) ? !T : bt.has(L) ? !A : !1), Y = P.some((L) => vt.has(L)), Q = P.some((L) => bt.has(L)), q = v.spacing.filter(
          (L) => L.axis === "horizontal" ? !T : !A
        ), K = {
          vertical: q.flatMap((L) => L.axis === "horizontal" ? L.guides : []),
          horizontal: q.flatMap((L) => L.axis === "vertical" ? L.guides : [])
        };
        v = {
          ...v,
          left: p(m.left),
          top: p(m.top),
          snapped: P.length > 0 || q.length > 0,
          snapPoint: P[0],
          points: P,
          targetId: Y ? v.targetIds.horizontal : Q ? v.targetIds.vertical : void 0,
          targetIds: {
            horizontal: Y ? v.targetIds.horizontal : void 0,
            vertical: Q ? v.targetIds.vertical : void 0
          },
          guides: {
            vertical: Y ? v.guides.vertical : K.vertical,
            horizontal: Q ? v.guides.horizontal : K.horizontal
          },
          spacing: q
        }, v.snapped ? Z.setGuides(v.guides) : Z.clearGuides();
      }
      return Ct(v), m;
    }, Ft = (t) => n.resizeDirections.includes(t), te = (t, o, u, f) => {
      const x = p(t.left), m = p(t.top), v = p(t.width), E = p(t.height);
      let T = x, A = x + v, P = m, Y = m + E;
      o.includes("l") && (T += u), o.includes("r") && (A += u), o.includes("t") && (P += f), o.includes("b") && (Y += f);
      const Q = (T + A) / 2, q = (P + Y) / 2;
      let K = Math.max(0, A - T), L = Math.max(0, Y - P);
      const ct = v > 0 && E > 0 ? v / E : 1, Wt = (it) => {
        K = it, o.includes("l") ? T = A - K : o.includes("r") ? A = T + K : (T = Q - K / 2, A = Q + K / 2);
      }, $t = (it) => {
        L = it, o.includes("t") ? P = Y - L : o.includes("b") ? Y = P + L : (P = q - L / 2, Y = q + L / 2);
      };
      if (n.ratioLock) {
        const it = Math.abs(K - v), dn = Math.abs(L - E) * ct;
        o === "tm" || o === "bm" || dn > it ? Wt(L * ct) : $t(K / ct);
      }
      const j = z(), fe = n.limitAreaForParent && !!a.parentElement, cn = fe ? o.includes("l") ? Math.max(0, A - j.minLeft) : o.includes("r") ? Math.max(0, j.maxRight - T) : Math.max(
        0,
        2 * Math.min(Q - j.minLeft, j.maxRight - Q)
      ) : 1 / 0, un = fe ? o.includes("t") ? Math.max(0, Y - j.minTop) : o.includes("b") ? Math.max(0, j.maxBottom - P) : Math.max(
        0,
        2 * Math.min(q - j.minTop, j.maxBottom - q)
      ) : 1 / 0, pe = Math.max(0, lt(n.minWidth, 0)), he = Math.max(0, lt(n.minHeight, 0)), ge = lt(n.maxWidth, 1 / 0), me = lt(n.maxHeight, 1 / 0);
      let mt = Math.min(ge > 0 ? ge : 1 / 0, cn), Vt = Math.min(me > 0 ? me : 1 / 0, un);
      if (n.ratioLock) {
        mt = Math.min(mt, Vt * ct);
        const it = Math.max(pe, he * ct);
        Wt(st(K, it, mt)), $t(K / ct);
      } else
        Wt(st(K, Math.min(pe, mt), mt)), $t(st(L, Math.min(he, Vt), Vt));
      return {
        ...t,
        left: C(T),
        top: C(P),
        width: C(A - T),
        height: C(Y - P)
      };
    };
    let U = null, et = null;
    const ee = (t) => {
      if (n.disabled || n.initRect || !a.isDragging && !a.isResizing) return;
      const o = rt(t.clientX - a.initX, "horizontal"), u = rt(t.clientY - a.initY, "vertical"), f = s(c.value);
      if (a.isDragging) {
        const x = a.beforeInteraction;
        let m = p(x.left) + o, v = p(x.top) + u;
        const E = {
          horizontal: o < 0 && n.dragDirections.includes("left") || o > 0 && n.dragDirections.includes("right"),
          vertical: u < 0 && n.dragDirections.includes("top") || u > 0 && n.dragDirections.includes("bottom")
        };
        E.horizontal || (m = p(x.left)), E.vertical || (v = p(x.top));
        const T = {
          ...x,
          left: C(m),
          top: C(v)
        };
        let A = jt(T, f, n.snapToElements, E, x);
        if (A && B && (A = (I == null ? void 0 : I.constrainPosition(O, A)) ?? null), A) {
          const P = R(A);
          l("move", s(P)), l("drag", s(P)), B && (I == null || I.notifyMoved(O, s(P)));
        }
      }
      if (a.isResizing && a.handle) {
        Ct({
          ...w(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Z.clearGuides();
        const x = Re(o, u, S.value);
        let m = te(
          a.beforeInteraction,
          a.handle,
          x.x,
          x.y
        );
        S.value && (m = X(m), m = V(m)), $(m);
        const v = Lt(m, f);
        if (v) {
          const E = R(v);
          l("resize", s(E));
        }
      }
    }, Le = (t) => {
      !a.active || n.disabled || n.initRect || (et = t, U === null && (U = requestAnimationFrame(() => {
        U = null;
        const o = et;
        et = null, o && ee(o);
      })));
    }, yt = (t) => a.pointerId === null || t.pointerId === a.pointerId, ne = (t) => {
      yt(t) && Le(t);
    }, ie = (t) => {
      yt(t) && $e(t);
    }, oe = (t) => {
      yt(t) && Mt(t);
    }, ae = (t) => {
      yt(t) && (a.isDragging || a.isResizing) && Mt(t);
    }, Fe = () => {
      const t = a.eventElement;
      if (!t) return;
      const o = { passive: !1 };
      Tt(t, "pointermove", ne, o), Tt(t, "pointerup", ie, o), Tt(t, "pointercancel", oe, o);
      const u = h.value;
      u && Tt(u, "lostpointercapture", ae, o);
    }, He = () => {
      const t = a.eventElement;
      if (!t) return;
      At(t, "pointermove", ne, !1), At(t, "pointerup", ie, !1), At(t, "pointercancel", oe, !1);
      const o = h.value;
      o && At(o, "lostpointercapture", ae, !1), a.eventElement = null;
    }, ke = () => {
      const t = h.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, Oe = () => {
      const t = h.value, o = a.pointerId;
      if (a.pointerId = null, !(!t || o === null))
        try {
          t.hasPointerCapture(o) && t.releasePointerCapture(o);
        } catch {
        }
    };
    function Ht() {
      U !== null && (cancelAnimationFrame(U), U = null), et = null;
    }
    function kt() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, B = !1, He(), Oe();
    }
    function le() {
      Nt(), n.active || N(!1);
    }
    function se() {
      kt(), le();
    }
    function xt() {
      Ht(), B && (I == null || I.abortDrag(O)), se();
    }
    function Mt(t = null) {
      const o = a.isDragging, u = a.isResizing, f = B;
      if (Ht(), kt(), o || u) {
        const x = s(a.beforeInteraction);
        R(x), l(o ? "drag-cancel" : "resize-cancel", t, x, s(x)), o && f && (I == null || I.cancelDrag(O, t));
      }
      le();
    }
    function re() {
      xt(), N(!1);
    }
    const Ge = (t, o) => {
      var f, x;
      if (n.disabled || n.initRect || a.isDragging || a.isResizing || o && (!H.value || !Ft(o)) || !o && !n.draggable) return;
      const u = s(c.value);
      if (o) {
        if (((f = n.canResize) == null ? void 0 : f.call(n, u, o)) === !1) return;
      } else if (((x = n.canDrag) == null ? void 0 : x.call(n, u)) === !1)
        return;
      B = !o && I !== null, B && (I == null || I.beginDrag(O, t)), d(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = s(c.value), a.handle = o, a.isDragging = !o, a.isResizing = !!o, N(!0), a.isDragging && l("drag-start", t, s(a.beforeInteraction)), a.isResizing && l("resize-start", t, s(a.beforeInteraction)), a.eventElement = document.documentElement, Fe(), ke();
    }, We = (t) => {
      if (!(t instanceof Element)) return !0;
      const o = h.value;
      if (!o) return !0;
      const u = (f) => {
        try {
          const x = t.closest(f);
          return {
            valid: !0,
            matched: x instanceof Element && o.contains(x)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (n.dragCancel) {
        const f = u(n.dragCancel);
        if (!f.valid || f.matched) return !1;
      }
      if (n.dragHandle) {
        const f = u(n.dragHandle);
        return f.valid && f.matched;
      }
      return !0;
    }, ce = (t, o) => {
      !t.isPrimary || t.button !== 0 || !o && !We(t.target) || Ge(t, o);
    };
    function $e(t) {
      U !== null && (cancelAnimationFrame(U), U = null), et && (ee(et), et = null), a.isDragging && (l("drag-stop", t, s(a.beforeInteraction), s(c.value)), B && (I == null || I.endDrag(O, t))), a.isResizing && l("resize-stop", t, s(a.beforeInteraction), s(c.value)), se();
    }
    const Ve = (t, o) => {
      var m;
      d();
      const u = s(c.value);
      if (((m = n.canDrag) == null ? void 0 : m.call(n, s(u))) === !1) return;
      const f = s(u);
      t === "left" && (f.left = p(f.left) - o), t === "right" && (f.left = p(f.left) + o), t === "top" && (f.top = p(f.top) - o), t === "bottom" && (f.top = p(f.top) + o);
      const x = jt(f, u, n.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, u);
      if (x) {
        const v = R(x);
        l("move", s(v));
      }
    }, Ke = (t, o, u) => {
      var P;
      if (!H.value || !Ft(t)) return;
      d();
      const f = s(c.value);
      if (((P = n.canResize) == null ? void 0 : P.call(n, s(f), t)) === !1) return;
      const x = o === "left" ? -u : o === "right" ? u : 0, m = o === "top" ? -u : o === "bottom" ? u : 0, v = Re(x, m, S.value);
      let E = te(f, t, v.x, v.y);
      S.value && (E = X(E), E = V(E)), $(E);
      const T = Lt(E, f);
      if (!T || Ln(T, f)) return;
      const A = R(T);
      l("resize", s(A));
    }, Ye = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, _e = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), nt = (t) => _e.has(t), Xe = (t) => nt(t) ? "group" : "separator", Ue = (t) => nt(t) ? "two-axis resize handle" : void 0, qe = (t) => `Resize ${Ye[t]}`, Je = (t) => {
      if (!nt(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, wt = (t) => t === "ml" || t === "mr", ue = (t) => {
      if (!nt(t))
        return p(
          wt(t) ? c.value.width : c.value.height
        );
    }, Ze = (t) => {
      if (!nt(t))
        return p(wt(t) ? n.minWidth : n.minHeight);
    }, Qe = (t) => {
      if (nt(t)) return;
      const o = wt(t) ? n.maxWidth : n.maxHeight;
      if (o === void 0) return;
      const u = p(o);
      return Number.isFinite(u) ? u : void 0;
    }, je = (t) => {
      const o = ue(t);
      if (o !== void 0)
        return n.unitType === "%" ? `${o} percent` : `${o} pixels`;
    }, tn = (t) => {
      if (n.keyboardEnabled)
        return nt(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : wt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, en = (t) => {
      t.target === h.value && n.keyboardEnabled && !n.disabled && !n.initRect && N(!0);
    }, nn = [
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
    ].join(","), on = (t) => {
      const o = t.target, u = h.value;
      if (!(o instanceof Element) || !u || o === u || o.closest(".handle")) return !1;
      const f = o.closest(nn);
      return f !== null && f !== u && u.contains(f);
    }, an = Rn(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: a.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: M.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: Ve,
        resize: Ke,
        deactivate: re,
        cancel: (t) => Mt(t)
      }
    ), ln = (t) => {
      on(t) || an.handleKeyDown(t);
    }, Ot = (t) => k.value ? t / 100 * a.parentWidth : t, Gt = (t) => k.value ? t / 100 * a.parentHeight : t, sn = (t) => ({
      left: `${Ot(t) - Ot(p(c.value.left))}px`,
      top: `${-Gt(p(c.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: n.theme
    }), rn = (t) => ({
      top: `${Gt(t) - Gt(p(c.value.top))}px`,
      left: `${-Ot(p(c.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: n.theme
    });
    return i({
      getConfig: () => s(c.value),
      setPosition: (t, o) => R({ ...c.value, left: t, top: o }),
      setSize: (t, o) => R({ ...c.value, width: t, height: o }),
      reset: () => R(s(y)),
      activate: () => N(!0),
      deactivate: re,
      cancelInteraction: (t = null) => Mt(t)
    }), mn(() => {
      Ht(), kt(), I == null || I.unregisterMember(O), Nt();
    }), (t, o) => (ot(), at("div", {
      ref_key: "movableRef",
      ref: h,
      class: ve(["auto-draggable", {
        "select-none": e.disabledUserSelect,
        "is-disabled": e.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": e.initRect
      }]),
      style: It(G.value),
      tabindex: "0",
      onPointerdown: o[1] || (o[1] = (u) => ce(u, null)),
      onDblclick: o[2] || (o[2] = (u) => l("dblclick", u)),
      onFocus: en,
      onKeydown: ln
    }, [
      (ot(!0), at(Kt, null, Yt(be(Qt).vertical, (u, f) => (ot(), at("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: It(sn(u))
      }, null, 4))), 128)),
      (ot(!0), at(Kt, null, Yt(be(Qt).horizontal, (u, f) => (ot(), at("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: It(rn(u))
      }, null, 4))), 128)),
      (ot(!0), at(Kt, null, Yt(e.handles, (u) => vn((ot(), at("div", {
        key: u,
        class: ve(["handle", `handle-${u}`]),
        style: It(W.value),
        role: Xe(u),
        "aria-roledescription": Ue(u),
        "aria-orientation": Je(u),
        "aria-label": qe(u),
        "aria-valuenow": ue(u),
        "aria-valuemin": Ze(u),
        "aria-valuemax": Qe(u),
        "aria-valuetext": je(u),
        "aria-keyshortcuts": tn(u),
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: bn((f) => ce(f, u), ["stop", "prevent"]),
        onFocus: (f) => M.value = u,
        onBlur: o[0] || (o[0] = (f) => M.value = null)
      }, null, 46, Gn)), [
        [yn, a.active && H.value && !e.disabled && Ft(u)]
      ])), 128)),
      Te(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Vn = (e, i) => {
  const r = e.__vccOpts || e;
  for (const [n, l] of i)
    r[n] = l;
  return r;
}, Kn = /* @__PURE__ */ Vn($n, [["__scopeId", "data-v-5a2c2c85"]]), Yn = St({
  name: "MovableGroup"
}), _n = /* @__PURE__ */ St({
  ...Yn,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(e, { expose: i, emit: r }) {
    const n = e, l = r, s = /* @__PURE__ */ new Map(), h = J([]), c = J(null), y = tt(() => n.selected !== void 0), M = tt({
      get: () => y.value ? n.selected ?? [] : h.value,
      set: (d) => {
        h.value = d, l("update:selected", d);
      }
    });
    ut(
      () => n.selected,
      (d) => {
        d !== void 0 && (h.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => dt(d), H = (d, g, b) => ({
      ...d,
      left: p(d.left) + g,
      top: p(d.top) + b
    }), k = (d) => d.reduce(
      (g, b) => ({
        minLeft: Math.min(g.minLeft, p(b.left)),
        minTop: Math.min(g.minTop, p(b.top)),
        maxRight: Math.max(g.maxRight, p(b.left) + p(b.width)),
        maxBottom: Math.max(g.maxBottom, p(b.top) + p(b.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), S = (d, g, b) => {
      const z = k([...d.values()]);
      return {
        left: Math.min(
          Math.max(g.left, b.minLeft - z.minLeft),
          b.maxRight - z.maxRight
        ),
        top: Math.min(
          Math.max(g.top, b.minTop - z.minTop),
          b.maxBottom - z.maxBottom
        )
      };
    }, G = (d) => {
      const g = [];
      for (const [b, z] of d) {
        const D = s.get(b);
        D && g.push({ id: b, rect: a(D.getRect()), startRect: a(z) });
      }
      return g;
    }, W = (d) => d.map(({ id: g, rect: b }) => ({ id: g, rect: b })), R = (d) => {
      const g = d.filter((z) => s.has(z)), b = M.value;
      b.length === g.length && b.every((z, D) => z === g[D]) || (M.value = g);
    };
    return xn(Be, {
      registerMember: (d, g) => {
        s.set(d, g);
      },
      unregisterMember: (d) => {
        var g;
        if (s.delete(d), ((g = c.value) == null ? void 0 : g.leaderId) === d) {
          c.value = null;
          return;
        }
        c.value && c.value.startRects.delete(d), M.value.includes(d) && R(M.value.filter((b) => b !== d));
      },
      beginDrag: (d, g) => {
        if (c.value && c.value.leaderId !== d || !s.has(d)) return;
        M.value.includes(d) || R([d]);
        const b = /* @__PURE__ */ new Map();
        for (const D of M.value) {
          const w = s.get(D);
          w && b.set(D, a(w.getRect()));
        }
        c.value = { leaderId: d, startRects: b };
        const z = [];
        for (const [D, w] of b) z.push({ id: D, rect: a(w) });
        l("move-start", { leaderId: d, source: g, rects: z });
      },
      constrainPosition: (d, g) => {
        var X, $, V;
        const b = c.value, z = b == null ? void 0 : b.startRects.get(d);
        if (!b || !z || !s.has(d)) return g;
        const D = p(g.left) - p(z.left), w = p(g.top) - p(z.top), F = (X = s.get(d)) == null ? void 0 : X.getAreaEdges();
        if (n.sharedBounds) {
          let I = { left: D, top: w };
          F && (I = S(b.startRects, I, F));
          for (const [O, B] of b.startRects)
            O !== d && (($ = s.get(O)) == null || $.translateTo(H(B, I.left, I.top)));
          return H(z, I.left, I.top);
        }
        if (F)
          for (const [I, O] of b.startRects) {
            if (I === d) continue;
            const B = H(O, D, w), ft = Math.max(F.minLeft, F.maxRight - p(O.width)), C = Math.max(F.minTop, F.maxBottom - p(O.height));
            B.left = st(p(B.left), F.minLeft, ft), B.top = st(p(B.top), F.minTop, C), (V = s.get(I)) == null || V.translateTo(B);
          }
        return g;
      },
      notifyMoved: (d, g) => {
        const b = c.value;
        if (!b || b.leaderId !== d) return;
        const z = W(G(b.startRects)).map(
          (D) => D.id === d ? { id: d, rect: a(g) } : D
        );
        l("move", { leaderId: d, rects: z });
      },
      endDrag: (d, g) => {
        const b = c.value;
        if (!b || b.leaderId !== d) return;
        const z = G(b.startRects);
        c.value = null, l("move-stop", { leaderId: d, source: g, rects: z });
      },
      cancelDrag: (d, g) => {
        var D;
        const b = c.value;
        if (!b || b.leaderId !== d) return;
        for (const [w, F] of b.startRects)
          w !== d && ((D = s.get(w)) == null || D.translateTo(a(F)));
        const z = G(b.startRects);
        c.value = null, l("move-cancel", { leaderId: d, source: g, rects: z });
      },
      abortDrag: (d) => {
        var g;
        ((g = c.value) == null ? void 0 : g.leaderId) === d && (c.value = null);
      }
    }), i({
      getSelected: () => [...M.value],
      select: (d) => R(d ?? [...s.keys()]),
      getMemberRects: () => [...s.entries()].map(([d, g]) => ({ id: d, rect: a(g.getRect()) }))
    }), (d, g) => Te(d.$slots, "default");
  }
}), Pe = "VueMovableBox", Ce = (e) => {
  e.component(Pe, Kn), e.component("MovableGroup", _n);
}, qn = {
  name: Pe,
  version: "3.0.0",
  install: Ce
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Ce });
export {
  Kn as MovableBox,
  _n as MovableGroup,
  qn as default,
  Pe as name
};
