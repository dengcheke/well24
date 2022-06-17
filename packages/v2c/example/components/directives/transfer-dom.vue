<template>
    <div>
        <p class="tip">
            移动dom
        </p>
        <div class="btn" @click="handle(1)">移动到c1</div>
        <div class="btn" @click="handle(2)">移动到c2</div>
        <div class="c1" ref="c1"></div>
        <div class="c2" ref="c2"></div>
        <div class="content" v-transfer-dom="target"/>

        <code-panel>
            <highlightjs language='javascript' :code="code"/>
        </code-panel>
    </div>
</template>

<script type="text/jsx">

const code = `
    <template>
        <p class="tip">
            移动dom
        </p>
        <div class="btn" @click="handle(1)">移动到c1</div>
        <div class="btn" @click="handle(2)">移动到c2</div>
        <div class="c1" ref="c1"></div>
        <div class="c2" ref="c2"></div>
        <div class="content" v-transfer-dom="target"/>
    <\/template>
    <scipt>
        export default {
            data() {
                return {
                    target: null,
                }
            },
            methods: {
                handle(v) {
                    let t;
                    if (!v) {
                        t = null;
                    } else if (v === 1) {
                        t = this.$refs.c1
                    } else {
                        t = this.$refs.c2
                    }
                    this.target = t;
                }
            }
        }
    <\/scipt>
`
export default {
    data() {
        return {
            target: null,
            code,
        }
    },
    methods: {
        handle(v) {
            let t;
            if (!v) {
                t = null;
            } else if (v === 1) {
                t = this.$refs.c1
            } else {
                t = this.$refs.c2
            }
            this.target = t;
        }
    }
}
</script>
<style lang="less" scoped>
.btn{
    display: inline-block;
    margin-right: 20px;
    padding: 6px 12px;
    background-color: #409eff;
}
.c1, .c2{
    width: 200px;
    height: 200px;
}
.c1{
    background-color: red;
}
.c2{
    background-color: #9a6e3a;
}
.content{
    width: 100px;
    height: 100px;
    background-color: #55a532;
}
</style>
