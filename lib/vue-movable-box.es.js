import { defineComponent as le, reactive as ge, computed as E, ref as pe, watch as Z, onUnmounted as be, openBlock as G, createElementBlock as J, normalizeStyle as ie, normalizeClass as ne, Fragment as we, renderList as Me, withDirectives as Ce, withModifiers as ae, vShow as xe, renderSlot as ye } from "vue";
import Q from "decimal.js";
const re = 2, ke = 1, h = (a, f = 1) => {
  if (a == null || a === "")
    return f;
  const b = typeof a == "string" ? parseFloat(a) : a;
  return isNaN(b) ? f : b;
}, De = (a, f, b = !1, i = re) => {
  const m = h(f, ke), t = h(a);
  if (m === 0)
    return b ? new Q(t).toDecimalPlaces(i).toNumber() : Math.round(t);
  const o = t / m;
  return b ? new Q(o).toDecimalPlaces(i).toNumber() : Math.round(o);
}, O = (a, f = "px") => a == null || a === "" ? "0" : `${a}${f}`, R = (a, f, b, i = !0) => i ? Math.min(Math.max(a, f), b) : a;
function S(a, f, b, i) {
  a && a.addEventListener(f, b, i);
}
function D(a, f, b, i) {
  a && a.removeEventListener(f, b, i);
}
const g = (a, f = 1, b = re) => {
  const i = new Q(a).toDecimalPlaces(b).toNumber();
  return h(i, f);
}, W = (a) => {
  if (a === null || typeof a != "object")
    return a;
  if (a instanceof Date)
    return new Date(a.getTime());
  if (a instanceof Array)
    return a.map((f) => W(f));
  if (a instanceof Object) {
    const f = {};
    for (const b in a)
      a.hasOwnProperty(b) && (f[b] = W(a[b]));
    return f;
  }
  return a;
}, oe = (a) => {
  if ("touches" in a && a.touches.length > 0)
    return {
      x: a.touches[0].clientX,
      y: a.touches[0].clientY
    };
  if ("changedTouches" in a && a.changedTouches.length > 0)
    return {
      x: a.changedTouches[0].clientX,
      y: a.changedTouches[0].clientY
    };
  const f = a;
  return {
    x: f.clientX,
    y: f.clientY
  };
}, ze = ["onMousedown", "onTouchstart"], Ae = le({
  name: "VueMovableBox"
}), He = /* @__PURE__ */ le({
  ...Ae,
  props: {
    theme: { default: "#409EFD" },
    inActiveColor: { default: "#666666" },
    unitType: { default: "px" },
    scale: { default: 1 },
    isKeepDecimals: { type: Boolean, default: !1 },
    decimalPlaces: { default: 2 },
    draggable: { type: Boolean, default: !0 },
    resizeable: { type: Boolean, default: !0 },
    limitAreaForParent: { type: Boolean, default: !0 },
    limitAreaClass: {},
    modelValue: { default: () => ({
      left: 0,
      top: 0,
      width: 200,
      height: 100,
      zIndex: 1
    }) },
    maxWidth: {},
    maxHeight: {},
    minWidth: { default: 0 },
    minHeight: { default: 0 },
    ratioLock: { type: Boolean, default: !1 },
    active: { type: Boolean, default: !1 },
    disabledUserSelect: { type: Boolean, default: !0 },
    handles: { default: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"] },
    disabled: { type: Boolean, default: !1 },
    initRect: { type: Boolean, default: !1 }
  },
  emits: ["update:modelValue", "drag-start", "drag-stop", "resize-start", "resize-stop", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "move", "resize"],
  setup(a, { expose: f, emit: b }) {
    const i = a, m = b, t = ge({
      beforeClickConfig: { top: 0, left: 0, width: 0, height: 0 },
      initX: 0,
      initY: 0,
      parentElement: null,
      parentRectArea: null,
      ele: null,
      parentInfo: { width: 0, height: 0 },
      active: i.active,
      handle: null,
      rate: 1,
      isDragging: !1,
      isResizing: !1
    }), o = E({
      get() {
        return i.modelValue;
      },
      set(e) {
        m("update:modelValue", e);
      }
    }), V = pe(), ce = E(() => ({
      borderColor: i.disabled ? i.inActiveColor : t.active ? i.theme : i.inActiveColor,
      left: O(o.value.left, i.unitType),
      top: O(o.value.top, i.unitType),
      width: O(o.value.width, i.unitType),
      height: O(o.value.height, i.unitType),
      zIndex: o.value.zIndex,
      cursor: i.disabled ? "not-allowed" : t.isDragging ? "move" : t.isResizing ? "nwse-resize" : "default",
      pointerEvents: i.disabled ? "none" : "auto",
      opacity: t.active ? 1 : 0.9,
      // 硬件加速
      transform: "translateZ(0)",
      willChange: t.isDragging || t.isResizing ? "left, top" : "auto",
      // 禁用 CSS 过渡以获得更快的响应
      transition: "none"
    })), he = E(() => ({
      borderColor: i.resizeable ? i.theme : i.inActiveColor,
      scale: g(1 / h(i.scale, 1), 1)
    })), z = E(() => i.unitType === "%"), k = E(() => {
      const e = h(i.maxWidth, 0), n = i.limitAreaForParent ? e > t.parentInfo.width || !e ? t.parentInfo.width : e : 1 / 0;
      return z.value && (e ? Math.min(100, e) : 100) || n;
    }), C = E(() => {
      const e = h(i.maxHeight, 0), n = i.limitAreaForParent ? e > t.parentInfo.height || !e ? t.parentInfo.height : e : 1 / 0;
      return z.value && (e ? Math.min(100, e) : 100) || n;
    }), U = E(() => i.limitAreaForParent ? 0 : -1 / 0), _ = E(() => i.limitAreaForParent ? 0 : -1 / 0);
    Z(() => i.active, (e, n) => {
      e !== n && (t.active = e, m(e ? "active" : "inactive", W(o.value)));
    }), Z(() => i.disabled, (e) => {
      m("disabled", e);
    }), Z(() => i.isKeepDecimals, (e, n) => {
      e !== n && n === !0 && e === !1 && (o.value.left = Math.round(o.value.left), o.value.top = Math.round(o.value.top), o.value.width = Math.round(o.value.width), o.value.height = Math.round(o.value.height), m("update:modelValue", W(o.value)));
    });
    const fe = () => {
      var e;
      t.ele = document.documentElement || ((e = V.value) == null ? void 0 : e.parentElement) || V.value;
    }, r = (e, n) => {
      const l = z.value ? n === "w" ? h(e, 0) / t.parentInfo.width * 100 : h(e, 0) / t.parentInfo.height * 100 : e;
      return De(l, i.scale, i.isKeepDecimals, i.decimalPlaces);
    }, X = (e, n = null) => {
      j(e, n);
    }, Y = (e, n = null) => {
      e.cancelable && e.preventDefault(), j(e, n);
    }, j = (e, n) => {
      var v, p, H, I;
      if (i.disabled || i.initRect || !i.draggable && !i.resizeable || !n && !i.draggable || n && !i.resizeable) return;
      const { x: l, y: s } = oe(e);
      t.initX = l, t.initY = s, t.beforeClickConfig = W(o.value), t.active || (t.active = !0, m("active", W(o.value))), i.draggable && !n && (t.isDragging = !0, m("drag-start", e, t.beforeClickConfig)), i.resizeable && n && (t.isResizing = !0, m("resize-start", e, t.beforeClickConfig)), i.limitAreaForParent && (t.parentElement = i.limitAreaClass ? document.querySelector(i.limitAreaClass) || ((v = V.value) == null ? void 0 : v.parentElement) || null : ((p = V.value) == null ? void 0 : p.parentElement) || null, t.parentElement && (t.parentRectArea = t.parentElement.getBoundingClientRect(), t.parentInfo.height = ((H = t.parentElement) == null ? void 0 : H.clientHeight) || 0, t.parentInfo.width = ((I = t.parentElement) == null ? void 0 : I.clientWidth) || 0)), t.active = !0, t.handle = n, i.ratioLock && (t.rate = g(
        h(t.beforeClickConfig.width, 1) / h(t.beforeClickConfig.height, 1),
        1
      ));
      const d = { passive: !1 };
      S(t.ele, "mousemove", $, d), S(t.ele, "mouseup", F, d), S(t.ele, "touchmove", q, d), S(t.ele, "touchend", K, d), S(t.ele, "mouseleave", F, d);
    }, $ = (e) => {
      ee(e);
    }, q = (e) => {
      e.cancelable && e.preventDefault(), ee(e);
    };
    let A = null, N = !1;
    const ee = (e) => {
      t.active && (N = !0, A === null && (A = requestAnimationFrame(() => {
        if (A = null, !N) return;
        const { x: n, y: l } = oe(e), s = h(t.beforeClickConfig.left, 0), d = h(t.beforeClickConfig.top, 0), v = h(t.beforeClickConfig.width, 0), p = h(t.beforeClickConfig.height, 0), H = n - t.initX, I = l - t.initY;
        if (t.isDragging) {
          const M = s + r(H, "w"), u = d + r(I, "h");
          me(M, u, v, p), o.value.left = R(
            g(M),
            U.value,
            z.value ? 100 : t.parentInfo.width - v,
            i.limitAreaForParent
          ), o.value.top = R(
            g(u),
            _.value,
            z.value ? 100 : t.parentInfo.height - p,
            i.limitAreaForParent
          ), m("move", {
            left: o.value.left,
            top: o.value.top,
            width: o.value.width,
            height: o.value.height
          });
        }
        t.isResizing && t.handle && (de(s, d, v, p, H, I), m("resize", {
          left: o.value.left,
          top: o.value.top,
          width: o.value.width,
          height: o.value.height
        })), N = !1;
      })));
    }, de = (e, n, l, s, d, v) => {
      var I;
      const p = l / s || 1, H = {
        tl: () => {
          if (i.ratioLock) {
            const M = r(d, "w"), u = r(v, "h");
            let c = e + l - M, w = n + s - u, L = c - e, B = w - n;
            L / B > p ? L = B * p : B = L / p, L = Math.max(h(i.minWidth, 20), Math.min(L, k.value - e)), B = Math.max(h(i.minHeight, 20), Math.min(B, C.value - n)), x(g(L), k.value - e), y(g(B), C.value - n), P(e + l - o.value.width), T(n + s - o.value.height);
          } else
            x(l - r(d, "w"), e + l), y(s - r(v, "h"), n + s), P(e + r(d, "w")), T(n + r(v, "h"));
        },
        tm: () => {
          if (i.ratioLock) {
            const M = r(v, "h");
            let u = s - M;
            u = Math.max(h(i.minHeight, 20), Math.min(u, C.value - n));
            const c = u * p;
            y(g(u), C.value - n), x(g(c), k.value - e), T(n + s - o.value.height);
          } else
            y(s - r(v, "h"), n + s), T(n + r(v, "h"));
        },
        tr: () => {
          if (i.ratioLock) {
            const M = r(d, "w"), u = r(v, "h");
            let c = l + M, w = s - u;
            c / w > p ? c = w * p : w = c / p, c = Math.max(h(i.minWidth, 20), Math.min(c, k.value - e)), w = Math.max(h(i.minHeight, 20), Math.min(w, C.value - n)), x(g(c), k.value - e), y(g(w), C.value - n), T(n + s - o.value.height);
          } else
            y(s - r(v, "h"), n + s), T(n + r(v, "h")), x(l + r(d, "w"), k.value - e);
        },
        mr: () => {
          if (i.ratioLock) {
            const M = r(d, "w");
            let u = l + M;
            u = Math.max(h(i.minWidth, 20), Math.min(u, k.value - e));
            const c = u / p;
            x(g(u), k.value - e), y(g(c), C.value - n);
          } else
            x(l + r(d, "w"), k.value - e);
        },
        br: () => {
          if (i.ratioLock) {
            const M = r(d, "w"), u = r(v, "h");
            let c = l + M, w = s + u;
            c / w > p ? c = w * p : w = c / p, c = Math.max(h(i.minWidth, 20), Math.min(c, k.value - e)), w = Math.max(h(i.minHeight, 20), Math.min(w, C.value - n)), x(g(c), k.value - e), y(g(w), C.value - n);
          } else
            x(l + r(d, "w"), k.value - e), y(s + r(v, "h"), C.value - n);
        },
        bm: () => {
          if (i.ratioLock) {
            const M = r(v, "h");
            let u = s + M;
            u = Math.max(h(i.minHeight, 20), Math.min(u, C.value - n));
            const c = u * p;
            y(g(u), C.value - n), x(g(c), k.value - e);
          } else
            y(s + r(v, "h"), C.value - n);
        },
        bl: () => {
          if (i.ratioLock) {
            const M = r(d, "w"), u = r(v, "h");
            let c = l - M, w = s + u;
            c / w > p ? c = w * p : w = c / p, c = Math.max(h(i.minWidth, 20), Math.min(c, l + e)), w = Math.max(h(i.minHeight, 20), Math.min(w, C.value - n)), x(g(c), l + e), P(e + l - o.value.width), y(g(w), C.value - n);
          } else
            x(l - r(d, "w"), l + e), P(e + r(d, "w")), y(s + r(v, "h"), C.value - n);
        },
        ml: () => {
          if (i.ratioLock) {
            const M = r(d, "w");
            let u = l - M;
            u = Math.max(h(i.minWidth, 20), Math.min(u, l + e));
            const c = u / p;
            x(g(u), l + e), P(e + l - o.value.width), y(g(c), C.value - n);
          } else
            x(l - r(d, "w"), l + e), P(e + r(d, "w"));
        }
      };
      (I = H[t.handle]) == null || I.call(H), m("resize", W(o.value));
    }, x = (e, n) => {
      o.value.width = R(
        g(e),
        h(i.minWidth, U.value),
        n,
        i.limitAreaForParent
      );
    }, y = (e, n) => {
      o.value.height = R(
        g(e),
        h(i.minHeight, _.value),
        n,
        i.limitAreaForParent
      );
    }, P = (e) => {
      o.value.left = R(
        g(e),
        U.value,
        z.value ? 100 : t.parentInfo.width - h(o.value.width, 0),
        i.limitAreaForParent
      );
    }, T = (e) => {
      o.value.top = R(
        g(e),
        _.value,
        z.value ? 100 : t.parentInfo.height - h(o.value.height, 0),
        i.limitAreaForParent
      );
    }, me = (e, n, l, s) => {
      const d = z.value ? 100 : t.parentInfo.width - l, v = z.value ? 100 : t.parentInfo.height - s;
      e < 0 && m("out-of-bounds", "left"), n < 0 && m("out-of-bounds", "top"), e > d && m("out-of-bounds", "right"), n > v && m("out-of-bounds", "bottom");
    }, F = (e) => {
      te(e);
    }, K = (e) => {
      te(e);
    }, te = (e) => {
      A !== null && (cancelAnimationFrame(A), A = null), N = !1, i.draggable && t.isDragging && m("drag-stop", e, t.beforeClickConfig, { ...o.value }), i.resizeable && t.isResizing && m("resize-stop", e, t.beforeClickConfig, { ...o.value }), i.active || (t.active = !1, m("inactive", { ...o.value })), t.handle = null, t.isDragging = !1, t.isResizing = !1;
      const n = { passive: !1 };
      D(t.ele, "mousemove", $, n), D(t.ele, "mouseup", F, n), D(t.ele, "touchmove", q, n), D(t.ele, "touchend", K, n), D(t.ele, "mouseleave", F, n);
    }, ve = (e) => {
      m("dblclick", e);
    };
    return f({
      getConfig: () => W(o.value),
      setPosition: (e, n) => {
        o.value.left = e, o.value.top = n;
      },
      setSize: (e, n) => {
        o.value.width = e, o.value.height = n;
      },
      reset: () => {
        o.value = {
          left: 0,
          top: 0,
          width: 200,
          height: 100,
          zIndex: 1
        };
      },
      activate: () => {
        t.active = !0;
      },
      deactivate: () => {
        t.active = !1;
      }
    }), be(() => {
      if (A !== null && (cancelAnimationFrame(A), A = null), t.ele) {
        const e = { passive: !1 };
        D(t.ele, "mousemove", $, e), D(t.ele, "mouseup", F, e), D(t.ele, "touchmove", q, e), D(t.ele, "touchend", K, e), D(t.ele, "mouseleave", F, e);
      }
    }), fe(), (e, n) => (G(), J("div", {
      ref_key: "autoDraggableRef",
      ref: V,
      class: ne(["auto-draggable", {
        "select-none": a.disabledUserSelect,
        "is-disabled": a.disabled,
        "is-active": t.active,
        "is-dragging": t.isDragging,
        "is-resizing": t.isResizing,
        "is-readonly": a.initRect
      }]),
      style: ie(ce.value),
      onMousedown: n[0] || (n[0] = (l) => X(l, null)),
      onTouchstartPassive: n[1] || (n[1] = (l) => Y(l, null)),
      onDblclick: ve
    }, [
      (G(!0), J(we, null, Me(a.handles, (l) => Ce((G(), J("div", {
        key: l,
        class: ne(["handle", "handle-" + l]),
        style: ie(he.value),
        onMousedown: ae((s) => X(s, l), ["stop", "prevent"]),
        onTouchstart: ae((s) => Y(s, l), ["stop", "prevent"])
      }, null, 46, ze)), [
        [xe, t.active && a.resizeable && !a.disabled]
      ])), 128)),
      ye(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), We = (a, f) => {
  const b = a.__vccOpts || a;
  for (const [i, m] of f)
    b[i] = m;
  return b;
}, Ie = /* @__PURE__ */ We(He, [["__scopeId", "data-v-c3869c12"]]), se = "VueMovableBox", ue = (a) => {
  a.component(se, Ie);
}, Te = {
  name: se,
  version: "1.1.5-beta.1",
  install: ue
};
typeof window < "u" && window.Vue && window.Vue.use({ install: ue });
export {
  Ie as MovableBox,
  Te as default,
  se as name
};
