<template>
    <div class="custom-scrollbar"
         @mouseenter="mouseEnter=true"
         @mouseleave="mouseEnter=false"
         :class="{'is-drag-scroll':isDragScroll}"
         :style="calcElStyle()">
        <div class="scrollbar__wrap--outer"
             :style="calcOuterWrapStyle()"
             style="padding:0;margin:0;overflow: hidden">
            <div class="scrollbar__wrap--inner" :style="calcInnerWrapStyle()"
                 @wheel="handleWheel"
                 ref="scrollWrap" @scroll.passive="handleScroll($event)">
                <div class="scrollbar__view" :style="calcViewStyle()" ref="view">
                    <slot/>
                </div>
            </div>
        </div>
        <Bar :class="{'is-active':showX}" :data="dataX" :style="calcBarStyle('x')" ref="barx"/>
        <Bar :class="{'is-active':showY}" :data="dataY" :style="calcBarStyle('y')" vertical ref="bary"/>
    </div>
</template>

<script>
import Bar from '@src/packages/bar';
import ResizeObserver from 'resize-observer-polyfill';
import {clamp, getScrollbarWidth, rafThrottle} from "@well24/utils";
import Vue from 'vue'
import debounce from 'lodash/debounce'

const barWidthObserver = new Vue({
    data() {
        return {
            barWidth: Math.ceil(getScrollbarWidth())
        }
    }
})
//window pixel scale
window.addEventListener('resize', debounce(() => {
    barWidthObserver.barWidth = Math.ceil(getScrollbarWidth());
}, 200, {leading: false, trailing: true}));
export default {
    name: "CustomScrollbar",
    components: {Bar},
    props: {
        viewStyle: {
            type: Object,
            default: () => ({})
        },
        barWidth: {
            type: Number,
            default: 6
        },
        padding: {
            type: Array | Number,
            default: () => [0, 10, 10, 0]
        },
        autoHide: {
            type: String, //never / leave
            default: 'leave',
        },
        scrollPropagation: {
            type: Boolean,
            default: false
        },
        height: {
            default: '100%',
            type: Number | String
        },
        minHeight: {
            default: null,
            type: Number
        },
        maxHeight: {
            default: null,
            type: Number
        },
        minWidth: {
            default: null,
            type: Number,
            desc: '在inheritWidth为false时有效'
        },
        maxWidth: {
            default: null,
            type: Number,
            desc: '在inheritWidth为false时有效'
        },
        inheritWidth: {
            type: Boolean,
            default: true,
            desc: '为true, 父元素宽度受外部控制, 为false, 受view宽度以及min,max控制'
        },
    },
    data() {
        return {
            elRect: {},
            wrapRect: {},
            viewRect: {},
            scrollSize: [],

            dataX: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
            },
            dataY: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
            },

            isDragScroll: false,
            mouseEnter: false,
        }
    },
    computed: {
        wrapPadding() {
            const p = this.padding;
            if (p === null || p === undefined) return [0, 0, 0, 0];
            return typeof p === 'number' ? [p, p, p, p] : p;
        },
        showBar() {
            if (this.isDragScroll) {
                return true
            } else {
                if (this.autoHide === 'never') {
                    return true
                } else {
                    return this.mouseEnter
                }
            }
        },
        showX() {
            return this.showBar && (this.dataX.clientSize || 0) + 1 < (this.dataX.scrollSize || 0);
        },
        showY() {
            return this.showBar && (this.dataY.clientSize || 0) + 1 < (this.dataY.scrollSize || 0);
        },
    },
    mounted() {
        this.initResizeWatcher();
        const {barx, bary} = this.$refs;
        barx.init(this);
        bary.init(this);
    },
    methods: {
        initResizeWatcher() {
            const el = this.$el, {scrollWrap, view} = this.$refs;
            const ro = new ResizeObserver(rafThrottle(entries => {
                const elEn = entries.find(i => i.target === el);
                if (elEn) {
                    this.elRect = elEn.contentRect
                }
                const wrapEn = entries.find(i => i.target === scrollWrap);
                if (wrapEn) {
                    this.wrapRect = wrapEn.contentRect;
                    this.dataX.clientSize = this.wrapRect.width;
                    this.dataY.clientSize = this.wrapRect.height;
                }
                const viewEn = entries.find(i => i.target === view);
                if (viewEn) {
                    this.viewRect = viewEn.contentRect;
                }
                const hasContent = this.viewRect.height;
                this.scrollSize = [
                    hasContent ? scrollWrap.scrollWidth : 0,
                    hasContent ? scrollWrap.scrollHeight : 0
                ];
                this.dataX.scrollSize = this.scrollSize[0];
                this.dataY.scrollSize = this.scrollSize[1];
                this.dataX.move = scrollWrap.scrollLeft;
                this.dataY.move = scrollWrap.scrollTop;
            }));
            [el, scrollWrap, view].forEach(i => ro.observe(i));
            this.$once('hook:beforeDestroy', () => {
                ro.disconnect();
            })
        },
        handleScroll() {
            const {scrollWrap} = this.$refs;
            const {scrollTop, scrollLeft} = scrollWrap;
            this.dataX.move = scrollLeft;
            this.dataY.move = scrollTop;
        },
        handleWheel(e) {
            if (this.stopPropagation) {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;
                e.cancelBubble = true;
            }
        },
        calcElStyle() {
            const style = {
                padding: this.wrapPadding.map(i => i + 'px').join(' '),
                boxSizing: 'border-box !important',
                border: 'none !important',
            }

            let width = null;
            if (!this.inheritWidth) {
                width = this.viewRect.width || 0;
                width += this.wrapPadding[1];
                width += this.wrapPadding[3];

                const min = this.minWidth, max = this.maxWidth;
                width = clamp(width, min || 0, max || Infinity);
                width += 'px';
                style.width = width;
            }

            if (typeof this.height === 'number') {
                style.height = `${this.height}px`;
            } else if (this.height === 'auto') {
                const min = this.minHeight, max = this.maxHeight, h = this.viewRect.height || 0;
                style.height = clamp(h, min || 0, max || Infinity);
                style.height += this.wrapPadding[0];
                style.height += this.wrapPadding[2];
                style.height += 'px';
            } else {
                style.height = this.height;
            }
            return style;
        },
        calcOuterWrapStyle() {
            return {
                width: '100%',
                height: '100%',//el height 一定是个数值
            }
        },
        calcInnerWrapStyle() {
            return {
                width: `calc(100% + ${barWidthObserver.barWidth}px`,
                height: `calc(100% + ${barWidthObserver.barWidth}px`,
                overflow: 'scroll',
                position: 'relative'
            }
        },
        calcViewStyle() {
            return {
                ...(this.viewStyle || {}),
                margin: 0,
            };
        },
        calcBarStyle(type) {
            const barW = this.barWidth;
            const [t, r, b, l] = this.wrapPadding
            if (type === 'x') {
                const bottom = Math.max((b - barW) / 2, 0);
                return {
                    left: l + 'px',
                    right: Math.max(r, barW + 2) + 'px',
                    bottom: bottom + 'px',
                    height: barW + 'px'
                }
            } else {
                const right = Math.max((r - barW) / 2, 0);
                return {
                    top: t + 'px',
                    bottom: Math.max(b, barW + 2) + 'px',
                    right: right + 'px',
                    width: barW + 'px'
                }
            }
        },
        scrollTo({left, top, smooth = true}) {
            const {scrollWrap} = this.$refs;
            if (!scrollWrap) return;
            if (scrollWrap.scrollTo instanceof Function) {
                scrollWrap.scrollTo({
                    top,
                    left,
                    behavior: smooth ? "smooth" : "auto"
                })
            } else {
                scrollWrap.scrollTop = top;
                scrollWrap.scrollLeft = left;
            }
        },
    },
    install(Vue) {
        Vue.component(this.name, this);
    }
}
</script>

<style lang="less">
.custom-scrollbar {
    position: relative;
    overflow: hidden;

    &:hover {
        & > .scrollbar__bar {
            opacity: 1;
            transition: opacity 340ms ease-out;
        }
    }

    .scrollbar__view {
        position: relative;
        display: inline-block;
        float: left;
        margin: 0;
        padding: 0;
    }

    .scrollbar-bar {
        overflow: hidden;
        position: absolute;
        z-index: 1;
        opacity: 0;
        border-radius: 6px;
        transition: all 120ms ease-out;
        background-color: transparent;

        &.is-active {
            opacity: 1;
            background-color: rgba(61, 56, 56, 0.3);
        }

        &.is-vertical {
            transform-origin: right;

            & > div {
                width: 100%;
            }

            &:hover {
                transform: scaleX(1.5);
            }
        }

        &.is-horizontal {
            transform-origin: bottom;

            & > div {
                height: 100%;
            }

            &:hover {
                transform: scaleY(1.5);
            }
        }
    }

    .scrollbar-thumb {
        position: relative;
        display: block;
        width: 0;
        height: 0;
        cursor: pointer;
        border-radius: inherit;
        background-color: #30688b;
        transition: .3s background-color;
    }
}
</style>
