import {clamp, on} from "@well24/utils";
import {bindMousewheel} from "./directives/v-mousewheel";
import throttle from 'lodash/throttle';

function cubicInOut(k) {
    if ((k *= 2) < 1) return 0.5 * k * k * k;
    return 0.5 * ((k -= 2) * k * k + 2);
}

const noop = () => {
}
const OneFrameTime = 1000 / 60;
const getTime = () => {
    return performance.now();
};

class ScrollScheduler {
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
        this.stop();
        this.from = from;
        this.to = to;
        this.dur = OneFrameTime * this.durFrames;
        this.setTimer()
    }

    addDelta(delta) {
        if (!this.isScrolling) throw new Error('can not add delta when not scrolling');
        this.to += delta;
    }

    stop() {
        this.isScrolling = false;
        cancelAnimationFrame(this.timer);
    }

    destroy() {
        this.stop()
    }
}

const keyMap = {
    37: {dir: 'left', s: '-'},
    38: {dir: "top", s: '-'},
    39: {dir: "left", s: '+'},
    40: {dir: "top", s: '+'},
}

export class CustomScroll {
    constructor() {
        this.cb = null;
        this.useTransform = true;
        this.scrollPropagation = true;
        this.target = null;
        this.x = 0;
        this.y = 0;
        this.schdX = new ScrollScheduler({
            onTick: v => {
                this.x = Math.round(v);
                this.applyEffect();
            }
        });
        this.schdY = new ScrollScheduler({
            onTick: v => {
                this.y = Math.round(v);
                this.applyEffect();
            },
        });
        this.throttleScrollTo = throttle(function (...args) {
            this.scrollTo.call(this, ...args);
        }.bind(this), 16.6, {leading: false, trailing: true})
    }

    watch(el, opts = {}) {
        if (this.el !== el) {
            this.el = el;
            this.attach(el);
        }
        this.scrollPropagation = opts.scrollPropagation !== false;
        this.cb = opts.onScroll instanceof Function ? opts.onScroll : noop;
        this.useTransform = opts.transform !== false;
        this.target = this.useTransform ? this.el.children[0] : this.el;
        this.schdX.durFrames = this.schdY.durFrames = opts.durFrames || 30;
        this.schdX.easingFunc = this.schdY.easingFunc =
            opts.easing instanceof Function ? opts.easing : cubicInOut;
    }

    attach(el) {
        if (!el) throw new Error('el is empty');
        this.el = el;
        el.tabIndex = el.tabIndex === -1 ? 1 : el.tabIndex;
        this._off?.();
        let lastWheelTime = getTime();
        let lastWheelXD = null;
        let lastWheelYD = null;
        const offwheel = bindMousewheel(el, (event, data) => {
            const cur = getTime();
            let canScroll = true;
            let needNewStart = cur - lastWheelTime > OneFrameTime * 2;
            lastWheelTime = cur;
            let delta, direct, curValue, maxValue;
            const wheelDir = data.spinY > 0 ? 1 : -1;
            if (!event.shiftKey) {
                maxValue = el.scrollHeight - el.clientHeight;
                if (maxValue < 1) return;
                curValue = this.y;
                if (maxValue === curValue && wheelDir > 0
                    || 0 === curValue && wheelDir < 0) {
                    canScroll = false;
                }
                direct = 'y';
                needNewStart = needNewStart || (wheelDir !== lastWheelYD);
                lastWheelYD = wheelDir;
                delta = wheelDir * 100; //向下正值
            } else {
                maxValue = el.scrollWidth - el.clientWidth;
                if (maxValue < 1) return;
                curValue = this.x;
                if (maxValue === curValue && wheelDir > 0
                    || 0 === curValue && wheelDir < 0) {
                    canScroll = false;
                }
                direct = 'x';
                needNewStart = needNewStart || (wheelDir !== lastWheelXD);
                lastWheelXD = wheelDir;
                delta = wheelDir * 100 // 向右正值
            }
            if (canScroll) {
                const schd = direct === 'x' ? this.schdX : this.schdY;
                const to = clamp(delta + curValue, 0, maxValue);
                if (schd.isScrolling) {
                    if (needNewStart) {
                        schd.start(curValue, to);
                    } else {
                        let oldTo = schd.to;
                        delta = clamp(oldTo + delta, 0, maxValue) - oldTo;
                        schd.addDelta(delta);
                    }
                } else {
                    schd.start(curValue, to);
                }
                event.preventDefault();
            }else{
                !this.scrollPropagation && event.preventDefault();
            }
        });
        //keyboard scroll
        let focus = false;
        const off = on(document, 'click', (e) => {
            if (!el.contains(e.target)) {
                focus = false;
                el.blur();
            }
        });
        const off1 = on(el, 'click', e => {
            focus = true;
            el.focus();
            e.stopPropagation();
        });

        let press = false, continues = false;
        const off2 = on(el, 'keydown', e => {
            const codeInfo = keyMap[e.keyCode];
            if (!codeInfo) return;
            if (press) {
                this.throttleScrollTo({
                    [codeInfo.dir]: `${codeInfo.s}=20`,
                    smooth: !continues
                });
                !continues && (continues = true);
            } else {
                press = true;
                this.scrollTo({
                    [codeInfo.dir]: `${codeInfo.s}=40`,
                    smooth: true
                })
            }

            let prevent = true;
            const schd = codeInfo.dir === 'left' ? this.schdX : this.schdY;
            const cur = schd.curValue;
            const attr = codeInfo.dir === 'left' ? 'Width' : "Height";
            const max = el[`scroll${attr}`] - el[`client${attr}`];
            if (this.scrollPropagation && (cur === 0 && codeInfo.s === '-' || cur === max && codeInfo.s === '+')) {
                prevent = false;
            }
            if (prevent) {
                e.preventDefault();
                e.stopPropagation();
            }

        })
        const off3 = on(el, 'keyup', () => {
            press = continues = false;
        });
        this._off = () => {
            offwheel();
            off();
            off1();
            off2();
            off3();
            this._off = null;
        }
    }

    applyEffect() {
        const target = this.target;
        if (this.useTransform) {
            target.style.transform = `translate(${-this.x}px,${-this.y}px)`
        } else {
            target.scrollTop = this.y;
            target.scrollLeft = this.x;
        }
        this.cb({
            useTransform: this.useTransform,
            x: this.x,
            y: this.y
        })
    }

    destroy() {
        this._off?.();
        this._off = null;
    }

    scrollTo({left: x, top: y, smooth}) {
        const {schdX, schdY, el} = this;
        const maxX = el.scrollWidth - el.clientWidth;
        const maxY = el.scrollHeight - el.clientHeight;
        const curX = schdX.curValue;
        const curY = schdY.curValue;
        x = clamp(format(x, curX), 0, maxX);
        y = clamp(format(y, curY), 0, maxY);
        const scrollX = !isNaN(x) && x !== curX;
        const scrollY = !isNaN(y) && y !== curY;
        if (smooth !== false) {
            scrollX && schdX.start(curX, x);
            scrollY && schdY.start(curY, y);
        } else {
            if (scrollX) {
                schdX.stop();
                schdX.curValue = x;
                schdX.onTick(x);
            }
            if (scrollY) {
                schdY.stop();
                schdY.curValue = y;
                schdY.onTick(y);
            }
        }

        function format(v, target) {
            if (v === undefined) return undefined;
            if (typeof v === 'number') return v;
            const match = (v + '').match(/^([+-])=(\d*)$/);
            if (!match) throw new Error('invalid input:', v);
            return (match[1] === '+' ? 1 : -1) * (+match[2]) + target;
        }
    }
}