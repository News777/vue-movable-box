import { computed as mt, ref as Rt, defineComponent as Ne, reactive as ri, watch as Ot, inject as ai, getCurrentInstance as si, onMounted as li, onUnmounted as ci, openBlock as Yt, createElementBlock as Xt, normalizeStyle as Ut, normalizeClass as Zn, createElementVNode as Re, Fragment as qe, renderList as _e, unref as Jn, withDirectives as Ze, vShow as Je, withModifiers as Qn, renderSlot as go, provide as fi } from "vue";
import ui from "decimal.js";
const hi = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, di = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, pi = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, mo = (t) => Number.isFinite(t) && t > 0 ? t : 1;
function gi(t, o) {
  return { handleKeyDown: (n) => {
    const a = t(), r = a.interacting;
    if (!r && (!a.enabled || a.disabled || !a.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), r ? o.cancel(n) : o.deactivate();
      return;
    }
    if (r || a.readOnly) return;
    const u = hi[n.key];
    if (!u) return;
    const h = mo(a.step);
    if (a.focusedHandle && a.resizeDirections.includes(a.focusedHandle)) {
      if (!di[a.focusedHandle].includes(u)) return;
      n.preventDefault(), o.resize(
        a.focusedHandle,
        n.shiftKey ? pi[u] : u,
        h
      );
      return;
    }
    if (n.shiftKey) {
      const R = a.resizeDirections.includes("br") ? "br" : a.resizeDirections[0];
      if (!R) return;
      n.preventDefault(), o.resize(R, u, h);
      return;
    }
    a.dragDirections.includes(u) && (n.preventDefault(), o.move(u, h));
  } };
}
const ze = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, jn = (t) => {
  const o = ze(t.left), s = ze(t.top), n = ze(t.width), a = ze(t.height);
  return o === null || s === null || n === null || a === null || n < 0 || a < 0 ? null : { left: o, top: s, width: n, height: a };
};
function mi(t, o) {
  const s = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(t / s) * s;
}
const to = (t, o, s) => o.distance > s ? t : !t || o.distance < t.distance ? o : t, xi = ["alignment", "spacing"], eo = (t, o, s, n) => {
  for (const a of s) {
    if (a === "alignment") {
      const u = n.alignment();
      if (u && u.distance <= o)
        return {
          candidate: u,
          spacing: null,
          guides: [u.guide],
          spacingInfo: null,
          value: u.value
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
}, no = (t, o, s, n, a) => {
  const r = (d) => t === "horizontal" ? d.left : d.top, u = (d) => t === "horizontal" ? d.left + d.width : d.top + d.height, h = [], R = [];
  for (const d of a)
    u(d.rect) <= o && h.push(d), r(d.rect) >= o + s && R.push(d);
  let v = null;
  for (const d of h)
    for (const I of R) {
      const c = r(I.rect) - u(d.rect) - s;
      if (c < 0) continue;
      const L = c / 2, F = u(d.rect) + L, S = Math.abs(o - F);
      S > n || (!v || S < v.distance) && (v = {
        distance: S,
        value: F,
        gap: L,
        guides: [u(d.rect), r(I.rect)],
        targetIds: [d.id, I.id]
      });
    }
  return v;
};
function yi(t, o, s = 10, n = { horizontal: !0, vertical: !0 }, a = {}) {
  const r = Math.max(0, Number.isFinite(s) ? s : 10), u = t.left + t.width, h = t.top + t.height, R = t.left + t.width / 2, v = t.top + t.height / 2, d = a.priority && a.priority.length > 0 ? a.priority : xi, I = d.includes("alignment"), c = d.includes("spacing"), L = (O, J) => a.filter ? a.filter(O, J) !== !1 : !0, F = /* @__PURE__ */ new Map(), S = (O) => {
    let J = F.get(O);
    return J || (J = {
      horizontal: n.horizontal && L(O, "horizontal"),
      vertical: n.vertical && L(O, "vertical")
    }, F.set(O, J)), J;
  };
  let T = null;
  const j = () => {
    let O = null, J = null;
    for (const rt of o) {
      const H = jn(rt);
      if (!H) continue;
      const Q = S(rt);
      if (!Q.horizontal && !Q.vertical) continue;
      const nt = H.left + H.width, ft = H.top + H.height, bt = H.left + H.width / 2, Ft = H.top + H.height / 2, ut = rt.id;
      if (Q.horizontal) {
        const Wt = [
          {
            distance: Math.abs(t.left - H.left),
            value: H.left,
            guide: H.left,
            point: "left",
            targetId: ut
          },
          {
            distance: Math.abs(u - nt),
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
            distance: Math.abs(u - H.left),
            value: H.left - t.width,
            guide: H.left,
            point: "right",
            targetId: ut
          },
          {
            distance: Math.abs(R - bt),
            value: bt - t.width / 2,
            guide: bt,
            point: "center-x",
            targetId: ut
          }
        ];
        for (const ne of Wt) O = to(O, ne, r);
      }
      if (Q.vertical) {
        const Wt = [
          {
            distance: Math.abs(t.top - H.top),
            value: H.top,
            guide: H.top,
            point: "top",
            targetId: ut
          },
          {
            distance: Math.abs(h - ft),
            value: ft - t.height,
            guide: ft,
            point: "bottom",
            targetId: ut
          },
          {
            distance: Math.abs(t.top - ft),
            value: ft,
            guide: ft,
            point: "top",
            targetId: ut
          },
          {
            distance: Math.abs(h - H.top),
            value: H.top - t.height,
            guide: H.top,
            point: "bottom",
            targetId: ut
          },
          {
            distance: Math.abs(v - Ft),
            value: Ft - t.height / 2,
            guide: Ft,
            point: "center-y",
            targetId: ut
          }
        ];
        for (const ne of Wt) J = to(J, ne, r);
      }
    }
    return { x: O, y: J };
  }, q = (O) => I ? (T || (T = j()), O === "horizontal" ? T.x : T.y) : null, x = [], M = [];
  let b = !1;
  const P = () => {
    for (const O of o) {
      const J = jn(O);
      if (!J) continue;
      const rt = S(O);
      rt.horizontal && x.push({ rect: J, id: O.id }), rt.vertical && M.push({ rect: J, id: O.id });
    }
    b = !0;
  }, N = (O) => c ? (b || P(), O === "horizontal" ? no(
    "horizontal",
    t.left,
    t.width,
    r,
    x
  ) : no("vertical", t.top, t.height, r, M)) : null, W = n.horizontal ? eo("horizontal", r, d, {
    alignment: () => q("horizontal"),
    spacing: () => N("horizontal")
  }) : null, C = n.vertical ? eo("vertical", r, d, {
    alignment: () => q("vertical"),
    spacing: () => N("vertical")
  }) : null, $ = (W == null ? void 0 : W.candidate) ?? null, lt = (C == null ? void 0 : C.candidate) ?? null, Y = [$ == null ? void 0 : $.point, lt == null ? void 0 : lt.point].filter(
    (O) => !!O
  ), _ = [W == null ? void 0 : W.spacingInfo, C == null ? void 0 : C.spacingInfo].filter(
    (O) => !!O
  );
  return {
    left: (W == null ? void 0 : W.value) ?? t.left,
    top: (C == null ? void 0 : C.value) ?? t.top,
    snapped: Y.length > 0 || _.length > 0,
    snapPoint: Y[0],
    points: Y,
    targetId: ($ == null ? void 0 : $.targetId) ?? (lt == null ? void 0 : lt.targetId),
    targetIds: { horizontal: $ == null ? void 0 : $.targetId, vertical: lt == null ? void 0 : lt.targetId },
    guides: {
      vertical: (W == null ? void 0 : W.guides) ?? [],
      horizontal: (C == null ? void 0 : C.guides) ?? []
    },
    spacing: _
  };
}
function vi(t) {
  const o = (a) => {
    const r = t();
    return r.snapToGrid ? mi(a, r.gridSize) : a;
  }, s = (a, r) => ({
    left: o(a),
    top: o(r)
  }), n = mt(() => {
    const a = t();
    return a.snapToGrid ? {
      size: Number.isFinite(a.gridSize) && a.gridSize > 0 ? a.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: s, gridInfo: n };
}
const Qe = () => ({ vertical: [], horizontal: [] });
function bi(t) {
  const o = Rt(Qe()), s = Rt(null);
  return { guides: o, lastSnapResult: s, resolveSnap: (u, h, R) => {
    const v = t(), d = v.enabled ? yi(u, h, v.threshold, R, {
      filter: v.filter,
      priority: v.priority
    }) : {
      ...u,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Qe(),
      spacing: []
    };
    return o.value = d.guides, s.value = d.snapped ? d : null, d;
  }, clearGuides: () => {
    o.value = Qe(), s.value = null;
  }, setGuides: (u) => {
    o.value = u;
  } };
}
const Ae = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, fn = (t) => {
  const o = Ae(t.left), s = Ae(t.top), n = Ae(t.width), a = Ae(t.height);
  return o === null || s === null || n === null || a === null || n <= 0 || a <= 0 ? null : { left: o, top: s, width: n, height: a };
}, Mi = (t) => fn(t) !== null, oo = (t, o, s, n) => {
  const a = s - o;
  if (a === 0) return o < n ? t : null;
  const r = (n - o) / a;
  return a > 0 ? { ...t, exit: Math.min(t.exit, r) } : { ...t, entry: Math.max(t.entry, r) };
}, io = (t, o, s, n) => {
  const a = s - o;
  if (a === 0) return o > n ? t : null;
  const r = (n - o) / a;
  return a > 0 ? { ...t, entry: Math.max(t.entry, r) } : { ...t, exit: Math.min(t.exit, r) };
}, wi = (t, o, s) => {
  let n = { entry: 0, exit: 1 };
  if (n = oo(n, t.left, o.left, s.left + s.width), !n || (n = io(
    n,
    t.left + t.width,
    o.left + o.width,
    s.left
  ), !n) || (n = oo(n, t.top, o.top, s.top + s.height), !n) || (n = io(
    n,
    t.top + t.height,
    o.top + o.height,
    s.top
  ), !n)) return null;
  const a = Math.max(0, n.entry), r = Math.min(1, n.exit);
  return a < r && r > 0 && a < 1 ? { entry: a, exit: r } : null;
};
function he(t, o, s) {
  let n = null;
  for (const a of s) {
    const r = fn(a);
    if (!r) continue;
    const u = wi(t, o, r);
    u && (!n || u.entry < n.entry) && (n = u);
  }
  return n;
}
function Ii(t, o) {
  const s = Math.min(t.left + t.width, o.left + o.width) - Math.max(t.left, o.left), n = Math.min(t.top + t.height, o.top + o.height) - Math.max(t.top, o.top);
  if (s <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const a = t.left + t.width / 2, r = t.top + t.height / 2, u = o.left + o.width / 2, h = o.top + o.height / 2, R = a - u, v = r - h;
  return {
    colliding: !0,
    direction: s <= n ? R > 0 ? "right" : "left" : v > 0 ? "bottom" : "top",
    overlap: Math.min(s, n),
    overlapArea: s * n
  };
}
function je(t, o, s) {
  const n = [];
  for (const a of o) {
    const r = fn(a);
    if (!r) continue;
    const u = Ii(t, r);
    u.colliding && n.push({ ...u, targetId: a.id });
  }
  return n;
}
function Ri(t) {
  let o = null;
  for (const s of t)
    (!o || (s.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = s);
  return o;
}
const xo = (t) => t.reduce((o, s) => o + (s.overlapArea ?? 0), 0), U = (t) => {
  const o = typeof t == "number" ? t : Number(t ?? 0);
  if (!Number.isFinite(o)) return 0;
  const s = (o % 360 + 360) % 360;
  return s > 180 ? s - 360 : s;
}, ro = (t, o, s = 0) => {
  if (!Number.isFinite(t) || !Number.isFinite(o)) return U(o);
  const n = Number.isInteger(s) && s >= 0 ? s : 0, a = 10 ** Math.min(n, 15), r = o * a;
  return (o >= t ? Math.floor(r + Number.EPSILON) : Math.ceil(r - Number.EPSILON)) / a;
}, At = (t) => t * Math.PI / 180, zt = (t) => Math.round(t * 1e9) / 1e9, zi = (t, o) => {
  const s = U(o);
  if (s === 0) return { ...t };
  const n = At(s), a = Math.cos(n), r = Math.sin(n), u = Math.abs(t.width * a) + Math.abs(t.height * r), h = Math.abs(t.width * r) + Math.abs(t.height * a);
  return {
    left: zt(t.left + (t.width - u) / 2),
    top: zt(t.top + (t.height - h) / 2),
    width: zt(u),
    height: zt(h)
  };
}, Ai = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), yo = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, vo = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, ao = /* @__PURE__ */ new Set(["left", "right"]), tn = /* @__PURE__ */ new Set(["top", "bottom"]), en = (t) => yo.test(t) || vo.test(t), Si = (t, o) => en(t) || ao.has(t) ? en(o) || o === "center" || tn.has(o) : tn.has(t) ? o === "center" || ao.has(o) : t === "center", bo = (t) => {
  if (!t) return "center";
  const o = t.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => Ai.has(n) || yo.test(n) || vo.test(n)
  ) || o.length === 2 && !Si(o[0], o[1]) ? "center" : o.join(" ");
}, qt = (t, o, s) => {
  const n = { x: o / 2, y: s / 2 }, r = bo(t).split(" ");
  let u = null, h = null;
  const R = (v) => {
    u === null ? u = v : h === null && (h = v);
  };
  for (const v of r)
    if (v === "left") u = 0;
    else if (v === "right") u = o;
    else if (v === "top") h = 0;
    else if (v === "bottom") h = s;
    else if (v === "center") R(u === null ? o / 2 : s / 2);
    else if (v.endsWith("%")) {
      const d = Number(v.slice(0, -1));
      if (!Number.isFinite(d)) return n;
      R(d / 100 * (u === null ? o : s));
    } else {
      const d = Number.parseFloat(v);
      if (!Number.isFinite(d)) return n;
      R(d);
    }
  return { x: u ?? o / 2, y: h ?? s / 2 };
}, Ti = (t, o, s) => {
  const n = zi(t, o), a = U(o);
  if (a === 0) return n;
  const r = At(a), u = Math.cos(r), h = Math.sin(r), R = t.width / 2 - s.x, v = t.height / 2 - s.y, d = zt(R * u - v * h - R), I = zt(R * h + v * u - v);
  return {
    left: zt(n.left + d),
    top: zt(n.top + I),
    width: n.width,
    height: n.height
  };
}, Pi = (t, o, s) => {
  const n = U(s);
  if (n === 0) return { x: t, y: o };
  const a = At(n), r = Math.cos(a), u = Math.sin(a);
  return {
    x: zt(t * r + o * u),
    y: zt(-t * u + o * r)
  };
}, so = (t) => (t % 360 + 540) % 360 - 180, lo = (t, o, s) => {
  if (o.length === 0 || !Number.isFinite(s)) return t;
  const n = U(t);
  let a = null, r = 1 / 0;
  for (const u of o) {
    if (!Number.isFinite(u)) continue;
    const h = Math.abs(so(U(u) - n));
    h < r && (r = h, a = t + so(U(u) - n));
  }
  return a === null || r > s ? t : Di(a);
}, Di = (t) => Math.abs(t) < 1e-9 ? 0 : t, xt = 1e-7, Pe = (t) => Math.round(t * 1e9) / 1e9, Oi = (t) => ({ x: Pe(t.x), y: Pe(t.y) }), de = (t) => {
  const o = U(t.angle), s = At(o), n = Math.cos(s), a = Math.sin(s), r = t.origin.x, u = t.origin.y;
  return [
    { x: 0, y: 0 },
    { x: t.width, y: 0 },
    { x: t.width, y: t.height },
    { x: 0, y: t.height }
  ].map((R) => {
    const v = R.x - r, d = R.y - u;
    return Oi({
      x: t.left + r + v * n - d * a,
      y: t.top + u + v * a + d * n
    });
  });
}, De = (t) => {
  if (U(t.angle) === 0)
    return { left: t.left, top: t.top, width: t.width, height: t.height };
  const o = de(t), s = o.map((u) => u.x), n = o.map((u) => u.y), a = Math.min(...s), r = Math.min(...n);
  return {
    left: a,
    top: r,
    width: Pe(Math.max(...s) - a),
    height: Pe(Math.max(...n) - r)
  };
}, co = /* @__PURE__ */ new WeakMap(), Ei = (t) => {
  let o = co.get(t);
  return o || (o = De(t), co.set(t, o)), o;
}, an = (t, o) => t.x * o.y - t.y * o.x, fo = (t, o) => {
  let s = 1 / 0, n = -1 / 0;
  for (const a of t) {
    const r = a.x * o.x + a.y * o.y;
    r < s && (s = r), r > n && (n = r);
  }
  return { min: s, max: n };
}, uo = (t) => {
  const o = [];
  for (let s = 0; s < t.length; s += 1) {
    const n = t[(s + 1) % t.length], a = n.x - t[s].x, r = n.y - t[s].y, u = Math.hypot(a, r);
    u < xt || o.push({ x: -r / u, y: a / u });
  }
  return o;
}, ho = (t) => ({
  x: t.reduce((o, s) => o + s.x, 0) / t.length,
  y: t.reduce((o, s) => o + s.y, 0) / t.length
}), Ci = (t, o) => {
  let s = t;
  for (let n = 0; n < o.length && s.length > 0; n += 1) {
    const a = o[n], r = o[(n + 1) % o.length], u = { x: r.x - a.x, y: r.y - a.y }, h = (I) => an(u, { x: I.x - a.x, y: I.y - a.y }), R = s;
    s = [];
    let v = R[R.length - 1], d = h(v);
    for (const I of R) {
      const c = h(I);
      if (c >= 0) {
        if (d < 0) {
          const L = d / (d - c);
          s.push({
            x: v.x + (I.x - v.x) * L,
            y: v.y + (I.y - v.y) * L
          });
        }
        s.push(I);
      } else if (d >= 0) {
        const L = d / (d - c);
        s.push({
          x: v.x + (I.x - v.x) * L,
          y: v.y + (I.y - v.y) * L
        });
      }
      v = I, d = c;
    }
  }
  return s;
}, Ni = (t) => {
  if (t.length < 3) return 0;
  let o = 0;
  for (let s = 0; s < t.length; s += 1) {
    const n = t[(s + 1) % t.length];
    o += t[s].x * n.y - n.x * t[s].y;
  }
  return Math.abs(o) / 2;
}, _t = (t, o) => {
  const s = de(t), n = de(o);
  let a = 1 / 0, r = null;
  const u = ho(s), h = ho(n), R = [...uo(n), ...uo(s)];
  for (const d of R) {
    const I = fo(s, d), c = fo(n, d), L = Math.min(I.max, c.max) - Math.max(I.min, c.min);
    if (L <= xt)
      return { overlapping: !1, depth: 0, normal: null, overlapArea: 0 };
    const F = L < a - xt, S = !F && L <= a + xt && (r === null || Math.abs(d.x) > Math.abs(r.x));
    if (F || S) {
      a = Math.min(a, L);
      const T = (u.x - h.x) * d.x + (u.y - h.y) * d.y >= 0 ? 1 : -1;
      r = { x: d.x * T, y: d.y * T };
    }
  }
  const v = Ci(s, n);
  return {
    overlapping: !0,
    depth: a,
    normal: r ?? { x: 0, y: 0 },
    overlapArea: Ni(v)
  };
}, Hi = (t) => {
  const o = Array.from(
    new Map(t.map((r) => [`${r.x},${r.y}`, r])).values()
  ).sort((r, u) => r.x === u.x ? r.y - u.y : r.x - u.x);
  if (o.length <= 2) return o;
  const s = (r, u, h) => (u.x - r.x) * (h.y - r.y) - (u.y - r.y) * (h.x - r.x), n = [];
  for (const r of o) {
    for (; n.length >= 2 && s(n[n.length - 2], n[n.length - 1], r) <= 0; )
      n.pop();
    n.push(r);
  }
  const a = [];
  for (let r = o.length - 1; r >= 0; r -= 1) {
    const u = o[r];
    for (; a.length >= 2 && s(a[a.length - 2], a[a.length - 1], u) <= 0; )
      a.pop();
    a.push(u);
  }
  return n.pop(), a.pop(), [...n, ...a];
}, Bi = (t, o) => {
  const s = de(t), n = de(o), a = [];
  for (const r of n)
    for (const u of s)
      a.push({ x: r.x - u.x, y: r.y - u.y });
  return Hi(a);
}, Li = (t, o) => {
  if (o.length < 3) return null;
  let s = 0, n = 1;
  for (let a = 0; a < o.length; a += 1) {
    const r = o[a], u = o[(a + 1) % o.length], h = { x: u.x - r.x, y: u.y - r.y }, R = an(h, t), v = an(h, r);
    if (Math.abs(R) < xt) {
      if (v > -xt) return null;
      continue;
    }
    const d = v / R;
    R > 0 ? s = Math.max(s, d) : n = Math.min(n, d);
  }
  return s < n - xt && n > xt && s < 1 - xt ? { entry: s, exit: n } : null;
}, Oe = (t, o, s) => {
  if (o.x === 0 && o.y === 0) return null;
  let n = null;
  const a = De(t);
  for (const r of s) {
    if (r.width <= 0 || r.height <= 0) continue;
    const u = Ei(r), h = Math.min(
      a.left + a.width + Math.max(o.x, 0),
      u.left + u.width
    ) - Math.max(a.left + Math.min(o.x, 0), u.left), R = Math.min(
      a.top + a.height + Math.max(o.y, 0),
      u.top + u.height
    ) - Math.max(a.top + Math.min(o.y, 0), u.top);
    if (h <= xt || R <= xt) continue;
    const v = Bi(t, r), d = Li(o, v);
    d && (!n || d.entry < n.interval.entry) && (n = { interval: d, target: r, targetId: r.id });
  }
  return n;
}, ue = (t, o) => ({
  ...t,
  left: t.left + o.x,
  top: t.top + o.y
}), sn = (t, o, s) => ({
  left: t.left + (o.left - t.left) * s,
  top: t.top + (o.top - t.top) * s,
  width: t.width + (o.width - t.width) * s,
  height: t.height + (o.height - t.height) * s,
  angle: t.angle + (o.angle - t.angle) * s,
  origin: {
    x: t.origin.x + (o.origin.x - t.origin.x) * s,
    y: t.origin.y + (o.origin.y - t.origin.y) * s
  }
}), Mo = (t, o) => t.width === o.width && t.height === o.height && U(t.angle) === U(o.angle) && t.origin.x === o.origin.x && t.origin.y === o.origin.y, Ee = (t, o) => t > 0 ? o < t : o === 0, wo = (t, o, s = 20) => {
  const n = Math.max(1, Math.floor(o));
  let a = 0, r = 1, u = !1;
  for (let h = 1; h <= n; h += 1) {
    const R = h / n;
    if (t(R)) {
      r = R, u = !0;
      break;
    }
    a = R;
  }
  if (!u) return 1;
  for (let h = 0; h < s; h += 1) {
    const R = (a + r) / 2;
    t(R) ? r = R : a = R;
  }
  return a;
}, Fi = (t, o, s) => {
  if (Mo(t, o)) {
    const a = Oe(t, { x: o.left - t.left, y: o.top - t.top }, s);
    return a ? Math.max(0, a.interval.entry - xt) : 1;
  }
  return wo((a) => {
    const r = sn(t, o, a);
    return s.some((u) => _t(r, u).overlapping);
  }, 16);
}, Io = (t, o, s) => ({
  left: t.left + (o.left - t.left) * s,
  top: t.top + (o.top - t.top) * s,
  width: t.width + (o.width - t.width) * s,
  height: t.height + (o.height - t.height) * s
}), Wi = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height, nn = (t, o, s, n) => {
  if (!he(t, o, s))
    return { rect: o, progress: 1 };
  let a = 0, r = 1, u = t;
  for (let h = 0; h < 24; h += 1) {
    const R = (a + r) / 2, v = n(Io(t, o, R));
    he(t, v, s) ? r = R : (u = v, a = R);
  }
  return { rect: u, progress: a };
}, ki = (t) => Math.abs(t.x) >= Math.abs(t.y) ? t.x > 0 ? "right" : "left" : t.y > 0 ? "bottom" : "top", Gi = (t) => ({
  x: Math.round(t.x * 1e4) / 1e4,
  y: Math.round(t.y * 1e4) / 1e4
}), $i = (t) => ({
  results: t,
  dominant: Ri(t),
  totalOverlapArea: xo(t)
}), Se = (t, o) => {
  const s = /* @__PURE__ */ new Map();
  return o.forEach((n, a) => {
    if (n.width <= 0 || n.height <= 0) return;
    const r = _t(t, n);
    r.overlapping && s.set(a, r.overlapArea);
  }), s;
}, po = (t, o) => {
  let s = 0;
  t.forEach((a) => {
    s += a;
  });
  let n = 0;
  for (const [a, r] of o) {
    n += r;
    const u = t.get(a);
    if (u === void 0 || r > u) return !1;
  }
  return Ee(s, n);
}, Ki = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height;
function Vi(t) {
  const o = Rt([]), s = Rt(!1), n = (d) => (o.value = d, s.value = d.length > 0, $i(d)), a = (d, I) => {
    const L = t().enabled ? je(d, I) : [];
    return n(L);
  }, r = (d, I) => {
    if (!t().enabled) return n([]);
    const L = [];
    for (const F of I) {
      if (F.width <= 0 || F.height <= 0) continue;
      const S = _t(d, F);
      S.overlapping && L.push({
        colliding: !0,
        direction: S.normal ? ki(S.normal) : void 0,
        normal: S.normal ? Gi(S.normal) : void 0,
        overlap: S.depth,
        overlapArea: S.overlapArea,
        targetId: F.id
      });
    }
    return n(L);
  }, u = (d, I, c) => {
    const L = t(), F = r(I, c);
    if (!L.enabled || L.allowOverlap)
      return { accepted: !0, rect: I, progress: 1, ...F };
    const S = Se(d, c);
    if (S.size > 0)
      return {
        accepted: po(S, Se(I, c)),
        rect: I,
        progress: 1,
        ...F
      };
    const T = { x: I.left - d.left, y: I.top - d.top };
    if (T.x === 0 && T.y === 0)
      return { accepted: !0, rect: I, progress: 1, ...F };
    const j = Oe(d, T, c);
    if (!j)
      return { accepted: !0, rect: I, progress: 1, ...F };
    const { interval: q } = j, x = Math.min(1e-3, q.entry), M = ue(d, {
      x: T.x * (q.entry - x),
      y: T.y * (q.entry - x)
    }), b = ue(d, {
      x: T.x * (q.entry + (q.exit - q.entry) * 1e-3),
      y: T.y * (q.entry + (q.exit - q.entry) * 1e-3)
    }), P = _t(b, j.target), N = {
      x: T.x * (1 - q.entry),
      y: T.y * (1 - q.entry)
    }, W = (H, Q) => {
      const nt = Oe(H, Q, c);
      if (!nt) return ue(H, Q);
      const ft = Math.min(1e-3, nt.interval.entry);
      return ue(H, {
        x: Q.x * (nt.interval.entry - ft),
        y: Q.y * (nt.interval.entry - ft)
      });
    };
    let C = M;
    const $ = P.normal;
    if ($) {
      const H = { x: -$.y, y: $.x }, Q = H.x * N.x + H.y * N.y, nt = Q >= 0 ? 1 : -1;
      Math.abs(Q) > 1e-9 && (C = W(C, {
        x: H.x * nt * Math.abs(Q),
        y: H.y * nt * Math.abs(Q)
      }));
    }
    const lt = { x: C.left - M.left, y: C.top - M.top }, Y = N.x - lt.x, _ = N.y - lt.y;
    Y !== 0 && Math.sign(Y) === Math.sign(N.x) && (C = W(C, { x: Y, y: 0 })), _ !== 0 && Math.sign(_) === Math.sign(N.y) && (C = W(C, { x: 0, y: _ }));
    const O = r(C, c), J = O.results.length > 0 ? O : r(b, c), rt = T.x * T.x + T.y * T.y > 0 ? ((C.left - d.left) * T.x + (C.top - d.top) * T.y) / (T.x * T.x + T.y * T.y) : 1;
    return {
      accepted: !Ki(C, d),
      rect: C,
      progress: Math.max(0, Math.min(1, rt)),
      ...J
    };
  };
  return {
    collisions: o,
    isColliding: s,
    evaluate: a,
    evaluateOriented: r,
    resolveCandidate: (d, I, c, L = (S) => S, F = "path") => {
      const S = t(), T = a(d, c);
      if (!S.enabled || S.allowOverlap)
        return { accepted: !0, rect: d, progress: 1, ...T };
      const j = je(I, c), q = xo(j);
      if (q > 0)
        return {
          accepted: Ee(q, T.totalOverlapArea),
          rect: d,
          progress: 1,
          ...T
        };
      const x = he(I, d, c);
      if (T.results.length === 0 && !x)
        return { accepted: !0, rect: d, progress: 1, ...T };
      let M = T;
      if (T.results.length === 0 && x) {
        const P = Io(
          I,
          d,
          x.entry + (x.exit - x.entry) * 1e-3
        );
        M = n(je(P, c));
      }
      let b = null;
      if (F === "slide") {
        const P = nn(
          I,
          { ...I, left: d.left },
          c,
          L
        ), N = nn(
          I,
          { ...I, top: d.top },
          c,
          L
        ), W = L({
          ...d,
          left: P.rect.left,
          top: N.rect.top
        });
        he(I, W, c) || (b = { rect: W });
      }
      return b ?? (b = nn(I, d, c, L)), {
        accepted: !Wi(b.rect, I),
        rect: b.rect,
        progress: b.progress,
        ...M
      };
    },
    resolveOrientedTranslation: u,
    resolveOrientedChange: (d, I, c) => {
      const L = t(), F = r(I, c);
      if (!L.enabled || L.allowOverlap)
        return { accepted: !0, rect: I, progress: 1, ...F };
      const S = Se(d, c);
      if (S.size > 0)
        return {
          accepted: po(S, Se(I, c)),
          rect: I,
          progress: 1,
          ...F
        };
      if (Mo(d, I))
        return u(d, I, c);
      const T = Fi(d, I, c), j = sn(d, I, T), q = r(j, c);
      let x = q;
      if (q.results.length === 0 && T < 1) {
        const M = sn(d, I, T + (1 - T) * 1e-3);
        x = r(M, c);
      }
      return {
        accepted: T > 0,
        rect: j,
        progress: T,
        ...x
      };
    },
    clearCollisions: () => {
      o.value = [], s.value = !1;
    }
  };
}
const y = (t, o = 0) => {
  if (t == null || t === "")
    return o;
  const s = typeof t == "string" ? Number(t) : t;
  return Number.isFinite(s) ? s : o;
}, Lt = (t, o, s) => Math.min(Math.max(t, o), s), Yi = (t, o) => y(t.left) === y(o.left) && y(t.top) === y(o.top) && y(t.width) === y(o.width) && y(t.height) === y(o.height), Xi = {
  tl: { x: -1, y: -1 },
  tm: { x: 0, y: -1 },
  tr: { x: 1, y: -1 },
  ml: { x: -1, y: 0 },
  mr: { x: 1, y: 0 },
  bl: { x: -1, y: 1 },
  bm: { x: 0, y: 1 },
  br: { x: 1, y: 1 }
}, Ui = (t, o, s) => {
  switch (t) {
    case "tl":
      return { x: 0, y: 0 };
    case "tm":
      return { x: o / 2, y: 0 };
    case "tr":
      return { x: o, y: 0 };
    case "ml":
      return { x: 0, y: s / 2 };
    case "mr":
      return { x: o, y: s / 2 };
    case "bl":
      return { x: 0, y: s };
    case "bm":
      return { x: o / 2, y: s };
    case "br":
      return { x: o, y: s };
    default:
      return { x: o, y: s };
  }
}, un = (t, o, s) => {
  switch (t) {
    case "tl":
      return { x: o, y: s };
    case "tm":
      return { x: o / 2, y: s };
    case "tr":
      return { x: 0, y: s };
    case "ml":
      return { x: o, y: s / 2 };
    case "mr":
      return { x: 0, y: s / 2 };
    case "bl":
      return { x: o, y: 0 };
    case "bm":
      return { x: o / 2, y: 0 };
    case "br":
      return { x: 0, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
}, ln = (t, o, s, n) => {
  const a = qt(s, t.width, t.height), r = At(U(o)), u = Math.cos(r), h = Math.sin(r), R = n.x - a.x, v = n.y - a.y;
  return {
    x: t.left + a.x + R * u - v * h,
    y: t.top + a.y + R * h + v * u
  };
}, Ce = (t) => Math.abs(t) < 1e-9 ? 0 : t, on = (t, o, s) => Math.min(Math.max(t, o), Math.max(o, s)), qi = (t) => {
  const { start: o, angle: s, originSpec: n, handle: a, pointerDelta: r } = t, u = U(s), h = Xi[a], R = ln(
    o,
    u,
    n,
    un(a, o.width, o.height)
  ), v = ln(
    o,
    u,
    n,
    Ui(a, o.width, o.height)
  ), d = {
    x: v.x + r.x,
    y: v.y + r.y
  }, I = At(u), c = Math.cos(I), L = Math.sin(I), F = { x: d.x - R.x, y: d.y - R.y }, S = {
    x: F.x * c + F.y * L,
    y: -F.x * L + F.y * c
  };
  let T = h.x === 0 ? o.width : Ce(h.x * S.x), j = h.y === 0 ? o.height : Ce(h.y * S.y);
  const q = Math.max(0, t.minWidth ?? 0), x = Math.max(0, t.minHeight ?? 0), M = Number.isFinite(t.maxWidth) ? Math.max(0, t.maxWidth ?? 1 / 0) : 1 / 0, b = Number.isFinite(t.maxHeight) ? Math.max(0, t.maxHeight ?? 1 / 0) : 1 / 0;
  if (t.ratio && Number.isFinite(t.ratio) && t.ratio > 0) {
    const P = t.ratio, W = h.x !== 0 && (h.y === 0 || Math.abs(S.x) >= Math.abs(S.y) * P) ? T : j * P, C = Math.max(q, x * P), $ = Math.min(M, b * P);
    T = on(W, Math.min(C, $), $), j = T / P;
  } else
    T = on(T, Math.min(q, M), M), j = on(j, Math.min(x, b), b);
  return cn(
    { left: o.left, top: o.top, width: T, height: j },
    u,
    n,
    a,
    R
  );
}, cn = (t, o, s, n, a) => {
  const r = qt(s, t.width, t.height), u = un(n, t.width, t.height), h = At(U(o)), R = Math.cos(h), v = Math.sin(h), d = u.x - r.x, I = u.y - r.y;
  return {
    ...t,
    left: Ce(a.x - r.x - (d * R - I * v)),
    top: Ce(a.y - r.y - (d * v + I * R))
  };
}, Ro = Symbol("MovableGroupContext"), _i = 2, st = (t, o = 1) => {
  if (t == null || t === "")
    return o;
  const s = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(s) ? o : s;
}, Te = (t, o = "px") => t == null || t === "" ? "0" : `${t}${o}`;
function ce(t, o, s, n) {
  t && t.addEventListener(o, s, n);
}
function fe(t, o, s, n) {
  t && t.removeEventListener(o, s, n);
}
const rn = (t, o = 1, s = _i) => {
  const n = new ui(t).toDecimalPlaces(s).toNumber();
  return st(n, o);
}, ee = (t) => {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Date)
    return new Date(t.getTime());
  if (t instanceof Array)
    return t.map((o) => ee(o));
  if (t instanceof Object) {
    const o = {};
    for (const s in t)
      t.hasOwnProperty(s) && (o[s] = ee(t[s]));
    return o;
  }
  return t;
}, Zi = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], Ji = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Qi = Ne({
  name: "VueMovableBox"
}), ji = /* @__PURE__ */ Ne({
  ...Qi,
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
  setup(t, { expose: o, emit: s }) {
    var Wn;
    const n = t, a = s, r = (e) => ee(e), u = Rt(), h = Rt(r(n.modelValue)), R = Rt(U(n.rotate)), v = r(n.modelValue), d = Rt(null), I = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, c = ri({
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
      beforeRotation: U(n.rotate),
      rotationStartPointerAngle: 0,
      rotationOriginX: 0,
      rotationOriginY: 0,
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    Ot(
      () => n.modelValue,
      (e) => {
        h.value = r(e);
      },
      { deep: !0 }
    ), Ot(
      () => n.rotate,
      (e) => {
        R.value = U(e);
      }
    ), Ot(
      () => n.active,
      (e) => {
        !e && c.isInteracting ? be() : P(e);
      },
      { flush: "sync" }
    ), Ot(
      () => n.disabled,
      (e) => {
        a("disabled", e), e && be();
      }
    ), Ot(
      () => n.initRect,
      (e) => {
        e && be();
      }
    ), Ot(
      () => n.isKeepDecimals,
      (e, i) => {
        !e && i && M({
          ...h.value,
          left: Math.round(y(h.value.left)),
          top: Math.round(y(h.value.top)),
          width: Math.round(y(h.value.width)),
          height: Math.round(y(h.value.height))
        });
      }
    );
    const L = mt(() => n.resizable ?? n.resizeable ?? !0), F = mt(() => n.unitType === "%"), S = mt(() => R.value), T = mt(() => bo(n.transformOrigin)), j = mt(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : c.active ? n.theme : n.inActiveColor,
      left: Te(h.value.left, n.unitType),
      top: Te(h.value.top, n.unitType),
      width: Te(h.value.width, n.unitType),
      height: Te(h.value.height, n.unitType),
      zIndex: h.value.zIndex,
      cursor: n.disabled ? "not-allowed" : c.isDragging ? "move" : c.isResizing ? "nwse-resize" : c.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: c.active ? 1 : 0.9,
      transform: S.value ? `rotate(${S.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: T.value,
      willChange: c.isDragging || c.isResizing ? "left, top, width, height" : c.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !c.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), q = mt(() => ({
      borderColor: L.value ? n.theme : n.inActiveColor,
      scale: rn(1 / st(n.scale, 1), 1)
    })), x = mt(() => {
      const e = Math.abs(st(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / e}px`,
        "--rotation-handle-scale": rn(1 / e, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), M = (e) => {
      const i = r(e);
      return h.value = i, a("update:modelValue", r(i)), i;
    }, b = (e) => {
      const i = U(E(U(e)));
      return R.value = i, a("update:rotate", i), a("rotate", i), i;
    };
    function P(e) {
      c.active !== e && (c.active = e, a(e ? "active" : "inactive", r(h.value)), e || ke());
    }
    const N = () => {
      var i, f, l;
      let e = null;
      if (n.limitAreaClass)
        try {
          e = document.querySelector(n.limitAreaClass);
        } catch {
          e = null;
        }
      c.parentElement = e ?? ((i = u.value) == null ? void 0 : i.parentElement) ?? null, c.parentWidth = ((f = c.parentElement) == null ? void 0 : f.clientWidth) ?? 0, c.parentHeight = ((l = c.parentElement) == null ? void 0 : l.clientHeight) ?? 0;
    }, W = (e) => Math.max(0, Number(e) || 0), C = () => {
      const e = W(n.edgeDistance);
      return {
        top: e + W(n.boundsMargin.top),
        right: e + W(n.boundsMargin.right),
        bottom: e + W(n.boundsMargin.bottom),
        left: e + W(n.boundsMargin.left)
      };
    }, $ = () => {
      const e = C(), i = F.value ? 100 : c.parentWidth, f = F.value ? 100 : c.parentHeight;
      return {
        minLeft: e.left,
        maxRight: Math.max(e.left, i - e.right),
        minTop: e.top,
        maxBottom: Math.max(e.top, f - e.bottom)
      };
    }, lt = (e) => {
      const i = $();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - e.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - e.height)
      };
    }, Y = (e) => ({
      left: y(e.left),
      top: y(e.top),
      width: y(e.width),
      height: y(e.height)
    }), _ = () => ({
      x: F.value && c.parentWidth > 0 ? c.parentWidth / 100 : 1,
      y: F.value && c.parentHeight > 0 ? c.parentHeight / 100 : 1
    }), O = (e) => {
      const i = Y(e), f = S.value;
      if (!f) return i;
      const l = _(), m = {
        left: i.left * l.x,
        top: i.top * l.y,
        width: i.width * l.x,
        height: i.height * l.y
      }, g = qt(n.transformOrigin, m.width, m.height), p = Ti(m, f, g);
      return {
        left: p.left / l.x,
        top: p.top / l.y,
        width: p.width / l.x,
        height: p.height / l.y
      };
    }, J = (e, i, f) => {
      const l = _(), m = e.left * l.x, g = e.top * l.y, p = e.width * l.x, z = e.height * l.y;
      return {
        left: m,
        top: g,
        width: p,
        height: z,
        angle: i,
        origin: qt(f, p, z)
      };
    }, rt = (e, i = S.value) => J(Y(e), i, n.transformOrigin);
    let H = null;
    const Q = () => {
      H = null;
    };
    Ot(
      () => [n.snapTargets, n.collisionTargets, n.transformOrigin],
      Q,
      { deep: !0 }
    ), Ot(() => [c.parentWidth, c.parentHeight, n.unitType], Q);
    const nt = (e) => {
      H === null && (H = /* @__PURE__ */ new WeakMap());
      const i = H.get(e);
      if (i) return i;
      const f = _(), l = {
        left: y(e.left) * f.x,
        top: y(e.top) * f.y,
        width: y(e.width) * f.x,
        height: y(e.height) * f.y
      }, m = {
        ...l,
        id: e.id,
        angle: U(e.rotate ?? 0),
        origin: qt(e.transformOrigin ?? "center", l.width, l.height)
      };
      return H.set(e, m), m;
    }, ft = (e) => nt(e), bt = () => Le().filter(Mi).map(ft), Ft = () => {
      if (!n.snapToElements) return xn();
      const e = _();
      return xn().map((i) => {
        if (!U(i.rotate ?? 0)) return i;
        const f = De(ft(i));
        return {
          left: f.left / e.x,
          top: f.top / e.y,
          width: f.width / e.x,
          height: f.height / e.y,
          id: i.id
        };
      });
    }, ut = () => n.collisionEnabled && !n.allowOverlap && ge.value, Wt = (e, i, f) => {
      const l = (p) => {
        const z = rt(p);
        let A = 0;
        for (const D of f) {
          const k = _t(z, D);
          k.overlapping && (A += k.overlapArea);
        }
        return A;
      }, m = l(i), g = (p) => Ee(m, l(p));
      if (g(e)) return e;
      for (let p = 0.8; p > 0.01; p -= 0.2) {
        const z = {
          ...e,
          left: E(
            y(i.left) + (y(e.left) - y(i.left)) * p
          ),
          top: E(
            y(i.top) + (y(e.top) - y(i.top)) * p
          )
        };
        if (g(z)) return z;
      }
      return i;
    }, ne = (e, i, f) => {
      const l = bt(), m = rt(i), g = rt(e), p = f === "slide" ? me.resolveOrientedTranslation(m, g, l) : me.resolveOrientedChange(m, g, l);
      if (Mn(p), !p.accepted) return null;
      const z = _(), A = {
        ...e,
        left: E(p.rect.left / z.x),
        top: E(p.rect.top / z.y),
        width: E(p.rect.width / z.x),
        height: E(p.rect.height / z.y)
      };
      return ut() ? Wt(A, i, l) : A;
    }, hn = () => n.collisionEnabled && !n.allowOverlap && ge.value, Ao = (e) => {
      if (!n.limitAreaForParent || !c.parentElement) return !1;
      const i = $(), f = De(rt(h.value, e)), l = _(), m = f.left / l.x, g = f.top / l.y, p = f.width / l.x, z = f.height / l.y, A = 1e-7;
      return m < i.minLeft - A || m + p > i.maxRight + A || g < i.minTop - A || g + z > i.maxBottom + A;
    }, pe = (e, i) => {
      if (Ao(e)) return !0;
      if (!hn() || i.length === 0) return !1;
      const f = rt(h.value, e);
      return i.some((l) => _t(f, l).overlapping);
    }, dn = (e, i) => Math.max(48, Math.ceil(Math.abs(i - e) / 2)), So = (e, i, f) => {
      const l = wo(
        (m) => pe(e + (i - e) * m, f),
        dn(e, i)
      );
      return l === 1 ? i : e + (i - e) * l;
    }, pn = (e, i) => {
      if (Math.abs(i - e) < 1e-9) return U(i);
      const f = n.limitAreaForParent && !!c.parentElement, l = hn() ? bt() : [];
      if (!f && l.length === 0) return U(i);
      const m = n.isKeepDecimals ? n.decimalPlaces : 0;
      if (pe(e, l)) {
        const p = dn(e, i);
        for (let z = 1; z <= p; z += 1) {
          const A = e + (i - e) * z / p;
          if (!pe(A, l)) {
            const D = U(ro(i, A, m));
            if (!pe(D, l)) return D;
          }
        }
        return U(e);
      }
      const g = So(e, i, l);
      return U(ro(e, g, m));
    }, gn = (e, i) => {
      const f = S.value;
      if (!f && n.resizeMode !== "fixed-anchor" || !n.limitAreaForParent || !c.parentElement)
        return e;
      const l = $(), m = Math.max(0, l.maxRight - l.minLeft), g = Math.max(0, l.maxBottom - l.minTop), p = At(f), z = Math.abs(Math.cos(p)) < 1e-9 ? 0 : Math.abs(Math.cos(p)), A = Math.abs(Math.sin(p)) < 1e-9 ? 0 : Math.abs(Math.sin(p)), D = _(), k = z, B = A * (D.y / D.x), G = A * (D.x / D.y), Z = z, K = y(e.width), V = y(e.height), w = i ? I[i] : null, ot = y(e.left) + K, Tt = y(e.top) + V, Mt = (pt, vt) => ({
        ...e,
        left: w != null && w.left ? E(ot - pt) : e.left,
        top: w != null && w.top ? E(Tt - vt) : e.top,
        width: pt,
        height: vt
      }), ht = (pt, vt) => ({
        ...e,
        left: w != null && w.left ? ot - pt : e.left,
        top: w != null && w.top ? Tt - vt : e.top,
        width: pt,
        height: vt
      }), Ht = k * K + B * V, $t = G * K + Z * V, yt = Math.max(0, st(n.minWidth, 0)), dt = Math.max(0, st(n.minHeight, 0)), Kt = i === null || !!(w != null && w.left || w != null && w.right), Pt = i === null || !!(w != null && w.top || w != null && w.bottom), wt = (w == null ? void 0 : w.left) ?? !1, at = (w == null ? void 0 : w.top) ?? !1, tt = (pt, vt) => {
        if (!wt && !at) return pt;
        const It = y(pt.width), Jt = y(pt.height), Gn = vt ? Math.min(
          1,
          Math.max(
            It > 0 ? yt / It : 0,
            Jt > 0 ? dt / Jt : 0
          )
        ) : 0, $n = vt ? It * Gn : wt ? Math.min(It, yt) : It, Kn = vt ? Jt * Gn : at ? Math.min(Jt, dt) : Jt, Vn = (it) => ({
          width: $n + (It - $n) * it,
          height: Kn + (Jt - Kn) * it
        }), Yn = (it) => {
          const et = Vn(it);
          return ht(et.width, et.height);
        }, Qt = (it) => {
          const et = Vn(it), gt = n.isKeepDecimals ? E : Math.floor;
          return Mt(
            Math.max(yt, gt(et.width)),
            Math.max(dt, gt(et.height))
          );
        }, we = (it) => {
          const et = O(it), gt = 1e-7;
          return (!wt || et.left >= l.minLeft - gt && et.left + et.width <= l.maxRight + gt) && (!at || et.top >= l.minTop - gt && et.top + et.height <= l.maxBottom + gt);
        };
        if (we(pt)) return pt;
        const jt = O(Yn(0)), te = O(Yn(1));
        let Bt = 0, Dt = 1, Ue = !0;
        const Xn = (it, et, gt) => {
          const Vt = et - it;
          if (Math.abs(Vt) < 1e-9) {
            it < gt && (Ue = !1);
            return;
          }
          const le = (gt - it) / Vt;
          Vt > 0 ? Bt = Math.max(Bt, le) : Dt = Math.min(Dt, le);
        }, Un = (it, et, gt) => {
          const Vt = et - it;
          if (Math.abs(Vt) < 1e-9) {
            it > gt && (Ue = !1);
            return;
          }
          const le = (gt - it) / Vt;
          Vt > 0 ? Dt = Math.min(Dt, le) : Bt = Math.max(Bt, le);
        };
        if (wt && (Xn(jt.left, te.left, l.minLeft), Un(
          jt.left + jt.width,
          te.left + te.width,
          l.maxRight
        )), at && (Xn(jt.top, te.top, l.minTop), Un(
          jt.top + jt.height,
          te.top + te.height,
          l.maxBottom
        )), Bt = Math.max(0, Bt), Dt = Math.min(1, Dt), !Ue || Bt > Dt) return Qt(0);
        const qn = Qt(Dt);
        if (we(qn)) return qn;
        let Ie = Bt, _n = Dt;
        if (!we(Qt(Ie))) return Qt(0);
        for (let it = 0; it < 32; it += 1) {
          const et = (Ie + _n) / 2;
          we(Qt(et)) ? Ie = et : _n = et;
        }
        return Qt(Ie);
      };
      if (n.ratioLock || Kt && Pt) {
        const pt = Math.min(
          1,
          Ht > m ? m / Ht : 1,
          $t > g ? g / $t : 1
        ), vt = Math.max(
          pt,
          K > 0 ? yt / K : 0,
          V > 0 ? dt / V : 0
        ), It = Math.min(vt, 1);
        return It >= 1 ? tt(e, !0) : tt(
          Mt(
            Math.max(yt, Math.floor(K * It)),
            Math.max(dt, Math.floor(V * It))
          ),
          !0
        );
      }
      const ct = Math.floor(
        Math.min(
          k > 0 ? (m - B * V) / k : 1 / 0,
          G > 0 ? (g - Z * V) / G : 1 / 0
        )
      ), Zt = Math.floor(
        Math.min(
          B > 0 ? (m - k * K) / B : 1 / 0,
          Z > 0 ? (g - G * K) / Z : 1 / 0
        )
      ), se = Kt ? Math.max(yt, Math.min(K, ct)) : K, kn = Pt ? Math.max(dt, Math.min(V, Zt)) : V;
      return tt(se === K && kn === V ? e : Mt(se, kn), !1);
    }, He = (e) => {
      if (!c.parentElement) return;
      const i = $(), f = O(e), l = f.left, m = f.top, g = l + f.width, p = m + f.height;
      l < i.minLeft && a("out-of-bounds", "left"), g > i.maxRight && a("out-of-bounds", "right"), m < i.minTop && a("out-of-bounds", "top"), p > i.maxBottom && a("out-of-bounds", "bottom");
    }, Be = (e) => {
      if (!n.limitAreaForParent || !c.parentElement) return e;
      const i = O(e), f = lt(i), l = Lt(i.left, f.minLeft, f.maxLeft), m = Lt(i.top, f.minTop, f.maxTop);
      return S.value ? {
        ...e,
        left: E(y(e.left) + (l - i.left)),
        top: E(y(e.top) + (m - i.top))
      } : {
        ...e,
        left: l,
        top: m
      };
    }, X = ai(Ro, null), Et = n.memberId || `member-${((Wn = si()) == null ? void 0 : Wn.uid) ?? Math.random().toString(36).slice(2)}`;
    let Ct = !1;
    const mn = (e) => Math.max(0, Math.floor(e * 1e6) / 1e6), To = {
      getRect: () => r(h.value),
      getVisualRect: () => O(r(h.value)),
      translateTo: (e) => {
        M(e);
      },
      // The group constraint loop runs per frame, so re-resolving layout on every call would
      // dominate group drags. Resolve the area lazily once per member, then reuse the
      // snapshot (refreshed at each interaction start by the box itself).
      getAreaEdges: () => (c.parentElement || N(), c.parentElement ? $() : null),
      // Largest fraction of a shared group delta this box can absorb without colliding,
      // swept from the member's drag-start rectangle: the group re-applies the limited delta
      // to the start rectangle on every frame, so both sides must reference the same origin.
      // A start position already overlapping an obstacle only permits escape motions that
      // strictly shrink the overlap, matching the interaction pipeline's escape rule.
      sharedDeltaProgress: (e, i) => {
        if (!n.collisionEnabled || n.allowOverlap) return 1;
        const f = _();
        if (ge.value) {
          const p = bt(), z = rt(e), A = { x: i.left * f.x, y: i.top * f.y }, D = (G) => {
            let Z = 0;
            for (const K of p) Z += _t(G, K).overlapArea;
            return Z;
          }, k = D(z);
          if (k > 0)
            return Ee(k, D(ue(z, A))) ? 1 : 0;
          const B = Oe(z, A, p);
          return B ? mn(B.interval.entry) : 1;
        }
        const l = Y(e), m = {
          ...l,
          left: l.left + i.left,
          top: l.top + i.top
        }, g = he(l, m, Le());
        return g ? mn(g.entry) : 1;
      }
    };
    li(() => {
      X == null || X.registerMember(Et, To), typeof window < "u" && window.addEventListener("resize", N);
    });
    const xn = () => X ? n.snapTargets.filter((e) => !X.hasMember(e.id)) : n.snapTargets, Le = () => {
      const e = n.collisionTargets === void 0 ? n.snapTargets : n.collisionTargets;
      return X ? e.filter((i) => !X.hasMember(i.id)) : e;
    }, E = (e) => n.isKeepDecimals ? rn(e, 0, n.decimalPlaces) : Math.round(e), Fe = (e, i) => {
      if (!F.value) return E(e);
      const f = i === "horizontal" ? c.parentWidth : c.parentHeight;
      return f > 0 ? E(e / f * 100) : 0;
    }, yn = (e, i) => {
      const f = st(n.scale, 1), l = e / (f === 0 ? 1 : f);
      return Fe(l, i);
    }, vn = vi(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Nt = bi(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), ge = mt(() => n.collisionMode !== "aabb"), me = Vi(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), bn = Nt.guides;
    let oe = "clear", ie = "clear", re = "clear";
    const xe = /* @__PURE__ */ new Set(["left", "right", "center-x"]), ye = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), We = (e) => {
      const i = {
        horizontal: e.points.some((p) => xe.has(p)) ? e.targetIds.horizontal : void 0,
        vertical: e.points.some((p) => ye.has(p)) ? e.targetIds.vertical : void 0
      }, f = e.snapped ? ee(e.spacing ?? []) : [], l = e.snapped ? {
        snapped: !0,
        point: e.snapPoint,
        points: e.points,
        targetId: e.targetId,
        targetIds: i,
        spacing: f.length > 0 ? f : void 0
      } : { snapped: !1 }, m = JSON.stringify({
        payload: l,
        left: e.points.some((p) => xe.has(p)) ? e.left : void 0,
        top: e.points.some((p) => ye.has(p)) ? e.top : void 0
      });
      m !== oe && ((e.snapped || oe !== "clear") && a("snap", l), oe = e.snapped ? m : "clear");
      const g = JSON.stringify({ guides: e.guides, targetIds: i });
      g !== ie && ((e.snapped || ie !== "clear") && a("guides", ee(e.guides)), ie = e.snapped ? g : "clear");
    }, Mn = (e) => {
      const i = e.dominant, f = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId,
        normal: i.normal ? { ...i.normal } : void 0
      } : { colliding: !1 }, l = JSON.stringify(f);
      l !== re && ((i || re !== "clear") && a("collision", f), re = i ? l : "clear");
    }, ke = () => {
      oe !== "clear" && a("snap", { snapped: !1 }), ie !== "clear" && a("guides", { vertical: [], horizontal: [] }), re !== "clear" && a("collision", { colliding: !1 }), oe = "clear", ie = "clear", re = "clear", Nt.clearGuides(), me.clearCollisions();
    }, Ge = (e, i, f = "path") => {
      if (ge.value)
        return ne(e, i, f);
      const l = O(e), m = me.resolveCandidate(
        l,
        O(i),
        Le(),
        (g) => ({
          left: E(g.left),
          top: E(g.top),
          width: E(g.width),
          height: E(g.height)
        }),
        f
      );
      if (Mn(m), !m.accepted) return null;
      if (S.value) {
        if (f === "path" && m.progress !== void 0) {
          const g = Lt(m.progress, 0, 1), p = Y(i), z = Y(e);
          return {
            ...e,
            left: E(
              p.left + (z.left - p.left) * g
            ),
            top: E(p.top + (z.top - p.top) * g),
            width: E(
              p.width + (z.width - p.width) * g
            ),
            height: E(
              p.height + (z.height - p.height) * g
            )
          };
        }
        return {
          ...e,
          left: E(y(e.left) + (m.rect.left - l.left)),
          top: E(y(e.top) + (m.rect.top - l.top))
        };
      }
      return { ...e, ...m.rect };
    }, wn = (e, i, f, l, m) => {
      let g = r(e);
      l.horizontal && (g.left = vn.snapValue(y(e.left))), l.vertical && (g.top = vn.snapValue(y(e.top)));
      let p = {
        ...Y(g),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (f) {
        const A = O(g);
        p = Nt.resolveSnap(A, Ft(), l), S.value ? g = {
          ...g,
          left: E(y(g.left) + (p.left - A.left)),
          top: E(y(g.top) + (p.top - A.top))
        } : g = { ...g, left: p.left, top: p.top };
      } else
        Nt.clearGuides();
      if (m) {
        const A = y(m.left), D = y(m.top);
        n.dragDirections.includes("left") || (g.left = Math.max(A, y(g.left))), n.dragDirections.includes("right") || (g.left = Math.min(A, y(g.left))), n.dragDirections.includes("top") || (g.top = Math.max(D, y(g.top))), n.dragDirections.includes("bottom") || (g.top = Math.min(D, y(g.top)));
      }
      He(g), g = Be(g);
      const z = Ge(g, i, "slide");
      if (!z)
        return We({
          ...p,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Nt.clearGuides(), null;
      if (g = z, p.snapped) {
        const A = O(g), D = E(A.left) !== E(p.left), k = E(A.top) !== E(p.top), B = p.points.filter((w) => xe.has(w) ? !D : ye.has(w) ? !k : !1), G = B.some((w) => xe.has(w)), Z = B.some((w) => ye.has(w)), K = p.spacing.filter(
          (w) => w.axis === "horizontal" ? !D : !k
        ), V = {
          vertical: K.flatMap((w) => w.axis === "horizontal" ? w.guides : []),
          horizontal: K.flatMap((w) => w.axis === "vertical" ? w.guides : [])
        };
        p = {
          ...p,
          left: y(g.left),
          top: y(g.top),
          snapped: B.length > 0 || K.length > 0,
          snapPoint: B[0],
          points: B,
          targetId: G ? p.targetIds.horizontal : Z ? p.targetIds.vertical : void 0,
          targetIds: {
            horizontal: G ? p.targetIds.horizontal : void 0,
            vertical: Z ? p.targetIds.vertical : void 0
          },
          guides: {
            vertical: G ? p.guides.vertical : V.vertical,
            horizontal: Z ? p.guides.horizontal : V.horizontal
          },
          spacing: K
        }, p.snapped ? Nt.setGuides(p.guides) : Nt.clearGuides();
      }
      return We(p), g;
    }, $e = (e) => n.resizeDirections.includes(e), In = (e, i, f) => {
      if (n.resizeMode !== "fixed-anchor") {
        const B = Pi(f.x, f.y, S.value), G = {
          x: Fe(B.x, "horizontal"),
          y: Fe(B.y, "vertical")
        };
        return Po(e, i, G.x, G.y);
      }
      const l = _(), m = y(e.width), g = y(e.height), p = Math.max(0, st(n.minWidth, 0)), z = Math.max(0, st(n.minHeight, 0)), A = st(n.maxWidth, 1 / 0), D = st(n.maxHeight, 1 / 0), k = qi({
        start: {
          left: y(e.left) * l.x,
          top: y(e.top) * l.y,
          width: m * l.x,
          height: g * l.y
        },
        angle: S.value,
        originSpec: n.transformOrigin,
        handle: i,
        pointerDelta: f,
        minWidth: p * l.x,
        minHeight: z * l.y,
        maxWidth: A > 0 ? A * l.x : 1 / 0,
        maxHeight: D > 0 ? D * l.y : 1 / 0,
        ratio: n.ratioLock && m > 0 && g > 0 ? m * l.x / (g * l.y) : null
      });
      return {
        ...e,
        left: E(k.left / l.x),
        top: E(k.top / l.y),
        width: E(k.width / l.x),
        height: E(k.height / l.y)
      };
    }, Rn = (e, i, f) => {
      const l = _(), m = S.value, g = {
        left: y(e.left) * l.x,
        top: y(e.top) * l.y,
        width: y(e.width) * l.x,
        height: y(e.height) * l.y
      }, p = ln(
        g,
        m,
        n.transformOrigin,
        un(f, g.width, g.height)
      ), z = cn(
        {
          left: y(i.left) * l.x,
          top: y(i.top) * l.y,
          width: y(i.width) * l.x,
          height: y(i.height) * l.y
        },
        m,
        n.transformOrigin,
        f,
        p
      ), A = {
        ...i,
        left: E(z.left / l.x),
        top: E(z.top / l.y)
      };
      if (!n.limitAreaForParent || !c.parentElement) return A;
      const D = $(), k = (at) => {
        const tt = O(at), ct = 1e-7;
        return tt.left >= D.minLeft - ct && tt.left + tt.width <= D.maxRight + ct && tt.top >= D.minTop - ct && tt.top + tt.height <= D.maxBottom + ct;
      };
      if (k(A)) return A;
      const B = y(i.width), G = y(i.height), Z = Math.max(0, st(n.minWidth, 0)), K = Math.max(0, st(n.minHeight, 0)), V = Math.min(B, Z), w = Math.min(G, K), ot = I[f], Tt = ot.left || ot.right, Mt = ot.top || ot.bottom, ht = n.ratioLock || Tt && Mt, Ht = ht ? Math.min(
        1,
        Math.max(
          B > 0 ? V / B : 0,
          G > 0 ? w / G : 0
        )
      ) : 0, $t = ht ? B * Ht : Tt ? V : B, yt = ht ? G * Ht : Mt ? w : G, dt = (at) => {
        const tt = n.isKeepDecimals ? E : Math.floor, ct = Math.max(
          V,
          tt($t + (B - $t) * at)
        ), Zt = Math.max(
          w,
          tt(yt + (G - yt) * at)
        ), se = cn(
          {
            left: 0,
            top: 0,
            width: ct * l.x,
            height: Zt * l.y
          },
          m,
          n.transformOrigin,
          f,
          p
        );
        return {
          ...i,
          left: E(se.left / l.x),
          top: E(se.top / l.y),
          width: ct,
          height: Zt
        };
      }, Kt = dt(0);
      if (!k(Kt)) return i;
      let Pt = 0, wt = 1;
      for (let at = 0; at < 40; at += 1) {
        const tt = (Pt + wt) / 2;
        k(dt(tt)) ? Pt = tt : wt = tt;
      }
      return dt(Pt);
    }, Po = (e, i, f, l) => {
      const m = I[i], g = y(e.left), p = y(e.top), z = y(e.width), A = y(e.height);
      let D = g, k = g + z, B = p, G = p + A;
      m.left && (D += f), m.right && (k += f), m.top && (B += l), m.bottom && (G += l);
      const Z = (D + k) / 2, K = (B + G) / 2;
      let V = Math.max(0, k - D), w = Math.max(0, G - B);
      const ot = z > 0 && A > 0 ? z / A : 1, Tt = (ct) => {
        V = ct, m.left ? D = k - V : m.right ? k = D + V : (D = Z - V / 2, k = Z + V / 2);
      }, Mt = (ct) => {
        w = ct, m.top ? B = G - w : m.bottom ? G = B + w : (B = K - w / 2, G = K + w / 2);
      };
      if (n.ratioLock) {
        const ct = Math.abs(V - z), Zt = Math.abs(w - A) * ot;
        i === "tm" || i === "bm" || Zt > ct ? Tt(w * ot) : Mt(V / ot);
      }
      const ht = $(), Ht = n.limitAreaForParent && !!c.parentElement && S.value === 0, $t = Ht ? m.left ? Math.max(0, k - ht.minLeft) : m.right ? Math.max(0, ht.maxRight - D) : Math.max(
        0,
        2 * Math.min(Z - ht.minLeft, ht.maxRight - Z)
      ) : 1 / 0, yt = Ht ? m.top ? Math.max(0, G - ht.minTop) : m.bottom ? Math.max(0, ht.maxBottom - B) : Math.max(
        0,
        2 * Math.min(K - ht.minTop, ht.maxBottom - K)
      ) : 1 / 0, dt = Math.max(0, st(n.minWidth, 0)), Kt = Math.max(0, st(n.minHeight, 0)), Pt = st(n.maxWidth, 1 / 0), wt = st(n.maxHeight, 1 / 0);
      let at = Math.min(Pt > 0 ? Pt : 1 / 0, $t), tt = Math.min(wt > 0 ? wt : 1 / 0, yt);
      if (n.ratioLock) {
        at = Math.min(at, tt * ot);
        const ct = Math.max(dt, Kt * ot);
        Tt(Lt(V, ct, at)), Mt(V / ot);
      } else
        Tt(Lt(V, Math.min(dt, at), at)), Mt(Lt(w, Math.min(Kt, tt), tt));
      return {
        ...e,
        left: E(D),
        top: E(B),
        width: E(k - D),
        height: E(G - B)
      };
    };
    let St = null, kt = null;
    const zn = (e, i, f) => Math.atan2(e.clientY - f, e.clientX - i) * 180 / Math.PI + 90, An = (e) => {
      if (n.disabled || n.initRect || !c.isInteracting) return;
      if (c.isRotating) {
        const m = zn(
          e,
          c.rotationOriginX,
          c.rotationOriginY
        ), g = U(m - c.rotationStartPointerAngle), p = lo(
          c.beforeRotation + g,
          n.rotationSnapAngles ?? [],
          n.rotationSnapThreshold
        );
        b(pn(c.beforeRotation, p));
        return;
      }
      const i = yn(e.clientX - c.initX, "horizontal"), f = yn(e.clientY - c.initY, "vertical"), l = r(h.value);
      if (c.isDragging) {
        const m = c.beforeInteraction;
        let g = y(m.left) + i, p = y(m.top) + f;
        const z = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: f < 0 && n.dragDirections.includes("top") || f > 0 && n.dragDirections.includes("bottom")
        };
        z.horizontal || (g = y(m.left)), z.vertical || (p = y(m.top));
        const A = {
          ...m,
          left: E(g),
          top: E(p)
        };
        let D = wn(A, l, n.snapToElements, z, m);
        if (D && Ct && (D = (X == null ? void 0 : X.constrainPosition(Et, D)) ?? null), D) {
          const k = M(D);
          a("move", r(k)), a("drag", r(k)), Ct && (X == null || X.notifyMoved(Et, r(k)));
        }
      }
      if (c.isResizing && c.handle) {
        We({
          ...Y(l),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Nt.clearGuides();
        const m = st(n.scale, 1), g = m === 0 ? 1 : m, p = {
          x: (e.clientX - c.initX) / g,
          y: (e.clientY - c.initY) / g
        };
        let z = In(c.beforeInteraction, c.handle, p);
        (S.value || n.resizeMode === "fixed-anchor") && (z = gn(z, c.handle), z = Be(z), n.resizeMode === "fixed-anchor" && (z = Rn(c.beforeInteraction, z, c.handle))), He(z);
        const A = Ge(z, l);
        if (A) {
          const D = M(A);
          a("resize", r(D));
        }
      }
    }, Do = (e) => {
      !c.active || n.disabled || n.initRect || (kt = e, St === null && (St = requestAnimationFrame(() => {
        St = null;
        const i = kt;
        kt = null, i && An(i);
      })));
    }, ve = (e) => c.pointerId === null || e.pointerId === c.pointerId, Sn = (e) => {
      ve(e) && Do(e);
    }, Tn = (e) => {
      ve(e) && Lo(e);
    }, Pn = (e) => {
      ve(e) && ae(e);
    }, Dn = (e) => {
      ve(e) && c.isInteracting && ae(e);
    }, On = (e) => {
      e.key === "Escape" && c.isInteracting && (e.preventDefault(), e.stopPropagation(), ae(e));
    }, En = () => {
      const e = c.eventElement;
      if (!e) return;
      const i = { passive: !1 };
      ce(e, "pointermove", Sn, i), ce(e, "pointerup", Tn, i), ce(e, "pointercancel", Pn, i), ce(e, "keydown", On, !0);
      const f = u.value;
      f && ce(f, "lostpointercapture", Dn, i);
    }, Oo = () => {
      const e = c.eventElement;
      if (!e) return;
      fe(e, "pointermove", Sn, !1), fe(e, "pointerup", Tn, !1), fe(e, "pointercancel", Pn, !1), fe(e, "keydown", On, !0);
      const i = u.value;
      i && fe(i, "lostpointercapture", Dn, !1), c.eventElement = null;
    }, Cn = () => {
      const e = u.value;
      if (!(!e || c.pointerId === null))
        try {
          e.setPointerCapture(c.pointerId);
        } catch {
        }
    }, Eo = () => {
      const e = u.value, i = c.pointerId;
      if (c.pointerId = null, !(!e || i === null))
        try {
          e.hasPointerCapture(i) && e.releasePointerCapture(i);
        } catch {
        }
    };
    function Ke() {
      St !== null && (cancelAnimationFrame(St), St = null), kt = null;
    }
    function Ve() {
      c.interactionMode = "idle", c.handle = null, Ct = !1, Oo(), Eo();
    }
    function Nn() {
      ke(), n.active || P(!1);
    }
    function Hn() {
      Ve(), Nn();
    }
    function be() {
      Ke(), Ct && (X == null || X.abortDrag(Et)), Hn();
    }
    function ae(e = null) {
      const i = c.isDragging, f = c.isResizing, l = c.isRotating, m = Ct;
      if (Ke(), Ve(), i || f) {
        const g = r(c.beforeInteraction);
        M(g), a(i ? "drag-cancel" : "resize-cancel", e, g, r(g)), i && m && (X == null || X.cancelDrag(Et, e));
      }
      l && (R.value = c.beforeRotation, a("update:rotate", c.beforeRotation), a("rotate-cancel", e, c.beforeRotation, c.beforeRotation)), Nn();
    }
    function Bn() {
      be(), P(!1);
    }
    const Co = (e, i) => {
      var l, m;
      if (n.disabled || n.initRect || c.isInteracting || i && (!L.value || !$e(i)) || !i && !n.draggable) return;
      const f = r(h.value);
      if (i) {
        if (((l = n.canResize) == null ? void 0 : l.call(n, f, i)) === !1) return;
      } else if (((m = n.canDrag) == null ? void 0 : m.call(n, f)) === !1)
        return;
      if (Ct = !1, !i && X) {
        const g = X.beginDrag(Et, e);
        if (g === "blocked") return;
        Ct = g === "group";
      }
      N(), c.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, c.initX = e.clientX, c.initY = e.clientY, c.beforeInteraction = r(h.value), c.handle = i, c.interactionMode = i ? "resize" : "drag", P(!0), c.isDragging && a("drag-start", e, r(c.beforeInteraction)), c.isResizing && a("resize-start", e, r(c.beforeInteraction)), c.eventElement = document.documentElement, En(), Cn();
    }, No = () => {
      const e = u.value;
      if (!e) return null;
      const i = e.getBoundingClientRect(), f = e.offsetWidth || y(h.value.width), l = e.offsetHeight || y(h.value.height);
      if (!f || !l) return null;
      const m = At(S.value), g = Math.cos(m), p = Math.sin(m), z = Math.abs(g) * f + Math.abs(p) * l, A = Math.abs(p) * f + Math.abs(g) * l, D = [
        z ? i.width / z : 0,
        A ? i.height / A : 0
      ].filter((w) => Number.isFinite(w) && w > 0), k = Math.abs(st(n.scale, 1)) || 1, B = D.length ? D.reduce((w, ot) => w + ot, 0) / D.length : k, G = qt(n.transformOrigin, f, l), Z = G.x * B, K = G.y * B, V = [
        [-Z, -K],
        [f * B - Z, -K],
        [f * B - Z, l * B - K],
        [-Z, l * B - K]
      ].map(([w, ot]) => ({
        x: w * g - ot * p,
        y: w * p + ot * g
      }));
      return {
        x: i.left - Math.min(...V.map((w) => w.x)),
        y: i.top - Math.min(...V.map((w) => w.y))
      };
    }, Ho = (e) => {
      var f;
      if (!e.isPrimary || e.button !== 0 || n.disabled || n.initRect || !n.rotatable || c.isInteracting || ((f = n.canRotate) == null ? void 0 : f.call(n, r(h.value))) === !1) return;
      N();
      const i = No();
      i && (c.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, c.beforeRotation = R.value, c.rotationOriginX = i.x, c.rotationOriginY = i.y, c.rotationStartPointerAngle = zn(e, i.x, i.y), c.interactionMode = "rotate", P(!0), a("rotate-start", e, c.beforeRotation), c.eventElement = document.documentElement, En(), Cn());
    }, Bo = (e) => {
      if (!(e instanceof Element)) return !0;
      const i = u.value;
      if (!i) return !0;
      const f = (l) => {
        try {
          const m = e.closest(l);
          return {
            valid: !0,
            matched: m instanceof Element && i.contains(m)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (n.dragCancel) {
        const l = f(n.dragCancel);
        if (!l.valid || l.matched) return !1;
      }
      if (n.dragHandle) {
        const l = f(n.dragHandle);
        return l.valid && l.matched;
      }
      return !0;
    }, Ln = (e, i) => {
      !e.isPrimary || e.button !== 0 || !i && !Bo(e.target) || Co(e, i);
    };
    function Lo(e) {
      St !== null && (cancelAnimationFrame(St), St = null), kt && (An(kt), kt = null), c.isDragging && (a("drag-stop", e, r(c.beforeInteraction), r(h.value)), Ct && (X == null || X.endDrag(Et, e))), c.isResizing && a("resize-stop", e, r(c.beforeInteraction), r(h.value)), c.isRotating && a("rotate-stop", e, c.beforeRotation, R.value), Hn();
    }
    const Fo = (e, i) => {
      var g;
      N();
      const f = r(h.value);
      if (((g = n.canDrag) == null ? void 0 : g.call(n, r(f))) === !1) return;
      const l = r(f);
      e === "left" && (l.left = y(l.left) - i), e === "right" && (l.left = y(l.left) + i), e === "top" && (l.top = y(l.top) - i), e === "bottom" && (l.top = y(l.top) + i);
      const m = wn(
        l,
        f,
        n.snapToElements,
        {
          horizontal: e === "left" || e === "right",
          vertical: e === "top" || e === "bottom"
        },
        f
      );
      if (m) {
        const p = M(m);
        a("move", r(p));
      }
    }, Wo = (e, i, f) => {
      var B;
      if (!L.value || !$e(e)) return;
      N();
      const l = r(h.value);
      if (((B = n.canResize) == null ? void 0 : B.call(n, r(l), e)) === !1) return;
      const m = i === "left" ? -f : i === "right" ? f : 0, g = i === "top" ? -f : i === "bottom" ? f : 0, p = { x: Ye(m), y: Xe(g) }, z = (() => {
        if (d.value !== e || S.value === 0) return p;
        const G = At(S.value), Z = Math.cos(G), K = Math.sin(G);
        return {
          x: p.x * Z - p.y * K,
          y: p.x * K + p.y * Z
        };
      })();
      let A = In(l, e, z);
      (S.value || n.resizeMode === "fixed-anchor") && (A = gn(A, e), A = Be(A), n.resizeMode === "fixed-anchor" && (A = Rn(l, A, e))), He(A);
      const D = Ge(A, l);
      if (!D || Yi(D, l)) return;
      const k = M(D);
      a("resize", r(k));
    }, ko = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Go = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Gt = (e) => Go.has(e), $o = (e) => Gt(e) ? "group" : "separator", Ko = (e) => Gt(e) ? "two-axis resize handle" : void 0, Vo = (e) => `Resize ${ko[e]}`, Yo = (e) => {
      if (!Gt(e))
        return e === "ml" || e === "mr" ? "vertical" : "horizontal";
    }, Me = (e) => e === "ml" || e === "mr", Fn = (e) => {
      if (!Gt(e))
        return y(Me(e) ? h.value.width : h.value.height);
    }, Xo = (e) => {
      if (!Gt(e))
        return y(Me(e) ? n.minWidth : n.minHeight);
    }, Uo = (e) => {
      if (Gt(e)) return;
      const i = Me(e) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const f = y(i);
      return Number.isFinite(f) ? f : void 0;
    }, qo = (e) => {
      const i = Fn(e);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, _o = (e) => {
      if (n.keyboardEnabled)
        return Gt(e) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : Me(e) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, Zo = (e) => {
      e.target === u.value && n.keyboardEnabled && !n.disabled && !n.initRect && P(!0);
    }, Jo = [
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
    ].join(","), Qo = (e) => {
      const i = e.target, f = u.value;
      if (!(i instanceof Element) || !f || i === f || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return e.key !== "Escape";
      const l = i.closest(Jo);
      return l !== null && l !== f && f.contains(l);
    }, jo = gi(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: c.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: d.value,
        interacting: c.isInteracting
      }),
      {
        move: Fo,
        resize: Wo,
        deactivate: Bn,
        cancel: (e) => ae(e)
      }
    ), ti = (e) => {
      Qo(e) || jo.handleKeyDown(e);
    }, ei = (e) => {
      var p;
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(e.key) || ((p = n.canRotate) == null ? void 0 : p.call(n, r(h.value))) === !1) return;
      e.preventDefault(), e.stopPropagation(), N();
      const i = R.value, f = mo(n.keyboardStep) * (e.shiftKey ? 10 : 1), l = e.key === "Home" ? 0 : i + (e.key === "ArrowLeft" ? -f : f), m = e.key === "Home" ? l : lo(l, n.rotationSnapAngles ?? [], n.rotationSnapThreshold);
      a("rotate-start", e, i);
      const g = b(pn(i, m));
      a("rotate-stop", e, i, g);
    }, Ye = (e) => F.value ? e / 100 * c.parentWidth : e, Xe = (e) => F.value ? e / 100 * c.parentHeight : e, ni = mt(() => {
      const e = Ye(y(h.value.left)), i = Xe(y(h.value.top)), f = {
        left: `${-e}px`,
        top: `${-i}px`,
        width: `${c.parentWidth}px`,
        height: `${c.parentHeight}px`
      }, l = S.value;
      if (l) {
        const m = _(), g = qt(
          n.transformOrigin,
          y(h.value.width) * m.x,
          y(h.value.height) * m.y
        );
        f.transform = `rotate(${-l}deg)`, f.transformOrigin = `${g.x + e}px ${g.y + i}px`;
      }
      return f;
    }), oi = (e) => ({
      left: `${Ye(e)}px`,
      top: "0px",
      height: `${c.parentHeight}px`,
      borderColor: n.theme
    }), ii = (e) => ({
      top: `${Xe(e)}px`,
      left: "0px",
      width: `${c.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => r(h.value),
      setPosition: (e, i) => M({ ...h.value, left: e, top: i }),
      setSize: (e, i) => M({ ...h.value, width: e, height: i }),
      reset: () => M(r(v)),
      activate: () => P(!0),
      deactivate: Bn,
      cancelInteraction: (e = null) => ae(e)
    }), ci(() => {
      Ke(), Ve(), typeof window < "u" && window.removeEventListener("resize", N), X == null || X.unregisterMember(Et), ke();
    }), (e, i) => (Yt(), Xt("div", {
      ref_key: "movableRef",
      ref: u,
      class: Zn(["auto-draggable", {
        "select-none": t.disabledUserSelect,
        "is-disabled": t.disabled,
        "is-active": c.active,
        "is-dragging": c.isDragging,
        "is-resizing": c.isResizing,
        "is-rotating": c.isRotating,
        "is-readonly": t.initRect
      }]),
      style: Ut(j.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (f) => Ln(f, null)),
      onDblclick: i[2] || (i[2] = (f) => a("dblclick", f)),
      onFocus: Zo,
      onKeydown: ti
    }, [
      Re("div", {
        class: "movable-box-guides-layer",
        style: Ut(ni.value),
        "aria-hidden": "true"
      }, [
        (Yt(!0), Xt(qe, null, _e(Jn(bn).vertical, (f, l) => (Yt(), Xt("div", {
          key: `vertical-${l}`,
          class: "movable-box-guide movable-box-guide--vertical",
          style: Ut(oi(f))
        }, null, 4))), 128)),
        (Yt(!0), Xt(qe, null, _e(Jn(bn).horizontal, (f, l) => (Yt(), Xt("div", {
          key: `horizontal-${l}`,
          class: "movable-box-guide movable-box-guide--horizontal",
          style: Ut(ii(f))
        }, null, 4))), 128))
      ], 4),
      Ze(Re("div", {
        class: "rotation-handle-connector",
        style: Ut(x.value),
        "aria-hidden": "true"
      }, null, 4), [
        [Je, c.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      Ze(Re("div", {
        class: "rotation-handle",
        style: Ut(x.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": S.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${S.value} degrees`,
        "aria-keyshortcuts": t.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: Qn(Ho, ["stop", "prevent"]),
        onKeydown: ei
      }, [...i[3] || (i[3] = [
        Re("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, Zi), [
        [Je, c.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      (Yt(!0), Xt(qe, null, _e(t.handles, (f) => Ze((Yt(), Xt("div", {
        key: f,
        class: Zn(["handle", `handle-${f}`]),
        style: Ut(q.value),
        role: $o(f),
        "aria-roledescription": Ko(f),
        "aria-orientation": Yo(f),
        "aria-label": Vo(f),
        "aria-valuenow": Fn(f),
        "aria-valuemin": Xo(f),
        "aria-valuemax": Uo(f),
        "aria-valuetext": qo(f),
        "aria-keyshortcuts": _o(f),
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: Qn((l) => Ln(l, f), ["stop", "prevent"]),
        onFocus: (l) => d.value = f,
        onBlur: i[0] || (i[0] = (l) => d.value = null)
      }, null, 46, Ji)), [
        [Je, c.active && L.value && !t.disabled && $e(f)]
      ])), 128)),
      go(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), tr = (t, o) => {
  const s = t.__vccOpts || t;
  for (const [n, a] of o)
    s[n] = a;
  return s;
}, er = /* @__PURE__ */ tr(ji, [["__scopeId", "data-v-df3a86cb"]]), nr = Ne({
  name: "MovableGroup"
}), or = /* @__PURE__ */ Ne({
  ...nr,
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
  setup(t, { expose: o, emit: s }) {
    const n = t, a = s, r = /* @__PURE__ */ new Map(), u = Rt([]), h = Rt(null), R = mt(() => n.selected !== void 0), v = mt({
      get: () => R.value ? n.selected ?? [] : u.value,
      set: (x) => {
        u.value = x, a("update:selected", x);
      }
    });
    Ot(
      () => n.selected,
      (x) => {
        x !== void 0 && (u.value = [...x]);
      },
      { immediate: !0 }
    );
    const d = (x) => ee(x), I = (x, M, b) => ({
      ...x,
      left: y(x.left) + M,
      top: y(x.top) + b
    }), c = (x) => x.reduce(
      (M, b) => ({
        minLeft: Math.min(M.minLeft, b.left),
        minTop: Math.min(M.minTop, b.top),
        maxRight: Math.max(M.maxRight, b.left + b.width),
        maxBottom: Math.max(M.maxBottom, b.top + b.height)
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), L = (x, M, b) => {
      const P = c(x);
      return {
        left: Math.min(
          Math.max(M.left, b.minLeft - P.minLeft),
          b.maxRight - P.maxRight
        ),
        top: Math.min(
          Math.max(M.top, b.minTop - P.minTop),
          b.maxBottom - P.maxBottom
        )
      };
    }, F = (x) => {
      const M = [];
      for (const [b, P] of x) {
        const N = r.get(b);
        N && M.push({ id: b, rect: d(N.getRect()), startRect: d(P) });
      }
      return M;
    }, S = (x) => x.map(({ id: M, rect: b }) => ({ id: M, rect: b })), T = (x, M, b) => {
      if (n.groupCollision !== "all") return b;
      let P = 1;
      for (const N of x.startRects.keys()) {
        if (N === M) continue;
        const W = r.get(N);
        if (!W) continue;
        const C = W.sharedDeltaProgress(x.startRects.get(N), b);
        C < P && (P = C);
      }
      return { left: b.left * P, top: b.top * P };
    }, j = (x) => {
      const M = x.filter((P) => r.has(P)), b = v.value;
      b.length === M.length && b.every((P, N) => P === M[N]) || (v.value = M);
    };
    return fi(Ro, {
      registerMember: (x, M) => {
        r.set(x, M);
      },
      unregisterMember: (x) => {
        var M;
        if (r.delete(x), ((M = h.value) == null ? void 0 : M.leaderId) === x) {
          h.value = null;
          return;
        }
        h.value && (h.value.startRects.delete(x), h.value.startVisuals.delete(x)), v.value.includes(x) && j(v.value.filter((b) => b !== x));
      },
      hasMember: (x) => x !== void 0 && r.has(x),
      beginDrag: (x, M) => {
        if (h.value && h.value.leaderId !== x)
          return h.value.startRects.has(x) ? "blocked" : "solo";
        if (!r.has(x)) return "solo";
        const b = v.value.includes(x) ? [...v.value] : [x];
        v.value.includes(x) || j(b);
        const P = /* @__PURE__ */ new Map(), N = /* @__PURE__ */ new Map();
        for (const C of b) {
          const $ = r.get(C);
          $ && (P.set(C, d($.getRect())), N.set(C, { ...$.getVisualRect() }));
        }
        h.value = { leaderId: x, startRects: P, startVisuals: N };
        const W = [];
        for (const [C, $] of P) W.push({ id: C, rect: d($) });
        return a("move-start", { leaderId: x, source: M, rects: W }), "group";
      },
      constrainPosition: (x, M) => {
        var $, lt;
        const b = h.value, P = b == null ? void 0 : b.startRects.get(x);
        if (!b || b.leaderId !== x || !P || !r.has(x)) return M;
        const N = y(M.left) - y(P.left), W = y(M.top) - y(P.top), C = ($ = r.get(x)) == null ? void 0 : $.getAreaEdges();
        if (n.sharedBounds) {
          let Y = { left: N, top: W };
          C && (Y = L([...b.startVisuals.values()], Y, C)), Y = T(b, x, Y);
          for (const [_, O] of b.startRects)
            _ !== x && ((lt = r.get(_)) == null || lt.translateTo(I(O, Y.left, Y.top)));
          return I(P, Y.left, Y.top);
        }
        for (const [Y, _] of b.startRects) {
          if (Y === x) continue;
          const O = r.get(Y);
          if (!O) continue;
          const J = b.startVisuals.get(Y), rt = n.groupCollision === "all" ? O.sharedDeltaProgress(_, { left: N, top: W }) : 1, H = I(_, N * rt, W * rt), Q = O.getAreaEdges();
          if (Q && J) {
            const nt = J.left - y(_.left), ft = J.top - y(_.top), bt = Q.minLeft - nt, Ft = Math.max(bt, Q.maxRight - nt - J.width), ut = Q.minTop - ft, Wt = Math.max(ut, Q.maxBottom - ft - J.height);
            H.left = Lt(y(H.left), bt, Ft), H.top = Lt(y(H.top), ut, Wt);
          }
          O.translateTo(H);
        }
        return M;
      },
      notifyMoved: (x, M) => {
        const b = h.value;
        if (!b || b.leaderId !== x) return;
        const P = S(F(b.startRects)).map(
          (N) => N.id === x ? { id: x, rect: d(M) } : N
        );
        a("move", { leaderId: x, rects: P });
      },
      endDrag: (x, M) => {
        const b = h.value;
        if (!b || b.leaderId !== x) return;
        const P = F(b.startRects);
        h.value = null, a("move-stop", { leaderId: x, source: M, rects: P });
      },
      cancelDrag: (x, M) => {
        var N;
        const b = h.value;
        if (!b || b.leaderId !== x) return;
        for (const [W, C] of b.startRects)
          W !== x && ((N = r.get(W)) == null || N.translateTo(d(C)));
        const P = F(b.startRects);
        h.value = null, a("move-cancel", { leaderId: x, source: M, rects: P });
      },
      abortDrag: (x) => {
        var M;
        ((M = h.value) == null ? void 0 : M.leaderId) === x && (h.value = null);
      }
    }), o({
      getSelected: () => [...v.value],
      select: (x) => j(x ?? [...r.keys()]),
      getMemberRects: () => [...r.entries()].map(([x, M]) => ({ id: x, rect: d(M.getRect()) }))
    }), (x, M) => go(x.$slots, "default");
  }
}), zo = "VueMovableBox", ir = "3.5.0", rr = (t) => {
  t.component(zo, er), t.component("MovableGroup", or);
}, lr = {
  name: zo,
  version: ir,
  install: rr
};
export {
  er as MovableBox,
  or as MovableGroup,
  lr as default,
  rr as install,
  zo as name,
  ir as version
};
