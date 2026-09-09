import { computed as tt, ref as J, defineComponent as At, reactive as dn, watch as dt, inject as fn, getCurrentInstance as pn, onMounted as hn, onUnmounted as gn, openBlock as ot, createElementBlock as at, normalizeStyle as Mt, normalizeClass as me, Fragment as Vt, renderList as Kt, unref as ve, withDirectives as mn, withModifiers as vn, vShow as bn, renderSlot as De, provide as yn } from "vue";
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
}, Mn = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function zn(e, i) {
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
        n.shiftKey ? Mn[h] : h,
        c
      );
      return;
    }
    if (n.shiftKey) {
      const v = l.resizeDirections.includes("br") ? "br" : l.resizeDirections[0];
      if (!v) return;
      n.preventDefault(), i.resize(v, h, c);
      return;
    }
    l.dragDirections.includes(h) && (n.preventDefault(), i.move(h, c));
  } };
}
const zt = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const i = Number(e);
  return Number.isFinite(i) ? i : null;
}, Rn = (e) => {
  const i = zt(e.left), r = zt(e.top), n = zt(e.width), l = zt(e.height);
  return i === null || r === null || n === null || l === null || n < 0 || l < 0 ? null : { left: i, top: r, width: n, height: l };
};
function Dn(e, i) {
  const r = Number.isFinite(i) && i > 0 ? i : 20;
  return Math.round(e / r) * r;
}
const be = (e, i, r) => i.distance > r ? e : !e || i.distance < e.distance ? i : e, Te = ["alignment", "spacing"], ye = (e, i, r, n, l) => {
  const s = l.length > 0 ? l : Te;
  for (const h of s) {
    const c = h === "alignment" ? i : r;
    if (c && c.distance <= n) {
      if (h === "alignment") {
        const y = c;
        return {
          candidate: y,
          spacing: null,
          guides: [y.guide],
          spacingInfo: null,
          value: y.value
        };
      }
      const v = c;
      return {
        candidate: null,
        spacing: v,
        guides: v.guides,
        spacingInfo: {
          axis: e,
          gap: v.gap,
          targetIds: v.targetIds,
          guides: v.guides
        },
        value: v.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, xe = (e, i, r, n, l) => {
  const s = (a) => e === "horizontal" ? a.left : a.top, h = (a) => e === "horizontal" ? a.left + a.width : a.top + a.height, c = [], v = [];
  for (const a of l)
    h(a.rect) <= i && c.push(a), s(a.rect) >= i + r && v.push(a);
  let y = null;
  for (const a of c)
    for (const H of v) {
      const k = s(H.rect) - h(a.rect) - r;
      if (k < 0) continue;
      const T = k / 2, W = h(a.rect) + T, $ = Math.abs(i - W);
      $ > n || (!y || $ < y.distance) && (y = {
        distance: $,
        value: W,
        gap: T,
        guides: [h(a.rect), s(H.rect)],
        targetIds: [a.id, H.id]
      });
    }
  return y;
};
function Tn(e, i, r = 10, n = { horizontal: !0, vertical: !0 }, l = {}) {
  const s = Math.max(0, Number.isFinite(r) ? r : 10), h = e.left + e.width, c = e.top + e.height, v = e.left + e.width / 2, y = e.top + e.height / 2, a = l.priority ?? Te, H = (D, I) => l.filter ? l.filter(D, I) !== !1 : !0;
  let k = null, T = null;
  const W = [], $ = [];
  for (const D of i) {
    const I = Rn(D);
    if (!I) continue;
    const L = n.horizontal && H(D, "horizontal"), _ = n.vertical && H(D, "vertical");
    if (L && W.push({ rect: I, id: D.id }), _ && $.push({ rect: I, id: D.id }), !L && !_) continue;
    const V = I.left + I.width, z = I.top + I.height, B = I.left + I.width / 2, O = I.top + I.height / 2, F = D.id, P = [
      {
        distance: Math.abs(e.left - I.left),
        value: I.left,
        guide: I.left,
        point: "left",
        targetId: F
      },
      {
        distance: Math.abs(h - V),
        value: V - e.width,
        guide: V,
        point: "right",
        targetId: F
      },
      {
        distance: Math.abs(e.left - V),
        value: V,
        guide: V,
        point: "left",
        targetId: F
      },
      {
        distance: Math.abs(h - I.left),
        value: I.left - e.width,
        guide: I.left,
        point: "right",
        targetId: F
      },
      {
        distance: Math.abs(v - B),
        value: B - e.width / 2,
        guide: B,
        point: "center-x",
        targetId: F
      }
    ], rt = [
      {
        distance: Math.abs(e.top - I.top),
        value: I.top,
        guide: I.top,
        point: "top",
        targetId: F
      },
      {
        distance: Math.abs(c - z),
        value: z - e.height,
        guide: z,
        point: "bottom",
        targetId: F
      },
      {
        distance: Math.abs(e.top - z),
        value: z,
        guide: z,
        point: "top",
        targetId: F
      },
      {
        distance: Math.abs(c - I.top),
        value: I.top - e.height,
        guide: I.top,
        point: "bottom",
        targetId: F
      },
      {
        distance: Math.abs(y - O),
        value: O - e.height / 2,
        guide: O,
        point: "center-y",
        targetId: F
      }
    ];
    if (L)
      for (const ct of P) k = be(k, ct, s);
    if (_)
      for (const ct of rt) T = be(T, ct, s);
  }
  const R = n.horizontal ? ye(
    "horizontal",
    k,
    xe(
      "horizontal",
      e.left,
      e.width,
      s,
      W
    ),
    s,
    a
  ) : null, S = n.vertical ? ye(
    "vertical",
    T,
    xe("vertical", e.top, e.height, s, $),
    s,
    a
  ) : null, d = (R == null ? void 0 : R.candidate) ?? null, g = (S == null ? void 0 : S.candidate) ?? null, m = [d == null ? void 0 : d.point, g == null ? void 0 : g.point].filter(
    (D) => !!D
  ), M = [R == null ? void 0 : R.spacingInfo, S == null ? void 0 : S.spacingInfo].filter(
    (D) => !!D
  );
  return {
    left: (R == null ? void 0 : R.value) ?? e.left,
    top: (S == null ? void 0 : S.value) ?? e.top,
    snapped: m.length > 0 || M.length > 0,
    snapPoint: m[0],
    points: m,
    targetId: (d == null ? void 0 : d.targetId) ?? (g == null ? void 0 : g.targetId),
    targetIds: { horizontal: d == null ? void 0 : d.targetId, vertical: g == null ? void 0 : g.targetId },
    guides: {
      vertical: (R == null ? void 0 : R.guides) ?? [],
      horizontal: (S == null ? void 0 : S.guides) ?? []
    },
    spacing: M
  };
}
function En(e) {
  const i = (l) => {
    const s = e();
    return s.snapToGrid ? Dn(l, s.gridSize) : l;
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
const Yt = () => ({ vertical: [], horizontal: [] });
function Sn(e) {
  const i = J(Yt()), r = J(null);
  return { guides: i, lastSnapResult: r, resolveSnap: (h, c, v) => {
    const y = e(), a = y.enabled ? Tn(h, c, y.threshold, v, {
      filter: y.filter,
      priority: y.priority
    }) : {
      ...h,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Yt(),
      spacing: []
    };
    return i.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    i.value = Yt(), r.value = null;
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
}, An = (e, i, r) => {
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
function St(e, i, r) {
  let n = null;
  for (const l of r) {
    const s = Ee(l);
    if (!s) continue;
    const h = An(e, i, s);
    h && (!n || h.entry < n.entry) && (n = h);
  }
  return n;
}
function Bn(e, i) {
  const r = Math.min(e.left + e.width, i.left + i.width) - Math.max(e.left, i.left), n = Math.min(e.top + e.height, i.top + i.height) - Math.max(e.top, i.top);
  if (r <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const l = e.left + e.width / 2, s = e.top + e.height / 2, h = i.left + i.width / 2, c = i.top + i.height / 2, v = l - h, y = s - c;
  return {
    colliding: !0,
    direction: r <= n ? v > 0 ? "right" : "left" : y > 0 ? "bottom" : "top",
    overlap: Math.min(r, n),
    overlapArea: r * n
  };
}
function _t(e, i, r) {
  const n = [];
  for (const l of i) {
    const s = Ee(l);
    if (!s) continue;
    const h = Bn(e, s);
    h.colliding && n.push({ ...h, targetId: l.id });
  }
  return n;
}
function Me(e) {
  let i = null;
  for (const r of e)
    (!i || (r.overlapArea ?? 0) > (i.overlapArea ?? 0)) && (i = r);
  return i;
}
const Xt = (e) => e.reduce((i, r) => i + (r.overlapArea ?? 0), 0), Se = (e, i, r) => ({
  left: e.left + (i.left - e.left) * r,
  top: e.top + (i.top - e.top) * r,
  width: e.width + (i.width - e.width) * r,
  height: e.height + (i.height - e.height) * r
}), Pn = (e, i) => e.left === i.left && e.top === i.top && e.width === i.width && e.height === i.height, Ut = (e, i, r, n) => {
  if (!St(e, i, r)) return i;
  let l = 0, s = 1, h = e;
  for (let c = 0; c < 24; c += 1) {
    const v = (l + s) / 2, y = n(Se(e, i, v));
    St(e, y, r) ? s = v : (h = y, l = v);
  }
  return h;
};
function Cn(e) {
  const i = J([]), r = J(!1), n = (c, v) => {
    const a = e().enabled ? _t(c, v) : [];
    return i.value = a, r.value = a.length > 0, {
      results: a,
      dominant: Me(a),
      totalOverlapArea: Xt(a)
    };
  }, l = (c) => (i.value = c, r.value = c.length > 0, {
    results: c,
    dominant: Me(c),
    totalOverlapArea: Xt(c)
  });
  return { collisions: i, isColliding: r, evaluate: n, resolveCandidate: (c, v, y, a = (k) => k, H = "path") => {
    const k = e(), T = n(c, y);
    if (!k.enabled || k.allowOverlap)
      return { accepted: !0, rect: c, ...T };
    const W = _t(v, y), $ = Xt(W);
    if ($ > 0)
      return {
        accepted: T.totalOverlapArea < $,
        rect: c,
        ...T
      };
    const R = St(v, c, y);
    if (T.results.length === 0 && !R)
      return { accepted: !0, rect: c, ...T };
    let S = T;
    if (T.results.length === 0 && R) {
      const g = Se(
        v,
        c,
        R.entry + (R.exit - R.entry) * 1e-3
      );
      S = l(_t(g, y));
    }
    let d = null;
    if (H === "slide") {
      const g = Ut(
        v,
        { ...v, left: c.left },
        y,
        a
      ), m = Ut(
        v,
        { ...v, top: c.top },
        y,
        a
      ), M = a({
        ...c,
        left: g.left,
        top: m.top
      });
      St(v, M, y) || (d = M);
    }
    return d ?? (d = Ut(v, c, y, a)), {
      accepted: !Pn(d, v),
      rect: d,
      ...S
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
}, st = (e, i, r) => Math.min(Math.max(e, i), r), Nn = (e, i) => p(e.left) === p(i.left) && p(e.top) === p(i.top) && p(e.width) === p(i.width) && p(e.height) === p(i.height), Bt = (e) => {
  const i = typeof e == "number" ? e : Number(e ?? 0);
  if (!Number.isFinite(i)) return 0;
  const r = (i % 360 + 360) % 360;
  return r > 180 ? r - 360 : r;
}, qt = (e) => e * Math.PI / 180, X = (e) => Math.round(e * 1e9) / 1e9, Ln = (e, i) => {
  const r = Bt(i);
  if (r === 0) return { ...e };
  const n = qt(r), l = Math.cos(n), s = Math.sin(n), h = Math.abs(e.width * l) + Math.abs(e.height * s), c = Math.abs(e.width * s) + Math.abs(e.height * l);
  return {
    left: X(e.left + (e.width - h) / 2),
    top: X(e.top + (e.height - c) / 2),
    width: X(h),
    height: X(c)
  };
}, Fn = (e, i, r) => {
  const n = { x: i / 2, y: r / 2 };
  if (!e) return n;
  const l = e.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (l.length === 0 || l.length > 2) return n;
  let s = null, h = null;
  const c = (v) => {
    s === null ? s = v : h === null && (h = v);
  };
  for (const v of l)
    if (v === "left") s = 0;
    else if (v === "right") s = i;
    else if (v === "top") h = 0;
    else if (v === "bottom") h = r;
    else if (v === "center") c(i / 2);
    else if (v.endsWith("%")) {
      const y = Number(v.slice(0, -1));
      if (!Number.isFinite(y)) return n;
      c(y / 100 * (s === null ? i : r));
    } else {
      const y = Number.parseFloat(v);
      if (!Number.isFinite(y)) return n;
      c(y);
    }
  return { x: s ?? i / 2, y: h ?? r / 2 };
}, Hn = (e, i, r) => {
  const n = Ln(e, i), l = Bt(i);
  if (l === 0) return n;
  const s = qt(l), h = Math.cos(s), c = Math.sin(s), v = e.width / 2 - r.x, y = e.height / 2 - r.y, a = X(v * h - y * c - v), H = X(v * c + y * h - y);
  return {
    left: X(n.left + a),
    top: X(n.top + H),
    width: n.width,
    height: n.height
  };
}, ze = (e, i, r) => {
  const n = Bt(r);
  if (n === 0) return { x: e, y: i };
  const l = qt(n), s = Math.cos(l), h = Math.sin(l);
  return {
    x: X(e * s + i * h),
    y: X(-e * h + i * s)
  };
}, Ae = Symbol("MovableGroupContext"), kn = 2, lt = (e, i = 1) => {
  if (e == null || e === "")
    return i;
  const r = typeof e == "string" ? parseFloat(e) : e;
  return isNaN(r) ? i : r;
}, Dt = (e, i = "px") => e == null || e === "" ? "0" : `${e}${i}`;
function Tt(e, i, r, n) {
  e && e.addEventListener(i, r, n);
}
function Et(e, i, r, n) {
  e && e.removeEventListener(i, r, n);
}
const Re = (e, i = 1, r = kn) => {
  const n = new xn(e).toDecimalPlaces(r).toNumber();
  return lt(n, i);
}, ft = (e) => {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Array)
    return e.map((i) => ft(i));
  if (e instanceof Object) {
    const i = {};
    for (const r in e)
      e.hasOwnProperty(r) && (i[r] = ft(e[r]));
    return i;
  }
  return e;
}, On = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Gn = At({
  name: "VueMovableBox"
}), Wn = /* @__PURE__ */ At({
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
  setup(e, { expose: i, emit: r }) {
    var ue;
    const n = e, l = r, s = (t) => ft(t), h = J(), c = J(s(n.modelValue)), v = s(n.modelValue), y = J(null), a = dn({
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
    dt(
      () => n.modelValue,
      (t) => {
        c.value = s(t);
      },
      { deep: !0 }
    ), dt(
      () => n.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? xt() : S(t);
      },
      { flush: "sync" }
    ), dt(
      () => n.disabled,
      (t) => {
        l("disabled", t), t && xt();
      }
    ), dt(
      () => n.initRect,
      (t) => {
        t && xt();
      }
    ), dt(
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
    const H = tt(() => n.resizable ?? n.resizeable ?? !0), k = tt(() => n.unitType === "%"), T = tt(() => Bt(n.rotate)), W = tt(() => ({
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
      transform: T.value ? `rotate(${T.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: n.transformOrigin,
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: n.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), $ = tt(() => ({
      borderColor: H.value ? n.theme : n.inActiveColor,
      scale: Re(1 / lt(n.scale, 1), 1)
    })), R = (t) => {
      const o = s(t);
      return c.value = o, l("update:modelValue", s(o)), o;
    };
    function S(t) {
      a.active !== t && (a.active = t, l(t ? "active" : "inactive", s(c.value)), t || Ct());
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
    }, g = (t) => Math.max(0, Number(t) || 0), m = () => {
      const t = g(n.edgeDistance);
      return {
        top: t + g(n.boundsMargin.top),
        right: t + g(n.boundsMargin.right),
        bottom: t + g(n.boundsMargin.bottom),
        left: t + g(n.boundsMargin.left)
      };
    }, M = () => {
      const t = m(), o = k.value ? 100 : a.parentWidth, u = k.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, o - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, u - t.bottom)
      };
    }, D = (t) => {
      const o = M();
      return {
        minLeft: o.minLeft,
        maxLeft: Math.max(o.minLeft, o.maxRight - t.width),
        minTop: o.minTop,
        maxTop: Math.max(o.minTop, o.maxBottom - t.height)
      };
    }, I = (t) => ({
      left: p(t.left),
      top: p(t.top),
      width: p(t.width),
      height: p(t.height)
    }), L = (t) => {
      const o = I(t), u = T.value;
      if (!u) return o;
      const f = Fn(n.transformOrigin, o.width, o.height);
      return Hn(o, u, f);
    }, _ = (t) => {
      if (!a.parentElement) return;
      const o = M(), u = L(t), f = u.left, x = u.top, b = f + u.width, w = x + u.height;
      f < o.minLeft && l("out-of-bounds", "left"), b > o.maxRight && l("out-of-bounds", "right"), x < o.minTop && l("out-of-bounds", "top"), w > o.maxBottom && l("out-of-bounds", "bottom");
    }, V = (t) => {
      if (!n.limitAreaForParent || !a.parentElement) return t;
      const o = L(t), u = D(o), f = st(o.left, u.minLeft, u.maxLeft), x = st(o.top, u.minTop, u.maxTop);
      return T.value ? {
        ...t,
        left: P(p(t.left) + (f - o.left)),
        top: P(p(t.top) + (x - o.top))
      } : {
        ...t,
        left: f,
        top: x
      };
    }, z = fn(Ae, null), B = n.memberId || `member-${((ue = pn()) == null ? void 0 : ue.uid) ?? Math.random().toString(36).slice(2)}`;
    let O = !1;
    const F = {
      getRect: () => s(c.value),
      translateTo: (t) => {
        R(t);
      },
      getAreaEdges: () => (d(), a.parentElement ? M() : null)
    };
    hn(() => z == null ? void 0 : z.registerMember(B, F));
    const P = (t) => n.isKeepDecimals ? Re(t, 0, n.decimalPlaces) : Math.round(t), rt = (t, o) => {
      const u = lt(n.scale, 1), f = t / (u === 0 ? 1 : u);
      if (!k.value) return P(f);
      const x = o === "horizontal" ? a.parentWidth : a.parentHeight;
      return x > 0 ? P(f / x * 100) : 0;
    }, ct = En(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Z = Sn(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), Jt = Cn(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), Zt = Z.guides;
    let pt = "clear", ht = "clear", gt = "clear";
    const vt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), bt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Pt = (t) => {
      const o = {
        horizontal: t.points.some((w) => vt.has(w)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((w) => bt.has(w)) ? t.targetIds.vertical : void 0
      }, u = t.snapped ? ft(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: o,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, x = JSON.stringify({
        payload: f,
        left: t.points.some((w) => vt.has(w)) ? t.left : void 0,
        top: t.points.some((w) => bt.has(w)) ? t.top : void 0
      });
      x !== pt && ((t.snapped || pt !== "clear") && l("snap", f), pt = t.snapped ? x : "clear");
      const b = JSON.stringify({ guides: t.guides, targetIds: o });
      b !== ht && ((t.snapped || ht !== "clear") && l("guides", ft(t.guides)), ht = t.snapped ? b : "clear");
    }, Ce = (t) => {
      const o = t.dominant, u = o ? {
        colliding: !0,
        direction: o.direction,
        targetId: o.targetId
      } : { colliding: !1 }, f = JSON.stringify(u);
      f !== gt && ((o || gt !== "clear") && l("collision", u), gt = o ? f : "clear");
    }, Ct = () => {
      pt !== "clear" && l("snap", { snapped: !1 }), ht !== "clear" && l("guides", { vertical: [], horizontal: [] }), gt !== "clear" && l("collision", { colliding: !1 }), pt = "clear", ht = "clear", gt = "clear", Z.clearGuides(), Jt.clearCollisions();
    }, Nt = (t, o, u = "path") => {
      const f = L(t), x = Jt.resolveCandidate(
        f,
        L(o),
        n.snapTargets,
        (b) => ({
          left: P(b.left),
          top: P(b.top),
          width: P(b.width),
          height: P(b.height)
        }),
        u
      );
      return Ce(x), x.accepted ? T.value ? {
        ...t,
        left: P(p(t.left) + (x.rect.left - f.left)),
        top: P(p(t.top) + (x.rect.top - f.top))
      } : { ...t, ...x.rect } : null;
    }, Qt = (t, o, u, f, x) => {
      let b = s(t);
      f.horizontal && (b.left = ct.snapValue(p(t.left))), f.vertical && (b.top = ct.snapValue(p(t.top)));
      let w = {
        ...I(b),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const E = L(b);
        w = Z.resolveSnap(E, n.snapTargets, f), T.value ? b = {
          ...b,
          left: P(p(b.left) + (w.left - E.left)),
          top: P(p(b.top) + (w.top - E.top))
        } : b = { ...b, left: w.left, top: w.top };
      } else
        Z.clearGuides();
      if (x) {
        const E = p(x.left), C = p(x.top);
        n.dragDirections.includes("left") || (b.left = Math.max(E, p(b.left))), n.dragDirections.includes("right") || (b.left = Math.min(E, p(b.left))), n.dragDirections.includes("top") || (b.top = Math.max(C, p(b.top))), n.dragDirections.includes("bottom") || (b.top = Math.min(C, p(b.top)));
      }
      _(b), b = V(b);
      const G = Nt(b, o, "slide");
      if (!G)
        return Pt({
          ...w,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Z.clearGuides(), null;
      if (b = G, w.snapped) {
        const E = p(b.left) !== w.left, C = p(b.top) !== w.top, N = w.points.filter((A) => vt.has(A) ? !E : bt.has(A) ? !C : !1), Y = N.some((A) => vt.has(A)), Q = N.some((A) => bt.has(A)), q = w.spacing.filter(
          (A) => A.axis === "horizontal" ? !E : !C
        ), K = {
          vertical: q.flatMap((A) => A.axis === "horizontal" ? A.guides : []),
          horizontal: q.flatMap((A) => A.axis === "vertical" ? A.guides : [])
        };
        w = {
          ...w,
          left: p(b.left),
          top: p(b.top),
          snapped: N.length > 0 || q.length > 0,
          snapPoint: N[0],
          points: N,
          targetId: Y ? w.targetIds.horizontal : Q ? w.targetIds.vertical : void 0,
          targetIds: {
            horizontal: Y ? w.targetIds.horizontal : void 0,
            vertical: Q ? w.targetIds.vertical : void 0
          },
          guides: {
            vertical: Y ? w.guides.vertical : K.vertical,
            horizontal: Q ? w.guides.horizontal : K.horizontal
          },
          spacing: q
        }, w.snapped ? Z.setGuides(w.guides) : Z.clearGuides();
      }
      return Pt(w), b;
    }, Lt = (t) => n.resizeDirections.includes(t), jt = (t, o, u, f) => {
      const x = p(t.left), b = p(t.top), w = p(t.width), G = p(t.height);
      let E = x, C = x + w, N = b, Y = b + G;
      o.includes("l") && (E += u), o.includes("r") && (C += u), o.includes("t") && (N += f), o.includes("b") && (Y += f);
      const Q = (E + C) / 2, q = (N + Y) / 2;
      let K = Math.max(0, C - E), A = Math.max(0, Y - N);
      const ut = w > 0 && G > 0 ? w / G : 1, Gt = (it) => {
        K = it, o.includes("l") ? E = C - K : o.includes("r") ? C = E + K : (E = Q - K / 2, C = Q + K / 2);
      }, Wt = (it) => {
        A = it, o.includes("t") ? N = Y - A : o.includes("b") ? Y = N + A : (N = q - A / 2, Y = q + A / 2);
      };
      if (n.ratioLock) {
        const it = Math.abs(K - w), un = Math.abs(A - G) * ut;
        o === "tm" || o === "bm" || un > it ? Gt(A * ut) : Wt(K / ut);
      }
      const j = M(), de = n.limitAreaForParent && !!a.parentElement, rn = de ? o.includes("l") ? Math.max(0, C - j.minLeft) : o.includes("r") ? Math.max(0, j.maxRight - E) : Math.max(
        0,
        2 * Math.min(Q - j.minLeft, j.maxRight - Q)
      ) : 1 / 0, cn = de ? o.includes("t") ? Math.max(0, Y - j.minTop) : o.includes("b") ? Math.max(0, j.maxBottom - N) : Math.max(
        0,
        2 * Math.min(q - j.minTop, j.maxBottom - q)
      ) : 1 / 0, fe = Math.max(0, lt(n.minWidth, 0)), pe = Math.max(0, lt(n.minHeight, 0)), he = lt(n.maxWidth, 1 / 0), ge = lt(n.maxHeight, 1 / 0);
      let mt = Math.min(he > 0 ? he : 1 / 0, rn), $t = Math.min(ge > 0 ? ge : 1 / 0, cn);
      if (n.ratioLock) {
        mt = Math.min(mt, $t * ut);
        const it = Math.max(fe, pe * ut);
        Gt(st(K, it, mt)), Wt(K / ut);
      } else
        Gt(st(K, Math.min(fe, mt), mt)), Wt(st(A, Math.min(pe, $t), $t));
      return {
        ...t,
        left: P(E),
        top: P(N),
        width: P(C - E),
        height: P(Y - N)
      };
    };
    let U = null, et = null;
    const te = (t) => {
      if (n.disabled || n.initRect || !a.isDragging && !a.isResizing) return;
      const o = rt(t.clientX - a.initX, "horizontal"), u = rt(t.clientY - a.initY, "vertical"), f = s(c.value);
      if (a.isDragging) {
        const x = a.beforeInteraction;
        let b = p(x.left) + o, w = p(x.top) + u;
        const G = {
          horizontal: o < 0 && n.dragDirections.includes("left") || o > 0 && n.dragDirections.includes("right"),
          vertical: u < 0 && n.dragDirections.includes("top") || u > 0 && n.dragDirections.includes("bottom")
        };
        G.horizontal || (b = p(x.left)), G.vertical || (w = p(x.top));
        const E = {
          ...x,
          left: P(b),
          top: P(w)
        };
        let C = Qt(E, f, n.snapToElements, G, x);
        if (C && O && (C = (z == null ? void 0 : z.constrainPosition(B, C)) ?? null), C) {
          const N = R(C);
          l("move", s(N)), l("drag", s(N)), O && (z == null || z.notifyMoved(B, s(N)));
        }
      }
      if (a.isResizing && a.handle) {
        Pt({
          ...I(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Z.clearGuides();
        const x = ze(o, u, T.value);
        let b = jt(
          a.beforeInteraction,
          a.handle,
          x.x,
          x.y
        );
        T.value && (b = V(b)), _(b);
        const w = Nt(b, f);
        if (w) {
          const G = R(w);
          l("resize", s(G));
        }
      }
    }, Ne = (t) => {
      !a.active || n.disabled || n.initRect || (et = t, U === null && (U = requestAnimationFrame(() => {
        U = null;
        const o = et;
        et = null, o && te(o);
      })));
    }, yt = (t) => a.pointerId === null || t.pointerId === a.pointerId, ee = (t) => {
      yt(t) && Ne(t);
    }, ne = (t) => {
      yt(t) && We(t);
    }, ie = (t) => {
      yt(t) && wt(t);
    }, oe = (t) => {
      yt(t) && (a.isDragging || a.isResizing) && wt(t);
    }, Le = () => {
      const t = a.eventElement;
      if (!t) return;
      const o = { passive: !1 };
      Tt(t, "pointermove", ee, o), Tt(t, "pointerup", ne, o), Tt(t, "pointercancel", ie, o);
      const u = h.value;
      u && Tt(u, "lostpointercapture", oe, o);
    }, Fe = () => {
      const t = a.eventElement;
      if (!t) return;
      Et(t, "pointermove", ee, !1), Et(t, "pointerup", ne, !1), Et(t, "pointercancel", ie, !1);
      const o = h.value;
      o && Et(o, "lostpointercapture", oe, !1), a.eventElement = null;
    }, He = () => {
      const t = h.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, ke = () => {
      const t = h.value, o = a.pointerId;
      if (a.pointerId = null, !(!t || o === null))
        try {
          t.hasPointerCapture(o) && t.releasePointerCapture(o);
        } catch {
        }
    };
    function Ft() {
      U !== null && (cancelAnimationFrame(U), U = null), et = null;
    }
    function Ht() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, O = !1, Fe(), ke();
    }
    function ae() {
      Ct(), n.active || S(!1);
    }
    function le() {
      Ht(), ae();
    }
    function xt() {
      Ft(), O && (z == null || z.abortDrag(B)), le();
    }
    function wt(t = null) {
      const o = a.isDragging, u = a.isResizing, f = O;
      if (Ft(), Ht(), o || u) {
        const x = s(a.beforeInteraction);
        R(x), l(o ? "drag-cancel" : "resize-cancel", t, x, s(x)), o && f && (z == null || z.cancelDrag(B, t));
      }
      ae();
    }
    function se() {
      xt(), S(!1);
    }
    const Oe = (t, o) => {
      var f, x;
      if (n.disabled || n.initRect || a.isDragging || a.isResizing || o && (!H.value || !Lt(o)) || !o && !n.draggable) return;
      const u = s(c.value);
      if (o) {
        if (((f = n.canResize) == null ? void 0 : f.call(n, u, o)) === !1) return;
      } else if (((x = n.canDrag) == null ? void 0 : x.call(n, u)) === !1)
        return;
      O = !o && z !== null, O && (z == null || z.beginDrag(B, t)), d(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = s(c.value), a.handle = o, a.isDragging = !o, a.isResizing = !!o, S(!0), a.isDragging && l("drag-start", t, s(a.beforeInteraction)), a.isResizing && l("resize-start", t, s(a.beforeInteraction)), a.eventElement = document.documentElement, Le(), He();
    }, Ge = (t) => {
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
    }, re = (t, o) => {
      !t.isPrimary || t.button !== 0 || !o && !Ge(t.target) || Oe(t, o);
    };
    function We(t) {
      U !== null && (cancelAnimationFrame(U), U = null), et && (te(et), et = null), a.isDragging && (l("drag-stop", t, s(a.beforeInteraction), s(c.value)), O && (z == null || z.endDrag(B, t))), a.isResizing && l("resize-stop", t, s(a.beforeInteraction), s(c.value)), le();
    }
    const $e = (t, o) => {
      var b;
      d();
      const u = s(c.value);
      if (((b = n.canDrag) == null ? void 0 : b.call(n, s(u))) === !1) return;
      const f = s(u);
      t === "left" && (f.left = p(f.left) - o), t === "right" && (f.left = p(f.left) + o), t === "top" && (f.top = p(f.top) - o), t === "bottom" && (f.top = p(f.top) + o);
      const x = Qt(f, u, n.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, u);
      if (x) {
        const w = R(x);
        l("move", s(w));
      }
    }, Ve = (t, o, u) => {
      var N;
      if (!H.value || !Lt(t)) return;
      d();
      const f = s(c.value);
      if (((N = n.canResize) == null ? void 0 : N.call(n, s(f), t)) === !1) return;
      const x = o === "left" ? -u : o === "right" ? u : 0, b = o === "top" ? -u : o === "bottom" ? u : 0, w = ze(x, b, T.value);
      let G = jt(f, t, w.x, w.y);
      T.value && (G = V(G)), _(G);
      const E = Nt(G, f);
      if (!E || Nn(E, f)) return;
      const C = R(E);
      l("resize", s(C));
    }, Ke = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Ye = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), nt = (t) => Ye.has(t), _e = (t) => nt(t) ? "group" : "separator", Xe = (t) => nt(t) ? "two-axis resize handle" : void 0, Ue = (t) => `Resize ${Ke[t]}`, qe = (t) => {
      if (!nt(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, It = (t) => t === "ml" || t === "mr", ce = (t) => {
      if (!nt(t))
        return p(
          It(t) ? c.value.width : c.value.height
        );
    }, Je = (t) => {
      if (!nt(t))
        return p(It(t) ? n.minWidth : n.minHeight);
    }, Ze = (t) => {
      if (nt(t)) return;
      const o = It(t) ? n.maxWidth : n.maxHeight;
      if (o === void 0) return;
      const u = p(o);
      return Number.isFinite(u) ? u : void 0;
    }, Qe = (t) => {
      const o = ce(t);
      if (o !== void 0)
        return n.unitType === "%" ? `${o} percent` : `${o} pixels`;
    }, je = (t) => {
      if (n.keyboardEnabled)
        return nt(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : It(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, tn = (t) => {
      t.target === h.value && n.keyboardEnabled && !n.disabled && !n.initRect && S(!0);
    }, en = [
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
    ].join(","), nn = (t) => {
      const o = t.target, u = h.value;
      if (!(o instanceof Element) || !u || o === u || o.closest(".handle")) return !1;
      const f = o.closest(en);
      return f !== null && f !== u && u.contains(f);
    }, on = zn(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: a.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: y.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: $e,
        resize: Ve,
        deactivate: se,
        cancel: (t) => wt(t)
      }
    ), an = (t) => {
      nn(t) || on.handleKeyDown(t);
    }, kt = (t) => k.value ? t / 100 * a.parentWidth : t, Ot = (t) => k.value ? t / 100 * a.parentHeight : t, ln = (t) => ({
      left: `${kt(t) - kt(p(c.value.left))}px`,
      top: `${-Ot(p(c.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: n.theme
    }), sn = (t) => ({
      top: `${Ot(t) - Ot(p(c.value.top))}px`,
      left: `${-kt(p(c.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: n.theme
    });
    return i({
      getConfig: () => s(c.value),
      setPosition: (t, o) => R({ ...c.value, left: t, top: o }),
      setSize: (t, o) => R({ ...c.value, width: t, height: o }),
      reset: () => R(s(v)),
      activate: () => S(!0),
      deactivate: se,
      cancelInteraction: (t = null) => wt(t)
    }), gn(() => {
      Ft(), Ht(), z == null || z.unregisterMember(B), Ct();
    }), (t, o) => (ot(), at("div", {
      ref_key: "movableRef",
      ref: h,
      class: me(["auto-draggable", {
        "select-none": e.disabledUserSelect,
        "is-disabled": e.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": e.initRect
      }]),
      style: Mt(W.value),
      tabindex: "0",
      onPointerdown: o[1] || (o[1] = (u) => re(u, null)),
      onDblclick: o[2] || (o[2] = (u) => l("dblclick", u)),
      onFocus: tn,
      onKeydown: an
    }, [
      (ot(!0), at(Vt, null, Kt(ve(Zt).vertical, (u, f) => (ot(), at("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: Mt(ln(u))
      }, null, 4))), 128)),
      (ot(!0), at(Vt, null, Kt(ve(Zt).horizontal, (u, f) => (ot(), at("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: Mt(sn(u))
      }, null, 4))), 128)),
      (ot(!0), at(Vt, null, Kt(e.handles, (u) => mn((ot(), at("div", {
        key: u,
        class: me(["handle", `handle-${u}`]),
        style: Mt($.value),
        role: _e(u),
        "aria-roledescription": Xe(u),
        "aria-orientation": qe(u),
        "aria-label": Ue(u),
        "aria-valuenow": ce(u),
        "aria-valuemin": Je(u),
        "aria-valuemax": Ze(u),
        "aria-valuetext": Qe(u),
        "aria-keyshortcuts": je(u),
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: vn((f) => re(f, u), ["stop", "prevent"]),
        onFocus: (f) => y.value = u,
        onBlur: o[0] || (o[0] = (f) => y.value = null)
      }, null, 46, On)), [
        [bn, a.active && H.value && !e.disabled && Lt(u)]
      ])), 128)),
      De(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), $n = (e, i) => {
  const r = e.__vccOpts || e;
  for (const [n, l] of i)
    r[n] = l;
  return r;
}, Vn = /* @__PURE__ */ $n(Wn, [["__scopeId", "data-v-caacb8b2"]]), Kn = At({
  name: "MovableGroup"
}), Yn = /* @__PURE__ */ At({
  ...Kn,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(e, { expose: i, emit: r }) {
    const n = e, l = r, s = /* @__PURE__ */ new Map(), h = J([]), c = J(null), v = tt(() => n.selected !== void 0), y = tt({
      get: () => v.value ? n.selected ?? [] : h.value,
      set: (d) => {
        h.value = d, l("update:selected", d);
      }
    });
    dt(
      () => n.selected,
      (d) => {
        d !== void 0 && (h.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => ft(d), H = (d, g, m) => ({
      ...d,
      left: p(d.left) + g,
      top: p(d.top) + m
    }), k = (d) => d.reduce(
      (g, m) => ({
        minLeft: Math.min(g.minLeft, p(m.left)),
        minTop: Math.min(g.minTop, p(m.top)),
        maxRight: Math.max(g.maxRight, p(m.left) + p(m.width)),
        maxBottom: Math.max(g.maxBottom, p(m.top) + p(m.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), T = (d, g, m) => {
      const M = k([...d.values()]);
      return {
        left: Math.min(
          Math.max(g.left, m.minLeft - M.minLeft),
          m.maxRight - M.maxRight
        ),
        top: Math.min(
          Math.max(g.top, m.minTop - M.minTop),
          m.maxBottom - M.maxBottom
        )
      };
    }, W = (d) => {
      const g = [];
      for (const [m, M] of d) {
        const D = s.get(m);
        D && g.push({ id: m, rect: a(D.getRect()), startRect: a(M) });
      }
      return g;
    }, $ = (d) => d.map(({ id: g, rect: m }) => ({ id: g, rect: m })), R = (d) => {
      const g = d.filter((M) => s.has(M)), m = y.value;
      m.length === g.length && m.every((M, D) => M === g[D]) || (y.value = g);
    };
    return yn(Ae, {
      registerMember: (d, g) => {
        s.set(d, g);
      },
      unregisterMember: (d) => {
        var g;
        if (s.delete(d), ((g = c.value) == null ? void 0 : g.leaderId) === d) {
          c.value = null;
          return;
        }
        c.value && c.value.startRects.delete(d), y.value.includes(d) && R(y.value.filter((m) => m !== d));
      },
      beginDrag: (d, g) => {
        if (c.value && c.value.leaderId !== d || !s.has(d)) return;
        y.value.includes(d) || R([d]);
        const m = /* @__PURE__ */ new Map();
        for (const D of y.value) {
          const I = s.get(D);
          I && m.set(D, a(I.getRect()));
        }
        c.value = { leaderId: d, startRects: m };
        const M = [];
        for (const [D, I] of m) M.push({ id: D, rect: a(I) });
        l("move-start", { leaderId: d, source: g, rects: M });
      },
      constrainPosition: (d, g) => {
        var _, V, z;
        const m = c.value, M = m == null ? void 0 : m.startRects.get(d);
        if (!m || !M || !s.has(d)) return g;
        const D = p(g.left) - p(M.left), I = p(g.top) - p(M.top), L = (_ = s.get(d)) == null ? void 0 : _.getAreaEdges();
        if (n.sharedBounds) {
          let B = { left: D, top: I };
          L && (B = T(m.startRects, B, L));
          for (const [O, F] of m.startRects)
            O !== d && ((V = s.get(O)) == null || V.translateTo(H(F, B.left, B.top)));
          return H(M, B.left, B.top);
        }
        if (L)
          for (const [B, O] of m.startRects) {
            if (B === d) continue;
            const F = H(O, D, I), P = Math.max(L.minLeft, L.maxRight - p(O.width)), rt = Math.max(L.minTop, L.maxBottom - p(O.height));
            F.left = st(p(F.left), L.minLeft, P), F.top = st(p(F.top), L.minTop, rt), (z = s.get(B)) == null || z.translateTo(F);
          }
        return g;
      },
      notifyMoved: (d, g) => {
        const m = c.value;
        if (!m || m.leaderId !== d) return;
        const M = $(W(m.startRects)).map(
          (D) => D.id === d ? { id: d, rect: a(g) } : D
        );
        l("move", { leaderId: d, rects: M });
      },
      endDrag: (d, g) => {
        const m = c.value;
        if (!m || m.leaderId !== d) return;
        const M = W(m.startRects);
        c.value = null, l("move-stop", { leaderId: d, source: g, rects: M });
      },
      cancelDrag: (d, g) => {
        var D;
        const m = c.value;
        if (!m || m.leaderId !== d) return;
        for (const [I, L] of m.startRects)
          I !== d && ((D = s.get(I)) == null || D.translateTo(a(L)));
        const M = W(m.startRects);
        c.value = null, l("move-cancel", { leaderId: d, source: g, rects: M });
      },
      abortDrag: (d) => {
        var g;
        ((g = c.value) == null ? void 0 : g.leaderId) === d && (c.value = null);
      }
    }), i({
      getSelected: () => [...y.value],
      select: (d) => R(d ?? [...s.keys()]),
      getMemberRects: () => [...s.entries()].map(([d, g]) => ({ id: d, rect: a(g.getRect()) }))
    }), (d, g) => De(d.$slots, "default");
  }
}), Be = "VueMovableBox", Pe = (e) => {
  e.component(Be, Vn), e.component("MovableGroup", Yn);
}, Un = {
  name: Be,
  version: "3.0.0",
  install: Pe
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Pe });
export {
  Vn as MovableBox,
  Yn as MovableGroup,
  Un as default,
  Be as name
};
