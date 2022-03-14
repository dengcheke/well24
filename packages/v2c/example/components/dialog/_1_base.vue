<template>
    <div class="demo-wrapper">
        <p class="tip">
            dialog 分为 title,body,footer,对应三个slot,
        </p>
        <p> appendToBody: 是否添加到body下</p>
        <p> shadow: 设置是否显示遮罩</p>
        <p> show: 是否显示</p>
        <p> keepPosition: 是否保持拖拽后的位置,切换显示时,默认会出现在中间</p>
        <p> draggable: 是否开启拖拽,仅title部分可拖拽</p>
        <p> fullScreen: 是否全屏</p>
        <p> padding: 拖拽距离父元素边距, [top,right,bottom,left]</p>
        <p> paddingTarget: 应用边距的元素, null(dialog) / 'header'(title) /HTMLElement</p>
        <p> resize: 是否可拖拽改变大小, false / true/ {
            directions: 'all'/ ['top' / 'left' / 'bottom' / 'right'],
            zoneSize: 8,
            onResize: ({width, height})=>{}
            }</p>
        <div style="margin-bottom: 10px">
            <span class="btn" :class='{active:show}' @click="show=!show">切换show</span>
        </div>
        <p>dialog没有appendToBody时,提供一个外层定位容器</p>
        <div style="width: 800px;height: 500px;position: relative;border: 1px solid black;overflow:hidden;">
            <custom-dialog :append-to-body="appendToBody" :class-list="['test-dialog']"
                           :padding-target="target"
                           :resize="resize"
                           :shadow="shadow" :show.sync="show"
                           :draggable="draggable" :full-screen="fullScreen"
                           :keepPosition="keepPosition">
                <template #title>
                    <span class="title" ref="header">
                        我是头部
                    </span>
                    <span class="close-icon" @click="show=false">X</span>
                </template>
                <template>
                    <div>
                        appendToBody:{{ appendToBody }}
                        <span class="btn" @click="appendToBody=!appendToBody">切换</span>
                    </div>
                    <div>
                        fullScreen:{{ fullScreen }}
                        <span class="btn" @click="fullScreen=!fullScreen">切换</span>
                    </div>
                    <div>
                        resize:{{ resize }}
                        <span class="btn" @click="handleResize">切换</span>
                    </div>
                    <div>
                        shadow:{{ shadow }}
                        <span class="btn" @click="shadow=!shadow">切换</span>
                    </div>
                    <div>
                        keepPosition:{{ keepPosition }}
                        <span class="btn" @click="keepPosition=!keepPosition">切换</span>
                    </div>
                    <div>
                        draggable:{{ draggable }}
                        <span class="btn" @click="draggable=!draggable">切换</span>
                    </div>
                    <div>
                        fullScreen:{{ fullScreen }}
                        <span class="btn" @click="fullScreen=!fullScreen">切换</span>
                    </div>
                </template>
                <template #footer>
                    <div>我是尾部</div>
                </template>
            </custom-dialog>
        </div>
        <code-panel>
            <highlightjs language='javascript' :code="code"/>
        </code-panel>
    </div>
</template>

<script>
const code = `
            <template>
                <div style="width: 800px;height: 500px;position: relative;border: 1px solid black;overflow:hidden;">
                    <custom-dialog :append-to-body="appendToBody" :class-list="['test-dialog']"
                                   :padding-target="target"
                                   :resize="resize"
                                   :shadow="shadow" :show.sync="show"
                                   :draggable="draggable" :full-screen="fullScreen"
                                   :keepPosition="keepPosition">
                        <template #title>
                            <span class="title" ref="header">
                                我是头部
                            </span>
                            <span class="close-icon" @click="show=false">X</span>
                        </template>
                        <template>
                            <div>
                                appendToBody:{{ appendToBody }}
                                <span class="btn" @click="appendToBody=!appendToBody">切换</span>
                            </div>
                            <div>
                                fullScreen:{{ fullScreen }}
                                <span class="btn" @click="fullScreen=!fullScreen">切换</span>
                            </div>
                            <div>
                                resize:{{ resize }}
                                <span class="btn" @click="handleResize">切换</span>
                            </div>
                            <div>
                                shadow:{{ shadow }}
                                <span class="btn" @click="shadow=!shadow">切换</span>
                            </div>
                            <div>
                                keepPosition:{{ keepPosition }}
                                <span class="btn" @click="keepPosition=!keepPosition">切换</span>
                            </div>
                            <div>
                                draggable:{{ draggable }}
                                <span class="btn" @click="draggable=!draggable">切换</span>
                            </div>
                            <div>
                                fullScreen:{{ fullScreen }}
                                <span class="btn" @click="fullScreen=!fullScreen">切换</span>
                            </div>
                        </template>
                        <template #footer>
                            <div>我是尾部</div>
                        </template>
                    </custom-dialog>
                </div>
            <\/template>
            <script>
                export default {
                    name: "dialog_base",
                    data() {
                        return {
                            target:null,
                            appendToBody: false,
                            shadow: false,
                            show: true,
                            keepPosition: true,
                            draggable: true,
                            fullScreen: false
                        }
                    },
                    mounted() {
                        this.target = this.$refs.header
                    },
                    methods: {
                        handleResize(v) {
                            if (this.resize === false) {
                                this.resize = {
                                    directions: 'all'
                                }
                            } else {
                                this.resize = false;
                            }
                        }
                    }
                }
            <\/script>
            <style lang="less">
                .custom-dialog.test-dialog {
                    display: flex;
                    min-height: 370px;
                    min-width: 600px;
                    flex-direction: column;
                    color: white;
                }
            <\/style>`
export default {
    name: "dialog_base",
    data() {
        return {
            resize: false,
            appendToBody: false,
            shadow: false,
            show: true,
            keepPosition: true,
            draggable: true,
            fullScreen: false,
            code: code,
            target: null
        }
    },
    mounted() {
        //this.target = this.$refs.header
    },
    methods: {
        handleResize(v) {
            if (this.resize === false) {
                this.resize = {
                    directions: 'all',
                    onResize: this.onResize
                }
            } else {
                this.resize = false;
            }
        },
        onResize(args){
            console.log(args)
        }
    }
}
</script>

<style lang="less">

.custom-dialog.test-dialog {
    display: flex;
    min-height: 370px;
    min-width: 600px;
    flex-direction: column;
    color: white;

    .dialog__title {
        margin: 10px 0;
        padding: 0 20px;
        position: relative;
        overflow: visible;

        span.title {
            font-size: 20px;
            font-weight: 700;
        }

        span.close-icon {
            position: absolute;
            right: 10px;
            top: 10px;
            transform: scale(1.1, 1.0) translateY(-10px);
        }
    }

    .dialog__content {
        flex-grow: 1;
        margin: 0 20px;
        padding: 0 10px;
        background-color: rgba(22,55,76,.9);
        div {
            width: 50%;
            margin-bottom: 10px;
        }

        .btn {
            display: inline-block;
            background-color: #409eff;
            padding: 4px 12px;
        }
    }

    .dialog__footer {
        padding: 10px 20px 0 20px;

        div {
            height: 40px;
            text-align: right;
            color: #44ff44;
        }
    }

    &.full-screen {
        display: flex;
        flex-direction: column;
        align-items: stretch;

        .dialog__content {
            flex-grow: 1;
        }
    }

    .close-icon {
        display: block;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        position: absolute;
        right: 0;
        top: 0;
        cursor: auto;
    }
}
</style>
