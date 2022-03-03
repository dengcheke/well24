import Loading from '@src/packages/loading'
import Vue from 'vue'
const map = /*#__PURE__*/new WeakMap();
const toggleLoading = (el, binding) => {
    const mask = map.get(el);
    if (!mask) return;
    const param = binding?.value;
    if (Object.prototype.toString.call(param) === '[object Object]') {
        mask.show = param.show !== false;
        mask.content = param.content;
        mask.boxClass = param.boxClass || "";
    } else {
        mask.show = param !== false
        mask.content = null;
        mask.boxClass = "";
    }
    if (mask.show) {
        el.appendChild(mask.$el);
    } else {
        el.contains(mask.$el) && el.removeChild(mask.$el);
    }
}
export const vLoading = {
    bind(el, binding, vnode) {
        const mask = new Vue(Loading).$mount(document.createElement('div'));
        map.set(el, mask);
        toggleLoading(el, binding);
    },
    update(el, binding) {
        toggleLoading(el, binding)
    },
    unbind(el, binding) {
        toggleLoading(el,binding);
        const mask = map.get(el);
        map.delete(el);
        mask?.$destroy();
    }
}
vLoading.install = function (Vue) {
    Vue.directive('loading', vLoading)
}
