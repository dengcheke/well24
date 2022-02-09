<template>
    <div :class="['scrollbar-bar', 'is-' + bar.key]">
        <div ref="thumb" class="scrollbar-thumb" :style="getThumbStyle()">
        </div>
    </div>
</template>
<script>
const BAR_MAP = {
    vertical: {
        size: 'height',
        key: 'vertical',
        axis: 'Y',
    },
    horizontal: {
        size: 'width',
        key: 'horizontal',
        axis: 'X',
    }
};
import {dragHelper, off, on} from "@well24/utils";

export default {
    name: 'CustomBar',
    props: {
        vertical: Boolean,
        data: Object
    },
    computed: {
        bar() {
            return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
        },
    },
    methods: {
        init(scrollbar){
            const el = this.$el;
            const thumb = this.$refs.thumb;
            const off = new dragHelper(thumb, ({e, type, state}) => {
                const vertical = this.vertical;
                if (type === 'start') {
                    scrollbar.isDragScroll = true;
                    state.oldOpacity = this.$el.style.opacity;
                    state.v = vertical ? e.clientY : e.clientX;
                    state.beginValue = this.data.move;
                    state.ratio = this.data.scrollSize / this.data.clientSize;
                    this.$el.style.opacity = 1;
                    document.body.style.userSelect = 'none';
                    return true
                } else if (type === 'move') {
                    const v = vertical ? e.clientY : e.clientX;
                    const move = v - state.v;
                    move !== 0 && scrollbar.scrollTo({
                        [vertical ? 'top' : 'left']: move * state.ratio + state.beginValue,
                        smooth: false
                    })
                } else if (type === 'end') {
                    scrollbar.isDragScroll = false;
                    document.body.style.userSelect = 'auto';
                    this.$el.style.opacity = state.oldOpacity;
                }
            }, {});
            let x, y;
            const off2 = on(el, 'mousedown', (e) => {
                x = e.clientX;
                y = e.clientY;
            });
            const off3 = on(el, 'mouseup', e => {
                const dir = Math.hypot(e.clientX - x, e.clientY - y);
                if (dir > 2) return;
                const rect = thumb.getBoundingClientRect();
                const ratio = this.data.scrollSize / this.data.clientSize;
                const v = this.vertical ? e.clientY - (rect.top + rect.bottom) * 0.5
                    : e.clientX - (rect.left + rect.right) * 0.5;
                const move = ratio * v;
                scrollbar.scrollTo({
                    [this.vertical ? 'top' : 'left']: this.data.move + move,
                    smooth: true
                })
            });
            this.$once('hook:beforeDestroy', () => {
                off();
                off2();
                off3();
            });
        },
        getThumbStyle() {
            const style = {};
            if (!this.data) return style;
            let {move, clientSize, scrollSize} = this.data;
            if (scrollSize - clientSize <= 1) {
                clientSize = scrollSize;
            }
            let temp = clientSize / scrollSize || 0;
            if (temp >= 1) temp = 0;
            style[this.bar.size] = `${temp * 100}%`;
            style.transform = `translate${this.bar.axis}(${move * temp}px)`;
            return style;
        },
    },
}

</script>
