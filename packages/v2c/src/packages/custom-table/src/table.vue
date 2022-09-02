<template>
    <div class="custom-table outer-wrapper"
         @mouseenter="mouseEnter=true"
         @mouseleave="mouseEnter=false"
         :class="{'is-drag-scroll':isDragScroll}"
         :uid="'table_uid_'+_globalTableId"
         :style="_calcElStyle()">
        <div class="inner-wrapper" :style="_calcInnerStyle()"
             ref="innerWrap" style="z-index: 0">
            <div class="table-main">
                <div class="table__header-wrapper" ref="headerWrap" v-show="showHeader">
                    <table-header/>
                </div>
                <div class="table__body-wrapper" ref="bodyWrap"
                     @mouseleave="_mouseLeaveTable">
                    <div class="resize-observer-wrapper" ref="bodyResizeWrap"
                         style="display: inline-block;float:left;position:relative">
                        <table-body/>
                    </div>
                </div>
                <div class="table__footer-wrapper" ref="footerWrap">
                    <table-footer/>
                </div>
            </div>
            <div class="table__fixed--left" style="z-index: 1" v-if="fixedLeftCount"
                 :class="{'fixed-shadow':showLeftShadow}"
                 :style="{width:fixedLeftWidth+'px'}">
                <div class="table__header-wrapper fixed-left" v-show="showHeader">
                    <table-header fixed="left"/>
                </div>
                <div class="table__body-wrapper fixed-left" ref="bodyWrapLeft"
                     :style="{height:bodyRect.height+'px'}">
                    <table-body fixed="left"/>
                </div>
                <div class="table__footer-wrapper fixed-left">
                    <table-footer fixed="left"/>
                </div>
            </div>
            <div class="table__fixed--right" style="z-index: 2" v-if="fixedRightCount"
                 :class="{'fixed-shadow':showRightShadow}"
                 :style="{ width:fixedRightWidth+'px'}">
                <div class="table__header-wrapper fixed-right" v-show="showHeader"
                     :style="{height:headerRect.height+'px'}">
                    <table-header fixed="right" style="position: absolute;right: 0;top:0;"/>
                </div>
                <div class="table__body-wrapper fixed-right" ref="bodyWrapRight"
                     :style="{height:bodyRect.height+'px'}">
                    <table-body fixed="right" style="position: absolute;right: 0;top:0;"/>
                </div>
                <div class="table__footer-wrapper fixed-right"
                     :style="{height: footerRect.height+'px'}">
                    <table-footer fixed="right" style="position: absolute;right: 0;top:0;"/>
                </div>
            </div>
            <bar :class="{'is-active':showX,'table-scrollbar':true}"
                 :data="dataX" ref="barX"
                 :style="_calcBarStyle('x')"/>
            <bar :class="{'is-active':showY,'table-scrollbar':true}"
                 :data="dataY" ref="barY" vertical
                 :style="_calcBarStyle('y')"/>
            <div class="empty__wrapper"
                 v-show="empty" :style="_calcEmptyStyle()">
                <slot name="empty"/>
            </div>
            <div v-if="isDragCol" class="drag-line" style="z-index: 5"
                 :style="{top:dragLineTop+'px',left:dragLineLeft+'px'}"/>
        </div>
    </div>
</template>

<script type="text/babel">
import {clamp, isIE} from "@well24/utils";
import {TableEvent} from "./table-config";
import store from './store';
import TableHeader from './table-header';
import TableBody from './table-body';
import TableFooter from './table-footer';
import ResizeObserver from 'resize-observer-polyfill';
import Bar from '@src/packages/bar';
import {getTableId, isDefined, mapping, treeToArray} from "./utils";
import {ScrollScheduler} from "./scroll";
import {bindMousewheel} from "@src/directives/v-mousewheel";

const defaultRect = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
}
const OneFrameTime = 1000 / 60;
export default {
    name: "CustomTable",
    provide() {
        return {
            table: this,
            store: this.store
        }
    },
    props: {
        rowKey: {
            type: String | Function,
            default: null,
        },
        childrenKey: {
            type: String,
            default: 'children',
        },
        treeNodeKey: {
            type: String,
            default: null,
        },
        tableCols: {
            type: Array,
            default: () => [],
        },
        tableData: {
            type: Array,
            default: () => []
        },
        footerData: {
            type: Array,
            default: () => []
        },
        height: {
            type: Number | String,
            default: 'auto',
        },
        maxHeight: {
            type: Number,
            default: null
        },
        minHeight: {
            type: Number,
            default: null
        },
        resizable: {
            type: Boolean,
            default: false
        },
        align: {
            type: String,
            default: null,//left right center  同text-align
        },
        indent: {
            type: Number,
            default: 16
        },
        expandRender: {
            type: Function,
            default: null,
            desc: "展开render(h,{row})或者 template #expand={row} "
        },
        spanMethod: {
            type: Function,
            default: null,
            desc: '合并td方法 返回[rowspan,colspan],仅在常规col生效,check和expand不生效'
        },
        enableCurrentRow: {
            type: Boolean,
            default: true
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        resetScrollOnDataChange: {
            // 数据变化时,是否将滚动重置到左上角,
            // 改变data才会触发，tabeleData = [...tableData] 会触发，
            // tableData.push(xxx) 不会触发
            type: Boolean,
            default: true
        },

        autoHide: {
            //是否隐藏滚动条
            type: String, //never / leave
            default: 'leave',
        },
        scrollFrames: {
            type: Number,
            default: 20
        },

        //style
        rowStyle: {
            type: Object | Function,
            default: null,
        },
        rowClass: {
            type: String | Object | Array | Function,
            default: null,
        },
        cellStyle: {
            type: Object | Function,
            default: null,
        },
        cellClass: {
            type: String | Object | Array | Function,
            default: null,
        },
        headerRowStyle: {
            type: Object | Function,
            default: null,
        },
        headerRowClass: {
            type: String | Object | Array | Function,
            default: null,
        },
        headerCellStyle: {
            type: Object | Function,
            default: null,
        },
        headerCellClass: {
            type: String | Object | Array | Function,
            default: null,
        },
        footerRowStyle: {
            type: Object | Function,
            default: null,
        },
        footerRowClass: {
            type: String | Object | Array | Function,
            default: null,
        },
        footerCellStyle: {
            type: Object | Function,
            default: null,
        },
        footerCellClass: {
            type: String | Object | Array | Function,
            default: null,
        },

        //test
        enableHighlightCol: {
            type: Boolean,
            default: false,
        },
        highlightColHeaderCellStyle: {
            type: Object,
            default: null
        },
        highlightColRowCellStyle: {
            type: Object,
            default: null
        },
    },
    components: {
        TableHeader, TableBody, TableFooter, Bar
    },
    data() {
        this.store = new store();
        this.store.table = this;
        this._globalTableId = getTableId();

        //---test only---
        this.headerStyleElm = document.createElement('style');
        document.body.appendChild(this.headerStyleElm);
        this.headerStyleElm.setAttribute('use-for-table-' + this._globalTableId, "");
        this.$once('hook:beforeDestroy', () => {
            document.body.removeChild(this.headerStyleElm)
        })
        //---test only---

        this.durFrames = 15;
        this.scrollPropagation = true;
        this.barWidth = 6;
        this.barGutter = 10;
        this.x = 0;
        this.y = 0;
        this.schdX = new ScrollScheduler({
            onTick: v => {
                this.x = Math.round(v);
                this.dataX.move = this.x;
                const {bodyWrap, headerWrap, footerWrap} = this.$refs;
                if (this.scrollSize[0] > this.bodyRect.width) { //存在滚动条
                    if (this.x <= 2) {
                        this.scrollPosition = "left";
                    } else if ((this.scrollSize[0] - this.bodyRect.width - this.x) <= 2) {
                        this.scrollPosition = "right";
                    } else {
                        this.scrollPosition = "middle";
                    }
                }
                //update header
                [bodyWrap, headerWrap, footerWrap].forEach(i => {
                    i && (i.scrollLeft = this.x);
                });
            }
        });
        this.schdY = new ScrollScheduler({
            durFrames: this.scrollFrames || 15,
            onTick: v => {
                this.y = Math.round(v);
                this.dataY.move = this.y;
                const {bodyWrap, bodyWrapLeft, bodyWrapRight} = this.$refs;
                [bodyWrapLeft, bodyWrap, bodyWrapRight].forEach(view => {
                    view && (view.scrollTop = this.y);
                });
            },
        });
        const off = this.$watch('scrollFrames', (v) => {
            this.schdX.durFrames = this.schdY.durFrames = v || 15;
        }, {immediate: true});
        this.$once('hook:beforeDestroy', () => {
            off();
        })
        return {
            //滚动相关
            scrollPosition: 'left',

            isDragCol: false,//在拖拽列
            dragLineLeft: 0,//拖拽线位置
            dragLineTop: 0,

            dataX: {
                move: 0,
                clientSize: NaN,
                scrollSize: NaN,
                atEnd: false
            },
            dataY: {
                move: 0,
                clientSize: NaN,
                scrollSize: NaN,
                atEnd: false
            },
            mouseEnter: false,
            isDragScroll: false,

            //new
            elRect: {...defaultRect},
            headerRect: {...defaultRect},
            bodyRect: {...defaultRect},
            footerRect: {...defaultRect},
            scrollSize: [0, 0],
        }
    },
    mounted() {
        this._initEvent();
        this._initScroll();
        const {barX, barY} = this.$refs;
        barX.init(this);
        barY.init(this);
    },
    computed: {
        hasScrollX() {
            return this.scrollSize[0] > this.bodyRect.width
        },
        hasScrollY() {
            return this.scrollSize[1] > this.bodyRect.height
        },
        ...mapping('store', {
            containerWidth: store => store.containerWidth || 0,
            fixedLeftCount: store => store.fixedLeftCount || 0,
            fixedLeftWidth: store => store.fixedLeftWidth || 0,
            fixedRightCount: store => store.fixedRightCount || 0,
            fixedRightWidth: store => store.fixedRightWidth || 0,
            tableBodyWidth: store => store.tableBodyWidth || 0,
        }),
        showLeftShadow() {
            const scrollPosition = this.scrollPosition,
                empty = this.empty;
            return this.hasScrollX && scrollPosition !== 'left' && !empty;
        },
        showRightShadow() {
            const scrollPosition = this.scrollPosition,
                empty = this.empty;
            return this.hasScrollX && scrollPosition !== 'right' && !empty;
        },
        empty() {
            return !this.tableData || this.tableData.length === 0
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
    methods: {
        //初始化
        _initEvent() {
            //监听size change
            const el = this.$el;
            const {headerWrap, bodyResizeWrap, footerWrap, bodyWrap} = this.$refs;
            const ro = new ResizeObserver((entries) => {
                entries.forEach(en => {
                    const target = en.target;
                    if (target === el) {
                        this.elRect = en.contentRect;
                        const w = el.clientWidth;
                        w && (this.store.containerWidth = w);
                    } else if (target === headerWrap) {
                        this.headerRect = en.contentRect;
                    } else if (target === bodyWrap) {
                        this.bodyRect = en.contentRect;
                        this.dataX.clientSize = this.bodyRect.width;
                        this.dataY.clientSize = this.bodyRect.height;
                    } else if (target === footerWrap) {
                        this.footerRect = en.contentRect;
                    } else if (target === bodyResizeWrap) {
                        this.scrollSize = [en.contentRect.width, en.contentRect.height];
                        this.dataX.scrollSize = this.scrollSize[0];
                        this.dataY.scrollSize = this.scrollSize[1];
                    }
                });
            });
            [el, headerWrap, bodyWrap, bodyResizeWrap, footerWrap].forEach(i => ro.observe(i));
            this.$once("hooK:beforeDestroy", () => {
                ro.disconnect();
            });
        },
        _initScroll() {
            const {innerWrap} = this.$refs;
            let lastWheelTime = performance.now();
            let lastWheelXD = null;
            let lastWheelYD = null;
            const offwheel = bindMousewheel(innerWrap, (event, data) => {
                if (event.ctrlKey) return;
                if (event.shiftKey && isIE) return _prevent(event);
                const cur = performance.now();
                let canScroll = true;
                let needNewStart = cur - lastWheelTime > OneFrameTime * 2;
                lastWheelTime = cur;
                let delta, direct, curValue, maxValue;
                const wheelDir = data.spinY > 0 ? 1 : -1;
                if (!event.shiftKey) {
                    maxValue = this.scrollSize[1] - this.bodyRect.height;
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
                    maxValue = this.scrollSize[0] - this.bodyRect.width;
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
                            delta && schd.addDelta(delta);
                        }
                    } else {
                        schd.start(curValue, to);
                    }
                    return _prevent(event)
                } else {
                    if (this.scrollPropagation) {
                        return _prevent(event)
                    }
                }

                function _prevent(event) {
                    event.preventDefault?.();
                    event.stopPropagation?.();
                    event.returnValue = false;
                    event.cancelBubble = true;
                    return false;
                }
            });
            this.$once('hook:beforeDestroy', () => {
                offwheel();
            })
        },

        _calcEmptyStyle() {
            return {
                color: 'white',
                position: 'absolute',
                top: this.headerRect.height + 'px',
                bottom: this.footerRect.height + 'px',
                left: 0,
                right: 0,
                height: 'auto',
                width: 'auto',
                zIndex: 4,
            }
        },
        /// layout and event
        _calcElStyle() {
            const style = {};
            style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
            if (this.minHeight) style.minHeight = this.minHeight + 'px';
            if (this.maxHeight) style.maxHeight = this.maxHeight + 'px';
            return style;
        },
        //内部wrap样式
        _calcInnerStyle() {
            const style = {}, W = this.containerWidth;
            if (!W) return;
            const fixedWidth = this.fixedLeftWidth + this.fixedRightWidth;
            style.width = clamp(this.tableBodyWidth, 0, Math.max(fixedWidth, W)) + 'px';
            if (this.height === 'auto') { //内容自增
                const min = this.minHeight, max = this.maxHeight;
                let contentH = this.headerRect.height + this.footerRect.height;
                if (!this.empty) {
                    contentH += this.scrollSize[1];
                }
                if (min && !max) {
                    style.height = Math.max(contentH, min) + 'px';
                } else if (!min && max) {
                    style.height = Math.min(contentH, max) + 'px';
                } else if (min && max) {
                    style.height = clamp(contentH, min, max) + 'px';
                } else {
                    style.height = contentH + 'px';
                }
            } else { //高度受限于外部
                style.height = '100%';
            }
            return style;
        },
        _calcBarStyle(type) {
            const hasFooter = this.footerRect.height > 0;
            const gap = Math.max((this.barGutter - this.barWidth) * 0.5, 0);
            if (type === 'x') {
                return {
                    left: '2px',
                    right: (hasFooter ? 2 : (this.hasScrollY ? this.barGutter : 2)) + 'px',
                    height: this.barWidth + 'px',
                    bottom: gap + this.footerRect.height + 'px',
                    zIndex: 3
                }
            } else {
                return {
                    right: gap + 'px',
                    top: this.headerRect.height + 2 + 'px',
                    bottom: (hasFooter ? this.footerRect.height + 2 : (this.hasScrollX ? this.barGutter : 2)) + 'px',
                    width: this.barWidth + 'px',
                    zIndex: 3
                }
            }
        },
        _mouseLeaveTable() {
            this.store.hover$Idx = this.store.hoverRow = null;
        },

        /*代理子组件事件*/
        dispatchEvent(topic, ...args) {
            this.$emit(topic, ...args);
        },


        //获得一个row的key值
        getRowKey(row) {
            if (typeof this.rowKey === 'string') {
                return row[this.rowKey];
            } else if (typeof this.rowKey === 'function') {
                return this.rowKey(row);
            } else {
                return null;
            }
        },
        //获取一个row,可以是key值
        getRow(row) {
            return this.store.flatDfsData.find(i => {
                if (!row) return false;
                if (typeof row === 'object') {
                    if (i === row) {
                        return true
                    } else {
                        let a = this.getRowKey(i), b = this.getRowKey(row);
                        return a && b && a === b;
                    }
                } else { //默认row是id值
                    return this.getRowKey(i) === row;
                }
            })
        },


        //设置当前行,不传则取消当前行
        setCurrentRow(row) {
            const store = this.store;
            row = this.getRow(row);
            if (!row) {
                store.selectRow = store.select$Idx = null;
            } else {
                if (row !== store.selectRow) {
                    store.selectRow = row;
                    store.select$Idx = store.renderList.findIndex(i => i === row);
                } else {
                    store.selectRow = store.select$Idx = null;
                }
            }
        },
        //设置一列的排序,
        setColumnSort(col, sort = null, emit = true) {
            const node = this.store.sortColumns.find(i => {
                return i.key === col.key /*object has key*/
                    || i.key === col   /*string*/
                    || i.col === col; /*object ===*/
            });
            if (node.sort !== sort) {
                node.sort = sort;
                this.store.sortChangeTrigger++;
                emit && this.dispatchEvent(TableEvent.ColSortChange, node.col, node.sort, this.store.sortColumns);
            }
        },
        //移除所有的排序
        clearAllSort() {
            let change = false;
            this.store.sortColumns.forEach(node => {
                isDefined(node.sort) && (change = true) && (node.sort = null);
            });
            change && this.store.sortChangeTrigger++;
        },

        //勾选节点，不改变渲染列表，只改变class
        toggleRowChecked(row, checked, emit = true) {
            const store = this.store, checkedSet = store.checkedSet, self = this;
            row = this.getRow(row);
            if (!row) return;
            let change = false, has = checkedSet.has(row);
            if (isDefined(checked)) { //指定了状态
                checked = Boolean(checked)
            } else { //未指定，toggle
                checked = !has
            }
            if (checked && !has) {
                checkedSet.add(row);
                change = true;
            } else if (!checked && has) {
                checkedSet.delete(row);
                change = true;
            }
            if (change) {
                const treeNode = store.treeData.get(row);
                if (treeNode) { //是树形节点
                    //process children
                    const children = row[this.childrenKey];
                    if (children && children.length) {
                        const flatChildren = treeToArray(children, this.childrenKey);
                        flatChildren.forEach(child => {
                            checkedSet[checked ? 'add' : 'delete'](child);
                        })
                    }
                    //process parent
                    let parent = treeNode.parent;
                    while (parent) {
                        const oldStatus = checkedSet.has(parent);
                        const newStatus = checkParent(parent);
                        if (oldStatus === newStatus) break;
                        if (newStatus) { //之前没勾选.现在勾选
                            checkedSet.add(parent);
                        } else { //现在不勾选
                            checkedSet.delete(parent);
                        }
                        const pNode = store.treeData.get(parent);
                        pNode && (parent = pNode.parent);
                    }
                }
                store.checkNums = checkedSet.size;
                store.checkTrigger++;
                emit && this.dispatchEvent(TableEvent.RowCheck, row, checked, checkedSet /*readOnly*/);
            }

            function checkParent(parent) {
                const children = parent[self.childrenKey];
                const checkItem = children.find(child => checkedSet.has(child));
                const unCheckItem = children.find(child => !checkedSet.has(child));
                return checkItem && !unCheckItem
            }
        },
        setAllChecked(check) {
            const store = this.store;
            check = Boolean(check);
            const oldAllCheck = store.checkNums === store.flatDfsData.length; //之前是否全选
            if ((oldAllCheck && check) || (!store.checkNums && !check)) return;
            store.checkedSet = check ? new Set(store.flatDfsData) : new Set();
            store.checkNums = check ? store.flatDfsData.length : 0;
            store.checkTrigger++;
            Array.from(store.checkedSet).forEach((item)=>{
                this.dispatchEvent(TableEvent.RowCheck, item, check, store.checkedSet);
            })
        },

        //展开节点, 影响渲染列表
        toggleRowExpanded(row, expanded, emit = true) {
            const store = this.store, expandedSet = store.expandedSet;
            row = this.getRow(row);
            if (!row) return;
            let change = false, has = expandedSet.has(row);
            if (isDefined(expanded)) { //指定了状态
                expanded = Boolean(expanded)
            } else { //未指定，toggle
                expanded = !has
            }
            if (expanded && !has) {
                expandedSet.add(row);
                change = true;
            } else if (!expanded && has) {
                expandedSet.delete(row);
                change = true;
            }
            if (change) {
                store.expandTrigger++;
                store.updateRenderList();
                store.updateSelect();
                emit && this.dispatchEvent(TableEvent.RowExpand, row, expanded, expandedSet/*readOnly*/);
            }
        },
        setAllExpanded(expanded) {
            expanded = Boolean(expanded);
            const store = this.store;
            let oldAllExpanded = store.expandedSet.size === store.flatDfsData.length;
            if ((oldAllExpanded && expanded) || (!store.expandedSet.size && !expanded)) return;
            this.store.expandedSet = expanded ? new Set(this.store.flatDfsData) : new Set();
            this.store.expandTrigger++;
            this.store.updateRenderList();
            this.store.updateSelect();
        },

        //展开树节点
        toggleTreeExpanded(row, expanded, emit = true) {
            const store = this.store, treeMap = store.treeData;
            row = this.getRow(row);
            if (!row) return;
            const treeNode = treeMap.get(row);
            if (!treeNode) return;
            if (isDefined(expanded)) {
                expanded = Boolean(expanded)
            } else {
                expanded = !treeNode.treeExpand
            }
            let change = false;
            if (expanded && !treeNode.treeExpand) { //展开,顺着父节点一直展开到root
                if (!treeNode.isLeaf) { //叶子节点不可展开
                    treeNode.treeExpand = true;
                    store.treeExpandedSet.add(row);
                }
                let p = treeNode.parent;
                while (p) {
                    store.treeExpandedSet.add(p);
                    const pNode = treeMap.get(p);
                    pNode.treeExpand = true;
                    p = pNode.parent
                }
                change = true;
            } else if (!expanded && treeNode.treeExpand && !treeNode.isLeaf) {
                treeNode.treeExpand = false;
                store.treeExpandedSet.delete(row);
                change = true;
            }
            if (change) {
                store.treeExpandTrigger++;
                store.updateRenderList();
                store.updateSelect();
                emit && this.dispatchEvent(TableEvent.TreeRowExpand, row, expanded, store.treeExpandedSet/*readOnly*/);
            }
        },
        setAllTreeExpanded(expanded) {
            expanded = Boolean(expanded);
            const store = this.store, {treeData, treeExpandedSet} = store;
            let change = false;
            if (expanded) { //全部展开
                //找到一个非叶子的未展开节点
                const unExpandOne = Array.from(treeData).find(item => {
                    const [row, treeNode] = item;
                    return !treeNode.isLeaf && !treeNode.treeExpand;
                });
                if (unExpandOne) change = true;
                //do update
                const _set = store.treeExpandedSet = new Set();
                treeData.forEach((treeNode, row) => {
                    if (!treeNode.isLeaf) {
                        _set.add(row);
                        treeNode.treeExpand = true
                    }
                });
            } else { //全部不展开
                const expandOne = Array.from(treeData).find(item => {
                    const [row, treeNode] = item;
                    return !treeNode.isLeaf && treeNode.treeExpand;
                });
                if (expandOne) change = true;
                treeExpandedSet.clear();
                treeData.forEach(treeNode => {
                    treeNode.treeExpand = false;
                });
            }
            if (change) {
                store.treeExpandTrigger++;
                store.updateRenderList();
                store.updateSelect();
            }
        },

        //获取排序的列节点
        getSortColumnNodes() {
            return this.store.sortColumns;
        },

        scrollTo({left: x, top: y, smooth = true}) {
            const {schdX, schdY} = this;
            const maxX = this.scrollSize[0] - this.bodyRect.width;
            const maxY = this.scrollSize[1] - this.bodyRect.height;
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
                const match = (v + '').match(/^([+-])=(\d*|\d*\.\d*)$/);
                if (!match) throw new Error('invalid input:', v);
                return (match[1] === '+' ? 1 : -1) * (+match[2]) + target;
            }
        }
    },
    watch: {
        tableCols: {
            handler: function (cols) {
                if (cols && cols.length) {
                    this.store.computedCols(cols);//计算列信息
                    this.store.computedColWidth();//计算table宽度
                }
            },
            immediate: true
        },
        tableData: {
            handler: function (newly, older) {
                //重新赋值,滚动到左上角
                newly !== older && this.resetScrollOnDataChange && this.scrollTo({left: 0, top: 0, smooth: false});
                this.store.handleTableDataChange();
            },
            immediate: true
        },
        'store.checkTrigger': function () {
            this.dispatchEvent(TableEvent.CheckChange, this.store.checkedSet /*readOnly*/);
        },
        'store.expandTrigger': function () {
            this.dispatchEvent(TableEvent.ExpandChange, this.store.expandedSet /*readOnly*/);
        },
        'store.treeExpandTrigger': function () {
            this.dispatchEvent(TableEvent.TreeExpandChange, this.store.treeExpandedSet /*readOnly*/);
        },
        'store.sortChangeTrigger': function () {
            this.dispatchEvent(TableEvent.SortChange, this.store.sortColumns);
        },
    },
    install(Vue) {
        Vue.component(this.name, this);
    }
}
</script>

<style lang="less">
@import './skeleton.less';
</style>
