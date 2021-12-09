import {addClass,removeClass} from "@well24/utils";

const map = /*#__PURE__*/new WeakMap();

function getTarget(node) {
    if (!node) return null;
    if (node === true) return document.body;
    if (typeof node === 'string') {
        return document.querySelector(node) || null;
    }
    if (node instanceof window.HTMLElement) {
        return node;
    }
    return null;
}

function _unbind(el){
    removeClass(el,'v-transfer-dom');
    const transferData = map.get(el);
    if(!transferData) return;
    const {hasMovedOut, parentNode, placeholder} = transferData;
    hasMovedOut && parentNode?.replaceChild(el, placeholder);
    map.delete(el)
}

/*
*  移动dom到其他位置，
*   v-transfer-dom="node"
*       node为 falsy 值则不移动,
*       node为 true 则目标为document.body
*       node为 string, 则调用css selector,（若找不到节点则不移动）
*       node为 window.HTMLElement, 则目标为node
*/

export const vTransferDom = {
    inserted(el, {value}, vnode) {
        addClass(el,'v-transfer-dom');
        const parentNode = el.parentNode;//父节点
        const placeholder = document.createElement('div');//占位元素
        let hasMovedOut = false;
        const target = getTarget(value);
        if (target) {
            parentNode.replaceChild(placeholder, el) // 用占位节点替换
            target.appendChild(el) // el移动到新位置
            hasMovedOut = true;
        }
        map.set(el,{
            parentNode: parentNode,//父元素
            placeholder: placeholder,//占位元素
            target: target,//目标元素
            hasMovedOut: hasMovedOut
        })
    },
    componentUpdated(el, {value}, vnode) {
        const transferData = map.get(el);
        if(!transferData) return;
        const {parentNode, placeholder, target, hasMovedOut} = transferData;
        const newTarget = getTarget(value); //新目标
        if (target === newTarget) return;
        if (newTarget) { //新目标存在
            if (!hasMovedOut) { //还没有移动过
                parentNode.replaceChild(placeholder, el)
            }
            newTarget.appendChild(el);
            transferData.hasMovedOut = true;
            transferData.target = newTarget;
        } else { //没有目标，移回去
            if (hasMovedOut) {
                parentNode.replaceChild(el, placeholder);
                transferData.hasMovedOut = false;
                transferData.target = null;
            }
        }
    },
    unbind: function unbind(el, binding) {
        _unbind(el);
        map.delete(el);
    }
}
