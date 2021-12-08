<template>
    <div class="collapse-panel__wrapper">
        <div class="collapse-panel__title" @click.stop="onClickRow"
             onselectstart="return false;">
            <slot name="title">
                <span style="line-height: 32px">{{ title }}</span>
            </slot>
            <i class="icon-w24 icon-w24-arrow-down" v-if="showIcon"
               @click.stop="$emit('update:expand',!expand)"
               :class="{'is-collapse':!expand}"/>
        </div>
        <div class="collapse-panel__content">
            <collapse-transition>
                <div v-show="expand" class="collapse-content__wrapper" style="overflow:hidden;">
                    <slot/>
                </div>
            </collapse-transition>
        </div>
    </div>
</template>

<script>
import CollapseTransition from '@src/packages/collapse-transition';
export default {
    name: "CollapsePanel",
    components: {CollapseTransition},
    props: {
        expandOnClickTitle: {
            type: Boolean,
            default: true
        },
        showIcon: {
            type: Boolean,
            default: true,
        },
        expand: {
            type: Boolean,
            default: true
        },
        title: {
            default: ""
        }
    },
    methods: {
        onClickRow() {
            this.expandOnClickTitle && this.$emit('update:expand', !this.expand);
        }
    }
}
</script>

<style lang="less">
.collapse-panel__wrapper {
    width: 100%;

    .collapse-panel__title {
        padding: 0 5px;
        background-color: rgba(13, 67, 91, 1);
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
    }

    .icon-w24-arrow-down {
        cursor: pointer;
        position: relative;
        font-size: 24px;
        display: block;
        margin-left: auto;
        transition: transform 0.5s ease-in-out;
        transform: rotate(-180deg);
        color: yellow;
        font-weight: 500;
        text-shadow: 0 0 5px yellow;
        &.is-collapse{
            transform: rotate(0);
        }
    }
}
</style>
