<template>
    <div class="sec-scrollbar">
        <custom-scrollbar :max-height="400" :min-height="100" height="auto">
            <div class="content" style="position:relative;" v-loading="load">
                <empty-slot/>
            </div>
        </custom-scrollbar>
        <collapse-panel :expand.sync="expand" title="xxxxxx">
            <div class="content" style="height: auto" v-click-outside="handleClickOutside">
                <custom-image lazy v-resize="vv"
                              style="width: 500px;height: 500px;"
                              :src="src"/>
            </div>
        </collapse-panel>
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
        clickOutside:vClickOutside,
        resize:vResize
    },
    data(){
        setTimeout(()=>{
            this.vv = true
        },5000)
        return {
            load:true,
            expand:true,
            vv:false,
            src:'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg'
        }
    },
    methods:{
        handleClickOutside(v1,v2){
            console.log(1)
        },
        handleResize(entry){
            console.log(1)
        }
    }
}
</script>

<style lang="less">
.sec-scrollbar{
    width: 100%;
    height: 300px;
    background-color: #0E9A00;
    .content{
        width: 800px;
        height: 200px;
        background: linear-gradient(45deg, red, blueviolet ,yellow);
    }
}

</style>
