import { computed as ft, ref as xt, defineComponent as Pe, reactive as Jo, watch as $t, inject as Qo, getCurrentInstance as jo, onMounted as ti, onUnmounted as ei, openBlock as kt, createElementBlock as Wt, normalizeStyle as Gt, normalizeClass as Kn, createElementVNode as ve, Fragment as Ke, renderList as Ye, unref as Yn, withDirectives as Xe, vShow as Ue, withModifiers as Xn, renderSlot as ro, provide as ni } from "vue";
import oi from "decimal.js";
const ii = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, ai = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, ri = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, so = (t) => Number.isFinite(t) && t > 0 ? t : 1;
function si(t, o) {
  return { handleKeyDown: (n) => {
    const s = t(), a = s.interacting;
    if (!a && (!s.enabled || s.disabled || !s.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), a ? o.cancel(n) : o.deactivate();
      return;
    }
    if (a || s.readOnly) return;
    const f = ii[n.key];
    if (!f) return;
    const d = so(s.step);
    if (s.focusedHandle && s.resizeDirections.includes(s.focusedHandle)) {
      if (!ai[s.focusedHandle].includes(f)) return;
      n.preventDefault(), o.resize(
        s.focusedHandle,
        n.shiftKey ? ri[f] : f,
        d
      );
      return;
    }
    if (n.shiftKey) {
      const z = s.resizeDirections.includes("br") ? "br" : s.resizeDirections[0];
      if (!z) return;
      n.preventDefault(), o.resize(z, f, d);
      return;
    }
    s.dragDirections.includes(f) && (n.preventDefault(), o.move(f, d));
  } };
}
const be = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, Un = (t) => {
  const o = be(t.left), r = be(t.top), n = be(t.width), s = be(t.height);
  return o === null || r === null || n === null || s === null || n < 0 || s < 0 ? null : { left: o, top: r, width: n, height: s };
};
function li(t, o) {
  const r = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(t / r) * r;
}
const _n = (t, o, r) => o.distance > r ? t : !t || o.distance < t.distance ? o : t, ci = ["alignment", "spacing"], qn = (t, o, r, n) => {
  for (const s of r) {
    if (s === "alignment") {
      const f = n.alignment();
      if (f && f.distance <= o)
        return {
          candidate: f,
          spacing: null,
          guides: [f.guide],
          spacingInfo: null,
          value: f.value
        };
      continue;
    }
    const a = n.spacing();
    if (a && a.distance <= o)
      return {
        candidate: null,
        spacing: a,
        guides: a.guides,
        spacingInfo: {
          axis: t,
          gap: a.gap,
          targetIds: a.targetIds,
          guides: a.guides
        },
        value: a.value
      };
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, Zn = (t, o, r, n, s) => {
  const a = (h) => t === "horizontal" ? h.left : h.top, f = (h) => t === "horizontal" ? h.left + h.width : h.top + h.height, d = [], z = [];
  for (const h of s)
    f(h.rect) <= o && d.push(h), a(h.rect) >= o + r && z.push(h);
  let M = null;
  for (const h of d)
    for (const b of z) {
      const l = a(b.rect) - f(h.rect) - r;
      if (l < 0) continue;
      const C = l / 2, N = f(h.rect) + C, S = Math.abs(o - N);
      S > n || (!M || S < M.distance) && (M = {
        distance: S,
        value: N,
        gap: C,
        guides: [f(h.rect), a(b.rect)],
        targetIds: [h.id, b.id]
      });
    }
  return M;
};
function ui(t, o, r = 10, n = { horizontal: !0, vertical: !0 }, s = {}) {
  const a = Math.max(0, Number.isFinite(r) ? r : 10), f = t.left + t.width, d = t.top + t.height, z = t.left + t.width / 2, M = t.top + t.height / 2, h = s.priority && s.priority.length > 0 ? s.priority : ci, b = h.includes("alignment"), l = h.includes("spacing"), C = (O, q) => s.filter ? s.filter(O, q) !== !1 : !0, N = /* @__PURE__ */ new Map(), S = (O) => {
    let q = N.get(O);
    return q || (q = {
      horizontal: n.horizontal && C(O, "horizontal"),
      vertical: n.vertical && C(O, "vertical")
    }, N.set(O, q)), q;
  };
  let R = null;
  const G = () => {
    let O = null, q = null;
    for (const j of o) {
      const B = Un(j);
      if (!B) continue;
      const tt = S(j);
      if (!tt.horizontal && !tt.vertical) continue;
      const nt = B.left + B.width, st = B.top + B.height, Rt = B.left + B.width / 2, Ct = B.top + B.height / 2, ut = j.id;
      if (tt.horizontal) {
        const Jt = [
          {
            distance: Math.abs(t.left - B.left),
            value: B.left,
            guide: B.left,
            point: "left",
            targetId: ut
          },
          {
            distance: Math.abs(f - nt),
            value: nt - t.width,
            guide: nt,
            point: "right",
            targetId: ut
          },
          {
            distance: Math.abs(t.left - nt),
            value: nt,
            guide: nt,
            point: "left",
            targetId: ut
          },
          {
            distance: Math.abs(f - B.left),
            value: B.left - t.width,
            guide: B.left,
            point: "right",
            targetId: ut
          },
          {
            distance: Math.abs(z - Rt),
            value: Rt - t.width / 2,
            guide: Rt,
            point: "center-x",
            targetId: ut
          }
        ];
        for (const zt of Jt) O = _n(O, zt, a);
      }
      if (tt.vertical) {
        const Jt = [
          {
            distance: Math.abs(t.top - B.top),
            value: B.top,
            guide: B.top,
            point: "top",
            targetId: ut
          },
          {
            distance: Math.abs(d - st),
            value: st - t.height,
            guide: st,
            point: "bottom",
            targetId: ut
          },
          {
            distance: Math.abs(t.top - st),
            value: st,
            guide: st,
            point: "top",
            targetId: ut
          },
          {
            distance: Math.abs(d - B.top),
            value: B.top - t.height,
            guide: B.top,
            point: "bottom",
            targetId: ut
          },
          {
            distance: Math.abs(M - Ct),
            value: Ct - t.height / 2,
            guide: Ct,
            point: "center-y",
            targetId: ut
          }
        ];
        for (const zt of Jt) q = _n(q, zt, a);
      }
    }
    return { x: O, y: q };
  }, x = (O) => b ? (R || (R = G()), O === "horizontal" ? R.x : R.y) : null, I = [], v = [];
  let P = !1;
  const H = () => {
    for (const O of o) {
      const q = Un(O);
      if (!q) continue;
      const j = S(O);
      j.horizontal && I.push({ rect: q, id: O.id }), j.vertical && v.push({ rect: q, id: O.id });
    }
    P = !0;
  }, $ = (O) => l ? (P || H(), O === "horizontal" ? Zn(
    "horizontal",
    t.left,
    t.width,
    a,
    I
  ) : Zn("vertical", t.top, t.height, a, v)) : null, k = n.horizontal ? qn("horizontal", a, h, {
    alignment: () => x("horizontal"),
    spacing: () => $("horizontal")
  }) : null, L = n.vertical ? qn("vertical", a, h, {
    alignment: () => x("vertical"),
    spacing: () => $("vertical")
  }) : null, _ = (k == null ? void 0 : k.candidate) ?? null, U = (L == null ? void 0 : L.candidate) ?? null, Q = [_ == null ? void 0 : _.point, U == null ? void 0 : U.point].filter(
    (O) => !!O
  ), J = [k == null ? void 0 : k.spacingInfo, L == null ? void 0 : L.spacingInfo].filter(
    (O) => !!O
  );
  return {
    left: (k == null ? void 0 : k.value) ?? t.left,
    top: (L == null ? void 0 : L.value) ?? t.top,
    snapped: Q.length > 0 || J.length > 0,
    snapPoint: Q[0],
    points: Q,
    targetId: (_ == null ? void 0 : _.targetId) ?? (U == null ? void 0 : U.targetId),
    targetIds: { horizontal: _ == null ? void 0 : _.targetId, vertical: U == null ? void 0 : U.targetId },
    guides: {
      vertical: (k == null ? void 0 : k.guides) ?? [],
      horizontal: (L == null ? void 0 : L.guides) ?? []
    },
    spacing: J
  };
}
function fi(t) {
  const o = (s) => {
    const a = t();
    return a.snapToGrid ? li(s, a.gridSize) : s;
  }, r = (s, a) => ({
    left: o(s),
    top: o(a)
  }), n = ft(() => {
    const s = t();
    return s.snapToGrid ? {
      size: Number.isFinite(s.gridSize) && s.gridSize > 0 ? s.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: r, gridInfo: n };
}
const _e = () => ({ vertical: [], horizontal: [] });
function hi(t) {
  const o = xt(_e()), r = xt(null);
  return { guides: o, lastSnapResult: r, resolveSnap: (f, d, z) => {
    const M = t(), h = M.enabled ? ui(f, d, M.threshold, z, {
      filter: M.filter,
      priority: M.priority
    }) : {
      ...f,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: _e(),
      spacing: []
    };
    return o.value = h.guides, r.value = h.snapped ? h : null, h;
  }, clearGuides: () => {
    o.value = _e(), r.value = null;
  }, setGuides: (f) => {
    o.value = f;
  } };
}
const Me = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, lo = (t) => {
  const o = Me(t.left), r = Me(t.top), n = Me(t.width), s = Me(t.height);
  return o === null || r === null || n === null || s === null || n < 0 || s < 0 ? null : { left: o, top: r, width: n, height: s };
}, Jn = (t, o, r, n) => {
  const s = r - o;
  if (s === 0) return o < n ? t : null;
  const a = (n - o) / s;
  return s > 0 ? { ...t, exit: Math.min(t.exit, a) } : { ...t, entry: Math.max(t.entry, a) };
}, Qn = (t, o, r, n) => {
  const s = r - o;
  if (s === 0) return o > n ? t : null;
  const a = (n - o) / s;
  return s > 0 ? { ...t, entry: Math.max(t.entry, a) } : { ...t, exit: Math.min(t.exit, a) };
}, di = (t, o, r) => {
  let n = { entry: 0, exit: 1 };
  if (n = Jn(n, t.left, o.left, r.left + r.width), !n || (n = Qn(
    n,
    t.left + t.width,
    o.left + o.width,
    r.left
  ), !n) || (n = Jn(n, t.top, o.top, r.top + r.height), !n) || (n = Qn(
    n,
    t.top + t.height,
    o.top + o.height,
    r.top
  ), !n)) return null;
  const s = Math.max(0, n.entry), a = Math.min(1, n.exit);
  return s < a && a > 0 && s < 1 ? { entry: s, exit: a } : null;
};
function Ae(t, o, r) {
  let n = null;
  for (const s of r) {
    const a = lo(s);
    if (!a) continue;
    const f = di(t, o, a);
    f && (!n || f.entry < n.entry) && (n = f);
  }
  return n;
}
function pi(t, o) {
  const r = Math.min(t.left + t.width, o.left + o.width) - Math.max(t.left, o.left), n = Math.min(t.top + t.height, o.top + o.height) - Math.max(t.top, o.top);
  if (r <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const s = t.left + t.width / 2, a = t.top + t.height / 2, f = o.left + o.width / 2, d = o.top + o.height / 2, z = s - f, M = a - d;
  return {
    colliding: !0,
    direction: r <= n ? z > 0 ? "right" : "left" : M > 0 ? "bottom" : "top",
    overlap: Math.min(r, n),
    overlapArea: r * n
  };
}
function qe(t, o, r) {
  const n = [];
  for (const s of o) {
    const a = lo(s);
    if (!a) continue;
    const f = pi(t, a);
    f.colliding && n.push({ ...f, targetId: s.id });
  }
  return n;
}
function gi(t) {
  let o = null;
  for (const r of t)
    (!o || (r.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = r);
  return o;
}
const co = (t) => t.reduce((o, r) => o + (r.overlapArea ?? 0), 0), X = (t) => {
  const o = typeof t == "number" ? t : Number(t ?? 0);
  if (!Number.isFinite(o)) return 0;
  const r = (o % 360 + 360) % 360;
  return r > 180 ? r - 360 : r;
}, It = (t) => t * Math.PI / 180, yt = (t) => Math.round(t * 1e9) / 1e9, mi = (t, o) => {
  const r = X(o);
  if (r === 0) return { ...t };
  const n = It(r), s = Math.cos(n), a = Math.sin(n), f = Math.abs(t.width * s) + Math.abs(t.height * a), d = Math.abs(t.width * a) + Math.abs(t.height * s);
  return {
    left: yt(t.left + (t.width - f) / 2),
    top: yt(t.top + (t.height - d) / 2),
    width: yt(f),
    height: yt(d)
  };
}, xi = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), uo = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, fo = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, jn = /* @__PURE__ */ new Set(["left", "right"]), Ze = /* @__PURE__ */ new Set(["top", "bottom"]), Je = (t) => uo.test(t) || fo.test(t), yi = (t, o) => Je(t) || jn.has(t) ? Je(o) || o === "center" || Ze.has(o) : Ze.has(t) ? o === "center" || jn.has(o) : t === "center", ho = (t) => {
  if (!t) return "center";
  const o = t.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => xi.has(n) || uo.test(n) || fo.test(n)
  ) || o.length === 2 && !yi(o[0], o[1]) ? "center" : o.join(" ");
}, Vt = (t, o, r) => {
  const n = { x: o / 2, y: r / 2 }, a = ho(t).split(" ");
  let f = null, d = null;
  const z = (M) => {
    f === null ? f = M : d === null && (d = M);
  };
  for (const M of a)
    if (M === "left") f = 0;
    else if (M === "right") f = o;
    else if (M === "top") d = 0;
    else if (M === "bottom") d = r;
    else if (M === "center") z(f === null ? o / 2 : r / 2);
    else if (M.endsWith("%")) {
      const h = Number(M.slice(0, -1));
      if (!Number.isFinite(h)) return n;
      z(h / 100 * (f === null ? o : r));
    } else {
      const h = Number.parseFloat(M);
      if (!Number.isFinite(h)) return n;
      z(h);
    }
  return { x: f ?? o / 2, y: d ?? r / 2 };
}, vi = (t, o, r) => {
  const n = mi(t, o), s = X(o);
  if (s === 0) return n;
  const a = It(s), f = Math.cos(a), d = Math.sin(a), z = t.width / 2 - r.x, M = t.height / 2 - r.y, h = yt(z * f - M * d - z), b = yt(z * d + M * f - M);
  return {
    left: yt(n.left + h),
    top: yt(n.top + b),
    width: n.width,
    height: n.height
  };
}, bi = (t, o, r) => {
  const n = X(r);
  if (n === 0) return { x: t, y: o };
  const s = It(n), a = Math.cos(s), f = Math.sin(s);
  return {
    x: yt(t * a + o * f),
    y: yt(-t * f + o * a)
  };
}, to = (t) => (t % 360 + 540) % 360 - 180, eo = (t, o, r) => {
  if (o.length === 0 || !Number.isFinite(r)) return t;
  const n = X(t);
  let s = null, a = 1 / 0;
  for (const f of o) {
    if (!Number.isFinite(f)) continue;
    const d = Math.abs(to(X(f) - n));
    d < a && (a = d, s = t + to(X(f) - n));
  }
  return s === null || a > r ? t : Mi(s);
}, Mi = (t) => Math.abs(t) < 1e-9 ? 0 : t, ht = 1e-7, Se = (t) => Math.round(t * 1e9) / 1e9, wi = (t) => ({ x: Se(t.x), y: Se(t.y) }), le = (t) => {
  const o = X(t.angle), r = It(o), n = Math.cos(r), s = Math.sin(r), a = t.origin.x, f = t.origin.y;
  return [
    { x: 0, y: 0 },
    { x: t.width, y: 0 },
    { x: t.width, y: t.height },
    { x: 0, y: t.height }
  ].map((z) => {
    const M = z.x - a, h = z.y - f;
    return wi({
      x: t.left + a + M * n - h * s,
      y: t.top + f + M * s + h * n
    });
  });
}, Te = (t) => {
  if (X(t.angle) === 0)
    return { left: t.left, top: t.top, width: t.width, height: t.height };
  const o = le(t), r = o.map((f) => f.x), n = o.map((f) => f.y), s = Math.min(...r), a = Math.min(...n);
  return {
    left: s,
    top: a,
    width: Se(Math.max(...r) - s),
    height: Se(Math.max(...n) - a)
  };
}, tn = (t, o) => t.x * o.y - t.y * o.x, no = (t, o) => {
  let r = 1 / 0, n = -1 / 0;
  for (const s of t) {
    const a = s.x * o.x + s.y * o.y;
    a < r && (r = a), a > n && (n = a);
  }
  return { min: r, max: n };
}, oo = (t) => {
  const o = [];
  for (let r = 0; r < t.length; r += 1) {
    const n = t[(r + 1) % t.length], s = n.x - t[r].x, a = n.y - t[r].y, f = Math.hypot(s, a);
    f < ht || o.push({ x: -a / f, y: s / f });
  }
  return o;
}, io = (t) => ({
  x: t.reduce((o, r) => o + r.x, 0) / t.length,
  y: t.reduce((o, r) => o + r.y, 0) / t.length
}), Ii = (t, o) => {
  let r = t;
  for (let n = 0; n < o.length && r.length > 0; n += 1) {
    const s = o[n], a = o[(n + 1) % o.length], f = { x: a.x - s.x, y: a.y - s.y }, d = (b) => tn(f, { x: b.x - s.x, y: b.y - s.y }), z = r;
    r = [];
    let M = z[z.length - 1], h = d(M);
    for (const b of z) {
      const l = d(b);
      if (l >= 0) {
        if (h < 0) {
          const C = h / (h - l);
          r.push({
            x: M.x + (b.x - M.x) * C,
            y: M.y + (b.y - M.y) * C
          });
        }
        r.push(b);
      } else if (h >= 0) {
        const C = h / (h - l);
        r.push({
          x: M.x + (b.x - M.x) * C,
          y: M.y + (b.y - M.y) * C
        });
      }
      M = b, h = l;
    }
  }
  return r;
}, Ri = (t) => {
  if (t.length < 3) return 0;
  let o = 0;
  for (let r = 0; r < t.length; r += 1) {
    const n = t[(r + 1) % t.length];
    o += t[r].x * n.y - n.x * t[r].y;
  }
  return Math.abs(o) / 2;
}, Zt = (t, o) => {
  const r = le(t), n = le(o);
  let s = 1 / 0, a = null;
  const f = io(r), d = io(n), z = [...oo(n), ...oo(r)];
  for (const h of z) {
    const b = no(r, h), l = no(n, h), C = Math.min(b.max, l.max) - Math.max(b.min, l.min);
    if (C <= ht)
      return { overlapping: !1, depth: 0, normal: null, overlapArea: 0 };
    const N = C < s - ht, S = !N && C <= s + ht && (a === null || Math.abs(h.x) > Math.abs(a.x));
    if (N || S) {
      s = Math.min(s, C);
      const R = (f.x - d.x) * h.x + (f.y - d.y) * h.y >= 0 ? 1 : -1;
      a = { x: h.x * R, y: h.y * R };
    }
  }
  const M = Ii(r, n);
  return {
    overlapping: !0,
    depth: s,
    normal: a ?? { x: 0, y: 0 },
    overlapArea: Ri(M)
  };
}, zi = (t) => {
  const o = Array.from(
    new Map(t.map((a) => [`${a.x},${a.y}`, a])).values()
  ).sort((a, f) => a.x === f.x ? a.y - f.y : a.x - f.x);
  if (o.length <= 2) return o;
  const r = (a, f, d) => (f.x - a.x) * (d.y - a.y) - (f.y - a.y) * (d.x - a.x), n = [];
  for (const a of o) {
    for (; n.length >= 2 && r(n[n.length - 2], n[n.length - 1], a) <= 0; )
      n.pop();
    n.push(a);
  }
  const s = [];
  for (let a = o.length - 1; a >= 0; a -= 1) {
    const f = o[a];
    for (; s.length >= 2 && r(s[s.length - 2], s[s.length - 1], f) <= 0; )
      s.pop();
    s.push(f);
  }
  return n.pop(), s.pop(), [...n, ...s];
}, Ai = (t, o) => {
  const r = le(t), n = le(o), s = [];
  for (const a of n)
    for (const f of r)
      s.push({ x: a.x - f.x, y: a.y - f.y });
  return zi(s);
}, Si = (t, o) => {
  if (o.length < 3) return null;
  let r = 0, n = 1;
  for (let s = 0; s < o.length; s += 1) {
    const a = o[s], f = o[(s + 1) % o.length], d = { x: f.x - a.x, y: f.y - a.y }, z = tn(d, t), M = tn(d, a);
    if (Math.abs(z) < ht) {
      if (M > -ht) return null;
      continue;
    }
    const h = M / z;
    z > 0 ? r = Math.max(r, h) : n = Math.min(n, h);
  }
  return r < n - ht && n > ht && r < 1 - ht ? { entry: r, exit: n } : null;
}, en = (t, o, r) => {
  if (o.x === 0 && o.y === 0) return null;
  let n = null;
  const s = Te(t);
  for (const a of r) {
    if (a.width <= 0 || a.height <= 0) continue;
    const f = Te(a), d = Math.min(
      s.left + s.width + Math.max(o.x, 0),
      f.left + f.width
    ) - Math.max(s.left + Math.min(o.x, 0), f.left), z = Math.min(
      s.top + s.height + Math.max(o.y, 0),
      f.top + f.height
    ) - Math.max(s.top + Math.min(o.y, 0), f.top);
    if (d <= ht || z <= ht) continue;
    const M = Ai(t, a), h = Si(o, M);
    h && (!n || h.entry < n.interval.entry) && (n = { interval: h, target: a, targetId: a.id });
  }
  return n;
}, we = (t, o) => ({
  ...t,
  left: t.left + o.x,
  top: t.top + o.y
}), nn = (t, o, r) => ({
  left: t.left + (o.left - t.left) * r,
  top: t.top + (o.top - t.top) * r,
  width: t.width + (o.width - t.width) * r,
  height: t.height + (o.height - t.height) * r,
  angle: t.angle + (o.angle - t.angle) * r,
  origin: {
    x: t.origin.x + (o.origin.x - t.origin.x) * r,
    y: t.origin.y + (o.origin.y - t.origin.y) * r
  }
}), po = (t, o) => t.width === o.width && t.height === o.height && X(t.angle) === X(o.angle) && t.origin.x === o.origin.x && t.origin.y === o.origin.y, Ti = (t, o, r, n = {}) => {
  const s = Math.max(1, n.steps ?? 16), a = n.refinements ?? 20;
  if (po(t, o)) {
    const h = en(t, { x: o.left - t.left, y: o.top - t.top }, r);
    return h ? Math.max(0, h.interval.entry - ht) : 1;
  }
  const f = (h) => {
    const b = nn(t, o, h);
    return r.some((l) => Zt(b, l).overlapping);
  };
  let d = 0, z = 1, M = !1;
  for (let h = 1; h <= s; h += 1) {
    const b = h / s;
    if (f(b)) {
      z = b, M = !0;
      break;
    }
    d = b;
  }
  if (!M) return 1;
  for (let h = 0; h < a; h += 1) {
    const b = (d + z) / 2;
    f(b) ? z = b : d = b;
  }
  return d;
}, go = (t, o, r) => ({
  left: t.left + (o.left - t.left) * r,
  top: t.top + (o.top - t.top) * r,
  width: t.width + (o.width - t.width) * r,
  height: t.height + (o.height - t.height) * r
}), Di = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height, Qe = (t, o, r, n) => {
  if (!Ae(t, o, r))
    return { rect: o, progress: 1 };
  let s = 0, a = 1, f = t;
  for (let d = 0; d < 24; d += 1) {
    const z = (s + a) / 2, M = n(go(t, o, z));
    Ae(t, M, r) ? a = z : (f = M, s = z);
  }
  return { rect: f, progress: s };
}, Pi = (t) => Math.abs(t.x) >= Math.abs(t.y) ? t.x > 0 ? "right" : "left" : t.y > 0 ? "bottom" : "top", Oi = (t) => ({
  x: Math.round(t.x * 1e4) / 1e4,
  y: Math.round(t.y * 1e4) / 1e4
}), Ei = (t) => ({
  results: t,
  dominant: gi(t),
  totalOverlapArea: co(t)
}), Ie = (t, o) => {
  const r = /* @__PURE__ */ new Map();
  return o.forEach((n, s) => {
    if (n.width <= 0 || n.height <= 0) return;
    const a = Zt(t, n);
    a.overlapping && r.set(s, a.overlapArea);
  }), r;
}, ao = (t, o) => {
  let r = 0;
  t.forEach((s) => {
    r += s;
  });
  let n = 0;
  for (const [s, a] of o) {
    n += a;
    const f = t.get(s);
    if (f === void 0 || a > f) return !1;
  }
  return n < r;
}, Ci = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height;
function Ni(t) {
  const o = xt([]), r = xt(!1), n = (h) => (o.value = h, r.value = h.length > 0, Ei(h)), s = (h, b) => {
    const C = t().enabled ? qe(h, b) : [];
    return n(C);
  }, a = (h, b) => {
    if (!t().enabled) return n([]);
    const C = [];
    for (const N of b) {
      if (N.width <= 0 || N.height <= 0) continue;
      const S = Zt(h, N);
      S.overlapping && C.push({
        colliding: !0,
        direction: S.normal ? Pi(S.normal) : void 0,
        normal: S.normal ? Oi(S.normal) : void 0,
        overlap: S.depth,
        overlapArea: S.overlapArea,
        targetId: N.id
      });
    }
    return n(C);
  }, f = (h, b, l) => {
    const C = t(), N = a(b, l);
    if (!C.enabled || C.allowOverlap)
      return { accepted: !0, rect: b, progress: 1, ...N };
    const S = Ie(h, l);
    if (S.size > 0)
      return {
        accepted: ao(S, Ie(b, l)),
        rect: b,
        progress: 1,
        ...N
      };
    const R = { x: b.left - h.left, y: b.top - h.top };
    if (R.x === 0 && R.y === 0)
      return { accepted: !0, rect: b, progress: 1, ...N };
    const G = en(h, R, l);
    if (!G)
      return { accepted: !0, rect: b, progress: 1, ...N };
    const { interval: x } = G, I = Math.min(1e-3, x.entry), v = we(h, {
      x: R.x * (x.entry - I),
      y: R.y * (x.entry - I)
    }), P = we(h, {
      x: R.x * (x.entry + (x.exit - x.entry) * 1e-3),
      y: R.y * (x.entry + (x.exit - x.entry) * 1e-3)
    }), H = Zt(P, G.target), $ = {
      x: R.x * (1 - x.entry),
      y: R.y * (1 - x.entry)
    }, k = (B, tt) => {
      const nt = en(B, tt, l);
      if (!nt) return we(B, tt);
      const st = Math.min(1e-3, nt.interval.entry);
      return we(B, {
        x: tt.x * (nt.interval.entry - st),
        y: tt.y * (nt.interval.entry - st)
      });
    };
    let L = v;
    const _ = H.normal;
    if (_) {
      const B = { x: -_.y, y: _.x }, tt = B.x * $.x + B.y * $.y, nt = tt >= 0 ? 1 : -1;
      Math.abs(tt) > 1e-9 && (L = k(L, {
        x: B.x * nt * Math.abs(tt),
        y: B.y * nt * Math.abs(tt)
      }));
    }
    const U = { x: L.left - v.left, y: L.top - v.top }, Q = $.x - U.x, J = $.y - U.y;
    Q !== 0 && Math.sign(Q) === Math.sign($.x) && (L = k(L, { x: Q, y: 0 })), J !== 0 && Math.sign(J) === Math.sign($.y) && (L = k(L, { x: 0, y: J }));
    const O = a(L, l), q = O.results.length > 0 ? O : a(P, l), j = R.x * R.x + R.y * R.y > 0 ? ((L.left - h.left) * R.x + (L.top - h.top) * R.y) / (R.x * R.x + R.y * R.y) : 1;
    return {
      accepted: !Ci(L, h),
      rect: L,
      progress: Math.max(0, Math.min(1, j)),
      ...q
    };
  };
  return {
    collisions: o,
    isColliding: r,
    evaluate: s,
    evaluateOriented: a,
    resolveCandidate: (h, b, l, C = (S) => S, N = "path") => {
      const S = t(), R = s(h, l);
      if (!S.enabled || S.allowOverlap)
        return { accepted: !0, rect: h, progress: 1, ...R };
      const G = qe(b, l), x = co(G);
      if (x > 0)
        return {
          accepted: R.totalOverlapArea < x,
          rect: h,
          progress: 1,
          ...R
        };
      const I = Ae(b, h, l);
      if (R.results.length === 0 && !I)
        return { accepted: !0, rect: h, progress: 1, ...R };
      let v = R;
      if (R.results.length === 0 && I) {
        const H = go(
          b,
          h,
          I.entry + (I.exit - I.entry) * 1e-3
        );
        v = n(qe(H, l));
      }
      let P = null;
      if (N === "slide") {
        const H = Qe(
          b,
          { ...b, left: h.left },
          l,
          C
        ), $ = Qe(
          b,
          { ...b, top: h.top },
          l,
          C
        ), k = C({
          ...h,
          left: H.rect.left,
          top: $.rect.top
        });
        Ae(b, k, l) || (P = { rect: k });
      }
      return P ?? (P = Qe(b, h, l, C)), {
        accepted: !Di(P.rect, b),
        rect: P.rect,
        progress: P.progress,
        ...v
      };
    },
    resolveOrientedTranslation: f,
    resolveOrientedChange: (h, b, l) => {
      const C = t(), N = a(b, l);
      if (!C.enabled || C.allowOverlap)
        return { accepted: !0, rect: b, progress: 1, ...N };
      const S = Ie(h, l);
      if (S.size > 0)
        return {
          accepted: ao(S, Ie(b, l)),
          rect: b,
          progress: 1,
          ...N
        };
      if (po(h, b))
        return f(h, b, l);
      const R = Ti(h, b, l), G = nn(h, b, R), x = a(G, l);
      let I = x;
      if (x.results.length === 0 && R < 1) {
        const v = nn(h, b, R + (1 - R) * 1e-3);
        I = a(v, l);
      }
      return {
        accepted: R > 0,
        rect: G,
        progress: R,
        ...I
      };
    },
    clearCollisions: () => {
      o.value = [], r.value = !1;
    }
  };
}
const y = (t, o = 0) => {
  if (t == null || t === "")
    return o;
  const r = typeof t == "string" ? Number(t) : t;
  return Number.isFinite(r) ? r : o;
}, Et = (t, o, r) => Math.min(Math.max(t, o), r), Hi = (t, o) => y(t.left) === y(o.left) && y(t.top) === y(o.top) && y(t.width) === y(o.width) && y(t.height) === y(o.height), Li = {
  tl: { x: -1, y: -1 },
  tm: { x: 0, y: -1 },
  tr: { x: 1, y: -1 },
  ml: { x: -1, y: 0 },
  mr: { x: 1, y: 0 },
  bl: { x: -1, y: 1 },
  bm: { x: 0, y: 1 },
  br: { x: 1, y: 1 }
}, Bi = (t, o, r) => {
  switch (t) {
    case "tl":
      return { x: 0, y: 0 };
    case "tm":
      return { x: o / 2, y: 0 };
    case "tr":
      return { x: o, y: 0 };
    case "ml":
      return { x: 0, y: r / 2 };
    case "mr":
      return { x: o, y: r / 2 };
    case "bl":
      return { x: 0, y: r };
    case "bm":
      return { x: o / 2, y: r };
    case "br":
      return { x: o, y: r };
    default:
      return { x: o, y: r };
  }
}, an = (t, o, r) => {
  switch (t) {
    case "tl":
      return { x: o, y: r };
    case "tm":
      return { x: o / 2, y: r };
    case "tr":
      return { x: 0, y: r };
    case "ml":
      return { x: o, y: r / 2 };
    case "mr":
      return { x: 0, y: r / 2 };
    case "bl":
      return { x: o, y: 0 };
    case "bm":
      return { x: o / 2, y: 0 };
    case "br":
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}, on = (t, o, r, n) => {
  const s = Vt(r, t.width, t.height), a = It(X(o)), f = Math.cos(a), d = Math.sin(a), z = n.x - s.x, M = n.y - s.y;
  return {
    x: t.left + s.x + z * f - M * d,
    y: t.top + s.y + z * d + M * f
  };
}, De = (t) => Math.abs(t) < 1e-9 ? 0 : t, Re = (t, o, r) => Math.min(Math.max(t, o), Math.max(o, r)), Fi = (t) => {
  const { start: o, angle: r, originSpec: n, handle: s, pointerDelta: a } = t, f = X(r), d = Li[s], z = on(
    o,
    f,
    n,
    an(s, o.width, o.height)
  ), M = on(
    o,
    f,
    n,
    Bi(s, o.width, o.height)
  ), h = {
    x: M.x + a.x,
    y: M.y + a.y
  }, b = It(f), l = Math.cos(b), C = Math.sin(b), N = { x: h.x - z.x, y: h.y - z.y }, S = {
    x: N.x * l + N.y * C,
    y: -N.x * C + N.y * l
  };
  let R = d.x === 0 ? o.width : De(d.x * S.x), G = d.y === 0 ? o.height : De(d.y * S.y);
  const x = Math.max(0, t.minWidth ?? 0), I = Math.max(0, t.minHeight ?? 0), v = Number.isFinite(t.maxWidth) ? Math.max(0, t.maxWidth ?? 1 / 0) : 1 / 0, P = Number.isFinite(t.maxHeight) ? Math.max(0, t.maxHeight ?? 1 / 0) : 1 / 0;
  if (t.ratio && t.ratio > 0) {
    const H = t.ratio;
    d.x !== 0 && (d.y === 0 || Math.abs(S.x) >= Math.abs(S.y) * H) ? (R = Re(R, Math.min(x, v), v), G = R / H, G < I ? (G = I, R = G * H) : G > P && (G = P, R = G * H)) : (G = Re(G, Math.min(I, P), P), R = G * H, R < x ? (R = x, G = R / H) : R > v && (R = v, G = R / H));
  } else
    R = Re(R, Math.min(x, v), v), G = Re(G, Math.min(I, P), P);
  return mo(
    { left: o.left, top: o.top, width: R, height: G },
    f,
    n,
    s,
    z
  );
}, mo = (t, o, r, n, s) => {
  const a = Vt(r, t.width, t.height), f = an(n, t.width, t.height), d = It(X(o)), z = Math.cos(d), M = Math.sin(d), h = f.x - a.x, b = f.y - a.y;
  return {
    ...t,
    left: De(s.x - a.x - (h * z - b * M)),
    top: De(s.y - a.y - (h * M + b * z))
  };
}, xo = Symbol("MovableGroupContext"), ki = 2, at = (t, o = 1) => {
  if (t == null || t === "")
    return o;
  const r = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(r) ? o : r;
}, ze = (t, o = "px") => t == null || t === "" ? "0" : `${t}${o}`;
function re(t, o, r, n) {
  t && t.addEventListener(o, r, n);
}
function se(t, o, r, n) {
  t && t.removeEventListener(o, r, n);
}
const je = (t, o = 1, r = ki) => {
  const n = new oi(t).toDecimalPlaces(r).toNumber();
  return at(n, o);
}, qt = (t) => {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Date)
    return new Date(t.getTime());
  if (t instanceof Array)
    return t.map((o) => qt(o));
  if (t instanceof Object) {
    const o = {};
    for (const r in t)
      t.hasOwnProperty(r) && (o[r] = qt(t[r]));
    return o;
  }
  return t;
}, Wi = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], Gi = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], $i = Pe({
  name: "VueMovableBox"
}), Vi = /* @__PURE__ */ Pe({
  ...$i,
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
    canRotate: {
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
    /** Resize semantics: incremental local delta (default) or fixed world-space anchor. */
    resizeMode: {
      type: String,
      default: "local-delta"
    },
    /** Snap angles in degrees for rotation; snapping is off when omitted or empty. */
    rotationSnapAngles: { type: Array, default: void 0 },
    /** Snap distance in degrees for rotationSnapAngles. */
    rotationSnapThreshold: { type: Number, default: 10 },
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
    /**
     * Collision semantics: 'precise' (default since v3.2.0) resolves against true rotated
     * contours with continuous collision detection; 'aabb' keeps the pre-3.2 behavior.
     */
    collisionMode: {
      type: String,
      default: "precise"
    },
    snapTargets: { type: Array, default: () => [] },
    /**
     * Obstacles for collision, separate from snapping. Defaults to snapTargets when
     * omitted; an explicit empty array means there are no collision obstacles.
     */
    collisionTargets: { type: Array, default: void 0 },
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
  setup(t, { expose: o, emit: r }) {
    var En;
    const n = t, s = r, a = (e) => qt(e), f = xt(), d = xt(a(n.modelValue)), z = xt(X(n.rotate)), M = a(n.modelValue), h = xt(null), b = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, l = Jo({
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
      beforeInteraction: a(n.modelValue),
      beforeRotation: X(n.rotate),
      rotationStartPointerAngle: 0,
      rotationOriginX: 0,
      rotationOriginY: 0,
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    $t(
      () => n.modelValue,
      (e) => {
        d.value = a(e);
      },
      { deep: !0 }
    ), $t(
      () => n.rotate,
      (e) => {
        z.value = X(e);
      }
    ), $t(
      () => n.active,
      (e) => {
        !e && l.isInteracting ? pe() : H(e);
      },
      { flush: "sync" }
    ), $t(
      () => n.disabled,
      (e) => {
        s("disabled", e), e && pe();
      }
    ), $t(
      () => n.initRect,
      (e) => {
        e && pe();
      }
    ), $t(
      () => n.isKeepDecimals,
      (e, i) => {
        !e && i && v({
          ...d.value,
          left: Math.round(y(d.value.left)),
          top: Math.round(y(d.value.top)),
          width: Math.round(y(d.value.width)),
          height: Math.round(y(d.value.height))
        });
      }
    );
    const C = ft(() => n.resizable ?? n.resizeable ?? !0), N = ft(() => n.unitType === "%"), S = ft(() => z.value), R = ft(() => ho(n.transformOrigin)), G = ft(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : l.active ? n.theme : n.inActiveColor,
      left: ze(d.value.left, n.unitType),
      top: ze(d.value.top, n.unitType),
      width: ze(d.value.width, n.unitType),
      height: ze(d.value.height, n.unitType),
      zIndex: d.value.zIndex,
      cursor: n.disabled ? "not-allowed" : l.isDragging ? "move" : l.isResizing ? "nwse-resize" : l.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: l.active ? 1 : 0.9,
      transform: S.value ? `rotate(${S.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: R.value,
      willChange: l.isDragging || l.isResizing ? "left, top, width, height" : l.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !l.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), x = ft(() => ({
      borderColor: C.value ? n.theme : n.inActiveColor,
      scale: je(1 / at(n.scale, 1), 1)
    })), I = ft(() => {
      const e = Math.abs(at(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / e}px`,
        "--rotation-handle-scale": je(1 / e, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), v = (e) => {
      const i = a(e);
      return d.value = i, s("update:modelValue", a(i)), i;
    }, P = (e) => {
      const i = X(E(X(e)));
      return z.value = i, s("update:rotate", i), s("rotate", i), i;
    };
    function H(e) {
      l.active !== e && (l.active = e, s(e ? "active" : "inactive", a(d.value)), e || He());
    }
    const $ = () => {
      var i, u, c;
      let e = null;
      if (n.limitAreaClass)
        try {
          e = document.querySelector(n.limitAreaClass);
        } catch {
          e = null;
        }
      l.parentElement = e ?? ((i = f.value) == null ? void 0 : i.parentElement) ?? null, l.parentWidth = ((u = l.parentElement) == null ? void 0 : u.clientWidth) ?? 0, l.parentHeight = ((c = l.parentElement) == null ? void 0 : c.clientHeight) ?? 0;
    }, k = (e) => Math.max(0, Number(e) || 0), L = () => {
      const e = k(n.edgeDistance);
      return {
        top: e + k(n.boundsMargin.top),
        right: e + k(n.boundsMargin.right),
        bottom: e + k(n.boundsMargin.bottom),
        left: e + k(n.boundsMargin.left)
      };
    }, _ = () => {
      const e = L(), i = N.value ? 100 : l.parentWidth, u = N.value ? 100 : l.parentHeight;
      return {
        minLeft: e.left,
        maxRight: Math.max(e.left, i - e.right),
        minTop: e.top,
        maxBottom: Math.max(e.top, u - e.bottom)
      };
    }, U = (e) => {
      const i = _();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - e.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - e.height)
      };
    }, Q = (e) => ({
      left: y(e.left),
      top: y(e.top),
      width: y(e.width),
      height: y(e.height)
    }), J = () => ({
      x: N.value && l.parentWidth > 0 ? l.parentWidth / 100 : 1,
      y: N.value && l.parentHeight > 0 ? l.parentHeight / 100 : 1
    }), O = (e) => {
      const i = Q(e), u = S.value;
      if (!u) return i;
      const c = J(), m = {
        left: i.left * c.x,
        top: i.top * c.y,
        width: i.width * c.x,
        height: i.height * c.y
      }, p = Vt(n.transformOrigin, m.width, m.height), g = vi(m, u, p);
      return {
        left: g.left / c.x,
        top: g.top / c.y,
        width: g.width / c.x,
        height: g.height / c.y
      };
    }, q = (e, i, u) => {
      const c = J(), m = e.left * c.x, p = e.top * c.y, g = e.width * c.x, A = e.height * c.y;
      return {
        left: m,
        top: p,
        width: g,
        height: A,
        angle: i,
        origin: Vt(u, g, A)
      };
    }, j = (e, i = S.value) => q(Q(e), i, n.transformOrigin), B = (e) => {
      const i = J(), u = {
        left: y(e.left) * i.x,
        top: y(e.top) * i.y,
        width: y(e.width) * i.x,
        height: y(e.height) * i.y
      };
      return {
        ...u,
        id: e.id,
        angle: X(e.rotate ?? 0),
        origin: Vt(e.transformOrigin ?? "center", u.width, u.height)
      };
    }, tt = () => un().map(B), nt = () => {
      if (!n.snapToElements) return cn();
      const e = J();
      return cn().map((i) => {
        if (!X(i.rotate ?? 0)) return i;
        const u = Te(B(i));
        return {
          left: u.left / e.x,
          top: u.top / e.y,
          width: u.width / e.x,
          height: u.height / e.y,
          id: i.id
        };
      });
    }, st = () => n.collisionEnabled && !n.allowOverlap && ce.value, Rt = (e, i, u) => {
      const c = (g) => {
        const A = j(g);
        let D = 0;
        for (const T of u) {
          const F = Zt(A, T);
          F.overlapping && (D += F.overlapArea);
        }
        return D;
      }, m = c(i), p = (g) => m > 0 ? c(g) < m : c(g) === 0;
      if (p(e)) return e;
      for (let g = 0.8; g > 0.01; g -= 0.2) {
        const A = {
          ...e,
          left: E(
            y(i.left) + (y(e.left) - y(i.left)) * g
          ),
          top: E(
            y(i.top) + (y(e.top) - y(i.top)) * g
          )
        };
        if (p(A)) return A;
      }
      return i;
    }, Ct = (e, i, u) => {
      const c = tt(), m = j(i), p = j(e), g = u === "slide" ? ue.resolveOrientedTranslation(m, p, c) : ue.resolveOrientedChange(m, p, c);
      if (pn(g), !g.accepted) return null;
      const A = J(), D = {
        ...e,
        left: E(g.rect.left / A.x),
        top: E(g.rect.top / A.y),
        width: E(g.rect.width / A.x),
        height: E(g.rect.height / A.y)
      };
      return st() ? Rt(D, i, c) : D;
    }, ut = () => n.collisionEnabled && !n.allowOverlap && ce.value, Jt = (e) => {
      if (!n.limitAreaForParent || !l.parentElement) return !1;
      const i = _(), u = Te(j(d.value, e)), c = J(), m = u.left / c.x, p = u.top / c.y, g = u.width / c.x, A = u.height / c.y, D = 1e-7;
      return m < i.minLeft - D || m + g > i.maxRight + D || p < i.minTop - D || p + A > i.maxBottom + D;
    }, zt = (e, i) => {
      if (Jt(e)) return !0;
      if (!ut() || i.length === 0) return !1;
      const u = j(d.value, e);
      return i.some((c) => Zt(u, c).overlapping);
    }, rn = (e, i) => Math.max(48, Math.ceil(Math.abs(i - e) / 2)), vo = (e, i, u) => {
      let c = e, m = i, p = !1;
      const g = rn(e, i);
      for (let D = 1; D <= g; D += 1) {
        const T = e + (i - e) * D / g;
        if (zt(T, u)) {
          m = T, p = !0;
          break;
        }
        c = T;
      }
      if (!p) return i;
      let A = c;
      for (let D = 0; D < 20; D += 1) {
        const T = (A + m) / 2;
        zt(T, u) ? m = T : A = T;
      }
      return A;
    }, sn = (e, i) => {
      if (!ce.value || Math.abs(i - e) < 1e-9) return X(i);
      const u = tt();
      if (zt(e, u)) {
        const c = rn(e, i);
        for (let m = 1; m <= c; m += 1) {
          const p = e + (i - e) * m / c;
          if (!zt(p, u))
            return X(E(p));
        }
        return X(e);
      }
      return X(E(vo(e, i, u)));
    }, ln = (e, i) => {
      const u = S.value;
      if (!u && n.resizeMode !== "fixed-anchor" || !n.limitAreaForParent || !l.parentElement)
        return e;
      const c = _(), m = Math.max(0, c.maxRight - c.minLeft), p = Math.max(0, c.maxBottom - c.minTop), g = It(u), A = Math.abs(Math.cos(g)) < 1e-9 ? 0 : Math.abs(Math.cos(g)), D = Math.abs(Math.sin(g)) < 1e-9 ? 0 : Math.abs(Math.sin(g)), T = J(), F = A, W = D * (T.y / T.x), Z = D * (T.x / T.y), it = A, Y = y(e.width), V = y(e.height), w = i ? b[i] : null, rt = y(e.left) + Y, Kt = y(e.top) + V, Lt = (lt, dt) => ({
        ...e,
        left: w != null && w.left ? E(rt - lt) : e.left,
        top: w != null && w.top ? E(Kt - dt) : e.top,
        width: lt,
        height: dt
      }), pt = (lt, dt) => ({
        ...e,
        left: w != null && w.left ? rt - lt : e.left,
        top: w != null && w.top ? Kt - dt : e.top,
        width: lt,
        height: dt
      }), ne = F * Y + W * V, me = Z * Y + it * V, Dt = Math.max(0, at(n.minWidth, 0)), bt = Math.max(0, at(n.minHeight, 0)), oe = i === null || !!(w != null && w.left || w != null && w.right), ie = i === null || !!(w != null && w.top || w != null && w.bottom), Bt = (w == null ? void 0 : w.left) ?? !1, gt = (w == null ? void 0 : w.top) ?? !1, Pt = (lt, dt) => {
        if (!Bt && !gt) return lt;
        const mt = y(lt.width), Yt = y(lt.height), Hn = dt ? Math.min(
          1,
          Math.max(
            mt > 0 ? Dt / mt : 0,
            Yt > 0 ? bt / Yt : 0
          )
        ) : 0, Ln = dt ? mt * Hn : Bt ? Math.min(mt, Dt) : mt, Bn = dt ? Yt * Hn : gt ? Math.min(Yt, bt) : Yt, Fn = (ot) => ({
          width: Ln + (mt - Ln) * ot,
          height: Bn + (Yt - Bn) * ot
        }), kn = (ot) => {
          const et = Fn(ot);
          return pt(et.width, et.height);
        }, Xt = (ot) => {
          const et = Fn(ot), ct = n.isKeepDecimals ? E : Math.floor;
          return Lt(
            Math.max(Dt, ct(et.width)),
            Math.max(bt, ct(et.height))
          );
        }, xe = (ot) => {
          const et = O(ot), ct = 1e-7;
          return (!Bt || et.left >= c.minLeft - ct && et.left + et.width <= c.maxRight + ct) && (!gt || et.top >= c.minTop - ct && et.top + et.height <= c.maxBottom + ct);
        };
        if (xe(lt)) return lt;
        const Ut = O(kn(0)), _t = O(kn(1));
        let Ot = 0, wt = 1, Ve = !0;
        const Wn = (ot, et, ct) => {
          const Ft = et - ot;
          if (Math.abs(Ft) < 1e-9) {
            ot < ct && (Ve = !1);
            return;
          }
          const ae = (ct - ot) / Ft;
          Ft > 0 ? Ot = Math.max(Ot, ae) : wt = Math.min(wt, ae);
        }, Gn = (ot, et, ct) => {
          const Ft = et - ot;
          if (Math.abs(Ft) < 1e-9) {
            ot > ct && (Ve = !1);
            return;
          }
          const ae = (ct - ot) / Ft;
          Ft > 0 ? wt = Math.min(wt, ae) : Ot = Math.max(Ot, ae);
        };
        if (Bt && (Wn(Ut.left, _t.left, c.minLeft), Gn(
          Ut.left + Ut.width,
          _t.left + _t.width,
          c.maxRight
        )), gt && (Wn(Ut.top, _t.top, c.minTop), Gn(
          Ut.top + Ut.height,
          _t.top + _t.height,
          c.maxBottom
        )), Ot = Math.max(0, Ot), wt = Math.min(1, wt), !Ve || Ot > wt) return Xt(0);
        const $n = Xt(wt);
        if (xe($n)) return $n;
        let ye = Ot, Vn = wt;
        if (!xe(Xt(ye))) return Xt(0);
        for (let ot = 0; ot < 32; ot += 1) {
          const et = (ye + Vn) / 2;
          xe(Xt(et)) ? ye = et : Vn = et;
        }
        return Xt(ye);
      };
      if (n.ratioLock || oe && ie) {
        const lt = Math.min(
          1,
          ne > m ? m / ne : 1,
          me > p ? p / me : 1
        ), dt = Math.max(
          lt,
          Y > 0 ? Dt / Y : 0,
          V > 0 ? bt / V : 0
        ), mt = Math.min(dt, 1);
        return mt >= 1 ? Pt(e, !0) : Pt(
          Lt(
            Math.max(Dt, Math.floor(Y * mt)),
            Math.max(bt, Math.floor(V * mt))
          ),
          !0
        );
      }
      const Mt = Math.floor(
        Math.min(
          F > 0 ? (m - W * V) / F : 1 / 0,
          Z > 0 ? (p - it * V) / Z : 1 / 0
        )
      ), $e = Math.floor(
        Math.min(
          W > 0 ? (m - F * Y) / W : 1 / 0,
          it > 0 ? (p - Z * Y) / it : 1 / 0
        )
      ), Cn = oe ? Math.max(Dt, Math.min(Y, Mt)) : Y, Nn = ie ? Math.max(bt, Math.min(V, $e)) : V;
      return Pt(Cn === Y && Nn === V ? e : Lt(Cn, Nn), !1);
    }, Oe = (e) => {
      if (!l.parentElement) return;
      const i = _(), u = O(e), c = u.left, m = u.top, p = c + u.width, g = m + u.height;
      c < i.minLeft && s("out-of-bounds", "left"), p > i.maxRight && s("out-of-bounds", "right"), m < i.minTop && s("out-of-bounds", "top"), g > i.maxBottom && s("out-of-bounds", "bottom");
    }, Ee = (e) => {
      if (!n.limitAreaForParent || !l.parentElement) return e;
      const i = O(e), u = U(i), c = Et(i.left, u.minLeft, u.maxLeft), m = Et(i.top, u.minTop, u.maxTop);
      return S.value ? {
        ...e,
        left: E(y(e.left) + (c - i.left)),
        top: E(y(e.top) + (m - i.top))
      } : {
        ...e,
        left: c,
        top: m
      };
    }, K = Qo(xo, null), At = n.memberId || `member-${((En = jo()) == null ? void 0 : En.uid) ?? Math.random().toString(36).slice(2)}`;
    let St = !1;
    const bo = {
      getRect: () => a(d.value),
      getVisualRect: () => O(a(d.value)),
      translateTo: (e) => {
        v(e);
      },
      getAreaEdges: () => ($(), l.parentElement ? _() : null)
    };
    ti(() => K == null ? void 0 : K.registerMember(At, bo));
    const cn = () => K ? n.snapTargets.filter((e) => !K.hasMember(e.id)) : n.snapTargets, un = () => {
      const e = n.collisionTargets === void 0 ? n.snapTargets : n.collisionTargets;
      return K ? e.filter((i) => !K.hasMember(i.id)) : e;
    }, E = (e) => n.isKeepDecimals ? je(e, 0, n.decimalPlaces) : Math.round(e), Ce = (e, i) => {
      if (!N.value) return E(e);
      const u = i === "horizontal" ? l.parentWidth : l.parentHeight;
      return u > 0 ? E(e / u * 100) : 0;
    }, fn = (e, i) => {
      const u = at(n.scale, 1), c = e / (u === 0 ? 1 : u);
      return Ce(c, i);
    }, hn = fi(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Tt = hi(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), ce = ft(() => n.collisionMode !== "aabb"), ue = Ni(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), dn = Tt.guides;
    let Qt = "clear", jt = "clear", te = "clear";
    const fe = /* @__PURE__ */ new Set(["left", "right", "center-x"]), he = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Ne = (e) => {
      const i = {
        horizontal: e.points.some((g) => fe.has(g)) ? e.targetIds.horizontal : void 0,
        vertical: e.points.some((g) => he.has(g)) ? e.targetIds.vertical : void 0
      }, u = e.snapped ? qt(e.spacing ?? []) : [], c = e.snapped ? {
        snapped: !0,
        point: e.snapPoint,
        points: e.points,
        targetId: e.targetId,
        targetIds: i,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, m = JSON.stringify({
        payload: c,
        left: e.points.some((g) => fe.has(g)) ? e.left : void 0,
        top: e.points.some((g) => he.has(g)) ? e.top : void 0
      });
      m !== Qt && ((e.snapped || Qt !== "clear") && s("snap", c), Qt = e.snapped ? m : "clear");
      const p = JSON.stringify({ guides: e.guides, targetIds: i });
      p !== jt && ((e.snapped || jt !== "clear") && s("guides", qt(e.guides)), jt = e.snapped ? p : "clear");
    }, pn = (e) => {
      const i = e.dominant, u = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId,
        normal: i.normal ? { ...i.normal } : void 0
      } : { colliding: !1 }, c = JSON.stringify(u);
      c !== te && ((i || te !== "clear") && s("collision", u), te = i ? c : "clear");
    }, He = () => {
      Qt !== "clear" && s("snap", { snapped: !1 }), jt !== "clear" && s("guides", { vertical: [], horizontal: [] }), te !== "clear" && s("collision", { colliding: !1 }), Qt = "clear", jt = "clear", te = "clear", Tt.clearGuides(), ue.clearCollisions();
    }, Le = (e, i, u = "path") => {
      if (ce.value)
        return Ct(e, i, u);
      const c = O(e), m = ue.resolveCandidate(
        c,
        O(i),
        un(),
        (p) => ({
          left: E(p.left),
          top: E(p.top),
          width: E(p.width),
          height: E(p.height)
        }),
        u
      );
      if (pn(m), !m.accepted) return null;
      if (S.value) {
        if (u === "path" && m.progress !== void 0) {
          const p = Et(m.progress, 0, 1), g = Q(i), A = Q(e);
          return {
            ...e,
            left: E(
              g.left + (A.left - g.left) * p
            ),
            top: E(g.top + (A.top - g.top) * p),
            width: E(
              g.width + (A.width - g.width) * p
            ),
            height: E(
              g.height + (A.height - g.height) * p
            )
          };
        }
        return {
          ...e,
          left: E(y(e.left) + (m.rect.left - c.left)),
          top: E(y(e.top) + (m.rect.top - c.top))
        };
      }
      return { ...e, ...m.rect };
    }, gn = (e, i, u, c, m) => {
      let p = a(e);
      c.horizontal && (p.left = hn.snapValue(y(e.left))), c.vertical && (p.top = hn.snapValue(y(e.top)));
      let g = {
        ...Q(p),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const D = O(p);
        g = Tt.resolveSnap(D, nt(), c), S.value ? p = {
          ...p,
          left: E(y(p.left) + (g.left - D.left)),
          top: E(y(p.top) + (g.top - D.top))
        } : p = { ...p, left: g.left, top: g.top };
      } else
        Tt.clearGuides();
      if (m) {
        const D = y(m.left), T = y(m.top);
        n.dragDirections.includes("left") || (p.left = Math.max(D, y(p.left))), n.dragDirections.includes("right") || (p.left = Math.min(D, y(p.left))), n.dragDirections.includes("top") || (p.top = Math.max(T, y(p.top))), n.dragDirections.includes("bottom") || (p.top = Math.min(T, y(p.top)));
      }
      Oe(p), p = Ee(p);
      const A = Le(p, i, "slide");
      if (!A)
        return Ne({
          ...g,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Tt.clearGuides(), null;
      if (p = A, g.snapped) {
        const D = O(p), T = E(D.left) !== E(g.left), F = E(D.top) !== E(g.top), W = g.points.filter((w) => fe.has(w) ? !T : he.has(w) ? !F : !1), Z = W.some((w) => fe.has(w)), it = W.some((w) => he.has(w)), Y = g.spacing.filter(
          (w) => w.axis === "horizontal" ? !T : !F
        ), V = {
          vertical: Y.flatMap((w) => w.axis === "horizontal" ? w.guides : []),
          horizontal: Y.flatMap((w) => w.axis === "vertical" ? w.guides : [])
        };
        g = {
          ...g,
          left: y(p.left),
          top: y(p.top),
          snapped: W.length > 0 || Y.length > 0,
          snapPoint: W[0],
          points: W,
          targetId: Z ? g.targetIds.horizontal : it ? g.targetIds.vertical : void 0,
          targetIds: {
            horizontal: Z ? g.targetIds.horizontal : void 0,
            vertical: it ? g.targetIds.vertical : void 0
          },
          guides: {
            vertical: Z ? g.guides.vertical : V.vertical,
            horizontal: it ? g.guides.horizontal : V.horizontal
          },
          spacing: Y
        }, g.snapped ? Tt.setGuides(g.guides) : Tt.clearGuides();
      }
      return Ne(g), p;
    }, Be = (e) => n.resizeDirections.includes(e), mn = (e, i, u) => {
      if (n.resizeMode !== "fixed-anchor") {
        const W = bi(u.x, u.y, S.value), Z = {
          x: Ce(W.x, "horizontal"),
          y: Ce(W.y, "vertical")
        };
        return Mo(e, i, Z.x, Z.y);
      }
      const c = J(), m = y(e.width), p = y(e.height), g = Math.max(0, at(n.minWidth, 0)), A = Math.max(0, at(n.minHeight, 0)), D = at(n.maxWidth, 1 / 0), T = at(n.maxHeight, 1 / 0), F = Fi({
        start: {
          left: y(e.left) * c.x,
          top: y(e.top) * c.y,
          width: m * c.x,
          height: p * c.y
        },
        angle: S.value,
        originSpec: n.transformOrigin,
        handle: i,
        pointerDelta: u,
        minWidth: g * c.x,
        minHeight: A * c.y,
        maxWidth: D > 0 ? D * c.x : 1 / 0,
        maxHeight: T > 0 ? T * c.y : 1 / 0,
        ratio: n.ratioLock && m > 0 && p > 0 ? m * c.x / (p * c.y) : null
      });
      return {
        ...e,
        left: E(F.left / c.x),
        top: E(F.top / c.y),
        width: E(F.width / c.x),
        height: E(F.height / c.y)
      };
    }, xn = (e, i, u) => {
      const c = J(), m = S.value, p = {
        left: y(e.left) * c.x,
        top: y(e.top) * c.y,
        width: y(e.width) * c.x,
        height: y(e.height) * c.y
      }, g = on(
        p,
        m,
        n.transformOrigin,
        an(u, p.width, p.height)
      ), A = mo(
        {
          left: y(i.left) * c.x,
          top: y(i.top) * c.y,
          width: y(i.width) * c.x,
          height: y(i.height) * c.y
        },
        m,
        n.transformOrigin,
        u,
        g
      ), D = {
        ...i,
        left: E(A.left / c.x),
        top: E(A.top / c.y)
      };
      if (!n.limitAreaForParent || !l.parentElement) return D;
      const T = _(), F = O(D), W = 1e-7;
      return F.left >= T.minLeft - W && F.left + F.width <= T.maxRight + W && F.top >= T.minTop - W && F.top + F.height <= T.maxBottom + W ? D : i;
    }, Mo = (e, i, u, c) => {
      const m = b[i], p = y(e.left), g = y(e.top), A = y(e.width), D = y(e.height);
      let T = p, F = p + A, W = g, Z = g + D;
      m.left && (T += u), m.right && (F += u), m.top && (W += c), m.bottom && (Z += c);
      const it = (T + F) / 2, Y = (W + Z) / 2;
      let V = Math.max(0, F - T), w = Math.max(0, Z - W);
      const rt = A > 0 && D > 0 ? A / D : 1, Kt = (Mt) => {
        V = Mt, m.left ? T = F - V : m.right ? F = T + V : (T = it - V / 2, F = it + V / 2);
      }, Lt = (Mt) => {
        w = Mt, m.top ? W = Z - w : m.bottom ? Z = W + w : (W = Y - w / 2, Z = Y + w / 2);
      };
      if (n.ratioLock) {
        const Mt = Math.abs(V - A), $e = Math.abs(w - D) * rt;
        i === "tm" || i === "bm" || $e > Mt ? Kt(w * rt) : Lt(V / rt);
      }
      const pt = _(), ne = n.limitAreaForParent && !!l.parentElement && S.value === 0, me = ne ? m.left ? Math.max(0, F - pt.minLeft) : m.right ? Math.max(0, pt.maxRight - T) : Math.max(
        0,
        2 * Math.min(it - pt.minLeft, pt.maxRight - it)
      ) : 1 / 0, Dt = ne ? m.top ? Math.max(0, Z - pt.minTop) : m.bottom ? Math.max(0, pt.maxBottom - W) : Math.max(
        0,
        2 * Math.min(Y - pt.minTop, pt.maxBottom - Y)
      ) : 1 / 0, bt = Math.max(0, at(n.minWidth, 0)), oe = Math.max(0, at(n.minHeight, 0)), ie = at(n.maxWidth, 1 / 0), Bt = at(n.maxHeight, 1 / 0);
      let gt = Math.min(ie > 0 ? ie : 1 / 0, me), Pt = Math.min(Bt > 0 ? Bt : 1 / 0, Dt);
      if (n.ratioLock) {
        gt = Math.min(gt, Pt * rt);
        const Mt = Math.max(bt, oe * rt);
        Kt(Et(V, Mt, gt)), Lt(V / rt);
      } else
        Kt(Et(V, Math.min(bt, gt), gt)), Lt(Et(w, Math.min(oe, Pt), Pt));
      return {
        ...e,
        left: E(T),
        top: E(W),
        width: E(F - T),
        height: E(Z - W)
      };
    };
    let vt = null, Nt = null;
    const yn = (e, i, u) => Math.atan2(e.clientY - u, e.clientX - i) * 180 / Math.PI + 90, vn = (e) => {
      if (n.disabled || n.initRect || !l.isInteracting) return;
      if (l.isRotating) {
        const m = yn(
          e,
          l.rotationOriginX,
          l.rotationOriginY
        ), p = X(m - l.rotationStartPointerAngle), g = eo(
          l.beforeRotation + p,
          n.rotationSnapAngles ?? [],
          n.rotationSnapThreshold
        );
        P(sn(l.beforeRotation, g));
        return;
      }
      const i = fn(e.clientX - l.initX, "horizontal"), u = fn(e.clientY - l.initY, "vertical"), c = a(d.value);
      if (l.isDragging) {
        const m = l.beforeInteraction;
        let p = y(m.left) + i, g = y(m.top) + u;
        const A = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: u < 0 && n.dragDirections.includes("top") || u > 0 && n.dragDirections.includes("bottom")
        };
        A.horizontal || (p = y(m.left)), A.vertical || (g = y(m.top));
        const D = {
          ...m,
          left: E(p),
          top: E(g)
        };
        let T = gn(D, c, n.snapToElements, A, m);
        if (T && St && (T = (K == null ? void 0 : K.constrainPosition(At, T)) ?? null), T) {
          const F = v(T);
          s("move", a(F)), s("drag", a(F)), St && (K == null || K.notifyMoved(At, a(F)));
        }
      }
      if (l.isResizing && l.handle) {
        Ne({
          ...Q(c),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Tt.clearGuides();
        const m = at(n.scale, 1), p = m === 0 ? 1 : m, g = {
          x: (e.clientX - l.initX) / p,
          y: (e.clientY - l.initY) / p
        };
        let A = mn(l.beforeInteraction, l.handle, g);
        (S.value || n.resizeMode === "fixed-anchor") && (A = ln(A, l.handle), A = Ee(A), n.resizeMode === "fixed-anchor" && (A = xn(l.beforeInteraction, A, l.handle))), Oe(A);
        const D = Le(A, c);
        if (D) {
          const T = v(D);
          s("resize", a(T));
        }
      }
    }, wo = (e) => {
      !l.active || n.disabled || n.initRect || (Nt = e, vt === null && (vt = requestAnimationFrame(() => {
        vt = null;
        const i = Nt;
        Nt = null, i && vn(i);
      })));
    }, de = (e) => l.pointerId === null || e.pointerId === l.pointerId, bn = (e) => {
      de(e) && wo(e);
    }, Mn = (e) => {
      de(e) && Do(e);
    }, wn = (e) => {
      de(e) && ee(e);
    }, In = (e) => {
      de(e) && l.isInteracting && ee(e);
    }, Rn = (e) => {
      e.key === "Escape" && l.isInteracting && (e.preventDefault(), e.stopPropagation(), ee(e));
    }, zn = () => {
      const e = l.eventElement;
      if (!e) return;
      const i = { passive: !1 };
      re(e, "pointermove", bn, i), re(e, "pointerup", Mn, i), re(e, "pointercancel", wn, i), re(e, "keydown", Rn, !0);
      const u = f.value;
      u && re(u, "lostpointercapture", In, i);
    }, Io = () => {
      const e = l.eventElement;
      if (!e) return;
      se(e, "pointermove", bn, !1), se(e, "pointerup", Mn, !1), se(e, "pointercancel", wn, !1), se(e, "keydown", Rn, !0);
      const i = f.value;
      i && se(i, "lostpointercapture", In, !1), l.eventElement = null;
    }, An = () => {
      const e = f.value;
      if (!(!e || l.pointerId === null))
        try {
          e.setPointerCapture(l.pointerId);
        } catch {
        }
    }, Ro = () => {
      const e = f.value, i = l.pointerId;
      if (l.pointerId = null, !(!e || i === null))
        try {
          e.hasPointerCapture(i) && e.releasePointerCapture(i);
        } catch {
        }
    };
    function Fe() {
      vt !== null && (cancelAnimationFrame(vt), vt = null), Nt = null;
    }
    function ke() {
      l.interactionMode = "idle", l.handle = null, St = !1, Io(), Ro();
    }
    function Sn() {
      He(), n.active || H(!1);
    }
    function Tn() {
      ke(), Sn();
    }
    function pe() {
      Fe(), St && (K == null || K.abortDrag(At)), Tn();
    }
    function ee(e = null) {
      const i = l.isDragging, u = l.isResizing, c = l.isRotating, m = St;
      if (Fe(), ke(), i || u) {
        const p = a(l.beforeInteraction);
        v(p), s(i ? "drag-cancel" : "resize-cancel", e, p, a(p)), i && m && (K == null || K.cancelDrag(At, e));
      }
      c && (z.value = l.beforeRotation, s("update:rotate", l.beforeRotation), s("rotate-cancel", e, l.beforeRotation, l.beforeRotation)), Sn();
    }
    function Dn() {
      pe(), H(!1);
    }
    const zo = (e, i) => {
      var c, m;
      if (n.disabled || n.initRect || l.isInteracting || i && (!C.value || !Be(i)) || !i && !n.draggable) return;
      const u = a(d.value);
      if (i) {
        if (((c = n.canResize) == null ? void 0 : c.call(n, u, i)) === !1) return;
      } else if (((m = n.canDrag) == null ? void 0 : m.call(n, u)) === !1)
        return;
      if (St = !1, !i && K) {
        const p = K.beginDrag(At, e);
        if (p === "blocked") return;
        St = p === "group";
      }
      $(), l.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, l.initX = e.clientX, l.initY = e.clientY, l.beforeInteraction = a(d.value), l.handle = i, l.interactionMode = i ? "resize" : "drag", H(!0), l.isDragging && s("drag-start", e, a(l.beforeInteraction)), l.isResizing && s("resize-start", e, a(l.beforeInteraction)), l.eventElement = document.documentElement, zn(), An();
    }, Ao = () => {
      const e = f.value;
      if (!e) return null;
      const i = e.getBoundingClientRect(), u = e.offsetWidth || y(d.value.width), c = e.offsetHeight || y(d.value.height);
      if (!u || !c) return null;
      const m = It(S.value), p = Math.cos(m), g = Math.sin(m), A = Math.abs(p) * u + Math.abs(g) * c, D = Math.abs(g) * u + Math.abs(p) * c, T = [
        A ? i.width / A : 0,
        D ? i.height / D : 0
      ].filter((w) => Number.isFinite(w) && w > 0), F = Math.abs(at(n.scale, 1)) || 1, W = T.length ? T.reduce((w, rt) => w + rt, 0) / T.length : F, Z = Vt(n.transformOrigin, u, c), it = Z.x * W, Y = Z.y * W, V = [
        [-it, -Y],
        [u * W - it, -Y],
        [u * W - it, c * W - Y],
        [-it, c * W - Y]
      ].map(([w, rt]) => ({
        x: w * p - rt * g,
        y: w * g + rt * p
      }));
      return {
        x: i.left - Math.min(...V.map((w) => w.x)),
        y: i.top - Math.min(...V.map((w) => w.y))
      };
    }, So = (e) => {
      var u;
      if (!e.isPrimary || e.button !== 0 || n.disabled || n.initRect || !n.rotatable || l.isInteracting || ((u = n.canRotate) == null ? void 0 : u.call(n, a(d.value))) === !1) return;
      $();
      const i = Ao();
      i && (l.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, l.beforeRotation = z.value, l.rotationOriginX = i.x, l.rotationOriginY = i.y, l.rotationStartPointerAngle = yn(e, i.x, i.y), l.interactionMode = "rotate", H(!0), s("rotate-start", e, l.beforeRotation), l.eventElement = document.documentElement, zn(), An());
    }, To = (e) => {
      if (!(e instanceof Element)) return !0;
      const i = f.value;
      if (!i) return !0;
      const u = (c) => {
        try {
          const m = e.closest(c);
          return {
            valid: !0,
            matched: m instanceof Element && i.contains(m)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (n.dragCancel) {
        const c = u(n.dragCancel);
        if (!c.valid || c.matched) return !1;
      }
      if (n.dragHandle) {
        const c = u(n.dragHandle);
        return c.valid && c.matched;
      }
      return !0;
    }, Pn = (e, i) => {
      !e.isPrimary || e.button !== 0 || !i && !To(e.target) || zo(e, i);
    };
    function Do(e) {
      vt !== null && (cancelAnimationFrame(vt), vt = null), Nt && (vn(Nt), Nt = null), l.isDragging && (s("drag-stop", e, a(l.beforeInteraction), a(d.value)), St && (K == null || K.endDrag(At, e))), l.isResizing && s("resize-stop", e, a(l.beforeInteraction), a(d.value)), l.isRotating && s("rotate-stop", e, l.beforeRotation, z.value), Tn();
    }
    const Po = (e, i) => {
      var p;
      $();
      const u = a(d.value);
      if (((p = n.canDrag) == null ? void 0 : p.call(n, a(u))) === !1) return;
      const c = a(u);
      e === "left" && (c.left = y(c.left) - i), e === "right" && (c.left = y(c.left) + i), e === "top" && (c.top = y(c.top) - i), e === "bottom" && (c.top = y(c.top) + i);
      const m = gn(
        c,
        u,
        n.snapToElements,
        {
          horizontal: e === "left" || e === "right",
          vertical: e === "top" || e === "bottom"
        },
        u
      );
      if (m) {
        const g = v(m);
        s("move", a(g));
      }
    }, Oo = (e, i, u) => {
      var T;
      if (!C.value || !Be(e)) return;
      $();
      const c = a(d.value);
      if (((T = n.canResize) == null ? void 0 : T.call(n, a(c), e)) === !1) return;
      const m = i === "left" ? -u : i === "right" ? u : 0, p = i === "top" ? -u : i === "bottom" ? u : 0;
      let g = mn(c, e, {
        x: We(m),
        y: Ge(p)
      });
      (S.value || n.resizeMode === "fixed-anchor") && (g = ln(g, e), g = Ee(g), n.resizeMode === "fixed-anchor" && (g = xn(c, g, e))), Oe(g);
      const A = Le(g, c);
      if (!A || Hi(A, c)) return;
      const D = v(A);
      s("resize", a(D));
    }, Eo = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Co = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Ht = (e) => Co.has(e), No = (e) => Ht(e) ? "group" : "separator", Ho = (e) => Ht(e) ? "two-axis resize handle" : void 0, Lo = (e) => `Resize ${Eo[e]}`, Bo = (e) => {
      if (!Ht(e))
        return e === "ml" || e === "mr" ? "vertical" : "horizontal";
    }, ge = (e) => e === "ml" || e === "mr", On = (e) => {
      if (!Ht(e))
        return y(ge(e) ? d.value.width : d.value.height);
    }, Fo = (e) => {
      if (!Ht(e))
        return y(ge(e) ? n.minWidth : n.minHeight);
    }, ko = (e) => {
      if (Ht(e)) return;
      const i = ge(e) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const u = y(i);
      return Number.isFinite(u) ? u : void 0;
    }, Wo = (e) => {
      const i = On(e);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, Go = (e) => {
      if (n.keyboardEnabled)
        return Ht(e) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : ge(e) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, $o = (e) => {
      e.target === f.value && n.keyboardEnabled && !n.disabled && !n.initRect && H(!0);
    }, Vo = [
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
    ].join(","), Ko = (e) => {
      const i = e.target, u = f.value;
      if (!(i instanceof Element) || !u || i === u || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return e.key !== "Escape";
      const c = i.closest(Vo);
      return c !== null && c !== u && u.contains(c);
    }, Yo = si(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: l.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: h.value,
        interacting: l.isInteracting
      }),
      {
        move: Po,
        resize: Oo,
        deactivate: Dn,
        cancel: (e) => ee(e)
      }
    ), Xo = (e) => {
      Ko(e) || Yo.handleKeyDown(e);
    }, Uo = (e) => {
      var g;
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(e.key) || ((g = n.canRotate) == null ? void 0 : g.call(n, a(d.value))) === !1) return;
      e.preventDefault(), e.stopPropagation(), $();
      const i = z.value, u = so(n.keyboardStep) * (e.shiftKey ? 10 : 1), c = e.key === "Home" ? 0 : i + (e.key === "ArrowLeft" ? -u : u), m = eo(c, n.rotationSnapAngles ?? [], n.rotationSnapThreshold);
      s("rotate-start", e, i);
      const p = P(sn(i, m));
      s("rotate-stop", e, i, p);
    }, We = (e) => N.value ? e / 100 * l.parentWidth : e, Ge = (e) => N.value ? e / 100 * l.parentHeight : e, _o = ft(() => {
      const e = We(y(d.value.left)), i = Ge(y(d.value.top)), u = {
        left: `${-e}px`,
        top: `${-i}px`,
        width: `${l.parentWidth}px`,
        height: `${l.parentHeight}px`
      }, c = S.value;
      if (c) {
        const m = J(), p = Vt(
          n.transformOrigin,
          y(d.value.width) * m.x,
          y(d.value.height) * m.y
        );
        u.transform = `rotate(${-c}deg)`, u.transformOrigin = `${p.x + e}px ${p.y + i}px`;
      }
      return u;
    }), qo = (e) => ({
      left: `${We(e)}px`,
      top: "0px",
      height: `${l.parentHeight}px`,
      borderColor: n.theme
    }), Zo = (e) => ({
      top: `${Ge(e)}px`,
      left: "0px",
      width: `${l.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => a(d.value),
      setPosition: (e, i) => v({ ...d.value, left: e, top: i }),
      setSize: (e, i) => v({ ...d.value, width: e, height: i }),
      reset: () => v(a(M)),
      activate: () => H(!0),
      deactivate: Dn,
      cancelInteraction: (e = null) => ee(e)
    }), ei(() => {
      Fe(), ke(), K == null || K.unregisterMember(At), He();
    }), (e, i) => (kt(), Wt("div", {
      ref_key: "movableRef",
      ref: f,
      class: Kn(["auto-draggable", {
        "select-none": t.disabledUserSelect,
        "is-disabled": t.disabled,
        "is-active": l.active,
        "is-dragging": l.isDragging,
        "is-resizing": l.isResizing,
        "is-rotating": l.isRotating,
        "is-readonly": t.initRect
      }]),
      style: Gt(G.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (u) => Pn(u, null)),
      onDblclick: i[2] || (i[2] = (u) => s("dblclick", u)),
      onFocus: $o,
      onKeydown: Xo
    }, [
      ve("div", {
        class: "movable-box-guides-layer",
        style: Gt(_o.value),
        "aria-hidden": "true"
      }, [
        (kt(!0), Wt(Ke, null, Ye(Yn(dn).vertical, (u, c) => (kt(), Wt("div", {
          key: `vertical-${c}`,
          class: "movable-box-guide movable-box-guide--vertical",
          style: Gt(qo(u))
        }, null, 4))), 128)),
        (kt(!0), Wt(Ke, null, Ye(Yn(dn).horizontal, (u, c) => (kt(), Wt("div", {
          key: `horizontal-${c}`,
          class: "movable-box-guide movable-box-guide--horizontal",
          style: Gt(Zo(u))
        }, null, 4))), 128))
      ], 4),
      Xe(ve("div", {
        class: "rotation-handle-connector",
        style: Gt(I.value),
        "aria-hidden": "true"
      }, null, 4), [
        [Ue, l.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      Xe(ve("div", {
        class: "rotation-handle",
        style: Gt(I.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": S.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${S.value} degrees`,
        "aria-keyshortcuts": t.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: Xn(So, ["stop", "prevent"]),
        onKeydown: Uo
      }, [...i[3] || (i[3] = [
        ve("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, Wi), [
        [Ue, l.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      (kt(!0), Wt(Ke, null, Ye(t.handles, (u) => Xe((kt(), Wt("div", {
        key: u,
        class: Kn(["handle", `handle-${u}`]),
        style: Gt(x.value),
        role: No(u),
        "aria-roledescription": Ho(u),
        "aria-orientation": Bo(u),
        "aria-label": Lo(u),
        "aria-valuenow": On(u),
        "aria-valuemin": Fo(u),
        "aria-valuemax": ko(u),
        "aria-valuetext": Wo(u),
        "aria-keyshortcuts": Go(u),
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: Xn((c) => Pn(c, u), ["stop", "prevent"]),
        onFocus: (c) => h.value = u,
        onBlur: i[0] || (i[0] = (c) => h.value = null)
      }, null, 46, Gi)), [
        [Ue, l.active && C.value && !t.disabled && Be(u)]
      ])), 128)),
      ro(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Ki = (t, o) => {
  const r = t.__vccOpts || t;
  for (const [n, s] of o)
    r[n] = s;
  return r;
}, Yi = /* @__PURE__ */ Ki(Vi, [["__scopeId", "data-v-b81ae872"]]), Xi = Pe({
  name: "MovableGroup"
}), Ui = /* @__PURE__ */ Pe({
  ...Xi,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(t, { expose: o, emit: r }) {
    const n = t, s = r, a = /* @__PURE__ */ new Map(), f = xt([]), d = xt(null), z = ft(() => n.selected !== void 0), M = ft({
      get: () => z.value ? n.selected ?? [] : f.value,
      set: (x) => {
        f.value = x, s("update:selected", x);
      }
    });
    $t(
      () => n.selected,
      (x) => {
        x !== void 0 && (f.value = [...x]);
      },
      { immediate: !0 }
    );
    const h = (x) => qt(x), b = (x, I, v) => ({
      ...x,
      left: y(x.left) + I,
      top: y(x.top) + v
    }), l = (x) => x.reduce(
      (I, v) => ({
        minLeft: Math.min(I.minLeft, v.left),
        minTop: Math.min(I.minTop, v.top),
        maxRight: Math.max(I.maxRight, v.left + v.width),
        maxBottom: Math.max(I.maxBottom, v.top + v.height)
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), C = (x, I, v) => {
      const P = l(x);
      return {
        left: Math.min(
          Math.max(I.left, v.minLeft - P.minLeft),
          v.maxRight - P.maxRight
        ),
        top: Math.min(
          Math.max(I.top, v.minTop - P.minTop),
          v.maxBottom - P.maxBottom
        )
      };
    }, N = (x) => {
      const I = [];
      for (const [v, P] of x) {
        const H = a.get(v);
        H && I.push({ id: v, rect: h(H.getRect()), startRect: h(P) });
      }
      return I;
    }, S = (x) => x.map(({ id: I, rect: v }) => ({ id: I, rect: v })), R = (x) => {
      const I = x.filter((P) => a.has(P)), v = M.value;
      v.length === I.length && v.every((P, H) => P === I[H]) || (M.value = I);
    };
    return ni(xo, {
      registerMember: (x, I) => {
        a.set(x, I);
      },
      unregisterMember: (x) => {
        var I;
        if (a.delete(x), ((I = d.value) == null ? void 0 : I.leaderId) === x) {
          d.value = null;
          return;
        }
        d.value && (d.value.startRects.delete(x), d.value.startVisuals.delete(x)), M.value.includes(x) && R(M.value.filter((v) => v !== x));
      },
      hasMember: (x) => x !== void 0 && a.has(x),
      beginDrag: (x, I) => {
        if (d.value && d.value.leaderId !== x)
          return d.value.startRects.has(x) ? "blocked" : "solo";
        if (!a.has(x)) return "solo";
        const v = M.value.includes(x) ? [...M.value] : [x];
        M.value.includes(x) || R(v);
        const P = /* @__PURE__ */ new Map(), H = /* @__PURE__ */ new Map();
        for (const k of v) {
          const L = a.get(k);
          L && (P.set(k, h(L.getRect())), H.set(k, { ...L.getVisualRect() }));
        }
        d.value = { leaderId: x, startRects: P, startVisuals: H };
        const $ = [];
        for (const [k, L] of P) $.push({ id: k, rect: h(L) });
        return s("move-start", { leaderId: x, source: I, rects: $ }), "group";
      },
      constrainPosition: (x, I) => {
        var L, _;
        const v = d.value, P = v == null ? void 0 : v.startRects.get(x);
        if (!v || v.leaderId !== x || !P || !a.has(x)) return I;
        const H = y(I.left) - y(P.left), $ = y(I.top) - y(P.top), k = (L = a.get(x)) == null ? void 0 : L.getAreaEdges();
        if (n.sharedBounds) {
          let U = { left: H, top: $ };
          k && (U = C([...v.startVisuals.values()], U, k));
          for (const [Q, J] of v.startRects)
            Q !== x && ((_ = a.get(Q)) == null || _.translateTo(b(J, U.left, U.top)));
          return b(P, U.left, U.top);
        }
        for (const [U, Q] of v.startRects) {
          if (U === x) continue;
          const J = a.get(U);
          if (!J) continue;
          const O = v.startVisuals.get(U), q = b(Q, H, $), j = J.getAreaEdges();
          if (j && O) {
            const B = O.left - y(Q.left), tt = O.top - y(Q.top), nt = j.minLeft - B, st = Math.max(nt, j.maxRight - B - O.width), Rt = j.minTop - tt, Ct = Math.max(Rt, j.maxBottom - tt - O.height);
            q.left = Et(y(q.left), nt, st), q.top = Et(y(q.top), Rt, Ct);
          }
          J.translateTo(q);
        }
        return I;
      },
      notifyMoved: (x, I) => {
        const v = d.value;
        if (!v || v.leaderId !== x) return;
        const P = S(N(v.startRects)).map(
          (H) => H.id === x ? { id: x, rect: h(I) } : H
        );
        s("move", { leaderId: x, rects: P });
      },
      endDrag: (x, I) => {
        const v = d.value;
        if (!v || v.leaderId !== x) return;
        const P = N(v.startRects);
        d.value = null, s("move-stop", { leaderId: x, source: I, rects: P });
      },
      cancelDrag: (x, I) => {
        var H;
        const v = d.value;
        if (!v || v.leaderId !== x) return;
        for (const [$, k] of v.startRects)
          $ !== x && ((H = a.get($)) == null || H.translateTo(h(k)));
        const P = N(v.startRects);
        d.value = null, s("move-cancel", { leaderId: x, source: I, rects: P });
      },
      abortDrag: (x) => {
        var I;
        ((I = d.value) == null ? void 0 : I.leaderId) === x && (d.value = null);
      }
    }), o({
      getSelected: () => [...M.value],
      select: (x) => R(x ?? [...a.keys()]),
      getMemberRects: () => [...a.entries()].map(([x, I]) => ({ id: x, rect: h(I.getRect()) }))
    }), (x, I) => ro(x.$slots, "default");
  }
}), yo = "VueMovableBox", _i = "3.3.0", qi = (t) => {
  t.component(yo, Yi), t.component("MovableGroup", Ui);
}, Qi = {
  name: yo,
  version: _i,
  install: qi
};
export {
  Yi as MovableBox,
  Ui as MovableGroup,
  Qi as default,
  qi as install,
  yo as name,
  _i as version
};
