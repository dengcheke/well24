import normalizeWheel from 'normalize-wheel';
import {on} from "@well24/utils";

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export const bindMousewheel = function (element, callback, opts) {
    return on(element, isFirefox ? 'DOMMouseScroll' : 'mousewheel', function (event) {
        const normalized = normalizeWheel(event);
        callback && callback.apply(this, [event, normalized]);
    }, opts);
};
const map = /*#__PURE__*/new WeakMap();
export const vMouseWheel = {
    bind(el, binding) {
        const _off = map.get(el);
        if (_off) {
            _off()
            map.delete(el)
        }
        const off = bindMousewheel(el, binding.value, {
            passive: binding.modifiers.passive || false,
            capture: binding.modifiers.capture || false,
        });
        map.set(el, off);
    },
    unbind(el) {
        const _off = map.get(el);
        if (_off) {
            _off()
            map.delete(el)
        }
    }
};
vMouseWheel.install = function (Vue) {
    Vue.directive('mouseWheel', vMouseWheel)
}
