<template>
    <div>
        <p>height: 高度, 默认'100%', 'auto'=适应内容高度, 其他值表示受限于外部高度</p>
        <p>minHeight: 最小高度,height为'auto'生效</p>
        <p>maxHeight: 最大高度,height为'auto'生效</p>
        <p>barWidth: 滚动条宽度,默认6</p>
        <p>padding: 数组/数字, 默认[0,10,10,0]</p>
        <p>viewStyle: 添加到view上的style</p>
        <p>autoHide: 是否隐藏滚动条, 可选值'never'/'leave', 默认'leave'</p>
        <p>scrollPropagation: 是否阻止冒泡, 默认false</p>
        <p>inheritWidth: 内容是否继承容器宽度, 默认true, 为true时,宽度继承容器, 为false时,取决于内容宽度
        </p>
        <p class="tip">
            适应内容宽高
        </p>
        <custom-scrollbar :max-height="200" :min-height="100" height="auto" :inherit-width="inhertWidth">
            <div style="background-color: #409eff;width: 100%;overflow:hidden;" :style="{height:height1+'px'}">
                <p>min(100)-max(200)</p>
                <div>height:{{height1}}</div>
                <div @click="height1++">+</div>
                <div @click="height1--">-</div>
                <div @click="inhertWidth = !inhertWidth">inhertWidth:{{inhertWidth}}</div>
            </div>
        </custom-scrollbar>
        <p class="tip">
            高度受限于外部
        </p>
        <div style="height: 200px;width:1000px;background-color: #9a6e3a">
            <custom-scrollbar>
                <div style="background-color: #0E9A00" :style="{height:height2+'px'}">
                    <div>容器固定200px</div>
                    <div>height:{{height2}}</div>
                    <div @click="height2++">+</div>
                    <div @click="height2--">-</div>
                </div>
            </custom-scrollbar>
        </div>
    </div>

</template>

<script>
import {vLoading} from "../../../src/directives/v-loading";
import EmptySlot from "../../../src/packages/empty-slot";
import CollapsePanel from "../../../src/packages/collapse-panel";
import CustomImage from "../../../src/packages/custom-image";
import {vClickOutside} from "../../../src/directives/v-click-outside";
import {vResize} from "../../../src/directives/v-resize";

export default {
    name: "scrollbar",
    components: {CustomImage, CollapsePanel, EmptySlot},
    directives:{
        loading:vLoading,
        clickOutside: vClickOutside,
        resize:vResize
    },
    data(){
        return {
            height1:150,
            height2:100,
            inhertWidth:false,
            src:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
        }
    },
}
</script>

<style lang="less">

</style>
