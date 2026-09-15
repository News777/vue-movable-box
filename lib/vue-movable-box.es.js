import { computed as bt, ref as Ot, defineComponent as Be, reactive as pi, watch as Dt, inject as gi, getCurrentInstance as mi, onMounted as yi, onUnmounted as xi, openBlock as qt, createElementBlock as Ut, normalizeStyle as Zt, normalizeClass as oo, createElementVNode as Pe, Fragment as en, renderList as nn, unref as io, withDirectives as on, vShow as rn, withModifiers as ro, renderSlot as Ro, provide as vi } from "vue";
import bi from "decimal.js";
const Mi = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, wi = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, Ii = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, So = (t) => Number.isFinite(t) && t > 0 ? t : 1;
function Ri(t, o) {
  return { handleKeyDown: (n) => {
    const s = t(), r = s.interacting;
    if (!r && (!s.enabled || s.disabled || !s.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), r ? o.cancel(n) : o.deactivate();
      return;
    }
    if (r || s.readOnly) return;
    const f = Mi[n.key];
    if (!f) return;
    const d = So(s.step);
    if (s.focusedHandle && s.resizeDirections.includes(s.focusedHandle)) {
      if (!wi[s.focusedHandle].includes(f)) return;
      n.preventDefault(), o.resize(
        s.focusedHandle,
        n.shiftKey ? Ii[f] : f,
        d
      );
      return;
    }
    if (n.shiftKey) {
      const R = s.resizeDirections.includes("br") ? "br" : s.resizeDirections[0];
      if (!R) return;
      n.preventDefault(), o.resize(R, f, d);
      return;
    }
    s.dragDirections.includes(f) && (n.preventDefault(), o.move(f, d));
  } };
}
const De = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, ao = (t) => {
  const o = De(t.left), a = De(t.top), n = De(t.width), s = De(t.height);
  return o === null || a === null || n === null || s === null || n < 0 || s < 0 ? null : { left: o, top: a, width: n, height: s };
};
function Si(t, o) {
  const a = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(t / a) * a;
}
const so = (t, o, a) => o.distance > a ? t : !t || o.distance < t.distance ? o : t, zi = ["alignment", "spacing"], lo = (t, o, a, n) => {
  for (const s of a) {
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
    const r = n.spacing();
    if (r && r.distance <= o)
      return {
        candidate: null,
        spacing: r,
        guides: r.guides,
        spacingInfo: {
          axis: t,
          gap: r.gap,
          targetIds: r.targetIds,
          guides: r.guides
        },
        value: r.value
      };
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, co = (t, o, a, n, s) => {
  const r = (h) => t === "horizontal" ? h.left : h.top, f = (h) => t === "horizontal" ? h.left + h.width : h.top + h.height, d = [], R = [];
  for (const h of s)
    f(h.rect) <= o && d.push(h), r(h.rect) >= o + a && R.push(h);
  let M = null;
  for (const h of d)
    for (const w of R) {
      const l = r(w.rect) - f(h.rect) - a;
      if (l < 0) continue;
      const O = l / 2, N = f(h.rect) + O, z = Math.abs(o - N);
      z > n || (!M || z < M.distance) && (M = {
        distance: z,
        value: N,
        gap: O,
        guides: [f(h.rect), r(w.rect)],
        targetIds: [h.id, w.id]
      });
    }
  return M;
};
function Ai(t, o, a = 10, n = { horizontal: !0, vertical: !0 }, s = {}) {
  const r = Math.max(0, Number.isFinite(a) ? a : 10), f = t.left + t.width, d = t.top + t.height, R = t.left + t.width / 2, M = t.top + t.height / 2, h = s.priority && s.priority.length > 0 ? s.priority : zi, w = h.includes("alignment"), l = h.includes("spacing"), O = (H, Q) => s.filter ? s.filter(H, Q) !== !1 : !0, N = /* @__PURE__ */ new Map(), z = (H) => {
    let Q = N.get(H);
    return Q || (Q = {
      horizontal: n.horizontal && O(H, "horizontal"),
      vertical: n.vertical && O(H, "vertical")
    }, N.set(H, Q)), Q;
  };
  let T = null;
  const tt = () => {
    let H = null, Q = null;
    for (const et of o) {
      const F = ao(et);
      if (!F) continue;
      const _ = z(et);
      if (!_.horizontal && !_.vertical) continue;
      const q = F.left + F.width, lt = F.top + F.height, dt = F.left + F.width / 2, gt = F.top + F.height / 2, ft = et.id;
      if (_.horizontal) {
        const vt = [
          {
            distance: Math.abs(t.left - F.left),
            value: F.left,
            guide: F.left,
            point: "left",
            targetId: ft
          },
          {
            distance: Math.abs(f - q),
            value: q - t.width,
            guide: q,
            point: "right",
            targetId: ft
          },
          {
            distance: Math.abs(t.left - q),
            value: q,
            guide: q,
            point: "left",
            targetId: ft
          },
          {
            distance: Math.abs(f - F.left),
            value: F.left - t.width,
            guide: F.left,
            point: "right",
            targetId: ft
          },
          {
            distance: Math.abs(R - dt),
            value: dt - t.width / 2,
            guide: dt,
            point: "center-x",
            targetId: ft
          }
        ];
        for (const zt of vt) H = so(H, zt, r);
      }
      if (_.vertical) {
        const vt = [
          {
            distance: Math.abs(t.top - F.top),
            value: F.top,
            guide: F.top,
            point: "top",
            targetId: ft
          },
          {
            distance: Math.abs(d - lt),
            value: lt - t.height,
            guide: lt,
            point: "bottom",
            targetId: ft
          },
          {
            distance: Math.abs(t.top - lt),
            value: lt,
            guide: lt,
            point: "top",
            targetId: ft
          },
          {
            distance: Math.abs(d - F.top),
            value: F.top - t.height,
            guide: F.top,
            point: "bottom",
            targetId: ft
          },
          {
            distance: Math.abs(M - gt),
            value: gt - t.height / 2,
            guide: gt,
            point: "center-y",
            targetId: ft
          }
        ];
        for (const zt of vt) Q = so(Q, zt, r);
      }
    }
    return { x: H, y: Q };
  }, J = (H) => w ? (T || (T = tt()), H === "horizontal" ? T.x : T.y) : null, p = [], v = [];
  let b = !1;
  const I = () => {
    for (const H of o) {
      const Q = ao(H);
      if (!Q) continue;
      const et = z(H);
      et.horizontal && p.push({ rect: Q, id: H.id }), et.vertical && v.push({ rect: Q, id: H.id });
    }
    b = !0;
  }, C = (H) => l ? (b || I(), H === "horizontal" ? co(
    "horizontal",
    t.left,
    t.width,
    r,
    p
  ) : co("vertical", t.top, t.height, r, v)) : null, W = n.horizontal ? lo("horizontal", r, h, {
    alignment: () => J("horizontal"),
    spacing: () => C("horizontal")
  }) : null, E = n.vertical ? lo("vertical", r, h, {
    alignment: () => J("vertical"),
    spacing: () => C("vertical")
  }) : null, G = (W == null ? void 0 : W.candidate) ?? null, rt = (E == null ? void 0 : E.candidate) ?? null, Y = [G == null ? void 0 : G.point, rt == null ? void 0 : rt.point].filter(
    (H) => !!H
  ), U = [W == null ? void 0 : W.spacingInfo, E == null ? void 0 : E.spacingInfo].filter(
    (H) => !!H
  );
  return {
    left: (W == null ? void 0 : W.value) ?? t.left,
    top: (E == null ? void 0 : E.value) ?? t.top,
    snapped: Y.length > 0 || U.length > 0,
    snapPoint: Y[0],
    points: Y,
    targetId: (G == null ? void 0 : G.targetId) ?? (rt == null ? void 0 : rt.targetId),
    targetIds: { horizontal: G == null ? void 0 : G.targetId, vertical: rt == null ? void 0 : rt.targetId },
    guides: {
      vertical: (W == null ? void 0 : W.guides) ?? [],
      horizontal: (E == null ? void 0 : E.guides) ?? []
    },
    spacing: U
  };
}
function Ti(t) {
  const o = (s) => {
    const r = t();
    return r.snapToGrid ? Si(s, r.gridSize) : s;
  }, a = (s, r) => ({
    left: o(s),
    top: o(r)
  }), n = bt(() => {
    const s = t();
    return s.snapToGrid ? {
      size: Number.isFinite(s.gridSize) && s.gridSize > 0 ? s.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: a, gridInfo: n };
}
const an = () => ({ vertical: [], horizontal: [] });
function Pi(t) {
  const o = Ot(an()), a = Ot(null);
  return { guides: o, lastSnapResult: a, resolveSnap: (f, d, R) => {
    const M = t(), h = M.enabled ? Ai(f, d, M.threshold, R, {
      filter: M.filter,
      priority: M.priority
    }) : {
      ...f,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: an(),
      spacing: []
    };
    return o.value = h.guides, a.value = h.snapped ? h : null, h;
  }, clearGuides: () => {
    o.value = an(), a.value = null;
  }, setGuides: (f) => {
    o.value = f;
  } };
}
const Oe = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, yn = (t) => {
  const o = Oe(t.left), a = Oe(t.top), n = Oe(t.width), s = Oe(t.height);
  return o === null || a === null || n === null || s === null || n <= 0 || s <= 0 ? null : { left: o, top: a, width: n, height: s };
}, Di = (t) => yn(t) !== null, uo = (t, o, a, n) => {
  const s = a - o;
  if (s === 0) return o < n ? t : null;
  const r = (n - o) / s;
  return s > 0 ? { ...t, exit: Math.min(t.exit, r) } : { ...t, entry: Math.max(t.entry, r) };
}, fo = (t, o, a, n) => {
  const s = a - o;
  if (s === 0) return o > n ? t : null;
  const r = (n - o) / s;
  return s > 0 ? { ...t, entry: Math.max(t.entry, r) } : { ...t, exit: Math.min(t.exit, r) };
}, Oi = (t, o, a) => {
  let n = { entry: 0, exit: 1 };
  if (n = uo(n, t.left, o.left, a.left + a.width), !n || (n = fo(
    n,
    t.left + t.width,
    o.left + o.width,
    a.left
  ), !n) || (n = uo(n, t.top, o.top, a.top + a.height), !n) || (n = fo(
    n,
    t.top + t.height,
    o.top + o.height,
    a.top
  ), !n)) return null;
  const s = Math.max(0, n.entry), r = Math.min(1, n.exit);
  return s < r && r > 0 && s < 1 ? { entry: s, exit: r } : null;
};
function ve(t, o, a) {
  let n = null;
  for (const s of a) {
    const r = yn(s);
    if (!r) continue;
    const f = Oi(t, o, r);
    f && (!n || f.entry < n.entry) && (n = f);
  }
  return n;
}
function Ei(t, o) {
  const a = Math.min(t.left + t.width, o.left + o.width) - Math.max(t.left, o.left), n = Math.min(t.top + t.height, o.top + o.height) - Math.max(t.top, o.top);
  if (a <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const s = t.left + t.width / 2, r = t.top + t.height / 2, f = o.left + o.width / 2, d = o.top + o.height / 2, R = s - f, M = r - d;
  return {
    colliding: !0,
    direction: a <= n ? R > 0 ? "right" : "left" : M > 0 ? "bottom" : "top",
    overlap: Math.min(a, n),
    overlapArea: a * n
  };
}
function xe(t, o, a) {
  const n = [];
  for (const s of o) {
    const r = yn(s);
    if (!r) continue;
    const f = Ei(t, r);
    f.colliding && n.push({ ...f, targetId: s.id });
  }
  return n;
}
function Ci(t) {
  let o = null;
  for (const a of t)
    (!o || (a.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = a);
  return o;
}
const Ce = (t) => t.reduce((o, a) => o + (a.overlapArea ?? 0), 0), Z = (t) => {
  const o = typeof t == "number" ? t : Number(t ?? 0);
  if (!Number.isFinite(o)) return 0;
  const a = (o % 360 + 360) % 360;
  return a > 180 ? a - 360 : a;
}, ho = (t, o, a = 0) => {
  if (!Number.isFinite(t) || !Number.isFinite(o)) return Z(o);
  const n = Number.isInteger(a) && a >= 0 ? a : 0, s = 10 ** Math.min(n, 15), r = o * s, f = Math.max(Number.EPSILON, Math.abs(r) * Number.EPSILON * 8);
  return (o >= t ? Math.floor(r + f) : Math.ceil(r - f)) / s;
}, St = (t) => t * Math.PI / 180, Et = (t) => Math.round(t * 1e9) / 1e9, Ni = (t, o) => {
  const a = Z(o);
  if (a === 0) return { ...t };
  const n = St(a), s = Math.cos(n), r = Math.sin(n), f = Math.abs(t.width * s) + Math.abs(t.height * r), d = Math.abs(t.width * r) + Math.abs(t.height * s);
  return {
    left: Et(t.left + (t.width - f) / 2),
    top: Et(t.top + (t.height - d) / 2),
    width: Et(f),
    height: Et(d)
  };
}, Hi = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), zo = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, Ao = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, po = /* @__PURE__ */ new Set(["left", "right"]), sn = /* @__PURE__ */ new Set(["top", "bottom"]), ln = (t) => zo.test(t) || Ao.test(t), Li = (t, o) => ln(t) || po.has(t) ? ln(o) || o === "center" || sn.has(o) : sn.has(t) ? o === "center" || po.has(o) : t === "center", To = (t) => {
  if (!t) return "center";
  const o = t.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => Hi.has(n) || zo.test(n) || Ao.test(n)
  ) || o.length === 2 && !Li(o[0], o[1]) ? "center" : o.join(" ");
}, Jt = (t, o, a) => {
  const n = { x: o / 2, y: a / 2 }, r = To(t).split(" ");
  let f = null, d = null;
  const R = (M) => {
    f === null ? f = M : d === null && (d = M);
  };
  for (const M of r)
    if (M === "left") f = 0;
    else if (M === "right") f = o;
    else if (M === "top") d = 0;
    else if (M === "bottom") d = a;
    else if (M === "center") R(f === null ? o / 2 : a / 2);
    else if (M.endsWith("%")) {
      const h = Number(M.slice(0, -1));
      if (!Number.isFinite(h)) return n;
      R(h / 100 * (f === null ? o : a));
    } else {
      const h = Number.parseFloat(M);
      if (!Number.isFinite(h)) return n;
      R(h);
    }
  return { x: f ?? o / 2, y: d ?? a / 2 };
}, Bi = (t, o, a) => {
  const n = Ni(t, o), s = Z(o);
  if (s === 0) return n;
  const r = St(s), f = Math.cos(r), d = Math.sin(r), R = t.width / 2 - a.x, M = t.height / 2 - a.y, h = Et(R * f - M * d - R), w = Et(R * d + M * f - M);
  return {
    left: Et(n.left + h),
    top: Et(n.top + w),
    width: n.width,
    height: n.height
  };
}, Fi = (t, o, a) => {
  const n = Z(a);
  if (n === 0) return { x: t, y: o };
  const s = St(n), r = Math.cos(s), f = Math.sin(s);
  return {
    x: Et(t * r + o * f),
    y: Et(-t * f + o * r)
  };
}, go = (t) => (t % 360 + 540) % 360 - 180, mo = (t, o, a) => {
  if (o.length === 0 || !Number.isFinite(a)) return t;
  const n = Z(t);
  let s = null, r = 1 / 0;
  for (const f of o) {
    if (!Number.isFinite(f)) continue;
    const d = Math.abs(go(Z(f) - n));
    d < r && (r = d, s = t + go(Z(f) - n));
  }
  return s === null || r > a ? t : Wi(s);
}, Wi = (t) => Math.abs(t) < 1e-9 ? 0 : t, Mt = 1e-7, Ne = (t) => Math.round(t * 1e9) / 1e9, ki = (t) => ({ x: Ne(t.x), y: Ne(t.y) }), Qt = (t) => {
  const o = Z(t.angle), a = St(o), n = Math.cos(a), s = Math.sin(a), r = t.origin.x, f = t.origin.y;
  return [
    { x: 0, y: 0 },
    { x: t.width, y: 0 },
    { x: t.width, y: t.height },
    { x: 0, y: t.height }
  ].map((R) => {
    const M = R.x - r, h = R.y - f;
    return ki({
      x: t.left + r + M * n - h * s,
      y: t.top + f + M * s + h * n
    });
  });
}, Fe = (t) => {
  if (Z(t.angle) === 0)
    return { left: t.left, top: t.top, width: t.width, height: t.height };
  const o = Qt(t), a = o.map((f) => f.x), n = o.map((f) => f.y), s = Math.min(...a), r = Math.min(...n);
  return {
    left: s,
    top: r,
    width: Ne(Math.max(...a) - s),
    height: Ne(Math.max(...n) - r)
  };
}, yo = /* @__PURE__ */ new WeakMap(), xn = (t) => {
  let o = yo.get(t);
  return o || (o = Fe(t), yo.set(t, o)), o;
}, dn = (t, o) => t.x * o.y - t.y * o.x, xo = (t, o) => {
  let a = 1 / 0, n = -1 / 0;
  for (const s of t) {
    const r = s.x * o.x + s.y * o.y;
    r < a && (a = r), r > n && (n = r);
  }
  return { min: a, max: n };
}, vo = (t) => {
  const o = [];
  for (let a = 0; a < t.length; a += 1) {
    const n = t[(a + 1) % t.length], s = n.x - t[a].x, r = n.y - t[a].y, f = Math.hypot(s, r);
    f < Mt || o.push({ x: -r / f, y: s / f });
  }
  return o;
}, bo = (t) => ({
  x: t.reduce((o, a) => o + a.x, 0) / t.length,
  y: t.reduce((o, a) => o + a.y, 0) / t.length
}), Gi = (t, o) => {
  let a = t;
  for (let n = 0; n < o.length && a.length > 0; n += 1) {
    const s = o[n], r = o[(n + 1) % o.length], f = { x: r.x - s.x, y: r.y - s.y }, d = (w) => dn(f, { x: w.x - s.x, y: w.y - s.y }), R = a;
    a = [];
    let M = R[R.length - 1], h = d(M);
    for (const w of R) {
      const l = d(w);
      if (l >= 0) {
        if (h < 0) {
          const O = h / (h - l);
          a.push({
            x: M.x + (w.x - M.x) * O,
            y: M.y + (w.y - M.y) * O
          });
        }
        a.push(w);
      } else if (h >= 0) {
        const O = h / (h - l);
        a.push({
          x: M.x + (w.x - M.x) * O,
          y: M.y + (w.y - M.y) * O
        });
      }
      M = w, h = l;
    }
  }
  return a;
}, $i = (t) => {
  if (t.length < 3) return 0;
  let o = 0;
  for (let a = 0; a < t.length; a += 1) {
    const n = t[(a + 1) % t.length];
    o += t[a].x * n.y - n.x * t[a].y;
  }
  return Math.abs(o) / 2;
}, He = (t, o) => {
  const a = Qt(t), n = Qt(o);
  let s = 1 / 0, r = null;
  const f = bo(a), d = bo(n), R = [...vo(n), ...vo(a)];
  for (const h of R) {
    const w = xo(a, h), l = xo(n, h), O = Math.min(w.max, l.max) - Math.max(w.min, l.min);
    if (O <= Mt)
      return { overlapping: !1, depth: 0, normal: null, overlapArea: 0 };
    const N = O < s - Mt, z = !N && O <= s + Mt && (r === null || Math.abs(h.x) > Math.abs(r.x));
    if (N || z) {
      s = Math.min(s, O);
      const T = (f.x - d.x) * h.x + (f.y - d.y) * h.y >= 0 ? 1 : -1;
      r = { x: h.x * T, y: h.y * T };
    }
  }
  const M = Gi(a, n);
  return {
    overlapping: !0,
    depth: s,
    normal: r ?? { x: 0, y: 0 },
    overlapArea: $i(M)
  };
}, Vi = (t) => {
  const o = Array.from(
    new Map(t.map((r) => [`${r.x},${r.y}`, r])).values()
  ).sort((r, f) => r.x === f.x ? r.y - f.y : r.x - f.x);
  if (o.length <= 2) return o;
  const a = (r, f, d) => (f.x - r.x) * (d.y - r.y) - (f.y - r.y) * (d.x - r.x), n = [];
  for (const r of o) {
    for (; n.length >= 2 && a(n[n.length - 2], n[n.length - 1], r) <= 0; )
      n.pop();
    n.push(r);
  }
  const s = [];
  for (let r = o.length - 1; r >= 0; r -= 1) {
    const f = o[r];
    for (; s.length >= 2 && a(s[s.length - 2], s[s.length - 1], f) <= 0; )
      s.pop();
    s.push(f);
  }
  return n.pop(), s.pop(), [...n, ...s];
}, Ki = (t, o) => {
  const a = Qt(t), n = Qt(o), s = [];
  for (const r of n)
    for (const f of a)
      s.push({ x: r.x - f.x, y: r.y - f.y });
  return Vi(s);
}, Yi = (t, o) => {
  if (o.length < 3) return null;
  let a = 0, n = 1;
  for (let s = 0; s < o.length; s += 1) {
    const r = o[s], f = o[(s + 1) % o.length], d = { x: f.x - r.x, y: f.y - r.y }, R = dn(d, t), M = dn(d, r);
    if (Math.abs(R) < Mt) {
      if (M > -Mt) return null;
      continue;
    }
    const h = M / R;
    R > 0 ? a = Math.max(a, h) : n = Math.min(n, h);
  }
  return a < n - Mt && n > Mt && a < 1 - Mt ? { entry: a, exit: n } : null;
}, ae = (t, o, a) => {
  if (o.x === 0 && o.y === 0) return null;
  let n = null;
  const s = Fe(t);
  for (const r of a) {
    if (r.width <= 0 || r.height <= 0) continue;
    const f = xn(r), d = Math.min(
      s.left + s.width + Math.max(o.x, 0),
      f.left + f.width
    ) - Math.max(s.left + Math.min(o.x, 0), f.left), R = Math.min(
      s.top + s.height + Math.max(o.y, 0),
      f.top + f.height
    ) - Math.max(s.top + Math.min(o.y, 0), f.top);
    if (d <= Mt || R <= Mt) continue;
    const M = Ki(t, r), h = Yi(o, M);
    h && (!n || h.entry < n.interval.entry) && (n = { interval: h, target: r, targetId: r.id });
  }
  return n;
}, Gt = (t, o) => ({
  ...t,
  left: t.left + o.x,
  top: t.top + o.y
}), ye = (t, o, a) => ({
  left: t.left + (o.left - t.left) * a,
  top: t.top + (o.top - t.top) * a,
  width: t.width + (o.width - t.width) * a,
  height: t.height + (o.height - t.height) * a,
  angle: t.angle + (o.angle - t.angle) * a,
  origin: {
    x: t.origin.x + (o.origin.x - t.origin.x) * a,
    y: t.origin.y + (o.origin.y - t.origin.y) * a
  }
}), Po = (t, o) => t.width === o.width && t.height === o.height && Z(t.angle) === Z(o.angle) && t.origin.x === o.origin.x && t.origin.y === o.origin.y, vn = (t, o) => t > 0 ? o < t : o === 0, Do = (t, o, a = Fe(t)) => {
  if (o.length === 0) return !1;
  for (const n of o) {
    if (n.width <= 0 || n.height <= 0) continue;
    const s = xn(n), r = Math.min(a.left + a.width, s.left + s.width) - Math.max(a.left, s.left), f = Math.min(a.top + a.height, s.top + s.height) - Math.max(a.top, s.top);
    if (!(r <= 0 || f <= 0) && He(t, n).overlapping)
      return !0;
  }
  return !1;
}, Oo = (t, o, a = 20) => {
  if (!Number.isFinite(o)) return 0;
  const n = Math.max(1, Math.floor(o));
  let s = 0, r = 1, f = !1;
  for (let d = 1; d <= n; d += 1) {
    const R = d / n;
    if (t(R)) {
      r = R, f = !0;
      break;
    }
    s = R;
  }
  if (!f) return 1;
  for (let d = 0; d < a; d += 1) {
    const R = (s + r) / 2;
    t(R) ? r = R : s = R;
  }
  return s;
}, Mo = (t, o, a) => {
  if (a.length === 0) return 1;
  if (Po(t, o)) {
    const s = ae(t, { x: o.left - t.left, y: o.top - t.top }, a);
    return s ? Math.max(0, s.interval.entry - Mt) : 1;
  }
  return Oo((s) => Do(ye(t, o, s), a), Eo(t, o, a));
}, Xi = (t) => {
  let o = 1 / 0;
  for (const a of t)
    a.width <= 0 || a.height <= 0 || (o = Math.min(o, a.width, a.height));
  return o;
}, wo = 16, _i = 512, qi = 8, Eo = (t, o, a) => {
  const n = (O, N) => Math.hypot(N.x - O.left - O.origin.x, N.y - O.top - O.origin.y), s = Math.max(
    ...Qt(t).map((O) => n(t, O)),
    ...Qt(o).map((O) => n(o, O))
  ), r = o.origin.x - t.origin.x, f = o.origin.y - t.origin.y, d = o.width - t.width, R = o.height - t.height, M = Math.max(
    Math.hypot(-r, -f),
    Math.hypot(d - r, -f),
    Math.hypot(-r, R - f),
    Math.hypot(d - r, R - f)
  ), h = Math.abs(o.left - t.left) + Math.abs(o.top - t.top) + Math.hypot(r, f) + M + s * St(Math.abs(o.angle - t.angle));
  if (!Number.isFinite(h) || h <= 0) return wo;
  const w = Xi(a), l = Number.isFinite(w) ? Math.max(1, w / 4) : qi;
  return Math.min(_i, Math.max(wo, Math.ceil(h / l)));
}, Co = (t, o, a) => ({
  left: t.left + (o.left - t.left) * a,
  top: t.top + (o.top - t.top) * a,
  width: t.width + (o.width - t.width) * a,
  height: t.height + (o.height - t.height) * a
}), Ui = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height, cn = (t, o, a, n) => {
  if (!ve(t, o, a))
    return { rect: o, progress: 1 };
  let s = 0, r = 1, f = t;
  for (let d = 0; d < 24; d += 1) {
    const R = (s + r) / 2, M = n(Co(t, o, R));
    ve(t, M, a) ? r = R : (f = M, s = R);
  }
  return { rect: f, progress: s };
}, Zi = (t) => Math.abs(t.x) >= Math.abs(t.y) ? t.x > 0 ? "right" : "left" : t.y > 0 ? "bottom" : "top", Ji = (t) => ({
  x: Math.round(t.x * 1e4) / 1e4,
  y: Math.round(t.y * 1e4) / 1e4
}), un = (t, o) => Math.min(1e-3, 0.5 / Math.max(1, t), o), ji = (t) => ({
  results: t,
  dominant: Ci(t),
  totalOverlapArea: Ce(t)
}), Rt = (t, o) => {
  const a = /* @__PURE__ */ new Map();
  return o.forEach((n, s) => {
    if (n.width <= 0 || n.height <= 0) return;
    const r = He(t, n);
    r.overlapping && a.set(s, r.overlapArea);
  }), a;
}, jt = (t, o) => {
  let a = 0;
  t.forEach((s) => {
    a += s;
  });
  let n = 0;
  for (const [s, r] of o) {
    n += r;
    const f = t.get(s);
    if (f === void 0 || r > f) return !1;
  }
  return vn(a, n);
}, pn = (t, o) => t.filter((a, n) => !o.has(n)), Io = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height;
function Qi(t) {
  const o = Ot([]), a = Ot(!1), n = (h) => (o.value = h, a.value = h.length > 0, ji(h)), s = (h, w) => {
    const O = t().enabled ? xe(h, w) : [];
    return n(O);
  }, r = (h, w) => {
    if (!t().enabled) return n([]);
    const O = [];
    for (const N of w) {
      if (N.width <= 0 || N.height <= 0) continue;
      const z = He(h, N);
      z.overlapping && O.push({
        colliding: !0,
        direction: z.normal ? Zi(z.normal) : void 0,
        normal: z.normal ? Ji(z.normal) : void 0,
        overlap: z.depth,
        overlapArea: z.overlapArea,
        targetId: N.id
      });
    }
    return n(O);
  }, f = (h, w, l) => {
    const O = t(), N = r(w, l);
    if (!O.enabled || O.allowOverlap)
      return { accepted: !0, rect: w, progress: 1, ...N };
    const z = Rt(h, l);
    if (z.size > 0) {
      if (!jt(z, Rt(w, l)))
        return { accepted: !1, rect: h, progress: 0, ...N };
      const _ = { x: w.left - h.left, y: w.top - h.top }, q = _.x === 0 && _.y === 0 ? null : ae(h, _, pn(l, z));
      if (!q)
        return { accepted: !0, rect: w, progress: 1, ...N };
      const lt = un(Math.hypot(_.x, _.y), q.interval.entry), dt = Math.max(0, q.interval.entry - lt), gt = Gt(h, {
        x: _.x * dt,
        y: _.y * dt
      }), ft = Gt(h, {
        x: _.x * (q.interval.entry + (q.interval.exit - q.interval.entry) * 1e-3),
        y: _.y * (q.interval.entry + (q.interval.exit - q.interval.entry) * 1e-3)
      }), vt = r(ft, l);
      if (!jt(z, Rt(gt, l))) {
        const te = vt.results.length > 0 ? vt : r(h, l);
        return { accepted: !1, rect: h, progress: 0, ...te };
      }
      const zt = vt.results.length > 0 ? vt : r(gt, l);
      return {
        accepted: !Io(gt, h),
        rect: gt,
        progress: dt,
        ...zt
      };
    }
    const T = { x: w.left - h.left, y: w.top - h.top };
    if (T.x === 0 && T.y === 0)
      return { accepted: !0, rect: w, progress: 1, ...N };
    const tt = ae(h, T, l);
    if (!tt)
      return { accepted: !0, rect: w, progress: 1, ...N };
    const { interval: J } = tt, p = un(Math.hypot(T.x, T.y), J.entry), v = Gt(h, {
      x: T.x * (J.entry - p),
      y: T.y * (J.entry - p)
    }), b = Gt(h, {
      x: T.x * (J.entry + (J.exit - J.entry) * 1e-3),
      y: T.y * (J.entry + (J.exit - J.entry) * 1e-3)
    }), I = He(b, tt.target), C = {
      x: T.x * (1 - J.entry),
      y: T.y * (1 - J.entry)
    }, W = (F, _) => {
      const q = ae(F, _, l);
      if (!q) return Gt(F, _);
      const lt = un(Math.hypot(_.x, _.y), q.interval.entry);
      return Gt(F, {
        x: _.x * (q.interval.entry - lt),
        y: _.y * (q.interval.entry - lt)
      });
    };
    let E = v;
    const G = I.normal;
    if (G) {
      const F = { x: -G.y, y: G.x }, _ = F.x * C.x + F.y * C.y, q = _ >= 0 ? 1 : -1;
      Math.abs(_) > 1e-9 && (E = W(E, {
        x: F.x * q * Math.abs(_),
        y: F.y * q * Math.abs(_)
      }));
    }
    const rt = { x: E.left - v.left, y: E.top - v.top }, Y = C.x - rt.x, U = C.y - rt.y;
    Y !== 0 && Math.sign(Y) === Math.sign(C.x) && (E = W(E, { x: Y, y: 0 })), U !== 0 && Math.sign(U) === Math.sign(C.y) && (E = W(E, { x: 0, y: U }));
    const H = r(E, l), Q = H.results.length > 0 ? H : r(b, l), et = T.x * T.x + T.y * T.y > 0 ? ((E.left - h.left) * T.x + (E.top - h.top) * T.y) / (T.x * T.x + T.y * T.y) : 1;
    return {
      accepted: !Io(E, h),
      rect: E,
      progress: Math.max(0, Math.min(1, et)),
      ...Q
    };
  };
  return {
    collisions: o,
    isColliding: a,
    evaluate: s,
    evaluateOriented: r,
    resolveCandidate: (h, w, l, O = (z) => z, N = "path") => {
      const z = t(), T = s(h, l);
      if (!z.enabled || z.allowOverlap)
        return { accepted: !0, rect: h, progress: 1, ...T };
      const tt = xe(w, l), J = Ce(tt);
      if (J > 0)
        return {
          accepted: vn(J, T.totalOverlapArea),
          rect: h,
          progress: 1,
          ...T
        };
      const p = ve(w, h, l);
      if (T.results.length === 0 && !p)
        return { accepted: !0, rect: h, progress: 1, ...T };
      let v = T;
      if (T.results.length === 0 && p) {
        const I = Co(
          w,
          h,
          p.entry + (p.exit - p.entry) * 1e-3
        );
        v = n(xe(I, l));
      }
      let b = null;
      if (N === "slide") {
        const I = cn(
          w,
          { ...w, left: h.left },
          l,
          O
        ), C = cn(
          w,
          { ...w, top: h.top },
          l,
          O
        ), W = O({
          ...h,
          left: I.rect.left,
          top: C.rect.top
        });
        ve(w, W, l) || (b = { rect: W });
      }
      return b ?? (b = cn(w, h, l, O)), {
        accepted: !Ui(b.rect, w),
        rect: b.rect,
        progress: b.progress,
        ...v
      };
    },
    resolveOrientedTranslation: f,
    resolveOrientedChange: (h, w, l) => {
      const O = t(), N = r(w, l);
      if (!O.enabled || O.allowOverlap)
        return { accepted: !0, rect: w, progress: 1, ...N };
      const z = Rt(h, l);
      if (z.size > 0) {
        if (!jt(z, Rt(w, l)))
          return { accepted: !1, rect: h, progress: 0, ...N };
        const b = pn(l, z), I = b.length > 0 ? Mo(h, w, b) : 1;
        if (I >= 1)
          return { accepted: !0, rect: w, progress: 1, ...N };
        const C = ye(h, w, I), W = ye(h, w, I + (1 - I) * 1e-3), E = r(W, l);
        if (!jt(z, Rt(C, l))) {
          const rt = E.results.length > 0 ? E : r(h, l);
          return { accepted: !1, rect: h, progress: 0, ...rt };
        }
        const G = E.results.length > 0 ? E : r(C, l);
        return {
          accepted: I > 0,
          rect: C,
          progress: I,
          ...G
        };
      }
      if (Po(h, w))
        return f(h, w, l);
      const T = Mo(h, w, l), tt = ye(h, w, T), J = r(tt, l);
      let p = J;
      if (J.results.length === 0 && T < 1) {
        const v = ye(h, w, T + (1 - T) * 1e-3);
        p = r(v, l);
      }
      return {
        accepted: T > 0,
        rect: tt,
        progress: T,
        ...p
      };
    },
    clearCollisions: () => {
      o.value = [], a.value = !1;
    }
  };
}
const x = (t, o = 0) => {
  if (t == null || t === "")
    return o;
  const a = typeof t == "string" ? Number(t) : t;
  return Number.isFinite(a) ? a : o;
}, $t = (t, o, a) => Math.min(Math.max(t, o), a), tr = (t, o) => x(t.left) === x(o.left) && x(t.top) === x(o.top) && x(t.width) === x(o.width) && x(t.height) === x(o.height), er = {
  tl: { x: -1, y: -1 },
  tm: { x: 0, y: -1 },
  tr: { x: 1, y: -1 },
  ml: { x: -1, y: 0 },
  mr: { x: 1, y: 0 },
  bl: { x: -1, y: 1 },
  bm: { x: 0, y: 1 },
  br: { x: 1, y: 1 }
}, nr = (t, o, a) => {
  switch (t) {
    case "tl":
      return { x: 0, y: 0 };
    case "tm":
      return { x: o / 2, y: 0 };
    case "tr":
      return { x: o, y: 0 };
    case "ml":
      return { x: 0, y: a / 2 };
    case "mr":
      return { x: o, y: a / 2 };
    case "bl":
      return { x: 0, y: a };
    case "bm":
      return { x: o / 2, y: a };
    case "br":
      return { x: o, y: a };
    default:
      return { x: o, y: a };
  }
}, bn = (t, o, a) => {
  switch (t) {
    case "tl":
      return { x: o, y: a };
    case "tm":
      return { x: o / 2, y: a };
    case "tr":
      return { x: 0, y: a };
    case "ml":
      return { x: o, y: a / 2 };
    case "mr":
      return { x: 0, y: a / 2 };
    case "bl":
      return { x: o, y: 0 };
    case "bm":
      return { x: o / 2, y: 0 };
    case "br":
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}, gn = (t, o, a, n) => {
  const s = Jt(a, t.width, t.height), r = St(Z(o)), f = Math.cos(r), d = Math.sin(r), R = n.x - s.x, M = n.y - s.y;
  return {
    x: t.left + s.x + R * f - M * d,
    y: t.top + s.y + R * d + M * f
  };
}, Le = (t) => Math.abs(t) < 1e-9 ? 0 : t, fn = (t, o, a) => Math.min(Math.max(t, o), Math.max(o, a)), or = (t) => {
  const { start: o, angle: a, originSpec: n, handle: s, pointerDelta: r } = t, f = Z(a), d = er[s], R = gn(
    o,
    f,
    n,
    bn(s, o.width, o.height)
  ), M = gn(
    o,
    f,
    n,
    nr(s, o.width, o.height)
  ), h = {
    x: M.x + r.x,
    y: M.y + r.y
  }, w = St(f), l = Math.cos(w), O = Math.sin(w), N = { x: h.x - R.x, y: h.y - R.y }, z = {
    x: N.x * l + N.y * O,
    y: -N.x * O + N.y * l
  };
  let T = d.x === 0 ? o.width : Le(d.x * z.x), tt = d.y === 0 ? o.height : Le(d.y * z.y);
  const J = Math.max(0, t.minWidth ?? 0), p = Math.max(0, t.minHeight ?? 0), v = Number.isFinite(t.maxWidth) ? Math.max(0, t.maxWidth ?? 1 / 0) : 1 / 0, b = Number.isFinite(t.maxHeight) ? Math.max(0, t.maxHeight ?? 1 / 0) : 1 / 0;
  if (t.ratio && Number.isFinite(t.ratio) && t.ratio > 0) {
    const I = t.ratio, W = d.x !== 0 && (d.y === 0 || Math.abs(z.x) >= Math.abs(z.y) * I) ? T : tt * I, E = Math.max(J, p * I), G = Math.min(v, b * I);
    T = fn(W, Math.min(E, G), G), tt = T / I;
  } else
    T = fn(T, Math.min(J, v), v), tt = fn(tt, Math.min(p, b), b);
  return mn(
    { left: o.left, top: o.top, width: T, height: tt },
    f,
    n,
    s,
    R
  );
}, mn = (t, o, a, n, s) => {
  const r = Jt(a, t.width, t.height), f = bn(n, t.width, t.height), d = St(Z(o)), R = Math.cos(d), M = Math.sin(d), h = f.x - r.x, w = f.y - r.y;
  return {
    ...t,
    left: Le(s.x - r.x - (h * R - w * M)),
    top: Le(s.y - r.y - (h * M + w * R))
  };
}, No = Symbol("MovableGroupContext"), ir = 2, ut = (t, o = 1) => {
  if (t == null || t === "")
    return o;
  const a = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(a) ? o : a;
}, Ee = (t, o = "px") => t == null || t === "" ? "0" : `${t}${o}`;
function ge(t, o, a, n) {
  t && t.addEventListener(o, a, n);
}
function me(t, o, a, n) {
  t && t.removeEventListener(o, a, n);
}
const hn = (t, o = 1, a = ir) => {
  const n = new bi(t).toDecimalPlaces(a).toNumber();
  return ut(n, o);
}, se = (t) => {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Date)
    return new Date(t.getTime());
  if (t instanceof Array)
    return t.map((o) => se(o));
  if (t instanceof Object) {
    const o = {};
    for (const a in t)
      t.hasOwnProperty(a) && (o[a] = se(t[a]));
    return o;
  }
  return t;
}, rr = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], ar = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], sr = Be({
  name: "VueMovableBox"
}), lr = /* @__PURE__ */ Be({
  ...sr,
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
  setup(t, { expose: o, emit: a }) {
    var Xn;
    const n = t, s = a, r = (e) => se(e), f = Ot(), d = Ot(r(n.modelValue)), R = Ot(Z(n.rotate)), M = r(n.modelValue), h = Ot(null), w = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, l = pi({
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
      beforeInteraction: r(n.modelValue),
      beforeRotation: Z(n.rotate),
      rotationStartPointerAngle: 0,
      rotationOriginX: 0,
      rotationOriginY: 0,
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    Dt(
      () => n.modelValue,
      (e) => {
        d.value = r(e);
      },
      { deep: !0 }
    ), Dt(
      () => n.rotate,
      (e) => {
        R.value = Z(e);
      }
    ), Dt(
      () => n.active,
      (e) => {
        !e && l.isInteracting ? Se() : I(e);
      },
      { flush: "sync" }
    ), Dt(
      () => n.disabled,
      (e) => {
        s("disabled", e), e && Se();
      }
    ), Dt(
      () => n.initRect,
      (e) => {
        e && Se();
      }
    ), Dt(
      () => n.isKeepDecimals,
      (e, i) => {
        !e && i && v({
          ...d.value,
          left: Math.round(x(d.value.left)),
          top: Math.round(x(d.value.top)),
          width: Math.round(x(d.value.width)),
          height: Math.round(x(d.value.height))
        });
      }
    );
    const O = bt(() => n.resizable ?? n.resizeable ?? !0), N = bt(() => n.unitType === "%"), z = bt(() => R.value), T = bt(() => To(n.transformOrigin)), tt = bt(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : l.active ? n.theme : n.inActiveColor,
      left: Ee(d.value.left, n.unitType),
      top: Ee(d.value.top, n.unitType),
      width: Ee(d.value.width, n.unitType),
      height: Ee(d.value.height, n.unitType),
      zIndex: d.value.zIndex,
      cursor: n.disabled ? "not-allowed" : l.isDragging ? "move" : l.isResizing ? "nwse-resize" : l.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: l.active ? 1 : 0.9,
      transform: z.value ? `rotate(${z.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: T.value,
      willChange: l.isDragging || l.isResizing ? "left, top, width, height" : l.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !l.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), J = bt(() => ({
      borderColor: O.value ? n.theme : n.inActiveColor,
      scale: hn(1 / ut(n.scale, 1), 1)
    })), p = bt(() => {
      const e = Math.abs(ut(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / e}px`,
        "--rotation-handle-scale": hn(1 / e, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), v = (e) => {
      const i = r(e);
      return d.value = i, s("update:modelValue", r(i)), i;
    }, b = (e) => {
      const i = Z(L(Z(e)));
      return R.value = i, s("update:rotate", i), s("rotate", i), i;
    };
    function I(e) {
      l.active !== e && (l.active = e, s(e ? "active" : "inactive", r(d.value)), e || _e());
    }
    const C = () => {
      var i, u, c;
      let e = null;
      if (n.limitAreaClass)
        try {
          e = document.querySelector(n.limitAreaClass);
        } catch {
          e = null;
        }
      l.parentElement = e ?? ((i = f.value) == null ? void 0 : i.parentElement) ?? null, l.parentWidth = ((u = l.parentElement) == null ? void 0 : u.clientWidth) ?? 0, l.parentHeight = ((c = l.parentElement) == null ? void 0 : c.clientHeight) ?? 0;
    }, W = (e) => Math.max(0, Number(e) || 0), E = () => {
      const e = W(n.edgeDistance);
      return {
        top: e + W(n.boundsMargin.top),
        right: e + W(n.boundsMargin.right),
        bottom: e + W(n.boundsMargin.bottom),
        left: e + W(n.boundsMargin.left)
      };
    }, G = () => {
      const e = E(), i = N.value ? 100 : l.parentWidth, u = N.value ? 100 : l.parentHeight;
      return {
        minLeft: e.left,
        maxRight: Math.max(e.left, i - e.right),
        minTop: e.top,
        maxBottom: Math.max(e.top, u - e.bottom)
      };
    }, rt = (e) => {
      const i = G();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - e.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - e.height)
      };
    }, Y = (e) => ({
      left: x(e.left),
      top: x(e.top),
      width: x(e.width),
      height: x(e.height)
    }), U = () => ({
      x: N.value && l.parentWidth > 0 ? l.parentWidth / 100 : 1,
      y: N.value && l.parentHeight > 0 ? l.parentHeight / 100 : 1
    }), H = (e) => {
      const i = Y(e), u = z.value;
      if (!u) return i;
      const c = U(), m = {
        left: i.left * c.x,
        top: i.top * c.y,
        width: i.width * c.x,
        height: i.height * c.y
      }, g = Jt(n.transformOrigin, m.width, m.height), y = Bi(m, u, g);
      return {
        left: y.left / c.x,
        top: y.top / c.y,
        width: y.width / c.x,
        height: y.height / c.y
      };
    }, Q = (e, i, u) => {
      const c = U(), m = e.left * c.x, g = e.top * c.y, y = e.width * c.x, A = e.height * c.y;
      return {
        left: m,
        top: g,
        width: y,
        height: A,
        angle: i,
        origin: Jt(u, y, A)
      };
    }, et = (e, i = z.value) => Q(Y(e), i, n.transformOrigin);
    let F = null;
    const _ = () => {
      F = null;
    };
    Dt(
      () => [n.snapTargets, n.collisionTargets, n.transformOrigin],
      _,
      { deep: !0 }
    ), Dt(() => [l.parentWidth, l.parentHeight, n.unitType], _);
    const q = (e) => {
      F === null && (F = /* @__PURE__ */ new WeakMap());
      const i = F.get(e);
      if (i) return i;
      const u = U(), c = {
        left: x(e.left) * u.x,
        top: x(e.top) * u.y,
        width: x(e.width) * u.x,
        height: x(e.height) * u.y
      }, m = {
        ...c,
        id: e.id,
        angle: Z(e.rotate ?? 0),
        origin: Jt(e.transformOrigin ?? "center", c.width, c.height)
      };
      return F.set(e, m), m;
    }, lt = (e) => q(e), dt = () => Ke().filter(Di).map(lt), gt = () => {
      if (!n.snapToElements) return Rn();
      const e = U();
      return Rn().map((i) => {
        if (!Z(i.rotate ?? 0)) return i;
        const u = xn(lt(i));
        return {
          left: u.left / e.x,
          top: u.top / e.y,
          width: u.width / e.x,
          height: u.height / e.y,
          id: i.id
        };
      });
    }, ft = () => n.collisionEnabled && !n.allowOverlap && be.value, vt = (e, i, u) => {
      const c = Rt(et(i), u), m = (g) => jt(c, Rt(et(g), u));
      if (m(e)) return e;
      for (let g = 0.8; g > 0.01; g -= 0.2) {
        const y = {
          ...e,
          left: L(
            x(i.left) + (x(e.left) - x(i.left)) * g
          ),
          top: L(
            x(i.top) + (x(e.top) - x(i.top)) * g
          )
        };
        if (m(y)) return y;
      }
      return i;
    }, zt = (e, i, u) => {
      const c = dt(), m = et(i), g = et(e), y = u === "slide" ? Me.resolveOrientedTranslation(m, g, c) : Me.resolveOrientedChange(m, g, c);
      if (Tn(y), !y.accepted) return null;
      const A = U(), P = {
        ...e,
        left: L(y.rect.left / A.x),
        top: L(y.rect.top / A.y),
        width: L(y.rect.width / A.x),
        height: L(y.rect.height / A.y)
      };
      return ft() ? vt(P, i, c) : P;
    }, te = () => n.collisionEnabled && !n.allowOverlap && be.value, Lo = (e) => {
      if (!n.limitAreaForParent || !l.parentElement) return !1;
      const i = G(), u = U(), c = e.left / u.x, m = e.top / u.y, g = e.width / u.x, y = e.height / u.y, A = 1e-7;
      return c < i.minLeft - A || c + g > i.maxRight + A || m < i.minTop - A || m + y > i.maxBottom + A;
    }, le = (e, i) => {
      const u = et(d.value, e), c = Fe(u);
      return Lo(c) ? !0 : !te() || i.length === 0 ? !1 : Do(u, i, c);
    }, Mn = (e, i, u) => Math.max(
      48,
      Math.ceil(Math.abs(i - e) / 2),
      Eo(
        et(d.value, e),
        et(d.value, i),
        u
      )
    ), Bo = (e, i, u) => {
      const c = Oo(
        (m) => le(e + (i - e) * m, u),
        Mn(e, i, u)
      );
      return c === 1 ? i : e + (i - e) * c;
    }, wn = (e, i) => {
      if (Math.abs(i - e) < 1e-9) return Z(i);
      const u = n.limitAreaForParent && !!l.parentElement, c = te() ? dt() : [];
      if (!u && c.length === 0) return Z(i);
      const m = n.isKeepDecimals ? n.decimalPlaces : 0;
      if (le(e, c)) {
        const A = Mn(e, i, c);
        for (let P = 1; P <= A; P += 1) {
          const D = e + (i - e) * P / A;
          if (!le(D, c)) {
            const k = Z(ho(i, D, m));
            if (!le(k, c)) return k;
          }
        }
        return Z(e);
      }
      const g = Bo(e, i, c), y = Z(ho(e, g, m));
      return y !== g && le(y, c) ? Z(g) : y;
    }, In = (e, i) => {
      const u = z.value;
      if (!u && n.resizeMode !== "fixed-anchor" || !n.limitAreaForParent || !l.parentElement)
        return e;
      const c = G(), m = Math.max(0, c.maxRight - c.minLeft), g = Math.max(0, c.maxBottom - c.minTop), y = St(u), A = Math.abs(Math.cos(y)) < 1e-9 ? 0 : Math.abs(Math.cos(y)), P = Math.abs(Math.sin(y)) < 1e-9 ? 0 : Math.abs(Math.sin(y)), D = U(), k = A, B = P * (D.y / D.x), V = P * (D.x / D.y), j = A, X = x(e.width), K = x(e.height), S = i ? w[i] : null, at = x(e.left) + X, Nt = x(e.top) + K, At = (yt, It) => ({
        ...e,
        left: S != null && S.left ? L(at - yt) : e.left,
        top: S != null && S.top ? L(Nt - It) : e.top,
        width: yt,
        height: It
      }), pt = (yt, It) => ({
        ...e,
        left: S != null && S.left ? at - yt : e.left,
        top: S != null && S.top ? Nt - It : e.top,
        width: yt,
        height: It
      }), Wt = k * X + B * K, Yt = V * X + j * K, wt = Math.max(0, ut(n.minWidth, 0)), mt = Math.max(0, ut(n.minHeight, 0)), Xt = i === null || !!(S != null && S.left || S != null && S.right), Ht = i === null || !!(S != null && S.top || S != null && S.bottom), Tt = (S == null ? void 0 : S.left) ?? !1, ct = (S == null ? void 0 : S.top) ?? !1, nt = (yt, It) => {
        if (!Tt && !ct) return yt;
        const Pt = x(yt.width), ne = x(yt.height), qn = It ? Math.min(
          1,
          Math.max(
            Pt > 0 ? wt / Pt : 0,
            ne > 0 ? mt / ne : 0
          )
        ) : 0, Un = It ? Pt * qn : Tt ? Math.min(Pt, wt) : Pt, Zn = It ? ne * qn : ct ? Math.min(ne, mt) : ne, Jn = (st) => ({
          width: Un + (Pt - Un) * st,
          height: Zn + (ne - Zn) * st
        }), jn = (st) => {
          const it = Jn(st);
          return pt(it.width, it.height);
        }, oe = (st) => {
          const it = Jn(st), xt = n.isKeepDecimals ? L : Math.floor;
          return At(
            Math.max(wt, xt(it.width)),
            Math.max(mt, xt(it.height))
          );
        }, Ae = (st) => {
          const it = H(st), xt = 1e-7;
          return (!Tt || it.left >= c.minLeft - xt && it.left + it.width <= c.maxRight + xt) && (!ct || it.top >= c.minTop - xt && it.top + it.height <= c.maxBottom + xt);
        };
        if (Ae(yt)) return yt;
        const ie = H(jn(0)), re = H(jn(1));
        let kt = 0, Lt = 1, tn = !0;
        const Qn = (st, it, xt) => {
          const _t = it - st;
          if (Math.abs(_t) < 1e-9) {
            st < xt && (tn = !1);
            return;
          }
          const pe = (xt - st) / _t;
          _t > 0 ? kt = Math.max(kt, pe) : Lt = Math.min(Lt, pe);
        }, to = (st, it, xt) => {
          const _t = it - st;
          if (Math.abs(_t) < 1e-9) {
            st > xt && (tn = !1);
            return;
          }
          const pe = (xt - st) / _t;
          _t > 0 ? Lt = Math.min(Lt, pe) : kt = Math.max(kt, pe);
        };
        if (Tt && (Qn(ie.left, re.left, c.minLeft), to(
          ie.left + ie.width,
          re.left + re.width,
          c.maxRight
        )), ct && (Qn(ie.top, re.top, c.minTop), to(
          ie.top + ie.height,
          re.top + re.height,
          c.maxBottom
        )), kt = Math.max(0, kt), Lt = Math.min(1, Lt), !tn || kt > Lt) return oe(0);
        const eo = oe(Lt);
        if (Ae(eo)) return eo;
        let Te = kt, no = Lt;
        if (!Ae(oe(Te))) return oe(0);
        for (let st = 0; st < 32; st += 1) {
          const it = (Te + no) / 2;
          Ae(oe(it)) ? Te = it : no = it;
        }
        return oe(Te);
      };
      if (n.ratioLock || Xt && Ht) {
        const yt = Math.min(
          1,
          Wt > m ? m / Wt : 1,
          Yt > g ? g / Yt : 1
        ), It = Math.max(
          yt,
          X > 0 ? wt / X : 0,
          K > 0 ? mt / K : 0
        ), Pt = Math.min(It, 1);
        return Pt >= 1 ? nt(e, !0) : nt(
          At(
            Math.max(wt, Math.floor(X * Pt)),
            Math.max(mt, Math.floor(K * Pt))
          ),
          !0
        );
      }
      const ht = Math.floor(
        Math.min(
          k > 0 ? (m - B * K) / k : 1 / 0,
          V > 0 ? (g - j * K) / V : 1 / 0
        )
      ), ee = Math.floor(
        Math.min(
          B > 0 ? (m - k * X) / B : 1 / 0,
          j > 0 ? (g - V * X) / j : 1 / 0
        )
      ), de = Xt ? Math.max(wt, Math.min(X, ht)) : X, _n = Ht ? Math.max(mt, Math.min(K, ee)) : K;
      return nt(de === X && _n === K ? e : At(de, _n), !1);
    }, We = (e) => {
      if (!l.parentElement) return;
      const i = G(), u = H(e), c = u.left, m = u.top, g = c + u.width, y = m + u.height;
      c < i.minLeft && s("out-of-bounds", "left"), g > i.maxRight && s("out-of-bounds", "right"), m < i.minTop && s("out-of-bounds", "top"), y > i.maxBottom && s("out-of-bounds", "bottom");
    }, ke = (e) => {
      if (!n.limitAreaForParent || !l.parentElement) return e;
      const i = H(e), u = rt(i), c = $t(i.left, u.minLeft, u.maxLeft), m = $t(i.top, u.minTop, u.maxTop);
      return z.value ? {
        ...e,
        left: L(x(e.left) + (c - i.left)),
        top: L(x(e.top) + (m - i.top))
      } : {
        ...e,
        left: c,
        top: m
      };
    }, $ = gi(No, null), Ge = `member-${((Xn = mi()) == null ? void 0 : Xn.uid) ?? Math.random().toString(36).slice(2)}`;
    let ot = n.memberId || Ge, Bt = !1;
    const $e = (e) => Math.max(0, Math.floor(e * 1e6) / 1e6), Ve = {
      getRect: () => r(d.value),
      // Percent-unit geometry needs the container snapshot; resolve it lazily like
      // getAreaEdges so a member that never interacted still reports a true visual contour
      // (a zero snapshot would treat percent values as pixels and skew the rotated AABB).
      getVisualRect: () => (l.parentElement || C(), H(r(d.value))),
      translateTo: (e) => {
        v(e);
      },
      isInteracting: () => l.isInteracting,
      // The group constraint loop runs per frame, so re-resolving layout on every call would
      // dominate group drags. Resolve the area lazily once per member, then reuse the
      // snapshot (refreshed at each interaction start by the box itself).
      getAreaEdges: () => (l.parentElement || C(), l.parentElement ? G() : null),
      // Largest fraction of a shared group delta this box can absorb without colliding,
      // swept from the member's drag-start rectangle: the group re-applies the limited delta
      // to the start rectangle on every frame, so both sides must reference the same origin.
      // A start position already overlapping an obstacle only permits escape motions under
      // the same per-target rule as the interaction pipeline: the overlap total must shrink,
      // no single penetration may deepen, and a previously separated target must not be
      // entered — trading a big escape for a new entry is a collision, not an escape. An
      // escape whose path crosses a separated target stops at that target's first contact
      // instead of jumping the whole formation across it in one frame.
      sharedDeltaProgress: (e, i) => {
        if (!n.collisionEnabled || n.allowOverlap) return 1;
        const u = U();
        if (be.value) {
          const P = dt(), D = et(e), k = { x: i.left * u.x, y: i.top * u.y }, B = Rt(D, P);
          if (B.size > 0) {
            if (!jt(B, Rt(Gt(D, k), P)))
              return 0;
            const j = pn(P, B);
            if (j.length === 0) return 1;
            const X = ae(D, k, j);
            if (!X) return 1;
            const K = $e(X.interval.entry);
            return jt(
              B,
              Rt(
                Gt(D, {
                  x: k.x * K,
                  y: k.y * K
                }),
                P
              )
            ) ? K : 0;
          }
          const V = ae(D, k, P);
          return V ? $e(V.interval.entry) : 1;
        }
        const c = Ke(), m = H(e), g = {
          ...m,
          left: m.left + i.left,
          top: m.top + i.top
        }, y = Ce(xe(m, c));
        if (y > 0) {
          const P = Ce(xe(g, c));
          return vn(y, P) ? 1 : 0;
        }
        const A = ve(m, g, c);
        return A ? $e(A.entry) : 1;
      }
    };
    yi(() => {
      $ && !$.registerMember(ot, Ve) && (ot = Ge, $.registerMember(ot, Ve)), typeof window < "u" && window.addEventListener("resize", C);
    }), Dt(
      () => n.memberId,
      () => {
        const e = n.memberId || Ge;
        e === ot || !$ || ($.renameMember(ot, e, Ve) ? ot = e : $.hasMember(ot) || (ot = e));
      }
    );
    const Rn = () => $ ? n.snapTargets.filter((e) => !$.hasMember(e.id)) : n.snapTargets, Ke = () => {
      const e = n.collisionTargets === void 0 ? n.snapTargets : n.collisionTargets;
      return $ ? e.filter((i) => !$.hasMember(i.id)) : e;
    }, L = (e) => n.isKeepDecimals ? hn(e, 0, n.decimalPlaces) : Math.round(e), Ye = (e, i) => {
      if (!N.value) return L(e);
      const u = i === "horizontal" ? l.parentWidth : l.parentHeight;
      return u > 0 ? L(e / u * 100) : 0;
    }, Sn = (e, i) => {
      const u = ut(n.scale, 1), c = e / (u === 0 ? 1 : u);
      return Ye(c, i);
    }, zn = Ti(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Ft = Pi(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), be = bt(() => n.collisionMode !== "aabb"), Me = Qi(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), An = Ft.guides;
    let ce = "clear", ue = "clear", fe = "clear";
    const we = /* @__PURE__ */ new Set(["left", "right", "center-x"]), Ie = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Xe = (e) => {
      const i = {
        horizontal: e.points.some((y) => we.has(y)) ? e.targetIds.horizontal : void 0,
        vertical: e.points.some((y) => Ie.has(y)) ? e.targetIds.vertical : void 0
      }, u = e.snapped ? se(e.spacing ?? []) : [], c = e.snapped ? {
        snapped: !0,
        point: e.snapPoint,
        points: e.points,
        targetId: e.targetId,
        targetIds: i,
        spacing: u.length > 0 ? u : void 0
      } : { snapped: !1 }, m = JSON.stringify({
        payload: c,
        left: e.points.some((y) => we.has(y)) ? e.left : void 0,
        top: e.points.some((y) => Ie.has(y)) ? e.top : void 0
      });
      m !== ce && ((e.snapped || ce !== "clear") && s("snap", c), ce = e.snapped ? m : "clear");
      const g = JSON.stringify({ guides: e.guides, targetIds: i });
      g !== ue && ((e.snapped || ue !== "clear") && s("guides", se(e.guides)), ue = e.snapped ? g : "clear");
    }, Tn = (e) => {
      const i = e.dominant, u = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId,
        normal: i.normal ? { ...i.normal } : void 0
      } : { colliding: !1 }, c = JSON.stringify(u);
      c !== fe && ((i || fe !== "clear") && s("collision", u), fe = i ? c : "clear");
    }, _e = () => {
      ce !== "clear" && s("snap", { snapped: !1 }), ue !== "clear" && s("guides", { vertical: [], horizontal: [] }), fe !== "clear" && s("collision", { colliding: !1 }), ce = "clear", ue = "clear", fe = "clear", Ft.clearGuides(), Me.clearCollisions();
    }, qe = (e, i, u = "path") => {
      if (be.value)
        return zt(e, i, u);
      const c = H(e), m = Me.resolveCandidate(
        c,
        H(i),
        Ke(),
        (g) => ({
          left: L(g.left),
          top: L(g.top),
          width: L(g.width),
          height: L(g.height)
        }),
        u
      );
      if (Tn(m), !m.accepted) return null;
      if (z.value) {
        if (u === "path" && m.progress !== void 0) {
          const g = $t(m.progress, 0, 1), y = Y(i), A = Y(e);
          return {
            ...e,
            left: L(
              y.left + (A.left - y.left) * g
            ),
            top: L(y.top + (A.top - y.top) * g),
            width: L(
              y.width + (A.width - y.width) * g
            ),
            height: L(
              y.height + (A.height - y.height) * g
            )
          };
        }
        return {
          ...e,
          left: L(x(e.left) + (m.rect.left - c.left)),
          top: L(x(e.top) + (m.rect.top - c.top))
        };
      }
      return { ...e, ...m.rect };
    }, Pn = (e, i, u, c, m) => {
      let g = r(e);
      c.horizontal && (g.left = zn.snapValue(x(e.left))), c.vertical && (g.top = zn.snapValue(x(e.top)));
      let y = {
        ...Y(g),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (u) {
        const P = H(g);
        y = Ft.resolveSnap(P, gt(), c), z.value ? g = {
          ...g,
          left: L(x(g.left) + (y.left - P.left)),
          top: L(x(g.top) + (y.top - P.top))
        } : g = { ...g, left: y.left, top: y.top };
      } else
        Ft.clearGuides();
      if (m) {
        const P = x(m.left), D = x(m.top);
        n.dragDirections.includes("left") || (g.left = Math.max(P, x(g.left))), n.dragDirections.includes("right") || (g.left = Math.min(P, x(g.left))), n.dragDirections.includes("top") || (g.top = Math.max(D, x(g.top))), n.dragDirections.includes("bottom") || (g.top = Math.min(D, x(g.top)));
      }
      We(g), g = ke(g);
      const A = qe(g, i, "slide");
      if (!A)
        return Xe({
          ...y,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Ft.clearGuides(), null;
      if (g = A, y.snapped) {
        const P = H(g), D = L(P.left) !== L(y.left), k = L(P.top) !== L(y.top), B = y.points.filter((S) => we.has(S) ? !D : Ie.has(S) ? !k : !1), V = B.some((S) => we.has(S)), j = B.some((S) => Ie.has(S)), X = y.spacing.filter(
          (S) => S.axis === "horizontal" ? !D : !k
        ), K = {
          vertical: X.flatMap((S) => S.axis === "horizontal" ? S.guides : []),
          horizontal: X.flatMap((S) => S.axis === "vertical" ? S.guides : [])
        };
        y = {
          ...y,
          left: x(g.left),
          top: x(g.top),
          snapped: B.length > 0 || X.length > 0,
          snapPoint: B[0],
          points: B,
          targetId: V ? y.targetIds.horizontal : j ? y.targetIds.vertical : void 0,
          targetIds: {
            horizontal: V ? y.targetIds.horizontal : void 0,
            vertical: j ? y.targetIds.vertical : void 0
          },
          guides: {
            vertical: V ? y.guides.vertical : K.vertical,
            horizontal: j ? y.guides.horizontal : K.horizontal
          },
          spacing: X
        }, y.snapped ? Ft.setGuides(y.guides) : Ft.clearGuides();
      }
      return Xe(y), g;
    }, Ue = (e) => n.resizeDirections.includes(e), Dn = (e, i, u) => {
      if (n.resizeMode !== "fixed-anchor") {
        const B = Fi(u.x, u.y, z.value), V = {
          x: Ye(B.x, "horizontal"),
          y: Ye(B.y, "vertical")
        };
        return Fo(e, i, V.x, V.y);
      }
      const c = U(), m = x(e.width), g = x(e.height), y = Math.max(0, ut(n.minWidth, 0)), A = Math.max(0, ut(n.minHeight, 0)), P = ut(n.maxWidth, 1 / 0), D = ut(n.maxHeight, 1 / 0), k = or({
        start: {
          left: x(e.left) * c.x,
          top: x(e.top) * c.y,
          width: m * c.x,
          height: g * c.y
        },
        angle: z.value,
        originSpec: n.transformOrigin,
        handle: i,
        pointerDelta: u,
        minWidth: y * c.x,
        minHeight: A * c.y,
        maxWidth: P > 0 ? P * c.x : 1 / 0,
        maxHeight: D > 0 ? D * c.y : 1 / 0,
        ratio: n.ratioLock && m > 0 && g > 0 ? m * c.x / (g * c.y) : null
      });
      return {
        ...e,
        left: L(k.left / c.x),
        top: L(k.top / c.y),
        width: L(k.width / c.x),
        height: L(k.height / c.y)
      };
    }, On = (e, i, u) => {
      const c = U(), m = z.value, g = {
        left: x(e.left) * c.x,
        top: x(e.top) * c.y,
        width: x(e.width) * c.x,
        height: x(e.height) * c.y
      }, y = gn(
        g,
        m,
        n.transformOrigin,
        bn(u, g.width, g.height)
      ), A = mn(
        {
          left: x(i.left) * c.x,
          top: x(i.top) * c.y,
          width: x(i.width) * c.x,
          height: x(i.height) * c.y
        },
        m,
        n.transformOrigin,
        u,
        y
      ), P = {
        ...i,
        left: L(A.left / c.x),
        top: L(A.top / c.y)
      };
      if (!n.limitAreaForParent || !l.parentElement) return P;
      const D = G(), k = (ct) => {
        const nt = H(ct), ht = 1e-7;
        return nt.left >= D.minLeft - ht && nt.left + nt.width <= D.maxRight + ht && nt.top >= D.minTop - ht && nt.top + nt.height <= D.maxBottom + ht;
      };
      if (k(P)) return P;
      const B = x(i.width), V = x(i.height), j = Math.max(0, ut(n.minWidth, 0)), X = Math.max(0, ut(n.minHeight, 0)), K = Math.min(B, j), S = Math.min(V, X), at = w[u], Nt = at.left || at.right, At = at.top || at.bottom, pt = n.ratioLock || Nt && At, Wt = pt ? Math.min(
        1,
        Math.max(
          B > 0 ? K / B : 0,
          V > 0 ? S / V : 0
        )
      ) : 0, Yt = pt ? B * Wt : Nt ? K : B, wt = pt ? V * Wt : At ? S : V, mt = (ct) => {
        const nt = n.isKeepDecimals ? L : Math.floor, ht = Math.max(
          K,
          nt(Yt + (B - Yt) * ct)
        ), ee = Math.max(
          S,
          nt(wt + (V - wt) * ct)
        ), de = mn(
          {
            left: 0,
            top: 0,
            width: ht * c.x,
            height: ee * c.y
          },
          m,
          n.transformOrigin,
          u,
          y
        );
        return {
          ...i,
          left: L(de.left / c.x),
          top: L(de.top / c.y),
          width: ht,
          height: ee
        };
      }, Xt = mt(0);
      if (!k(Xt)) return i;
      let Ht = 0, Tt = 1;
      for (let ct = 0; ct < 40; ct += 1) {
        const nt = (Ht + Tt) / 2;
        k(mt(nt)) ? Ht = nt : Tt = nt;
      }
      return mt(Ht);
    }, Fo = (e, i, u, c) => {
      const m = w[i], g = x(e.left), y = x(e.top), A = x(e.width), P = x(e.height);
      let D = g, k = g + A, B = y, V = y + P;
      m.left && (D += u), m.right && (k += u), m.top && (B += c), m.bottom && (V += c);
      const j = (D + k) / 2, X = (B + V) / 2;
      let K = Math.max(0, k - D), S = Math.max(0, V - B);
      const at = A > 0 && P > 0 ? A / P : 1, Nt = (ht) => {
        K = ht, m.left ? D = k - K : m.right ? k = D + K : (D = j - K / 2, k = j + K / 2);
      }, At = (ht) => {
        S = ht, m.top ? B = V - S : m.bottom ? V = B + S : (B = X - S / 2, V = X + S / 2);
      };
      if (n.ratioLock) {
        const ht = Math.abs(K - A), ee = Math.abs(S - P) * at;
        i === "tm" || i === "bm" || ee > ht ? Nt(S * at) : At(K / at);
      }
      const pt = G(), Wt = n.limitAreaForParent && !!l.parentElement && z.value === 0, Yt = Wt ? m.left ? Math.max(0, k - pt.minLeft) : m.right ? Math.max(0, pt.maxRight - D) : Math.max(
        0,
        2 * Math.min(j - pt.minLeft, pt.maxRight - j)
      ) : 1 / 0, wt = Wt ? m.top ? Math.max(0, V - pt.minTop) : m.bottom ? Math.max(0, pt.maxBottom - B) : Math.max(
        0,
        2 * Math.min(X - pt.minTop, pt.maxBottom - X)
      ) : 1 / 0, mt = Math.max(0, ut(n.minWidth, 0)), Xt = Math.max(0, ut(n.minHeight, 0)), Ht = ut(n.maxWidth, 1 / 0), Tt = ut(n.maxHeight, 1 / 0);
      let ct = Math.min(Ht > 0 ? Ht : 1 / 0, Yt), nt = Math.min(Tt > 0 ? Tt : 1 / 0, wt);
      if (n.ratioLock) {
        ct = Math.min(ct, nt * at);
        const ht = Math.max(mt, Xt * at);
        Nt($t(K, ht, ct)), At(K / at);
      } else
        Nt($t(K, Math.min(mt, ct), ct)), At($t(S, Math.min(Xt, nt), nt));
      return {
        ...e,
        left: L(D),
        top: L(B),
        width: L(k - D),
        height: L(V - B)
      };
    };
    let Ct = null, Vt = null;
    const En = (e, i, u) => Math.atan2(e.clientY - u, e.clientX - i) * 180 / Math.PI + 90, Cn = (e) => {
      if (n.disabled || n.initRect || !l.isInteracting) return;
      if (l.isRotating) {
        const m = En(
          e,
          l.rotationOriginX,
          l.rotationOriginY
        ), g = Z(m - l.rotationStartPointerAngle), y = mo(
          l.beforeRotation + g,
          n.rotationSnapAngles ?? [],
          n.rotationSnapThreshold
        );
        b(wn(l.beforeRotation, y));
        return;
      }
      const i = Sn(e.clientX - l.initX, "horizontal"), u = Sn(e.clientY - l.initY, "vertical"), c = r(d.value);
      if (l.isDragging) {
        const m = l.beforeInteraction;
        let g = x(m.left) + i, y = x(m.top) + u;
        const A = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: u < 0 && n.dragDirections.includes("top") || u > 0 && n.dragDirections.includes("bottom")
        };
        A.horizontal || (g = x(m.left)), A.vertical || (y = x(m.top));
        const P = {
          ...m,
          left: L(g),
          top: L(y)
        };
        let D = Pn(P, c, n.snapToElements, A, m);
        if (D && Bt && (D = ($ == null ? void 0 : $.constrainPosition(ot, D)) ?? null), D) {
          const k = v(D);
          s("move", r(k)), s("drag", r(k)), Bt && ($ == null || $.notifyMoved(ot, r(k)));
        }
      }
      if (l.isResizing && l.handle) {
        Xe({
          ...Y(c),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Ft.clearGuides();
        const m = ut(n.scale, 1), g = m === 0 ? 1 : m, y = {
          x: (e.clientX - l.initX) / g,
          y: (e.clientY - l.initY) / g
        };
        let A = Dn(l.beforeInteraction, l.handle, y);
        (z.value || n.resizeMode === "fixed-anchor") && (A = In(A, l.handle), A = ke(A), n.resizeMode === "fixed-anchor" && (A = On(l.beforeInteraction, A, l.handle))), We(A);
        const P = qe(A, c);
        if (P) {
          const D = v(P);
          s("resize", r(D));
        }
      }
    }, Wo = (e) => {
      !l.active || n.disabled || n.initRect || (Vt = e, Ct === null && (Ct = requestAnimationFrame(() => {
        Ct = null;
        const i = Vt;
        Vt = null, i && Cn(i);
      })));
    }, Re = (e) => l.pointerId === null || e.pointerId === l.pointerId, Nn = (e) => {
      Re(e) && Wo(e);
    }, Hn = (e) => {
      Re(e) && Xo(e);
    }, Ln = (e) => {
      Re(e) && he(e);
    }, Bn = (e) => {
      Re(e) && l.isInteracting && he(e);
    }, Fn = (e) => {
      e.key === "Escape" && l.isInteracting && (e.preventDefault(), e.stopPropagation(), he(e));
    }, Wn = () => {
      const e = l.eventElement;
      if (!e) return;
      const i = { passive: !1 };
      ge(e, "pointermove", Nn, i), ge(e, "pointerup", Hn, i), ge(e, "pointercancel", Ln, i), ge(e, "keydown", Fn, !0);
      const u = f.value;
      u && ge(u, "lostpointercapture", Bn, i);
    }, ko = () => {
      const e = l.eventElement;
      if (!e) return;
      me(e, "pointermove", Nn, !1), me(e, "pointerup", Hn, !1), me(e, "pointercancel", Ln, !1), me(e, "keydown", Fn, !0);
      const i = f.value;
      i && me(i, "lostpointercapture", Bn, !1), l.eventElement = null;
    }, kn = () => {
      const e = f.value;
      if (!(!e || l.pointerId === null))
        try {
          e.setPointerCapture(l.pointerId);
        } catch {
        }
    }, Go = () => {
      const e = f.value, i = l.pointerId;
      if (l.pointerId = null, !(!e || i === null))
        try {
          e.hasPointerCapture(i) && e.releasePointerCapture(i);
        } catch {
        }
    };
    function Ze() {
      Ct !== null && (cancelAnimationFrame(Ct), Ct = null), Vt = null;
    }
    function Je() {
      l.interactionMode = "idle", l.handle = null, Bt = !1, ko(), Go();
    }
    function Gn() {
      _e(), n.active || I(!1);
    }
    function $n() {
      Je(), Gn();
    }
    function Se() {
      Ze(), Bt && ($ == null || $.abortDrag(ot)), $n();
    }
    function he(e = null) {
      const i = l.isDragging, u = l.isResizing, c = l.isRotating, m = Bt;
      if (Ze(), Je(), i || u) {
        const g = r(l.beforeInteraction);
        v(g), s(i ? "drag-cancel" : "resize-cancel", e, g, r(g)), i && m && ($ == null || $.cancelDrag(ot, e));
      }
      c && (R.value = l.beforeRotation, s("update:rotate", l.beforeRotation), s("rotate-cancel", e, l.beforeRotation, l.beforeRotation)), Gn();
    }
    function Vn() {
      Se(), I(!1);
    }
    const $o = (e, i) => {
      var c, m;
      if (n.disabled || n.initRect || l.isInteracting || i && (!O.value || !Ue(i)) || !i && !n.draggable) return;
      const u = r(d.value);
      if (i) {
        if (((c = n.canResize) == null ? void 0 : c.call(n, u, i)) === !1) return;
      } else if (((m = n.canDrag) == null ? void 0 : m.call(n, u)) === !1)
        return;
      if (Bt = !1, $)
        if (i) {
          if (!$.beginMemberInteraction(ot)) return;
        } else {
          const g = $.beginDrag(ot, e);
          if (g === "blocked") return;
          Bt = g === "group";
        }
      C(), l.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, l.initX = e.clientX, l.initY = e.clientY, l.beforeInteraction = r(d.value), l.handle = i, l.interactionMode = i ? "resize" : "drag", I(!0), l.isDragging && s("drag-start", e, r(l.beforeInteraction)), l.isResizing && s("resize-start", e, r(l.beforeInteraction)), l.eventElement = document.documentElement, Wn(), kn();
    }, Vo = () => {
      const e = f.value;
      if (!e) return null;
      const i = e.getBoundingClientRect(), u = e.offsetWidth || x(d.value.width), c = e.offsetHeight || x(d.value.height);
      if (!u || !c) return null;
      const m = St(z.value), g = Math.cos(m), y = Math.sin(m), A = Math.abs(g) * u + Math.abs(y) * c, P = Math.abs(y) * u + Math.abs(g) * c, D = [
        A ? i.width / A : 0,
        P ? i.height / P : 0
      ].filter((S) => Number.isFinite(S) && S > 0), k = Math.abs(ut(n.scale, 1)) || 1, B = D.length ? D.reduce((S, at) => S + at, 0) / D.length : k, V = Jt(n.transformOrigin, u, c), j = V.x * B, X = V.y * B, K = [
        [-j, -X],
        [u * B - j, -X],
        [u * B - j, c * B - X],
        [-j, c * B - X]
      ].map(([S, at]) => ({
        x: S * g - at * y,
        y: S * y + at * g
      }));
      return {
        x: i.left - Math.min(...K.map((S) => S.x)),
        y: i.top - Math.min(...K.map((S) => S.y))
      };
    }, Ko = (e) => {
      var u;
      if (!e.isPrimary || e.button !== 0 || n.disabled || n.initRect || !n.rotatable || l.isInteracting || ((u = n.canRotate) == null ? void 0 : u.call(n, r(d.value))) === !1 || $ && !$.beginMemberInteraction(ot)) return;
      C();
      const i = Vo();
      i && (l.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, l.beforeRotation = R.value, l.rotationOriginX = i.x, l.rotationOriginY = i.y, l.rotationStartPointerAngle = En(e, i.x, i.y), l.interactionMode = "rotate", I(!0), s("rotate-start", e, l.beforeRotation), l.eventElement = document.documentElement, Wn(), kn());
    }, Yo = (e) => {
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
    }, Kn = (e, i) => {
      !e.isPrimary || e.button !== 0 || !i && !Yo(e.target) || $o(e, i);
    };
    function Xo(e) {
      Ct !== null && (cancelAnimationFrame(Ct), Ct = null), Vt && (Cn(Vt), Vt = null), l.isDragging && (s("drag-stop", e, r(l.beforeInteraction), r(d.value)), Bt && ($ == null || $.endDrag(ot, e))), l.isResizing && s("resize-stop", e, r(l.beforeInteraction), r(d.value)), l.isRotating && s("rotate-stop", e, l.beforeRotation, R.value), $n();
    }
    const _o = (e, i) => {
      var g;
      if ($ && !$.beginMemberInteraction(ot)) return;
      C();
      const u = r(d.value);
      if (((g = n.canDrag) == null ? void 0 : g.call(n, r(u))) === !1) return;
      const c = r(u);
      e === "left" && (c.left = x(c.left) - i), e === "right" && (c.left = x(c.left) + i), e === "top" && (c.top = x(c.top) - i), e === "bottom" && (c.top = x(c.top) + i);
      const m = Pn(
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
        const y = v(m);
        s("move", r(y));
      }
    }, qo = (e, i, u) => {
      var B;
      if (!O.value || !Ue(e) || $ && !$.beginMemberInteraction(ot)) return;
      C();
      const c = r(d.value);
      if (((B = n.canResize) == null ? void 0 : B.call(n, r(c), e)) === !1) return;
      const m = i === "left" ? -u : i === "right" ? u : 0, g = i === "top" ? -u : i === "bottom" ? u : 0, y = { x: je(m), y: Qe(g) }, A = (() => {
        if (h.value !== e || z.value === 0) return y;
        const V = St(z.value), j = Math.cos(V), X = Math.sin(V);
        return {
          x: y.x * j - y.y * X,
          y: y.x * X + y.y * j
        };
      })();
      let P = Dn(c, e, A);
      (z.value || n.resizeMode === "fixed-anchor") && (P = In(P, e), P = ke(P), n.resizeMode === "fixed-anchor" && (P = On(c, P, e))), We(P);
      const D = qe(P, c);
      if (!D || tr(D, c)) return;
      const k = v(D);
      s("resize", r(k));
    }, Uo = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Zo = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Kt = (e) => Zo.has(e), Jo = (e) => Kt(e) ? "group" : "separator", jo = (e) => Kt(e) ? "two-axis resize handle" : void 0, Qo = (e) => `Resize ${Uo[e]}`, ti = (e) => {
      if (!Kt(e))
        return e === "ml" || e === "mr" ? "vertical" : "horizontal";
    }, ze = (e) => e === "ml" || e === "mr", Yn = (e) => {
      if (!Kt(e))
        return x(ze(e) ? d.value.width : d.value.height);
    }, ei = (e) => {
      if (!Kt(e))
        return x(ze(e) ? n.minWidth : n.minHeight);
    }, ni = (e) => {
      if (Kt(e)) return;
      const i = ze(e) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const u = x(i);
      return Number.isFinite(u) ? u : void 0;
    }, oi = (e) => {
      const i = Yn(e);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, ii = (e) => {
      if (n.keyboardEnabled)
        return Kt(e) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : ze(e) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, ri = (e) => {
      e.target === f.value && n.keyboardEnabled && !n.disabled && !n.initRect && I(!0);
    }, ai = [
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
    ].join(","), si = (e) => {
      const i = e.target, u = f.value;
      if (!(i instanceof Element) || !u || i === u || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return e.key !== "Escape";
      const c = i.closest(ai);
      return c !== null && c !== u && u.contains(c);
    }, li = Ri(
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
        move: _o,
        resize: qo,
        deactivate: Vn,
        cancel: (e) => he(e)
      }
    ), ci = (e) => {
      si(e) || li.handleKeyDown(e);
    }, ui = (e) => {
      var y;
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(e.key) || ((y = n.canRotate) == null ? void 0 : y.call(n, r(d.value))) === !1 || (e.preventDefault(), e.stopPropagation(), $ && !$.beginMemberInteraction(ot))) return;
      C();
      const i = R.value, u = So(n.keyboardStep) * (e.shiftKey ? 10 : 1), c = e.key === "Home" ? 0 : i + (e.key === "ArrowLeft" ? -u : u), m = e.key === "Home" ? c : mo(c, n.rotationSnapAngles ?? [], n.rotationSnapThreshold);
      s("rotate-start", e, i);
      const g = b(wn(i, m));
      s("rotate-stop", e, i, g);
    }, je = (e) => N.value ? e / 100 * l.parentWidth : e, Qe = (e) => N.value ? e / 100 * l.parentHeight : e, fi = bt(() => {
      const e = je(x(d.value.left)), i = Qe(x(d.value.top)), u = {
        left: `${-e}px`,
        top: `${-i}px`,
        width: `${l.parentWidth}px`,
        height: `${l.parentHeight}px`
      }, c = z.value;
      if (c) {
        const m = U(), g = Jt(
          n.transformOrigin,
          x(d.value.width) * m.x,
          x(d.value.height) * m.y
        );
        u.transform = `rotate(${-c}deg)`, u.transformOrigin = `${g.x + e}px ${g.y + i}px`;
      }
      return u;
    }), hi = (e) => ({
      left: `${je(e)}px`,
      top: "0px",
      height: `${l.parentHeight}px`,
      borderColor: n.theme
    }), di = (e) => ({
      top: `${Qe(e)}px`,
      left: "0px",
      width: `${l.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => r(d.value),
      setPosition: (e, i) => v({ ...d.value, left: e, top: i }),
      setSize: (e, i) => v({ ...d.value, width: e, height: i }),
      reset: () => v(r(M)),
      activate: () => I(!0),
      deactivate: Vn,
      cancelInteraction: (e = null) => he(e)
    }), xi(() => {
      Ze(), Je(), typeof window < "u" && window.removeEventListener("resize", C), $ == null || $.unregisterMember(ot), _e();
    }), (e, i) => (qt(), Ut("div", {
      ref_key: "movableRef",
      ref: f,
      class: oo(["auto-draggable", {
        "select-none": t.disabledUserSelect,
        "is-disabled": t.disabled,
        "is-active": l.active,
        "is-dragging": l.isDragging,
        "is-resizing": l.isResizing,
        "is-rotating": l.isRotating,
        "is-readonly": t.initRect
      }]),
      style: Zt(tt.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (u) => Kn(u, null)),
      onDblclick: i[2] || (i[2] = (u) => s("dblclick", u)),
      onFocus: ri,
      onKeydown: ci
    }, [
      Pe("div", {
        class: "movable-box-guides-layer",
        style: Zt(fi.value),
        "aria-hidden": "true"
      }, [
        (qt(!0), Ut(en, null, nn(io(An).vertical, (u, c) => (qt(), Ut("div", {
          key: `vertical-${c}`,
          class: "movable-box-guide movable-box-guide--vertical",
          style: Zt(hi(u))
        }, null, 4))), 128)),
        (qt(!0), Ut(en, null, nn(io(An).horizontal, (u, c) => (qt(), Ut("div", {
          key: `horizontal-${c}`,
          class: "movable-box-guide movable-box-guide--horizontal",
          style: Zt(di(u))
        }, null, 4))), 128))
      ], 4),
      on(Pe("div", {
        class: "rotation-handle-connector",
        style: Zt(p.value),
        "aria-hidden": "true"
      }, null, 4), [
        [rn, l.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      on(Pe("div", {
        class: "rotation-handle",
        style: Zt(p.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": z.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${z.value} degrees`,
        "aria-keyshortcuts": t.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: ro(Ko, ["stop", "prevent"]),
        onKeydown: ui
      }, [...i[3] || (i[3] = [
        Pe("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, rr), [
        [rn, l.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      (qt(!0), Ut(en, null, nn(t.handles, (u) => on((qt(), Ut("div", {
        key: u,
        class: oo(["handle", `handle-${u}`]),
        style: Zt(J.value),
        role: Jo(u),
        "aria-roledescription": jo(u),
        "aria-orientation": ti(u),
        "aria-label": Qo(u),
        "aria-valuenow": Yn(u),
        "aria-valuemin": ei(u),
        "aria-valuemax": ni(u),
        "aria-valuetext": oi(u),
        "aria-keyshortcuts": ii(u),
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: ro((c) => Kn(c, u), ["stop", "prevent"]),
        onFocus: (c) => h.value = u,
        onBlur: i[0] || (i[0] = (c) => h.value = null)
      }, null, 46, ar)), [
        [rn, l.active && O.value && !t.disabled && Ue(u)]
      ])), 128)),
      Ro(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), cr = (t, o) => {
  const a = t.__vccOpts || t;
  for (const [n, s] of o)
    a[n] = s;
  return a;
}, ur = /* @__PURE__ */ cr(lr, [["__scopeId", "data-v-15145264"]]), fr = Be({
  name: "MovableGroup"
}), hr = /* @__PURE__ */ Be({
  ...fr,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 },
    /**
     * Collision scope for group moves. 'leader' (default) lets the box under the pointer
     * resolve its own collisions; 'all' additionally limits the shared displacement to the
     * earliest contact of any selected member with an external obstacle.
     */
    groupCollision: {
      type: String,
      default: "leader"
    }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(t, { expose: o, emit: a }) {
    const n = t, s = a, r = /* @__PURE__ */ new Map(), f = Ot([]), d = Ot(null), R = bt(() => n.selected !== void 0), M = bt({
      get: () => R.value ? n.selected ?? [] : f.value,
      set: (p) => {
        f.value = p, s("update:selected", p);
      }
    });
    Dt(
      () => n.selected,
      (p) => {
        p !== void 0 && (f.value = [...p]);
      },
      { immediate: !0 }
    );
    const h = (p) => se(p), w = (p, v, b) => ({
      ...p,
      left: x(p.left) + v,
      top: x(p.top) + b
    }), l = (p) => p.reduce(
      (v, b) => ({
        minLeft: Math.min(v.minLeft, b.left),
        minTop: Math.min(v.minTop, b.top),
        maxRight: Math.max(v.maxRight, b.left + b.width),
        maxBottom: Math.max(v.maxBottom, b.top + b.height)
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), O = (p, v, b) => {
      const I = l(p);
      return {
        left: Math.min(
          Math.max(v.left, b.minLeft - I.minLeft),
          b.maxRight - I.maxRight
        ),
        top: Math.min(
          Math.max(v.top, b.minTop - I.minTop),
          b.maxBottom - I.maxBottom
        )
      };
    }, N = (p) => {
      const v = [];
      for (const [b, I] of p) {
        const C = r.get(b);
        C && v.push({ id: b, rect: h(C.getRect()), startRect: h(I) });
      }
      return v;
    }, z = (p) => p.map(({ id: v, rect: b }) => ({ id: v, rect: b })), T = (p, v, b) => {
      if (n.groupCollision !== "all") return b;
      let I = 1;
      for (const [C, W] of p.startRects) {
        if (C === v) continue;
        const E = r.get(C);
        if (!E) continue;
        const G = E.sharedDeltaProgress(W, b);
        G < I && (I = G);
      }
      return { left: b.left * I, top: b.top * I };
    }, tt = (p) => {
      const v = p.filter((I) => r.has(I)), b = M.value;
      b.length === v.length && b.every((I, C) => I === v[C]) || (M.value = v);
    };
    return vi(No, {
      registerMember: (p, v) => r.has(p) && r.get(p) !== v ? !1 : (r.set(p, v), !0),
      renameMember: (p, v, b) => {
        if (r.get(p) !== b) return !1;
        if (p === v) return !0;
        if (r.has(v) && r.get(v) !== b) return !1;
        r.delete(p), r.set(v, b);
        const I = d.value;
        return I && (I.leaderId === p && (I.leaderId = v), I.startRects.has(p) && (I.startRects.set(v, I.startRects.get(p)), I.startRects.delete(p)), I.startVisuals.has(p) && (I.startVisuals.set(v, I.startVisuals.get(p)), I.startVisuals.delete(p))), M.value.includes(p) && tt(M.value.map((C) => C === p ? v : C)), !0;
      },
      unregisterMember: (p) => {
        const v = d.value, b = v && v.leaderId === p ? N(v.startRects) : null;
        r.delete(p), b ? (d.value = null, s("move-cancel", { leaderId: p, source: null, rects: b })) : d.value && (d.value.startRects.delete(p), d.value.startVisuals.delete(p)), M.value.includes(p) && tt(M.value.filter((I) => I !== p));
      },
      hasMember: (p) => p !== void 0 && r.has(p),
      beginDrag: (p, v) => {
        if (d.value && d.value.leaderId !== p)
          return d.value.startRects.has(p) ? "blocked" : "solo";
        if (!r.has(p)) return "solo";
        const b = M.value.includes(p) ? [...M.value] : [p];
        M.value.includes(p) || tt(b);
        const I = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
        for (const E of b) {
          const G = r.get(E);
          !G || G.isInteracting() || (I.set(E, h(G.getRect())), C.set(E, { ...G.getVisualRect() }));
        }
        d.value = { leaderId: p, startRects: I, startVisuals: C };
        const W = [];
        for (const [E, G] of I) W.push({ id: E, rect: h(G) });
        return s("move-start", { leaderId: p, source: v, rects: W }), "group";
      },
      // A non-drag gesture on a formation member would be overwritten by the leader's
      // per-frame translateTo, so members of an active session (leader included) are blocked.
      beginMemberInteraction: (p) => {
        const v = d.value;
        return v ? v.leaderId !== p && !v.startRects.has(p) : !0;
      },
      constrainPosition: (p, v) => {
        var rt;
        const b = d.value, I = b == null ? void 0 : b.startRects.get(p);
        if (!b || b.leaderId !== p || !I) return v;
        const C = r.get(p);
        if (!C) return v;
        const W = x(v.left) - x(I.left), E = x(v.top) - x(I.top), G = C.getAreaEdges();
        if (n.sharedBounds) {
          let Y = { left: W, top: E };
          if (G && (Y = O([...b.startVisuals.values()], Y, G)), Y = T(b, p, Y), Y.left !== W || Y.top !== E) {
            const U = C.sharedDeltaProgress(I, Y);
            Y = { left: Y.left * U, top: Y.top * U }, Y = T(b, p, Y);
          }
          for (const [U, H] of b.startRects)
            U !== p && ((rt = r.get(U)) == null || rt.translateTo(w(H, Y.left, Y.top)));
          return w(I, Y.left, Y.top);
        }
        for (const [Y, U] of b.startRects) {
          if (Y === p) continue;
          const H = r.get(Y);
          if (!H) continue;
          const Q = b.startVisuals.get(Y), et = { left: W, top: E }, F = H.getAreaEdges();
          if (F && Q) {
            const q = x(U.left), lt = x(U.top), dt = Q.left - q, gt = Q.top - lt, ft = F.minLeft - dt, vt = Math.max(ft, F.maxRight - dt - Q.width), zt = F.minTop - gt, te = Math.max(zt, F.maxBottom - gt - Q.height);
            et.left = $t(W, ft - q, vt - q), et.top = $t(E, zt - lt, te - lt);
          }
          const _ = n.groupCollision === "all" ? H.sharedDeltaProgress(U, et) : 1;
          H.translateTo(
            w(U, et.left * _, et.top * _)
          );
        }
        return v;
      },
      notifyMoved: (p, v) => {
        const b = d.value;
        if (!b || b.leaderId !== p) return;
        const I = z(N(b.startRects)).map(
          (C) => C.id === p ? { id: p, rect: h(v) } : C
        );
        s("move", { leaderId: p, rects: I });
      },
      endDrag: (p, v) => {
        const b = d.value;
        if (!b || b.leaderId !== p) return;
        const I = N(b.startRects);
        d.value = null, s("move-stop", { leaderId: p, source: v, rects: I });
      },
      cancelDrag: (p, v) => {
        var C;
        const b = d.value;
        if (!b || b.leaderId !== p) return;
        for (const [W, E] of b.startRects)
          W !== p && ((C = r.get(W)) == null || C.translateTo(h(E)));
        const I = N(b.startRects);
        d.value = null, s("move-cancel", { leaderId: p, source: v, rects: I });
      },
      abortDrag: (p) => {
        const v = d.value;
        if (!v || v.leaderId !== p) return;
        const b = N(v.startRects);
        d.value = null, s("move-cancel", { leaderId: p, source: null, rects: b });
      }
    }), o({
      getSelected: () => [...M.value],
      select: (p) => tt(p ?? [...r.keys()]),
      getMemberRects: () => [...r.entries()].map(([p, v]) => ({ id: p, rect: h(v.getRect()) }))
    }), (p, v) => Ro(p.$slots, "default");
  }
}), Ho = "VueMovableBox", dr = "3.5.0", pr = (t) => {
  t.component(Ho, ur), t.component("MovableGroup", hr);
}, yr = {
  name: Ho,
  version: dr,
  install: pr
};
export {
  ur as MovableBox,
  hr as MovableGroup,
  yr as default,
  pr as install,
  Ho as name,
  dr as version
};
