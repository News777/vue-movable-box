import { defineComponent as se, reactive as xe, computed as L, ref as ye, watch as J, onUnmounted as De, openBlock as Q, createElementBlock as X, normalizeStyle as ne, normalizeClass as oe, Fragment as ke, renderList as Ce, withDirectives as Te, withModifiers as le, vShow as ze, renderSlot as Ae } from "vue";
import Y from "decimal.js";
const ue = 2, He = 1, h = (o, g = 1) => {
  if (o == null || o === "")
    return g;
  const w = typeof o == "string" ? parseFloat(o) : o;
  return isNaN(w) ? g : w;
}, Ee = (o, g, w = !1, t = ue) => {
  const v = h(g, He), i = h(o);
  if (v === 0)
    return w ? new Y(i).toDecimalPlaces(t).toNumber() : Math.round(i);
  const n = i / v;
  return w ? new Y(n).toDecimalPlaces(t).toNumber() : Math.round(n);
}, G = (o, g = "px") => o == null || o === "" ? "0" : `${o}${g}`, N = (o, g, w, t = !0) => t ? Math.min(Math.max(o, g), w) : o;
function V(o, g, w, t) {
  o && o.addEventListener(g, w, t);
}
function A(o, g, w, t) {
  o && o.removeEventListener(g, w, t);
}
const b = (o, g = 1, w = ue) => {
  const t = new Y(o).toDecimalPlaces(w).toNumber();
  return h(t, g);
}, E = (o) => {
  if (o === null || typeof o != "object")
    return o;
  if (o instanceof Date)
    return new Date(o.getTime());
  if (o instanceof Array)
    return o.map((g) => E(g));
  if (o instanceof Object) {
    const g = {};
    for (const w in o)
      o.hasOwnProperty(w) && (g[w] = E(o[w]));
    return g;
  }
  return o;
}, re = (o) => {
  if ("touches" in o && o.touches.length > 0)
    return {
      x: o.touches[0].clientX,
      y: o.touches[0].clientY
    };
  if ("changedTouches" in o && o.changedTouches.length > 0)
    return {
      x: o.changedTouches[0].clientX,
      y: o.changedTouches[0].clientY
    };
  const g = o;
  return {
    x: g.clientX,
    y: g.clientY
  };
}, Le = ["onMousedown", "onTouchstart"], Ie = se({
  name: "VueMovableBox"
}), We = /* @__PURE__ */ se({
  ...Ie,
  props: {
    theme: { default: "#409EFD" },
    inActiveColor: { default: "#666666" },
    unitType: { default: "px" },
    scale: { default: 1 },
    isKeepDecimals: { type: Boolean, default: !1 },
    decimalPlaces: { default: 2 },
    draggable: { type: Boolean, default: !0 },
    resizeable: { type: Boolean },
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
    initRect: { type: Boolean, default: !1 },
    edgeDistance: { default: 0 },
    snapToGrid: { type: Boolean, default: !1 },
    gridSize: { default: 20 },
    dragDirections: { default: () => ["top", "bottom", "left", "right"] },
    resizeDirections: { default: () => ["tl", "tm", "tr", "mr", "br", "bm", "bl", "ml"] },
    enableTransition: { type: Boolean, default: !1 },
    keyboardEnabled: { type: Boolean, default: !1 },
    keyboardStep: { default: 1 },
    boundsMargin: { default: () => ({ top: 0, right: 0, bottom: 0, left: 0 }) },
    snapToElements: { type: Boolean, default: !1 },
    snapThreshold: { default: 10 },
    collisionEnabled: { type: Boolean, default: !1 },
    allowOverlap: { type: Boolean, default: !1 },
    snapTargets: { default: () => [] }
  },
  emits: ["update:modelValue", "drag-start", "drag-stop", "resize-start", "resize-stop", "active", "inactive", "disabled", "dblclick", "out-of-bounds", "move", "resize", "snap", "guides", "collision"],
  setup(o, { expose: g, emit: w }) {
    const t = o, v = w, i = xe({
      beforeClickConfig: { top: 0, left: 0, width: 0, height: 0 },
      initX: 0,
      initY: 0,
      parentElement: null,
      parentRectArea: null,
      ele: null,
      parentInfo: { width: 0, height: 0 },
      active: t.active,
      handle: null,
      rate: 1,
      isDragging: !1,
      isResizing: !1
    }), n = L({
      get() {
        return t.modelValue;
      },
      set(e) {
        v("update:modelValue", e);
      }
    }), S = ye(), de = L(() => ({
      borderColor: t.disabled ? t.inActiveColor : i.active ? t.theme : t.inActiveColor,
      left: G(n.value.left, t.unitType),
      top: G(n.value.top, t.unitType),
      width: G(n.value.width, t.unitType),
      height: G(n.value.height, t.unitType),
      zIndex: n.value.zIndex,
      cursor: t.disabled ? "not-allowed" : i.isDragging ? "move" : i.isResizing ? "nwse-resize" : "default",
      pointerEvents: t.disabled ? "none" : "auto",
      opacity: i.active ? 1 : 0.9,
      // 硬件加速
      transform: "translateZ(0)",
      willChange: i.isDragging || i.isResizing ? "left, top, width, height" : "auto",
      // 过渡动画（仅在启用且非拖拽时）
      transition: t.enableTransition && !i.isDragging && !i.isResizing ? "left 0.2s ease, top 0.2s ease, width 0.2s ease, height 0.2s ease" : "none"
    })), he = L(() => ({
      borderColor: t.resizeable ? t.theme : t.inActiveColor,
      scale: b(1 / h(t.scale, 1), 1)
    })), C = L(() => t.unitType === "%"), k = L(() => {
      const e = h(t.maxWidth, 0), a = t.limitAreaForParent ? e > i.parentInfo.width || !e ? i.parentInfo.width : e : 1 / 0;
      return C.value && (e ? Math.min(100, e) : 100) || a;
    }), x = L(() => {
      const e = h(t.maxHeight, 0), a = t.limitAreaForParent ? e > i.parentInfo.height || !e ? i.parentInfo.height : e : 1 / 0;
      return C.value && (e ? Math.min(100, e) : 100) || a;
    }), K = L(() => t.limitAreaForParent ? 0 : -1 / 0), $ = L(() => t.limitAreaForParent ? 0 : -1 / 0);
    J(() => t.active, (e, a) => {
      e !== a && (i.active = e, v(e ? "active" : "inactive", E(n.value)));
    }), J(() => t.disabled, (e) => {
      v("disabled", e);
    }), J(() => t.isKeepDecimals, (e, a) => {
      e !== a && a === !0 && e === !1 && (n.value.left = Math.round(n.value.left), n.value.top = Math.round(n.value.top), n.value.width = Math.round(n.value.width), n.value.height = Math.round(n.value.height), v("update:modelValue", E(n.value)));
    });
    const me = () => {
      var e;
      i.ele = document.documentElement || ((e = S.value) == null ? void 0 : e.parentElement) || S.value;
    }, c = (e, a) => {
      const l = C.value ? a === "w" ? h(e, 0) / i.parentInfo.width * 100 : h(e, 0) / i.parentInfo.height * 100 : e;
      return Ee(l, t.scale, t.isKeepDecimals, t.decimalPlaces);
    }, ge = (e) => t.resizeDirections.includes(e), O = (e) => t.dragDirections.includes(e), I = (e) => {
      if (!t.snapToGrid) return e;
      const a = t.gridSize || 20;
      return Math.round(e / a) * a;
    }, ve = (e) => {
      if (!t.keyboardEnabled || t.disabled || !i.active) return;
      const a = t.keyboardStep || 1;
      let l = !1, r = n.value.left, s = n.value.top;
      switch (e.key) {
        case "ArrowUp":
          O("top") && (s = I(Number(s) - a), l = !0);
          break;
        case "ArrowDown":
          O("bottom") && (s = I(Number(s) + a), l = !0);
          break;
        case "ArrowLeft":
          O("left") && (r = I(Number(r) - a), l = !0);
          break;
        case "ArrowRight":
          O("right") && (r = I(Number(r) + a), l = !0);
          break;
        case "Escape":
          i.active = !1;
          break;
        default:
          return;
      }
      if (l) {
        e.preventDefault();
        const f = pe();
        r = Math.max(f.minLeft, Math.min(f.maxLeft, r)), s = Math.max(f.minTop, Math.min(f.maxTop, s)), n.value.left = b(r), n.value.top = b(s), v("update:modelValue", { ...n.value }), v("move", { ...n.value });
      }
    }, pe = () => {
      const e = t.boundsMargin || { top: 0, right: 0, bottom: 0, left: 0 }, a = t.edgeDistance || 0, l = e.top || 0, r = e.right || 0, s = e.bottom || 0, f = e.left || 0;
      let m = f || a, z = C.value ? 100 - r - a - Number(n.value.width) : i.parentInfo.width - r - a - Number(n.value.width), T = l || a, M = C.value ? 100 - s - a - Number(n.value.height) : i.parentInfo.height - s - a - Number(n.value.height);
      return t.limitAreaForParent && (C.value || (m = Math.max(0, f), T = Math.max(0, l))), { minLeft: m, maxLeft: Math.max(m, z), minTop: T, maxTop: Math.max(T, M) };
    }, j = (e, a = null) => {
      te(e, a);
    }, ee = (e, a = null) => {
      e.cancelable && e.preventDefault(), te(e, a);
    }, te = (e, a) => {
      var f, m, z, T;
      if (t.disabled || t.initRect || !t.draggable && !t.resizeable || !a && !t.draggable || a && !t.resizeable) return;
      const { x: l, y: r } = re(e);
      i.initX = l, i.initY = r, i.beforeClickConfig = E(n.value), i.active || (i.active = !0, v("active", E(n.value))), t.draggable && !a && (i.isDragging = !0, v("drag-start", e, i.beforeClickConfig)), t.resizeable && a && (i.isResizing = !0, v("resize-start", e, i.beforeClickConfig)), t.limitAreaForParent && (i.parentElement = t.limitAreaClass ? document.querySelector(t.limitAreaClass) || ((f = S.value) == null ? void 0 : f.parentElement) || null : ((m = S.value) == null ? void 0 : m.parentElement) || null, i.parentElement && (i.parentRectArea = i.parentElement.getBoundingClientRect(), i.parentInfo.height = ((z = i.parentElement) == null ? void 0 : z.clientHeight) || 0, i.parentInfo.width = ((T = i.parentElement) == null ? void 0 : T.clientWidth) || 0)), i.active = !0, i.handle = a, t.ratioLock && (i.rate = b(
        h(i.beforeClickConfig.width, 1) / h(i.beforeClickConfig.height, 1),
        1
      ));
      const s = { passive: !1 };
      V(i.ele, "mousemove", q, s), V(i.ele, "mouseup", P, s), V(i.ele, "touchmove", Z, s), V(i.ele, "touchend", _, s), V(i.ele, "mouseleave", P, s);
    }, q = (e) => {
      ie(e);
    }, Z = (e) => {
      e.cancelable && e.preventDefault(), ie(e);
    };
    let H = null, U = !1;
    const ie = (e) => {
      i.active && (U = !0, H === null && (H = requestAnimationFrame(() => {
        if (H = null, !U) return;
        const { x: a, y: l } = re(e), r = h(i.beforeClickConfig.left, 0), s = h(i.beforeClickConfig.top, 0), f = h(i.beforeClickConfig.width, 0), m = h(i.beforeClickConfig.height, 0), z = a - i.initX, T = l - i.initY;
        if (i.isDragging) {
          const M = r + c(z, "w"), d = s + c(T, "h");
          we(M, d, f, m);
          let u = b(M), p = b(d);
          t.snapToGrid && (u = I(u), p = I(p)), n.value.left = N(
            u,
            K.value,
            C.value ? 100 : i.parentInfo.width - f,
            t.limitAreaForParent
          ), n.value.top = N(
            p,
            $.value,
            C.value ? 100 : i.parentInfo.height - m,
            t.limitAreaForParent
          ), v("move", {
            left: n.value.left,
            top: n.value.top,
            width: n.value.width,
            height: n.value.height
          });
        }
        i.isResizing && i.handle && (be(r, s, f, m, z, T), v("resize", {
          left: n.value.left,
          top: n.value.top,
          width: n.value.width,
          height: n.value.height
        })), U = !1;
      })));
    }, be = (e, a, l, r, s, f) => {
      var T;
      const m = l / r || 1, z = {
        tl: () => {
          if (t.ratioLock) {
            const M = c(s, "w"), d = c(f, "h");
            let u = e + l - M, p = a + r - d, F = u - e, R = p - a;
            F / R > m ? F = R * m : R = F / m, F = Math.max(h(t.minWidth, 20), Math.min(F, k.value - e)), R = Math.max(h(t.minHeight, 20), Math.min(R, x.value - a)), y(b(F), k.value - e), D(b(R), x.value - a), W(e + l - n.value.width), B(a + r - n.value.height);
          } else
            y(l - c(s, "w"), e + l), D(r - c(f, "h"), a + r), W(e + c(s, "w")), B(a + c(f, "h"));
        },
        tm: () => {
          if (t.ratioLock) {
            const M = c(f, "h");
            let d = r - M;
            d = Math.max(h(t.minHeight, 20), Math.min(d, x.value - a));
            const u = d * m;
            D(b(d), x.value - a), y(b(u), k.value - e), B(a + r - n.value.height);
          } else
            D(r - c(f, "h"), a + r), B(a + c(f, "h"));
        },
        tr: () => {
          if (t.ratioLock) {
            const M = c(s, "w"), d = c(f, "h");
            let u = l + M, p = r - d;
            u / p > m ? u = p * m : p = u / m, u = Math.max(h(t.minWidth, 20), Math.min(u, k.value - e)), p = Math.max(h(t.minHeight, 20), Math.min(p, x.value - a)), y(b(u), k.value - e), D(b(p), x.value - a), B(a + r - n.value.height);
          } else
            D(r - c(f, "h"), a + r), B(a + c(f, "h")), y(l + c(s, "w"), k.value - e);
        },
        mr: () => {
          if (t.ratioLock) {
            const M = c(s, "w");
            let d = l + M;
            d = Math.max(h(t.minWidth, 20), Math.min(d, k.value - e));
            const u = d / m;
            y(b(d), k.value - e), D(b(u), x.value - a);
          } else
            y(l + c(s, "w"), k.value - e);
        },
        br: () => {
          if (t.ratioLock) {
            const M = c(s, "w"), d = c(f, "h");
            let u = l + M, p = r + d;
            u / p > m ? u = p * m : p = u / m, u = Math.max(h(t.minWidth, 20), Math.min(u, k.value - e)), p = Math.max(h(t.minHeight, 20), Math.min(p, x.value - a)), y(b(u), k.value - e), D(b(p), x.value - a);
          } else
            y(l + c(s, "w"), k.value - e), D(r + c(f, "h"), x.value - a);
        },
        bm: () => {
          if (t.ratioLock) {
            const M = c(f, "h");
            let d = r + M;
            d = Math.max(h(t.minHeight, 20), Math.min(d, x.value - a));
            const u = d * m;
            D(b(d), x.value - a), y(b(u), k.value - e);
          } else
            D(r + c(f, "h"), x.value - a);
        },
        bl: () => {
          if (t.ratioLock) {
            const M = c(s, "w"), d = c(f, "h");
            let u = l - M, p = r + d;
            u / p > m ? u = p * m : p = u / m, u = Math.max(h(t.minWidth, 20), Math.min(u, l + e)), p = Math.max(h(t.minHeight, 20), Math.min(p, x.value - a)), y(b(u), l + e), W(e + l - n.value.width), D(b(p), x.value - a);
          } else
            y(l - c(s, "w"), l + e), W(e + c(s, "w")), D(r + c(f, "h"), x.value - a);
        },
        ml: () => {
          if (t.ratioLock) {
            const M = c(s, "w");
            let d = l - M;
            d = Math.max(h(t.minWidth, 20), Math.min(d, l + e));
            const u = d / m;
            y(b(d), l + e), W(e + l - n.value.width), D(b(u), x.value - a);
          } else
            y(l - c(s, "w"), l + e), W(e + c(s, "w"));
        }
      };
      (T = z[i.handle]) == null || T.call(z), v("resize", E(n.value));
    }, y = (e, a) => {
      n.value.width = N(
        b(e),
        h(t.minWidth, K.value),
        a,
        t.limitAreaForParent
      );
    }, D = (e, a) => {
      n.value.height = N(
        b(e),
        h(t.minHeight, $.value),
        a,
        t.limitAreaForParent
      );
    }, W = (e) => {
      n.value.left = N(
        b(e),
        K.value,
        C.value ? 100 : i.parentInfo.width - h(n.value.width, 0),
        t.limitAreaForParent
      );
    }, B = (e) => {
      n.value.top = N(
        b(e),
        $.value,
        C.value ? 100 : i.parentInfo.height - h(n.value.height, 0),
        t.limitAreaForParent
      );
    }, we = (e, a, l, r) => {
      const s = C.value ? 100 : i.parentInfo.width - l, f = C.value ? 100 : i.parentInfo.height - r;
      e < 0 && v("out-of-bounds", "left"), a < 0 && v("out-of-bounds", "top"), e > s && v("out-of-bounds", "right"), a > f && v("out-of-bounds", "bottom");
    }, P = (e) => {
      ae(e);
    }, _ = (e) => {
      ae(e);
    }, ae = (e) => {
      H !== null && (cancelAnimationFrame(H), H = null), U = !1, t.draggable && i.isDragging && v("drag-stop", e, i.beforeClickConfig, { ...n.value }), t.resizeable && i.isResizing && v("resize-stop", e, i.beforeClickConfig, { ...n.value }), t.active || (i.active = !1, v("inactive", { ...n.value })), i.handle = null, i.isDragging = !1, i.isResizing = !1;
      const a = { passive: !1 };
      A(i.ele, "mousemove", q, a), A(i.ele, "mouseup", P, a), A(i.ele, "touchmove", Z, a), A(i.ele, "touchend", _, a), A(i.ele, "mouseleave", P, a);
    }, Me = (e) => {
      v("dblclick", e);
    };
    return g({
      getConfig: () => E(n.value),
      setPosition: (e, a) => {
        n.value.left = e, n.value.top = a;
      },
      setSize: (e, a) => {
        n.value.width = e, n.value.height = a;
      },
      reset: () => {
        n.value = {
          left: 0,
          top: 0,
          width: 200,
          height: 100,
          zIndex: 1
        };
      },
      activate: () => {
        i.active = !0;
      },
      deactivate: () => {
        i.active = !1;
      }
    }), De(() => {
      if (H !== null && (cancelAnimationFrame(H), H = null), i.ele) {
        const e = { passive: !1 };
        A(i.ele, "mousemove", q, e), A(i.ele, "mouseup", P, e), A(i.ele, "touchmove", Z, e), A(i.ele, "touchend", _, e), A(i.ele, "mouseleave", P, e);
      }
    }), me(), (e, a) => (Q(), X("div", {
      ref_key: "autoDraggableRef",
      ref: S,
      class: oe(["auto-draggable", {
        "select-none": o.disabledUserSelect,
        "is-disabled": o.disabled,
        "is-active": i.active,
        "is-dragging": i.isDragging,
        "is-resizing": i.isResizing,
        "is-readonly": o.initRect,
        "is-transition": o.enableTransition
      }]),
      style: ne(de.value),
      onMousedown: a[0] || (a[0] = (l) => j(l, null)),
      onTouchstartPassive: a[1] || (a[1] = (l) => ee(l, null)),
      onDblclick: Me,
      onKeydown: ve,
      tabindex: "0"
    }, [
      (Q(!0), X(ke, null, Ce(o.handles, (l) => Te((Q(), X("div", {
        key: l,
        class: oe(["handle", "handle-" + l]),
        style: ne(he.value),
        onMousedown: le((r) => j(r, l), ["stop", "prevent"]),
        onTouchstart: le((r) => ee(r, l), ["stop", "prevent"])
      }, null, 46, Le)), [
        [ze, i.active && o.resizeable && !o.disabled && ge(l)]
      ])), 128)),
      Ae(e.$slots, "default", {}, void 0, !0)
    ], 38));
  }
}), Be = (o, g) => {
  const w = o.__vccOpts || o;
  for (const [t, v] of g)
    w[t] = v;
  return w;
}, Pe = /* @__PURE__ */ Be(We, [["__scopeId", "data-v-7b8113e4"]]), ce = "VueMovableBox", fe = (o) => {
  o.component(ce, Pe);
}, Ne = {
  name: ce,
  version: "1.1.5-beta.1",
  install: fe
};
typeof window < "u" && window.Vue && window.Vue.use({ install: fe });
export {
  Pe as MovableBox,
  Ne as default,
  ce as name
};
