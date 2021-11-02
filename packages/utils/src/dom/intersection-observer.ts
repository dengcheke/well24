import 'intersection-observer';
type IntersectCallback = (entry: IntersectionObserverEntry) => void;
type IntersectionMapObj = {
    cbs: IntersectCallback[],
    io: IntersectionObserver
}

const ioMap = new WeakMap<Element, IntersectionMapObj>();

export function addIntersectListener(element: Element, fn: IntersectCallback,
                                     opts?: IntersectionObserverInit): () => void {
    let obj = ioMap.get(element);
    if (!obj) {
        obj = {
            cbs: [],
            io: new IntersectionObserver(entries => {
                for (let entry of entries) {
                    const obj = ioMap.get(entry.target);
                    if(!obj) return;
                    const {cbs} = obj;
                    cbs.length && cbs.forEach(fn => fn(entry));
                }
            }, opts)
        }
        ioMap.set(element, obj);
    }
    const {cbs, io} = obj;
    cbs.indexOf(fn) === -1 && cbs.push(fn);
    io.observe(element);
    return function () {
        removeIntersectListener(element, fn);
    }
}

export function removeIntersectListener(element: Element, fn?: IntersectCallback) {
    const obj = ioMap.get(element);
    if (!obj || !element) return;
    const {io, cbs} = obj;
    if (fn) {
        cbs.splice(cbs.indexOf(fn), 1);
    } else {
        io.disconnect();
        ioMap.delete(element);
    }
}

export const IntersectionObserver = window.IntersectionObserver;
