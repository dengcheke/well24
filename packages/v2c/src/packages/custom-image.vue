<template>
    <div class="custom-img" :class="['is-'+status]">
        <div v-if="isLoading" class="img__loading-wrapper">
            <slot name="loading">
                <div class="icon-w24 icon-w24-loading"/>
            </slot>
        </div>
        <div v-if="isError" class="img__error-wrapper">
            <slot name="error">
                <i class="icon-w24 icon-w24-img-err"/>
                <span class="error-msg">加载失败</span>
            </slot>
        </div>
        <img v-if="isLoaded" v-bind="$attrs"
             v-on="$listeners" :src="src" class="img__inner"/>
        <slot></slot>
    </div>
</template>

<script>
import {addIntersectListener, asyncWrap, loadImg} from "@well24/utils";

const NONE = 'none', LOADING = 'loading', LOADED = 'loaded', ERROR = 'error';
export default {
    name: "CustomImage",
    props: {
        src: String,
        lazy: {
            type: Boolean,
            default: true
        },
        ratio: {
            type: Number,
            default: 0.5
        }
    },
    inheritAttrs: false,
    data() {
        return {
            token: 0,
            status: NONE,
        }
    },
    computed: {
        isLoading() {
            return this.status === LOADING
        },
        isLoaded() {
            return this.status === LOADED
        },
        isError() {
            return this.status === ERROR
        }
    },
    mounted() {
        let watchOff = null;
        const rm = this.$watch('src', nsrc => {
            this.status = NONE;
            if (this.lazy) {
                if (!watchOff)
                    watchOff = addIntersectListener(this.$el, entry => {
                        if (entry.isIntersecting && this.src) {
                            watchOff();
                            watchOff = null;
                            this.$emit('intersected', entry);
                            this.load()
                        }
                    }, {threshold: this.ratio})
            } else {
                nsrc && this.load();
            }
        }, {immediate: true});
        this.$once("hook:beforeDestroy", () => {
            rm();
            watchOff?.();
        })
    },
    methods: {
        async load() {
            if (!this.src) return;
            this.status = LOADING;
            const token = ++this.token;
            const [result, err] = await asyncWrap(loadImg(this.src));
            if (token !== this.token) return;
            if (err !== undefined) {
                this.status = ERROR;
                this.$emit('status-change', {
                    type: 'error',
                    msg: err
                });
            } else if (result) {
                this.status = LOADED;
                this.$emit('status-change', {
                    type: 'success'
                });
            }
        }
    },
    install(Vue) {
        Vue.component(this.name, this);
    }
}
</script>

<style lang="less">
.custom-img {
    display: inline-block;
    vertical-align: bottom;
    background-color: white;

    &.is-loaded {
        background-color: transparent;
    }

    .img__loading-wrapper,
    .img__error-wrapper,
    .img__inner {
        width: 100%;
        height: 100%;
    }

    .img__loading-wrapper,
    .img__error-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-w24-img-err {
        display: block;
        font-size: 24px;
        color: black;
    }

    .icon-w24-loading {
        display: block;
        font-size: 24px;
        color: #1e90ff;
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

    .img__inner {
        vertical-align: bottom;
    }

    .error-msg {
        color: black;
        margin-left: 10px;
    }
}
</style>
