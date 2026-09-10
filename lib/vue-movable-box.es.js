import { computed as ft, ref as vt, defineComponent as Pe, reactive as $o, watch as Gt, inject as Vo, getCurrentInstance as Ko, onMounted as Yo, onUnmounted as Xo, openBlock as Ft, createElementBlock as Ht, normalizeStyle as Wt, normalizeClass as Fn, createElementVNode as Me, Fragment as Ve, renderList as Ke, unref as Hn, withDirectives as Ye, vShow as Xe, withModifiers as Wn, renderSlot as jn, provide as Uo } from "vue";
import _o from "decimal.js";
const qo = {
  ArrowUp: "top",
  ArrowDown: "bottom",
  ArrowLeft: "left",
  ArrowRight: "right"
}, Zo = {
  tl: ["top", "bottom", "left", "right"],
  tm: ["top", "bottom"],
  tr: ["top", "bottom", "left", "right"],
  ml: ["left", "right"],
  mr: ["left", "right"],
  bl: ["top", "bottom", "left", "right"],
  bm: ["top", "bottom"],
  br: ["top", "bottom", "left", "right"]
}, Jo = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
}, to = (e) => Number.isFinite(e) && e > 0 ? e : 1;
function Qo(e, o) {
  return { handleKeyDown: (n) => {
    const r = e(), a = r.interacting;
    if (!a && (!r.enabled || r.disabled || !r.active)) return;
    if (n.key === "Escape") {
      n.preventDefault(), a ? o.cancel(n) : o.deactivate();
      return;
    }
    if (a || r.readOnly) return;
    const d = qo[n.key];
    if (!d) return;
    const h = to(r.step);
    if (r.focusedHandle && r.resizeDirections.includes(r.focusedHandle)) {
      if (!Zo[r.focusedHandle].includes(d)) return;
      n.preventDefault(), o.resize(
        r.focusedHandle,
        n.shiftKey ? Jo[d] : d,
        h
      );
      return;
    }
    if (n.shiftKey) {
      const z = r.resizeDirections.includes("br") ? "br" : r.resizeDirections[0];
      if (!z) return;
      n.preventDefault(), o.resize(z, d, h);
      return;
    }
    r.dragDirections.includes(d) && (n.preventDefault(), o.move(d, h));
  } };
}
const we = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const o = Number(e);
  return Number.isFinite(o) ? o : null;
}, Gn = (e) => {
  const o = we(e.left), s = we(e.top), n = we(e.width), r = we(e.height);
  return o === null || s === null || n === null || r === null || n < 0 || r < 0 ? null : { left: o, top: s, width: n, height: r };
};
function jo(e, o) {
  const s = Number.isFinite(o) && o > 0 ? o : 20;
  return Math.round(e / s) * s;
}
const $n = (e, o, s) => o.distance > s ? e : !e || o.distance < e.distance ? o : e, ti = ["alignment", "spacing"], Vn = (e, o, s, n) => {
  for (const r of s) {
    if (r === "alignment") {
      const d = n.alignment();
      if (d && d.distance <= o)
        return {
          candidate: d,
          spacing: null,
          guides: [d.guide],
          spacingInfo: null,
          value: d.value
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
          axis: e,
          gap: a.gap,
          targetIds: a.targetIds,
          guides: a.guides
        },
        value: a.value
      };
  }
  return { candidate: null, spacing: null, guides: [], spacingInfo: null, value: null };
}, Kn = (e, o, s, n, r) => {
  const a = (f) => e === "horizontal" ? f.left : f.top, d = (f) => e === "horizontal" ? f.left + f.width : f.top + f.height, h = [], z = [];
  for (const f of r)
    d(f.rect) <= o && h.push(f), a(f.rect) >= o + s && z.push(f);
  let M = null;
  for (const f of h)
    for (const x of z) {
      const l = a(x.rect) - d(f.rect) - s;
      if (l < 0) continue;
      const E = l / 2, k = d(f.rect) + E, S = Math.abs(o - k);
      S > n || (!M || S < M.distance) && (M = {
        distance: S,
        value: k,
        gap: E,
        guides: [d(f.rect), a(x.rect)],
        targetIds: [f.id, x.id]
      });
    }
  return M;
};
function ei(e, o, s = 10, n = { horizontal: !0, vertical: !0 }, r = {}) {
  const a = Math.max(0, Number.isFinite(s) ? s : 10), d = e.left + e.width, h = e.top + e.height, z = e.left + e.width / 2, M = e.top + e.height / 2, f = r.priority && r.priority.length > 0 ? r.priority : ti, x = f.includes("alignment"), l = f.includes("spacing"), E = (P, X) => r.filter ? r.filter(P, X) !== !1 : !0, k = /* @__PURE__ */ new Map(), S = (P) => {
    let X = k.get(P);
    return X || (X = {
      horizontal: n.horizontal && E(P, "horizontal"),
      vertical: n.vertical && E(P, "vertical")
    }, k.set(P, X)), X;
  };
  let A = null;
  const at = () => {
    let P = null, X = null;
    for (const Z of o) {
      const N = Gn(Z);
      if (!N) continue;
      const J = S(Z);
      if (!J.horizontal && !J.vertical) continue;
      const et = N.left + N.width, rt = N.top + N.height, It = N.left + N.width / 2, Et = N.top + N.height / 2, ct = Z.id;
      if (J.horizontal) {
        const Zt = [
          {
            distance: Math.abs(e.left - N.left),
            value: N.left,
            guide: N.left,
            point: "left",
            targetId: ct
          },
          {
            distance: Math.abs(d - et),
            value: et - e.width,
            guide: et,
            point: "right",
            targetId: ct
          },
          {
            distance: Math.abs(e.left - et),
            value: et,
            guide: et,
            point: "left",
            targetId: ct
          },
          {
            distance: Math.abs(d - N.left),
            value: N.left - e.width,
            guide: N.left,
            point: "right",
            targetId: ct
          },
          {
            distance: Math.abs(z - It),
            value: It - e.width / 2,
            guide: It,
            point: "center-x",
            targetId: ct
          }
        ];
        for (const Rt of Zt) P = $n(P, Rt, a);
      }
      if (J.vertical) {
        const Zt = [
          {
            distance: Math.abs(e.top - N.top),
            value: N.top,
            guide: N.top,
            point: "top",
            targetId: ct
          },
          {
            distance: Math.abs(h - rt),
            value: rt - e.height,
            guide: rt,
            point: "bottom",
            targetId: ct
          },
          {
            distance: Math.abs(e.top - rt),
            value: rt,
            guide: rt,
            point: "top",
            targetId: ct
          },
          {
            distance: Math.abs(h - N.top),
            value: N.top - e.height,
            guide: N.top,
            point: "bottom",
            targetId: ct
          },
          {
            distance: Math.abs(M - Et),
            value: Et - e.height / 2,
            guide: Et,
            point: "center-y",
            targetId: ct
          }
        ];
        for (const Rt of Zt) X = $n(X, Rt, a);
      }
    }
    return { x: P, y: X };
  }, v = (P) => x ? (A || (A = at()), P === "horizontal" ? A.x : A.y) : null, I = [], y = [];
  let O = !1;
  const F = () => {
    for (const P of o) {
      const X = Gn(P);
      if (!X) continue;
      const Z = S(P);
      Z.horizontal && I.push({ rect: X, id: P.id }), Z.vertical && y.push({ rect: X, id: P.id });
    }
    O = !0;
  }, $ = (P) => l ? (O || F(), P === "horizontal" ? Kn("horizontal", e.left, e.width, a, I) : Kn("vertical", e.top, e.height, a, y)) : null, L = n.horizontal ? Vn("horizontal", a, f, {
    alignment: () => v("horizontal"),
    spacing: () => $("horizontal")
  }) : null, B = n.vertical ? Vn("vertical", a, f, {
    alignment: () => v("vertical"),
    spacing: () => $("vertical")
  }) : null, U = (L == null ? void 0 : L.candidate) ?? null, K = (B == null ? void 0 : B.candidate) ?? null, _ = [U == null ? void 0 : U.point, K == null ? void 0 : K.point].filter(
    (P) => !!P
  ), q = [L == null ? void 0 : L.spacingInfo, B == null ? void 0 : B.spacingInfo].filter(
    (P) => !!P
  );
  return {
    left: (L == null ? void 0 : L.value) ?? e.left,
    top: (B == null ? void 0 : B.value) ?? e.top,
    snapped: _.length > 0 || q.length > 0,
    snapPoint: _[0],
    points: _,
    targetId: (U == null ? void 0 : U.targetId) ?? (K == null ? void 0 : K.targetId),
    targetIds: { horizontal: U == null ? void 0 : U.targetId, vertical: K == null ? void 0 : K.targetId },
    guides: {
      vertical: (L == null ? void 0 : L.guides) ?? [],
      horizontal: (B == null ? void 0 : B.guides) ?? []
    },
    spacing: q
  };
}
function ni(e) {
  const o = (r) => {
    const a = e();
    return a.snapToGrid ? jo(r, a.gridSize) : r;
  }, s = (r, a) => ({
    left: o(r),
    top: o(a)
  }), n = ft(() => {
    const r = e();
    return r.snapToGrid ? {
      size: Number.isFinite(r.gridSize) && r.gridSize > 0 ? r.gridSize : 20,
      color: "rgba(64, 158, 255, 0.3)"
    } : null;
  });
  return { snapValue: o, snapPosition: s, gridInfo: n };
}
const Ue = () => ({ vertical: [], horizontal: [] });
function oi(e) {
  const o = vt(Ue()), s = vt(null);
  return { guides: o, lastSnapResult: s, resolveSnap: (d, h, z) => {
    const M = e(), f = M.enabled ? ei(d, h, M.threshold, z, {
      filter: M.filter,
      priority: M.priority
    }) : {
      ...d,
      snapped: !1,
      points: [],
      targetIds: {},
      guides: Ue(),
      spacing: []
    };
    return o.value = f.guides, s.value = f.snapped ? f : null, f;
  }, clearGuides: () => {
    o.value = Ue(), s.value = null;
  }, setGuides: (d) => {
    o.value = d;
  } };
}
const Ie = (e) => {
  if (typeof e == "string" && e.trim() === "") return null;
  const o = Number(e);
  return Number.isFinite(o) ? o : null;
}, eo = (e) => {
  const o = Ie(e.left), s = Ie(e.top), n = Ie(e.width), r = Ie(e.height);
  return o === null || s === null || n === null || r === null || n < 0 || r < 0 ? null : { left: o, top: s, width: n, height: r };
}, Yn = (e, o, s, n) => {
  const r = s - o;
  if (r === 0) return o < n ? e : null;
  const a = (n - o) / r;
  return r > 0 ? { ...e, exit: Math.min(e.exit, a) } : { ...e, entry: Math.max(e.entry, a) };
}, Xn = (e, o, s, n) => {
  const r = s - o;
  if (r === 0) return o > n ? e : null;
  const a = (n - o) / r;
  return r > 0 ? { ...e, entry: Math.max(e.entry, a) } : { ...e, exit: Math.min(e.exit, a) };
}, ii = (e, o, s) => {
  let n = { entry: 0, exit: 1 };
  if (n = Yn(n, e.left, o.left, s.left + s.width), !n || (n = Xn(
    n,
    e.left + e.width,
    o.left + o.width,
    s.left
  ), !n) || (n = Yn(n, e.top, o.top, s.top + s.height), !n) || (n = Xn(
    n,
    e.top + e.height,
    o.top + o.height,
    s.top
  ), !n)) return null;
  const r = Math.max(0, n.entry), a = Math.min(1, n.exit);
  return r < a && a > 0 && r < 1 ? { entry: r, exit: a } : null;
};
function Se(e, o, s) {
  let n = null;
  for (const r of s) {
    const a = eo(r);
    if (!a) continue;
    const d = ii(e, o, a);
    d && (!n || d.entry < n.entry) && (n = d);
  }
  return n;
}
function ai(e, o) {
  const s = Math.min(e.left + e.width, o.left + o.width) - Math.max(e.left, o.left), n = Math.min(e.top + e.height, o.top + o.height) - Math.max(e.top, o.top);
  if (s <= 0 || n <= 0) return { colliding: !1, overlapArea: 0 };
  const r = e.left + e.width / 2, a = e.top + e.height / 2, d = o.left + o.width / 2, h = o.top + o.height / 2, z = r - d, M = a - h;
  return {
    colliding: !0,
    direction: s <= n ? z > 0 ? "right" : "left" : M > 0 ? "bottom" : "top",
    overlap: Math.min(s, n),
    overlapArea: s * n
  };
}
function _e(e, o, s) {
  const n = [];
  for (const r of o) {
    const a = eo(r);
    if (!a) continue;
    const d = ai(e, a);
    d.colliding && n.push({ ...d, targetId: r.id });
  }
  return n;
}
function ri(e) {
  let o = null;
  for (const s of e)
    (!o || (s.overlapArea ?? 0) > (o.overlapArea ?? 0)) && (o = s);
  return o;
}
const no = (e) => e.reduce((o, s) => o + (s.overlapArea ?? 0), 0), tt = (e) => {
  const o = typeof e == "number" ? e : Number(e ?? 0);
  if (!Number.isFinite(o)) return 0;
  const s = (o % 360 + 360) % 360;
  return s > 180 ? s - 360 : s;
}, _t = (e) => e * Math.PI / 180, bt = (e) => Math.round(e * 1e9) / 1e9, si = (e, o) => {
  const s = tt(o);
  if (s === 0) return { ...e };
  const n = _t(s), r = Math.cos(n), a = Math.sin(n), d = Math.abs(e.width * r) + Math.abs(e.height * a), h = Math.abs(e.width * a) + Math.abs(e.height * r);
  return {
    left: bt(e.left + (e.width - d) / 2),
    top: bt(e.top + (e.height - h) / 2),
    width: bt(d),
    height: bt(h)
  };
}, li = /* @__PURE__ */ new Set(["left", "center", "right", "top", "bottom"]), oo = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:px|%)$/, io = /^[+-]?(?:0+(?:\.0*)?|\.0+)$/, Un = /* @__PURE__ */ new Set(["left", "right"]), qe = /* @__PURE__ */ new Set(["top", "bottom"]), Ze = (e) => oo.test(e) || io.test(e), ci = (e, o) => Ze(e) || Un.has(e) ? Ze(o) || o === "center" || qe.has(o) : qe.has(e) ? o === "center" || Un.has(o) : e === "center", ao = (e) => {
  if (!e) return "center";
  const o = e.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return o.length === 0 || o.length > 2 || !o.every(
    (n) => li.has(n) || oo.test(n) || io.test(n)
  ) || o.length === 2 && !ci(o[0], o[1]) ? "center" : o.join(" ");
}, re = (e, o, s) => {
  const n = { x: o / 2, y: s / 2 }, a = ao(e).split(" ");
  let d = null, h = null;
  const z = (M) => {
    d === null ? d = M : h === null && (h = M);
  };
  for (const M of a)
    if (M === "left") d = 0;
    else if (M === "right") d = o;
    else if (M === "top") h = 0;
    else if (M === "bottom") h = s;
    else if (M === "center") z(d === null ? o / 2 : s / 2);
    else if (M.endsWith("%")) {
      const f = Number(M.slice(0, -1));
      if (!Number.isFinite(f)) return n;
      z(f / 100 * (d === null ? o : s));
    } else {
      const f = Number.parseFloat(M);
      if (!Number.isFinite(f)) return n;
      z(f);
    }
  return { x: d ?? o / 2, y: h ?? s / 2 };
}, ui = (e, o, s) => {
  const n = si(e, o), r = tt(o);
  if (r === 0) return n;
  const a = _t(r), d = Math.cos(a), h = Math.sin(a), z = e.width / 2 - s.x, M = e.height / 2 - s.y, f = bt(z * d - M * h - z), x = bt(z * h + M * d - M);
  return {
    left: bt(n.left + f),
    top: bt(n.top + x),
    width: n.width,
    height: n.height
  };
}, _n = (e, o, s) => {
  const n = tt(s);
  if (n === 0) return { x: e, y: o };
  const r = _t(n), a = Math.cos(r), d = Math.sin(r);
  return {
    x: bt(e * a + o * d),
    y: bt(-e * d + o * a)
  };
}, dt = 1e-7, Te = (e) => Math.round(e * 1e9) / 1e9, fi = (e) => ({ x: Te(e.x), y: Te(e.y) }), ce = (e) => {
  const o = tt(e.angle), s = _t(o), n = Math.cos(s), r = Math.sin(s), a = e.origin.x, d = e.origin.y;
  return [
    { x: 0, y: 0 },
    { x: e.width, y: 0 },
    { x: e.width, y: e.height },
    { x: 0, y: e.height }
  ].map((z) => {
    const M = z.x - a, f = z.y - d;
    return fi({
      x: e.left + a + M * n - f * r,
      y: e.top + d + M * r + f * n
    });
  });
}, De = (e) => {
  if (tt(e.angle) === 0)
    return { left: e.left, top: e.top, width: e.width, height: e.height };
  const o = ce(e), s = o.map((d) => d.x), n = o.map((d) => d.y), r = Math.min(...s), a = Math.min(...n);
  return {
    left: r,
    top: a,
    width: Te(Math.max(...s) - r),
    height: Te(Math.max(...n) - a)
  };
}, je = (e, o) => e.x * o.y - e.y * o.x, qn = (e, o) => {
  let s = 1 / 0, n = -1 / 0;
  for (const r of e) {
    const a = r.x * o.x + r.y * o.y;
    a < s && (s = a), a > n && (n = a);
  }
  return { min: s, max: n };
}, Zn = (e) => {
  const o = [];
  for (let s = 0; s < e.length; s += 1) {
    const n = e[(s + 1) % e.length], r = n.x - e[s].x, a = n.y - e[s].y, d = Math.hypot(r, a);
    d < dt || o.push({ x: -a / d, y: r / d });
  }
  return o;
}, Jn = (e) => ({
  x: e.reduce((o, s) => o + s.x, 0) / e.length,
  y: e.reduce((o, s) => o + s.y, 0) / e.length
}), di = (e, o) => {
  let s = e;
  for (let n = 0; n < o.length && s.length > 0; n += 1) {
    const r = o[n], a = o[(n + 1) % o.length], d = { x: a.x - r.x, y: a.y - r.y }, h = (x) => je(d, { x: x.x - r.x, y: x.y - r.y }), z = s;
    s = [];
    let M = z[z.length - 1], f = h(M);
    for (const x of z) {
      const l = h(x);
      if (l >= 0) {
        if (f < 0) {
          const E = f / (f - l);
          s.push({
            x: M.x + (x.x - M.x) * E,
            y: M.y + (x.y - M.y) * E
          });
        }
        s.push(x);
      } else if (f >= 0) {
        const E = f / (f - l);
        s.push({
          x: M.x + (x.x - M.x) * E,
          y: M.y + (x.y - M.y) * E
        });
      }
      M = x, f = l;
    }
  }
  return s;
}, hi = (e) => {
  if (e.length < 3) return 0;
  let o = 0;
  for (let s = 0; s < e.length; s += 1) {
    const n = e[(s + 1) % e.length];
    o += e[s].x * n.y - n.x * e[s].y;
  }
  return Math.abs(o) / 2;
}, qt = (e, o) => {
  const s = ce(e), n = ce(o);
  let r = 1 / 0, a = null;
  const d = Jn(s), h = Jn(n), z = [...Zn(n), ...Zn(s)];
  for (const f of z) {
    const x = qn(s, f), l = qn(n, f), E = Math.min(x.max, l.max) - Math.max(x.min, l.min);
    if (E <= dt)
      return { overlapping: !1, depth: 0, normal: null, overlapArea: 0 };
    const k = E < r - dt, S = !k && E <= r + dt && (a === null || Math.abs(f.x) > Math.abs(a.x));
    if (k || S) {
      r = Math.min(r, E);
      const A = (d.x - h.x) * f.x + (d.y - h.y) * f.y >= 0 ? 1 : -1;
      a = { x: f.x * A, y: f.y * A };
    }
  }
  const M = di(s, n);
  return {
    overlapping: !0,
    depth: r,
    normal: a ?? { x: 0, y: 0 },
    overlapArea: hi(M)
  };
}, pi = (e) => {
  const o = Array.from(
    new Map(e.map((a) => [`${a.x},${a.y}`, a])).values()
  ).sort((a, d) => a.x === d.x ? a.y - d.y : a.x - d.x);
  if (o.length <= 2) return o;
  const s = (a, d, h) => (d.x - a.x) * (h.y - a.y) - (d.y - a.y) * (h.x - a.x), n = [];
  for (const a of o) {
    for (; n.length >= 2 && s(n[n.length - 2], n[n.length - 1], a) <= 0; )
      n.pop();
    n.push(a);
  }
  const r = [];
  for (let a = o.length - 1; a >= 0; a -= 1) {
    const d = o[a];
    for (; r.length >= 2 && s(r[r.length - 2], r[r.length - 1], d) <= 0; )
      r.pop();
    r.push(d);
  }
  return n.pop(), r.pop(), [...n, ...r];
}, gi = (e, o) => {
  const s = ce(e), n = ce(o), r = [];
  for (const a of n)
    for (const d of s)
      r.push({ x: a.x - d.x, y: a.y - d.y });
  return pi(r);
}, mi = (e, o) => {
  if (o.length < 3) return null;
  let s = 0, n = 1;
  for (let r = 0; r < o.length; r += 1) {
    const a = o[r], d = o[(r + 1) % o.length], h = { x: d.x - a.x, y: d.y - a.y }, z = je(h, e), M = je(h, a);
    if (Math.abs(z) < dt) {
      if (M > -dt) return null;
      continue;
    }
    const f = M / z;
    z > 0 ? s = Math.max(s, f) : n = Math.min(n, f);
  }
  return s < n - dt && n > dt && s < 1 - dt ? { entry: s, exit: n } : null;
}, tn = (e, o, s) => {
  if (o.x === 0 && o.y === 0) return null;
  let n = null;
  const r = De(e);
  for (const a of s) {
    if (a.width <= 0 || a.height <= 0) continue;
    const d = De(a), h = Math.min(r.left + r.width + Math.max(o.x, 0), d.left + d.width) - Math.max(r.left + Math.min(o.x, 0), d.left), z = Math.min(r.top + r.height + Math.max(o.y, 0), d.top + d.height) - Math.max(r.top + Math.min(o.y, 0), d.top);
    if (h <= dt || z <= dt) continue;
    const M = gi(e, a), f = mi(o, M);
    f && (!n || f.entry < n.interval.entry) && (n = { interval: f, target: a, targetId: a.id });
  }
  return n;
}, Re = (e, o) => ({
  ...e,
  left: e.left + o.x,
  top: e.top + o.y
}), en = (e, o, s) => ({
  left: e.left + (o.left - e.left) * s,
  top: e.top + (o.top - e.top) * s,
  width: e.width + (o.width - e.width) * s,
  height: e.height + (o.height - e.height) * s,
  angle: e.angle + (o.angle - e.angle) * s,
  origin: {
    x: e.origin.x + (o.origin.x - e.origin.x) * s,
    y: e.origin.y + (o.origin.y - e.origin.y) * s
  }
}), ro = (e, o) => e.width === o.width && e.height === o.height && tt(e.angle) === tt(o.angle) && e.origin.x === o.origin.x && e.origin.y === o.origin.y, vi = (e, o, s, n = {}) => {
  const r = Math.max(1, n.steps ?? 16), a = n.refinements ?? 20;
  if (ro(e, o)) {
    const f = tn(e, { x: o.left - e.left, y: o.top - e.top }, s);
    return f ? Math.max(0, f.interval.entry - dt) : 1;
  }
  const d = (f) => {
    const x = en(e, o, f);
    return s.some((l) => qt(x, l).overlapping);
  };
  let h = 0, z = 1, M = !1;
  for (let f = 1; f <= r; f += 1) {
    const x = f / r;
    if (d(x)) {
      z = x, M = !0;
      break;
    }
    h = x;
  }
  if (!M) return 1;
  for (let f = 0; f < a; f += 1) {
    const x = (h + z) / 2;
    d(x) ? z = x : h = x;
  }
  return h;
}, so = (e, o, s) => ({
  left: e.left + (o.left - e.left) * s,
  top: e.top + (o.top - e.top) * s,
  width: e.width + (o.width - e.width) * s,
  height: e.height + (o.height - e.height) * s
}), bi = (e, o) => e.left === o.left && e.top === o.top && e.width === o.width && e.height === o.height, Je = (e, o, s, n) => {
  if (!Se(e, o, s))
    return { rect: o, progress: 1 };
  let r = 0, a = 1, d = e;
  for (let h = 0; h < 24; h += 1) {
    const z = (r + a) / 2, M = n(so(e, o, z));
    Se(e, M, s) ? a = z : (d = M, r = z);
  }
  return { rect: d, progress: r };
}, yi = (e) => Math.abs(e.x) >= Math.abs(e.y) ? e.x > 0 ? "right" : "left" : e.y > 0 ? "bottom" : "top", xi = (e) => ({
  x: Math.round(e.x * 1e4) / 1e4,
  y: Math.round(e.y * 1e4) / 1e4
}), Mi = (e) => ({
  results: e,
  dominant: ri(e),
  totalOverlapArea: no(e)
}), ze = (e, o) => {
  const s = /* @__PURE__ */ new Map();
  return o.forEach((n, r) => {
    if (n.width <= 0 || n.height <= 0) return;
    const a = qt(e, n);
    a.overlapping && s.set(r, a.overlapArea);
  }), s;
}, Qn = (e, o) => {
  let s = 0;
  e.forEach((r) => {
    s += r;
  });
  let n = 0;
  for (const [r, a] of o) {
    n += a;
    const d = e.get(r);
    if (d === void 0 || a > d) return !1;
  }
  return n < s;
}, wi = (e, o) => e.left === o.left && e.top === o.top && e.width === o.width && e.height === o.height;
function Ii(e) {
  const o = vt([]), s = vt(!1), n = (f) => (o.value = f, s.value = f.length > 0, Mi(f)), r = (f, x) => {
    const E = e().enabled ? _e(f, x) : [];
    return n(E);
  }, a = (f, x) => {
    if (!e().enabled) return n([]);
    const E = [];
    for (const k of x) {
      if (k.width <= 0 || k.height <= 0) continue;
      const S = qt(f, k);
      S.overlapping && E.push({
        colliding: !0,
        direction: S.normal ? yi(S.normal) : void 0,
        normal: S.normal ? xi(S.normal) : void 0,
        overlap: S.depth,
        overlapArea: S.overlapArea,
        targetId: k.id
      });
    }
    return n(E);
  }, d = (f, x, l) => {
    const E = e(), k = a(x, l);
    if (!E.enabled || E.allowOverlap)
      return { accepted: !0, rect: x, progress: 1, ...k };
    const S = ze(f, l);
    if (S.size > 0)
      return {
        accepted: Qn(S, ze(x, l)),
        rect: x,
        progress: 1,
        ...k
      };
    const A = { x: x.left - f.left, y: x.top - f.top };
    if (A.x === 0 && A.y === 0)
      return { accepted: !0, rect: x, progress: 1, ...k };
    const at = tn(f, A, l);
    if (!at)
      return { accepted: !0, rect: x, progress: 1, ...k };
    const { interval: v } = at, I = Math.min(1e-3, v.entry), y = Re(
      f,
      { x: A.x * (v.entry - I), y: A.y * (v.entry - I) }
    ), O = Re(
      f,
      {
        x: A.x * (v.entry + (v.exit - v.entry) * 1e-3),
        y: A.y * (v.entry + (v.exit - v.entry) * 1e-3)
      }
    ), F = qt(O, at.target), $ = {
      x: A.x * (1 - v.entry),
      y: A.y * (1 - v.entry)
    }, L = (N, J) => {
      const et = tn(N, J, l);
      if (!et) return Re(N, J);
      const rt = Math.min(1e-3, et.interval.entry);
      return Re(N, {
        x: J.x * (et.interval.entry - rt),
        y: J.y * (et.interval.entry - rt)
      });
    };
    let B = y;
    const U = F.normal;
    if (U) {
      const N = { x: -U.y, y: U.x }, J = N.x * $.x + N.y * $.y, et = J >= 0 ? 1 : -1;
      Math.abs(J) > 1e-9 && (B = L(B, {
        x: N.x * et * Math.abs(J),
        y: N.y * et * Math.abs(J)
      }));
    }
    const K = { x: B.left - y.left, y: B.top - y.top }, _ = $.x - K.x, q = $.y - K.y;
    _ !== 0 && Math.sign(_) === Math.sign($.x) && (B = L(B, { x: _, y: 0 })), q !== 0 && Math.sign(q) === Math.sign($.y) && (B = L(B, { x: 0, y: q }));
    const P = a(B, l), X = P.results.length > 0 ? P : a(O, l), Z = A.x * A.x + A.y * A.y > 0 ? ((B.left - f.left) * A.x + (B.top - f.top) * A.y) / (A.x * A.x + A.y * A.y) : 1;
    return {
      accepted: !wi(B, f),
      rect: B,
      progress: Math.max(0, Math.min(1, Z)),
      ...X
    };
  };
  return {
    collisions: o,
    isColliding: s,
    evaluate: r,
    evaluateOriented: a,
    resolveCandidate: (f, x, l, E = (S) => S, k = "path") => {
      const S = e(), A = r(f, l);
      if (!S.enabled || S.allowOverlap)
        return { accepted: !0, rect: f, progress: 1, ...A };
      const at = _e(x, l), v = no(at);
      if (v > 0)
        return {
          accepted: A.totalOverlapArea < v,
          rect: f,
          progress: 1,
          ...A
        };
      const I = Se(x, f, l);
      if (A.results.length === 0 && !I)
        return { accepted: !0, rect: f, progress: 1, ...A };
      let y = A;
      if (A.results.length === 0 && I) {
        const F = so(
          x,
          f,
          I.entry + (I.exit - I.entry) * 1e-3
        );
        y = n(_e(F, l));
      }
      let O = null;
      if (k === "slide") {
        const F = Je(
          x,
          { ...x, left: f.left },
          l,
          E
        ), $ = Je(
          x,
          { ...x, top: f.top },
          l,
          E
        ), L = E({
          ...f,
          left: F.rect.left,
          top: $.rect.top
        });
        Se(x, L, l) || (O = { rect: L });
      }
      return O ?? (O = Je(x, f, l, E)), {
        accepted: !bi(O.rect, x),
        rect: O.rect,
        progress: O.progress,
        ...y
      };
    },
    resolveOrientedTranslation: d,
    resolveOrientedChange: (f, x, l) => {
      const E = e(), k = a(x, l);
      if (!E.enabled || E.allowOverlap)
        return { accepted: !0, rect: x, progress: 1, ...k };
      const S = ze(f, l);
      if (S.size > 0)
        return {
          accepted: Qn(S, ze(x, l)),
          rect: x,
          progress: 1,
          ...k
        };
      if (ro(f, x))
        return d(f, x, l);
      const A = vi(f, x, l), at = en(f, x, A), v = a(at, l);
      let I = v;
      if (v.results.length === 0 && A < 1) {
        const y = en(f, x, A + (1 - A) * 1e-3);
        I = a(y, l);
      }
      return {
        accepted: A > 0,
        rect: at,
        progress: A,
        ...I
      };
    },
    clearCollisions: () => {
      o.value = [], s.value = !1;
    }
  };
}
const b = (e, o = 0) => {
  if (e == null || e === "")
    return o;
  const s = typeof e == "string" ? Number(e) : e;
  return Number.isFinite(s) ? s : o;
}, Ot = (e, o, s) => Math.min(Math.max(e, o), s), Ri = (e, o) => b(e.left) === b(o.left) && b(e.top) === b(o.top) && b(e.width) === b(o.width) && b(e.height) === b(o.height), lo = Symbol("MovableGroupContext"), zi = 2, ut = (e, o = 1) => {
  if (e == null || e === "")
    return o;
  const s = typeof e == "string" ? parseFloat(e) : e;
  return isNaN(s) ? o : s;
}, Ae = (e, o = "px") => e == null || e === "" ? "0" : `${e}${o}`;
function se(e, o, s, n) {
  e && e.addEventListener(o, s, n);
}
function le(e, o, s, n) {
  e && e.removeEventListener(o, s, n);
}
const Qe = (e, o = 1, s = zi) => {
  const n = new _o(e).toDecimalPlaces(s).toNumber();
  return ut(n, o);
}, Ut = (e) => {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Array)
    return e.map((o) => Ut(o));
  if (e instanceof Object) {
    const o = {};
    for (const s in e)
      e.hasOwnProperty(s) && (o[s] = Ut(e[s]));
    return o;
  }
  return e;
}, Ai = ["aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "tabindex"], Si = ["role", "aria-roledescription", "aria-orientation", "aria-label", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-keyshortcuts", "tabindex", "onPointerdown", "onFocus"], Ti = Pe({
  name: "VueMovableBox"
}), Di = /* @__PURE__ */ Pe({
  ...Ti,
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
    /**
     * Collision semantics: 'precise' (default since v3.2.0) resolves against true rotated
     * contours with continuous collision detection; 'aabb' keeps the pre-3.2 behavior.
     */
    collisionMode: {
      type: String,
      default: "precise"
    },
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
    var An;
    const n = e, r = s, a = (t) => Ut(t), d = vt(), h = vt(a(n.modelValue)), z = vt(tt(n.rotate)), M = a(n.modelValue), f = vt(null), x = {
      tl: { left: !0, right: !1, top: !0, bottom: !1 },
      tm: { left: !1, right: !1, top: !0, bottom: !1 },
      tr: { left: !1, right: !0, top: !0, bottom: !1 },
      ml: { left: !0, right: !1, top: !1, bottom: !1 },
      mr: { left: !1, right: !0, top: !1, bottom: !1 },
      bl: { left: !0, right: !1, top: !1, bottom: !0 },
      bm: { left: !1, right: !1, top: !1, bottom: !0 },
      br: { left: !1, right: !0, top: !1, bottom: !0 }
    }, l = $o({
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
      beforeRotation: tt(n.rotate),
      rotationStartPointerAngle: 0,
      rotationOriginX: 0,
      rotationOriginY: 0,
      parentElement: null,
      parentWidth: 0,
      parentHeight: 0,
      eventElement: null,
      pointerId: null
    });
    Gt(
      () => n.modelValue,
      (t) => {
        h.value = a(t);
      },
      { deep: !0 }
    ), Gt(
      () => n.rotate,
      (t) => {
        z.value = tt(t);
      }
    ), Gt(
      () => n.active,
      (t) => {
        !t && l.isInteracting ? me() : F(t);
      },
      { flush: "sync" }
    ), Gt(
      () => n.disabled,
      (t) => {
        r("disabled", t), t && me();
      }
    ), Gt(
      () => n.initRect,
      (t) => {
        t && me();
      }
    ), Gt(
      () => n.isKeepDecimals,
      (t, i) => {
        !t && i && y({
          ...h.value,
          left: Math.round(b(h.value.left)),
          top: Math.round(b(h.value.top)),
          width: Math.round(b(h.value.width)),
          height: Math.round(b(h.value.height))
        });
      }
    );
    const E = ft(() => n.resizable ?? n.resizeable ?? !0), k = ft(() => n.unitType === "%"), S = ft(() => z.value), A = ft(() => ao(n.transformOrigin)), at = ft(() => ({
      "--movable-box-theme": n.theme,
      borderColor: n.disabled ? n.inActiveColor : l.active ? n.theme : n.inActiveColor,
      left: Ae(h.value.left, n.unitType),
      top: Ae(h.value.top, n.unitType),
      width: Ae(h.value.width, n.unitType),
      height: Ae(h.value.height, n.unitType),
      zIndex: h.value.zIndex,
      cursor: n.disabled ? "not-allowed" : l.isDragging ? "move" : l.isResizing ? "nwse-resize" : l.isRotating ? "grabbing" : "default",
      pointerEvents: n.disabled ? "none" : "auto",
      opacity: l.active ? 1 : 0.9,
      transform: S.value ? `rotate(${S.value}deg) translateZ(0)` : "translateZ(0)",
      transformOrigin: A.value,
      willChange: l.isDragging || l.isResizing ? "left, top, width, height" : l.isRotating ? "transform" : "auto",
      transition: n.enableTransition && !l.isInteracting ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), v = ft(() => ({
      borderColor: E.value ? n.theme : n.inActiveColor,
      scale: Qe(1 / ut(n.scale, 1), 1)
    })), I = ft(() => {
      const t = Math.abs(ut(n.scale, 1)) || 1;
      return {
        "--rotation-handle-offset": `${(Number.isFinite(n.rotationHandleOffset) ? Math.max(0, n.rotationHandleOffset) : 28) / t}px`,
        "--rotation-handle-scale": Qe(1 / t, 3),
        borderColor: n.theme,
        color: n.theme
      };
    }), y = (t) => {
      const i = a(t);
      return h.value = i, r("update:modelValue", a(i)), i;
    }, O = (t) => {
      const i = tt(C(tt(t)));
      return z.value = i, r("update:rotate", i), r("rotate", i), i;
    };
    function F(t) {
      l.active !== t && (l.active = t, r(t ? "active" : "inactive", a(h.value)), t || Be());
    }
    const $ = () => {
      var i, c, u;
      let t = null;
      if (n.limitAreaClass)
        try {
          t = document.querySelector(n.limitAreaClass);
        } catch {
          t = null;
        }
      l.parentElement = t ?? ((i = d.value) == null ? void 0 : i.parentElement) ?? null, l.parentWidth = ((c = l.parentElement) == null ? void 0 : c.clientWidth) ?? 0, l.parentHeight = ((u = l.parentElement) == null ? void 0 : u.clientHeight) ?? 0;
    }, L = (t) => Math.max(0, Number(t) || 0), B = () => {
      const t = L(n.edgeDistance);
      return {
        top: t + L(n.boundsMargin.top),
        right: t + L(n.boundsMargin.right),
        bottom: t + L(n.boundsMargin.bottom),
        left: t + L(n.boundsMargin.left)
      };
    }, U = () => {
      const t = B(), i = k.value ? 100 : l.parentWidth, c = k.value ? 100 : l.parentHeight;
      return {
        minLeft: t.left,
        maxRight: Math.max(t.left, i - t.right),
        minTop: t.top,
        maxBottom: Math.max(t.top, c - t.bottom)
      };
    }, K = (t) => {
      const i = U();
      return {
        minLeft: i.minLeft,
        maxLeft: Math.max(i.minLeft, i.maxRight - t.width),
        minTop: i.minTop,
        maxTop: Math.max(i.minTop, i.maxBottom - t.height)
      };
    }, _ = (t) => ({
      left: b(t.left),
      top: b(t.top),
      width: b(t.width),
      height: b(t.height)
    }), q = () => ({
      x: k.value && l.parentWidth > 0 ? l.parentWidth / 100 : 1,
      y: k.value && l.parentHeight > 0 ? l.parentHeight / 100 : 1
    }), P = (t) => {
      const i = _(t), c = S.value;
      if (!c) return i;
      const u = q(), m = {
        left: i.left * u.x,
        top: i.top * u.y,
        width: i.width * u.x,
        height: i.height * u.y
      }, p = re(n.transformOrigin, m.width, m.height), g = ui(m, c, p);
      return {
        left: g.left / u.x,
        top: g.top / u.y,
        width: g.width / u.x,
        height: g.height / u.y
      };
    }, X = (t, i, c) => {
      const u = q(), m = t.left * u.x, p = t.top * u.y, g = t.width * u.x, T = t.height * u.y;
      return {
        left: m,
        top: p,
        width: g,
        height: T,
        angle: i,
        origin: re(c, g, T)
      };
    }, Z = (t, i = S.value) => X(_(t), i, n.transformOrigin), N = (t) => {
      const i = q(), c = {
        left: b(t.left) * i.x,
        top: b(t.top) * i.y,
        width: b(t.width) * i.x,
        height: b(t.height) * i.y
      };
      return {
        ...c,
        id: t.id,
        angle: tt(t.rotate ?? 0),
        origin: re(t.transformOrigin ?? "center", c.width, c.height)
      };
    }, J = () => ue().map(N), et = () => {
      if (!n.snapToElements) return ue();
      const t = q();
      return ue().map((i) => {
        if (!tt(i.rotate ?? 0)) return i;
        const c = De(N(i));
        return {
          left: c.left / t.x,
          top: c.top / t.y,
          width: c.width / t.x,
          height: c.height / t.y,
          id: i.id
        };
      });
    }, rt = () => n.collisionEnabled && !n.allowOverlap && fe.value, It = (t, i, c) => {
      const u = (g) => {
        const T = Z(g);
        let R = 0;
        for (const D of c) {
          const W = qt(T, D);
          W.overlapping && (R += W.overlapArea);
        }
        return R;
      }, m = u(i), p = (g) => m > 0 ? u(g) < m : u(g) === 0;
      if (p(t)) return t;
      for (let g = 0.8; g > 0.01; g -= 0.2) {
        const T = {
          ...t,
          left: C(
            b(i.left) + (b(t.left) - b(i.left)) * g
          ),
          top: C(
            b(i.top) + (b(t.top) - b(i.top)) * g
          )
        };
        if (p(T)) return T;
      }
      return i;
    }, Et = (t, i, c) => {
      const u = J(), m = Z(i), p = Z(t), g = c === "slide" ? de.resolveOrientedTranslation(m, p, u) : de.resolveOrientedChange(m, p, u);
      if (cn(g), !g.accepted) return null;
      const T = q(), R = {
        ...t,
        left: C(g.rect.left / T.x),
        top: C(g.rect.top / T.y),
        width: C(g.rect.width / T.x),
        height: C(g.rect.height / T.y)
      };
      return rt() ? It(R, i, u) : R;
    }, ct = () => n.collisionEnabled && !n.allowOverlap && fe.value, Zt = (t) => {
      if (!n.limitAreaForParent || !l.parentElement) return !1;
      const i = U(), c = De(Z(h.value, t)), u = q(), m = c.left / u.x, p = c.top / u.y, g = c.width / u.x, T = c.height / u.y, R = 1e-7;
      return m < i.minLeft - R || m + g > i.maxRight + R || p < i.minTop - R || p + T > i.maxBottom + R;
    }, Rt = (t, i) => {
      if (Zt(t)) return !0;
      if (!ct() || i.length === 0) return !1;
      const c = Z(h.value, t);
      return i.some((u) => qt(c, u).overlapping);
    }, nn = (t, i) => Math.max(48, Math.ceil(Math.abs(i - t) / 2)), uo = (t, i, c) => {
      let u = t, m = i, p = !1;
      const g = nn(t, i);
      for (let R = 1; R <= g; R += 1) {
        const D = t + (i - t) * R / g;
        if (Rt(D, c)) {
          m = D, p = !0;
          break;
        }
        u = D;
      }
      if (!p) return i;
      let T = u;
      for (let R = 0; R < 20; R += 1) {
        const D = (T + m) / 2;
        Rt(D, c) ? m = D : T = D;
      }
      return T;
    }, on = (t, i) => {
      if (!fe.value || Math.abs(i - t) < 1e-9) return tt(i);
      const c = J();
      if (Rt(t, c)) {
        const u = nn(t, i);
        for (let m = 1; m <= u; m += 1) {
          const p = t + (i - t) * m / u;
          if (!Rt(p, c))
            return tt(C(p));
        }
        return tt(t);
      }
      return tt(C(uo(t, i, c)));
    }, an = (t, i) => {
      const c = S.value;
      if (!c || !n.limitAreaForParent || !l.parentElement) return t;
      const u = U(), m = Math.max(0, u.maxRight - u.minLeft), p = Math.max(0, u.maxBottom - u.minTop), g = _t(c), T = Math.abs(Math.cos(g)) < 1e-9 ? 0 : Math.abs(Math.cos(g)), R = Math.abs(Math.sin(g)) < 1e-9 ? 0 : Math.abs(Math.sin(g)), D = q(), W = T, H = R * (D.y / D.x), Q = R * (D.x / D.y), ot = T, V = b(t.width), G = b(t.height), w = i ? x[i] : null, it = b(t.left) + V, $t = b(t.top) + G, Nt = (st, ht) => ({
        ...t,
        left: w != null && w.left ? C(it - st) : t.left,
        top: w != null && w.top ? C($t - ht) : t.top,
        width: st,
        height: ht
      }), pt = (st, ht) => ({
        ...t,
        left: w != null && w.left ? it - st : t.left,
        top: w != null && w.top ? $t - ht : t.top,
        width: st,
        height: ht
      }), ne = W * V + H * G, be = Q * V + ot * G, Tt = Math.max(0, ut(n.minWidth, 0)), xt = Math.max(0, ut(n.minHeight, 0)), oe = i === null || !!(w != null && w.left || w != null && w.right), ie = i === null || !!(w != null && w.top || w != null && w.bottom), Lt = (w == null ? void 0 : w.left) ?? !1, gt = (w == null ? void 0 : w.top) ?? !1, Dt = (st, ht) => {
        if (!Lt && !gt) return st;
        const mt = b(st.width), Vt = b(st.height), Dn = ht ? Math.min(
          1,
          Math.max(
            mt > 0 ? Tt / mt : 0,
            Vt > 0 ? xt / Vt : 0
          )
        ) : 0, Pn = ht ? mt * Dn : Lt ? Math.min(mt, Tt) : mt, On = ht ? Vt * Dn : gt ? Math.min(Vt, xt) : Vt, En = (nt) => ({
          width: Pn + (mt - Pn) * nt,
          height: On + (Vt - On) * nt
        }), Cn = (nt) => {
          const j = En(nt);
          return pt(j.width, j.height);
        }, Kt = (nt) => {
          const j = En(nt), lt = n.isKeepDecimals ? C : Math.floor;
          return Nt(
            Math.max(Tt, lt(j.width)),
            Math.max(xt, lt(j.height))
          );
        }, ye = (nt) => {
          const j = P(nt), lt = 1e-7;
          return (!Lt || j.left >= u.minLeft - lt && j.left + j.width <= u.maxRight + lt) && (!gt || j.top >= u.minTop - lt && j.top + j.height <= u.maxBottom + lt);
        };
        if (ye(st)) return st;
        const Yt = P(Cn(0)), Xt = P(Cn(1));
        let Pt = 0, wt = 1, $e = !0;
        const Bn = (nt, j, lt) => {
          const kt = j - nt;
          if (Math.abs(kt) < 1e-9) {
            nt < lt && ($e = !1);
            return;
          }
          const ae = (lt - nt) / kt;
          kt > 0 ? Pt = Math.max(Pt, ae) : wt = Math.min(wt, ae);
        }, Nn = (nt, j, lt) => {
          const kt = j - nt;
          if (Math.abs(kt) < 1e-9) {
            nt > lt && ($e = !1);
            return;
          }
          const ae = (lt - nt) / kt;
          kt > 0 ? wt = Math.min(wt, ae) : Pt = Math.max(Pt, ae);
        };
        if (Lt && (Bn(Yt.left, Xt.left, u.minLeft), Nn(
          Yt.left + Yt.width,
          Xt.left + Xt.width,
          u.maxRight
        )), gt && (Bn(Yt.top, Xt.top, u.minTop), Nn(
          Yt.top + Yt.height,
          Xt.top + Xt.height,
          u.maxBottom
        )), Pt = Math.max(0, Pt), wt = Math.min(1, wt), !$e || Pt > wt) return Kt(0);
        const Ln = Kt(wt);
        if (ye(Ln)) return Ln;
        let xe = Pt, kn = wt;
        if (!ye(Kt(xe))) return Kt(0);
        for (let nt = 0; nt < 32; nt += 1) {
          const j = (xe + kn) / 2;
          ye(Kt(j)) ? xe = j : kn = j;
        }
        return Kt(xe);
      };
      if (n.ratioLock || oe && ie) {
        const st = Math.min(
          1,
          ne > m ? m / ne : 1,
          be > p ? p / be : 1
        ), ht = Math.max(
          st,
          V > 0 ? Tt / V : 0,
          G > 0 ? xt / G : 0
        ), mt = Math.min(ht, 1);
        return mt >= 1 ? Dt(t, !0) : Dt(
          Nt(
            Math.max(Tt, Math.floor(V * mt)),
            Math.max(xt, Math.floor(G * mt))
          ),
          !0
        );
      }
      const Mt = Math.floor(
        Math.min(
          W > 0 ? (m - H * G) / W : 1 / 0,
          Q > 0 ? (p - ot * G) / Q : 1 / 0
        )
      ), Ge = Math.floor(
        Math.min(
          H > 0 ? (m - W * V) / H : 1 / 0,
          ot > 0 ? (p - Q * V) / ot : 1 / 0
        )
      ), Sn = oe ? Math.max(Tt, Math.min(V, Mt)) : V, Tn = ie ? Math.max(xt, Math.min(G, Ge)) : G;
      return Dt(Sn === V && Tn === G ? t : Nt(Sn, Tn), !1);
    }, Oe = (t) => {
      if (!l.parentElement) return;
      const i = U(), c = P(t), u = c.left, m = c.top, p = u + c.width, g = m + c.height;
      u < i.minLeft && r("out-of-bounds", "left"), p > i.maxRight && r("out-of-bounds", "right"), m < i.minTop && r("out-of-bounds", "top"), g > i.maxBottom && r("out-of-bounds", "bottom");
    }, Ee = (t) => {
      if (!n.limitAreaForParent || !l.parentElement) return t;
      const i = P(t), c = K(i), u = Ot(i.left, c.minLeft, c.maxLeft), m = Ot(i.top, c.minTop, c.maxTop);
      return S.value ? {
        ...t,
        left: C(b(t.left) + (u - i.left)),
        top: C(b(t.top) + (m - i.top))
      } : {
        ...t,
        left: u,
        top: m
      };
    }, Y = Vo(lo, null), zt = n.memberId || `member-${((An = Ko()) == null ? void 0 : An.uid) ?? Math.random().toString(36).slice(2)}`;
    let At = !1;
    const fo = {
      getRect: () => a(h.value),
      getVisualRect: () => P(a(h.value)),
      translateTo: (t) => {
        y(t);
      },
      getAreaEdges: () => ($(), l.parentElement ? U() : null)
    };
    Yo(() => Y == null ? void 0 : Y.registerMember(zt, fo));
    const ue = () => Y ? n.snapTargets.filter((t) => !Y.hasMember(t.id)) : n.snapTargets, C = (t) => n.isKeepDecimals ? Qe(t, 0, n.decimalPlaces) : Math.round(t), Jt = (t, i) => {
      if (!k.value) return C(t);
      const c = i === "horizontal" ? l.parentWidth : l.parentHeight;
      return c > 0 ? C(t / c * 100) : 0;
    }, rn = (t, i) => {
      const c = ut(n.scale, 1), u = t / (c === 0 ? 1 : c);
      return Jt(u, i);
    }, sn = ni(() => ({ snapToGrid: n.snapToGrid, gridSize: n.gridSize })), St = oi(() => ({
      enabled: n.snapToElements,
      threshold: n.snapThreshold,
      filter: n.snapFilter,
      priority: n.snapPriority
    })), fe = ft(() => n.collisionMode !== "aabb"), de = Ii(() => ({
      enabled: n.collisionEnabled,
      allowOverlap: n.allowOverlap
    })), ln = St.guides;
    let Qt = "clear", jt = "clear", te = "clear";
    const he = /* @__PURE__ */ new Set(["left", "right", "center-x"]), pe = /* @__PURE__ */ new Set(["top", "bottom", "center-y"]), Ce = (t) => {
      const i = {
        horizontal: t.points.some((g) => he.has(g)) ? t.targetIds.horizontal : void 0,
        vertical: t.points.some((g) => pe.has(g)) ? t.targetIds.vertical : void 0
      }, c = t.snapped ? Ut(t.spacing ?? []) : [], u = t.snapped ? {
        snapped: !0,
        point: t.snapPoint,
        points: t.points,
        targetId: t.targetId,
        targetIds: i,
        spacing: c.length > 0 ? c : void 0
      } : { snapped: !1 }, m = JSON.stringify({
        payload: u,
        left: t.points.some((g) => he.has(g)) ? t.left : void 0,
        top: t.points.some((g) => pe.has(g)) ? t.top : void 0
      });
      m !== Qt && ((t.snapped || Qt !== "clear") && r("snap", u), Qt = t.snapped ? m : "clear");
      const p = JSON.stringify({ guides: t.guides, targetIds: i });
      p !== jt && ((t.snapped || jt !== "clear") && r("guides", Ut(t.guides)), jt = t.snapped ? p : "clear");
    }, cn = (t) => {
      const i = t.dominant, c = i ? {
        colliding: !0,
        direction: i.direction,
        targetId: i.targetId,
        normal: i.normal ? { ...i.normal } : void 0
      } : { colliding: !1 }, u = JSON.stringify(c);
      u !== te && ((i || te !== "clear") && r("collision", c), te = i ? u : "clear");
    }, Be = () => {
      Qt !== "clear" && r("snap", { snapped: !1 }), jt !== "clear" && r("guides", { vertical: [], horizontal: [] }), te !== "clear" && r("collision", { colliding: !1 }), Qt = "clear", jt = "clear", te = "clear", St.clearGuides(), de.clearCollisions();
    }, Ne = (t, i, c = "path") => {
      if (fe.value)
        return Et(t, i, c);
      const u = P(t), m = de.resolveCandidate(
        u,
        P(i),
        ue(),
        (p) => ({
          left: C(p.left),
          top: C(p.top),
          width: C(p.width),
          height: C(p.height)
        }),
        c
      );
      if (cn(m), !m.accepted) return null;
      if (S.value) {
        if (c === "path" && m.progress !== void 0) {
          const p = Ot(m.progress, 0, 1), g = _(i), T = _(t);
          return {
            ...t,
            left: C(
              g.left + (T.left - g.left) * p
            ),
            top: C(g.top + (T.top - g.top) * p),
            width: C(
              g.width + (T.width - g.width) * p
            ),
            height: C(
              g.height + (T.height - g.height) * p
            )
          };
        }
        return {
          ...t,
          left: C(b(t.left) + (m.rect.left - u.left)),
          top: C(b(t.top) + (m.rect.top - u.top))
        };
      }
      return { ...t, ...m.rect };
    }, un = (t, i, c, u, m) => {
      let p = a(t);
      u.horizontal && (p.left = sn.snapValue(b(t.left))), u.vertical && (p.top = sn.snapValue(b(t.top)));
      let g = {
        ..._(p),
        snapped: !1,
        points: [],
        targetIds: {},
        guides: { vertical: [], horizontal: [] },
        spacing: []
      };
      if (c) {
        const R = P(p);
        g = St.resolveSnap(R, et(), u), S.value ? p = {
          ...p,
          left: C(b(p.left) + (g.left - R.left)),
          top: C(b(p.top) + (g.top - R.top))
        } : p = { ...p, left: g.left, top: g.top };
      } else
        St.clearGuides();
      if (m) {
        const R = b(m.left), D = b(m.top);
        n.dragDirections.includes("left") || (p.left = Math.max(R, b(p.left))), n.dragDirections.includes("right") || (p.left = Math.min(R, b(p.left))), n.dragDirections.includes("top") || (p.top = Math.max(D, b(p.top))), n.dragDirections.includes("bottom") || (p.top = Math.min(D, b(p.top)));
      }
      Oe(p), p = Ee(p);
      const T = Ne(p, i, "slide");
      if (!T)
        return Ce({
          ...g,
          snapped: !1,
          points: [],
          guides: { vertical: [], horizontal: [] }
        }), St.clearGuides(), null;
      if (p = T, g.snapped) {
        const R = P(p), D = C(R.left) !== C(g.left), W = C(R.top) !== C(g.top), H = g.points.filter((w) => he.has(w) ? !D : pe.has(w) ? !W : !1), Q = H.some((w) => he.has(w)), ot = H.some((w) => pe.has(w)), V = g.spacing.filter(
          (w) => w.axis === "horizontal" ? !D : !W
        ), G = {
          vertical: V.flatMap((w) => w.axis === "horizontal" ? w.guides : []),
          horizontal: V.flatMap((w) => w.axis === "vertical" ? w.guides : [])
        };
        g = {
          ...g,
          left: b(p.left),
          top: b(p.top),
          snapped: H.length > 0 || V.length > 0,
          snapPoint: H[0],
          points: H,
          targetId: Q ? g.targetIds.horizontal : ot ? g.targetIds.vertical : void 0,
          targetIds: {
            horizontal: Q ? g.targetIds.horizontal : void 0,
            vertical: ot ? g.targetIds.vertical : void 0
          },
          guides: {
            vertical: Q ? g.guides.vertical : G.vertical,
            horizontal: ot ? g.guides.horizontal : G.horizontal
          },
          spacing: V
        }, g.snapped ? St.setGuides(g.guides) : St.clearGuides();
      }
      return Ce(g), p;
    }, Le = (t) => n.resizeDirections.includes(t), fn = (t, i, c, u) => {
      const m = x[i], p = b(t.left), g = b(t.top), T = b(t.width), R = b(t.height);
      let D = p, W = p + T, H = g, Q = g + R;
      m.left && (D += c), m.right && (W += c), m.top && (H += u), m.bottom && (Q += u);
      const ot = (D + W) / 2, V = (H + Q) / 2;
      let G = Math.max(0, W - D), w = Math.max(0, Q - H);
      const it = T > 0 && R > 0 ? T / R : 1, $t = (Mt) => {
        G = Mt, m.left ? D = W - G : m.right ? W = D + G : (D = ot - G / 2, W = ot + G / 2);
      }, Nt = (Mt) => {
        w = Mt, m.top ? H = Q - w : m.bottom ? Q = H + w : (H = V - w / 2, Q = V + w / 2);
      };
      if (n.ratioLock) {
        const Mt = Math.abs(G - T), Ge = Math.abs(w - R) * it;
        i === "tm" || i === "bm" || Ge > Mt ? $t(w * it) : Nt(G / it);
      }
      const pt = U(), ne = n.limitAreaForParent && !!l.parentElement && S.value === 0, be = ne ? m.left ? Math.max(0, W - pt.minLeft) : m.right ? Math.max(0, pt.maxRight - D) : Math.max(
        0,
        2 * Math.min(ot - pt.minLeft, pt.maxRight - ot)
      ) : 1 / 0, Tt = ne ? m.top ? Math.max(0, Q - pt.minTop) : m.bottom ? Math.max(0, pt.maxBottom - H) : Math.max(
        0,
        2 * Math.min(V - pt.minTop, pt.maxBottom - V)
      ) : 1 / 0, xt = Math.max(0, ut(n.minWidth, 0)), oe = Math.max(0, ut(n.minHeight, 0)), ie = ut(n.maxWidth, 1 / 0), Lt = ut(n.maxHeight, 1 / 0);
      let gt = Math.min(ie > 0 ? ie : 1 / 0, be), Dt = Math.min(Lt > 0 ? Lt : 1 / 0, Tt);
      if (n.ratioLock) {
        gt = Math.min(gt, Dt * it);
        const Mt = Math.max(xt, oe * it);
        $t(Ot(G, Mt, gt)), Nt(G / it);
      } else
        $t(Ot(G, Math.min(xt, gt), gt)), Nt(Ot(w, Math.min(oe, Dt), Dt));
      return {
        ...t,
        left: C(D),
        top: C(H),
        width: C(W - D),
        height: C(Q - H)
      };
    };
    let yt = null, Ct = null;
    const dn = (t, i, c) => Math.atan2(t.clientY - c, t.clientX - i) * 180 / Math.PI + 90, hn = (t) => {
      if (n.disabled || n.initRect || !l.isInteracting)
        return;
      if (l.isRotating) {
        const m = dn(
          t,
          l.rotationOriginX,
          l.rotationOriginY
        ), p = tt(m - l.rotationStartPointerAngle);
        O(on(l.beforeRotation, l.beforeRotation + p));
        return;
      }
      const i = rn(t.clientX - l.initX, "horizontal"), c = rn(t.clientY - l.initY, "vertical"), u = a(h.value);
      if (l.isDragging) {
        const m = l.beforeInteraction;
        let p = b(m.left) + i, g = b(m.top) + c;
        const T = {
          horizontal: i < 0 && n.dragDirections.includes("left") || i > 0 && n.dragDirections.includes("right"),
          vertical: c < 0 && n.dragDirections.includes("top") || c > 0 && n.dragDirections.includes("bottom")
        };
        T.horizontal || (p = b(m.left)), T.vertical || (g = b(m.top));
        const R = {
          ...m,
          left: C(p),
          top: C(g)
        };
        let D = un(R, u, n.snapToElements, T, m);
        if (D && At && (D = (Y == null ? void 0 : Y.constrainPosition(zt, D)) ?? null), D) {
          const W = y(D);
          r("move", a(W)), r("drag", a(W)), At && (Y == null || Y.notifyMoved(zt, a(W)));
        }
      }
      if (l.isResizing && l.handle) {
        Ce({
          ..._(u),
          snapped: !1,
          points: [],
          targetIds: {},
          guides: { vertical: [], horizontal: [] },
          spacing: []
        }), St.clearGuides();
        const m = ut(n.scale, 1), p = m === 0 ? 1 : m, g = _n(
          (t.clientX - l.initX) / p,
          (t.clientY - l.initY) / p,
          S.value
        ), T = {
          x: Jt(g.x, "horizontal"),
          y: Jt(g.y, "vertical")
        };
        let R = fn(
          l.beforeInteraction,
          l.handle,
          T.x,
          T.y
        );
        S.value && (R = an(R, l.handle), R = Ee(R)), Oe(R);
        const D = Ne(R, u);
        if (D) {
          const W = y(D);
          r("resize", a(W));
        }
      }
    }, ho = (t) => {
      !l.active || n.disabled || n.initRect || (Ct = t, yt === null && (yt = requestAnimationFrame(() => {
        yt = null;
        const i = Ct;
        Ct = null, i && hn(i);
      })));
    }, ge = (t) => l.pointerId === null || t.pointerId === l.pointerId, pn = (t) => {
      ge(t) && ho(t);
    }, gn = (t) => {
      ge(t) && xo(t);
    }, mn = (t) => {
      ge(t) && ee(t);
    }, vn = (t) => {
      ge(t) && l.isInteracting && ee(t);
    }, bn = (t) => {
      t.key === "Escape" && l.isInteracting && (t.preventDefault(), t.stopPropagation(), ee(t));
    }, yn = () => {
      const t = l.eventElement;
      if (!t) return;
      const i = { passive: !1 };
      se(t, "pointermove", pn, i), se(t, "pointerup", gn, i), se(t, "pointercancel", mn, i), se(t, "keydown", bn, !0);
      const c = d.value;
      c && se(c, "lostpointercapture", vn, i);
    }, po = () => {
      const t = l.eventElement;
      if (!t) return;
      le(t, "pointermove", pn, !1), le(t, "pointerup", gn, !1), le(t, "pointercancel", mn, !1), le(t, "keydown", bn, !0);
      const i = d.value;
      i && le(i, "lostpointercapture", vn, !1), l.eventElement = null;
    }, xn = () => {
      const t = d.value;
      if (!(!t || l.pointerId === null))
        try {
          t.setPointerCapture(l.pointerId);
        } catch {
        }
    }, go = () => {
      const t = d.value, i = l.pointerId;
      if (l.pointerId = null, !(!t || i === null))
        try {
          t.hasPointerCapture(i) && t.releasePointerCapture(i);
        } catch {
        }
    };
    function ke() {
      yt !== null && (cancelAnimationFrame(yt), yt = null), Ct = null;
    }
    function Fe() {
      l.interactionMode = "idle", l.handle = null, At = !1, po(), go();
    }
    function Mn() {
      Be(), n.active || F(!1);
    }
    function wn() {
      Fe(), Mn();
    }
    function me() {
      ke(), At && (Y == null || Y.abortDrag(zt)), wn();
    }
    function ee(t = null) {
      const i = l.isDragging, c = l.isResizing, u = l.isRotating, m = At;
      if (ke(), Fe(), i || c) {
        const p = a(l.beforeInteraction);
        y(p), r(i ? "drag-cancel" : "resize-cancel", t, p, a(p)), i && m && (Y == null || Y.cancelDrag(zt, t));
      }
      u && (z.value = l.beforeRotation, r("update:rotate", l.beforeRotation), r("rotate-cancel", t, l.beforeRotation, l.beforeRotation)), Mn();
    }
    function In() {
      me(), F(!1);
    }
    const mo = (t, i) => {
      var u, m;
      if (n.disabled || n.initRect || l.isInteracting || i && (!E.value || !Le(i)) || !i && !n.draggable) return;
      const c = a(h.value);
      if (i) {
        if (((u = n.canResize) == null ? void 0 : u.call(n, c, i)) === !1) return;
      } else if (((m = n.canDrag) == null ? void 0 : m.call(n, c)) === !1)
        return;
      if (At = !1, !i && Y) {
        const p = Y.beginDrag(zt, t);
        if (p === "blocked") return;
        At = p === "group";
      }
      $(), l.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, l.initX = t.clientX, l.initY = t.clientY, l.beforeInteraction = a(h.value), l.handle = i, l.interactionMode = i ? "resize" : "drag", F(!0), l.isDragging && r("drag-start", t, a(l.beforeInteraction)), l.isResizing && r("resize-start", t, a(l.beforeInteraction)), l.eventElement = document.documentElement, yn(), xn();
    }, vo = () => {
      const t = d.value;
      if (!t) return null;
      const i = t.getBoundingClientRect(), c = t.offsetWidth || b(h.value.width), u = t.offsetHeight || b(h.value.height);
      if (!c || !u) return null;
      const m = _t(S.value), p = Math.cos(m), g = Math.sin(m), T = Math.abs(p) * c + Math.abs(g) * u, R = Math.abs(g) * c + Math.abs(p) * u, D = [
        T ? i.width / T : 0,
        R ? i.height / R : 0
      ].filter((w) => Number.isFinite(w) && w > 0), W = Math.abs(ut(n.scale, 1)) || 1, H = D.length ? D.reduce((w, it) => w + it, 0) / D.length : W, Q = re(n.transformOrigin, c, u), ot = Q.x * H, V = Q.y * H, G = [
        [-ot, -V],
        [c * H - ot, -V],
        [c * H - ot, u * H - V],
        [-ot, u * H - V]
      ].map(([w, it]) => ({
        x: w * p - it * g,
        y: w * g + it * p
      }));
      return {
        x: i.left - Math.min(...G.map((w) => w.x)),
        y: i.top - Math.min(...G.map((w) => w.y))
      };
    }, bo = (t) => {
      if (!t.isPrimary || t.button !== 0 || n.disabled || n.initRect || !n.rotatable || l.isInteracting) return;
      $();
      const i = vo();
      i && (l.pointerId = typeof t.pointerId == "number" ? t.pointerId : null, l.beforeRotation = z.value, l.rotationOriginX = i.x, l.rotationOriginY = i.y, l.rotationStartPointerAngle = dn(t, i.x, i.y), l.interactionMode = "rotate", F(!0), r("rotate-start", t, l.beforeRotation), l.eventElement = document.documentElement, yn(), xn());
    }, yo = (t) => {
      if (!(t instanceof Element)) return !0;
      const i = d.value;
      if (!i) return !0;
      const c = (u) => {
        try {
          const m = t.closest(u);
          return {
            valid: !0,
            matched: m instanceof Element && i.contains(m)
          };
        } catch {
          return { valid: !1, matched: !1 };
        }
      };
      if (n.dragCancel) {
        const u = c(n.dragCancel);
        if (!u.valid || u.matched) return !1;
      }
      if (n.dragHandle) {
        const u = c(n.dragHandle);
        return u.valid && u.matched;
      }
      return !0;
    }, Rn = (t, i) => {
      !t.isPrimary || t.button !== 0 || !i && !yo(t.target) || mo(t, i);
    };
    function xo(t) {
      yt !== null && (cancelAnimationFrame(yt), yt = null), Ct && (hn(Ct), Ct = null), l.isDragging && (r("drag-stop", t, a(l.beforeInteraction), a(h.value)), At && (Y == null || Y.endDrag(zt, t))), l.isResizing && r("resize-stop", t, a(l.beforeInteraction), a(h.value)), l.isRotating && r("rotate-stop", t, l.beforeRotation, z.value), wn();
    }
    const Mo = (t, i) => {
      var p;
      $();
      const c = a(h.value);
      if (((p = n.canDrag) == null ? void 0 : p.call(n, a(c))) === !1) return;
      const u = a(c);
      t === "left" && (u.left = b(u.left) - i), t === "right" && (u.left = b(u.left) + i), t === "top" && (u.top = b(u.top) - i), t === "bottom" && (u.top = b(u.top) + i);
      const m = un(
        u,
        c,
        n.snapToElements,
        {
          horizontal: t === "left" || t === "right",
          vertical: t === "top" || t === "bottom"
        },
        c
      );
      if (m) {
        const g = y(m);
        r("move", a(g));
      }
    }, wo = (t, i, c) => {
      var H;
      if (!E.value || !Le(t)) return;
      $();
      const u = a(h.value);
      if (((H = n.canResize) == null ? void 0 : H.call(n, a(u), t)) === !1) return;
      const m = i === "left" ? -c : i === "right" ? c : 0, p = i === "top" ? -c : i === "bottom" ? c : 0, g = _n(He(m), We(p), S.value), T = {
        x: Jt(g.x, "horizontal"),
        y: Jt(g.y, "vertical")
      };
      let R = fn(u, t, T.x, T.y);
      S.value && (R = an(R, t), R = Ee(R)), Oe(R);
      const D = Ne(R, u);
      if (!D || Ri(D, u)) return;
      const W = y(D);
      r("resize", a(W));
    }, Io = {
      tl: "top left",
      tm: "top middle",
      tr: "top right",
      ml: "middle left",
      mr: "middle right",
      bl: "bottom left",
      bm: "bottom middle",
      br: "bottom right"
    }, Ro = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br"]), Bt = (t) => Ro.has(t), zo = (t) => Bt(t) ? "group" : "separator", Ao = (t) => Bt(t) ? "two-axis resize handle" : void 0, So = (t) => `Resize ${Io[t]}`, To = (t) => {
      if (!Bt(t))
        return t === "ml" || t === "mr" ? "vertical" : "horizontal";
    }, ve = (t) => t === "ml" || t === "mr", zn = (t) => {
      if (!Bt(t))
        return b(ve(t) ? h.value.width : h.value.height);
    }, Do = (t) => {
      if (!Bt(t))
        return b(ve(t) ? n.minWidth : n.minHeight);
    }, Po = (t) => {
      if (Bt(t)) return;
      const i = ve(t) ? n.maxWidth : n.maxHeight;
      if (i === void 0) return;
      const c = b(i);
      return Number.isFinite(c) ? c : void 0;
    }, Oo = (t) => {
      const i = zn(t);
      if (i !== void 0)
        return n.unitType === "%" ? `${i} percent` : `${i} pixels`;
    }, Eo = (t) => {
      if (n.keyboardEnabled)
        return Bt(t) ? "ArrowUp ArrowDown ArrowLeft ArrowRight" : ve(t) ? "ArrowLeft ArrowRight" : "ArrowUp ArrowDown";
    }, Co = (t) => {
      t.target === d.value && n.keyboardEnabled && !n.disabled && !n.initRect && F(!0);
    }, Bo = [
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
    ].join(","), No = (t) => {
      const i = t.target, c = d.value;
      if (!(i instanceof Element) || !c || i === c || i.closest(".handle")) return !1;
      if (i.closest(".rotation-handle")) return t.key !== "Escape";
      const u = i.closest(Bo);
      return u !== null && u !== c && c.contains(u);
    }, Lo = Qo(
      () => ({
        enabled: n.keyboardEnabled,
        step: n.keyboardStep,
        disabled: n.disabled,
        readOnly: n.initRect,
        active: l.active,
        dragDirections: n.dragDirections,
        resizeDirections: n.resizeDirections,
        focusedHandle: f.value,
        interacting: l.isInteracting
      }),
      {
        move: Mo,
        resize: wo,
        deactivate: In,
        cancel: (t) => ee(t)
      }
    ), ko = (t) => {
      No(t) || Lo.handleKeyDown(t);
    }, Fo = (t) => {
      if (!n.keyboardEnabled || n.disabled || n.initRect || !n.rotatable || !["ArrowLeft", "ArrowRight", "Home"].includes(t.key)) return;
      t.preventDefault(), t.stopPropagation(), $();
      const i = z.value, c = to(n.keyboardStep) * (t.shiftKey ? 10 : 1), u = t.key === "Home" ? 0 : i + (t.key === "ArrowLeft" ? -c : c);
      r("rotate-start", t, i);
      const m = O(on(i, u));
      r("rotate-stop", t, i, m);
    }, He = (t) => k.value ? t / 100 * l.parentWidth : t, We = (t) => k.value ? t / 100 * l.parentHeight : t, Ho = ft(() => {
      const t = He(b(h.value.left)), i = We(b(h.value.top)), c = {
        left: `${-t}px`,
        top: `${-i}px`,
        width: `${l.parentWidth}px`,
        height: `${l.parentHeight}px`
      }, u = S.value;
      if (u) {
        const m = q(), p = re(
          n.transformOrigin,
          b(h.value.width) * m.x,
          b(h.value.height) * m.y
        );
        c.transform = `rotate(${-u}deg)`, c.transformOrigin = `${p.x + t}px ${p.y + i}px`;
      }
      return c;
    }), Wo = (t) => ({
      left: `${He(t)}px`,
      top: "0px",
      height: `${l.parentHeight}px`,
      borderColor: n.theme
    }), Go = (t) => ({
      top: `${We(t)}px`,
      left: "0px",
      width: `${l.parentWidth}px`,
      borderColor: n.theme
    });
    return o({
      getConfig: () => a(h.value),
      setPosition: (t, i) => y({ ...h.value, left: t, top: i }),
      setSize: (t, i) => y({ ...h.value, width: t, height: i }),
      reset: () => y(a(M)),
      activate: () => F(!0),
      deactivate: In,
      cancelInteraction: (t = null) => ee(t)
    }), Xo(() => {
      ke(), Fe(), Y == null || Y.unregisterMember(zt), Be();
    }), (t, i) => (Ft(), Ht("div", {
      ref_key: "movableRef",
      ref: d,
      class: Fn(["auto-draggable", {
        "select-none": e.disabledUserSelect,
        "is-disabled": e.disabled,
        "is-active": l.active,
        "is-dragging": l.isDragging,
        "is-resizing": l.isResizing,
        "is-rotating": l.isRotating,
        "is-readonly": e.initRect
      }]),
      style: Wt(at.value),
      tabindex: "0",
      onPointerdown: i[1] || (i[1] = (c) => Rn(c, null)),
      onDblclick: i[2] || (i[2] = (c) => r("dblclick", c)),
      onFocus: Co,
      onKeydown: ko
    }, [
      Me("div", {
        class: "movable-box-guides-layer",
        style: Wt(Ho.value),
        "aria-hidden": "true"
      }, [
        (Ft(!0), Ht(Ve, null, Ke(Hn(ln).vertical, (c, u) => (Ft(), Ht("div", {
          key: `vertical-${u}`,
          class: "movable-box-guide movable-box-guide--vertical",
          style: Wt(Wo(c))
        }, null, 4))), 128)),
        (Ft(!0), Ht(Ve, null, Ke(Hn(ln).horizontal, (c, u) => (Ft(), Ht("div", {
          key: `horizontal-${u}`,
          class: "movable-box-guide movable-box-guide--horizontal",
          style: Wt(Go(c))
        }, null, 4))), 128))
      ], 4),
      Ye(Me("div", {
        class: "rotation-handle-connector",
        style: Wt(I.value),
        "aria-hidden": "true"
      }, null, 4), [
        [Xe, l.active && e.rotatable && !e.disabled && !e.initRect]
      ]),
      Ye(Me("div", {
        class: "rotation-handle",
        style: Wt(I.value),
        role: "slider",
        "aria-label": "Rotation",
        "aria-orientation": "horizontal",
        "aria-valuenow": S.value,
        "aria-valuemin": "-180",
        "aria-valuemax": "180",
        "aria-valuetext": `${S.value} degrees`,
        "aria-keyshortcuts": e.keyboardEnabled ? "ArrowLeft ArrowRight Home" : void 0,
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: Wn(bo, ["stop", "prevent"]),
        onKeydown: Fo
      }, [...i[3] || (i[3] = [
        Me("span", {
          class: "rotation-handle-mark",
          "aria-hidden": "true"
        }, null, -1)
      ])], 44, Ai), [
        [Xe, l.active && e.rotatable && !e.disabled && !e.initRect]
      ]),
      (Ft(!0), Ht(Ve, null, Ke(e.handles, (c) => Ye((Ft(), Ht("div", {
        key: c,
        class: Fn(["handle", `handle-${c}`]),
        style: Wt(v.value),
        role: zo(c),
        "aria-roledescription": Ao(c),
        "aria-orientation": To(c),
        "aria-label": So(c),
        "aria-valuenow": zn(c),
        "aria-valuemin": Do(c),
        "aria-valuemax": Po(c),
        "aria-valuetext": Oo(c),
        "aria-keyshortcuts": Eo(c),
        tabindex: e.keyboardEnabled ? 0 : void 0,
        onPointerdown: Wn((u) => Rn(u, c), ["stop", "prevent"]),
        onFocus: (u) => f.value = c,
        onBlur: i[0] || (i[0] = (u) => f.value = null)
      }, null, 46, Si)), [
        [Xe, l.active && E.value && !e.disabled && Le(c)]
      ])), 128)),
      jn(t.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Pi = (e, o) => {
  const s = e.__vccOpts || e;
  for (const [n, r] of o)
    s[n] = r;
  return s;
}, Oi = /* @__PURE__ */ Pi(Di, [["__scopeId", "data-v-55405969"]]), Ei = Pe({
  name: "MovableGroup"
}), Ci = /* @__PURE__ */ Pe({
  ...Ei,
  props: {
    selected: { type: Array, default: void 0 },
    sharedBounds: { type: Boolean, default: !0 }
  },
  emits: ["update:selected", "move-start", "move", "move-stop", "move-cancel"],
  setup(e, { expose: o, emit: s }) {
    const n = e, r = s, a = /* @__PURE__ */ new Map(), d = vt([]), h = vt(null), z = ft(() => n.selected !== void 0), M = ft({
      get: () => z.value ? n.selected ?? [] : d.value,
      set: (v) => {
        d.value = v, r("update:selected", v);
      }
    });
    Gt(
      () => n.selected,
      (v) => {
        v !== void 0 && (d.value = [...v]);
      },
      { immediate: !0 }
    );
    const f = (v) => Ut(v), x = (v, I, y) => ({
      ...v,
      left: b(v.left) + I,
      top: b(v.top) + y
    }), l = (v) => v.reduce(
      (I, y) => ({
        minLeft: Math.min(I.minLeft, y.left),
        minTop: Math.min(I.minTop, y.top),
        maxRight: Math.max(I.maxRight, y.left + y.width),
        maxBottom: Math.max(I.maxBottom, y.top + y.height)
      }),
      { minLeft: 1 / 0, minTop: 1 / 0, maxRight: -1 / 0, maxBottom: -1 / 0 }
    ), E = (v, I, y) => {
      const O = l(v);
      return {
        left: Math.min(
          Math.max(I.left, y.minLeft - O.minLeft),
          y.maxRight - O.maxRight
        ),
        top: Math.min(
          Math.max(I.top, y.minTop - O.minTop),
          y.maxBottom - O.maxBottom
        )
      };
    }, k = (v) => {
      const I = [];
      for (const [y, O] of v) {
        const F = a.get(y);
        F && I.push({ id: y, rect: f(F.getRect()), startRect: f(O) });
      }
      return I;
    }, S = (v) => v.map(({ id: I, rect: y }) => ({ id: I, rect: y })), A = (v) => {
      const I = v.filter((O) => a.has(O)), y = M.value;
      y.length === I.length && y.every((O, F) => O === I[F]) || (M.value = I);
    };
    return Uo(lo, {
      registerMember: (v, I) => {
        a.set(v, I);
      },
      unregisterMember: (v) => {
        var I;
        if (a.delete(v), ((I = h.value) == null ? void 0 : I.leaderId) === v) {
          h.value = null;
          return;
        }
        h.value && (h.value.startRects.delete(v), h.value.startVisuals.delete(v)), M.value.includes(v) && A(M.value.filter((y) => y !== v));
      },
      hasMember: (v) => v !== void 0 && a.has(v),
      beginDrag: (v, I) => {
        if (h.value && h.value.leaderId !== v)
          return h.value.startRects.has(v) ? "blocked" : "solo";
        if (!a.has(v)) return "solo";
        const y = M.value.includes(v) ? [...M.value] : [v];
        M.value.includes(v) || A(y);
        const O = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map();
        for (const L of y) {
          const B = a.get(L);
          B && (O.set(L, f(B.getRect())), F.set(L, { ...B.getVisualRect() }));
        }
        h.value = { leaderId: v, startRects: O, startVisuals: F };
        const $ = [];
        for (const [L, B] of O) $.push({ id: L, rect: f(B) });
        return r("move-start", { leaderId: v, source: I, rects: $ }), "group";
      },
      constrainPosition: (v, I) => {
        var B, U;
        const y = h.value, O = y == null ? void 0 : y.startRects.get(v);
        if (!y || y.leaderId !== v || !O || !a.has(v)) return I;
        const F = b(I.left) - b(O.left), $ = b(I.top) - b(O.top), L = (B = a.get(v)) == null ? void 0 : B.getAreaEdges();
        if (n.sharedBounds) {
          let K = { left: F, top: $ };
          L && (K = E([...y.startVisuals.values()], K, L));
          for (const [_, q] of y.startRects)
            _ !== v && ((U = a.get(_)) == null || U.translateTo(x(q, K.left, K.top)));
          return x(O, K.left, K.top);
        }
        for (const [K, _] of y.startRects) {
          if (K === v) continue;
          const q = a.get(K);
          if (!q) continue;
          const P = y.startVisuals.get(K), X = x(_, F, $), Z = q.getAreaEdges();
          if (Z && P) {
            const N = P.left - b(_.left), J = P.top - b(_.top), et = Z.minLeft - N, rt = Math.max(et, Z.maxRight - N - P.width), It = Z.minTop - J, Et = Math.max(It, Z.maxBottom - J - P.height);
            X.left = Ot(b(X.left), et, rt), X.top = Ot(b(X.top), It, Et);
          }
          q.translateTo(X);
        }
        return I;
      },
      notifyMoved: (v, I) => {
        const y = h.value;
        if (!y || y.leaderId !== v) return;
        const O = S(k(y.startRects)).map(
          (F) => F.id === v ? { id: v, rect: f(I) } : F
        );
        r("move", { leaderId: v, rects: O });
      },
      endDrag: (v, I) => {
        const y = h.value;
        if (!y || y.leaderId !== v) return;
        const O = k(y.startRects);
        h.value = null, r("move-stop", { leaderId: v, source: I, rects: O });
      },
      cancelDrag: (v, I) => {
        var F;
        const y = h.value;
        if (!y || y.leaderId !== v) return;
        for (const [$, L] of y.startRects)
          $ !== v && ((F = a.get($)) == null || F.translateTo(f(L)));
        const O = k(y.startRects);
        h.value = null, r("move-cancel", { leaderId: v, source: I, rects: O });
      },
      abortDrag: (v) => {
        var I;
        ((I = h.value) == null ? void 0 : I.leaderId) === v && (h.value = null);
      }
    }), o({
      getSelected: () => [...M.value],
      select: (v) => A(v ?? [...a.keys()]),
      getMemberRects: () => [...a.entries()].map(([v, I]) => ({ id: v, rect: f(I.getRect()) }))
    }), (v, I) => jn(v.$slots, "default");
  }
}), co = "VueMovableBox", Bi = "3.2.0", Ni = (e) => {
  e.component(co, Oi), e.component("MovableGroup", Ci);
}, Fi = {
  name: co,
  version: Bi,
  install: Ni
};
export {
  Oi as MovableBox,
  Ci as MovableGroup,
  Fi as default,
  Ni as install,
  co as name,
  Bi as version
};
