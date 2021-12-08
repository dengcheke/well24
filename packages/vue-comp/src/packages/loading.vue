<template>
    <div v-show="show" class="loading-wrapper">
        <div class="loading-box">
            <i class="icon-w24 icon-w24-loading"/>
        </div>
    </div>
</template>

<script>
export default {
    name: "loading-mask",
    data(){
        return {
            show:false,
        }
    }
}
</script>

<style lang="less">

.loading-wrapper{
    position: absolute;
    left: 0;
    top: 0;
    bottom:0;
    right: 0;
    background-color: rgba(0,0,0,0.5);
    .loading-box{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        .icon-w24-loading {
            display: block;
            font-size: 24px;
            color:white;
            transform-origin: center;
            animation: loading-rotate 2s linear infinite;
            @keyframes loading-rotate {
                0% {
                    transform: rotate(0deg)
                }
                100% {
                    transform: rotate(360deg)
                }
            }
        }
    }
}
</style>
