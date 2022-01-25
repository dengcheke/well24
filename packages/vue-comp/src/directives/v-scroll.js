import {bindMousewheel} from "./v-mousewheel";
import {clamp} from "@well24/utils";

const map = /*#__PURE__*/new WeakMap();

function cubicInOut(k) {
    if ((k *= 2) < 1) return 0.5 * k * k * k;
    return 0.5 * ((k -= 2) * k * k + 2);
}

const OneFrameTime = 1000 / 60;
const getTime = () => {
    return performance.now();
}

class ScrollManage {
    constructor({onTick, durFrames, easing}) {
        this.easingFunc = easing instanceof Function ? easing : cubicInOut;
        this.onTick = onTick;
        this.durFrames = durFrames || 30;
        this.clearState();
        this.timer = null;
    }

    clearState() {
        this.isScrolling = false;
        this.from = this.to = this.curValue = this.dur = this.startTime = 0;
    }

    setTimer() {
        this.startTime = getTime();
        this.curValue = this.from;
        this.isScrolling = true;
        const self = this;
        this.timer = requestAnimationFrame(function step() {
            const cur = getTime();
            let percent = self.easingFunc((cur - self.startTime) / self.dur);
            if (percent >= 1.0) percent = 1.0;
            self.curValue = self.from + (self.to - self.from) * percent;
            if (percent < 1.0) {
                self.timer = requestAnimationFrame(step);
                self.onTick(self.curValue);
            } else {
                self.isScrolling = false;
            }
        })
    }

    start(from, to) {
        this.clearState();
        cancelAnimationFrame(this.timer);
        this.from = from;
        this.to = to;
        this.dur = OneFrameTime * this.durFrames;
        this.setTimer()
    }

    addDelta(delta) {
        this.to += delta;
    }

    destroy() {
        cancelAnimationFrame(this.timer)
    }
}

const noop = () => {
}
export const vScroll = {
    inserted(el, binding) {
        let {modifiers, value} = binding;
        const opts = value || {};
        const useTransform = !!modifiers.transform;
        const state = {
            useTransform: useTransform,
            target: useTransform ? el.children[0] : el,
            x: 0,
            y: 0,
            cb: opts.onScroll instanceof Function ? opts.onScroll : noop,
            applyEffect: () => {
                const target = state.target;
                if (state.useTransform) {
                    target.style.transform = `translate(${-state.x}px,${-state.y}px)`
                } else {
                    target.scrollTop = state.y;
                    target.scrollLeft = state.x;
                }

                state.cb({
                    useTransform: state.useTransform,
                    x: state.x,
                    y: state.y
                })
            },
            manageX: null,
            manageY: null
        }
        let lastWheelTime = getTime();
        let lastWheelXD = null, lastWheelYD = null;
        let manageX = state.manageX = new ScrollManage({
            onTick: v => {
                state.x = Math.round(v);
                state.applyEffect();
            },
            easing: opts.easing,
            durFrames: opts.durFrames
        });
        let manageY = state.manageY = new ScrollManage({
            onTick: v => {
                state.y = Math.round(v);
                state.applyEffect();
            },
            easing: opts.easing,
            durFrames: opts.durFrames
        });
        const handleMouseWheel = (event, data) => {
            const cur = getTime();
            let prevent = true;
            let needNewStart = cur - lastWheelTime > OneFrameTime * 4;
            lastWheelTime = cur;
            let delta, direct, curValue, maxValue;
            const wheelDir = data.spinY > 0 ? 1 : -1;
            if (!event.shiftKey) {
                maxValue = el.scrollHeight - el.clientHeight;
                if (maxValue < 1) return;
                curValue = state.y;
                if (maxValue === curValue && wheelDir > 0
                    || 0 === curValue && wheelDir < 0) {
                    prevent = false;
                }
                direct = 'y';
                needNewStart = needNewStart || (wheelDir !== lastWheelYD);
                lastWheelYD = wheelDir;
                delta = wheelDir * 100; //向下正值
            } else {
                maxValue = el.scrollWidth - el.clientWidth;
                if (maxValue < 1) return;
                curValue = state.x;
                if (maxValue === curValue && wheelDir > 0
                    || 0 === curValue && wheelDir < 0) {
                    prevent = false;
                }
                direct = 'x';
                needNewStart = needNewStart || (wheelDir !== lastWheelXD);
                lastWheelXD = wheelDir;
                delta = wheelDir * 100 // 向右正值
            }
            if (prevent) {
                const manage = direct === 'x' ? manageX : manageY;
                const to = clamp(delta + curValue, 0, maxValue);
                if (manage.isScrolling) {
                    if (needNewStart) {
                        manage.start(curValue, to);
                    } else {
                        let oldTo = manage.to;
                        delta = clamp(oldTo + delta, 0, maxValue) - oldTo;
                        manage.addDelta(delta);
                    }
                } else {
                    manage.start(curValue, to);
                }
                event.preventDefault();
            }
        }
        state.off = bindMousewheel(el, handleMouseWheel);
        map.set(el, state);
    },
    update(el, {value, oldValue, modifiers}, vnode) {
        const state = map.get(el);
        if (!state) return;
        const opts = value || {};
        state.cb = opts.onScroll instanceof Function ? opts.onScroll : noop;
        state.useTransform = !!modifiers.transform;
        state.target = state.useTransform ? el.children[0] : el;
        state.manageX.durFrames =
            state.manageY.durFrames = opts.durFrames || 30;
        state.manageX.easingFunc =
            state.manageY.easingFunc = opts.easing instanceof Function ? opts.easing : cubicInOut;
    },
    unbind: function unbind(el, binding) {
        const state = map.get(el)
        if (!state) return;
        state.off();
        state.manageX.destroy();
        state.manageY.destroy();
        map.delete(el);
    }
}
