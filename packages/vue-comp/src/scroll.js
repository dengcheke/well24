import {clamp} from "@well24/utils";
import {bindMousewheel} from "./directives/v-mousewheel";

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
        if(!this.isScrolling) throw new Error('can not add delta when not scrolling');
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

export class CustomScroll {
    constructor() {
        this.cb = null;
        this.useTransform = true;
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
    }

    watch(el, opts = {}) {
        if (this.el !== el) {
            this.el = el;
            this.attach(el);
        }
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
        this._off?.();
        let lastWheelTime = getTime();
        let lastWheelXD = null;
        let lastWheelYD = null;
        this._off = bindMousewheel(el, (event, data) => {
            const cur = getTime();
            let prevent = true;
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
                    prevent = false;
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
                    prevent = false;
                }
                direct = 'x';
                needNewStart = needNewStart || (wheelDir !== lastWheelXD);
                lastWheelXD = wheelDir;
                delta = wheelDir * 100 // 向右正值
            }
            if (prevent) {
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
            }
        });
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

    scrollTo({x, y, smooth}) {
        const {schdX, schdY, el} = this;
        const maxX = el.scrollWidth - el.clientWidth;
        const maxY = el.scrollHeight - el.clientHeight;
        const curX = schdX.curValue;
        const curY = schdY.curValue;
        x = clamp(x, 0, maxX);
        y = clamp(y, 0, maxY);
        const scrollX = x !== undefined && !isNaN(x) && x !== curX;
        const scrollY = y !== undefined && !isNaN(y) && y !== curY;
        if (smooth !== false) {
            scrollX && schdX.start(curX,x);
            scrollY && schdY.start(curY,y);
        }else{
            if(scrollX){
                schdX.stop();
                schdX.curValue = x;
                schdX.onTick(x);
            }
            if(scrollY){
                schdY.stop();
                schdY.curValue = y;
                schdY.onTick(y);
            }
        }
    }
}
