<template>
    <div>
        <pre>
            <code>{{code}}</code>
        </pre>
    </div>
</template>

<script>
import hljs from 'highlight.js'

export default {
    name: "highlightjs",
    props: ['code'],
    mounted() {
        const block = this.$el.querySelector('pre');
        hljs.highlightBlock(block);
    }
}
</script>
