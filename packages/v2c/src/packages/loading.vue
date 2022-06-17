<script type="text/jsx">
export default {
    name: "loading-mask",
    data() {
        return {
            show: false,
            content: null,
            boxClass: ""
        }
    },
    render(h) {
        let content;
        if(this.content instanceof HTMLElement){
            content = this.content
        }else if(this.content instanceof Function){
            content = this.content(h);
        }else{
            content = this.content;
        }
        return <div {...{
            class: 'loading-wrapper',
            directives: [{name: 'show', value: this.show}],
        }}>
            <div class={["loading-box",this.boxClass]}>{[
                content || <i class="icon-w24 icon-w24-loading"/>,
            ].filter(Boolean)}
            </div>
        </div>
    },
    install(Vue) {
        Vue.component(this.name, this);
    }
}
</script>

<style lang="less">

.loading-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    .loading-box {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

        .icon-w24-loading {
            display: inline-block;
            font-size: 24px;
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
