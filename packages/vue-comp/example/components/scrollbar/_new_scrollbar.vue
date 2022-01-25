<template>
    <new-custom-scrollbar style="height: 600px;width: 500px">
        <div v-for="i in 100" style="height: 40px;width:1000px;
        background: linear-gradient(to right,dodgerblue,cadetblue);
        box-sizing:border-box;
        border: 1px solid red">itemitemitemitemitemitem,,,{{i}}</div>
    </new-custom-scrollbar>
</template>

<script>
import NewCustomScrollbar from "../../../src/packages/new-custom-scrollbar";
export default {
    name: "_new_scrollbar",
    components: {NewCustomScrollbar}
}
</script>

<style scoped>

</style>
