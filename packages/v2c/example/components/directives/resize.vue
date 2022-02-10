<template>
    <div>
        <p class="tip">
            缩放
        </p>
        <div style="background-color: #69d6f1;width: 200px;margin-bottom: 20px;
        height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        <div style="width: 100%;height: 400px;position: relative;border: 1px solid black">
            <div style="background-color: #5634e3;width: 200px;margin-bottom: 20px;
            position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);
            height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        </div>
        <div style="margin-bottom: 200px" />
        <code-panel>
            <highlightjs language='javascript' :code="code"/>
        </code-panel>
    </div>
</template>

<script type="text/jsx">
import {vResize} from "../../../src/directives/v-resize";

const code = `
    <template>
        <p class="tip">
            缩放
        </p>
        <div style="background-color: #69d6f1;width: 200px;margin-bottom: 20px;
        height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        <div style="width: 100%;height: 400px;position: relative;border: 1px solid black">
            <div style="background-color: #5634e3;width: 200px;margin-bottom: 20px;
            position: absolute;left: 50%;top: 50%;transform: translate(-50%,-50%);
            height: 200px;min-width: 100px;min-height: 100px" v-resize="{directions:'all'}"></div>
        </div>
    <\/template>
`
export default {
    directives: {
        resize:vResize
    },
    data() {
        return {
            code,
        }
    }
}
</script>
