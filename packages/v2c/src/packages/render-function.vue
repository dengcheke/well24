<script>
export default {
    name: "RenderFunction",
    functional: true,
    props: {
        params: {
            default: null,
        },
        render: {
            type: Function,
            default: function () {}
        }
    },
    render: function (h, ctx) {
        const r = ctx.props.render;
        const p = ctx.props.params;
        return r.call(null, h, p);
    },
    install(Vue) {
        Vue.component(this.name, this);
    }
}
</script>
