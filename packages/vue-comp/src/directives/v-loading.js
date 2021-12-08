import Vue from 'vue'
import Loading from '@src/packages/loading'

const map = new WeakMap();

const toggleLoading = (el, binding) => {
    const mask = map.get(el);
    if (!mask) return;
    const show = binding?.value || false;
    mask.show = show;
    if(show){
        el.appendChild(mask.$el);
    }else{
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
        toggleLoading(el);
        const mask = map.get(el);
        map.delete(el);
        mask?.$destroy();
    }
}
