import { computed as j, ref as q, defineComponent as At, reactive as dn, watch as rt, inject as fn, getCurrentInstance as pn, onMounted as hn, onUnmounted as gn, openBlock as it, createElementBlock as ot, normalizeStyle as Mt, normalizeClass as ge, Fragment as $t, renderList as Vt, unref as me, withDirectives as mn, withModifiers as vn, vShow as bn, renderSlot as Re, provide as yn } from "vue";
import wn from "decimal.js";
const In = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, xn = {
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
    const h = In[n.key];
    if (!h) return;
    const u = Number.isFinite(l.step) && l.step > 0 ? l.step : 1;
    if (l.focusedHandle && l.resizeDirections.includes(l.focusedHandle)) {
      if (!xn[l.focusedHandle].includes(h)) return;
      n.preventDefault(), i.resize(
        l.focusedHandle,
        n.shiftKey ? Mn[h] : h,
        u
      );
      return;
    }
    if (n.shiftKey) {
      const x = l.resizeDirections.includes("br") ? "br" : l.resizeDirections[0];
      if (!x) return;
      n.preventDefault(), i.resize(x, h, u);
      return;
    }
    l.dragDirections.includes(h) && (n.preventDefault(), i.move(h, u));
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
const ve = (e, i, r) => i.distance > r ? e : !e || i.distance < e.distance ? i : e, De = ["alignment", "spacing"], be = (e, i, r, n, l) => {
  const s = l.length > 0 ? l : De;
  for (const h of s) {
    const u = h === "alignment" ? i : r;
    if (u && u.distance <= n) {
      if (h === "alignment") {
        const I = u;
        return {
          candidate: I,
          spacing: null,
          guides: [I.guide],
          spacingInfo: null,
          value: I.value
        };
      }
      const x = u;
      return {
        candidate: null,
        spacing: x,
        guides: x.guides,
        spacingInfo: {
          axis: e,
          gap: x.gap,
          targetIds: x.targetIds,
          guides: x.guides
        },
        value: x.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, ye = (e, i, r, n, l) => {
  const s = (a) => e === "horizontal" ? a.left : a.top, h = (a) => e === "horizontal" ? a.left + a.width : a.top + a.height, u = [], x = [];
  for (const a of l)
    h(a.rect) <= i && u.push(a), s(a.rect) >= i + r && x.push(a);
  let I = null;
  for (const a of u)
    for (const D of x) {
      const B = s(D.rect) - h(a.rect) - r;
      if (B < 0) continue;
      const S = B / 2, _ = h(a.rect) + S, G = Math.abs(i - _);
      G > n || (!I || G < I.distance) && (I = {
        distance: G,
        value: _,
        gap: S,
        guides: [h(a.rect), s(D.rect)],
        targetIds: [a.id, D.id]
      });
    }
  return I;
};
function Tn(e, i, r = 10, n = { horizontal: !0, vertical: !0 }, l = {}) {
  const s = Math.max(0, Number.isFinite(r) ? r : 10), h = e.left + e.width, u = e.top + e.height, x = e.left + e.width / 2, I = e.top + e.height / 2, a = l.priority ?? De, D = (M, y) => l.filter ? l.filter(M, y) !== !1 : !0;
  let B = null, S = null;
  const _ = [], G = [];
  for (const M of i) {
    const y = Rn(M);
    if (!y) continue;
    const N = n.horizontal && D(M, "horizontal"), O = n.vertical && D(M, "vertical");
    if (N && _.push({ rect: y, id: M.id }), O && G.push({ rect: y, id: M.id }), !N && !O) continue;
    const Y = y.left + y.width, z = y.top + y.height, F = y.left + y.width / 2, H = y.top + y.height / 2, V = M.id, W = [
      {
        distance: Math.abs(e.left - y.left),
        value: y.left,
        guide: y.left,
        point: "left",
        targetId: V
      },
      {
        distance: Math.abs(h - Y),
        value: Y - e.width,
        guide: Y,
        point: "right",
        targetId: V
      },
      {
        distance: Math.abs(e.left - Y),
        value: Y,
        guide: Y,
        point: "left",
        targetId: V
      },
      {
        distance: Math.abs(h - y.left),
        value: y.left - e.width,
        guide: y.left,
        point: "right",
        targetId: V
      },
      {
        distance: Math.abs(x - F),
        value: F - e.width / 2,
        guide: F,
        point: "center-x",
        targetId: V
      }
    ], mt = [
      {
        distance: Math.abs(e.top - y.top),
        value: y.top,
        guide: y.top,
        point: "top",
        targetId: V
      },
      {
        distance: Math.abs(u - z),
        value: z - e.height,
        guide: z,
        point: "bottom",
        targetId: V
      },
      {
        distance: Math.abs(e.top - z),
        value: z,
        guide: z,
        point: "top",
        targetId: V
      },
      {
        distance: Math.abs(u - y.top),
        value: y.top - e.height,
        guide: y.top,
        point: "bottom",
        targetId: V
      },
      {
        distance: Math.abs(I - H),
        value: H - e.height / 2,
        guide: H,
        point: "center-y",
        targetId: V
      }
    ];
    if (N)
      for (const lt of W) B = ve(B, lt, s);
    if (O)
      for (const lt of mt) S = ve(S, lt, s);
  }
  const R = n.horizontal ? be(
    "horizontal",
    B,
    ye(
      "horizontal",
      e.left,
      e.width,
      s,
      _
    ),
    s,
    a
  ) : null, T = n.vertical ? be(
    "vertical",
    S,
    ye("vertical", e.top, e.height, s, G),
    s,
    a
  ) : null, L = (R == null ? void 0 : R.candidate) ?? null, d = (T == null ? void 0 : T.candidate) ?? null, m = [L == null ? void 0 : L.point, d == null ? void 0 : d.point].filter(
    (M) => !!M
  ), p = [R == null ? void 0 : R.spacingInfo, T == null ? void 0 : T.spacingInfo].filter(
    (M) => !!M
  );
  return {
    left: (R == null ? void 0 : R.value) ?? e.left,
    top: (T == null ? void 0 : T.value) ?? e.top,
    snapped: m.length > 0 || p.length > 0,
    snapPoint: m[0],
    points: m,
    targetId: (L == null ? void 0 : L.targetId) ?? (d == null ? void 0 : d.targetId),
    targetIds: { horizontal: L == null ? void 0 : L.targetId, vertical: d == null ? void 0 : d.targetId },
    guides: {
      vertical: (R == null ? void 0 : R.guides) ?? [],
      horizontal: (T == null ? void 0 : T.guides) ?? []
    },
    spacing: p
  };
}
function En(e) {
  const i = (l) => {
    const s = e();
    return s.snapToGrid ? Dn(l, s.gridSize) : l;
  }, r = (l, s) => ({
    left: i(l),
    top: i(s)
  }), n = j(() => {
    const l = e();
    return l.snapToGrid ? {
      size: Number.isFinite(l.gridSize) && l.gridSize > 0 ? l.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: i, snapPosition: r, gridInfo: n };
}
const Kt = () => ({ vertical: [], horizontal: [] });
function Sn(e) {
  const i = q(Kt()), r = q(null);
  return { guides: i, lastSnapResult: r, resolveSnap: (h, u, x) => {
    const I = e(), a = I.enabled ? Tn(h, u, I.threshold, x, {
      filter: I.filter,
      priority: I.priority
    }) : {
      ...h,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Kt(),
      spacing: []
    };
    return i.value = a.guides, r.value = a.snapped ? a : null, a;
  }, clearGuides: () => {
    i.value = Kt(), r.value = null;
  }, setGuides: (h) => {
    i.value = h;
  } };
}
const Rt = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const i = Number(e);
  return Number.isFinite(i) ? i : null;
}, Te = (e) => {
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
    const s = Te(l);
    if (!s) continue;
    const h = An(e, i, s);
    h && (!n || h.entry < n.entry) && (n = h);
  }
  return n;
}
function Pn(e, i) {
  const r = Math.min(e.left + e.width, i.left + i.width) - Math.max(e.left, i.left), n = Math.min(e.top + e.height, i.top + i.height) - Math.max(e.top, i.top);
  if (r <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const l = e.left + e.width / 2, s = e.top + e.height / 2, h = i.left + i.width / 2, u = i.top + i.height / 2, x = l - h, I = s - u;
  return {
    colliding: !0,
    direction: r <= n ? x > 0 ? "right" : "left" : I > 0 ? "bottom" : "top",
    overlap: Math.min(r, n),
    overlapArea: r * n
  };
}
function _t(e, i, r) {
  const n = [];
  for (const l of i) {
    const s = Te(l);
    if (!s) continue;
    const h = Pn(e, s);
    h.colliding && n.push({ ...h, targetId: l.id });
  }
  return n;
}
function xe(e) {
  let i = null;
  for (const r of e)
    (!i || (r.overlapArea ?? 0) > (i.overlapArea ?? 0)) && (i = r);
  return i;
}
const Yt = (e) => e.reduce((i, r) => i + (r.overlapArea ?? 0), 0), Ee = (e, i, r) => ({
  left: e.left + (i.left - e.left) * r,
  top: e.top + (i.top - e.top) * r,
  width: e.width + (i.width - e.width) * r,
  height: e.height + (i.height - e.height) * r
}), Cn = (e, i) => e.left === i.left && e.top === i.top && e.width === i.width && e.height === i.height, Ut = (e, i, r, n) => {
  if (!St(e, i, r)) return i;
  let l = 0, s = 1, h = e;
  for (let u = 0; u < 24; u += 1) {
    const x = (l + s) / 2, I = n(Ee(e, i, x));
    St(e, I, r) ? s = x : (h = I, l = x);
  }
  return h;
};
function Nn(e) {
  const i = q([]), r = q(!1), n = (u, x) => {
    const a = e().enabled ? _t(u, x) : [];
    return i.value = a, r.value = a.length > 0, {
      results: a,
      dominant: xe(a),
      totalOverlapArea: Yt(a)
    };
  }, l = (u) => (i.value = u, r.value = u.length > 0, {
    results: u,
    dominant: xe(u),
    totalOverlapArea: Yt(u)
  });
  return { collisions: i, isColliding: r, evaluate: n, resolveCandidate: (u, x, I, a = (B) => B, D = "path") => {
    const B = e(), S = n(u, I);
    if (!B.enabled || B.allowOverlap)
      return { accepted: !0, rect: u, ...S };
    const _ = _t(x, I), G = Yt(_);
    if (G > 0)
      return {
        accepted: S.totalOverlapArea < G,
        rect: u,
        ...S
      };
    const R = St(x, u, I);
    if (S.results.length === 0 && !R)
      return { accepted: !0, rect: u, ...S };
    let T = S;
    if (S.results.length === 0 && R) {
      const d = Ee(
        x,
        u,
        R.entry + (R.exit - R.entry) * 1e-3
      );
      T = l(_t(d, I));
    }
    let L = null;
    if (D === "slide") {
      const d = Ut(
        x,
        { ...x, left: u.left },
        I,
        a
      ), m = Ut(
        x,
        { ...x, top: u.top },
        I,
        a
      ), p = a({
        ...u,
        left: d.left,
        top: m.top
      });
      St(x, p, I) || (L = p);
    }
    return L ?? (L = Ut(x, u, I, a)), {
      accepted: !Cn(L, x),
      rect: L,
      ...T
    };
  }, clearCollisions: () => {
    i.value = [], r.value = !1;
  } };
}
const g = (e, i = 0) => {
  if (e == null || e === "")
    return i;
  const r = typeof e == "string" ? Number(e) : e;
  return Number.isFinite(r) ? r : i;
}, gt = (e, i, r) => Math.min(Math.max(e, i), r), Bn = (e, i) => g(e.left) === g(i.left) && g(e.top) === g(i.top) && g(e.width) === g(i.width) && g(e.height) === g(i.height), Xt = (e) => {
  const i = typeof e == "number" ? e : Number(e ?? 0);
  if (!Number.isFinite(i)) return 0;
  const r = (i % 360 + 360) % 360;
  return r > 180 ? r - 360 : r;
}, Se = (e) => e * Math.PI / 180, ct = (e) => Math.round(e * 1e9) / 1e9, Ln = (e, i) => {
  const r = Xt(i);
  if (r === 0) return { ...e };
  const n = Se(r), l = Math.cos(n), s = Math.sin(n), h = Math.abs(e.width * l) + Math.abs(e.height * s), u = Math.abs(e.width * s) + Math.abs(e.height * l);
  return {
    left: ct(e.left + (e.width - h) / 2),
    top: ct(e.top + (e.height - u) / 2),
    width: ct(h),
    height: ct(u)
  };
}, Me = (e, i, r) => {
  const n = Xt(r);
  if (n === 0) return { x: e, y: i };
  const l = Se(n), s = Math.cos(l), h = Math.sin(l);
  return {
    x: ct(e * s + i * h),
    y: ct(-e * h + i * s)
  };
}, Ae = Symbol("MovableGroupContext"), Fn = 2, at = (e, i = 1) => {
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
const ze = (e, i = 1, r = Fn) => {
  const n = new wn(e).toDecimalPlaces(r).toNumber();
  return at(n, i);
}, ut = (e) => {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Array)
    return e.map((i) => ut(i));
  if (e instanceof Object) {
    const i = {};
    for (const r in e)
      e.hasOwnProperty(r) && (i[r] = ut(e[r]));
    return i;
  }
  return e;
}, Hn = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], kn = At({
  name: "VueMovableBox"
}), Gn = /* @__PURE__ */ At({
  ...kn,
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
    var ce;
    const n = e, l = r, s = (t) => ut(t), h = q(), u = q(s(n.modelValue)), x = s(n.modelValue), I = q(null), a = dn({
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
    rt(
      () => n.modelValue,
      (t) => {
        u.value = s(t);
      },
      { deep: !0 }
    ), rt(
      () => n.active,
      (t) => {
        !t && (a.isDragging || a.isResizing) ? wt() : T(t);
      },
      { flush: "sync" }
    ), rt(
      () => n.disabled,
      (t) => {
        l("disabled", t), t && wt();
      }
    ), rt(
      () => n.initRect,
      (t) => {
        t && wt();
      }
    ), rt(
      () => n.isKeepDecimals,
      (t, o) => {
        !t && o && R({
          ...u.value,
          left: Math.round(g(u.value.left)),
          top: Math.round(g(u.value.top)),
          width: Math.round(g(u.value.width)),
          height: Math.round(g(u.value.height))
        });
      }
    );
    const D = j(() => n.resizable ?? n.resizeable ?? !0), B = j(() => n.unitType === "%"), S = j(() => Xt(n.rotate)), _ = j(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : a.active ? n.theme : n.inActiveColor,
      left: Dt(u.value.left, n.unitType),
      top: Dt(u.value.top, n.unitType),
      width: Dt(u.value.width, n.unitType),
      height: Dt(u.value.height, n.unitType),
      zIndex: u.value.zIndex,
      cursor: n.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: S.value ? `rotate(${S.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: n.transformOrigin,
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : "auto",
      transition: n.enableTransition && !a.isDragging && !a.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), G = j(() => ({
      borderColor: D.value ? n.theme : n.inActiveColor,
      scale: ze(1 / at(n.scale, 1), 1)
    })), R = (t) => {
      const o = s(t);
      return u.value = o, l("update:modelValue", s(o)), o;
    };
    function T(t) {
      a.active !== t && (a.active = t, l(t ? "active" : "inactive", s(u.value)), t || Ct());
    }
    const L = () => {
      var o, c, f;
      let t = null;
      if (n.limitAreaClass)
        try {
          t = document.querySelector(n.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((o = h.value) == null ? void 0 : o.parentElement) ?? null, a.parentWidth = ((c = a.parentElement) == null ? void 0 : c.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, d = (t) => Math.max(0, Number(t) || 0), m = () => {
      const t = d(n.edgeDistance);
      return {
        top: t + d(n.boundsMargin.top),
        right: t + d(n.boundsMargin.right),
        bottom: t + d(n.boundsMargin.bottom),
        left: t + d(n.boundsMargin.left)
      };
    }, p = () => {
      const t = m(), o = B.value ? 100 : a.parentWidth, c = B.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, o - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, c - t.bottom)
      };
    }, M = (t) => {
      const o = p();
      return {
        minLeft: o.minLeft,
        maxLeft: Math.max(o.minLeft, o.maxRight - g(t.width)),
        minTop: o.minTop,
        maxTop: Math.max(o.minTop, o.maxBottom - g(t.height))
      };
    }, y = (t) => ({
      left: g(t.left),
      top: g(t.top),
      width: g(t.width),
      height: g(t.height)
    }), N = (t) => {
      const o = y(t), c = S.value;
      return c ? Ln(o, c) : o;
    }, O = (t) => {
      if (!a.parentElement) return;
      const o = p(), c = N(t), f = c.left, b = c.top, v = f + c.width, w = b + c.height;
      f < o.minLeft && l("out-of-bounds", "left"), v > o.maxRight && l("out-of-bounds", "right"), b < o.minTop && l("out-of-bounds", "top"), w > o.maxBottom && l("out-of-bounds", "bottom");
    }, Y = (t) => {
      if (!n.limitAreaForParent || !a.parentElement) return t;
      const o = N(t), c = M(o), f = gt(o.left, c.minLeft, c.maxLeft), b = gt(o.top, c.minTop, c.maxTop);
      return {
        ...t,
        left: g(t.left) + (f - o.left),
        top: g(t.top) + (b - o.top)
      };
    }, z = fn(Ae, null), F = n.memberId ?? `member-${((ce = pn()) == null ? void 0 : ce.uid) ?? Math.random().toString(36).slice(2)}`;
    let H = !1;
    const V = {
      getRect: () => s(u.value),
      translateTo: (t) => {
        R(t);
      },
      getAreaEdges: () => (L(), a.parentElement ? p() : null)
    };
    hn(() => z == null ? void 0 : z.registerMember(F, V));
    const W = (t) => n.isKeepDecimals ? ze(t, 0, n.decimalPlaces) : Math.round(t), mt = (t, o) => {
      const c = at(n.scale, 1), f = t / (c === 0 ? 1 : c);
      if (!B.value) return W(f);
      const b = o === "horizontal" ? a.parentWidth : a.parentHeight;
      return b > 0 ? W(f / b * 100) : 0;
    }, lt = En(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), J = Sn(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), qt = Nn(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), Jt = J.guides;
    let dt = "clear", ft = "clear", pt = "clear";
    const vt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), bt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Pt = (t) => {
      const o = {
        horizontal: t.points.some((w) => vt.has(w)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((w) => bt.has(w)) ? t.targetIds.vertical : void 0
      }, c = t.snapped ? ut(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: o,
        spacing: c.length > 0 ? c : void 0
      } : { snapped: !1 }, b = JSON.stringify({
        payload: f,
        targetIds: o,
        left: t.points.some((w) => vt.has(w)) ? t.left : void 0,
        top: t.points.some((w) => bt.has(w)) ? t.top : void 0
      });
      b !== dt && ((t.snapped || dt !== "clear") && l("snap", f), dt = t.snapped ? b : "clear");
      const v = JSON.stringify({ guides: t.guides, targetIds: o });
      v !== ft && ((t.snapped || ft !== "clear") && l("guides", ut(t.guides)), ft = t.snapped ? v : "clear");
    }, Ne = (t) => {
      const o = t.dominant, c = o ? {
        colliding: !0,
        direction: o.direction,
        targetId: o.targetId
      } : { colliding: !1 }, f = JSON.stringify(c);
      f !== pt && ((o || pt !== "clear") && l("collision", c), pt = o ? f : "clear");
    }, Ct = () => {
      dt !== "clear" && l("snap", { snapped: !1 }), ft !== "clear" && l("guides", { vertical: [], horizontal: [] }), pt !== "clear" && l("collision", { colliding: !1 }), dt = "clear", ft = "clear", pt = "clear", J.clearGuides(), qt.clearCollisions();
    }, Nt = (t, o, c = "path") => {
      const f = N(t), b = qt.resolveCandidate(
        f,
        N(o),
        n.snapTargets,
        (v) => ({
          left: W(v.left),
          top: W(v.top),
          width: W(v.width),
          height: W(v.height)
        }),
        c
      );
      return Ne(b), b.accepted ? S.value ? {
        ...t,
        left: g(t.left) + (b.rect.left - f.left),
        top: g(t.top) + (b.rect.top - f.top)
      } : { ...t, ...b.rect } : null;
    }, Zt = (t, o, c, f, b) => {
      let v = s(t);
      f.horizontal && (v.left = lt.snapValue(g(t.left))), f.vertical && (v.top = lt.snapValue(g(t.top)));
      let w = {
        ...y(v),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (c) {
        const E = N(v);
        w = J.resolveSnap(E, n.snapTargets, f), v = S.value ? {
          ...v,
          left: g(v.left) + (w.left - E.left),
          top: g(v.top) + (w.top - E.top)
        } : { ...v, left: w.left, top: w.top };
      } else
        J.clearGuides();
      if (b) {
        const E = g(b.left), P = g(b.top);
        n.dragDirections.includes("left") || (v.left = Math.max(E, g(v.left))), n.dragDirections.includes("right") || (v.left = Math.min(E, g(v.left))), n.dragDirections.includes("top") || (v.top = Math.max(P, g(v.top))), n.dragDirections.includes("bottom") || (v.top = Math.min(P, g(v.top)));
      }
      O(v), v = Y(v);
      const k = Nt(v, o, "slide");
      if (!k)
        return Pt({
          ...w,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), J.clearGuides(), null;
      if (v = k, w.snapped) {
        const E = g(v.left) !== w.left, P = g(v.top) !== w.top, C = w.points.filter((A) => vt.has(A) ? !E : bt.has(A) ? !P : !1), K = C.some((A) => vt.has(A)), Z = C.some((A) => bt.has(A)), X = w.spacing.filter(
          (A) => A.axis === "horizontal" ? !E : !P
        ), $ = {
          vertical: X.flatMap((A) => A.axis === "horizontal" ? A.guides : []),
          horizontal: X.flatMap((A) => A.axis === "vertical" ? A.guides : [])
        };
        w = {
          ...w,
          left: g(v.left),
          top: g(v.top),
          snapped: C.length > 0 || X.length > 0,
          snapPoint: C[0],
          points: C,
          targetId: K ? w.targetIds.horizontal : Z ? w.targetIds.vertical : void 0,
          targetIds: {
            horizontal: K ? w.targetIds.horizontal : void 0,
            vertical: Z ? w.targetIds.vertical : void 0
          },
          guides: {
            vertical: K ? w.guides.vertical : $.vertical,
            horizontal: Z ? w.guides.horizontal : $.horizontal
          },
          spacing: X
        }, w.snapped ? J.setGuides(w.guides) : J.clearGuides();
      }
      return Pt(w), v;
    }, Bt = (t) => n.resizeDirections.includes(t), Qt = (t, o, c, f) => {
      const b = g(t.left), v = g(t.top), w = g(t.width), k = g(t.height);
      let E = b, P = b + w, C = v, K = v + k;
      o.includes("l") && (E += c), o.includes("r") && (P += c), o.includes("t") && (C += f), o.includes("b") && (K += f);
      const Z = (E + P) / 2, X = (C + K) / 2;
      let $ = Math.max(0, P - E), A = Math.max(0, K - C);
      const st = w > 0 && k > 0 ? w / k : 1, Gt = (nt) => {
        $ = nt, o.includes("l") ? E = P - $ : o.includes("r") ? P = E + $ : (E = Z - $ / 2, P = Z + $ / 2);
      }, Ot = (nt) => {
        A = nt, o.includes("t") ? C = K - A : o.includes("b") ? K = C + A : (C = X - A / 2, K = X + A / 2);
      };
      if (n.ratioLock) {
        const nt = Math.abs($ - w), un = Math.abs(A - k) * st;
        o === "tm" || o === "bm" || un > nt ? Gt(A * st) : Ot($ / st);
      }
      const Q = p(), ue = n.limitAreaForParent && !!a.parentElement, rn = ue ? o.includes("l") ? Math.max(0, P - Q.minLeft) : o.includes("r") ? Math.max(0, Q.maxRight - E) : Math.max(
        0,
        2 * Math.min(Z - Q.minLeft, Q.maxRight - Z)
      ) : 1 / 0, cn = ue ? o.includes("t") ? Math.max(0, K - Q.minTop) : o.includes("b") ? Math.max(0, Q.maxBottom - C) : Math.max(
        0,
        2 * Math.min(X - Q.minTop, Q.maxBottom - X)
      ) : 1 / 0, de = Math.max(0, at(n.minWidth, 0)), fe = Math.max(0, at(n.minHeight, 0)), pe = at(n.maxWidth, 1 / 0), he = at(n.maxHeight, 1 / 0);
      let ht = Math.min(pe > 0 ? pe : 1 / 0, rn), Wt = Math.min(he > 0 ? he : 1 / 0, cn);
      if (n.ratioLock) {
        ht = Math.min(ht, Wt * st);
        const nt = Math.max(de, fe * st);
        Gt(gt($, nt, ht)), Ot($ / st);
      } else
        Gt(gt($, Math.min(de, ht), ht)), Ot(gt(A, Math.min(fe, Wt), Wt));
      return {
        ...t,
        left: W(E),
        top: W(C),
        width: W(P - E),
        height: W(K - C)
      };
    };
    let U = null, tt = null;
    const jt = (t) => {
      if (n.disabled || n.initRect || !a.isDragging && !a.isResizing) return;
      const o = mt(t.clientX - a.initX, "horizontal"), c = mt(t.clientY - a.initY, "vertical"), f = s(u.value);
      if (a.isDragging) {
        const b = a.beforeInteraction;
        let v = g(b.left) + o, w = g(b.top) + c;
        const k = {
          horizontal: o < 0 && n.dragDirections.includes("left") || o > 0 && n.dragDirections.includes("right"),
          vertical: c < 0 && n.dragDirections.includes("top") || c > 0 && n.dragDirections.includes("bottom")
        };
        k.horizontal || (v = g(b.left)), k.vertical || (w = g(b.top));
        const E = {
          ...b,
          left: W(v),
          top: W(w)
        };
        let P = Zt(E, f, n.snapToElements, k, b);
        if (P && H && (P = (z == null ? void 0 : z.constrainPosition(F, P)) ?? null), P) {
          const C = R(P);
          l("move", s(C)), l("drag", s(C)), H && (z == null || z.notifyMoved(F, s(C)));
        }
      }
      if (a.isResizing && a.handle) {
        Pt({
          ...y(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), J.clearGuides();
        const b = Me(o, c, S.value), v = Qt(a.beforeInteraction, a.handle, b.x, b.y);
        O(v);
        const w = Nt(v, f);
        if (w) {
          const k = R(w);
          l("resize", s(k));
        }
      }
    }, Be = (t) => {
      !a.active || n.disabled || n.initRect || (tt = t, U === null && (U = requestAnimationFrame(() => {
        U = null;
        const o = tt;
        tt = null, o && jt(o);
      })));
    }, yt = (t) => a.pointerId === null || t.pointerId === a.pointerId, te = (t) => {
      yt(t) && Be(t);
    }, ee = (t) => {
      yt(t) && We(t);
    }, ne = (t) => {
      yt(t) && It(t);
    }, ie = (t) => {
      yt(t) && (a.isDragging || a.isResizing) && It(t);
    }, Le = () => {
      const t = a.eventElement;
      if (!t) return;
      const o = { passive: !1 };
      Tt(t, "pointermove", te, o), Tt(t, "pointerup", ee, o), Tt(t, "pointercancel", ne, o);
      const c = h.value;
      c && Tt(c, "lostpointercapture", ie, o);
    }, Fe = () => {
      const t = a.eventElement;
      if (!t) return;
      Et(t, "pointermove", te, !1), Et(t, "pointerup", ee, !1), Et(t, "pointercancel", ne, !1);
      const o = h.value;
      o && Et(o, "lostpointercapture", ie, !1), a.eventElement = null;
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
    function Lt() {
      U !== null && (cancelAnimationFrame(U), U = null), tt = null;
    }
    function Ft() {
      a.isDragging = !1, a.isResizing = !1, a.handle = null, H = !1, Fe(), ke();
    }
    function oe() {
      Ct(), n.active || T(!1);
    }
    function ae() {
      Ft(), oe();
    }
    function wt() {
      Lt(), H && (z == null || z.abortDrag(F)), ae();
    }
    function It(t = null) {
      const o = a.isDragging, c = a.isResizing, f = H;
      if (Lt(), Ft(), o || c) {
        const b = s(a.beforeInteraction);
        R(b), l(o ? "drag-cancel" : "resize-cancel", t, b, s(b)), o && f && (z == null || z.cancelDrag(F, t));
      }
      oe();
    }
    function le() {
      wt(), T(!1);
    }
    const Ge = (t, o) => {
      var f, b;
      if (n.disabled || n.initRect || a.isDragging || a.isResizing || o && (!D.value || !Bt(o)) || !o && !n.draggable) return;
      const c = s(u.value);
      if (o) {
        if (((f = n.canResize) == null ? void 0 : f.call(n, c, o)) === !1) return;
      } else if (((b = n.canDrag) == null ? void 0 : b.call(n, c)) === !1)
        return;
      H = !o && z !== null, H && (z == null || z.beginDrag(F, t)), L(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = s(u.value), a.handle = o, a.isDragging = !o, a.isResizing = !!o, T(!0), a.isDragging && l("drag-start", t, s(a.beforeInteraction)), a.isResizing && l("resize-start", t, s(a.beforeInteraction)), a.eventElement = document.documentElement, Le(), He();
    }, Oe = (t) => {
      if (!(t instanceof Element)) return !0;
      const o = h.value;
      if (!o) return !0;
      const c = (f) => {
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
      if (n.dragCancel) {
        const f = c(n.dragCancel);
        if (!f.valid || f.matched) return !1;
      }
      if (n.dragHandle) {
        const f = c(n.dragHandle);
        return f.valid && f.matched;
      }
      return !0;
    }, se = (t, o) => {
      !t.isPrimary || t.button !== 0 || !o && !Oe(t.target) || Ge(t, o);
    };
    function We(t) {
      U !== null && (cancelAnimationFrame(U), U = null), tt && (jt(tt), tt = null), a.isDragging && (l("drag-stop", t, s(a.beforeInteraction), s(u.value)), H && (z == null || z.endDrag(F, t))), a.isResizing && l("resize-stop", t, s(a.beforeInteraction), s(u.value)), ae();
    }
    const $e = (t, o) => {
      var v;
      L();
      const c = s(u.value);
      if (((v = n.canDrag) == null ? void 0 : v.call(n, s(c))) === !1) return;
      const f = s(c);
      t === "left" && (f.left = g(f.left) - o), t === "right" && (f.left = g(f.left) + o), t === "top" && (f.top = g(f.top) - o), t === "bottom" && (f.top = g(f.top) + o);
      const b = Zt(f, c, n.snapToElements, {
        horizontal: t === "left" || t === "right",
        vertical: t === "top" || t === "bottom"
      }, c);
      if (b) {
        const w = R(b);
        l("move", s(w));
      }
    }, Ve = (t, o, c) => {
      var C;
      if (!D.value || !Bt(t)) return;
      L();
      const f = s(u.value);
      if (((C = n.canResize) == null ? void 0 : C.call(n, s(f), t)) === !1) return;
      const b = o === "left" ? -c : o === "right" ? c : 0, v = o === "top" ? -c : o === "bottom" ? c : 0, w = Me(b, v, S.value), k = Qt(f, t, w.x, w.y);
      O(k);
      const E = Nt(k, f);
      if (!E || Bn(E, f)) return;
      const P = R(E);
      l("resize", s(P));
    }, Ke = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, _e = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), et = (t) => _e.has(t), Ye = (t) => et(t) ? "group" : "separator", Ue = (t) => et(t) ? "two-axis resize handle" : void 0, Xe = (t) => `Resize ${Ke[t]}`, qe = (t) => {
      if (!et(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, xt = (t) => t === "ml" || t === "mr", re = (t) => {
      if (!et(t))
        return g(
          xt(t) ? u.value.width : u.value.height
        );
    }, Je = (t) => {
      if (!et(t))
        return g(xt(t) ? n.minWidth : n.minHeight);
    }, Ze = (t) => {
      if (et(t)) return;
      const o = xt(t) ? n.maxWidth : n.maxHeight;
      if (o === void 0) return;
      const c = g(o);
      return Number.isFinite(c) ? c : void 0;
    }, Qe = (t) => {
      const o = re(t);
      if (o !== void 0)
        return n.unitType === "%" ? `${o} percent` : `${o} pixels`;
    }, je = (t) => {
      if (n.keyboardEnabled)
        return et(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : xt(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, tn = (t) => {
      t.target === h.value && n.keyboardEnabled && !n.disabled && !n.initRect && T(!0);
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
      const o = t.target, c = h.value;
      if (!(o instanceof Element) || !c || o === c || o.closest(".handle")) return !1;
      const f = o.closest(en);
      return f !== null && f !== c && c.contains(f);
    }, on = zn(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: a.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: I.value,
        interacting: a.isDragging || a.isResizing
      }),
      {
        move: $e,
        resize: Ve,
        deactivate: le,
        cancel: (t) => It(t)
      }
    ), an = (t) => {
      nn(t) || on.handleKeyDown(t);
    }, Ht = (t) => B.value ? t / 100 * a.parentWidth : t, kt = (t) => B.value ? t / 100 * a.parentHeight : t, ln = (t) => ({
      left: `${Ht(t) - Ht(g(u.value.left))}px`,
      top: `${-kt(g(u.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: n.theme
    }), sn = (t) => ({
      top: `${kt(t) - kt(g(u.value.top))}px`,
      left: `${-Ht(g(u.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: n.theme
    });
    return i({
      getConfig: () => s(u.value),
      setPosition: (t, o) => R({ ...u.value, left: t, top: o }),
      setSize: (t, o) => R({ ...u.value, width: t, height: o }),
      reset: () => R(s(x)),
      activate: () => T(!0),
      deactivate: le,
      cancelInteraction: (t = null) => It(t)
    }), gn(() => {
      Lt(), Ft(), z == null || z.unregisterMember(F), Ct();
    }), (t, o) => (it(), ot("div", {
      ref_key: "movableRef",
      ref: h,
      class: ge(["auto-draggable", {
        "select-none": e.disabledUserSelect,
        "is-disabled": e.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-readonly": e.initRect
      }]),
      style: Mt(_.value),
      tabindex: "0",
      onPointerdown: o[1] || (o[1] = (c) => se(c, null)),
      onDblclick: o[2] || (o[2] = (c) => l("dblclick", c)),
      onFocus: tn,
      onKeydown: an
    }, [
      (it(!0), ot($t, null, Vt(me(Jt).vertical, (c, f) => (it(), ot("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: Mt(ln(c))
      }, null, 4))), 128)),
      (it(!0), ot($t, null, Vt(me(Jt).horizontal, (c, f) => (it(), ot("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: Mt(sn(c))
      }, null, 4))), 128)),
      (it(!0), ot($t, null, Vt(e.handles, (c) => mn((it(), ot("div", {
        key: c,
        class: ge(["handle", `handle-${c}`]),
        style: Mt(G.value),
        role: Ye(c),
        "aria-roledescription": Ue(c),
        "aria-orientation": qe(c),
        "aria-label": Xe(c),
        "aria-valuenow": re(c),
        "aria-valuemin": Je(c),
        "aria-valuemax": Ze(c),
        "aria-valuetext": Qe(c),
        "aria-keyshortcuts": je(c),
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: vn((f) => se(f, c), ["stop", "prevent"]),
        onFocus: (f) => I.value = c,
        onBlur: o[0] || (o[0] = (f) => I.value = null)
      }, null, 46, Hn)), [
        [bn, a.active && D.value && !e.disabled && Bt(c)]
      ])), 128)),
      Re(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), On = (e, i) => {
  const r = e.__vccOpts || e;
  for (const [n, l] of i)
    r[n] = l;
  return r;
}, Wn = /* @__PURE__ */ On(Gn, [["__scopeId", "data-v-7a508563"]]), $n = At({
  name: "MovableGroup"
}), Vn = /* @__PURE__ */ At({
  ...$n,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(e, { expose: i, emit: r }) {
    const n = e, l = r, s = /* @__PURE__ */ new Map(), h = q([]), u = q(null), x = j(() => n.selected !== void 0), I = j({
      get: () => x.value ? n.selected ?? [] : h.value,
      set: (d) => {
        h.value = d, l("update:selected", d);
      }
    });
    rt(
      () => n.selected,
      (d) => {
        d !== void 0 && (h.value = [...d]);
      },
      { immediate: !0 }
    );
    const a = (d) => ut(d), D = (d) => {
      const m = typeof d == "number" ? d : Number(d);
      return Number.isFinite(m) ? m : 0;
    }, B = (d, m, p) => ({
      ...d,
      left: D(d.left) + m,
      top: D(d.top) + p
    }), S = (d) => d.reduce(
      (m, p) => ({
        minLeft: Math.min(m.minLeft, D(p.left)),
        minTop: Math.min(m.minTop, D(p.top)),
        maxRight: Math.max(m.maxRight, D(p.left) + D(p.width)),
        maxBottom: Math.max(m.maxBottom, D(p.top) + D(p.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), _ = (d, m, p) => {
      const M = S([...d.values()]);
      return {
        left: Math.min(
          Math.max(m.left, p.minLeft - M.minLeft),
          p.maxRight - M.maxRight
        ),
        top: Math.min(
          Math.max(m.top, p.minTop - M.minTop),
          p.maxBottom - M.maxBottom
        )
      };
    }, G = (d) => {
      const m = [];
      for (const [p, M] of d) {
        const y = s.get(p);
        y && m.push({ id: p, rect: a(y.getRect()), startRect: a(M) });
      }
      return m;
    }, R = (d) => d.map(({ id: m, rect: p }) => ({ id: m, rect: p })), T = (d) => {
      const m = d.filter((M) => s.has(M)), p = I.value;
      p.length === m.length && p.every((M, y) => M === m[y]) || (I.value = m);
    };
    return yn(Ae, {
      registerMember: (d, m) => {
        s.set(d, m);
      },
      unregisterMember: (d) => {
        var m;
        if (s.delete(d), ((m = u.value) == null ? void 0 : m.leaderId) === d) {
          u.value = null;
          return;
        }
        u.value && u.value.startRects.delete(d), I.value.includes(d) && T(I.value.filter((p) => p !== d));
      },
      beginDrag: (d, m) => {
        if (!s.has(d)) return;
        I.value.includes(d) || T([d]);
        const p = /* @__PURE__ */ new Map();
        for (const y of I.value) {
          const N = s.get(y);
          N && p.set(y, a(N.getRect()));
        }
        u.value = { leaderId: d, startRects: p };
        const M = [];
        for (const [y, N] of p) M.push({ id: y, rect: a(N) });
        l("move-start", { leaderId: d, source: m, rects: M });
      },
      constrainPosition: (d, m) => {
        var Y, z;
        const p = u.value, M = p == null ? void 0 : p.startRects.get(d);
        if (!p || !M || !s.has(d)) return m;
        let y = D(m.left) - D(M.left), N = D(m.top) - D(M.top);
        if (n.sharedBounds) {
          const F = (Y = s.get(d)) == null ? void 0 : Y.getAreaEdges();
          if (F) {
            const H = _(p.startRects, { left: y, top: N }, F);
            y = H.left, N = H.top;
          }
        }
        const O = { left: y, top: N };
        for (const [F, H] of p.startRects)
          F !== d && ((z = s.get(F)) == null || z.translateTo(B(H, O.left, O.top)));
        return B(M, O.left, O.top);
      },
      notifyMoved: (d, m) => {
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        const M = R(G(p.startRects)).map(
          (y) => y.id === d ? { id: d, rect: a(m) } : y
        );
        l("move", { leaderId: d, rects: M });
      },
      endDrag: (d, m) => {
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        const M = G(p.startRects);
        u.value = null, l("move-stop", { leaderId: d, source: m, rects: M });
      },
      cancelDrag: (d, m) => {
        var y;
        const p = u.value;
        if (!p || p.leaderId !== d) return;
        for (const [N, O] of p.startRects)
          N !== d && ((y = s.get(N)) == null || y.translateTo(a(O)));
        const M = G(p.startRects);
        u.value = null, l("move-cancel", { leaderId: d, source: m, rects: M });
      },
      abortDrag: (d) => {
        var m;
        ((m = u.value) == null ? void 0 : m.leaderId) === d && (u.value = null);
      }
    }), i({
      getSelected: () => [...I.value],
      select: (d) => T(d ?? [...s.keys()]),
      getMemberRects: () => [...s.entries()].map(([d, m]) => ({ id: d, rect: a(m.getRect()) }))
    }), (d, m) => Re(d.$slots, "default");
  }
}), Pe = "VueMovableBox", Ce = (e) => {
  e.component(Pe, Wn), e.component("MovableGroup", Vn);
}, Yn = {
  name: Pe,
  version: "3.0.0",
  install: Ce
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Ce });
export {
  Wn as MovableBox,
  Vn as MovableGroup,
  Yn as default,
  Pe as name
};
