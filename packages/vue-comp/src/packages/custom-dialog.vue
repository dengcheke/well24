<script type="text/jsx">
import {off, on, rafThrottle} from "@well24/utils";
import {vTransferDom} from "@src/directives/v-transfer-dom";
import isNil from "lodash/isNil";
import {vResize} from "@src/directives/v-resize";

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
        resize:{
            /*是否可拖拽改变大小, false/true/{
                directions:all/top/left/bottom/right
            }*/
            default: false,
        }
    },
    data() {
        this._info = {
            left: null,
            top: null,
            size: [0, 0]
        };
        return {
            id: gId++,
            isDrag:false,
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
                        directives: [
                            {
                                name:'resize',
                                value: (this.isDrag || this.fullScreen)
                                    ? false
                                    : (this.resize === false
                                            ? false
                                            : {
                                                ...this.resize,
                                                onResize: this.onResize
                                            }
                                    ),
                            }
                        ],
                        style: style,
                        on: {
                            mousedown: this.promoteDialogZIndex
                        },
                        ref: 'dialog'
                    }}>
                        <div class="dialog__title"
                             ref="title"
                             style={{cursor: this.draggable ? 'move' : 'auto'}}>
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
        const offDrag = this.initDrag();
        this.$once('hook:beforeDestroy', () => {
            offDrag();
            removeFromCache(this);
        })
    },
    methods: {
        onResize({direction, oldSize, size}) {
            const [oldw, oldh] = oldSize;
            const [w, h] = size;
            const el = this.$refs.dialog
            const {left, top} = this._info;
            let newTop, newLeft;
            if (direction.indexOf('top') !== -1 && this._info.size[1] !== oldh) {
                newTop = oldh + top - h;
                el.style.top = newTop + 'px';
                this._info.top = newTop;
            }
            if (direction.indexOf('left') !== -1 && this._info.size[0] !== oldw) {
                newLeft = oldw + left - w;
                el.style.left = newLeft + 'px';
                this._info.left = newLeft;
            }
            this._info.size = [oldw, oldh]
        },
        initDrag() {
            const dialog = this.$refs.dialog,
                wrap = dialog.parentNode,
                title = this.$refs.title;
            const titleOnMousedown = (e) => {
                if (!this.draggable) return;
                this.isDrag = true
                //take snapshot
                document.body.style.userSelect = 'none';
                //cur position
                const x = e.clientX; //当前页面点击X
                const y = e.clientY; //当前页面点击Y

                //wrap position
                let wrapRect = wrap.getBoundingClientRect();
                const [t, r, b, l] = this.padding;
                const W = wrapRect.width,
                    H = wrapRect.height,
                    Left = wrapRect.left,
                    Top = wrapRect.top;

                const dialogRect = dialog.getBoundingClientRect();

                const rect = this.paddingTarget instanceof HTMLElement
                    ? this.paddingTarget.getBoundingClientRect()
                    : (this.paddingTarget === null ? dialogRect : title.getBoundingClientRect());
                const offsetLeft = dialogRect.left - rect.left;
                const offsetTop = dialogRect.top - rect.top;


                const h = rect.height, w = rect.width, //初始位置
                    left = rect.left, top = rect.top;

                const onMousemove = rafThrottle((e) => {
                    if (this.fullScreen) return;

                    const moveX = e.clientX - x; //x移动的距离
                    const moveY = e.clientY - y; //y移动的距离
                    let _left = left + moveX; //新的left
                    let _top = top + moveY; //新的top
                    // 边界处理
                    if (_left < Left + l) {
                        _left = Left + l + 1;
                    } else if (_left + w > W + Left - r) {
                        _left = W + Left - w - r - 1;
                    }
                    if (_top < Top + t) {
                        _top = Top + t + 1;
                    } else if (_top + h > H + Top - b) {
                        _top = H + Top - h - b - 1;
                    }
                    _left = _left - Left;//boundingRect是相对于body的，这里计算相对wrap父元素的
                    _top = _top - Top;
                    // 移动当前元素
                    const LEFT = (_left >= 0 ? _left : 0) + offsetLeft;
                    const TOP = (_top >= 0 ? _top : 0) + offsetTop;
                    dialog.style.left = `${LEFT}px`;
                    dialog.style.top = `${TOP}px`;
                    this._info.left = LEFT;
                    this._info.top = TOP;
                });
                const onMouseup = () => {
                    this.isDrag = false;
                    off(document, 'mousemove', onMousemove);
                    off(document, 'mouseup', onMouseup);
                    document.body.style.userSelect = null;
                };
                on(document, 'mousemove', onMousemove);
                on(document, 'mouseup', onMouseup);
                return false;
            };
            on(title, 'mousedown', titleOnMousedown);
            return () => {
                off(title, 'mousedown', titleOnMousedown);
            }
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
            this.show && this.placeAtCenter();
        },
        show: {
            handler: function (v) {
                this.$nextTick(() => {
                    const wrapper = this.$refs.dialogWrapper;
                    if (v) {
                        winShowCache.push(this);
                        this.promoteDialogZIndex();
                        !this.fullScreen && !this.keepPosition && this.placeAtCenter();
                    } else {
                        wrapper.style.zIndex = '1000';
                        removeFromCache(this);
                    }
                });
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
