<template>
    <div class="new-custom-scrollbar"
         @mouseenter="enter=true"
         @mouseleave="enter=false"
         :style="calcElStyle()">
        <div class="scrollbar__view" :style="calcViewStyle()" ref="view">
            <slot/>
        </div>
        <slot name="barx" :data="dataX">
            <Bar ref="barx" :data="dataX"/>
        </slot>
        <slot name="bary" :data="dataY">
            <Bar ref="bary" vertical :data="dataY"/>
        </slot>
    </div>
</template>

<script>
import Bar from '@src/packages/new-bar';
import ResizeObserver from 'resize-observer-polyfill';
import {clamp, on} from "@well24/utils";
import {CustomScroll} from "../scroll";


export default {
    name: "NewCustomScrollbar",
    components: {Bar},
    props: {
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
            default: !true
        },
    },
    data() {
        return {
            focus: false,
            dataX: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
                enter: false
            },
            dataY: {
                move: NaN,
                clientSize: NaN,
                scrollSize: NaN,
                enter: false
            },
            wrapRect: {},
            scrollSize: []
        }
    },
    mounted() {
        const el = this.$el;
        this.initResizeWatcher();
        this.onScroll({x: 0, y: 0});
        const scroll = this.scroll = new CustomScroll();
        scroll.watch(el, {
            onScroll: this.onScroll,
            durFrames: 20,
            transform: true
        });
        const off = this.$watch('scrollPropagation',(v)=>{
            scroll.scrollPropagation = v;
        },{immediate:true});
        this.$refs.barx.wrap = this.$refs.bary.wrap = this;
        this.$once('hook:beforeDestroy', () => {
            scroll.destroy();
            off();
        });
    },
    methods: {
        onScroll({x, y}) {
            this.dataX = {
                move: x,
                clientSize: this.wrapRect.width,
                scrollSize: this.scrollSize[0],
                enter: true
            };
            this.dataY = {
                move: y,
                clientSize: this.wrapRect.height,
                scrollSize: this.scrollSize[1],
                enter: true
            }
        },
        initResizeWatcher() {
            const el = this.$el, view = this.$refs.view;
            const ro = new ResizeObserver(entries => {
                const elEn = entries.find(i => i.target === el);
                if (elEn) {
                    this.wrapRect = elEn.contentRect;
                }
                this.scrollSize = [el.scrollWidth, el.scrollHeight];
                this.onScroll({
                    x: this.dataX.value || 0,
                    y: this.dataY.value || 0
                });
            });
            [el, view].forEach(i => ro.observe(i));
            this.$once('hook:beforeDestroy', () => {
                ro.disconnect();
            })
        },
        calcElStyle() {
            const style = {
                outline: 'none'
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
            //this.minHeight && (style.minHeight = `${this.minHeight}px`);
            //this.maxHeight && (style.maxHeight = `${this.maxHeight}px`);
            return style;
        },
        scrollTo(opts) {
            this.scroll.scrollTo(opts)
        },
        calcViewStyle() {
            return {
                ...(this.viewStyle || {}),
                width: this.inheritWidth ? this.wrapRect.width + 'px' : null
            };
        },
    },
}
</script>

<style lang="less">
.new-custom-scrollbar {
    width: 100%;
    position: relative;
    overflow: hidden;

    &:hover > .new-scrollbar__bar {
        opacity: 1;
        transition: opacity 340ms ease-out;
    }

    .scrollbar__view {
        position: relative;
        display: inline-block;
        vertical-align: bottom;
        margin: 0;
        padding: 0;
    }

    .new-scrollbar__bar {
        position: absolute;
        right: 2px;
        bottom: 2px;
        z-index: 1;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 120ms ease-out;

        &.is-vertical {
            width: 6px;
            top: 2px;

            & > div {
                width: 100%;
            }
        }

        &.is-horizontal {
            height: 6px;
            left: 2px;

            & > div {
                height: 100%;
            }
        }
    }

    .scrollbar__thumb {
        position: relative;
        display: block;
        width: 0;
        height: 0;
        cursor: pointer;
        border-radius: inherit;
        background-color: #30688b;
        transition: .3s background-color;

        &:hover {
            background-color: rgba(144, 147, 153, .5);
        }
    }
}
</style>
