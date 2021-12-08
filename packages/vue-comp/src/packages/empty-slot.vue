<template>
    <div class="empty-slot" v-show="show">
        <slot>
            <i class="icon-w24 icon-w24-nodata"/>
            <span class="empty-text">暂无数据</span>
        </slot>
    </div>
</template>

<script>
export default {
    name: "EmptySlot",
    props: {
        show: {
            type: Boolean,
            default: true
        },
    }
}
</script>
<style lang="less">
.empty-slot {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;


    .icon-w24-nodata {
        font-size: 24px;
        color:black;
        display: block;
    }

    .empty-text {
        font-size: 15px;
        margin-left: 5px;
        color: black;
    }
}

</style>
