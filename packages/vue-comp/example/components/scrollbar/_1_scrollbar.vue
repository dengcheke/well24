<template>
    <div>
        <p>height: 高度, 默认'100%', 'auto'=适应内容高度, 其他值表示受限于外部高度</p>
        <p>minHeight: 最小高度,height为'auto'生效</p>
        <p>maxHeight: 最大高度,height为'auto'生效</p>
        <p>viewClass: Object | Array</p>
        <p>viewStyle: Object</p>
        <p>inheritWidth: 内容是否继承容器宽度, 默认true, <br>
            若为true,将无法监听内容宽度变化,需要手动调用updateScrollbar
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
        <div style="height: 200px;width:100%;background-color: #9a6e3a">
            <custom-scrollbar>
                <div style="background-color: #0E9A00" :style="{height:height2+'px'}">
                    <div>容器固定200px</div>
                    <div>height:{{height2}}</div>
                    <div @click="height2++">+</div>
                    <div @click="height2--">-</div>
                </div>
            </custom-scrollbar>
        </div>
        <div style="background-color: #69d6f1;width: 200px;margin-bottom: 20px;
        height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        <div style="width: 100%;height: 400px;position: relative" v-click-outside="handleClickOutside">
            <div style="background-color: #5634e3;width: 200px;margin-bottom: 20px;
            position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);
            height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        </div>

        <div style="margin-bottom: 200px" />
<!--
        <collapse-panel :expand.sync="expand" title="xxxxxx">
            <div class="content" style="height: auto" v-click-outside="handleClickOutside">
                <custom-image lazy v-resize="vv"
                              style="width: 500px;height: 500px;"
                              :src="src"/>
            </div>
        </collapse-panel>-->
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
    methods:{
        handleClickOutside(v1,v2){
            console.log(1)
        },
        handleResize(entry){
            console.log(1)
        },

    }
}
</script>

<style lang="less">

</style>
