<script type="text/jsx">
import {clamp, dragHelper, getStyle, on, rafThrottle} from "@well24/utils";
import {vTransferDom} from "@src/directives/v-transfer-dom";
import isNil from "lodash/isNil";
import {cursorMap, vResize} from "@src/directives/v-resize";

const minZIndex = 1000; //最小的zIndex
let zIndex = minZIndex; //当前的zIndex
const winShowCache = []; //当前显示的所有dialog集合

function removeFromCache(dialog) {
    const idx = winShowCache.indexOf(dialog);
    idx !== -1 && winShowCache.splice(idx, 1);
}

on(document.body, 'keyup', (e) => {
    if (e.keyCode === 27) {//Escape
        let top;
        for (let i = winShowCache.length - 1; i >= 0; i--) {
            const item = winShowCache[i];
            if (item.escClose && (item.shadow || item.fullScreen)) {
                top = item;
                break;
            }
        }
        top && top.$emit('update:show', false);
    }
});
on(window, 'resize', () => {
    winShowCache.forEach(win => {
        !win.fullScreen && !win.keepPosition && win.placeAtCenter();
    })
});
let gId = 1;//全局id
const Event = Object.freeze({
    None: 0,
    Resize: 1,
    Drag: 2
});
export default {
    name: "CustomDialog",
    directives: {
        'transfer-dom': vTransferDom,
        'resize': vResize
    },
    props: {
        classList: {
            default: null,
            type: Array,
            desc: '自定义class，添加到wrapper上'
        },
        width: {
            type: Number | String,
            desc: 'dialog宽度'
        },
        height: {
            type: Number | String,
            default: null,
            desc: 'dialog高度'
        },
        padding: {
            type: Array,
            default: () => [0, 0, 0, 0],
            desc: 'dialog距离父元素的边距,限制拖拽范围,上右下左'
        },
        paddingTarget: {
            default: null,
            desc: `null(dialog) / 'header'(title) / HTMLElement`
        },
        keepPosition: {
            type: Boolean,
            default: false,
            desc: '是否保持拖拽位置，否则每次重新显示，都会出现在正中间'
        },
        draggable: {
            type: Boolean,
            default: true,
            desc: '是否可拖动,只有表头可拖动'
        },
        show: {
            type: Boolean,
            default: true,
            desc: '是否可见'
        },
        fullScreen: {
            type: Boolean,
            default: false,
            desc: '是否全屏'
        },
        appendToBody: {
            type: Boolean,
            default: true,
            desc: '是否添加到body下'
        },
        shadow: {
            type: Boolean,
            default: false,
            desc: '是否显示遮罩'
        },
        escClose: {
            type: Boolean,
            default: true,
            desc: '按下esc是否隐藏,仅在全屏或者shadow模式下有效'
        },
        resize: {
            /*是否可拖拽改变大小, false/true/{
                directions:all/top/left/bottom/right,
                zoneSize: 8
            }*/
            type: Boolean | Object,
            default: false,
        }
    },
    data() {
        this.resizeOpts = {
            zoneSize: 8,
            directions: ['bottom', 'right'],
        }
        return {
            id: gId++,
            curEvent: null,

            resizable: false,
            isDragging: false,
            isResizing: false,
        }
    },
    computed: {
        parentNode() {
            return this.appendToBody ? document.body : null;
        },
    },
    render(h) {
        const key = `_custom-dialog-${this.id}_`;
        const clazz = (this.classList || []).reduce((pre, cur) => {
            pre[cur] = true;
            return pre;
        }, {});
        const style = {};
        !isNil(this.width) && (style.width = this.parsePx(this.width));
        !isNil(this.height) && (style.height = this.parsePx(this.height));
        return <div class="custom-dialog-placeholder" key={key}>
            <transition name="custom-dialog-fade-out">
                <div {...{
                    class: {
                        'custom-dialog__wrapper': true,
                        'full-screen': this.fullScreen,
                        'has-shadow': this.shadow,
                        'append-to-body': this.appendToBody
                    },
                    directives: [
                        {
                            name: 'transfer-dom',
                            value: this.parentNode,//为null,代表不移动
                        },
                        {
                            name: 'show',
                            value: this.show
                        }
                    ],
                    ref: "dialogWrapper"
                }}>
                    <div {...{
                        class: {
                            ...clazz,
                            'custom-dialog': true,
                            'full-screen': this.fullScreen,
                        },
                        style: style,
                        on: {
                            mousedown: this.promoteDialogZIndex
                        },
                        ref: 'dialog'
                    }}>
                        <div class="dialog__title" ref="title">
                            {this.$scopedSlots.title ? this.$scopedSlots.title() : (this.$slots.title || null)}
                        </div>
                        <div class="dialog__content">
                            {this.$scopedSlots.default ? this.$scopedSlots.default() : (this.$slots.default || null)}
                        </div>
                        <div class="dialog__footer">
                            {this.$scopedSlots.footer ? this.$scopedSlots.footer() : (this.$slots.footer || null)}
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    },
    mounted() {
        const dialog = this.$refs.dialog;
        const title = this.$refs.title;
        let direction = null, resizeHit = false;
        const offResizeCheck = on(dialog, 'mousemove', rafThrottle((e) => {
            if (!this.resizable || this.curEvent || this.fullScreen) return;
            if (this.isDragging || this.isResizing) return;
            const rect = dialog.getBoundingClientRect();
            checkHit.call(this, e.clientX, e.clientY);

            function checkHit(x, y) {
                const {resizeOpts} = this;
                const {zoneSize, directions} = resizeOpts;
                const isInside = (
                    y >= rect.top && y <= rect.bottom &&
                    x >= rect.left && x <= rect.right
                )

                if (!isInside) {
                    direction = null;
                    resizeHit = false;
                    return
                }
                const checkMap = {
                    top: y - rect.top <= zoneSize,
                    bottom: rect.bottom - y <= zoneSize,
                    left: x - rect.left <= zoneSize,
                    right: rect.right - x <= zoneSize
                }

                const res = directions.sort().filter(item => checkMap[item])

                if (res.length) {
                    direction = res.join('-')
                    resizeHit = true
                } else {
                    direction = null
                    resizeHit = false
                }
                dialog.style.cursor = direction ? cursorMap[direction] : null;
            }
        }));
        const offDragDoc = dragHelper(document, ({e, type, state}) => {
            if (!this.draggable && !this.resizable) return
            if (this.fullScreen) return;
            if (type === 'start') {
                if (this.draggable && title.contains(e.target)) {
                    this.curEvent = Event.Drag
                    title.style.cursor = 'move';
                    this.isDragging = true;
                } else if (this.resizable && resizeHit) {
                    this.curEvent = Event.Resize;
                    title.style.cursor = null;
                    document.body.style.userSelect = 'none';
                    this.isResizing = true;
                } else {
                    this.curEvent = Event.None;
                }
                if (this.curEvent) {
                    state.x = e.clientX;
                    state.y = e.clientY;
                    state.dialogRect = dialog.getBoundingClientRect();
                    const wrap = dialog.parentNode;
                    state.wrapRect = wrap.getBoundingClientRect();
                    if (this.curEvent === Event.Drag) {
                        state.padding = this.padding || [0, 0, 0, 0];
                        const rect = this.paddingTarget instanceof HTMLElement
                            ? this.paddingTarget.getBoundingClientRect()
                            : (this.paddingTarget === null ? state.dialogRect : title.getBoundingClientRect());
                        state.dragTargetRect = rect;
                        state.offsetLeft = state.dialogRect.left - rect.left;
                        state.offsetTop = state.dialogRect.top - rect.top;
                    } else if (this.curEvent === Event.Resize) {
                        const style = getStyle(dialog);
                        let minWidth = style.minWidth;
                        let minHeight = style.minHeight;
                        let maxWidth = style.maxWidth;
                        let maxHeight = style.maxHeight;
                        minWidth = minWidth === 'none' ? 0 : +minWidth.replace('px', '');
                        minHeight = minHeight === 'none' ? 0 : +minHeight.replace('px', '');
                        maxWidth = maxWidth === 'none' ? Infinity : +maxWidth.replace('px', '');
                        maxHeight = maxHeight === 'none' ? Infinity : +maxHeight.replace('px', '');
                        state.direction = direction;
                        state.sizeRange = [minWidth, maxWidth, minHeight, maxHeight];
                    }
                }
                return !!this.curEvent;
            } else if (type === 'move') {
                switch (this.curEvent) {
                    case Event.Drag:
                        this.handleDrag(e, state);
                        break;
                    case Event.Resize:
                        this.handleResize(e, state);
                        break;
                }
            } else { //end
                this.curEvent = Event.None;
                title.style.cursor = 'auto';
                document.body.style.userSelect = 'auto';
                this.isDragging = false;
                this.isResizing = false;
            }
        }, {})
        this.$once('hook:beforeDestroy', () => {
            offResizeCheck();
            offDragDoc();
            removeFromCache(this);
        });
    },
    methods: {
        handleDrag(e, state) {
            const dialog = this.$refs.dialog;
            const {x, y, dragTargetRect, wrapRect, offsetTop, offsetLeft, padding} = state;
            const [t, r, b, l] = padding;
            const {width: W, height: H, left: Left, top: Top} = wrapRect;
            const {width: w, height: h, left: left, top: top} = dragTargetRect;
            const moveX = e.clientX - x;
            const moveY = e.clientY - y;
            let _left = left + moveX;
            let _top = top + moveY;
            // bound check
            if (_left < Left + l) {
                _left = Left + l;
            } else if (_left + w > W + Left - r) {
                _left = W + Left - w - r;
            }
            if (_top < Top + t) {
                _top = Top + t;
            } else if (_top + h > H + Top - b) {
                _top = H + Top - h - b;
            }
            // boundingRect是相对于body的，这里计算相对wrap父元素的
            _left = _left - Left;
            _top = _top - Top;
            // 移动当前元素
            const LEFT = (_left >= 0 ? _left : 0) + offsetLeft;
            const TOP = (_top >= 0 ? _top : 0) + offsetTop;
            dialog.style.left = `${LEFT}px`;
            dialog.style.top = `${TOP}px`;
        },
        handleResize(e, state) {
            const dialog = this.$refs.dialog;
            const {x, y, dialogRect, wrapRect, direction, sizeRange} = state;
            const [minWidth, maxWidth, minHeight, maxHeight] = sizeRange;
            const {left, top, width, height} = dialogRect;
            const {left:Left, top:Top} = wrapRect;
            const moveX = e.clientX - x;
            const moveY = e.clientY - y;
            const drs = direction.split('-');
            const updateMap = {
                top() {
                    const h = clamp(height - moveY, minHeight, maxHeight);
                    dialog.style.top = top + height - h - Top + 'px';
                    dialog.style.height = h + 'px';
                },
                bottom() {
                    const h = clamp(height + moveY, minHeight, maxHeight);
                    dialog.style.height = h + 'px';
                },
                left() {
                    const w = clamp(width - moveX, minWidth, maxWidth);
                    dialog.style.left = left + width - w - Left + 'px';
                    dialog.style.width = w + 'px';
                },
                right() {
                    const w = clamp(width + moveX, minWidth, maxWidth);
                    dialog.style.width = w + 'px';
                },
            }
            drs.forEach(dir => updateMap[dir]());
        },
        // 新显示的dialog，z-index提升到最上层
        promoteDialogZIndex() {
            const wrapper = this.$refs.dialogWrapper;
            if (winShowCache.length > 1) {
                zIndex += 1;
                wrapper.style.zIndex = zIndex; //点击的窗口提到最上层
            } else {
                zIndex = minZIndex;
            }
        },
        placeAtCenter() {
            this.$nextTick(() => {
                const dialog = this.$refs.dialog;
                const parentNode = dialog.parentNode;
                const left = parentNode.clientWidth - dialog.offsetWidth;
                const top = parentNode.clientHeight - dialog.offsetHeight;
                dialog.style.left = `${(left > 0 ? left : 0) / 2}px`;
                dialog.style.top = `${(top > 0 ? top : 0) / 2}px`;
            })
        },
        parsePx(w) {
            const type = typeof w;
            if (type === 'number') {
                return `${w}px`;
            } else {
                return w;
            }
        },
        checkNestedPosition() {
            const dialog = this.$refs.dialog;
            const wrap = dialog.parentNode;
            if (dialog.offsetLeft > wrap.clientWidth) {
                const left = wrap.clientWidth - dialog.offsetWidth;
                dialog.style.left = left > 0 ? left + 'px' : 0;
            }
            if (dialog.offsetTop > wrap.clientHeight) {
                const top = wrap.clientHeight - dialog.offsetTop;
                dialog.style.top = top > 0 ? top + 'px' : 0;
            }
        },
    },
    watch: {
        fullScreen: {
            handler: function (v) {
                this.$nextTick(() => {
                    winShowCache.forEach(i => {
                        if (i !== this) {
                            i.checkNestedPosition();
                        }
                    });
                })
            },
            immediate: true
        },
        appendToBody: function (v) {
            if(this.show){
                this.promoteDialogZIndex();
                this.placeAtCenter();
            }
        },
        show: {
            handler: function (show) {
                this.$nextTick(() => {
                    const wrapper = this.$refs.dialogWrapper;
                    if (show) {
                        winShowCache.push(this);
                        this.promoteDialogZIndex();
                        !this.fullScreen && !this.keepPosition && this.placeAtCenter();
                    } else {
                        wrapper.style.zIndex = minZIndex;
                        removeFromCache(this);
                    }
                });
            },
            immediate: true
        },
        resize: {
            handler: function (v) {
                if (typeof v === 'boolean') {
                    this.resizable = v;
                    this.resizeOpts = v ? {
                        zoneSize: 8,
                        directions: ['bottom', 'right'],
                    } : null
                } else {
                    this.resizable = true;
                    this.resizeOpts = {
                        zoneSize: v.zoneSize || 8,
                        directions: v.directions
                    }
                    if (v.directions === 'all') {
                        this.resizeOpts.directions = ['top', 'left', 'right', 'bottom']
                    }
                }
            },
            immediate: true
        }
    },
}
</script>
<style lang="less">
.custom-dialog__wrapper {
    z-index: 1000;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    &.has-shadow {
        background-color: rgba(0, 0, 0, .4);
        pointer-events: auto;
    }

    .custom-dialog {
        backface-visibility: hidden;
        pointer-events: auto;
        position: absolute;
        height: auto;
        background-color: rgba(23, 75, 98, 0.9);
        box-shadow: 2px 2px 10px 0 black;

        &.full-screen {
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
        }
    }

    .dialog__title {
        position: relative;
        user-select: none;
        overflow: hidden;
    }
}

.custom-dialog-fade-out-enter,
.custom-dialog-fade-out-leave-to {
    opacity: 0;
}

.custom-dialog-fade-out-enter-active,
.custom-dialog-fade-out-leave-active {
    transition: opacity 0.3s;
}

.custom-dialog-fade-out-enter-to,
.custom-dialog-fade-out-leave {
    opacity: 1;
}
</style>
