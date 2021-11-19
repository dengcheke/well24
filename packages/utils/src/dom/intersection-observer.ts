type IntersectCallback = (entry: IntersectionObserverEntry) => void;
type IntersectionMapObj = {
    cbs: IntersectCallback[],
    io: IntersectionObserver
}

const ioMap = /*#__PURE__*/new WeakMap<Element, IntersectionMapObj>();

function checkState(){
    if(!window.IntersectionObserver)
        throw new Error(`missing package [intersection-observer],\n`+
        `install it: "npm i intersection-observer --save"\n`+
        `use it: "import 'intersection-observer'" at entry file`);
}

export function addIntersectListener(element: Element, fn: IntersectCallback,
                                     opts?: IntersectionObserverInit): () => void {

    // @ts-ignore
    checkState()
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
    checkState();
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
