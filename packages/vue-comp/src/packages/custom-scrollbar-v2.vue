<template>
    <div class="scrollbar-outer-wrapper"
         @mouseenter="mouseEnter=true"
         @mouseleave="mouseEnter=false"
         :class="{'is-drag-scroll':isDragScroll}"
         :style="calcElStyle()">
        <div class="scrollbar-inner-wrapper" ref="scroll"
             style="margin:0 !important;padding:0 !important;">
            <div class="scrollbar-view" :style="calcViewStyle()" ref="view">
                <slot/>
            </div>
            <div v-if="useTransform" class="x-space" :style="calcSpace('x')"/>
            <div v-if="useTransform" class="y-space" :style="calcSpace('y')"/>
        </div>
        <Bar :class="{'is-active':showX}" :data="dataX" :style="calcBarStyle('x')"/>
        <Bar :class="{'is-active':showY}" :data="dataY" :style="calcBarStyle('y')" vertical/>
    </div>
</template>

<script>
import Bar from '@src/packages/bar-v2';
import ResizeObserver from 'resize-observer-polyfill';
import {clamp, supportCss3} from "@well24/utils";
import {CustomScroll} from "../scroll";

export default {
    name: "CustomScrollbar",
    components: {Bar},
    provide() {
        return {
            scrollbar: this
        }
    },
    props: {
        barWidth: {
            type: Number,
            default: 6
        },
        padding: {
            type: Array | Number,
            default: 10
        },
        autoHide: {
            type: String, //never / leave
            default: 'leave',
        },
        scrollPropagation: {
            type: Boolean,
            default: true
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
        inheritWidth: {
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            mouseEnter: false,
            isDragScroll: false,
            focus: false,
            dataX: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
                atEnd: false
            },
            dataY: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
                atEnd: false
            },
            wrapRect: {},
            viewRect: {},
            scrollSize: [],
            useTransform: supportCss3('transform')
        }
    },
    computed: {
        wrapPadding() {
            const p = this.padding;
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
        }
    },
    mounted() {
        const scrollTarget = this.$refs.scroll;
        this.onScroll({left: 0, top: 0});
        const scroll = this.scroll = new CustomScroll();
        const opts = {
            onScroll: this.onScroll,
            durFrames: 15,
            useTransform: this.useTransform,
        }
        scroll.watch(scrollTarget, opts);
        this.initResizeWatcher();
        const off = this.$watch('scrollPropagation', v => {
            opts.scrollPropagation = v;
            scroll.watch(scrollTarget, opts);
        }, {immediate: true});
        this.$once('hook:beforeDestroy', () => {
            scroll.destroy();
            off();
        });
    },
    methods: {
        onScroll({left, top}) {
            this.dataX = {
                move: left,
                clientSize: this.wrapRect.width,
                scrollSize: this.scrollSize[0],
                enter: true,
                atEnd: !!left && (this.scrollSize[0] - left - this.wrapRect.width <= 1)
            }
            //console.log({...this.dataX})
            this.dataY = {
                move: top,
                clientSize: this.wrapRect.height,
                scrollSize: this.scrollSize[1],
                enter: true,
                atEnd: !!top && (this.scrollSize[1] - top - this.wrapRect.height <= 1)
            }
            this.$emit('scroll', {
                left: left,
                top: top
            });
        },
        initResizeWatcher() {
            const scrollEl = this.$refs.scroll, view = this.$refs.view;
            const ro = new ResizeObserver(entries => {
                const scrollEn = entries.find(i => i.target === scrollEl);
                if (scrollEn) {
                    this.wrapRect = scrollEn.contentRect;
                }
                const viewEn = entries.find(i => i.target === view);
                if (viewEn) {
                    this.viewRect = viewEn.contentRect;
                }
                const hasContent = this.viewRect.height;
                this.scrollSize = [
                    hasContent ? view.scrollWidth : 0,
                    hasContent ? view.scrollHeight : 0
                ];
                const noX = hasContent && (this.scrollSize[0] - this.wrapRect.width < 1);
                const noY = hasContent && (this.scrollSize[1] - this.wrapRect.height < 1);
                const left = noX ? 0 : (this.dataX.atEnd ? this.scrollSize[0] - this.wrapRect.width : (this.dataX.move || 0));
                const top = noY ? 0 : (this.dataY.atEnd ? this.scrollSize[1] - this.wrapRect.height : (this.dataY.move || 0));
                this.scroll.scrollTo({
                    left, top,
                    smooth: false
                });
                //in case cur === old and don't trigger scroll event
                this.onScroll({left, top})
            });
            [scrollEl, view].forEach(i => ro.observe(i));
            this.$once('hook:beforeDestroy', () => {
                ro.disconnect();
            })
        },
        calcSpace(type) {
            if (type === 'x') {
                return {
                    width: (this.scrollSize[0] || 0) + 'px',
                    height: '1px'
                }
            } else {
                return {
                    width: 0,
                    height: (this.scrollSize[1] || 0) + 'px',
                }
            }
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
        calcElStyle() {
            const style = {
                padding: this.wrapPadding.map(i => i + 'px').join(' '),
                boxSizing: 'border-box !important'
            }
            if (typeof this.height === 'number') {
                style.height = `${this.height}px`;
            } else if (this.height === 'auto') {
                const min = this.minHeight, max = this.maxHeight, h = this.scrollSize[1] || 0;
                if (min && max) {
                    style.height = clamp(h, min, max) + 'px';
                } else if (min && !max) {
                    style.height = Math.max(h, min) + 'px';
                } else if (!min && max) {
                    style.height = Math.min(h, max) + 'px';
                } else {
                    style.height = h + 'px';
                }
            } else {
                style.height = this.height;
            }
            return style;
        },
        calcViewStyle() {
            return {
                margin: 0,
                width: this.inheritWidth ? this.wrapRect.width + 'px' : null
            };
        },
        scrollTo(opts) {
            this.scroll.scrollTo(opts)
        },
    },
}
</script>

<style lang="less">
.scrollbar-outer-wrapper {
    width: 100%;
    position: relative;
    overflow: hidden;
    outline: none;

    .scrollbar-inner-wrapper {
        overflow: hidden;
        height: 100%;
        width: 100%;
        outline: none;
        border: none;
        position: relative;

        .x-space, .y-space {
            position: absolute;
            left: 0;
            top: 0;
        }
    }

    .scrollbar-view {
        overflow: hidden;
        position: relative;
        display: inline-block;
        vertical-align: bottom;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
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
