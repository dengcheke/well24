/**
 * dom.addEventListener | dom.attachEvent(in ie)
 * @param element
 * @param event
 * @param handler
 * @param option
 * @return ()=>void, 移除handle
 */
export const on = (function () {
    if (!document.addEventListener) {
        return function (element: EventTarget, event: string, handler: EventListener) {
            if (element && event && handler) {
                // @ts-ignore
                element.attachEvent('on' + event, handler);
                return function () {
                    // @ts-ignore
                    element.detachEvent('on' + event, handler);
                }
            }
        };
    } else {
        return function (element: EventTarget, event: string, handler: EventListener, option?: boolean | AddEventListenerOptions) {
            if (element && event && handler) {
                element.addEventListener(event, handler, option);
                return function () {
                    element.removeEventListener(event, handler, option);
                }
            }
        };
    }
})();

/**
 * dom.removeEventListener | dom.detachEvent(in ie)
 * @param element
 * @param event
 * @param handler
 * @param option
 */
export const off = (function () {
    if (!document.removeEventListener) {
        return function (element: EventTarget, event: string, handler: EventListener) {
            if (element && event) {
                // @ts-ignore
                element.detachEvent('on' + event, handler);
            }
        };
    } else {
        return function (element: EventTarget, event: string, handler: EventListener, option?: boolean | AddEventListenerOptions) {
            if (element && event && handler) {
                element.removeEventListener(event, handler, option);
            }
        };
    }
})();

/**
 * 获取页面滚动条宽度
 */
export function getScrollBarWidth(): number {
    let noScroll, scroll, oDiv = document.createElement('div');
    oDiv.style.cssText = 'position:absolute; top:-9999px;width:100px; height:100px; overflow:hidden;visibility:hidden';
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = 'scroll';
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    return noScroll - scroll;
}

/**
 * 获取dom样式
 * @param dom Element
 * @param attr? string
 */
export const getStyle = (function () {
    // @ts-ignore
    if (document.currentStyle) {
        return (dom: Element, attr?: string) => {
            // @ts-ignore
            return attr ? dom.currentStyle[attr] : dom.currentStyle;
        };
    } else {
        return (dom: Element, attr?: string) => {
            // @ts-ignore
            return attr ? getComputedStyle(dom, false)[attr] : getComputedStyle(dom, false);
        }
    }
})();

/**
 * 是否包含class
 * @param el dom元素
 * @param cls 类名(不得包含空格)
 */
export function hasClass(el: Element, cls: string): boolean {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
        return el.classList.contains(cls);
    } else {
        return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
}

/**
 * 添加class
 * @param el
 * @param cls
 */
export function addClass(el: Element, cls: string[] | string) {
    if (!el) return;
    let curClass = el.className;
    const classes = Array.isArray(cls) ? cls : cls.split(' ').filter(Boolean);

    for (let i = 0, l = classes.length; i < l; i++) {
        let clsName = classes[i];
        if (el.classList) {
            el.classList.add(clsName);
        } else if (!hasClass(el, clsName)) {
            curClass += ' ' + clsName;
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
}

/**
 * 移除class
 * @param el Element
 * @param cls string[] | string
 */
export function removeClass(el: Element, cls: string[] | string) {
    if (!el || !cls) return;
    let classes = Array.isArray(cls) ? cls : cls.split(' ');
    let curClass = ' ' + el.className + ' ';

    for (let i = 0, j = classes.length; i < j; i++) {
        let clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.remove(clsName);
        } else if (hasClass(el, clsName)) {
            curClass = curClass.replace(' ' + clsName + ' ', ' ');
        }
    }
    if (!el.classList) {
        el.className = curClass.trim();
    }
}

/**
 * 在节点之前插入新的节点
 * @param refNode 要插入的节点
 * @param insertNode 要插入的新的节点
 */
export function insertBefore(refNode:Node,insertNode:Node){
    const parent = refNode.parentNode;
    if(!parent) return;
    return parent.insertBefore(insertNode,refNode);
}

/**
 * 在节点之后插入新的节点
 * @param refNode 要插入的节点
 * @param insertNode 要插入的新的节点
 */
export function insertAfter(refNode:Node,insertNode:Node){
    const parent = refNode.parentNode;
    if(!parent) return;
    return parent.insertBefore(insertNode,refNode.nextSibling);
}
