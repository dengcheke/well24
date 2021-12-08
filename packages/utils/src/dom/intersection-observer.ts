type IntersectCallback = (entry: IntersectionObserverEntry) => void;

function checkState() {
    if (!window.IntersectionObserver)
        throw new Error(`missing package [intersection-observer],\n` +
            `install it: "npm i intersection-observer --save"\n` +
            `use it: "import 'intersection-observer'" at entry file`);
}

export function addIntersectListener(element: Element, fn: IntersectCallback,
                                     opts?: IntersectionObserverInit): () => void {
    checkState()
    const io = new IntersectionObserver(entries => {
        fn(entries[0])
    }, opts)
    io.observe(element);
    return function () {
        io.disconnect()
    }
}
