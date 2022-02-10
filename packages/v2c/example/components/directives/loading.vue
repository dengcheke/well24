<template>
    <div>
        <p class="tip">
            遮罩
        </p>
        <div @click="loading=!loading">切换loading</div>
        <div v-loading="loading"
             style="width: 200px;height: 200px;background-color: #409eff;position: relative">
        </div>
        <div class="tip">自定义内容</div>
        <div v-loading="loading2"
             style="width: 200px;height: 200px;background-color: #409eff;position: relative">
        </div>
        <code-panel>
            <highlightjs language='javascript' :code="code"/>
        </code-panel>
    </div>
</template>

<script type="text/jsx">
import {vLoading} from "../../../src/directives/v-loading";
const code = `
    <template>
        <div @click="loading=!loading">切换loading</div>
        <div v-loading="loading"
             style="width: 200px;height: 200px;background-color: #409eff;position: relative">
        </div>
        <div class="tip">自定义内容</div>
        <div v-loading="loading2"
             style="width: 200px;height: 200px;background-color: #409eff;position: relative">
        </div>
    <\/template>
    <script type="text/jsx">
        export default {
            data() {
                return {
                    code,
                    loading: false,
                    loading2: {
                        content: (h) => {
                            return <img src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg"
                               style="width:50px;height:50px;object-fit:cover"/>
                        }
                    }
                }
            }
        }
    <\/script>
`
export default {
    directives: {
        loading: vLoading,
    },
    data() {
        return {
            code,
            loading: false,
            loading2: {
                content: (h) => {
                    return <img src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg"
                                style="width:50px;height:50px;object-fit:cover"/>
                }
            }
        }
    }
}
</script>

<style lang="less">

</style>
