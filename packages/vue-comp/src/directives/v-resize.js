import Vue from 'vue'
import {addClass, dragHelper, on, rafThrottle, removeClass,clamp} from "@well24/utils";

const map = new Map();

const defaultOptions = {
    resizableClass: 'v-resizable',
    draggedClass: 'v-dragged',
    resizingClass: 'v-resizing',
    directions: ['bottom', 'right'],
    zoneSize: 5,
    sizeRange: null, //[minWidth,maxWidth,minHeight,MaxHeight] 不传=无穷大
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
    if (obj === undefined || obj === null) obj = {};
    if (obj === false) obj = {enable: false}
    if (obj instanceof Function) {
        obj = {
            onResize: obj
        }
    }
    const res = {};
    res.enable = obj.enable !== false;
    Object.keys(defaultOptions).forEach(key => {
        res[key] = obj[key] || defaultOptions[key]
    })
    if (res.directions === 'all') {
        res.directions = ['bottom', 'right', 'top', 'left']
    }
    let [minw, maxw, minh, maxh] = res.sizeRange || [];
    minw = isNil(minw) ? 0 : +minw;
    maxw = isNil(maxw) ? Infinity : +maxw;
    minh = isNil(minh) ? 0 : +minh;
    maxh = isNil(maxh) ? Infinity : +maxh;
    res.sizeRange = [minw, maxw, minh, maxh]
    return res;

    function isNil(v) {
        return v === undefined || v === null || v === '' || isNaN(v)
    }
}

export const vResize = {
    inserted(el, binding) {
        const _state = new Vue({
            data() {
                this.rect = el.getBoundingClientRect();
                this.target = el;
                const off = on(document, 'pointermove', rafThrottle((e) => {
                    if (!this.enable) return;
                    if (this.isDragged) return
                    this.rect = el.getBoundingClientRect();
                    this.checkHit(e.clientX, e.clientY);
                }));
                const off2 = on(document, 'pointerleave', () => {
                    if (!this.enable) return;
                    this.isResizable = false;
                    this.isDragged = false;
                    this.isResizing = false;
                })
                this.$once('hook:beforeDestroy', () => {
                    off();
                    off2();
                    document.body.style.cursor = ''
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
            methods: {
                checkHit(x, y) {
                    const {rect, zoneSize} = this;

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
                        bottom: rect.bottom - y  <= zoneSize,
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
                    document.body.style.cursor = newv ? cursorMap[newv] : null
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
        const off = dragHelper(document.body, ({e, type, state, cancel}) => {
            if (!_state.enable) return;
            if (type === 'start') {
                if (state.isResizable) {
                    e.preventDefault();
                    el.style.userSelect = 'none';
                    state.isDragged = true;
                    return true
                }
                return false;
            } else if (type === 'move') {
                if (!state.isDragged || !state.direction) return;
                const rect = state.rect = el.getBoundingClientRect();
                const drs = state.direction.split('-');
                const [minWidth, maxWidth, minHeight, maxHeight] = state.sizeRange;
                let width = null, height = null;
                const frameMap = {
                    top() {
                        height = clamp(rect.bottom - e.clientY, minHeight, maxHeight)
                        this.target.style.height = `${height}px`
                    },
                    bottom() {
                        height = clamp(e.clientY - rect.top, minHeight, maxHeight)
                        this.target.style.height = `${height}px`
                    },
                    left() {
                        width = clamp(rect.right - e.clientX, minWidth, maxWidth)
                        this.target.style.width = `${width}px`
                    },
                    right() {
                        width = clamp(e.clientX - rect.left, minWidth, maxWidth)
                        this.target.style.width = `${width}px`
                    },
                }
                drs.forEach(dir => {
                    frameMap[dir].call(state)
                })
                state.onResize && state.onResize({
                    direction: state.direction,
                    target: state.target,
                    event: e,
                    size: [width, height],
                    oldSize: [rect.width, rect.height]
                })
            } else if (type === 'end') {
                state.isResizable = false;
                state.isDragged = false;
                state.isResizing = false;
                el.style.userSelect = 'auto';
            }
        }, _state);
        map.set(el, {
            state: _state,
            off: () => {
                _state.$destroy();
                off();
            }
        })
    },
    update(el, {value, oldValue}, vnode) {
        const obj = map.get(el);
        if (!obj) return;
        value && Object.assign(obj.state, checkProp(value))
    },
    unbind(el) {
        const obj = map.get(el);
        if (!obj) return;
        obj.off();
        map.delete(el);
    },
}
