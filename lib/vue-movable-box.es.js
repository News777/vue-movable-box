import { computed as ut, ref as yt, defineComponent as Ee, reactive as ni, watch as Rt, inject as oi, getCurrentInstance as ii, onMounted as ri, onUnmounted as ai, openBlock as Wt, createElementBlock as Gt, normalizeStyle as $t, normalizeClass as Xn, createElementVNode as Me, Fragment as Ue, renderList as _e, unref as Un, withDirectives as qe, vShow as Ze, withModifiers as _n, renderSlot as co, provide as si } from "vue";
import li from "decimal.js";
const ci = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, fi = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, ui = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, fo = (t) => Number.isFinite(t) && t > 0 ? t : 1;
function di(t, o) {
  return { handleKeyDown: (n) => {
    const s = t(), r = s.interacting;
    if (!r && (!s.enabled || s.disabled || !s.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), r ? o.cancel(n) : o.deactivate();
      return;
    }
    if (r || s.readOnly) return;
    const u = ci[n.key];
    if (!u) return;
    const h = fo(s.step);
    if (s.focusedHandle && s.resizeDirections.includes(s.focusedHandle)) {
      if (!fi[s.focusedHandle].includes(u)) return;
      n.preventDefault(), o.resize(
        s.focusedHandle,
        n.shiftKey ? ui[u] : u,
        h
      );
      return;
    }
    if (n.shiftKey) {
      const R = s.resizeDirections.includes("br") ? "br" : s.resizeDirections[0];
      if (!R) return;
      n.preventDefault(), o.resize(R, u, h);
      return;
    }
    s.dragDirections.includes(u) && (n.preventDefault(), o.move(u, h));
  } };
}
const we = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, qn = (t) => {
  const o = we(t.left), a = we(t.top), n = we(t.width), s = we(t.height);
  return o === null || a === null || n === null || s === null || n < 0 || s < 0 ? null : { left: o, top: a, width: n, height: s };
};
function hi(t, o) {
  const a = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(t / a) * a;
}
const Zn = (t, o, a) => o.distance > a ? t : !t || o.distance < t.distance ? o : t, pi = ["alignment", "spacing"], Jn = (t, o, a, n) => {
  for (const s of a) {
    if (s === "alignment") {
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
}, Qn = (t, o, a, n, s) => {
  const r = (d) => t === "horizontal" ? d.left : d.top, u = (d) => t === "horizontal" ? d.left + d.width : d.top + d.height, h = [], R = [];
  for (const d of s)
    u(d.rect) <= o && h.push(d), r(d.rect) >= o + a && R.push(d);
  let b = null;
  for (const d of h)
    for (const v of R) {
      const c = r(v.rect) - u(d.rect) - a;
      if (c < 0) continue;
      const B = c / 2, H = u(d.rect) + B, D = Math.abs(o - H);
      D > n || (!b || D < b.distance) && (b = {
        distance: D,
        value: H,
        gap: B,
        guides: [u(d.rect), r(v.rect)],
        targetIds: [d.id, v.id]
      });
    }
  return b;
};
function gi(t, o, a = 10, n = { horizontal: !0, vertical: !0 }, s = {}) {
  const r = Math.max(0, Number.isFinite(a) ? a : 10), u = t.left + t.width, h = t.top + t.height, R = t.left + t.width / 2, b = t.top + t.height / 2, d = s.priority && s.priority.length > 0 ? s.priority : pi, v = d.includes("alignment"), c = d.includes("spacing"), B = (O, J) => s.filter ? s.filter(O, J) !== !1 : !0, H = /* @__PURE__ */ new Map(), D = (O) => {
    let J = H.get(O);
    return J || (J = {
      horizontal: n.horizontal && B(O, "horizontal"),
      vertical: n.vertical && B(O, "vertical")
    }, H.set(O, J)), J;
  };
  let A = null;
  const G = () => {
    let O = null, J = null;
    for (const ot of o) {
      const N = qn(ot);
      if (!N) continue;
      const Q = D(ot);
      if (!Q.horizontal && !Q.vertical) continue;
      const et = N.left + N.width, at = N.top + N.height, pt = N.left + N.width / 2, Ct = N.top + N.height / 2, st = ot.id;
      if (Q.horizontal) {
        const Nt = [
          {
            distance: Math.abs(t.left - N.left),
            value: N.left,
            guide: N.left,
            point: "left",
            targetId: st
          },
          {
            distance: Math.abs(u - et),
            value: et - t.width,
            guide: et,
            point: "right",
            targetId: st
          },
          {
            distance: Math.abs(t.left - et),
            value: et,
            guide: et,
            point: "left",
            targetId: st
          },
          {
            distance: Math.abs(u - N.left),
            value: N.left - t.width,
            guide: N.left,
            point: "right",
            targetId: st
          },
          {
            distance: Math.abs(R - pt),
            value: pt - t.width / 2,
            guide: pt,
            point: "center-x",
            targetId: st
          }
        ];
        for (const Jt of Nt) O = Zn(O, Jt, r);
      }
      if (Q.vertical) {
        const Nt = [
          {
            distance: Math.abs(t.top - N.top),
            value: N.top,
            guide: N.top,
            point: "top",
            targetId: st
          },
          {
            distance: Math.abs(h - at),
            value: at - t.height,
            guide: at,
            point: "bottom",
            targetId: st
          },
          {
            distance: Math.abs(t.top - at),
            value: at,
            guide: at,
            point: "top",
            targetId: st
          },
          {
            distance: Math.abs(h - N.top),
            value: N.top - t.height,
            guide: N.top,
            point: "bottom",
            targetId: st
          },
          {
            distance: Math.abs(b - Ct),
            value: Ct - t.height / 2,
            guide: Ct,
            point: "center-y",
            targetId: st
          }
        ];
        for (const Jt of Nt) J = Zn(J, Jt, r);
      }
    }
    return { x: O, y: J };
  }, V = (O) => v ? (A || (A = G()), O === "horizontal" ? A.x : A.y) : null, x = [], w = [];
  let M = !1;
  const P = () => {
    for (const O of o) {
      const J = qn(O);
      if (!J) continue;
      const ot = D(O);
      ot.horizontal && x.push({ rect: J, id: O.id }), ot.vertical && w.push({ rect: J, id: O.id });
    }
    M = !0;
  }, C = (O) => c ? (M || P(), O === "horizontal" ? Qn(
    "horizontal",
    t.left,
    t.width,
    r,
    x
  ) : Qn("vertical", t.top, t.height, r, w)) : null, k = n.horizontal ? Jn("horizontal", r, d, {
    alignment: () => V("horizontal"),
    spacing: () => C("horizontal")
  }) : null, L = n.vertical ? Jn("vertical", r, d, {
    alignment: () => V("vertical"),
    spacing: () => C("vertical")
  }) : null, $ = (k == null ? void 0 : k.candidate) ?? null, it = (L == null ? void 0 : L.candidate) ?? null, K = [$ == null ? void 0 : $.point, it == null ? void 0 : it.point].filter(
    (O) => !!O
  ), q = [k == null ? void 0 : k.spacingInfo, L == null ? void 0 : L.spacingInfo].filter(
    (O) => !!O
  );
  return {
    left: (k == null ? void 0 : k.value) ?? t.left,
    top: (L == null ? void 0 : L.value) ?? t.top,
    snapped: K.length > 0 || q.length > 0,
    snapPoint: K[0],
    points: K,
    targetId: ($ == null ? void 0 : $.targetId) ?? (it == null ? void 0 : it.targetId),
    targetIds: { horizontal: $ == null ? void 0 : $.targetId, vertical: it == null ? void 0 : it.targetId },
    guides: {
      vertical: (k == null ? void 0 : k.guides) ?? [],
      horizontal: (L == null ? void 0 : L.guides) ?? []
    },
    spacing: q
  };
}
function mi(t) {
  const o = (s) => {
    const r = t();
    return r.snapToGrid ? hi(s, r.gridSize) : s;
  }, a = (s, r) => ({
    left: o(s),
    top: o(r)
  }), n = ut(() => {
    const s = t();
    return s.snapToGrid ? {
      size: Number.isFinite(s.gridSize) && s.gridSize > 0 ? s.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: a, gridInfo: n };
}
const Je = () => ({ vertical: [], horizontal: [] });
function xi(t) {
  const o = yt(Je()), a = yt(null);
  return { guides: o, lastSnapResult: a, resolveSnap: (u, h, R) => {
    const b = t(), d = b.enabled ? gi(u, h, b.threshold, R, {
      filter: b.filter,
      priority: b.priority
    }) : {
      ...u,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Je(),
      spacing: []
    };
    return o.value = d.guides, a.value = d.snapped ? d : null, d;
  }, clearGuides: () => {
    o.value = Je(), a.value = null;
  }, setGuides: (u) => {
    o.value = u;
  } };
}
const Ie = (t) => {
  if (typeof t == "string" && t.trim() === "") return null;
  const o = Number(t);
  return Number.isFinite(o) ? o : null;
}, uo = (t) => {
  const o = Ie(t.left), a = Ie(t.top), n = Ie(t.width), s = Ie(t.height);
  return o === null || a === null || n === null || s === null || n < 0 || s < 0 ? null : { left: o, top: a, width: n, height: s };
}, jn = (t, o, a, n) => {
  const s = a - o;
  if (s === 0) return o < n ? t : null;
  const r = (n - o) / s;
  return s > 0 ? { ...t, exit: Math.min(t.exit, r) } : { ...t, entry: Math.max(t.entry, r) };
}, to = (t, o, a, n) => {
  const s = a - o;
  if (s === 0) return o > n ? t : null;
  const r = (n - o) / s;
  return s > 0 ? { ...t, entry: Math.max(t.entry, r) } : { ...t, exit: Math.min(t.exit, r) };
}, yi = (t, o, a) => {
  let n = { entry: 0, exit: 1 };
  if (n = jn(n, t.left, o.left, a.left + a.width), !n || (n = to(
    n,
    t.left + t.width,
    o.left + o.width,
    a.left
  ), !n) || (n = jn(n, t.top, o.top, a.top + a.height), !n) || (n = to(
    n,
    t.top + t.height,
    o.top + o.height,
    a.top
  ), !n)) return null;
  const s = Math.max(0, n.entry), r = Math.min(1, n.exit);
  return s < r && r > 0 && s < 1 ? { entry: s, exit: r } : null;
};
function ce(t, o, a) {
  let n = null;
  for (const s of a) {
    const r = uo(s);
    if (!r) continue;
    const u = yi(t, o, r);
    u && (!n || u.entry < n.entry) && (n = u);
  }
  return n;
}
function vi(t, o) {
  const a = Math.min(t.left + t.width, o.left + o.width) - Math.max(t.left, o.left), n = Math.min(t.top + t.height, o.top + o.height) - Math.max(t.top, o.top);
  if (a <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const s = t.left + t.width / 2, r = t.top + t.height / 2, u = o.left + o.width / 2, h = o.top + o.height / 2, R = s - u, b = r - h;
  return {
    colliding: !0,
    direction: a <= n ? R > 0 ? "right" : "left" : b > 0 ? "bottom" : "top",
    overlap: Math.min(a, n),
    overlapArea: a * n
  };
}
function Qe(t, o, a) {
  const n = [];
  for (const s of o) {
    const r = uo(s);
    if (!r) continue;
    const u = vi(t, r);
    u.colliding && n.push({ ...u, targetId: s.id });
  }
  return n;
}
function bi(t) {
  let o = null;
  for (const a of t)
    (!o || (a.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = a);
  return o;
}
const ho = (t) => t.reduce((o, a) => o + (a.overlapArea ?? 0), 0), Z = (t) => {
  const o = typeof t == "number" ? t : Number(t ?? 0);
  if (!Number.isFinite(o)) return 0;
  const a = (o % 360 + 360) % 360;
  return a > 180 ? a - 360 : a;
}, zt = (t) => t * Math.PI / 180, vt = (t) => Math.round(t * 1e9) / 1e9, Mi = (t, o) => {
  const a = Z(o);
  if (a === 0) return { ...t };
  const n = zt(a), s = Math.cos(n), r = Math.sin(n), u = Math.abs(t.width * s) + Math.abs(t.height * r), h = Math.abs(t.width * r) + Math.abs(t.height * s);
  return {
    left: vt(t.left + (t.width - u) / 2),
    top: vt(t.top + (t.height - h) / 2),
    width: vt(u),
    height: vt(h)
  };
}, wi = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), po = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, go = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, eo = /* @__PURE__ */ new Set(["left", "right"]), je = /* @__PURE__ */ new Set(["top", "bottom"]), tn = (t) => po.test(t) || go.test(t), Ii = (t, o) => tn(t) || eo.has(t) ? tn(o) || o === "center" || je.has(o) : je.has(t) ? o === "center" || eo.has(o) : t === "center", mo = (t) => {
  if (!t) return "center";
  const o = t.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => wi.has(n) || po.test(n) || go.test(n)
  ) || o.length === 2 && !Ii(o[0], o[1]) ? "center" : o.join(" ");
}, Vt = (t, o, a) => {
  const n = { x: o / 2, y: a / 2 }, r = mo(t).split(" ");
  let u = null, h = null;
  const R = (b) => {
    u === null ? u = b : h === null && (h = b);
  };
  for (const b of r)
    if (b === "left") u = 0;
    else if (b === "right") u = o;
    else if (b === "top") h = 0;
    else if (b === "bottom") h = a;
    else if (b === "center") R(u === null ? o / 2 : a / 2);
    else if (b.endsWith("%")) {
      const d = Number(b.slice(0, -1));
      if (!Number.isFinite(d)) return n;
      R(d / 100 * (u === null ? o : a));
    } else {
      const d = Number.parseFloat(b);
      if (!Number.isFinite(d)) return n;
      R(d);
    }
  return { x: u ?? o / 2, y: h ?? a / 2 };
}, Ri = (t, o, a) => {
  const n = Mi(t, o), s = Z(o);
  if (s === 0) return n;
  const r = zt(s), u = Math.cos(r), h = Math.sin(r), R = t.width / 2 - a.x, b = t.height / 2 - a.y, d = vt(R * u - b * h - R), v = vt(R * h + b * u - b);
  return {
    left: vt(n.left + d),
    top: vt(n.top + v),
    width: n.width,
    height: n.height
  };
}, zi = (t, o, a) => {
  const n = Z(a);
  if (n === 0) return { x: t, y: o };
  const s = zt(n), r = Math.cos(s), u = Math.sin(s);
  return {
    x: vt(t * r + o * u),
    y: vt(-t * u + o * r)
  };
}, no = (t) => (t % 360 + 540) % 360 - 180, oo = (t, o, a) => {
  if (o.length === 0 || !Number.isFinite(a)) return t;
  const n = Z(t);
  let s = null, r = 1 / 0;
  for (const u of o) {
    if (!Number.isFinite(u)) continue;
    const h = Math.abs(no(Z(u) - n));
    h < r && (r = h, s = t + no(Z(u) - n));
  }
  return s === null || r > a ? t : Ai(s);
}, Ai = (t) => Math.abs(t) < 1e-9 ? 0 : t, dt = 1e-7, Te = (t) => Math.round(t * 1e9) / 1e9, Si = (t) => ({ x: Te(t.x), y: Te(t.y) }), fe = (t) => {
  const o = Z(t.angle), a = zt(o), n = Math.cos(a), s = Math.sin(a), r = t.origin.x, u = t.origin.y;
  return [
    { x: 0, y: 0 },
    { x: t.width, y: 0 },
    { x: t.width, y: t.height },
    { x: 0, y: t.height }
  ].map((R) => {
    const b = R.x - r, d = R.y - u;
    return Si({
      x: t.left + r + b * n - d * s,
      y: t.top + u + b * s + d * n
    });
  });
}, Pe = (t) => {
  if (Z(t.angle) === 0)
    return { left: t.left, top: t.top, width: t.width, height: t.height };
  const o = fe(t), a = o.map((u) => u.x), n = o.map((u) => u.y), s = Math.min(...a), r = Math.min(...n);
  return {
    left: s,
    top: r,
    width: Te(Math.max(...a) - s),
    height: Te(Math.max(...n) - r)
  };
}, io = /* @__PURE__ */ new WeakMap(), Ti = (t) => {
  let o = io.get(t);
  return o || (o = Pe(t), io.set(t, o)), o;
}, on = (t, o) => t.x * o.y - t.y * o.x, ro = (t, o) => {
  let a = 1 / 0, n = -1 / 0;
  for (const s of t) {
    const r = s.x * o.x + s.y * o.y;
    r < a && (a = r), r > n && (n = r);
  }
  return { min: a, max: n };
}, ao = (t) => {
  const o = [];
  for (let a = 0; a < t.length; a += 1) {
    const n = t[(a + 1) % t.length], s = n.x - t[a].x, r = n.y - t[a].y, u = Math.hypot(s, r);
    u < dt || o.push({ x: -r / u, y: s / u });
  }
  return o;
}, so = (t) => ({
  x: t.reduce((o, a) => o + a.x, 0) / t.length,
  y: t.reduce((o, a) => o + a.y, 0) / t.length
}), Pi = (t, o) => {
  let a = t;
  for (let n = 0; n < o.length && a.length > 0; n += 1) {
    const s = o[n], r = o[(n + 1) % o.length], u = { x: r.x - s.x, y: r.y - s.y }, h = (v) => on(u, { x: v.x - s.x, y: v.y - s.y }), R = a;
    a = [];
    let b = R[R.length - 1], d = h(b);
    for (const v of R) {
      const c = h(v);
      if (c >= 0) {
        if (d < 0) {
          const B = d / (d - c);
          a.push({
            x: b.x + (v.x - b.x) * B,
            y: b.y + (v.y - b.y) * B
          });
        }
        a.push(v);
      } else if (d >= 0) {
        const B = d / (d - c);
        a.push({
          x: b.x + (v.x - b.x) * B,
          y: b.y + (v.y - b.y) * B
        });
      }
      b = v, d = c;
    }
  }
  return a;
}, Di = (t) => {
  if (t.length < 3) return 0;
  let o = 0;
  for (let a = 0; a < t.length; a += 1) {
    const n = t[(a + 1) % t.length];
    o += t[a].x * n.y - n.x * t[a].y;
  }
  return Math.abs(o) / 2;
}, Kt = (t, o) => {
  const a = fe(t), n = fe(o);
  let s = 1 / 0, r = null;
  const u = so(a), h = so(n), R = [...ao(n), ...ao(a)];
  for (const d of R) {
    const v = ro(a, d), c = ro(n, d), B = Math.min(v.max, c.max) - Math.max(v.min, c.min);
    if (B <= dt)
      return { overlapping: !1, depth: 0, normal: null, overlapArea: 0 };
    const H = B < s - dt, D = !H && B <= s + dt && (r === null || Math.abs(d.x) > Math.abs(r.x));
    if (H || D) {
      s = Math.min(s, B);
      const A = (u.x - h.x) * d.x + (u.y - h.y) * d.y >= 0 ? 1 : -1;
      r = { x: d.x * A, y: d.y * A };
    }
  }
  const b = Pi(a, n);
  return {
    overlapping: !0,
    depth: s,
    normal: r ?? { x: 0, y: 0 },
    overlapArea: Di(b)
  };
}, Oi = (t) => {
  const o = Array.from(
    new Map(t.map((r) => [`${r.x},${r.y}`, r])).values()
  ).sort((r, u) => r.x === u.x ? r.y - u.y : r.x - u.x);
  if (o.length <= 2) return o;
  const a = (r, u, h) => (u.x - r.x) * (h.y - r.y) - (u.y - r.y) * (h.x - r.x), n = [];
  for (const r of o) {
    for (; n.length >= 2 && a(n[n.length - 2], n[n.length - 1], r) <= 0; )
      n.pop();
    n.push(r);
  }
  const s = [];
  for (let r = o.length - 1; r >= 0; r -= 1) {
    const u = o[r];
    for (; s.length >= 2 && a(s[s.length - 2], s[s.length - 1], u) <= 0; )
      s.pop();
    s.push(u);
  }
  return n.pop(), s.pop(), [...n, ...s];
}, Ei = (t, o) => {
  const a = fe(t), n = fe(o), s = [];
  for (const r of n)
    for (const u of a)
      s.push({ x: r.x - u.x, y: r.y - u.y });
  return Oi(s);
}, Ci = (t, o) => {
  if (o.length < 3) return null;
  let a = 0, n = 1;
  for (let s = 0; s < o.length; s += 1) {
    const r = o[s], u = o[(s + 1) % o.length], h = { x: u.x - r.x, y: u.y - r.y }, R = on(h, t), b = on(h, r);
    if (Math.abs(R) < dt) {
      if (b > -dt) return null;
      continue;
    }
    const d = b / R;
    R > 0 ? a = Math.max(a, d) : n = Math.min(n, d);
  }
  return a < n - dt && n > dt && a < 1 - dt ? { entry: a, exit: n } : null;
}, De = (t, o, a) => {
  if (o.x === 0 && o.y === 0) return null;
  let n = null;
  const s = Pe(t);
  for (const r of a) {
    if (r.width <= 0 || r.height <= 0) continue;
    const u = Ti(r), h = Math.min(
      s.left + s.width + Math.max(o.x, 0),
      u.left + u.width
    ) - Math.max(s.left + Math.min(o.x, 0), u.left), R = Math.min(
      s.top + s.height + Math.max(o.y, 0),
      u.top + u.height
    ) - Math.max(s.top + Math.min(o.y, 0), u.top);
    if (h <= dt || R <= dt) continue;
    const b = Ei(t, r), d = Ci(o, b);
    d && (!n || d.entry < n.interval.entry) && (n = { interval: d, target: r, targetId: r.id });
  }
  return n;
}, Re = (t, o) => ({
  ...t,
  left: t.left + o.x,
  top: t.top + o.y
}), Ni = (t, o) => ({
  ...t,
  left: t.left + o.x,
  top: t.top + o.y
}), rn = (t, o, a) => ({
  left: t.left + (o.left - t.left) * a,
  top: t.top + (o.top - t.top) * a,
  width: t.width + (o.width - t.width) * a,
  height: t.height + (o.height - t.height) * a,
  angle: t.angle + (o.angle - t.angle) * a,
  origin: {
    x: t.origin.x + (o.origin.x - t.origin.x) * a,
    y: t.origin.y + (o.origin.y - t.origin.y) * a
  }
}), xo = (t, o) => t.width === o.width && t.height === o.height && Z(t.angle) === Z(o.angle) && t.origin.x === o.origin.x && t.origin.y === o.origin.y, Bi = (t, o, a, n = {}) => {
  const s = Math.max(1, n.steps ?? 16), r = n.refinements ?? 20;
  if (xo(t, o)) {
    const d = De(t, { x: o.left - t.left, y: o.top - t.top }, a);
    return d ? Math.max(0, d.interval.entry - dt) : 1;
  }
  const u = (d) => {
    const v = rn(t, o, d);
    return a.some((c) => Kt(v, c).overlapping);
  };
  let h = 0, R = 1, b = !1;
  for (let d = 1; d <= s; d += 1) {
    const v = d / s;
    if (u(v)) {
      R = v, b = !0;
      break;
    }
    h = v;
  }
  if (!b) return 1;
  for (let d = 0; d < r; d += 1) {
    const v = (h + R) / 2;
    u(v) ? R = v : h = v;
  }
  return h;
}, yo = (t, o, a) => ({
  left: t.left + (o.left - t.left) * a,
  top: t.top + (o.top - t.top) * a,
  width: t.width + (o.width - t.width) * a,
  height: t.height + (o.height - t.height) * a
}), Li = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height, en = (t, o, a, n) => {
  if (!ce(t, o, a))
    return { rect: o, progress: 1 };
  let s = 0, r = 1, u = t;
  for (let h = 0; h < 24; h += 1) {
    const R = (s + r) / 2, b = n(yo(t, o, R));
    ce(t, b, a) ? r = R : (u = b, s = R);
  }
  return { rect: u, progress: s };
}, Hi = (t) => Math.abs(t.x) >= Math.abs(t.y) ? t.x > 0 ? "right" : "left" : t.y > 0 ? "bottom" : "top", Fi = (t) => ({
  x: Math.round(t.x * 1e4) / 1e4,
  y: Math.round(t.y * 1e4) / 1e4
}), ki = (t) => ({
  results: t,
  dominant: bi(t),
  totalOverlapArea: ho(t)
}), ze = (t, o) => {
  const a = /* @__PURE__ */ new Map();
  return o.forEach((n, s) => {
    if (n.width <= 0 || n.height <= 0) return;
    const r = Kt(t, n);
    r.overlapping && a.set(s, r.overlapArea);
  }), a;
}, lo = (t, o) => {
  let a = 0;
  t.forEach((s) => {
    a += s;
  });
  let n = 0;
  for (const [s, r] of o) {
    n += r;
    const u = t.get(s);
    if (u === void 0 || r > u) return !1;
  }
  return n < a;
}, Wi = (t, o) => t.left === o.left && t.top === o.top && t.width === o.width && t.height === o.height;
function Gi(t) {
  const o = yt([]), a = yt(!1), n = (d) => (o.value = d, a.value = d.length > 0, ki(d)), s = (d, v) => {
    const B = t().enabled ? Qe(d, v) : [];
    return n(B);
  }, r = (d, v) => {
    if (!t().enabled) return n([]);
    const B = [];
    for (const H of v) {
      if (H.width <= 0 || H.height <= 0) continue;
      const D = Kt(d, H);
      D.overlapping && B.push({
        colliding: !0,
        direction: D.normal ? Hi(D.normal) : void 0,
        normal: D.normal ? Fi(D.normal) : void 0,
        overlap: D.depth,
        overlapArea: D.overlapArea,
        targetId: H.id
      });
    }
    return n(B);
  }, u = (d, v, c) => {
    const B = t(), H = r(v, c);
    if (!B.enabled || B.allowOverlap)
      return { accepted: !0, rect: v, progress: 1, ...H };
    const D = ze(d, c);
    if (D.size > 0)
      return {
        accepted: lo(D, ze(v, c)),
        rect: v,
        progress: 1,
        ...H
      };
    const A = { x: v.left - d.left, y: v.top - d.top };
    if (A.x === 0 && A.y === 0)
      return { accepted: !0, rect: v, progress: 1, ...H };
    const G = De(d, A, c);
    if (!G)
      return { accepted: !0, rect: v, progress: 1, ...H };
    const { interval: V } = G, x = Math.min(1e-3, V.entry), w = Re(d, {
      x: A.x * (V.entry - x),
      y: A.y * (V.entry - x)
    }), M = Re(d, {
      x: A.x * (V.entry + (V.exit - V.entry) * 1e-3),
      y: A.y * (V.entry + (V.exit - V.entry) * 1e-3)
    }), P = Kt(M, G.target), C = {
      x: A.x * (1 - V.entry),
      y: A.y * (1 - V.entry)
    }, k = (N, Q) => {
      const et = De(N, Q, c);
      if (!et) return Re(N, Q);
      const at = Math.min(1e-3, et.interval.entry);
      return Re(N, {
        x: Q.x * (et.interval.entry - at),
        y: Q.y * (et.interval.entry - at)
      });
    };
    let L = w;
    const $ = P.normal;
    if ($) {
      const N = { x: -$.y, y: $.x }, Q = N.x * C.x + N.y * C.y, et = Q >= 0 ? 1 : -1;
      Math.abs(Q) > 1e-9 && (L = k(L, {
        x: N.x * et * Math.abs(Q),
        y: N.y * et * Math.abs(Q)
      }));
    }
    const it = { x: L.left - w.left, y: L.top - w.top }, K = C.x - it.x, q = C.y - it.y;
    K !== 0 && Math.sign(K) === Math.sign(C.x) && (L = k(L, { x: K, y: 0 })), q !== 0 && Math.sign(q) === Math.sign(C.y) && (L = k(L, { x: 0, y: q }));
    const O = r(L, c), J = O.results.length > 0 ? O : r(M, c), ot = A.x * A.x + A.y * A.y > 0 ? ((L.left - d.left) * A.x + (L.top - d.top) * A.y) / (A.x * A.x + A.y * A.y) : 1;
    return {
      accepted: !Wi(L, d),
      rect: L,
      progress: Math.max(0, Math.min(1, ot)),
      ...J
    };
  };
  return {
    collisions: o,
    isColliding: a,
    evaluate: s,
    evaluateOriented: r,
    resolveCandidate: (d, v, c, B = (D) => D, H = "path") => {
      const D = t(), A = s(d, c);
      if (!D.enabled || D.allowOverlap)
        return { accepted: !0, rect: d, progress: 1, ...A };
      const G = Qe(v, c), V = ho(G);
      if (V > 0)
        return {
          accepted: A.totalOverlapArea < V,
          rect: d,
          progress: 1,
          ...A
        };
      const x = ce(v, d, c);
      if (A.results.length === 0 && !x)
        return { accepted: !0, rect: d, progress: 1, ...A };
      let w = A;
      if (A.results.length === 0 && x) {
        const P = yo(
          v,
          d,
          x.entry + (x.exit - x.entry) * 1e-3
        );
        w = n(Qe(P, c));
      }
      let M = null;
      if (H === "slide") {
        const P = en(
          v,
          { ...v, left: d.left },
          c,
          B
        ), C = en(
          v,
          { ...v, top: d.top },
          c,
          B
        ), k = B({
          ...d,
          left: P.rect.left,
          top: C.rect.top
        });
        ce(v, k, c) || (M = { rect: k });
      }
      return M ?? (M = en(v, d, c, B)), {
        accepted: !Li(M.rect, v),
        rect: M.rect,
        progress: M.progress,
        ...w
      };
    },
    resolveOrientedTranslation: u,
    resolveOrientedChange: (d, v, c) => {
      const B = t(), H = r(v, c);
      if (!B.enabled || B.allowOverlap)
        return { accepted: !0, rect: v, progress: 1, ...H };
      const D = ze(d, c);
      if (D.size > 0)
        return {
          accepted: lo(D, ze(v, c)),
          rect: v,
          progress: 1,
          ...H
        };
      if (xo(d, v))
        return u(d, v, c);
      const A = Bi(d, v, c), G = rn(d, v, A), V = r(G, c);
      let x = V;
      if (V.results.length === 0 && A < 1) {
        const w = rn(d, v, A + (1 - A) * 1e-3);
        x = r(w, c);
      }
      return {
        accepted: A > 0,
        rect: G,
        progress: A,
        ...x
      };
    },
    clearCollisions: () => {
      o.value = [], a.value = !1;
    }
  };
}
const y = (t, o = 0) => {
  if (t == null || t === "")
    return o;
  const a = typeof t == "string" ? Number(t) : t;
  return Number.isFinite(a) ? a : o;
}, Et = (t, o, a) => Math.min(Math.max(t, o), a), $i = (t, o) => y(t.left) === y(o.left) && y(t.top) === y(o.top) && y(t.width) === y(o.width) && y(t.height) === y(o.height), Vi = {
  tl: { x: -1, y: -1 },
  tm: { x: 0, y: -1 },
  tr: { x: 1, y: -1 },
  ml: { x: -1, y: 0 },
  mr: { x: 1, y: 0 },
  bl: { x: -1, y: 1 },
  bm: { x: 0, y: 1 },
  br: { x: 1, y: 1 }
}, Ki = (t, o, a) => {
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
}, sn = (t, o, a) => {
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
}, an = (t, o, a, n) => {
  const s = Vt(a, t.width, t.height), r = zt(Z(o)), u = Math.cos(r), h = Math.sin(r), R = n.x - s.x, b = n.y - s.y;
  return {
    x: t.left + s.x + R * u - b * h,
    y: t.top + s.y + R * h + b * u
  };
}, Oe = (t) => Math.abs(t) < 1e-9 ? 0 : t, Ae = (t, o, a) => Math.min(Math.max(t, o), Math.max(o, a)), Yi = (t) => {
  const { start: o, angle: a, originSpec: n, handle: s, pointerDelta: r } = t, u = Z(a), h = Vi[s], R = an(
    o,
    u,
    n,
    sn(s, o.width, o.height)
  ), b = an(
    o,
    u,
    n,
    Ki(s, o.width, o.height)
  ), d = {
    x: b.x + r.x,
    y: b.y + r.y
  }, v = zt(u), c = Math.cos(v), B = Math.sin(v), H = { x: d.x - R.x, y: d.y - R.y }, D = {
    x: H.x * c + H.y * B,
    y: -H.x * B + H.y * c
  };
  let A = h.x === 0 ? o.width : Oe(h.x * D.x), G = h.y === 0 ? o.height : Oe(h.y * D.y);
  const V = Math.max(0, t.minWidth ?? 0), x = Math.max(0, t.minHeight ?? 0), w = Number.isFinite(t.maxWidth) ? Math.max(0, t.maxWidth ?? 1 / 0) : 1 / 0, M = Number.isFinite(t.maxHeight) ? Math.max(0, t.maxHeight ?? 1 / 0) : 1 / 0;
  if (t.ratio && t.ratio > 0) {
    const P = t.ratio;
    h.x !== 0 && (h.y === 0 || Math.abs(D.x) >= Math.abs(D.y) * P) ? (A = Ae(A, Math.min(V, w), w), G = A / P, G < x ? (G = x, A = G * P) : G > M && (G = M, A = G * P)) : (G = Ae(G, Math.min(x, M), M), A = G * P, A < V ? (A = V, G = A / P) : A > w && (A = w, G = A / P));
  } else
    A = Ae(A, Math.min(V, w), w), G = Ae(G, Math.min(x, M), M);
  return vo(
    { left: o.left, top: o.top, width: A, height: G },
    u,
    n,
    s,
    R
  );
}, vo = (t, o, a, n, s) => {
  const r = Vt(a, t.width, t.height), u = sn(n, t.width, t.height), h = zt(Z(o)), R = Math.cos(h), b = Math.sin(h), d = u.x - r.x, v = u.y - r.y;
  return {
    ...t,
    left: Oe(s.x - r.x - (d * R - v * b)),
    top: Oe(s.y - r.y - (d * b + v * R))
  };
}, bo = Symbol("MovableGroupContext"), Xi = 2, rt = (t, o = 1) => {
  if (t == null || t === "")
    return o;
  const a = typeof t == "string" ? parseFloat(t) : t;
  return isNaN(a) ? o : a;
}, Se = (t, o = "px") => t == null || t === "" ? "0" : `${t}${o}`;
function se(t, o, a, n) {
  t && t.addEventListener(o, a, n);
}
function le(t, o, a, n) {
  t && t.removeEventListener(o, a, n);
}
const nn = (t, o = 1, a = Xi) => {
  const n = new li(t).toDecimalPlaces(a).toNumber();
  return rt(n, o);
}, Zt = (t) => {
  if (t === null || typeof t != "object")
    return t;
  if (t instanceof Date)
    return new Date(t.getTime());
  if (t instanceof Array)
    return t.map((o) => Zt(o));
  if (t instanceof Object) {
    const o = {};
    for (const a in t)
      t.hasOwnProperty(a) && (o[a] = Zt(t[a]));
    return o;
  }
  return t;
}, Ui = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], _i = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], qi = Ee({
  name: "VueMovableBox"
}), Zi = /* @__PURE__ */ Ee({
  ...qi,
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
    var Nn;
    const n = t, s = a, r = (e) => Zt(e), u = yt(), h = yt(r(n.modelValue)), R = yt(Z(n.rotate)), b = r(n.modelValue), d = yt(null), v = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, c = ni({
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
    Rt(
      () => n.modelValue,
      (e) => {
        h.value = r(e);
      },
      { deep: !0 }
    ), Rt(
      () => n.rotate,
      (e) => {
        R.value = Z(e);
      }
    ), Rt(
      () => n.active,
      (e) => {
        !e && c.isInteracting ? me() : P(e);
      },
      { flush: "sync" }
    ), Rt(
      () => n.disabled,
      (e) => {
        s("disabled", e), e && me();
      }
    ), Rt(
      () => n.initRect,
      (e) => {
        e && me();
      }
    ), Rt(
      () => n.isKeepDecimals,
      (e, i) => {
        !e && i && w({
          ...h.value,
          left: Math.round(y(h.value.left)),
          top: Math.round(y(h.value.top)),
          width: Math.round(y(h.value.width)),
          height: Math.round(y(h.value.height))
        });
      }
    );
    const B = ut(() => n.resizable ?? n.resizeable ?? !0), H = ut(() => n.unitType === "%"), D = ut(() => R.value), A = ut(() => mo(n.transformOrigin)), G = ut(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : c.active ? n.theme : n.inActiveColor,
      left: Se(h.value.left, n.unitType),
      top: Se(h.value.top, n.unitType),
      width: Se(h.value.width, n.unitType),
      height: Se(h.value.height, n.unitType),
      zIndex: h.value.zIndex,
      cursor: n.disabled ? "not-allowed" : c.isDragging ? "move" : c.isResizing ? "nwse-resize" : c.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: c.active ? 1 : 0.9,
      transform: D.value ? `rotate(${D.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: A.value,
      willChange: c.isDragging || c.isResizing ? "left, top, width, height" : c.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !c.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), V = ut(() => ({
      borderColor: B.value ? n.theme : n.inActiveColor,
      scale: nn(1 / rt(n.scale, 1), 1)
    })), x = ut(() => {
      const e = Math.abs(rt(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / e}px`,
        "--rotation-handle-scale": nn(1 / e, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), w = (e) => {
      const i = r(e);
      return h.value = i, s("update:modelValue", r(i)), i;
    }, M = (e) => {
      const i = Z(E(Z(e)));
      return R.value = i, s("update:rotate", i), s("rotate", i), i;
    };
    function P(e) {
      c.active !== e && (c.active = e, s(e ? "active" : "inactive", r(h.value)), e || Fe());
    }
    const C = () => {
      var i, f, l;
      let e = null;
      if (n.limitAreaClass)
        try {
          e = document.querySelector(n.limitAreaClass);
        } catch {
          e = null;
        }
      c.parentElement = e ?? ((i = u.value) == null ? void 0 : i.parentElement) ?? null, c.parentWidth = ((f = c.parentElement) == null ? void 0 : f.clientWidth) ?? 0, c.parentHeight = ((l = c.parentElement) == null ? void 0 : l.clientHeight) ?? 0;
    }, k = (e) => Math.max(0, Number(e) || 0), L = () => {
      const e = k(n.edgeDistance);
      return {
        top: e + k(n.boundsMargin.top),
        right: e + k(n.boundsMargin.right),
        bottom: e + k(n.boundsMargin.bottom),
        left: e + k(n.boundsMargin.left)
      };
    }, $ = () => {
      const e = L(), i = H.value ? 100 : c.parentWidth, f = H.value ? 100 : c.parentHeight;
      return {
        minLeft: e.left,
        maxRight: Math.max(e.left, i - e.right),
        minTop: e.top,
        maxBottom: Math.max(e.top, f - e.bottom)
      };
    }, it = (e) => {
      const i = $();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - e.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - e.height)
      };
    }, K = (e) => ({
      left: y(e.left),
      top: y(e.top),
      width: y(e.width),
      height: y(e.height)
    }), q = () => ({
      x: H.value && c.parentWidth > 0 ? c.parentWidth / 100 : 1,
      y: H.value && c.parentHeight > 0 ? c.parentHeight / 100 : 1
    }), O = (e) => {
      const i = K(e), f = D.value;
      if (!f) return i;
      const l = q(), m = {
        left: i.left * l.x,
        top: i.top * l.y,
        width: i.width * l.x,
        height: i.height * l.y
      }, p = Vt(n.transformOrigin, m.width, m.height), g = Ri(m, f, p);
      return {
        left: g.left / l.x,
        top: g.top / l.y,
        width: g.width / l.x,
        height: g.height / l.y
      };
    }, J = (e, i, f) => {
      const l = q(), m = e.left * l.x, p = e.top * l.y, g = e.width * l.x, z = e.height * l.y;
      return {
        left: m,
        top: p,
        width: g,
        height: z,
        angle: i,
        origin: Vt(f, g, z)
      };
    }, ot = (e, i = D.value) => J(K(e), i, n.transformOrigin);
    let N = null;
    const Q = () => {
      N = null;
    };
    Rt(
      () => [n.snapTargets, n.collisionTargets, n.transformOrigin],
      Q,
      { deep: !0 }
    ), Rt(() => [c.parentWidth, c.parentHeight, n.unitType], Q);
    const et = (e) => {
      N === null && (N = /* @__PURE__ */ new WeakMap());
      const i = N.get(e);
      if (i) return i;
      const f = q(), l = {
        left: y(e.left) * f.x,
        top: y(e.top) * f.y,
        width: y(e.width) * f.x,
        height: y(e.height) * f.y
      }, m = {
        ...l,
        id: e.id,
        angle: Z(e.rotate ?? 0),
        origin: Vt(e.transformOrigin ?? "center", l.width, l.height)
      };
      return N.set(e, m), m;
    }, at = (e) => et(e), pt = () => Be().map(at), Ct = () => {
      if (!n.snapToElements) return dn();
      const e = q();
      return dn().map((i) => {
        if (!Z(i.rotate ?? 0)) return i;
        const f = Pe(at(i));
        return {
          left: f.left / e.x,
          top: f.top / e.y,
          width: f.width / e.x,
          height: f.height / e.y,
          id: i.id
        };
      });
    }, st = () => n.collisionEnabled && !n.allowOverlap && Qt.value, Nt = (e, i, f) => {
      const l = (g) => {
        const z = ot(g);
        let T = 0;
        for (const S of f) {
          const F = Kt(z, S);
          F.overlapping && (T += F.overlapArea);
        }
        return T;
      }, m = l(i), p = (g) => m > 0 ? l(g) < m : l(g) === 0;
      if (p(e)) return e;
      for (let g = 0.8; g > 0.01; g -= 0.2) {
        const z = {
          ...e,
          left: E(
            y(i.left) + (y(e.left) - y(i.left)) * g
          ),
          top: E(
            y(i.top) + (y(e.top) - y(i.top)) * g
          )
        };
        if (p(z)) return z;
      }
      return i;
    }, Jt = (e, i, f) => {
      const l = pt(), m = ot(i), p = ot(e), g = f === "slide" ? de.resolveOrientedTranslation(m, p, l) : de.resolveOrientedChange(m, p, l);
      if (mn(g), !g.accepted) return null;
      const z = q(), T = {
        ...e,
        left: E(g.rect.left / z.x),
        top: E(g.rect.top / z.y),
        width: E(g.rect.width / z.x),
        height: E(g.rect.height / z.y)
      };
      return st() ? Nt(T, i, l) : T;
    }, wo = () => n.collisionEnabled && !n.allowOverlap && Qt.value, Io = (e) => {
      if (!n.limitAreaForParent || !c.parentElement) return !1;
      const i = $(), f = Pe(ot(h.value, e)), l = q(), m = f.left / l.x, p = f.top / l.y, g = f.width / l.x, z = f.height / l.y, T = 1e-7;
      return m < i.minLeft - T || m + g > i.maxRight + T || p < i.minTop - T || p + z > i.maxBottom + T;
    }, ue = (e, i) => {
      if (Io(e)) return !0;
      if (!wo() || i.length === 0) return !1;
      const f = ot(h.value, e);
      return i.some((l) => Kt(f, l).overlapping);
    }, ln = (e, i) => Math.max(48, Math.ceil(Math.abs(i - e) / 2)), Ro = (e, i, f) => {
      let l = e, m = i, p = !1;
      const g = ln(e, i);
      for (let T = 1; T <= g; T += 1) {
        const S = e + (i - e) * T / g;
        if (ue(S, f)) {
          m = S, p = !0;
          break;
        }
        l = S;
      }
      if (!p) return i;
      let z = l;
      for (let T = 0; T < 20; T += 1) {
        const S = (z + m) / 2;
        ue(S, f) ? m = S : z = S;
      }
      return z;
    }, cn = (e, i) => {
      if (!Qt.value || Math.abs(i - e) < 1e-9) return Z(i);
      const f = pt();
      if (ue(e, f)) {
        const l = ln(e, i);
        for (let m = 1; m <= l; m += 1) {
          const p = e + (i - e) * m / l;
          if (!ue(p, f))
            return Z(E(p));
        }
        return Z(e);
      }
      return Z(E(Ro(e, i, f)));
    }, fn = (e, i) => {
      const f = D.value;
      if (!f && n.resizeMode !== "fixed-anchor" || !n.limitAreaForParent || !c.parentElement)
        return e;
      const l = $(), m = Math.max(0, l.maxRight - l.minLeft), p = Math.max(0, l.maxBottom - l.minTop), g = zt(f), z = Math.abs(Math.cos(g)) < 1e-9 ? 0 : Math.abs(Math.cos(g)), T = Math.abs(Math.sin(g)) < 1e-9 ? 0 : Math.abs(Math.sin(g)), S = q(), F = z, W = T * (S.y / S.x), _ = T * (S.x / S.y), j = z, Y = y(e.width), X = y(e.height), I = i ? v[i] : null, lt = y(e.left) + Y, Yt = y(e.top) + X, Ht = (ct, ht) => ({
        ...e,
        left: I != null && I.left ? E(lt - ct) : e.left,
        top: I != null && I.top ? E(Yt - ht) : e.top,
        width: ct,
        height: ht
      }), gt = (ct, ht) => ({
        ...e,
        left: I != null && I.left ? lt - ct : e.left,
        top: I != null && I.top ? Yt - ht : e.top,
        width: ct,
        height: ht
      }), oe = F * Y + W * X, ye = _ * Y + j * X, Pt = Math.max(0, rt(n.minWidth, 0)), Mt = Math.max(0, rt(n.minHeight, 0)), ie = i === null || !!(I != null && I.left || I != null && I.right), re = i === null || !!(I != null && I.top || I != null && I.bottom), Ft = (I == null ? void 0 : I.left) ?? !1, mt = (I == null ? void 0 : I.top) ?? !1, Dt = (ct, ht) => {
        if (!Ft && !mt) return ct;
        const xt = y(ct.width), Xt = y(ct.height), Hn = ht ? Math.min(
          1,
          Math.max(
            xt > 0 ? Pt / xt : 0,
            Xt > 0 ? Mt / Xt : 0
          )
        ) : 0, Fn = ht ? xt * Hn : Ft ? Math.min(xt, Pt) : xt, kn = ht ? Xt * Hn : mt ? Math.min(Xt, Mt) : Xt, Wn = (nt) => ({
          width: Fn + (xt - Fn) * nt,
          height: kn + (Xt - kn) * nt
        }), Gn = (nt) => {
          const tt = Wn(nt);
          return gt(tt.width, tt.height);
        }, Ut = (nt) => {
          const tt = Wn(nt), ft = n.isKeepDecimals ? E : Math.floor;
          return Ht(
            Math.max(Pt, ft(tt.width)),
            Math.max(Mt, ft(tt.height))
          );
        }, ve = (nt) => {
          const tt = O(nt), ft = 1e-7;
          return (!Ft || tt.left >= l.minLeft - ft && tt.left + tt.width <= l.maxRight + ft) && (!mt || tt.top >= l.minTop - ft && tt.top + tt.height <= l.maxBottom + ft);
        };
        if (ve(ct)) return ct;
        const _t = O(Gn(0)), qt = O(Gn(1));
        let Ot = 0, It = 1, Xe = !0;
        const $n = (nt, tt, ft) => {
          const kt = tt - nt;
          if (Math.abs(kt) < 1e-9) {
            nt < ft && (Xe = !1);
            return;
          }
          const ae = (ft - nt) / kt;
          kt > 0 ? Ot = Math.max(Ot, ae) : It = Math.min(It, ae);
        }, Vn = (nt, tt, ft) => {
          const kt = tt - nt;
          if (Math.abs(kt) < 1e-9) {
            nt > ft && (Xe = !1);
            return;
          }
          const ae = (ft - nt) / kt;
          kt > 0 ? It = Math.min(It, ae) : Ot = Math.max(Ot, ae);
        };
        if (Ft && ($n(_t.left, qt.left, l.minLeft), Vn(
          _t.left + _t.width,
          qt.left + qt.width,
          l.maxRight
        )), mt && ($n(_t.top, qt.top, l.minTop), Vn(
          _t.top + _t.height,
          qt.top + qt.height,
          l.maxBottom
        )), Ot = Math.max(0, Ot), It = Math.min(1, It), !Xe || Ot > It) return Ut(0);
        const Kn = Ut(It);
        if (ve(Kn)) return Kn;
        let be = Ot, Yn = It;
        if (!ve(Ut(be))) return Ut(0);
        for (let nt = 0; nt < 32; nt += 1) {
          const tt = (be + Yn) / 2;
          ve(Ut(tt)) ? be = tt : Yn = tt;
        }
        return Ut(be);
      };
      if (n.ratioLock || ie && re) {
        const ct = Math.min(
          1,
          oe > m ? m / oe : 1,
          ye > p ? p / ye : 1
        ), ht = Math.max(
          ct,
          Y > 0 ? Pt / Y : 0,
          X > 0 ? Mt / X : 0
        ), xt = Math.min(ht, 1);
        return xt >= 1 ? Dt(e, !0) : Dt(
          Ht(
            Math.max(Pt, Math.floor(Y * xt)),
            Math.max(Mt, Math.floor(X * xt))
          ),
          !0
        );
      }
      const wt = Math.floor(
        Math.min(
          F > 0 ? (m - W * X) / F : 1 / 0,
          _ > 0 ? (p - j * X) / _ : 1 / 0
        )
      ), Ye = Math.floor(
        Math.min(
          W > 0 ? (m - F * Y) / W : 1 / 0,
          j > 0 ? (p - _ * Y) / j : 1 / 0
        )
      ), Bn = ie ? Math.max(Pt, Math.min(Y, wt)) : Y, Ln = re ? Math.max(Mt, Math.min(X, Ye)) : X;
      return Dt(Bn === Y && Ln === X ? e : Ht(Bn, Ln), !1);
    }, Ce = (e) => {
      if (!c.parentElement) return;
      const i = $(), f = O(e), l = f.left, m = f.top, p = l + f.width, g = m + f.height;
      l < i.minLeft && s("out-of-bounds", "left"), p > i.maxRight && s("out-of-bounds", "right"), m < i.minTop && s("out-of-bounds", "top"), g > i.maxBottom && s("out-of-bounds", "bottom");
    }, Ne = (e) => {
      if (!n.limitAreaForParent || !c.parentElement) return e;
      const i = O(e), f = it(i), l = Et(i.left, f.minLeft, f.maxLeft), m = Et(i.top, f.minTop, f.maxTop);
      return D.value ? {
        ...e,
        left: E(y(e.left) + (l - i.left)),
        top: E(y(e.top) + (m - i.top))
      } : {
        ...e,
        left: l,
        top: m
      };
    }, U = oi(bo, null), At = n.memberId || `member-${((Nn = ii()) == null ? void 0 : Nn.uid) ?? Math.random().toString(36).slice(2)}`;
    let St = !1;
    const un = (e) => Math.max(0, Math.floor(e * 1e6) / 1e6), zo = {
      getRect: () => r(h.value),
      getVisualRect: () => O(r(h.value)),
      translateTo: (e) => {
        w(e);
      },
      // The group constraint loop runs per frame, so re-resolving layout on every call would
      // dominate group drags. Resolve the area lazily once per member, then reuse the
      // snapshot (refreshed at each interaction start by the box itself).
      getAreaEdges: () => (c.parentElement || C(), c.parentElement ? $() : null),
      // Largest fraction of a shared group delta this box can absorb without colliding,
      // swept from the member's drag-start rectangle: the group re-applies the limited delta
      // to the start rectangle on every frame, so both sides must reference the same origin.
      // A start position already overlapping an obstacle only permits escape motions that
      // strictly shrink the overlap, matching the interaction pipeline's escape rule.
      sharedDeltaProgress: (e, i) => {
        if (!n.collisionEnabled || n.allowOverlap) return 1;
        const f = q();
        if (Qt.value) {
          const g = pt(), z = ot(e), T = { x: i.left * f.x, y: i.top * f.y }, S = (_) => {
            let j = 0;
            for (const Y of g) j += Kt(_, Y).overlapArea;
            return j;
          }, F = S(z);
          if (F > 0)
            return S(Ni(z, T)) < F ? 1 : 0;
          const W = De(z, T, g);
          return W ? un(W.interval.entry) : 1;
        }
        const l = K(e), m = {
          ...l,
          left: l.left + i.left,
          top: l.top + i.top
        }, p = ce(l, m, Be());
        return p ? un(p.entry) : 1;
      }
    };
    ri(() => {
      U == null || U.registerMember(At, zo), typeof window < "u" && window.addEventListener("resize", C);
    });
    const dn = () => U ? n.snapTargets.filter((e) => !U.hasMember(e.id)) : n.snapTargets, Be = () => {
      const e = n.collisionTargets === void 0 ? n.snapTargets : n.collisionTargets;
      return U ? e.filter((i) => !U.hasMember(i.id)) : e;
    }, E = (e) => n.isKeepDecimals ? nn(e, 0, n.decimalPlaces) : Math.round(e), Le = (e, i) => {
      if (!H.value) return E(e);
      const f = i === "horizontal" ? c.parentWidth : c.parentHeight;
      return f > 0 ? E(e / f * 100) : 0;
    }, hn = (e, i) => {
      const f = rt(n.scale, 1), l = e / (f === 0 ? 1 : f);
      return Le(l, i);
    }, pn = mi(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), Tt = xi(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), Qt = ut(() => n.collisionMode !== "aabb"), de = Gi(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), gn = Tt.guides;
    let jt = "clear", te = "clear", ee = "clear";
    const he = /* @__PURE__ */ new Set(["left", "right", "center-x"]), pe = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), He = (e) => {
      const i = {
        horizontal: e.points.some((g) => he.has(g)) ? e.targetIds.horizontal : void 0,
        vertical: e.points.some((g) => pe.has(g)) ? e.targetIds.vertical : void 0
      }, f = e.snapped ? Zt(e.spacing ?? []) : [], l = e.snapped ? {
        snapped: !0,
        point: e.snapPoint,
        points: e.points,
        targetId: e.targetId,
        targetIds: i,
        spacing: f.length > 0 ? f : void 0
      } : { snapped: !1 }, m = JSON.stringify({
        payload: l,
        left: e.points.some((g) => he.has(g)) ? e.left : void 0,
        top: e.points.some((g) => pe.has(g)) ? e.top : void 0
      });
      m !== jt && ((e.snapped || jt !== "clear") && s("snap", l), jt = e.snapped ? m : "clear");
      const p = JSON.stringify({ guides: e.guides, targetIds: i });
      p !== te && ((e.snapped || te !== "clear") && s("guides", Zt(e.guides)), te = e.snapped ? p : "clear");
    }, mn = (e) => {
      const i = e.dominant, f = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId,
        normal: i.normal ? { ...i.normal } : void 0
      } : { colliding: !1 }, l = JSON.stringify(f);
      l !== ee && ((i || ee !== "clear") && s("collision", f), ee = i ? l : "clear");
    }, Fe = () => {
      jt !== "clear" && s("snap", { snapped: !1 }), te !== "clear" && s("guides", { vertical: [], horizontal: [] }), ee !== "clear" && s("collision", { colliding: !1 }), jt = "clear", te = "clear", ee = "clear", Tt.clearGuides(), de.clearCollisions();
    }, ke = (e, i, f = "path") => {
      if (Qt.value)
        return Jt(e, i, f);
      const l = O(e), m = de.resolveCandidate(
        l,
        O(i),
        Be(),
        (p) => ({
          left: E(p.left),
          top: E(p.top),
          width: E(p.width),
          height: E(p.height)
        }),
        f
      );
      if (mn(m), !m.accepted) return null;
      if (D.value) {
        if (f === "path" && m.progress !== void 0) {
          const p = Et(m.progress, 0, 1), g = K(i), z = K(e);
          return {
            ...e,
            left: E(
              g.left + (z.left - g.left) * p
            ),
            top: E(g.top + (z.top - g.top) * p),
            width: E(
              g.width + (z.width - g.width) * p
            ),
            height: E(
              g.height + (z.height - g.height) * p
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
    }, xn = (e, i, f, l, m) => {
      let p = r(e);
      l.horizontal && (p.left = pn.snapValue(y(e.left))), l.vertical && (p.top = pn.snapValue(y(e.top)));
      let g = {
        ...K(p),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (f) {
        const T = O(p);
        g = Tt.resolveSnap(T, Ct(), l), D.value ? p = {
          ...p,
          left: E(y(p.left) + (g.left - T.left)),
          top: E(y(p.top) + (g.top - T.top))
        } : p = { ...p, left: g.left, top: g.top };
      } else
        Tt.clearGuides();
      if (m) {
        const T = y(m.left), S = y(m.top);
        n.dragDirections.includes("left") || (p.left = Math.max(T, y(p.left))), n.dragDirections.includes("right") || (p.left = Math.min(T, y(p.left))), n.dragDirections.includes("top") || (p.top = Math.max(S, y(p.top))), n.dragDirections.includes("bottom") || (p.top = Math.min(S, y(p.top)));
      }
      Ce(p), p = Ne(p);
      const z = ke(p, i, "slide");
      if (!z)
        return He({
          ...g,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), Tt.clearGuides(), null;
      if (p = z, g.snapped) {
        const T = O(p), S = E(T.left) !== E(g.left), F = E(T.top) !== E(g.top), W = g.points.filter((I) => he.has(I) ? !S : pe.has(I) ? !F : !1), _ = W.some((I) => he.has(I)), j = W.some((I) => pe.has(I)), Y = g.spacing.filter(
          (I) => I.axis === "horizontal" ? !S : !F
        ), X = {
          vertical: Y.flatMap((I) => I.axis === "horizontal" ? I.guides : []),
          horizontal: Y.flatMap((I) => I.axis === "vertical" ? I.guides : [])
        };
        g = {
          ...g,
          left: y(p.left),
          top: y(p.top),
          snapped: W.length > 0 || Y.length > 0,
          snapPoint: W[0],
          points: W,
          targetId: _ ? g.targetIds.horizontal : j ? g.targetIds.vertical : void 0,
          targetIds: {
            horizontal: _ ? g.targetIds.horizontal : void 0,
            vertical: j ? g.targetIds.vertical : void 0
          },
          guides: {
            vertical: _ ? g.guides.vertical : X.vertical,
            horizontal: j ? g.guides.horizontal : X.horizontal
          },
          spacing: Y
        }, g.snapped ? Tt.setGuides(g.guides) : Tt.clearGuides();
      }
      return He(g), p;
    }, We = (e) => n.resizeDirections.includes(e), yn = (e, i, f) => {
      if (n.resizeMode !== "fixed-anchor") {
        const W = zi(f.x, f.y, D.value), _ = {
          x: Le(W.x, "horizontal"),
          y: Le(W.y, "vertical")
        };
        return Ao(e, i, _.x, _.y);
      }
      const l = q(), m = y(e.width), p = y(e.height), g = Math.max(0, rt(n.minWidth, 0)), z = Math.max(0, rt(n.minHeight, 0)), T = rt(n.maxWidth, 1 / 0), S = rt(n.maxHeight, 1 / 0), F = Yi({
        start: {
          left: y(e.left) * l.x,
          top: y(e.top) * l.y,
          width: m * l.x,
          height: p * l.y
        },
        angle: D.value,
        originSpec: n.transformOrigin,
        handle: i,
        pointerDelta: f,
        minWidth: g * l.x,
        minHeight: z * l.y,
        maxWidth: T > 0 ? T * l.x : 1 / 0,
        maxHeight: S > 0 ? S * l.y : 1 / 0,
        ratio: n.ratioLock && m > 0 && p > 0 ? m * l.x / (p * l.y) : null
      });
      return {
        ...e,
        left: E(F.left / l.x),
        top: E(F.top / l.y),
        width: E(F.width / l.x),
        height: E(F.height / l.y)
      };
    }, vn = (e, i, f) => {
      const l = q(), m = D.value, p = {
        left: y(e.left) * l.x,
        top: y(e.top) * l.y,
        width: y(e.width) * l.x,
        height: y(e.height) * l.y
      }, g = an(
        p,
        m,
        n.transformOrigin,
        sn(f, p.width, p.height)
      ), z = vo(
        {
          left: y(i.left) * l.x,
          top: y(i.top) * l.y,
          width: y(i.width) * l.x,
          height: y(i.height) * l.y
        },
        m,
        n.transformOrigin,
        f,
        g
      ), T = {
        ...i,
        left: E(z.left / l.x),
        top: E(z.top / l.y)
      };
      if (!n.limitAreaForParent || !c.parentElement) return T;
      const S = $(), F = O(T), W = 1e-7;
      return F.left >= S.minLeft - W && F.left + F.width <= S.maxRight + W && F.top >= S.minTop - W && F.top + F.height <= S.maxBottom + W ? T : i;
    }, Ao = (e, i, f, l) => {
      const m = v[i], p = y(e.left), g = y(e.top), z = y(e.width), T = y(e.height);
      let S = p, F = p + z, W = g, _ = g + T;
      m.left && (S += f), m.right && (F += f), m.top && (W += l), m.bottom && (_ += l);
      const j = (S + F) / 2, Y = (W + _) / 2;
      let X = Math.max(0, F - S), I = Math.max(0, _ - W);
      const lt = z > 0 && T > 0 ? z / T : 1, Yt = (wt) => {
        X = wt, m.left ? S = F - X : m.right ? F = S + X : (S = j - X / 2, F = j + X / 2);
      }, Ht = (wt) => {
        I = wt, m.top ? W = _ - I : m.bottom ? _ = W + I : (W = Y - I / 2, _ = Y + I / 2);
      };
      if (n.ratioLock) {
        const wt = Math.abs(X - z), Ye = Math.abs(I - T) * lt;
        i === "tm" || i === "bm" || Ye > wt ? Yt(I * lt) : Ht(X / lt);
      }
      const gt = $(), oe = n.limitAreaForParent && !!c.parentElement && D.value === 0, ye = oe ? m.left ? Math.max(0, F - gt.minLeft) : m.right ? Math.max(0, gt.maxRight - S) : Math.max(
        0,
        2 * Math.min(j - gt.minLeft, gt.maxRight - j)
      ) : 1 / 0, Pt = oe ? m.top ? Math.max(0, _ - gt.minTop) : m.bottom ? Math.max(0, gt.maxBottom - W) : Math.max(
        0,
        2 * Math.min(Y - gt.minTop, gt.maxBottom - Y)
      ) : 1 / 0, Mt = Math.max(0, rt(n.minWidth, 0)), ie = Math.max(0, rt(n.minHeight, 0)), re = rt(n.maxWidth, 1 / 0), Ft = rt(n.maxHeight, 1 / 0);
      let mt = Math.min(re > 0 ? re : 1 / 0, ye), Dt = Math.min(Ft > 0 ? Ft : 1 / 0, Pt);
      if (n.ratioLock) {
        mt = Math.min(mt, Dt * lt);
        const wt = Math.max(Mt, ie * lt);
        Yt(Et(X, wt, mt)), Ht(X / lt);
      } else
        Yt(Et(X, Math.min(Mt, mt), mt)), Ht(Et(I, Math.min(ie, Dt), Dt));
      return {
        ...e,
        left: E(S),
        top: E(W),
        width: E(F - S),
        height: E(_ - W)
      };
    };
    let bt = null, Bt = null;
    const bn = (e, i, f) => Math.atan2(e.clientY - f, e.clientX - i) * 180 / Math.PI + 90, Mn = (e) => {
      if (n.disabled || n.initRect || !c.isInteracting) return;
      if (c.isRotating) {
        const m = bn(
          e,
          c.rotationOriginX,
          c.rotationOriginY
        ), p = Z(m - c.rotationStartPointerAngle), g = oo(
          c.beforeRotation + p,
          n.rotationSnapAngles ?? [],
          n.rotationSnapThreshold
        );
        M(cn(c.beforeRotation, g));
        return;
      }
      const i = hn(e.clientX - c.initX, "horizontal"), f = hn(e.clientY - c.initY, "vertical"), l = r(h.value);
      if (c.isDragging) {
        const m = c.beforeInteraction;
        let p = y(m.left) + i, g = y(m.top) + f;
        const z = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: f < 0 && n.dragDirections.includes("top") || f > 0 && n.dragDirections.includes("bottom")
        };
        z.horizontal || (p = y(m.left)), z.vertical || (g = y(m.top));
        const T = {
          ...m,
          left: E(p),
          top: E(g)
        };
        let S = xn(T, l, n.snapToElements, z, m);
        if (S && St && (S = (U == null ? void 0 : U.constrainPosition(At, S)) ?? null), S) {
          const F = w(S);
          s("move", r(F)), s("drag", r(F)), St && (U == null || U.notifyMoved(At, r(F)));
        }
      }
      if (c.isResizing && c.handle) {
        He({
          ...K(l),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), Tt.clearGuides();
        const m = rt(n.scale, 1), p = m === 0 ? 1 : m, g = {
          x: (e.clientX - c.initX) / p,
          y: (e.clientY - c.initY) / p
        };
        let z = yn(c.beforeInteraction, c.handle, g);
        (D.value || n.resizeMode === "fixed-anchor") && (z = fn(z, c.handle), z = Ne(z), n.resizeMode === "fixed-anchor" && (z = vn(c.beforeInteraction, z, c.handle))), Ce(z);
        const T = ke(z, l);
        if (T) {
          const S = w(T);
          s("resize", r(S));
        }
      }
    }, So = (e) => {
      !c.active || n.disabled || n.initRect || (Bt = e, bt === null && (bt = requestAnimationFrame(() => {
        bt = null;
        const i = Bt;
        Bt = null, i && Mn(i);
      })));
    }, ge = (e) => c.pointerId === null || e.pointerId === c.pointerId, wn = (e) => {
      ge(e) && So(e);
    }, In = (e) => {
      ge(e) && No(e);
    }, Rn = (e) => {
      ge(e) && ne(e);
    }, zn = (e) => {
      ge(e) && c.isInteracting && ne(e);
    }, An = (e) => {
      e.key === "Escape" && c.isInteracting && (e.preventDefault(), e.stopPropagation(), ne(e));
    }, Sn = () => {
      const e = c.eventElement;
      if (!e) return;
      const i = { passive: !1 };
      se(e, "pointermove", wn, i), se(e, "pointerup", In, i), se(e, "pointercancel", Rn, i), se(e, "keydown", An, !0);
      const f = u.value;
      f && se(f, "lostpointercapture", zn, i);
    }, To = () => {
      const e = c.eventElement;
      if (!e) return;
      le(e, "pointermove", wn, !1), le(e, "pointerup", In, !1), le(e, "pointercancel", Rn, !1), le(e, "keydown", An, !0);
      const i = u.value;
      i && le(i, "lostpointercapture", zn, !1), c.eventElement = null;
    }, Tn = () => {
      const e = u.value;
      if (!(!e || c.pointerId === null))
        try {
          e.setPointerCapture(c.pointerId);
        } catch {
        }
    }, Po = () => {
      const e = u.value, i = c.pointerId;
      if (c.pointerId = null, !(!e || i === null))
        try {
          e.hasPointerCapture(i) && e.releasePointerCapture(i);
        } catch {
        }
    };
    function Ge() {
      bt !== null && (cancelAnimationFrame(bt), bt = null), Bt = null;
    }
    function $e() {
      c.interactionMode = "idle", c.handle = null, St = !1, To(), Po();
    }
    function Pn() {
      Fe(), n.active || P(!1);
    }
    function Dn() {
      $e(), Pn();
    }
    function me() {
      Ge(), St && (U == null || U.abortDrag(At)), Dn();
    }
    function ne(e = null) {
      const i = c.isDragging, f = c.isResizing, l = c.isRotating, m = St;
      if (Ge(), $e(), i || f) {
        const p = r(c.beforeInteraction);
        w(p), s(i ? "drag-cancel" : "resize-cancel", e, p, r(p)), i && m && (U == null || U.cancelDrag(At, e));
      }
      l && (R.value = c.beforeRotation, s("update:rotate", c.beforeRotation), s("rotate-cancel", e, c.beforeRotation, c.beforeRotation)), Pn();
    }
    function On() {
      me(), P(!1);
    }
    const Do = (e, i) => {
      var l, m;
      if (n.disabled || n.initRect || c.isInteracting || i && (!B.value || !We(i)) || !i && !n.draggable) return;
      const f = r(h.value);
      if (i) {
        if (((l = n.canResize) == null ? void 0 : l.call(n, f, i)) === !1) return;
      } else if (((m = n.canDrag) == null ? void 0 : m.call(n, f)) === !1)
        return;
      if (St = !1, !i && U) {
        const p = U.beginDrag(At, e);
        if (p === "blocked") return;
        St = p === "group";
      }
      C(), c.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, c.initX = e.clientX, c.initY = e.clientY, c.beforeInteraction = r(h.value), c.handle = i, c.interactionMode = i ? "resize" : "drag", P(!0), c.isDragging && s("drag-start", e, r(c.beforeInteraction)), c.isResizing && s("resize-start", e, r(c.beforeInteraction)), c.eventElement = document.documentElement, Sn(), Tn();
    }, Oo = () => {
      const e = u.value;
      if (!e) return null;
      const i = e.getBoundingClientRect(), f = e.offsetWidth || y(h.value.width), l = e.offsetHeight || y(h.value.height);
      if (!f || !l) return null;
      const m = zt(D.value), p = Math.cos(m), g = Math.sin(m), z = Math.abs(p) * f + Math.abs(g) * l, T = Math.abs(g) * f + Math.abs(p) * l, S = [
        z ? i.width / z : 0,
        T ? i.height / T : 0
      ].filter((I) => Number.isFinite(I) && I > 0), F = Math.abs(rt(n.scale, 1)) || 1, W = S.length ? S.reduce((I, lt) => I + lt, 0) / S.length : F, _ = Vt(n.transformOrigin, f, l), j = _.x * W, Y = _.y * W, X = [
        [-j, -Y],
        [f * W - j, -Y],
        [f * W - j, l * W - Y],
        [-j, l * W - Y]
      ].map(([I, lt]) => ({
        x: I * p - lt * g,
        y: I * g + lt * p
      }));
      return {
        x: i.left - Math.min(...X.map((I) => I.x)),
        y: i.top - Math.min(...X.map((I) => I.y))
      };
    }, Eo = (e) => {
      var f;
      if (!e.isPrimary || e.button !== 0 || n.disabled || n.initRect || !n.rotatable || c.isInteracting || ((f = n.canRotate) == null ? void 0 : f.call(n, r(h.value))) === !1) return;
      C();
      const i = Oo();
      i && (c.pointerId = typeof e.pointerId == "number" ? e.pointerId : null, c.beforeRotation = R.value, c.rotationOriginX = i.x, c.rotationOriginY = i.y, c.rotationStartPointerAngle = bn(e, i.x, i.y), c.interactionMode = "rotate", P(!0), s("rotate-start", e, c.beforeRotation), c.eventElement = document.documentElement, Sn(), Tn());
    }, Co = (e) => {
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
    }, En = (e, i) => {
      !e.isPrimary || e.button !== 0 || !i && !Co(e.target) || Do(e, i);
    };
    function No(e) {
      bt !== null && (cancelAnimationFrame(bt), bt = null), Bt && (Mn(Bt), Bt = null), c.isDragging && (s("drag-stop", e, r(c.beforeInteraction), r(h.value)), St && (U == null || U.endDrag(At, e))), c.isResizing && s("resize-stop", e, r(c.beforeInteraction), r(h.value)), c.isRotating && s("rotate-stop", e, c.beforeRotation, R.value), Dn();
    }
    const Bo = (e, i) => {
      var p;
      C();
      const f = r(h.value);
      if (((p = n.canDrag) == null ? void 0 : p.call(n, r(f))) === !1) return;
      const l = r(f);
      e === "left" && (l.left = y(l.left) - i), e === "right" && (l.left = y(l.left) + i), e === "top" && (l.top = y(l.top) - i), e === "bottom" && (l.top = y(l.top) + i);
      const m = xn(
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
        const g = w(m);
        s("move", r(g));
      }
    }, Lo = (e, i, f) => {
      var S;
      if (!B.value || !We(e)) return;
      C();
      const l = r(h.value);
      if (((S = n.canResize) == null ? void 0 : S.call(n, r(l), e)) === !1) return;
      const m = i === "left" ? -f : i === "right" ? f : 0, p = i === "top" ? -f : i === "bottom" ? f : 0;
      let g = yn(l, e, {
        x: Ve(m),
        y: Ke(p)
      });
      (D.value || n.resizeMode === "fixed-anchor") && (g = fn(g, e), g = Ne(g), n.resizeMode === "fixed-anchor" && (g = vn(l, g, e))), Ce(g);
      const z = ke(g, l);
      if (!z || $i(z, l)) return;
      const T = w(z);
      s("resize", r(T));
    }, Ho = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Fo = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Lt = (e) => Fo.has(e), ko = (e) => Lt(e) ? "group" : "separator", Wo = (e) => Lt(e) ? "two-axis resize handle" : void 0, Go = (e) => `Resize ${Ho[e]}`, $o = (e) => {
      if (!Lt(e))
        return e === "ml" || e === "mr" ? "vertical" : "horizontal";
    }, xe = (e) => e === "ml" || e === "mr", Cn = (e) => {
      if (!Lt(e))
        return y(xe(e) ? h.value.width : h.value.height);
    }, Vo = (e) => {
      if (!Lt(e))
        return y(xe(e) ? n.minWidth : n.minHeight);
    }, Ko = (e) => {
      if (Lt(e)) return;
      const i = xe(e) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const f = y(i);
      return Number.isFinite(f) ? f : void 0;
    }, Yo = (e) => {
      const i = Cn(e);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, Xo = (e) => {
      if (n.keyboardEnabled)
        return Lt(e) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : xe(e) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, Uo = (e) => {
      e.target === u.value && n.keyboardEnabled && !n.disabled && !n.initRect && P(!0);
    }, _o = [
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
    ].join(","), qo = (e) => {
      const i = e.target, f = u.value;
      if (!(i instanceof Element) || !f || i === f || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return e.key !== "Escape";
      const l = i.closest(_o);
      return l !== null && l !== f && f.contains(l);
    }, Zo = di(
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
        move: Bo,
        resize: Lo,
        deactivate: On,
        cancel: (e) => ne(e)
      }
    ), Jo = (e) => {
      qo(e) || Zo.handleKeyDown(e);
    }, Qo = (e) => {
      var g;
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(e.key) || ((g = n.canRotate) == null ? void 0 : g.call(n, r(h.value))) === !1) return;
      e.preventDefault(), e.stopPropagation(), C();
      const i = R.value, f = fo(n.keyboardStep) * (e.shiftKey ? 10 : 1), l = e.key === "Home" ? 0 : i + (e.key === "ArrowLeft" ? -f : f), m = oo(l, n.rotationSnapAngles ?? [], n.rotationSnapThreshold);
      s("rotate-start", e, i);
      const p = M(cn(i, m));
      s("rotate-stop", e, i, p);
    }, Ve = (e) => H.value ? e / 100 * c.parentWidth : e, Ke = (e) => H.value ? e / 100 * c.parentHeight : e, jo = ut(() => {
      const e = Ve(y(h.value.left)), i = Ke(y(h.value.top)), f = {
        left: `${-e}px`,
        top: `${-i}px`,
        width: `${c.parentWidth}px`,
        height: `${c.parentHeight}px`
      }, l = D.value;
      if (l) {
        const m = q(), p = Vt(
          n.transformOrigin,
          y(h.value.width) * m.x,
          y(h.value.height) * m.y
        );
        f.transform = `rotate(${-l}deg)`, f.transformOrigin = `${p.x + e}px ${p.y + i}px`;
      }
      return f;
    }), ti = (e) => ({
      left: `${Ve(e)}px`,
      top: "0px",
      height: `${c.parentHeight}px`,
      borderColor: n.theme
    }), ei = (e) => ({
      top: `${Ke(e)}px`,
      left: "0px",
      width: `${c.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => r(h.value),
      setPosition: (e, i) => w({ ...h.value, left: e, top: i }),
      setSize: (e, i) => w({ ...h.value, width: e, height: i }),
      reset: () => w(r(b)),
      activate: () => P(!0),
      deactivate: On,
      cancelInteraction: (e = null) => ne(e)
    }), ai(() => {
      Ge(), $e(), typeof window < "u" && window.removeEventListener("resize", C), U == null || U.unregisterMember(At), Fe();
    }), (e, i) => (Wt(), Gt("div", {
      ref_key: "movableRef",
      ref: u,
      class: Xn(["auto-draggable", {
        "select-none": t.disabledUserSelect,
        "is-disabled": t.disabled,
        "is-active": c.active,
        "is-dragging": c.isDragging,
        "is-resizing": c.isResizing,
        "is-rotating": c.isRotating,
        "is-readonly": t.initRect
      }]),
      style: $t(G.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (f) => En(f, null)),
      onDblclick: i[2] || (i[2] = (f) => s("dblclick", f)),
      onFocus: Uo,
      onKeydown: Jo
    }, [
      Me("div", {
        class: "movable-box-guides-layer",
        style: $t(jo.value),
        "aria-hidden": "true"
      }, [
        (Wt(!0), Gt(Ue, null, _e(Un(gn).vertical, (f, l) => (Wt(), Gt("div", {
          key: `vertical-${l}`,
          class: "movable-box-guide movable-box-guide--vertical",
          style: $t(ti(f))
        }, null, 4))), 128)),
        (Wt(!0), Gt(Ue, null, _e(Un(gn).horizontal, (f, l) => (Wt(), Gt("div", {
          key: `horizontal-${l}`,
          class: "movable-box-guide movable-box-guide--horizontal",
          style: $t(ei(f))
        }, null, 4))), 128))
      ], 4),
      qe(Me("div", {
        class: "rotation-handle-connector",
        style: $t(x.value),
        "aria-hidden": "true"
      }, null, 4), [
        [Ze, c.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      qe(Me("div", {
        class: "rotation-handle",
        style: $t(x.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": D.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${D.value} degrees`,
        "aria-keyshortcuts": t.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: _n(Eo, ["stop", "prevent"]),
        onKeydown: Qo
      }, [...i[3] || (i[3] = [
        Me("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, Ui), [
        [Ze, c.active && t.rotatable && !t.disabled && !t.initRect]
      ]),
      (Wt(!0), Gt(Ue, null, _e(t.handles, (f) => qe((Wt(), Gt("div", {
        key: f,
        class: Xn(["handle", `handle-${f}`]),
        style: $t(V.value),
        role: ko(f),
        "aria-roledescription": Wo(f),
        "aria-orientation": $o(f),
        "aria-label": Go(f),
        "aria-valuenow": Cn(f),
        "aria-valuemin": Vo(f),
        "aria-valuemax": Ko(f),
        "aria-valuetext": Yo(f),
        "aria-keyshortcuts": Xo(f),
        tabindex: t.keyboardEnabled ? 0 : void 0,
        onPointerdown: _n((l) => En(l, f), ["stop", "prevent"]),
        onFocus: (l) => d.value = f,
        onBlur: i[0] || (i[0] = (l) => d.value = null)
      }, null, 46, _i)), [
        [Ze, c.active && B.value && !t.disabled && We(f)]
      ])), 128)),
      co(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Ji = (t, o) => {
  const a = t.__vccOpts || t;
  for (const [n, s] of o)
    a[n] = s;
  return a;
}, Qi = /* @__PURE__ */ Ji(Zi, [["__scopeId", "data-v-03199824"]]), ji = Ee({
  name: "MovableGroup"
}), tr = /* @__PURE__ */ Ee({
  ...ji,
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
    const n = t, s = a, r = /* @__PURE__ */ new Map(), u = yt([]), h = yt(null), R = ut(() => n.selected !== void 0), b = ut({
      get: () => R.value ? n.selected ?? [] : u.value,
      set: (x) => {
        u.value = x, s("update:selected", x);
      }
    });
    Rt(
      () => n.selected,
      (x) => {
        x !== void 0 && (u.value = [...x]);
      },
      { immediate: !0 }
    );
    const d = (x) => Zt(x), v = (x, w, M) => ({
      ...x,
      left: y(x.left) + w,
      top: y(x.top) + M
    }), c = (x) => x.reduce(
      (w, M) => ({
        minLeft: Math.min(w.minLeft, M.left),
        minTop: Math.min(w.minTop, M.top),
        maxRight: Math.max(w.maxRight, M.left + M.width),
        maxBottom: Math.max(w.maxBottom, M.top + M.height)
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), B = (x, w, M) => {
      const P = c(x);
      return {
        left: Math.min(
          Math.max(w.left, M.minLeft - P.minLeft),
          M.maxRight - P.maxRight
        ),
        top: Math.min(
          Math.max(w.top, M.minTop - P.minTop),
          M.maxBottom - P.maxBottom
        )
      };
    }, H = (x) => {
      const w = [];
      for (const [M, P] of x) {
        const C = r.get(M);
        C && w.push({ id: M, rect: d(C.getRect()), startRect: d(P) });
      }
      return w;
    }, D = (x) => x.map(({ id: w, rect: M }) => ({ id: w, rect: M })), A = (x, w, M) => {
      if (n.groupCollision !== "all") return M;
      let P = 1;
      for (const C of x.startRects.keys()) {
        if (C === w) continue;
        const k = r.get(C);
        if (!k) continue;
        const L = k.sharedDeltaProgress(x.startRects.get(C), M);
        L < P && (P = L);
      }
      return { left: M.left * P, top: M.top * P };
    }, G = (x) => {
      const w = x.filter((P) => r.has(P)), M = b.value;
      M.length === w.length && M.every((P, C) => P === w[C]) || (b.value = w);
    };
    return si(bo, {
      registerMember: (x, w) => {
        r.set(x, w);
      },
      unregisterMember: (x) => {
        var w;
        if (r.delete(x), ((w = h.value) == null ? void 0 : w.leaderId) === x) {
          h.value = null;
          return;
        }
        h.value && (h.value.startRects.delete(x), h.value.startVisuals.delete(x)), b.value.includes(x) && G(b.value.filter((M) => M !== x));
      },
      hasMember: (x) => x !== void 0 && r.has(x),
      beginDrag: (x, w) => {
        if (h.value && h.value.leaderId !== x)
          return h.value.startRects.has(x) ? "blocked" : "solo";
        if (!r.has(x)) return "solo";
        const M = b.value.includes(x) ? [...b.value] : [x];
        b.value.includes(x) || G(M);
        const P = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map();
        for (const L of M) {
          const $ = r.get(L);
          $ && (P.set(L, d($.getRect())), C.set(L, { ...$.getVisualRect() }));
        }
        h.value = { leaderId: x, startRects: P, startVisuals: C };
        const k = [];
        for (const [L, $] of P) k.push({ id: L, rect: d($) });
        return s("move-start", { leaderId: x, source: w, rects: k }), "group";
      },
      constrainPosition: (x, w) => {
        var $, it;
        const M = h.value, P = M == null ? void 0 : M.startRects.get(x);
        if (!M || M.leaderId !== x || !P || !r.has(x)) return w;
        const C = y(w.left) - y(P.left), k = y(w.top) - y(P.top), L = ($ = r.get(x)) == null ? void 0 : $.getAreaEdges();
        if (n.sharedBounds) {
          let K = { left: C, top: k };
          L && (K = B([...M.startVisuals.values()], K, L)), K = A(M, x, K);
          for (const [q, O] of M.startRects)
            q !== x && ((it = r.get(q)) == null || it.translateTo(v(O, K.left, K.top)));
          return v(P, K.left, K.top);
        }
        for (const [K, q] of M.startRects) {
          if (K === x) continue;
          const O = r.get(K);
          if (!O) continue;
          const J = M.startVisuals.get(K), ot = n.groupCollision === "all" ? O.sharedDeltaProgress(q, { left: C, top: k }) : 1, N = v(q, C * ot, k * ot), Q = O.getAreaEdges();
          if (Q && J) {
            const et = J.left - y(q.left), at = J.top - y(q.top), pt = Q.minLeft - et, Ct = Math.max(pt, Q.maxRight - et - J.width), st = Q.minTop - at, Nt = Math.max(st, Q.maxBottom - at - J.height);
            N.left = Et(y(N.left), pt, Ct), N.top = Et(y(N.top), st, Nt);
          }
          O.translateTo(N);
        }
        return w;
      },
      notifyMoved: (x, w) => {
        const M = h.value;
        if (!M || M.leaderId !== x) return;
        const P = D(H(M.startRects)).map(
          (C) => C.id === x ? { id: x, rect: d(w) } : C
        );
        s("move", { leaderId: x, rects: P });
      },
      endDrag: (x, w) => {
        const M = h.value;
        if (!M || M.leaderId !== x) return;
        const P = H(M.startRects);
        h.value = null, s("move-stop", { leaderId: x, source: w, rects: P });
      },
      cancelDrag: (x, w) => {
        var C;
        const M = h.value;
        if (!M || M.leaderId !== x) return;
        for (const [k, L] of M.startRects)
          k !== x && ((C = r.get(k)) == null || C.translateTo(d(L)));
        const P = H(M.startRects);
        h.value = null, s("move-cancel", { leaderId: x, source: w, rects: P });
      },
      abortDrag: (x) => {
        var w;
        ((w = h.value) == null ? void 0 : w.leaderId) === x && (h.value = null);
      }
    }), o({
      getSelected: () => [...b.value],
      select: (x) => G(x ?? [...r.keys()]),
      getMemberRects: () => [...r.entries()].map(([x, w]) => ({ id: x, rect: d(w.getRect()) }))
    }), (x, w) => co(x.$slots, "default");
  }
}), Mo = "VueMovableBox", er = "3.4.0", nr = (t) => {
  t.component(Mo, Qi), t.component("MovableGroup", tr);
}, rr = {
  name: Mo,
  version: er,
  install: nr
};
export {
  Qi as MovableBox,
  tr as MovableGroup,
  rr as default,
  nr as install,
  Mo as name,
  er as version
};
