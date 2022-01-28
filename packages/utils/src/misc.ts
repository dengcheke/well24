export function rafThrottle(callback: Function) {
    let requestId: number | null = null;
    let lastArgs: any;

    const later = (context: any) => () => {
        requestId = null
        callback.apply(context, lastArgs)
    }

    const throttled = function (this: unknown, ...args: any) {
        lastArgs = args;
        if (requestId === null) {
            requestId = requestAnimationFrame(later(this))
        }
    }

    throttled.cancel = () => {
        requestId && cancelAnimationFrame(requestId);
        requestId = null;
    }

    return throttled
}

export async function asyncWrap(promiseLike: any) {
    if (promiseLike instanceof Promise) {
        return promiseLike.then(res => [res, undefined]).catch(e => [undefined, e]);
    } else if (typeof promiseLike?.then === 'function') {
        return new Promise((resolve, reject) => {
            try {
                (promiseLike as PromiseLike<any>).then(
                    value => resolve([value, undefined]),
                    reason => resolve([undefined, reason])
                );
            } catch (e) {
                resolve([undefined, e]);
            }
        });
    } else if (promiseLike instanceof Error) {
        return [undefined, promiseLike];
    } else {
        return [promiseLike, undefined];
    }
}

export async function sleep(t: number = 1000) {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), t);
    })
}

export async function loadImg(src: any) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
        img.src = src;
    })
}

const vendors = 'ms o moz webkit'.split(' ');

export function supportCss3(prop:string) {
    const div = document.createElement('div');
    if (prop in div.style) return true;
    prop = prop.replace(/^[a-z]/, function (val) {
        return val.toUpperCase();
    });
    for (let i = 0; i < vendors.length; i++) {
        const prefix = vendors[i];
        if (prefix + prop in div.style) {
            return true;
        }
    }
    return false;
}

export const isIE = /*#__PURE__*/(function isIE(){
    return "ActiveXObject" in window;
})()
