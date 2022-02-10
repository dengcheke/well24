//table 全局 id
import {toKebabCase} from "@well24/utils";

let tableGlobalId = 0;

export function getTableId() {
    return ++tableGlobalId
}

//col 全局 id
let colGlobalId = 0;

export function getColId() {
    return ++colGlobalId;
}

//style class 解析
const _toString = Object.prototype.toString,
    _Object = '[object Object]',
    _Function = '[object Function]',
    _Array = '[object Array]';

/**
 * 解析宽度
 * @param v 当前宽度
 * @param W 整体宽度值
 * @returns {number}
 */
export function parseWidth(v, W) {
    const vStr = String(v);
    v = parseFloat(vStr);
    if (isNaN(v)) return 0;
    if (vStr.indexOf('px') !== -1) { //100.5px, v = 100.5; 取整
        return v >> 0;
    } else if (vStr.indexOf('%') !== -1) { //20.5% v = 20.5, W * 20.5% 然后取整
        return (W * v / 100) >> 0;
    } else {
        return v >> 0;
    }
}

//获取样式 object|function
export function resolveStyle(style, ...args) {
    if (!style) return {};
    let s, type = _toString.call(style);
    if (type === _Object) {
        s = style
    } else if (type === _Function) {
        s = style.apply(null, args);
        if (_toString.call(s) !== _Object) {
            throw new Error('style func must return an object');
        }
    } else {
        throw new Error('style must be object or function');
    }
    return s;
}

//获取class string | Object | array<string> | function
export function resolveClass(clazz, ...args) {
    if (!clazz) return {};
    let c, type = _toString.call(clazz);
    if (type === _Object) {
        c = clazz
    } else if (type === _Function) {
        c = clazz.apply(null, args)
        if (_toString.call(c) === _Function) {
            throw new Error('invalid value class func returned');
        } else {
            c = resolveClass(c)
        }
    } else if (Array.isArray(clazz)) {
        c = clazz.reduce((res, cur) => {
            res[String(cur)] = true;
            return res;
        }, {})
    } else {
        c = {[String(clazz)]: true}
    }
    return c;
}

//****
export function moveItemNewHasInOld(iter, older, newly) {
    let type = _toString.call(older);
    if (type === _Array) {
        moveItemNewHasInOld_Array(iter, older, newly);
    } else {
        moveItemNewHasInOld_Set(iter, older, newly);
    }
}

export function moveItemNewHasInOld_Array(iter, oldArr, arr) {
    iter.forEach(item => {
        let i = oldArr.indexOf(item);
        if (i !== -1) {
            arr.push(item);
            oldArr.splice(i, 1);
        }
    });
}

export function moveItemNewHasInOld_Set(iter, oldSet, s) {
    iter.forEach(item => {
        if (oldSet.has(item)) {
            s.add(item);
            oldSet.delete(item);
        }
    })
}
//****

export const isNotEmptyArray = (array) => (Array.isArray(array) && array.length);

//遍历树节点,cb返回walkTreeNode.STOP停止遍历
export const walkTreeNode = function (root, cb, childrenKey = 'children', dfs = true, startLevel = 0) {
    let queue = [].concat(root).map(i => [i, null, startLevel]); //[self,parent,level]
    while (queue.length) {
        const [self, parent, level] = queue.shift();
        const children = self[childrenKey];
        const res = cb(self, parent, children, level);
        if (res === walkTreeNode.STOP) break;
        if (!Array.isArray(children)) continue;
        const arr = children.map(i => [i, self, level + 1]);
        queue = dfs
            ? [...arr, ...queue]
            : [...queue, ...arr]
    }
}
Object.defineProperty(walkTreeNode, 'STOP', {
    value: window.Symbol ? Symbol() : Math.random() + '_' + Math.random()
})

export function treeToArray(root, childKey = 'children', dfs = true) {
    let queue = [].concat(root), res = [];
    while (queue.length) {
        const first = queue.shift();
        res.push(first);
        if (first[childKey] && Array.isArray(first[childKey])) {
            queue = dfs
                ? [...first[childKey], ...queue] //深度
                : [...queue, ...first[childKey]] //广度
        }
    }
    return res;
}

export function mapping(attrName, mapper) {
    const res = {};
    Object.keys(mapper).forEach(key => {
        const value = mapper[key];
        let fn;
        if (typeof value === 'string') {
            fn = function () {
                return this[attrName] ? this[attrName][value] : null;
            };
        } else if (typeof value === 'function') {
            fn = function () {
                return value.call(this, this[attrName]);
            };
        } else {
            console.error('invalid value type');
        }
        if (fn) {
            res[key] = fn;
        }
    });
    return res;
}

export function isDefined(obj) {
    return !(obj === null || obj === undefined)
}

export function objectToStyleString(obj) {
    return Object.keys(obj).reduce((res, key) => {
        res += `${toKebabCase(key)}:${obj[key]};\n`
        return res;
    }, '')
}
