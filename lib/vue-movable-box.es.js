import { computed as st, ref as lt, defineComponent as ce, reactive as fo, watch as Nt, inject as ho, getCurrentInstance as po, onMounted as mo, onUnmounted as go, openBlock as Pt, createElementBlock as Et, normalizeStyle as kt, normalizeClass as dn, Fragment as Me, renderList as xe, unref as hn, withDirectives as we, createElementVNode as Ie, vShow as Re, withModifiers as pn, renderSlot as Rn, provide as vo } from "vue";
import bo from "decimal.js";
const yo = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, Mo = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, xo = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, zn = (e) => Number.isFinite(e) && e > 0 ? e : 1;
function wo(e, o) {
  return { handleKeyDown: (n) => {
    const r = e(), l = r.interacting;
    if (!l && (!r.enabled || r.disabled || !r.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), l ? o.cancel(n) : o.deactivate();
      return;
    }
    if (l || r.readOnly) return;
    const v = yo[n.key];
    if (!v) return;
    const u = zn(r.step);
    if (r.focusedHandle && r.resizeDirections.includes(r.focusedHandle)) {
      if (!Mo[r.focusedHandle].includes(v)) return;
      n.preventDefault(), o.resize(
        r.focusedHandle,
        n.shiftKey ? xo[v] : v,
        u
      );
      return;
    }
    if (n.shiftKey) {
      const I = r.resizeDirections.includes("br") ? "br" : r.resizeDirections[0];
      if (!I) return;
      n.preventDefault(), o.resize(I, v, u);
      return;
    }
    r.dragDirections.includes(v) && (n.preventDefault(), o.move(v, u));
  } };
}
const ae = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const o = Number(e);
  return Number.isFinite(o) ? o : null;
}, Io = (e) => {
  const o = ae(e.left), s = ae(e.top), n = ae(e.width), r = ae(e.height);
  return o === null || s === null || n === null || r === null || n < 0 || r < 0 ? null : { left: o, top: s, width: n, height: r };
};
function Ro(e, o) {
  const s = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(e / s) * s;
}
const mn = (e, o, s) => o.distance > s ? e : !e || o.distance < e.distance ? o : e, An = ["alignment", "spacing"], gn = (e, o, s, n, r) => {
  const l = r.length > 0 ? r : An;
  for (const v of l) {
    const u = v === "alignment" ? o : s;
    if (u && u.distance <= n) {
      if (v === "alignment") {
        const x = u;
        return {
          candidate: x,
          spacing: null,
          guides: [x.guide],
          spacingInfo: null,
          value: x.value
        };
      }
      const I = u;
      return {
        candidate: null,
        spacing: I,
        guides: I.guides,
        spacingInfo: {
          axis: e,
          gap: I.gap,
          targetIds: I.targetIds,
          guides: I.guides
        },
        value: I.value
      };
    }
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, vn = (e, o, s, n, r) => {
  const l = (w) => e === "horizontal" ? w.left : w.top, v = (w) => e === "horizontal" ? w.left + w.width : w.top + w.height, u = [], I = [];
  for (const w of r)
    v(w.rect) <= o && u.push(w), l(w.rect) >= o + s && I.push(w);
  let x = null;
  for (const w of u)
    for (const _ of I) {
      const a = l(_.rect) - v(w.rect) - s;
      if (a < 0) continue;
      const F = a / 2, K = v(w.rect) + F, E = Math.abs(o - K);
      E > n || (!x || E < x.distance) && (x = {
        distance: E,
        value: K,
        gap: F,
        guides: [v(w.rect), l(_.rect)],
        targetIds: [w.id, _.id]
      });
    }
  return x;
};
function zo(e, o, s = 10, n = { horizontal: !0, vertical: !0 }, r = {}) {
  const l = Math.max(0, Number.isFinite(s) ? s : 10), v = e.left + e.width, u = e.top + e.height, I = e.left + e.width / 2, x = e.top + e.height / 2, w = r.priority ?? An, _ = (z, R) => r.filter ? r.filter(z, R) !== !1 : !0;
  let a = null, F = null;
  const K = [], E = [];
  for (const z of o) {
    const R = Io(z);
    if (!R) continue;
    const $ = n.horizontal && _(z, "horizontal"), gt = n.vertical && _(z, "vertical");
    if ($ && K.push({ rect: R, id: z.id }), gt && E.push({ rect: R, id: z.id }), !$ && !gt) continue;
    const Z = R.left + R.width, X = R.top + R.height, q = R.left + R.width / 2, tt = R.top + R.height / 2, O = z.id, et = [
      {
        distance: Math.abs(e.left - R.left),
        value: R.left,
        guide: R.left,
        point: "left",
        targetId: O
      },
      {
        distance: Math.abs(v - Z),
        value: Z - e.width,
        guide: Z,
        point: "right",
        targetId: O
      },
      {
        distance: Math.abs(e.left - Z),
        value: Z,
        guide: Z,
        point: "left",
        targetId: O
      },
      {
        distance: Math.abs(v - R.left),
        value: R.left - e.width,
        guide: R.left,
        point: "right",
        targetId: O
      },
      {
        distance: Math.abs(I - q),
        value: q - e.width / 2,
        guide: q,
        point: "center-x",
        targetId: O
      }
    ], Rt = [
      {
        distance: Math.abs(e.top - R.top),
        value: R.top,
        guide: R.top,
        point: "top",
        targetId: O
      },
      {
        distance: Math.abs(u - X),
        value: X - e.height,
        guide: X,
        point: "bottom",
        targetId: O
      },
      {
        distance: Math.abs(e.top - X),
        value: X,
        guide: X,
        point: "top",
        targetId: O
      },
      {
        distance: Math.abs(u - R.top),
        value: R.top - e.height,
        guide: R.top,
        point: "bottom",
        targetId: O
      },
      {
        distance: Math.abs(x - tt),
        value: tt - e.height / 2,
        guide: tt,
        point: "center-y",
        targetId: O
      }
    ];
    if ($)
      for (const ut of et) a = mn(a, ut, l);
    if (gt)
      for (const ut of Rt) F = mn(F, ut, l);
  }
  const k = n.horizontal ? gn(
    "horizontal",
    a,
    vn(
      "horizontal",
      e.left,
      e.width,
      l,
      K
    ),
    l,
    w
  ) : null, Y = n.vertical ? gn(
    "vertical",
    F,
    vn("vertical", e.top, e.height, l, E),
    l,
    w
  ) : null, d = (k == null ? void 0 : k.candidate) ?? null, M = (Y == null ? void 0 : Y.candidate) ?? null, y = [d == null ? void 0 : d.point, M == null ? void 0 : M.point].filter(
    (z) => !!z
  ), A = [k == null ? void 0 : k.spacingInfo, Y == null ? void 0 : Y.spacingInfo].filter(
    (z) => !!z
  );
  return {
    left: (k == null ? void 0 : k.value) ?? e.left,
    top: (Y == null ? void 0 : Y.value) ?? e.top,
    snapped: y.length > 0 || A.length > 0,
    snapPoint: y[0],
    points: y,
    targetId: (d == null ? void 0 : d.targetId) ?? (M == null ? void 0 : M.targetId),
    targetIds: { horizontal: d == null ? void 0 : d.targetId, vertical: M == null ? void 0 : M.targetId },
    guides: {
      vertical: (k == null ? void 0 : k.guides) ?? [],
      horizontal: (Y == null ? void 0 : Y.guides) ?? []
    },
    spacing: A
  };
}
function Ao(e) {
  const o = (r) => {
    const l = e();
    return l.snapToGrid ? Ro(r, l.gridSize) : r;
  }, s = (r, l) => ({
    left: o(r),
    top: o(l)
  }), n = st(() => {
    const r = e();
    return r.snapToGrid ? {
      size: Number.isFinite(r.gridSize) && r.gridSize > 0 ? r.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: s, gridInfo: n };
}
const ze = () => ({ vertical: [], horizontal: [] });
function So(e) {
  const o = lt(ze()), s = lt(null);
  return { guides: o, lastSnapResult: s, resolveSnap: (v, u, I) => {
    const x = e(), w = x.enabled ? zo(v, u, x.threshold, I, {
      filter: x.filter,
      priority: x.priority
    }) : {
      ...v,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: ze(),
      spacing: []
    };
    return o.value = w.guides, s.value = w.snapped ? w : null, w;
  }, clearGuides: () => {
    o.value = ze(), s.value = null;
  }, setGuides: (v) => {
    o.value = v;
  } };
}
const re = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const o = Number(e);
  return Number.isFinite(o) ? o : null;
}, Sn = (e) => {
  const o = re(e.left), s = re(e.top), n = re(e.width), r = re(e.height);
  return o === null || s === null || n === null || r === null || n < 0 || r < 0 ? null : { left: o, top: s, width: n, height: r };
}, bn = (e, o, s, n) => {
  const r = s - o;
  if (r === 0) return o < n ? e : null;
  const l = (n - o) / r;
  return r > 0 ? { ...e, exit: Math.min(e.exit, l) } : { ...e, entry: Math.max(e.entry, l) };
}, yn = (e, o, s, n) => {
  const r = s - o;
  if (r === 0) return o > n ? e : null;
  const l = (n - o) / r;
  return r > 0 ? { ...e, entry: Math.max(e.entry, l) } : { ...e, exit: Math.min(e.exit, l) };
}, Do = (e, o, s) => {
  let n = { entry: 0, exit: 1 };
  if (n = bn(n, e.left, o.left, s.left + s.width), !n || (n = yn(
    n,
    e.left + e.width,
    o.left + o.width,
    s.left
  ), !n) || (n = bn(n, e.top, o.top, s.top + s.height), !n) || (n = yn(
    n,
    e.top + e.height,
    o.top + o.height,
    s.top
  ), !n)) return null;
  const r = Math.max(0, n.entry), l = Math.min(1, n.exit);
  return r < l && l > 0 && r < 1 ? { entry: r, exit: l } : null;
};
function le(e, o, s) {
  let n = null;
  for (const r of s) {
    const l = Sn(r);
    if (!l) continue;
    const v = Do(e, o, l);
    v && (!n || v.entry < n.entry) && (n = v);
  }
  return n;
}
function To(e, o) {
  const s = Math.min(e.left + e.width, o.left + o.width) - Math.max(e.left, o.left), n = Math.min(e.top + e.height, o.top + o.height) - Math.max(e.top, o.top);
  if (s <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const r = e.left + e.width / 2, l = e.top + e.height / 2, v = o.left + o.width / 2, u = o.top + o.height / 2, I = r - v, x = l - u;
  return {
    colliding: !0,
    direction: s <= n ? I > 0 ? "right" : "left" : x > 0 ? "bottom" : "top",
    overlap: Math.min(s, n),
    overlapArea: s * n
  };
}
function Ae(e, o, s) {
  const n = [];
  for (const r of o) {
    const l = Sn(r);
    if (!l) continue;
    const v = To(e, l);
    v.colliding && n.push({ ...v, targetId: r.id });
  }
  return n;
}
function Mn(e) {
  let o = null;
  for (const s of e)
    (!o || (s.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = s);
  return o;
}
const Se = (e) => e.reduce((o, s) => o + (s.overlapArea ?? 0), 0), Dn = (e, o, s) => ({
  left: e.left + (o.left - e.left) * s,
  top: e.top + (o.top - e.top) * s,
  width: e.width + (o.width - e.width) * s,
  height: e.height + (o.height - e.height) * s
}), Po = (e, o) => e.left === o.left && e.top === o.top && e.width === o.width && e.height === o.height, De = (e, o, s, n) => {
  if (!le(e, o, s))
    return { rect: o, progress: 1 };
  let r = 0, l = 1, v = e;
  for (let u = 0; u < 24; u += 1) {
    const I = (r + l) / 2, x = n(Dn(e, o, I));
    le(e, x, s) ? l = I : (v = x, r = I);
  }
  return { rect: v, progress: r };
};
function Eo(e) {
  const o = lt([]), s = lt(!1), n = (u, I) => {
    const w = e().enabled ? Ae(u, I) : [];
    return o.value = w, s.value = w.length > 0, {
      results: w,
      dominant: Mn(w),
      totalOverlapArea: Se(w)
    };
  }, r = (u) => (o.value = u, s.value = u.length > 0, {
    results: u,
    dominant: Mn(u),
    totalOverlapArea: Se(u)
  });
  return { collisions: o, isColliding: s, evaluate: n, resolveCandidate: (u, I, x, w = (a) => a, _ = "path") => {
    const a = e(), F = n(u, x);
    if (!a.enabled || a.allowOverlap)
      return { accepted: !0, rect: u, progress: 1, ...F };
    const K = Ae(I, x), E = Se(K);
    if (E > 0)
      return {
        accepted: F.totalOverlapArea < E,
        rect: u,
        progress: 1,
        ...F
      };
    const k = le(I, u, x);
    if (F.results.length === 0 && !k)
      return { accepted: !0, rect: u, progress: 1, ...F };
    let Y = F;
    if (F.results.length === 0 && k) {
      const M = Dn(
        I,
        u,
        k.entry + (k.exit - k.entry) * 1e-3
      );
      Y = r(Ae(M, x));
    }
    let d = null;
    if (_ === "slide") {
      const M = De(
        I,
        { ...I, left: u.left },
        x,
        w
      ), y = De(
        I,
        { ...I, top: u.top },
        x,
        w
      ), A = w({
        ...u,
        left: M.rect.left,
        top: y.rect.top
      });
      le(I, A, x) || (d = { rect: A });
    }
    return d ?? (d = De(I, u, x, w)), {
      accepted: !Po(d.rect, I),
      rect: d.rect,
      progress: d.progress,
      ...Y
    };
  }, clearCollisions: () => {
    o.value = [], s.value = !1;
  } };
}
const m = (e, o = 0) => {
  if (e == null || e === "")
    return o;
  const s = typeof e == "string" ? Number(e) : e;
  return Number.isFinite(s) ? s : o;
}, It = (e, o, s) => Math.min(Math.max(e, o), s), No = (e, o) => m(e.left) === m(o.left) && m(e.top) === m(o.top) && m(e.width) === m(o.width) && m(e.height) === m(o.height), mt = (e) => {
  const o = typeof e == "number" ? e : Number(e ?? 0);
  if (!Number.isFinite(o)) return 0;
  const s = (o % 360 + 360) % 360;
  return s > 180 ? s - 360 : s;
}, Zt = (e) => e * Math.PI / 180, ct = (e) => Math.round(e * 1e9) / 1e9, Oo = (e, o) => {
  const s = mt(o);
  if (s === 0) return { ...e };
  const n = Zt(s), r = Math.cos(n), l = Math.sin(n), v = Math.abs(e.width * r) + Math.abs(e.height * l), u = Math.abs(e.width * l) + Math.abs(e.height * r);
  return {
    left: ct(e.left + (e.width - v) / 2),
    top: ct(e.top + (e.height - u) / 2),
    width: ct(v),
    height: ct(u)
  };
}, Lo = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), Tn = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, Pn = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, xn = /* @__PURE__ */ new Set(["left", "right"]), Te = /* @__PURE__ */ new Set(["top", "bottom"]), Pe = (e) => Tn.test(e) || Pn.test(e), Bo = (e, o) => Pe(e) || xn.has(e) ? Pe(o) || o === "center" || Te.has(o) : Te.has(e) ? o === "center" || xn.has(o) : e === "center", En = (e) => {
  if (!e) return "center";
  const o = e.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => Lo.has(n) || Tn.test(n) || Pn.test(n)
  ) || o.length === 2 && !Bo(o[0], o[1]) ? "center" : o.join(" ");
}, wn = (e, o, s) => {
  const n = { x: o / 2, y: s / 2 }, l = En(e).split(" ");
  let v = null, u = null;
  const I = (x) => {
    v === null ? v = x : u === null && (u = x);
  };
  for (const x of l)
    if (x === "left") v = 0;
    else if (x === "right") v = o;
    else if (x === "top") u = 0;
    else if (x === "bottom") u = s;
    else if (x === "center") I(v === null ? o / 2 : s / 2);
    else if (x.endsWith("%")) {
      const w = Number(x.slice(0, -1));
      if (!Number.isFinite(w)) return n;
      I(w / 100 * (v === null ? o : s));
    } else {
      const w = Number.parseFloat(x);
      if (!Number.isFinite(w)) return n;
      I(w);
    }
  return { x: v ?? o / 2, y: u ?? s / 2 };
}, Ho = (e, o, s) => {
  const n = Oo(e, o), r = mt(o);
  if (r === 0) return n;
  const l = Zt(r), v = Math.cos(l), u = Math.sin(l), I = e.width / 2 - s.x, x = e.height / 2 - s.y, w = ct(I * v - x * u - I), _ = ct(I * u + x * v - x);
  return {
    left: ct(n.left + w),
    top: ct(n.top + _),
    width: n.width,
    height: n.height
  };
}, In = (e, o, s) => {
  const n = mt(s);
  if (n === 0) return { x: e, y: o };
  const r = Zt(n), l = Math.cos(r), v = Math.sin(r);
  return {
    x: ct(e * l + o * v),
    y: ct(-e * v + o * l)
  };
}, Nn = Symbol("MovableGroupContext"), Co = 2, ot = (e, o = 1) => {
  if (e == null || e === "")
    return o;
  const s = typeof e == "string" ? parseFloat(e) : e;
  return isNaN(s) ? o : s;
}, se = (e, o = "px") => e == null || e === "" ? "0" : `${e}${o}`;
function _t(e, o, s, n) {
  e && e.addEventListener(o, s, n);
}
function qt(e, o, s, n) {
  e && e.removeEventListener(o, s, n);
}
const Ee = (e, o = 1, s = Co) => {
  const n = new bo(e).toDecimalPlaces(s).toNumber();
  return ot(n, o);
}, Ft = (e) => {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Array)
    return e.map((o) => Ft(o));
  if (e instanceof Object) {
    const o = {};
    for (const s in e)
      e.hasOwnProperty(s) && (o[s] = Ft(e[s]));
    return o;
  }
  return e;
}, ko = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], Fo = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Wo = ce({
  name: "VueMovableBox"
}), Go = /* @__PURE__ */ ce({
  ...Wo,
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
    /** Shows an interactive rotation handle while the box is active. */
    rotatable: { type: Boolean, default: !1 },
    /** Visual distance in pixels between the box and the rotation handle. */
    rotationHandleOffset: { type: Number, default: 28 },
    /** CSS transform-origin for the rotation, e.g. 'center', 'top left', '50% 50%'. */
    transformOrigin: { type: String, default: "center" }
  },
  emits: ["update:modelValue", "update:rotate", "drag", "drag-start", "drag-stop", "resize-start", "resize-stop", "drag-cancel", "resize-cancel", "resize", "rotate-start", "rotate", "rotate-stop", "rotate-cancel", "move", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "snap", "guides", "collision"],
  setup(e, { expose: o, emit: s }) {
    var je;
    const n = e, r = s, l = (t) => Ft(t), v = lt(), u = lt(l(n.modelValue)), I = lt(mt(n.rotate)), x = l(n.modelValue), w = lt(null), _ = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, a = fo({
      active: n.active,
      interactionMode: "idle",
      get isDragging() {
        return this.interactionMode === "drag";
      },
      get isResizing() {
        return this.interactionMode === "resize";
      },
      get isRotating() {
        return this.interactionMode === "rotate";
      },
      get isInteracting() {
        return this.interactionMode !== "idle";
      },
      handle: null,
      initX: 0,
      initY: 0,
      beforeInteraction: l(n.modelValue),
      beforeRotation: mt(n.rotate),
      rotationStartPointerAngle: 0,
      rotationOriginX: 0,
      rotationOriginY: 0,
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    Nt(
      () => n.modelValue,
      (t) => {
        u.value = l(t);
      },
      { deep: !0 }
    ), Nt(
      () => n.rotate,
      (t) => {
        I.value = mt(t);
      }
    ), Nt(
      () => n.active,
      (t) => {
        !t && a.isInteracting ? te() : z(t);
      },
      { flush: "sync" }
    ), Nt(
      () => n.disabled,
      (t) => {
        r("disabled", t), t && te();
      }
    ), Nt(
      () => n.initRect,
      (t) => {
        t && te();
      }
    ), Nt(
      () => n.isKeepDecimals,
      (t, i) => {
        !t && i && y({
          ...u.value,
          left: Math.round(m(u.value.left)),
          top: Math.round(m(u.value.top)),
          width: Math.round(m(u.value.width)),
          height: Math.round(m(u.value.height))
        });
      }
    );
    const F = st(() => n.resizable ?? n.resizeable ?? !0), K = st(() => n.unitType === "%"), E = st(() => I.value), k = st(() => En(n.transformOrigin)), Y = st(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : a.active ? n.theme : n.inActiveColor,
      left: se(u.value.left, n.unitType),
      top: se(u.value.top, n.unitType),
      width: se(u.value.width, n.unitType),
      height: se(u.value.height, n.unitType),
      zIndex: u.value.zIndex,
      cursor: n.disabled ? "not-allowed" : a.isDragging ? "move" : a.isResizing ? "nwse-resize" : a.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: a.active ? 1 : 0.9,
      transform: E.value ? `rotate(${E.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: k.value,
      willChange: a.isDragging || a.isResizing ? "left, top, width, height" : a.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !a.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), d = st(() => ({
      borderColor: F.value ? n.theme : n.inActiveColor,
      scale: Ee(1 / ot(n.scale, 1), 1)
    })), M = st(() => {
      const t = Math.abs(ot(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / t}px`,
        "--rotation-handle-scale": Ee(1 / t, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), y = (t) => {
      const i = l(t);
      return u.value = i, r("update:modelValue", l(i)), i;
    }, A = (t) => {
      const i = mt(T(mt(t)));
      return I.value = i, r("update:rotate", i), r("rotate", i), i;
    };
    function z(t) {
      a.active !== t && (a.active = t, r(t ? "active" : "inactive", l(u.value)), t || fe());
    }
    const R = () => {
      var i, c, f;
      let t = null;
      if (n.limitAreaClass)
        try {
          t = document.querySelector(n.limitAreaClass);
        } catch {
          t = null;
        }
      a.parentElement = t ?? ((i = v.value) == null ? void 0 : i.parentElement) ?? null, a.parentWidth = ((c = a.parentElement) == null ? void 0 : c.clientWidth) ?? 0, a.parentHeight = ((f = a.parentElement) == null ? void 0 : f.clientHeight) ?? 0;
    }, $ = (t) => Math.max(0, Number(t) || 0), gt = () => {
      const t = $(n.edgeDistance);
      return {
        top: t + $(n.boundsMargin.top),
        right: t + $(n.boundsMargin.right),
        bottom: t + $(n.boundsMargin.bottom),
        left: t + $(n.boundsMargin.left)
      };
    }, Z = () => {
      const t = gt(), i = K.value ? 100 : a.parentWidth, c = K.value ? 100 : a.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, i - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, c - t.bottom)
      };
    }, X = (t) => {
      const i = Z();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - t.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - t.height)
      };
    }, q = (t) => ({
      left: m(t.left),
      top: m(t.top),
      width: m(t.width),
      height: m(t.height)
    }), tt = () => ({
      x: K.value && a.parentWidth > 0 ? a.parentWidth / 100 : 1,
      y: K.value && a.parentHeight > 0 ? a.parentHeight / 100 : 1
    }), O = (t) => {
      const i = q(t), c = E.value;
      if (!c) return i;
      const f = tt(), p = {
        left: i.left * f.x,
        top: i.top * f.y,
        width: i.width * f.x,
        height: i.height * f.y
      }, h = wn(n.transformOrigin, p.width, p.height), g = Ho(p, c, h);
      return {
        left: g.left / f.x,
        top: g.top / f.y,
        width: g.width / f.x,
        height: g.height / f.y
      };
    }, et = (t, i) => {
      const c = E.value;
      if (!c || !n.limitAreaForParent || !a.parentElement) return t;
      const f = Z(), p = Math.max(0, f.maxRight - f.minLeft), h = Math.max(0, f.maxBottom - f.minTop), g = Zt(c), D = Math.abs(Math.cos(g)) < 1e-9 ? 0 : Math.abs(Math.cos(g)), L = Math.abs(Math.sin(g)) < 1e-9 ? 0 : Math.abs(Math.sin(g)), S = tt(), C = D, N = L * (S.y / S.x), W = L * (S.x / S.y), U = D, B = m(t.width), P = m(t.height), b = i ? _[i] : null, J = m(t.left) + B, Ot = m(t.top) + P, St = (Q, nt) => ({
        ...t,
        left: b != null && b.left ? T(J - Q) : t.left,
        top: b != null && b.top ? T(Ot - nt) : t.top,
        width: Q,
        height: nt
      }), it = (Q, nt) => ({
        ...t,
        left: b != null && b.left ? J - Q : t.left,
        top: b != null && b.top ? Ot - nt : t.top,
        width: Q,
        height: nt
      }), Vt = C * B + N * P, ne = W * B + U * P, Mt = Math.max(0, ot(n.minWidth, 0)), dt = Math.max(0, ot(n.minHeight, 0)), Yt = i === null || !!(b != null && b.left || b != null && b.right), Xt = i === null || !!(b != null && b.top || b != null && b.bottom), Dt = (b == null ? void 0 : b.left) ?? !1, at = (b == null ? void 0 : b.top) ?? !1, xt = (Q, nt) => {
        if (!Dt && !at) return Q;
        const rt = m(Q.width), Lt = m(Q.height), nn = nt ? Math.min(
          1,
          Math.max(
            rt > 0 ? Mt / rt : 0,
            Lt > 0 ? dt / Lt : 0
          )
        ) : 0, on = nt ? rt * nn : Dt ? Math.min(rt, Mt) : rt, an = nt ? Lt * nn : at ? Math.min(Lt, dt) : Lt, rn = (V) => ({
          width: on + (rt - on) * V,
          height: an + (Lt - an) * V
        }), sn = (V) => {
          const G = rn(V);
          return it(G.width, G.height);
        }, Bt = (V) => {
          const G = rn(V), j = n.isKeepDecimals ? T : Math.floor;
          return St(
            Math.max(Mt, j(G.width)),
            Math.max(dt, j(G.height))
          );
        }, oe = (V) => {
          const G = O(V), j = 1e-7;
          return (!Dt || G.left >= f.minLeft - j && G.left + G.width <= f.maxRight + j) && (!at || G.top >= f.minTop - j && G.top + G.height <= f.maxBottom + j);
        };
        if (oe(Q)) return Q;
        const Ht = O(sn(0)), Ct = O(sn(1));
        let wt = 0, pt = 1, ye = !0;
        const ln = (V, G, j) => {
          const Tt = G - V;
          if (Math.abs(Tt) < 1e-9) {
            V < j && (ye = !1);
            return;
          }
          const Ut = (j - V) / Tt;
          Tt > 0 ? wt = Math.max(wt, Ut) : pt = Math.min(pt, Ut);
        }, cn = (V, G, j) => {
          const Tt = G - V;
          if (Math.abs(Tt) < 1e-9) {
            V > j && (ye = !1);
            return;
          }
          const Ut = (j - V) / Tt;
          Tt > 0 ? pt = Math.min(pt, Ut) : wt = Math.max(wt, Ut);
        };
        if (Dt && (ln(Ht.left, Ct.left, f.minLeft), cn(
          Ht.left + Ht.width,
          Ct.left + Ct.width,
          f.maxRight
        )), at && (ln(Ht.top, Ct.top, f.minTop), cn(
          Ht.top + Ht.height,
          Ct.top + Ct.height,
          f.maxBottom
        )), wt = Math.max(0, wt), pt = Math.min(1, pt), !ye || wt > pt) return Bt(0);
        const un = Bt(pt);
        if (oe(un)) return un;
        let ie = wt, fn = pt;
        if (!oe(Bt(ie))) return Bt(0);
        for (let V = 0; V < 32; V += 1) {
          const G = (ie + fn) / 2;
          oe(Bt(G)) ? ie = G : fn = G;
        }
        return Bt(ie);
      };
      if (n.ratioLock || Yt && Xt) {
        const Q = Math.min(
          1,
          Vt > p ? p / Vt : 1,
          ne > h ? h / ne : 1
        ), nt = Math.max(
          Q,
          B > 0 ? Mt / B : 0,
          P > 0 ? dt / P : 0
        ), rt = Math.min(nt, 1);
        return rt >= 1 ? xt(t, !0) : xt(
          St(
            Math.max(Mt, Math.floor(B * rt)),
            Math.max(dt, Math.floor(P * rt))
          ),
          !0
        );
      }
      const ht = Math.floor(
        Math.min(
          C > 0 ? (p - N * P) / C : 1 / 0,
          W > 0 ? (h - U * P) / W : 1 / 0
        )
      ), be = Math.floor(
        Math.min(
          N > 0 ? (p - C * B) / N : 1 / 0,
          U > 0 ? (h - W * B) / U : 1 / 0
        )
      ), tn = Yt ? Math.max(Mt, Math.min(B, ht)) : B, en = Xt ? Math.max(dt, Math.min(P, be)) : P;
      return xt(tn === B && en === P ? t : St(tn, en), !1);
    }, Rt = (t) => {
      if (!a.parentElement) return;
      const i = Z(), c = O(t), f = c.left, p = c.top, h = f + c.width, g = p + c.height;
      f < i.minLeft && r("out-of-bounds", "left"), h > i.maxRight && r("out-of-bounds", "right"), p < i.minTop && r("out-of-bounds", "top"), g > i.maxBottom && r("out-of-bounds", "bottom");
    }, ut = (t) => {
      if (!n.limitAreaForParent || !a.parentElement) return t;
      const i = O(t), c = X(i), f = It(i.left, c.minLeft, c.maxLeft), p = It(i.top, c.minTop, c.maxTop);
      return E.value ? {
        ...t,
        left: T(m(t.left) + (f - i.left)),
        top: T(m(t.top) + (p - i.top))
      } : {
        ...t,
        left: f,
        top: p
      };
    }, H = ho(Nn, null), vt = n.memberId || `member-${((je = po()) == null ? void 0 : je.uid) ?? Math.random().toString(36).slice(2)}`;
    let bt = !1;
    const Bn = {
      getRect: () => l(u.value),
      translateTo: (t) => {
        y(t);
      },
      getAreaEdges: () => (R(), a.parentElement ? Z() : null)
    };
    mo(() => H == null ? void 0 : H.registerMember(vt, Bn));
    const Ne = () => H ? n.snapTargets.filter((t) => !H.hasMember(t.id)) : n.snapTargets, T = (t) => n.isKeepDecimals ? Ee(t, 0, n.decimalPlaces) : Math.round(t), Oe = (t, i) => {
      const c = ot(n.scale, 1), f = t / (c === 0 ? 1 : c);
      if (!K.value) return T(f);
      const p = i === "horizontal" ? a.parentWidth : a.parentHeight;
      return p > 0 ? T(f / p * 100) : 0;
    }, Le = Ao(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), yt = So(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), Be = Eo(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), He = yt.guides;
    let Wt = "clear", Gt = "clear", Kt = "clear";
    const Jt = /* @__PURE__ */ new Set(["left", "right", "center-x"]), Qt = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), ue = (t) => {
      const i = {
        horizontal: t.points.some((g) => Jt.has(g)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((g) => Qt.has(g)) ? t.targetIds.vertical : void 0
      }, c = t.snapped ? Ft(t.spacing ?? []) : [], f = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: i,
        spacing: c.length > 0 ? c : void 0
      } : { snapped: !1 }, p = JSON.stringify({
        payload: f,
        left: t.points.some((g) => Jt.has(g)) ? t.left : void 0,
        top: t.points.some((g) => Qt.has(g)) ? t.top : void 0
      });
      p !== Wt && ((t.snapped || Wt !== "clear") && r("snap", f), Wt = t.snapped ? p : "clear");
      const h = JSON.stringify({ guides: t.guides, targetIds: i });
      h !== Gt && ((t.snapped || Gt !== "clear") && r("guides", Ft(t.guides)), Gt = t.snapped ? h : "clear");
    }, Hn = (t) => {
      const i = t.dominant, c = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId
      } : { colliding: !1 }, f = JSON.stringify(c);
      f !== Kt && ((i || Kt !== "clear") && r("collision", c), Kt = i ? f : "clear");
    }, fe = () => {
      Wt !== "clear" && r("snap", { snapped: !1 }), Gt !== "clear" && r("guides", { vertical: [], horizontal: [] }), Kt !== "clear" && r("collision", { colliding: !1 }), Wt = "clear", Gt = "clear", Kt = "clear", yt.clearGuides(), Be.clearCollisions();
    }, de = (t, i, c = "path") => {
      const f = O(t), p = Be.resolveCandidate(
        f,
        O(i),
        Ne(),
        (h) => ({
          left: T(h.left),
          top: T(h.top),
          width: T(h.width),
          height: T(h.height)
        }),
        c
      );
      if (Hn(p), !p.accepted) return null;
      if (E.value) {
        if (c === "path" && p.progress !== void 0) {
          const h = It(p.progress, 0, 1), g = q(i), D = q(t);
          return {
            ...t,
            left: T(
              g.left + (D.left - g.left) * h
            ),
            top: T(g.top + (D.top - g.top) * h),
            width: T(
              g.width + (D.width - g.width) * h
            ),
            height: T(
              g.height + (D.height - g.height) * h
            )
          };
        }
        return {
          ...t,
          left: T(m(t.left) + (p.rect.left - f.left)),
          top: T(m(t.top) + (p.rect.top - f.top))
        };
      }
      return { ...t, ...p.rect };
    }, Ce = (t, i, c, f, p) => {
      let h = l(t);
      f.horizontal && (h.left = Le.snapValue(m(t.left))), f.vertical && (h.top = Le.snapValue(m(t.top)));
      let g = {
        ...q(h),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (c) {
        const L = O(h);
        g = yt.resolveSnap(L, Ne(), f), E.value ? h = {
          ...h,
          left: T(m(h.left) + (g.left - L.left)),
          top: T(m(h.top) + (g.top - L.top))
        } : h = { ...h, left: g.left, top: g.top };
      } else
        yt.clearGuides();
      if (p) {
        const L = m(p.left), S = m(p.top);
        n.dragDirections.includes("left") || (h.left = Math.max(L, m(h.left))), n.dragDirections.includes("right") || (h.left = Math.min(L, m(h.left))), n.dragDirections.includes("top") || (h.top = Math.max(S, m(h.top))), n.dragDirections.includes("bottom") || (h.top = Math.min(S, m(h.top)));
      }
      Rt(h), h = ut(h);
      const D = de(h, i, "slide");
      if (!D)
        return ue({
          ...g,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), yt.clearGuides(), null;
      if (h = D, g.snapped) {
        const L = O(h), S = T(L.left) !== T(g.left), C = T(L.top) !== T(g.top), N = g.points.filter((b) => Jt.has(b) ? !S : Qt.has(b) ? !C : !1), W = N.some((b) => Jt.has(b)), U = N.some((b) => Qt.has(b)), B = g.spacing.filter(
          (b) => b.axis === "horizontal" ? !S : !C
        ), P = {
          vertical: B.flatMap((b) => b.axis === "horizontal" ? b.guides : []),
          horizontal: B.flatMap((b) => b.axis === "vertical" ? b.guides : [])
        };
        g = {
          ...g,
          left: m(h.left),
          top: m(h.top),
          snapped: N.length > 0 || B.length > 0,
          snapPoint: N[0],
          points: N,
          targetId: W ? g.targetIds.horizontal : U ? g.targetIds.vertical : void 0,
          targetIds: {
            horizontal: W ? g.targetIds.horizontal : void 0,
            vertical: U ? g.targetIds.vertical : void 0
          },
          guides: {
            vertical: W ? g.guides.vertical : P.vertical,
            horizontal: U ? g.guides.horizontal : P.horizontal
          },
          spacing: B
        }, g.snapped ? yt.setGuides(g.guides) : yt.clearGuides();
      }
      return ue(g), h;
    }, he = (t) => n.resizeDirections.includes(t), ke = (t, i, c, f) => {
      const p = _[i], h = m(t.left), g = m(t.top), D = m(t.width), L = m(t.height);
      let S = h, C = h + D, N = g, W = g + L;
      p.left && (S += c), p.right && (C += c), p.top && (N += f), p.bottom && (W += f);
      const U = (S + C) / 2, B = (N + W) / 2;
      let P = Math.max(0, C - S), b = Math.max(0, W - N);
      const J = D > 0 && L > 0 ? D / L : 1, Ot = (ht) => {
        P = ht, p.left ? S = C - P : p.right ? C = S + P : (S = U - P / 2, C = U + P / 2);
      }, St = (ht) => {
        b = ht, p.top ? N = W - b : p.bottom ? W = N + b : (N = B - b / 2, W = B + b / 2);
      };
      if (n.ratioLock) {
        const ht = Math.abs(P - D), be = Math.abs(b - L) * J;
        i === "tm" || i === "bm" || be > ht ? Ot(b * J) : St(P / J);
      }
      const it = Z(), Vt = n.limitAreaForParent && !!a.parentElement && E.value === 0, ne = Vt ? p.left ? Math.max(0, C - it.minLeft) : p.right ? Math.max(0, it.maxRight - S) : Math.max(
        0,
        2 * Math.min(U - it.minLeft, it.maxRight - U)
      ) : 1 / 0, Mt = Vt ? p.top ? Math.max(0, W - it.minTop) : p.bottom ? Math.max(0, it.maxBottom - N) : Math.max(
        0,
        2 * Math.min(B - it.minTop, it.maxBottom - B)
      ) : 1 / 0, dt = Math.max(0, ot(n.minWidth, 0)), Yt = Math.max(0, ot(n.minHeight, 0)), Xt = ot(n.maxWidth, 1 / 0), Dt = ot(n.maxHeight, 1 / 0);
      let at = Math.min(Xt > 0 ? Xt : 1 / 0, ne), xt = Math.min(Dt > 0 ? Dt : 1 / 0, Mt);
      if (n.ratioLock) {
        at = Math.min(at, xt * J);
        const ht = Math.max(dt, Yt * J);
        Ot(It(P, ht, at)), St(P / J);
      } else
        Ot(It(P, Math.min(dt, at), at)), St(It(b, Math.min(Yt, xt), xt));
      return {
        ...t,
        left: T(S),
        top: T(N),
        width: T(C - S),
        height: T(W - N)
      };
    };
    let ft = null, zt = null;
    const Fe = (t, i, c) => Math.atan2(t.clientY - c, t.clientX - i) * 180 / Math.PI + 90, We = (t) => {
      if (n.disabled || n.initRect || !a.isInteracting)
        return;
      if (a.isRotating) {
        const p = Fe(
          t,
          a.rotationOriginX,
          a.rotationOriginY
        ), h = mt(p - a.rotationStartPointerAngle);
        A(a.beforeRotation + h);
        return;
      }
      const i = Oe(t.clientX - a.initX, "horizontal"), c = Oe(t.clientY - a.initY, "vertical"), f = l(u.value);
      if (a.isDragging) {
        const p = a.beforeInteraction;
        let h = m(p.left) + i, g = m(p.top) + c;
        const D = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: c < 0 && n.dragDirections.includes("top") || c > 0 && n.dragDirections.includes("bottom")
        };
        D.horizontal || (h = m(p.left)), D.vertical || (g = m(p.top));
        const L = {
          ...p,
          left: T(h),
          top: T(g)
        };
        let S = Ce(L, f, n.snapToElements, D, p);
        if (S && bt && (S = (H == null ? void 0 : H.constrainPosition(vt, S)) ?? null), S) {
          const C = y(S);
          r("move", l(C)), r("drag", l(C)), bt && (H == null || H.notifyMoved(vt, l(C)));
        }
      }
      if (a.isResizing && a.handle) {
        ue({
          ...q(f),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), yt.clearGuides();
        const p = In(i, c, E.value);
        let h = ke(
          a.beforeInteraction,
          a.handle,
          p.x,
          p.y
        );
        E.value && (h = et(h, a.handle), h = ut(h)), Rt(h);
        const g = de(h, f);
        if (g) {
          const D = y(g);
          r("resize", l(D));
        }
      }
    }, Cn = (t) => {
      !a.active || n.disabled || n.initRect || (zt = t, ft === null && (ft = requestAnimationFrame(() => {
        ft = null;
        const i = zt;
        zt = null, i && We(i);
      })));
    }, jt = (t) => a.pointerId === null || t.pointerId === a.pointerId, Ge = (t) => {
      jt(t) && Cn(t);
    }, Ke = (t) => {
      jt(t) && Vn(t);
    }, $e = (t) => {
      jt(t) && $t(t);
    }, Ve = (t) => {
      jt(t) && a.isInteracting && $t(t);
    }, Ye = (t) => {
      t.key === "Escape" && a.isInteracting && (t.preventDefault(), t.stopPropagation(), $t(t));
    }, Xe = () => {
      const t = a.eventElement;
      if (!t) return;
      const i = { passive: !1 };
      _t(t, "pointermove", Ge, i), _t(t, "pointerup", Ke, i), _t(t, "pointercancel", $e, i), _t(t, "keydown", Ye, !0);
      const c = v.value;
      c && _t(c, "lostpointercapture", Ve, i);
    }, kn = () => {
      const t = a.eventElement;
      if (!t) return;
      qt(t, "pointermove", Ge, !1), qt(t, "pointerup", Ke, !1), qt(t, "pointercancel", $e, !1), qt(t, "keydown", Ye, !0);
      const i = v.value;
      i && qt(i, "lostpointercapture", Ve, !1), a.eventElement = null;
    }, Ue = () => {
      const t = v.value;
      if (!(!t || a.pointerId === null))
        try {
          t.setPointerCapture(a.pointerId);
        } catch {
        }
    }, Fn = () => {
      const t = v.value, i = a.pointerId;
      if (a.pointerId = null, !(!t || i === null))
        try {
          t.hasPointerCapture(i) && t.releasePointerCapture(i);
        } catch {
        }
    };
    function pe() {
      ft !== null && (cancelAnimationFrame(ft), ft = null), zt = null;
    }
    function me() {
      a.interactionMode = "idle", a.handle = null, bt = !1, kn(), Fn();
    }
    function _e() {
      fe(), n.active || z(!1);
    }
    function qe() {
      me(), _e();
    }
    function te() {
      pe(), bt && (H == null || H.abortDrag(vt)), qe();
    }
    function $t(t = null) {
      const i = a.isDragging, c = a.isResizing, f = a.isRotating, p = bt;
      if (pe(), me(), i || c) {
        const h = l(a.beforeInteraction);
        y(h), r(i ? "drag-cancel" : "resize-cancel", t, h, l(h)), i && p && (H == null || H.cancelDrag(vt, t));
      }
      f && (I.value = a.beforeRotation, r("update:rotate", a.beforeRotation), r("rotate-cancel", t, a.beforeRotation, a.beforeRotation)), _e();
    }
    function Ze() {
      te(), z(!1);
    }
    const Wn = (t, i) => {
      var f, p;
      if (n.disabled || n.initRect || a.isInteracting || i && (!F.value || !he(i)) || !i && !n.draggable) return;
      const c = l(u.value);
      if (i) {
        if (((f = n.canResize) == null ? void 0 : f.call(n, c, i)) === !1) return;
      } else if (((p = n.canDrag) == null ? void 0 : p.call(n, c)) === !1)
        return;
      if (bt = !1, !i && H) {
        const h = H.beginDrag(vt, t);
        if (h === "blocked") return;
        bt = h === "group";
      }
      R(), a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.initX = t.clientX, a.initY = t.clientY, a.beforeInteraction = l(u.value), a.handle = i, a.interactionMode = i ? "resize" : "drag", z(!0), a.isDragging && r("drag-start", t, l(a.beforeInteraction)), a.isResizing && r("resize-start", t, l(a.beforeInteraction)), a.eventElement = document.documentElement, Xe(), Ue();
    }, Gn = () => {
      const t = v.value;
      if (!t) return null;
      const i = t.getBoundingClientRect(), c = t.offsetWidth || m(u.value.width), f = t.offsetHeight || m(u.value.height);
      if (!c || !f) return null;
      const p = Zt(E.value), h = Math.cos(p), g = Math.sin(p), D = Math.abs(h) * c + Math.abs(g) * f, L = Math.abs(g) * c + Math.abs(h) * f, S = [
        D ? i.width / D : 0,
        L ? i.height / L : 0
      ].filter((b) => Number.isFinite(b) && b > 0), C = Math.abs(ot(n.scale, 1)) || 1, N = S.length ? S.reduce((b, J) => b + J, 0) / S.length : C, W = wn(n.transformOrigin, c, f), U = W.x * N, B = W.y * N, P = [
        [-U, -B],
        [c * N - U, -B],
        [c * N - U, f * N - B],
        [-U, f * N - B]
      ].map(([b, J]) => ({
        x: b * h - J * g,
        y: b * g + J * h
      }));
      return {
        x: i.left - Math.min(...P.map((b) => b.x)),
        y: i.top - Math.min(...P.map((b) => b.y))
      };
    }, Kn = (t) => {
      if (!t.isPrimary || t.button !== 0 || n.disabled || n.initRect || !n.rotatable || a.isInteracting) return;
      const i = Gn();
      i && (a.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, a.beforeRotation = I.value, a.rotationOriginX = i.x, a.rotationOriginY = i.y, a.rotationStartPointerAngle = Fe(t, i.x, i.y), a.interactionMode = "rotate", z(!0), r("rotate-start", t, a.beforeRotation), a.eventElement = document.documentElement, Xe(), Ue());
    }, $n = (t) => {
      if (!(t instanceof Element)) return !0;
      const i = v.value;
      if (!i) return !0;
      const c = (f) => {
        try {
          const p = t.closest(f);
          return {
            valid: !0,
            matched: p instanceof Element && i.contains(p)
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
    }, Je = (t, i) => {
      !t.isPrimary || t.button !== 0 || !i && !$n(t.target) || Wn(t, i);
    };
    function Vn(t) {
      ft !== null && (cancelAnimationFrame(ft), ft = null), zt && (We(zt), zt = null), a.isDragging && (r("drag-stop", t, l(a.beforeInteraction), l(u.value)), bt && (H == null || H.endDrag(vt, t))), a.isResizing && r("resize-stop", t, l(a.beforeInteraction), l(u.value)), a.isRotating && r("rotate-stop", t, a.beforeRotation, I.value), qe();
    }
    const Yn = (t, i) => {
      var h;
      R();
      const c = l(u.value);
      if (((h = n.canDrag) == null ? void 0 : h.call(n, l(c))) === !1) return;
      const f = l(c);
      t === "left" && (f.left = m(f.left) - i), t === "right" && (f.left = m(f.left) + i), t === "top" && (f.top = m(f.top) - i), t === "bottom" && (f.top = m(f.top) + i);
      const p = Ce(
        f,
        c,
        n.snapToElements,
        {
          horizontal: t === "left" || t === "right",
          vertical: t === "top" || t === "bottom"
        },
        c
      );
      if (p) {
        const g = y(p);
        r("move", l(g));
      }
    }, Xn = (t, i, c) => {
      var C;
      if (!F.value || !he(t)) return;
      R();
      const f = l(u.value);
      if (((C = n.canResize) == null ? void 0 : C.call(n, l(f), t)) === !1) return;
      const p = i === "left" ? -c : i === "right" ? c : 0, h = i === "top" ? -c : i === "bottom" ? c : 0, g = In(p, h, E.value);
      let D = ke(f, t, g.x, g.y);
      E.value && (D = et(D, t), D = ut(D)), Rt(D);
      const L = de(D, f);
      if (!L || No(L, f)) return;
      const S = y(L);
      r("resize", l(S));
    }, Un = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, _n = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), At = (t) => _n.has(t), qn = (t) => At(t) ? "group" : "separator", Zn = (t) => At(t) ? "two-axis resize handle" : void 0, Jn = (t) => `Resize ${Un[t]}`, Qn = (t) => {
      if (!At(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, ee = (t) => t === "ml" || t === "mr", Qe = (t) => {
      if (!At(t))
        return m(ee(t) ? u.value.width : u.value.height);
    }, jn = (t) => {
      if (!At(t))
        return m(ee(t) ? n.minWidth : n.minHeight);
    }, to = (t) => {
      if (At(t)) return;
      const i = ee(t) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const c = m(i);
      return Number.isFinite(c) ? c : void 0;
    }, eo = (t) => {
      const i = Qe(t);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, no = (t) => {
      if (n.keyboardEnabled)
        return At(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : ee(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, oo = (t) => {
      t.target === v.value && n.keyboardEnabled && !n.disabled && !n.initRect && z(!0);
    }, io = [
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
    ].join(","), ao = (t) => {
      const i = t.target, c = v.value;
      if (!(i instanceof Element) || !c || i === c || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return t.key !== "Escape";
      const f = i.closest(io);
      return f !== null && f !== c && c.contains(f);
    }, ro = wo(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: a.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: w.value,
        interacting: a.isInteracting
      }),
      {
        move: Yn,
        resize: Xn,
        deactivate: Ze,
        cancel: (t) => $t(t)
      }
    ), so = (t) => {
      ao(t) || ro.handleKeyDown(t);
    }, lo = (t) => {
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(t.key)) return;
      t.preventDefault(), t.stopPropagation();
      const i = I.value, c = zn(n.keyboardStep) * (t.shiftKey ? 10 : 1), f = t.key === "Home" ? 0 : i + (t.key === "ArrowLeft" ? -c : c);
      r("rotate-start", t, i);
      const p = A(f);
      r("rotate-stop", t, i, p);
    }, ge = (t) => K.value ? t / 100 * a.parentWidth : t, ve = (t) => K.value ? t / 100 * a.parentHeight : t, co = (t) => ({
      left: `${ge(t) - ge(m(u.value.left))}px`,
      top: `${-ve(m(u.value.top))}px`,
      height: `${a.parentHeight}px`,
      borderColor: n.theme
    }), uo = (t) => ({
      top: `${ve(t) - ve(m(u.value.top))}px`,
      left: `${-ge(m(u.value.left))}px`,
      width: `${a.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => l(u.value),
      setPosition: (t, i) => y({ ...u.value, left: t, top: i }),
      setSize: (t, i) => y({ ...u.value, width: t, height: i }),
      reset: () => y(l(x)),
      activate: () => z(!0),
      deactivate: Ze,
      cancelInteraction: (t = null) => $t(t)
    }), go(() => {
      pe(), me(), H == null || H.unregisterMember(vt), fe();
    }), (t, i) => (Pt(), Et("div", {
      ref_key: "movableRef",
      ref: v,
      class: dn(["auto-draggable", {
        "select-none": e.disabledUserSelect,
        "is-disabled": e.disabled,
        "is-active": a.active,
        "is-dragging": a.isDragging,
        "is-resizing": a.isResizing,
        "is-rotating": a.isRotating,
        "is-readonly": e.initRect
      }]),
      style: kt(Y.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (c) => Je(c, null)),
      onDblclick: i[2] || (i[2] = (c) => r("dblclick", c)),
      onFocus: oo,
      onKeydown: so
    }, [
      (Pt(!0), Et(Me, null, xe(hn(He).vertical, (c, f) => (Pt(), Et("div", {
        key: `vertical-${f}`,
        class: "movable-box-guide movable-box-guide--vertical",
        style: kt(co(c))
      }, null, 4))), 128)),
      (Pt(!0), Et(Me, null, xe(hn(He).horizontal, (c, f) => (Pt(), Et("div", {
        key: `horizontal-${f}`,
        class: "movable-box-guide movable-box-guide--horizontal",
        style: kt(uo(c))
      }, null, 4))), 128)),
      we(Ie("div", {
        class: "rotation-handle-connector",
        style: kt(M.value),
        "aria-hidden": "true"
      }, null, 4), [
        [Re, a.active && e.rotatable && !e.disabled && !e.initRect]
      ]),
      we(Ie("div", {
        class: "rotation-handle",
        style: kt(M.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": E.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${E.value} degrees`,
        "aria-keyshortcuts": e.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: pn(Kn, ["stop", "prevent"]),
        onKeydown: lo
      }, [...i[3] || (i[3] = [
        Ie("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, ko), [
        [Re, a.active && e.rotatable && !e.disabled && !e.initRect]
      ]),
      (Pt(!0), Et(Me, null, xe(e.handles, (c) => we((Pt(), Et("div", {
        key: c,
        class: dn(["handle", `handle-${c}`]),
        style: kt(d.value),
        role: qn(c),
        "aria-roledescription": Zn(c),
        "aria-orientation": Qn(c),
        "aria-label": Jn(c),
        "aria-valuenow": Qe(c),
        "aria-valuemin": jn(c),
        "aria-valuemax": to(c),
        "aria-valuetext": eo(c),
        "aria-keyshortcuts": no(c),
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: pn((f) => Je(f, c), ["stop", "prevent"]),
        onFocus: (f) => w.value = c,
        onBlur: i[0] || (i[0] = (f) => w.value = null)
      }, null, 46, Fo)), [
        [Re, a.active && F.value && !e.disabled && he(c)]
      ])), 128)),
      Rn(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Ko = (e, o) => {
  const s = e.__vccOpts || e;
  for (const [n, r] of o)
    s[n] = r;
  return s;
}, $o = /* @__PURE__ */ Ko(Go, [["__scopeId", "data-v-a59cf477"]]), Vo = ce({
  name: "MovableGroup"
}), Yo = /* @__PURE__ */ ce({
  ...Vo,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(e, { expose: o, emit: s }) {
    const n = e, r = s, l = /* @__PURE__ */ new Map(), v = lt([]), u = lt(null), I = st(() => n.selected !== void 0), x = st({
      get: () => I.value ? n.selected ?? [] : v.value,
      set: (d) => {
        v.value = d, r("update:selected", d);
      }
    });
    Nt(
      () => n.selected,
      (d) => {
        d !== void 0 && (v.value = [...d]);
      },
      { immediate: !0 }
    );
    const w = (d) => Ft(d), _ = (d, M, y) => ({
      ...d,
      left: m(d.left) + M,
      top: m(d.top) + y
    }), a = (d) => d.reduce(
      (M, y) => ({
        minLeft: Math.min(M.minLeft, m(y.left)),
        minTop: Math.min(M.minTop, m(y.top)),
        maxRight: Math.max(M.maxRight, m(y.left) + m(y.width)),
        maxBottom: Math.max(M.maxBottom, m(y.top) + m(y.height))
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), F = (d, M, y) => {
      const A = a([...d.values()]);
      return {
        left: Math.min(
          Math.max(M.left, y.minLeft - A.minLeft),
          y.maxRight - A.maxRight
        ),
        top: Math.min(
          Math.max(M.top, y.minTop - A.minTop),
          y.maxBottom - A.maxBottom
        )
      };
    }, K = (d) => {
      const M = [];
      for (const [y, A] of d) {
        const z = l.get(y);
        z && M.push({ id: y, rect: w(z.getRect()), startRect: w(A) });
      }
      return M;
    }, E = (d) => d.map(({ id: M, rect: y }) => ({ id: M, rect: y })), k = (d) => {
      const M = d.filter((A) => l.has(A)), y = x.value;
      y.length === M.length && y.every((A, z) => A === M[z]) || (x.value = M);
    };
    return vo(Nn, {
      registerMember: (d, M) => {
        l.set(d, M);
      },
      unregisterMember: (d) => {
        var M;
        if (l.delete(d), ((M = u.value) == null ? void 0 : M.leaderId) === d) {
          u.value = null;
          return;
        }
        u.value && u.value.startRects.delete(d), x.value.includes(d) && k(x.value.filter((y) => y !== d));
      },
      hasMember: (d) => d !== void 0 && l.has(d),
      beginDrag: (d, M) => {
        if (u.value && u.value.leaderId !== d)
          return u.value.startRects.has(d) ? "blocked" : "solo";
        if (!l.has(d)) return "solo";
        const y = x.value.includes(d) ? [...x.value] : [d];
        x.value.includes(d) || k(y);
        const A = /* @__PURE__ */ new Map();
        for (const R of y) {
          const $ = l.get(R);
          $ && A.set(R, w($.getRect()));
        }
        u.value = { leaderId: d, startRects: A };
        const z = [];
        for (const [R, $] of A) z.push({ id: R, rect: w($) });
        return r("move-start", { leaderId: d, source: M, rects: z }), "group";
      },
      constrainPosition: (d, M) => {
        var gt, Z;
        const y = u.value, A = y == null ? void 0 : y.startRects.get(d);
        if (!y || y.leaderId !== d || !A || !l.has(d)) return M;
        const z = m(M.left) - m(A.left), R = m(M.top) - m(A.top), $ = (gt = l.get(d)) == null ? void 0 : gt.getAreaEdges();
        if (n.sharedBounds) {
          let X = { left: z, top: R };
          $ && (X = F(y.startRects, X, $));
          for (const [q, tt] of y.startRects)
            q !== d && ((Z = l.get(q)) == null || Z.translateTo(_(tt, X.left, X.top)));
          return _(A, X.left, X.top);
        }
        for (const [X, q] of y.startRects) {
          if (X === d) continue;
          const tt = l.get(X);
          if (!tt) continue;
          const O = _(q, z, R), et = tt.getAreaEdges();
          if (et) {
            const Rt = Math.max(
              et.minLeft,
              et.maxRight - m(q.width)
            ), ut = Math.max(
              et.minTop,
              et.maxBottom - m(q.height)
            );
            O.left = It(m(O.left), et.minLeft, Rt), O.top = It(m(O.top), et.minTop, ut);
          }
          tt.translateTo(O);
        }
        return M;
      },
      notifyMoved: (d, M) => {
        const y = u.value;
        if (!y || y.leaderId !== d) return;
        const A = E(K(y.startRects)).map(
          (z) => z.id === d ? { id: d, rect: w(M) } : z
        );
        r("move", { leaderId: d, rects: A });
      },
      endDrag: (d, M) => {
        const y = u.value;
        if (!y || y.leaderId !== d) return;
        const A = K(y.startRects);
        u.value = null, r("move-stop", { leaderId: d, source: M, rects: A });
      },
      cancelDrag: (d, M) => {
        var z;
        const y = u.value;
        if (!y || y.leaderId !== d) return;
        for (const [R, $] of y.startRects)
          R !== d && ((z = l.get(R)) == null || z.translateTo(w($)));
        const A = K(y.startRects);
        u.value = null, r("move-cancel", { leaderId: d, source: M, rects: A });
      },
      abortDrag: (d) => {
        var M;
        ((M = u.value) == null ? void 0 : M.leaderId) === d && (u.value = null);
      }
    }), o({
      getSelected: () => [...x.value],
      select: (d) => k(d ?? [...l.keys()]),
      getMemberRects: () => [...l.entries()].map(([d, M]) => ({ id: d, rect: w(M.getRect()) }))
    }), (d, M) => Rn(d.$slots, "default");
  }
}), On = "VueMovableBox", Ln = (e) => {
  e.component(On, $o), e.component("MovableGroup", Yo);
}, _o = {
  name: On,
  version: "3.0.0",
  install: Ln
};
typeof window < "u" && window.Vue && window.Vue.use({ install: Ln });
export {
  $o as MovableBox,
  Yo as MovableGroup,
  _o as default,
  On as name
};
