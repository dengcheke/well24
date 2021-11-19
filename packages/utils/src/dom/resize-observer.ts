import ObserverPolyfill from 'resize-observer-polyfill';

type ResizeCallback = (entry: ResizeObserverEntry) => void;
type ResizeMapObj = {
    cbs: ResizeCallback[],
    ro: ResizeObserver
}
let roMap = /*#__PURE__*/new WeakMap<Element, ResizeMapObj>();

export function addResizeListener(
    element: Element,
    fn: ResizeCallback,
    opts?: ResizeObserverOptions
): () => void {

    let obj = roMap.get(element);
    if (!obj) {
        obj = {
            cbs: [],
            ro: new ObserverPolyfill((entries:ResizeObserverEntry[]) => {
                for (let entry of entries) {
                    const obj = roMap.get(entry.target);
                    if (!obj) return;
                    const {cbs} = obj;
                    cbs.length && cbs.forEach(fn => fn(entry));
                }
            })
        }
        roMap.set(element, obj);
    }
    const {cbs, ro} = obj;
    cbs.indexOf(fn) === -1 && cbs.push(fn);
    // @ts-ignore
    ro.observe(element, opts);
    return function () {
        removeResizeListener(element, fn);
    }
}

export function removeResizeListener(element: Element, fn: ResizeCallback) {
    const obj = roMap.get(element);
    if (!obj || !element) return;
    const {cbs,ro} = obj;
    if (fn) {
        cbs.splice(cbs.indexOf(fn), 1);
    } else { //移除全部
        ro.disconnect();
        roMap.delete(element);
    }
}

export * as ResizeObserver from 'resize-observer-polyfill';
