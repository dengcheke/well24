<template>
    <div :class="['new-scrollbar__bar', 'is-' + bar.key]">
        <div ref="thumb"
             class="scrollbar__thumb"
             :style="getThumbStyle()">
        </div>
    </div>
</template>

<script>
import {dragHelper, on} from "@well24/utils";

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
export default {
    name: "new-bar",
    props: {
        vertical: Boolean,
        data: Object
    },
    computed: {
        bar() {
            return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
        }
    },
    created() {
        this.wrap = null;
    },
    mounted() {
        const el = this.$el;
        const thumb = this.$refs.thumb;
        const off = new dragHelper(thumb, ({e, type, state}) => {
            if (!this.wrap) return;
            e.stopPropagation();
            const vertical = this.vertical;
            if (type === 'start') {
                state.oldOpacity = this.$el.style.opacity;
                state.v = vertical ? e.clientY : e.clientX;
                state.beginValue = this.data.move;
                state.ratio = this.data.scrollSize / this.data.clientSize;
                this.$el.style.opacity = 0;
                document.body.style.userSelect = 'none';
                return true
            } else if (type === 'move') {
                const v = vertical ? e.clientY : e.clientX;
                const move = v - state.v;
                move !== 0 && this.wrap.scrollTo({
                    [vertical ? 'top' : 'left']: move * state.ratio + state.beginValue,
                    smooth: false
                })
            } else {
                document.body.style.userSelect = 'auto';
                this.$el.style.opacity = state.oldOpacity;
            }
        }, {});
        const off2 = on(el, 'click', e => {
            if (!this.wrap) return;
            const rect = thumb.getBoundingClientRect();
            const ratio = this.data.scrollSize / this.data.clientSize;
            const v = this.vertical ? e.clientY - (rect.top + rect.bottom) * 0.5
                : e.clientX - (rect.left + rect.right) * 0.5;
            const move = ratio * v;
            this.wrap.scrollTo({
                [this.vertical ? 'top' : 'left']: this.data.move + move,
                smooth: true
            })
        });
        this.$once('hook:beforeDestroy', () => {
            off();
            off2();
        })
    },
    methods: {
        getThumbStyle() {
            const style = {};
            if (!this.data) return style;
            let {move, clientSize, scrollSize} = this.data;
            if (scrollSize - clientSize < 1) {
                clientSize = scrollSize;
            }
            let temp = clientSize / scrollSize || 0;
            if (temp >= 1) temp = 0;
            style[this.bar.size] = `${temp * 100}%`;
            style.transform = `translate${this.bar.axis}(${move * temp}px)`;
            return style;
        },
    }
}
</script>
