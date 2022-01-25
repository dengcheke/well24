<template>
    <div class="new-custom-scrollbar" v-scroll.transform="scrollParam" :style="calcElStyle()">
        <div class="scrollbar__view" :style="calcViewStyle()"
             :class="viewClass" ref="view">
            <slot/>
        </div>
        <Bar :move="moveX" :size="sizeWidth" ref="barX"/>
        <Bar vertical :move="moveY" :size="sizeHeight" ref="barY"/>
    </div>
</template>

<script>
import Bar from '@src/packages/bar';
import ResizeObserver from 'resize-observer-polyfill';
import {clamp, getScrollbarWidth} from "@well24/utils";
import {vMouseWheel} from "@src/directives/v-mousewheel";
import {vScroll} from "../directives/v-scroll";

export default {
    name: "NewCustomScrollbar",
    components: {Bar},
    directives: {
        mouseWheel: vMouseWheel,
        scroll: vScroll
    },
    props: {
        viewClass: {
            type: Array | Object,
            default: () => []
        },
        viewStyle: {
            type: Object,
            default: () => {
                return {}
            }
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
        let barWidth = Math.ceil(getScrollbarWidth());
        return {
            scrollParam:{
                onScroll:this.onScroll,
                durFrames:60
            },
            elWidth: 0,//宽度
            barWidth: barWidth,//滚动条宽度
            sizeWidth: 0,
            sizeHeight: 0,
            moveX: 0,
            moveY: 0,
            viewHeight: 0,
            viewWidth: 0,
            scrollLeft: 0,
            scrollTop: 0,
        }
    },
    mounted() {
        const {barX, barY, wrap} = this.$refs;
        barX.wrap = barY.wrap = wrap;
        this.init();
    },
    methods: {
        onScroll(...args) {
            console.log(args)
        },
        init() {
            const el = this.$el, view = this.$refs.view;
            const ro = new ResizeObserver(entries => {
                let update = false;
                const elEn = entries.find(i => i.target === el);
                if (elEn) {
                    update = true;
                    this.elWidth = elEn.contentRect.width;
                }
                const viewEn = entries.find(i => i.target === view);
                if (viewEn) {
                    update = true;
                    this.viewWidth = view.offsetWidth;
                    this.viewHeight = view.offsetHeight;
                }
            });
            [el, view].forEach(i => ro.observe(i));
            this.$once('hook:beforeDestroy', () => {
                ro.disconnect();
            })
        },
        updateScrollbar() {
            let heightPercentage, widthPercentage;
            const wrap = this.$refs.wrap;
            if (!wrap) return;
            if (wrap.scrollHeight - wrap.clientHeight <= 1) {
                heightPercentage = 100;
            } else {
                heightPercentage = (wrap.clientHeight * 100 / wrap.scrollHeight);
            }
            widthPercentage = (wrap.clientWidth * 100 / wrap.scrollWidth);

            this.sizeHeight = (heightPercentage < 100) ? heightPercentage : 0;
            this.sizeWidth = (widthPercentage < 100) ? widthPercentage : 0;
        },
        handleScroll(e) {
            const wrap = this.$refs.wrap;
            const {scrollTop, scrollLeft, clientHeight, clientWidth} = wrap;
            this.scrollTop = scrollTop;
            this.scrollLeft = scrollLeft;
            this.moveY = ((scrollTop * 100) / clientHeight);
            this.moveX = ((scrollLeft * 100) / clientWidth);
        },
        calcElStyle() {
            const style = {}
            if (typeof this.height === 'number') {
                style.height = `${this.height}px`;
            } else if (this.height === 'auto') {
                const min = this.minHeight, max = this.maxHeight, h = this.viewHeight;
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
            this.minHeight && (style.minHeight = `${this.minHeight}px`);
            this.maxHeight && (style.maxHeight = `${this.maxHeight}px`);
            return style;
        },
        calcWrapStyle() {
            return {
                height: `calc(100% + ${this.barWidth}px)`,
                width: `calc(100% + ${this.barWidth}px)`,
            }
        },
        //滚动到最下面
        scrollToBottom(smooth) {
            const {wrap} = this.$refs;
            wrap && (wrap.scrollTo({
                top: wrap.scrollHeight,
                behavior: smooth ? "smooth" : "auto"
            }))
        },
        calcViewStyle() {
            return {
                ...(this.viewStyle || {}),
                minWidth: this.inheritWidth ? this.elWidth + 'px' : null
            };
        }
    },
}
</script>

<style lang="less">
.new-custom-scrollbar {
    width: 100%;
    position: relative;
    overflow: hidden;

    &:hover {
        & > .scrollbar__bar {
            opacity: 1;
            transition: opacity 340ms ease-out;
        }
    }

    .scrollbar__wrap {
        overflow: scroll;
    }

    .scrollbar__view {
        position: relative;
        display: inline-block;
        vertical-align: bottom;
        margin: 0;
        padding: 0;
    }

    .scrollbar__bar {
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
