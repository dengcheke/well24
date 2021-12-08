let clickInEvent

const record = new Map();
document.addEventListener('mousedown', e => (clickInEvent = e))
document.addEventListener('mouseup', e => {
    record.forEach((value) => {
        value(e, clickInEvent)
    })
})

function createHandler(el, binding, vnode) {
    return function (mouseup = {}, mousedown = {}) {
        if (!vnode || !vnode.context || !mouseup.target ||
            el.contains(mouseup.target) || el.contains(mousedown.target) ||
            el === mouseup.target || (
                vnode.context.popperElm && (
                    vnode.context.popperElm.contains(mouseup.target) ||
                    vnode.context.popperElm.contains(mousedown.target)
                )
            )
        ) {
            return
        }
        if (binding.expression && vnode.context[binding.expression]) {
            vnode.context[binding.expression]()
        } else {
            if (typeof (binding.value) === 'function') {
                binding.value()
            } else {
                throw new Error('value should be a function')
            }
        }
    }
}

export const vClickOutside = {
    bind(el, binding, vnode) {
        record.set(el, createHandler(el, binding, vnode))
    },
    update(el, binding, vnode) {
        record.set(el, createHandler(el, binding, vnode))
    },
    unbind(el) {
        record.delete(el)
    }
}
