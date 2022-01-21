import {addClass, clamp, dragHelper, getStyle, on, rafThrottle, removeClass} from "@well24/utils";
import Vue from 'vue';
const map = /*#__PURE__*/new Map();

const defaultOptions = {
    resizableClass: 'v-resizable',
    draggedClass: 'v-dragged',
    resizingClass: 'v-resizing',
    directions: ['bottom', 'right'],
    zoneSize: 5,
    onResize: null
}
export const cursorMap = {
    top: 'n-resize',
    bottom: 's-resize',
    left: 'w-resize',
    right: 'e-resize',
    'left-top': 'nw-resize',
    'bottom-right': 'se-resize',
    'right-top': 'ne-resize',
    'bottom-left': 'sw',
}

function checkProp(obj) {
    if (obj === false) {
        obj = {enable: false}
    } else if (obj instanceof Function) {
        obj = {onResize: obj};
    } else if (Object.prototype.toString.call(obj) !== '[object Object]') {
        obj = {}
    }
    const res = {};
    res.enable = obj.enable !== false;
    Object.keys(defaultOptions).forEach(key => {
        res[key] = obj[key] || defaultOptions[key]
    })
    if (res.directions === 'all') {
        res.directions = ['bottom', 'right', 'top', 'left']
    }
    return res;
}

export const vResize = {
    inserted(el, binding) {
        const vm = new Vue({
            data() {
                const off = on(el, 'pointermove', rafThrottle((e) => {
                    if (!this.enable) return;
                    if (this.isDragged) return
                    const rect = el.getBoundingClientRect();
                    checkHit.call(this, e.clientX, e.clientY);

                    function checkHit(x, y) {
                        const {zoneSize} = this;

                        const isInside = (
                            y >= rect.top && y <= rect.bottom &&
                            x >= rect.left && x <= rect.right
                        )

                        if (!isInside) {
                            this.direction = null;
                            this.isResizable = false;
                            return
                        }
                        const checkMap = {
                            top: y - rect.top <= zoneSize,
                            bottom: rect.bottom - y <= zoneSize,
                            left: x - rect.left <= zoneSize,
                            right: rect.right - x <= zoneSize
                        }

                        const res = this.directions.sort().filter(item => checkMap[item])

                        if (res.length) {
                            this.direction = res.join('-')
                            this.isResizable = true
                        } else {
                            this.direction = null
                            this.isResizable = false
                        }
                        el.style.cursor = this.direction ? cursorMap[this.direction] : null;
                    }
                }));
                const off2 = on(el, 'pointerleave', () => {
                    if (!this.enable) return;
                    if (this.isDragged) return;
                    this.isResizable = false;
                    this.isDragged = false;
                    this.isResizing = false;
                })
                this.$once('hook:beforeDestroy', () => {
                    off();
                    off2();
                })
                return {
                    enable: true,
                    isResizable: false,
                    isDragged: false,
                    isResizing: false,
                    direction: null,
                    ...checkProp(binding.value)
                }
            },
            watch: {
                resizableClass(newclass, oldclass) {
                    oldclass && removeClass(el, oldclass);
                    this.isResizable && addClass(el, newclass);
                },
                draggedClass(newclass, oldclass) {
                    oldclass && removeClass(el, oldclass)
                    this.isDragged && addClass(el, newclass);
                },
                resizingClass(newclass, oldclass) {
                    oldclass && removeClass(el, oldclass);
                    this.isResizing && addClass(el, newclass);
                },
                direction(newv) {
                    el.style.cursor = newv ? cursorMap[newv] : null
                },
                isResizable(v) {
                    v ? addClass(el, this.resizableClass) : removeClass(el, this.resizableClass)
                },
                isDragged(v) {
                    v ? addClass(el, this.draggedClass) : removeClass(el, this.draggedClass)
                },
                isResizing(v) {
                    v ? addClass(el, this.resizingClass) : removeClass(el, this.resizingClass)
                }
            }
        });
        const off = dragHelper(document.body, ({e, type, state}) => {
            if (!vm.enable) return;
            if (type === 'start') {
                if (vm.isResizable && vm.direction) {
                    el.style.userSelect = 'none';
                    vm.isDragged = true;
                    state.rect = el.getBoundingClientRect();
                    state.x = e.clientX;
                    state.y = e.clientY;
                    state.direction = vm.direction;
                    const style = getStyle(el);
                    let minWidth = style.minWidth;
                    let minHeight = style.minHeight;
                    let maxWidth = style.maxWidth;
                    let maxHeight = style.maxHeight;
                    minWidth = minWidth === 'none' ? 0 : +minWidth.replace('px', '');
                    minHeight = minHeight === 'none' ? 0 : +minHeight.replace('px', '');
                    maxWidth = maxWidth === 'none' ? Infinity : +maxWidth.replace('px', '');
                    maxHeight = maxHeight === 'none' ? Infinity : +maxHeight.replace('px', '');
                    state.sizeRange = [minWidth, maxWidth, minHeight, maxHeight];
                    return true
                }
                return false;
            } else if (type === 'move') {
                vm.isResizing = true;
                const {rect, x, y, direction, sizeRange} = state;
                const drs = direction.split('-');
                const [minWidth, maxWidth, minHeight, maxHeight] = sizeRange;
                const moveX = e.clientX - x;
                const moveY = e.clientY - y;
                const frameMap = {
                    top() {
                        el.style.height = `${clamp(rect.height - moveY, minHeight, maxHeight)}px`
                    },
                    bottom() {
                        el.style.height = `${clamp(rect.height + moveY, minHeight, maxHeight)}px`
                    },
                    left() {
                        el.style.width = `${clamp(rect.width - moveX, minWidth, maxWidth)}px`
                    },
                    right() {
                        el.style.width = `${clamp(rect.width + moveX, minWidth, maxWidth)}px`
                    },
                }
                drs.forEach(dir => frameMap[dir].call(state))
                state.onResize && state.onResize({
                    direction: state.direction,
                    target: el,
                    event: e,
                })
            } else if (type === 'end') {
                vm.isResizable = false;
                vm.isDragged = false;
                vm.isResizing = false;
                el.style.userSelect = 'auto';
            }
        }, {});
        map.set(el, {
            vm: vm,
            off: () => {
                vm.$destroy();
                off();
            }
        })
    },
    update(el, {value, oldValue}, vnode) {
        const obj = map.get(el);
        if (!obj) return;
        value && Object.assign(obj.vm, checkProp(value))
    },
    unbind(el) {
        const obj = map.get(el);
        if (!obj) return;
        obj.off();
        map.delete(el);
    },
}
vResize.install = function (Vue) {
    Vue.directive('resize', vResize)
}
