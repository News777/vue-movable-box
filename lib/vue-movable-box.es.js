import { computed as nt, ref as tt, defineComponent as Ct, reactive as fn, watch as dt, inject as pn, getCurrentInstance as hn, onMounted as gn, onUnmounted as mn, openBlock as st, createElementBlock as lt, normalizeStyle as Tt, normalizeClass as ye, Fragment as Ut, renderList as qt, unref as Me, withDirectives as vn, withModifiers as bn, vShow as yn, renderSlot as Ee, provide as Mn } from "vue";
import xn from "decimal.js";
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
const xe = (n, i, r) => i.distance > r ? n : !n || i.distance < n.distance ? i : n, Se = ["alignment", "spacing"], we = (n, i, r, e, s) => {
  const l = s.length > 0 ? s : Se;
  for (const h of l) {
    const c = h === "alignment" ? i : r;
    if (c && c.distance <= e) {
      if (h === "alignment") {
        const x = c;
        return {
          candidate: x,
          spacing: null,
          guides: [x.guide],
          spacingInfo: null,
          value: x.value
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
}, Ie = (n, i, r, e, s) => {
  const l = (a) => n === "horizontal" ? a.left : a.top, h = (a) => n === "horizontal" ? a.left + a.width : a.top + a.height, c = [], y = [];
  for (const a of s)
    h(a.rect) <= i && c.push(a), l(a.rect) >= i + r && y.push(a);
  let x = null;
  for (const a of c)
    for (const H of y) {
      const k = l(H.rect) - h(a.rect) - r;
      if (k < 0) continue;
      const B = k / 2, $ = h(a.rect) + B, V = Math.abs(i - $);
      V > e || (!x || V < x.distance) && (x = {
        distance: V,
        value: $,
        gap: B,
        guides: [h(a.rect), l(H.rect)],
        targetIds: [a.id, H.id]
      });
    }
  return x;
};
function An(n, i, r = 10, e = { horizontal: !0, vertical: !0 }, s = {}) {
  const l = Math.max(0, Number.isFinite(r) ? r : 10), h = n.left + n.width, c = n.top + n.height, y = n.left + n.width / 2, x = n.top + n.height / 2, a = s.priority ?? Se, H = (T, w) => s.filter ? s.filter(T, w) !== !1 : !0;
  let k = null, B = null;
  const $ = [], V = [];
  for (const T of i) {
    const w = Dn(T);
    if (!w) continue;
    const F = e.horizontal && H(T, "horizontal"), J = e.vertical && H(T, "vertical");
    if (F && $.push({ rect: w, id: T.id }), J && V.push({ rect: w, id: T.id }), !F && !J) continue;
    const K = w.left + w.width, Y = w.top + w.height, I = w.left + w.width / 2, O = w.top + w.height / 2, P = T.id, pt = [
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
    ], N = [
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
        distance: Math.abs(x - O),
        value: O - n.height / 2,
        guide: O,
        point: "center-y",
        targetId: P
      }
    ];
    if (F)
      for (const ct of pt) k = xe(k, ct, l);
    if (J)
      for (const ct of N) B = xe(B, ct, l);
  }
  const D = e.horizontal ? we(
    "horizontal",
    k,
    Ie(
      "horizontal",
      n.left,
      n.width,
      l,
      $
    ),
    l,
    a
  ) : null, C = e.vertical ? we(
    "vertical",
    B,
    Ie("vertical", n.top, n.height, l, V),
    l,
    a
  ) : null, d = (D == null ? void 0 : D.candidate) ?? null, g = (C == null ? void 0 : C.candidate) ?? null, v = [d == null ? void 0 : d.point, g == null ? void 0 : g.point].filter(
    (T) => !!T
  ), z = [D == null ? void 0 : D.spacingInfo, C == null ? void 0 : C.spacingInfo].filter(
    (T) => !!T
  );
  return {
    left: (D == null ? void 0 : D.value) ?? n.left,
    top: (C == null ? void 0 : C.value) ?? n.top,
    snapped: v.length > 0 || z.length > 0,
    snapPoint: v[0],
    points: v,
    targetId: (d == null ? void 0 : d.targetId) ?? (g == null ? void 0 : g.targetId),
    targetIds: { horizontal: d == null ? void 0 : d.targetId, vertical: g == null ? void 0 : g.targetId },
    guides: {
      vertical: (D == null ? void 0 : D.guides) ?? [],
      horizontal: (C == null ? void 0 : C.guides) ?? []
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
const Jt = () => ({ vertical: [], horizontal: [] });
function Sn(n) {
  const i = tt(Jt()), r = tt(null);
  return { guides: i, lastSnapResult: r, resolveSnap: (h, c, y) => {
    const x = n(), a = x.enabled ? An(h, c, x.threshold, y, {
      filter: x.filter,
      priority: x.priority
    }) : {
      ...h,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Jt(),
      spacing: []
    };
    return i.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    i.value = Jt(), r.value = null;
  }, setGuides: (h) => {
    i.value = h;
  } };
}
const Et = (n) => {
  if (typeof n == "string" && n.trim() === "") return null;
  const i = Number(n);
  return Number.isFinite(i) ? i : null;
}, Be = (n) => {
  const i = Et(n.left), r = Et(n.top), e = Et(n.width), s = Et(n.height);
  return i === null || r === null || e === null || s === null || e < 0 || s < 0 ? null : { left: i, top: r, width: e, height: s };
}, ze = (n, i, r, e) => {
  const s = r - i;
  if (s === 0) return i < e ? n : null;
  const l = (e - i) / s;
  return s > 0 ? { ...n, exit: Math.min(n.exit, l) } : { ...n, entry: Math.max(n.entry, l) };
}, Re = (n, i, r, e) => {
  const s = r - i;
  if (s === 0) return i > e ? n : null;
  const l = (e - i) / s;
  return s > 0 ? { ...n, entry: Math.max(n.entry, l) } : { ...n, exit: Math.min(n.exit, l) };
}, Bn = (n, i, r) => {
  let e = { entry: 0, exit: 1 };
  if (e = ze(e, n.left, i.left, r.left + r.width), !e || (e = Re(
    e,
    n.left + n.width,
    i.left + i.width,
    r.left
  ), !e) || (e = ze(e, n.top, i.top, r.top + r.height), !e) || (e = Re(
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
    const l = Be(s);
    if (!l) continue;
    const h = Bn(n, i, l);
    h && (!e || h.entry < e.entry) && (e = h);
  }
  return e;
}
function Pn(n, i) {
  const r = Math.min(n.left + n.width, i.left + i.width) - Math.max(n.left, i.left), e = Math.min(n.top + n.height, i.top + i.height) - Math.max(n.top, i.top);
  if (r <= 0 || e <= 0) return { colliding: !1, overlapArea: 0 };
  const s = n.left + n.width / 2, l = n.top + n.height / 2, h = i.left + i.width / 2, c = i.top + i.height / 2, y = s - h, x = l - c;
  return {
    colliding: !0,
    direction: r <= e ? y > 0 ? "right" : "left" : x > 0 ? "bottom" : "top",
    overlap: Math.min(r, e),
    overlapArea: r * e
  };
}
function Zt(n, i, r) {
  const e = [];
  for (const s of i) {
    const l = Be(s);
    if (!l) continue;
    const h = Pn(n, l);
    h.colliding && e.push({ ...h, targetId: s.id });
  }
  return e;
}
function De(n) {
  let i = null;
  for (const r of n)
    (!i || (r.overlapArea ?? 0) > (i.overlapArea ?? 0)) && (i = r);
  return i;
}
const Qt = (n) => n.reduce((i, r) => i + (r.overlapArea ?? 0), 0), Pe = (n, i, r) => ({
  left: n.left + (i.left - n.left) * r,
  top: n.top + (i.top - n.top) * r,
  width: n.width + (i.width - n.width) * r,
  height: n.height + (i.height - n.height) * r
}), Ln = (n, i) => n.left === i.left && n.top === i.top && n.width === i.width && n.height === i.height, jt = (n, i, r, e) => {
  if (!Lt(n, i, r)) return i;
  let s = 0, l = 1, h = n;
  for (let c = 0; c < 24; c += 1) {
    const y = (s + l) / 2, x = e(Pe(n, i, y));
    Lt(n, x, r) ? l = y : (h = x, s = y);
  }
  return h;
};
function Cn(n) {
  const i = tt([]), r = tt(!1), e = (c, y) => {
    const a = n().enabled ? Zt(c, y) : [];
    return i.value = a, r.value = a.length > 0, {
      results: a,
      dominant: De(a),
      totalOverlapArea: Qt(a)
    };
  }, s = (c) => (i.value = c, r.value = c.length > 0, {
    results: c,
    dominant: De(c),
    totalOverlapArea: Qt(c)
  });
  return { collisions: i, isColliding: r, evaluate: e, resolveCandidate: (c, y, x, a = (k) => k, H = "path") => {
    const k = n(), B = e(c, x);
    if (!k.enabled || k.allowOverlap)
      return { accepted: !0, rect: c, ...B };
    const $ = Zt(y, x), V = Qt($);
    if (V > 0)
      return {
        accepted: B.totalOverlapArea < V,
        rect: c,
        ...B
      };
    const D = Lt(y, c, x);
    if (B.results.length === 0 && !D)
      return { accepted: !0, rect: c, ...B };
    let C = B;
    if (B.results.length === 0 && D) {
      const g = Pe(
        y,
        c,
        D.entry + (D.exit - D.entry) * 1e-3
      );
      C = s(Zt(g, x));
    }
    let d = null;
    if (H === "slide") {
      const g = jt(
        y,
        { ...y, left: c.left },
        x,
        a
      ), v = jt(
        y,
        { ...y, top: c.top },
        x,
        a
      ), z = a({
        ...c,
        left: g.left,
        top: v.top
      });
      Lt(y, z, x) || (d = z);
    }
    return d ?? (d = jt(y, c, x, a)), {
      accepted: !Ln(d, y),
      rect: d,
      ...C
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
      const x = Number(y.slice(0, -1));
      if (!Number.isFinite(x)) return e;
      c(x / 100 * (l === null ? i : r));
    } else {
      const x = Number.parseFloat(y);
      if (!Number.isFinite(x)) return e;
      c(x);
    }
  return { x: l ?? i / 2, y: h ?? r / 2 };
}, kn = (n, i, r) => {
  const e = Fn(n, i), s = Nt(i);
  if (s === 0) return e;
  const l = Ft(s), h = Math.cos(l), c = Math.sin(l), y = n.width / 2 - r.x, x = n.height / 2 - r.y, a = q(y * h - x * c - y), H = q(y * c + x * h - x);
  return {
    left: q(e.left + a),
    top: q(e.top + H),
    width: e.width,
    height: e.height
  };
}, Te = (n, i, r) => {
  const e = Nt(r);
  if (e === 0) return { x: n, y: i };
  const s = Ft(e), l = Math.cos(s), h = Math.sin(s);
  return {
    x: q(n * l + i * h),
    y: q(-n * h + i * l)
  };
}, Le = Symbol("MovableGroupContext"), On = 2, j = (n, i = 1) => {
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
const Ae = (n, i = 1, r = On) => {
  const e = new xn(n).toDecimalPlaces(r).toNumber();
  return j(e, i);
}, ft = (n) => {
  if (n === null || typeof n != "object")
    return n;
  if (n instanceof Date)
    return new Date(n.getTime());
  if (n instanceof Array)
    return n.map((i) => ft(i));
  if (n instanceof Object) {
    const i = {};
    for (const r in n)
      n.hasOwnProperty(r) && (i[r] = ft(n[r]));
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
    var ge;
    const e = n, s = r, l = (t) => ft(t), h = tt(), c = tt(l(e.modelValue)), y = l(e.modelValue), x = tt(null), a = fn({
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
    dt(
      () => e.modelValue,
      (t) => {
        c.value = l(t);
      },
      { deep: !0 }
    ), dt(
      () => e.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? zt() : C(t);
      },
      { flush: "sync" }
    ), dt(
      () => e.disabled,
      (t) => {
        s("disabled", t), t && zt();
      }
    ), dt(
      () => e.initRect,
      (t) => {
        t && zt();
      }
    ), dt(
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
      scale: Ae(1 / j(e.scale, 1), 1)
    })), D = (t) => {
      const o = l(t);
      return c.value = o, s("update:modelValue", l(o)), o;
    };
    function C(t) {
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
      const f = z(), b = Math.max(0, f.maxRight - f.minLeft), m = Math.max(0, f.maxBottom - f.minTop), M = Ft(u), S = Math.abs(Math.cos(M)) < 1e-9 ? 0 : Math.abs(Math.cos(M)), R = Math.abs(Math.sin(M)) < 1e-9 ? 0 : Math.abs(Math.sin(M)), A = p(t.width), E = p(t.height), G = S * A + R * E, X = R * A + S * E, _ = Math.max(0, j(e.minWidth, 0)), W = Math.max(0, j(e.minHeight, 0)), L = o === null || o.includes("l") || o.includes("r"), Q = o === null || o.includes("t") || o.includes("b");
      if (e.ratioLock || L && Q) {
        const Yt = Math.min(
          1,
          G > b ? b / G : 1,
          X > m ? m / X : 1
        ), _t = Math.max(
          Yt,
          A > 0 ? _ / A : 0,
          E > 0 ? W / E : 0
        ), ut = Math.min(_t, 1);
        return ut >= 1 ? t : {
          ...t,
          width: Math.max(_, Math.floor(A * ut)),
          height: Math.max(W, Math.floor(E * ut))
        };
      }
      const vt = Math.floor(
        Math.min(
          S > 0 ? (b - R * E) / S : 1 / 0,
          R > 0 ? (m - S * E) / R : 1 / 0
        )
      ), bt = Math.floor(
        Math.min(
          R > 0 ? (b - S * A) / R : 1 / 0,
          S > 0 ? (m - R * A) / S : 1 / 0
        )
      ), U = L ? Math.max(_, Math.min(A, vt)) : A, yt = Q ? Math.max(W, Math.min(E, bt)) : E;
      return U === A && yt === E ? t : { ...t, width: U, height: yt };
    }, K = (t) => {
      if (!a.parentElement) return;
      const o = z(), u = F(t), f = u.left, b = u.top, m = f + u.width, M = b + u.height;
      f < o.minLeft && s("out-of-bounds", "left"), m > o.maxRight && s("out-of-bounds", "right"), b < o.minTop && s("out-of-bounds", "top"), M > o.maxBottom && s("out-of-bounds", "bottom");
    }, Y = (t) => {
      if (!e.limitAreaForParent || !a.parentElement) return t;
      const o = F(t), u = T(o), f = rt(o.left, u.minLeft, u.maxLeft), b = rt(o.top, u.minTop, u.maxTop);
      return B.value ? {
        ...t,
        left: N(p(t.left) + (f - o.left)),
        top: N(p(t.top) + (b - o.top))
      } : {
        ...t,
        left: f,
        top: b
      };
    }, I = pn(Le, null), O = e.memberId || `member-${((ge = hn()) == null ? void 0 : ge.uid) ?? Math.random().toString(36).slice(2)}`;
    let P = !1;
    const pt = {
      getRect: () => l(c.value),
      translateTo: (t) => {
        D(t);
      },
      getAreaEdges: () => (d(), a.parentElement ? z() : null)
    };
    gn(() => I == null ? void 0 : I.registerMember(O, pt));
    const N = (t) => e.isKeepDecimals ? Ae(t, 0, e.decimalPlaces) : Math.round(t), ct = (t, o) => {
      const u = j(e.scale, 1), f = t / (u === 0 ? 1 : u);
      if (!k.value) return N(f);
      const b = o === "horizontal" ? a.parentWidth : a.parentHeight;
      return b > 0 ? N(f / b * 100) : 0;
    }, te = En(() => ({ snapToGrid: e.snapToGrid, gridSize: e.gridSize })), et = Sn(() => ({
      enabled: e.snapToElements,
      threshold: e.snapThreshold,
      filter: e.snapFilter,
      priority: e.snapPriority
    })), ee = Cn(() => ({
      enabled: e.collisionEnabled,
      allowOverlap: e.allowOverlap
    })), ne = et.guides;
    let ht = "clear", gt = "clear", mt = "clear";
    const xt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), wt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Ht = (t) => {
      const o = {
        horizontal: t.points.some((M) => xt.has(M)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((M) => wt.has(M)) ? t.targetIds.vertical : void 0
      }, u = t.snapped ? ft(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: o,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, b = JSON.stringify({
        payload: f,
        left: t.points.some((M) => xt.has(M)) ? t.left : void 0,
        top: t.points.some((M) => wt.has(M)) ? t.top : void 0
      });
      b !== ht && ((t.snapped || ht !== "clear") && s("snap", f), ht = t.snapped ? b : "clear");
      const m = JSON.stringify({ guides: t.guides, targetIds: o });
      m !== gt && ((t.snapped || gt !== "clear") && s("guides", ft(t.guides)), gt = t.snapped ? m : "clear");
    }, Fe = (t) => {
      const o = t.dominant, u = o ? {
        colliding: !0,
        direction: o.direction,
        targetId: o.targetId
      } : { colliding: !1 }, f = JSON.stringify(u);
      f !== mt && ((o || mt !== "clear") && s("collision", u), mt = o ? f : "clear");
    }, kt = () => {
      ht !== "clear" && s("snap", { snapped: !1 }), gt !== "clear" && s("guides", { vertical: [], horizontal: [] }), mt !== "clear" && s("collision", { colliding: !1 }), ht = "clear", gt = "clear", mt = "clear", et.clearGuides(), ee.clearCollisions();
    }, Ot = (t, o, u = "path") => {
      const f = F(t), b = ee.resolveCandidate(
        f,
        F(o),
        e.snapTargets,
        (m) => ({
          left: N(m.left),
          top: N(m.top),
          width: N(m.width),
          height: N(m.height)
        }),
        u
      );
      return Fe(b), b.accepted ? B.value ? {
        ...t,
        left: N(p(t.left) + (b.rect.left - f.left)),
        top: N(p(t.top) + (b.rect.top - f.top))
      } : { ...t, ...b.rect } : null;
    }, ie = (t, o, u, f, b) => {
      let m = l(t);
      f.horizontal && (m.left = te.snapValue(p(t.left))), f.vertical && (m.top = te.snapValue(p(t.top)));
      let M = {
        ...w(m),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const R = F(m);
        M = et.resolveSnap(R, e.snapTargets, f), B.value ? m = {
          ...m,
          left: N(p(m.left) + (M.left - R.left)),
          top: N(p(m.top) + (M.top - R.top))
        } : m = { ...m, left: M.left, top: M.top };
      } else
        et.clearGuides();
      if (b) {
        const R = p(b.left), A = p(b.top);
        e.dragDirections.includes("left") || (m.left = Math.max(R, p(m.left))), e.dragDirections.includes("right") || (m.left = Math.min(R, p(m.left))), e.dragDirections.includes("top") || (m.top = Math.max(A, p(m.top))), e.dragDirections.includes("bottom") || (m.top = Math.min(A, p(m.top)));
      }
      K(m), m = Y(m);
      const S = Ot(m, o, "slide");
      if (!S)
        return Ht({
          ...M,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), et.clearGuides(), null;
      if (m = S, M.snapped) {
        const R = p(m.left) !== M.left, A = p(m.top) !== M.top, E = M.points.filter((L) => xt.has(L) ? !R : wt.has(L) ? !A : !1), G = E.some((L) => xt.has(L)), X = E.some((L) => wt.has(L)), _ = M.spacing.filter(
          (L) => L.axis === "horizontal" ? !R : !A
        ), W = {
          vertical: _.flatMap((L) => L.axis === "horizontal" ? L.guides : []),
          horizontal: _.flatMap((L) => L.axis === "vertical" ? L.guides : [])
        };
        M = {
          ...M,
          left: p(m.left),
          top: p(m.top),
          snapped: E.length > 0 || _.length > 0,
          snapPoint: E[0],
          points: E,
          targetId: G ? M.targetIds.horizontal : X ? M.targetIds.vertical : void 0,
          targetIds: {
            horizontal: G ? M.targetIds.horizontal : void 0,
            vertical: X ? M.targetIds.vertical : void 0
          },
          guides: {
            vertical: G ? M.guides.vertical : W.vertical,
            horizontal: X ? M.guides.horizontal : W.horizontal
          },
          spacing: _
        }, M.snapped ? et.setGuides(M.guides) : et.clearGuides();
      }
      return Ht(M), m;
    }, Wt = (t) => e.resizeDirections.includes(t), oe = (t, o, u, f) => {
      const b = p(t.left), m = p(t.top), M = p(t.width), S = p(t.height);
      let R = b, A = b + M, E = m, G = m + S;
      o.includes("l") && (R += u), o.includes("r") && (A += u), o.includes("t") && (E += f), o.includes("b") && (G += f);
      const X = (R + A) / 2, _ = (E + G) / 2;
      let W = Math.max(0, A - R), L = Math.max(0, G - E);
      const Q = M > 0 && S > 0 ? M / S : 1, vt = (at) => {
        W = at, o.includes("l") ? R = A - W : o.includes("r") ? A = R + W : (R = X - W / 2, A = X + W / 2);
      }, bt = (at) => {
        L = at, o.includes("t") ? E = G - L : o.includes("b") ? G = E + L : (E = _ - L / 2, G = _ + L / 2);
      };
      if (e.ratioLock) {
        const at = Math.abs(W - M), dn = Math.abs(L - S) * Q;
        o === "tm" || o === "bm" || dn > at ? vt(L * Q) : bt(W / Q);
      }
      const U = z(), yt = e.limitAreaForParent && !!a.parentElement, Yt = yt ? o.includes("l") ? Math.max(0, A - U.minLeft) : o.includes("r") ? Math.max(0, U.maxRight - R) : Math.max(
        0,
        2 * Math.min(X - U.minLeft, U.maxRight - X)
      ) : 1 / 0, _t = yt ? o.includes("t") ? Math.max(0, G - U.minTop) : o.includes("b") ? Math.max(0, U.maxBottom - E) : Math.max(
        0,
        2 * Math.min(_ - U.minTop, U.maxBottom - _)
      ) : 1 / 0, ut = Math.max(0, j(e.minWidth, 0)), me = Math.max(0, j(e.minHeight, 0)), ve = j(e.maxWidth, 1 / 0), be = j(e.maxHeight, 1 / 0);
      let Mt = Math.min(ve > 0 ? ve : 1 / 0, Yt), Xt = Math.min(be > 0 ? be : 1 / 0, _t);
      if (e.ratioLock) {
        Mt = Math.min(Mt, Xt * Q);
        const at = Math.max(ut, me * Q);
        vt(rt(W, at, Mt)), bt(W / Q);
      } else
        vt(rt(W, Math.min(ut, Mt), Mt)), bt(rt(L, Math.min(me, Xt), Xt));
      return {
        ...t,
        left: N(R),
        top: N(E),
        width: N(A - R),
        height: N(G - E)
      };
    };
    let Z = null, it = null;
    const ae = (t) => {
      if (e.disabled || e.initRect || !a.isDragging && !a.isResizing) return;
      const o = ct(t.clientX - a.initX, "horizontal"), u = ct(t.clientY - a.initY, "vertical"), f = l(c.value);
      if (a.isDragging) {
        const b = a.beforeInteraction;
        let m = p(b.left) + o, M = p(b.top) + u;
        const S = {
          horizontal: o < 0 && e.dragDirections.includes("left") || o > 0 && e.dragDirections.includes("right"),
          vertical: u < 0 && e.dragDirections.includes("top") || u > 0 && e.dragDirections.includes("bottom")
        };
        S.horizontal || (m = p(b.left)), S.vertical || (M = p(b.top));
        const R = {
          ...b,
          left: N(m),
          top: N(M)
        };
        let A = ie(R, f, e.snapToElements, S, b);
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
        }), et.clearGuides();
        const b = Te(o, u, B.value);
        let m = oe(
          a.beforeInteraction,
          a.handle,
          b.x,
          b.y
        );
        B.value && (m = J(m, a.handle), m = Y(m)), K(m);
        const M = Ot(m, f);
        if (M) {
          const S = D(M);
          s("resize", l(S));
        }
      }
    }, He = (t) => {
      !a.active || e.disabled || e.initRect || (it = t, Z === null && (Z = requestAnimationFrame(() => {
        Z = null;
        const o = it;
        it = null, o && ae(o);
      })));
    }, It = (t) => a.pointerId === null || t.pointerId === a.pointerId, se = (t) => {
      It(t) && He(t);
    }, le = (t) => {
      It(t) && Ke(t);
    }, re = (t) => {
      It(t) && Rt(t);
    }, ce = (t) => {
      It(t) && (a.isDragging || a.isResizing) && Rt(t);
    }, ke = () => {
      const t = a.eventElement;
      if (!t) return;
      const o = { passive: !1 };
      Bt(t, "pointermove", se, o), Bt(t, "pointerup", le, o), Bt(t, "pointercancel", re, o);
      const u = h.value;
      u && Bt(u, "lostpointercapture", ce, o);
    }, Oe = () => {
      const t = a.eventElement;
      if (!t) return;
      Pt(t, "pointermove", se, !1), Pt(t, "pointerup", le, !1), Pt(t, "pointercancel", re, !1);
      const o = h.value;
      o && Pt(o, "lostpointercapture", ce, !1), a.eventElement = null;
    }, We = () => {
      const t = h.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, Ge = () => {
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
      a.isDragging = !1, a.isResizing = !1, a.handle = null, P = !1, Oe(), Ge();
    }
    function ue() {
      kt(), e.active || C(!1);
    }
    function de() {
      $t(), ue();
    }
    function zt() {
      Gt(), P && (I == null || I.abortDrag(O)), de();
    }
    function Rt(t = null) {
      const o = a.isDragging, u = a.isResizing, f = P;
      if (Gt(), $t(), o || u) {
        const b = l(a.beforeInteraction);
        D(b), s(o ? "drag-cancel" : "resize-cancel", t, b, l(b)), o && f && (I == null || I.cancelDrag(O, t));
      }
      ue();
    }
    function fe() {
      zt(), C(!1);
    }
    const $e = (t, o) => {
      var f, b;
      if (e.disabled || e.initRect || a.isDragging || a.isResizing || o && (!H.value || !Wt(o)) || !o && !e.draggable) return;
      const u = l(c.value);
      if (o) {
        if (((f = e.canResize) == null ? void 0 : f.call(e, u, o)) === !1) return;
      } else if (((b = e.canDrag) == null ? void 0 : b.call(e, u)) === !1)
        return;
      P = !o && I !== null, P && (I == null || I.beginDrag(O, t)), d(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = l(c.value), a.handle = o, a.isDragging = !o, a.isResizing = !!o, C(!0), a.isDragging && s("drag-start", t, l(a.beforeInteraction)), a.isResizing && s("resize-start", t, l(a.beforeInteraction)), a.eventElement = document.documentElement, ke(), We();
    }, Ve = (t) => {
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
    }, pe = (t, o) => {
      !t.isPrimary || t.button !== 0 || !o && !Ve(t.target) || $e(t, o);
    };
    function Ke(t) {
      Z !== null && (cancelAnimationFrame(Z), Z = null), it && (ae(it), it = null), a.isDragging && (s("drag-stop", t, l(a.beforeInteraction), l(c.value)), P && (I == null || I.endDrag(O, t))), a.isResizing && s("resize-stop", t, l(a.beforeInteraction), l(c.value)), de();
    }
    const Ye = (t, o) => {
      var m;
      d();
      const u = l(c.value);
      if (((m = e.canDrag) == null ? void 0 : m.call(e, l(u))) === !1) return;
      const f = l(u);
      t === "left" && (f.left = p(f.left) - o), t === "right" && (f.left = p(f.left) + o), t === "top" && (f.top = p(f.top) - o), t === "bottom" && (f.top = p(f.top) + o);
      const b = ie(f, u, e.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, u);
      if (b) {
        const M = D(b);
        s("move", l(M));
      }
    }, _e = (t, o, u) => {
      var E;
      if (!H.value || !Wt(t)) return;
      d();
      const f = l(c.value);
      if (((E = e.canResize) == null ? void 0 : E.call(e, l(f), t)) === !1) return;
      const b = o === "left" ? -u : o === "right" ? u : 0, m = o === "top" ? -u : o === "bottom" ? u : 0, M = Te(b, m, B.value);
      let S = oe(f, t, M.x, M.y);
      B.value && (S = J(S, t), S = Y(S)), K(S);
      const R = Ot(S, f);
      if (!R || Nn(R, f)) return;
      const A = D(R);
      s("resize", l(A));
    }, Xe = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Ue = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), ot = (t) => Ue.has(t), qe = (t) => ot(t) ? "group" : "separator", Je = (t) => ot(t) ? "two-axis resize handle" : void 0, Ze = (t) => `Resize ${Xe[t]}`, Qe = (t) => {
      if (!ot(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, Dt = (t) => t === "ml" || t === "mr", he = (t) => {
      if (!ot(t))
        return p(
          Dt(t) ? c.value.width : c.value.height
        );
    }, je = (t) => {
      if (!ot(t))
        return p(Dt(t) ? e.minWidth : e.minHeight);
    }, tn = (t) => {
      if (ot(t)) return;
      const o = Dt(t) ? e.maxWidth : e.maxHeight;
      if (o === void 0) return;
      const u = p(o);
      return Number.isFinite(u) ? u : void 0;
    }, en = (t) => {
      const o = he(t);
      if (o !== void 0)
        return e.unitType === "%" ? `${o} percent` : `${o} pixels`;
    }, nn = (t) => {
      if (e.keyboardEnabled)
        return ot(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : Dt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, on = (t) => {
      t.target === h.value && e.keyboardEnabled && !e.disabled && !e.initRect && C(!0);
    }, an = [
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
    ].join(","), sn = (t) => {
      const o = t.target, u = h.value;
      if (!(o instanceof Element) || !u || o === u || o.closest(".handle")) return !1;
      const f = o.closest(an);
      return f !== null && f !== u && u.contains(f);
    }, ln = Rn(
      () => ({
        enabled: e.keyboardEnabled,
        step: e.keyboardStep,
        disabled: e.disabled,
        readOnly: e.initRect,
        active: a.active,
        dragDirections: e.dragDirections,
        resizeDirections: e.resizeDirections,
        focusedHandle: x.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: Ye,
        resize: _e,
        deactivate: fe,
        cancel: (t) => Rt(t)
      }
    ), rn = (t) => {
      sn(t) || ln.handleKeyDown(t);
    }, Vt = (t) => k.value ? t / 100 * a.parentWidth : t, Kt = (t) => k.value ? t / 100 * a.parentHeight : t, cn = (t) => ({
      left: `${Vt(t) - Vt(p(c.value.left))}px`,
      top: `${-Kt(p(c.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: e.theme
    }), un = (t) => ({
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
      activate: () => C(!0),
      deactivate: fe,
      cancelInteraction: (t = null) => Rt(t)
    }), mn(() => {
      Gt(), $t(), I == null || I.unregisterMember(O), kt();
    }), (t, o) => (st(), lt("div", {
      ref_key: "movableRef",
      ref: h,
      class: ye(["auto-draggable", {
        "select-none": n.disabledUserSelect,
        "is-disabled": n.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": n.initRect
      }]),
      style: Tt($.value),
      tabindex: "0",
      onPointerdown: o[1] || (o[1] = (u) => pe(u, null)),
      onDblclick: o[2] || (o[2] = (u) => s("dblclick", u)),
      onFocus: on,
      onKeydown: rn
    }, [
      (st(!0), lt(Ut, null, qt(Me(ne).vertical, (u, f) => (st(), lt("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: Tt(cn(u))
      }, null, 4))), 128)),
      (st(!0), lt(Ut, null, qt(Me(ne).horizontal, (u, f) => (st(), lt("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: Tt(un(u))
      }, null, 4))), 128)),
      (st(!0), lt(Ut, null, qt(n.handles, (u) => vn((st(), lt("div", {
        key: u,
        class: ye(["handle", `handle-${u}`]),
        style: Tt(V.value),
        role: qe(u),
        "aria-roledescription": Je(u),
        "aria-orientation": Qe(u),
        "aria-label": Ze(u),
        "aria-valuenow": he(u),
        "aria-valuemin": je(u),
        "aria-valuemax": tn(u),
        "aria-valuetext": en(u),
        "aria-keyshortcuts": nn(u),
        tabindex: n.keyboardEnabled ? 0 : void 0,
        onPointerdown: bn((f) => pe(f, u), ["stop", "prevent"]),
        onFocus: (f) => x.value = u,
        onBlur: o[0] || (o[0] = (f) => x.value = null)
      }, null, 46, Wn)), [
        [yn, a.active && H.value && !n.disabled && Wt(u)]
      ])), 128)),
      Ee(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Vn = (n, i) => {
  const r = n.__vccOpts || n;
  for (const [e, s] of i)
    r[e] = s;
  return r;
}, Kn = /* @__PURE__ */ Vn($n, [["__scopeId", "data-v-fb3772bf"]]), Yn = Ct({
  name: "MovableGroup"
}), _n = /* @__PURE__ */ Ct({
  ...Yn,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(n, { expose: i, emit: r }) {
    const e = n, s = r, l = /* @__PURE__ */ new Map(), h = tt([]), c = tt(null), y = nt(() => e.selected !== void 0), x = nt({
      get: () => y.value ? e.selected ?? [] : h.value,
      set: (d) => {
        h.value = d, s("update:selected", d);
      }
    });
    dt(
      () => e.selected,
      (d) => {
        d !== void 0 && (h.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => ft(d), H = (d, g, v) => ({
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
      const g = d.filter((z) => l.has(z)), v = x.value;
      v.length === g.length && v.every((z, T) => z === g[T]) || (x.value = g);
    };
    return Mn(Le, {
      registerMember: (d, g) => {
        l.set(d, g);
      },
      unregisterMember: (d) => {
        var g;
        if (l.delete(d), ((g = c.value) == null ? void 0 : g.leaderId) === d) {
          c.value = null;
          return;
        }
        c.value && c.value.startRects.delete(d), x.value.includes(d) && D(x.value.filter((v) => v !== d));
      },
      beginDrag: (d, g) => {
        if (c.value && c.value.leaderId !== d || !l.has(d)) return;
        x.value.includes(d) || D([d]);
        const v = /* @__PURE__ */ new Map();
        for (const T of x.value) {
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
            const P = H(O, T, w), pt = Math.max(F.minLeft, F.maxRight - p(O.width)), N = Math.max(F.minTop, F.maxBottom - p(O.height));
            P.left = rt(p(P.left), F.minLeft, pt), P.top = rt(p(P.top), F.minTop, N), (Y = l.get(I)) == null || Y.translateTo(P);
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
      getSelected: () => [...x.value],
      select: (d) => D(d ?? [...l.keys()]),
      getMemberRects: () => [...l.entries()].map(([d, g]) => ({ id: d, rect: a(g.getRect()) }))
    }), (d, g) => Ee(d.$slots, "default");
  }
}), Ce = "VueMovableBox", Ne = (n) => {
  n.component(Ce, Kn), n.component("MovableGroup", _n);
}, qn = {
  name: Ce,
  version: "3.0.0",
  install: Ne
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Ne });
export {
  Kn as MovableBox,
  _n as MovableGroup,
  qn as default,
  Ce as name
};
