/**
 * 该对象是 null 或 undefined
 * @param obj
 * @returns {boolean}
 */
export function isNil(obj) {
    return obj === null || obj === undefined
}

//async包装器,异步转同步写法,无需try捕获错误
/*
    e.g
        let [res,err] = await asyncWrap(asyncApi(xx));
        if(res){
            // handle success
        }else{
            // handle error
        }

    equals to
        try{
            let res = await asyncApi(xx);
            //handle success
        }catch(err){
            //handle error
        }
    or
        asyncApi(xx).then(res=>{
            //handle success
        }).catch( err=> {
            //hanlde error
        })
*/
export async function asyncWrap(promiseLike) {
    if (promiseLike instanceof Promise) {
        return promiseLike.then(res => [res, undefined]).catch(e => [undefined, e]);
    } else if (promiseLike && promiseLike.then && typeof promiseLike.then === 'function') {
        return new Promise((resolve, reject) => {
            try {
                promiseLike.then(_res => resolve([_res, undefined]));
            } catch (e) {
                resolve([undefined, e]);
            }
        });
    } else if (promiseLike instanceof Error) {
        return [undefined, promiseLike]; // equal to  return Promise.resolve([undef,res]);
    } else {
        return [promiseLike, undefined]; // equal to  return Promise.resolve([res,undef]);
    }
}

/**
 * 数字转罗马数字
 * @param num
 * @returns {string}
 */
export function num2roman(num) {
    let ans = "";
    let k = Math.floor(num / 1000);
    let h = Math.floor((num % 1000) / 100);
    let t = Math.floor((num % 100) / 10);
    let o = num % 10;
    let one = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ'];
    let ten = ['Ⅹ', 'Ⅺ', 'Ⅻ', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
    let hundred = ['C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'];
    let thousand = 'M';
    for (let i = 0; i < k; i++) {
        ans += thousand;
    }
    if (h)
        ans += hundred[h - 1];
    if (t)
        ans += ten[t - 1];
    if (o)
        ans += one[o - 1];
    return ans;
}

/**
 * 数字转大写
 * @param num
 * @returns {string}
 */
export function num2CN(num) {
    const arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const arr2 = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿'];
    if (!num || isNaN(num)) {
        return "零";
    }
    let english = num.toString().split("");
    let result = "";
    for (let i = 0; i < english.length; i++) {
        let des_i = english.length - 1 - i;//倒序排列设值
        result = arr2[i] + result;
        let arr1_index = english[des_i];
        result = arr1[arr1_index] + result;
    }
    //将【零千、零百】换成【零】 【十零】换成【十】
    result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
    //合并中间多个零为一个零
    result = result.replace(/零+/g, '零');
    //将【零亿】换成【亿】【零万】换成【万】
    result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
    //将【亿万】换成【亿】
    result = result.replace(/亿万/g, '亿');
    //移除末尾的零
    result = result.replace(/零+$/, '')
    //将【一十】换成【十】
    result = result.replace(/^一十/g, '十');
    return result;
}

/**
 * 通过requestAnimationFrame对函数节流, 函数每帧最多执行一次,
 * @param step 要执行的回调函数
 * @returns function 节流后的函数
 * @bug 已知问题 dom事件 e.currentTarget 会丢失，
 */
export function rafThrottle(step) {
    if (!(step instanceof Function)) return;
    let lock = false;
    return function (...args) {
        if (!lock) {
            lock = true;
            const self = this;
            requestAnimationFrame(() => {
                let res;
                try {
                    res = step.call(self, ...args);
                    if (res && (
                        res instanceof Promise || (res.then && res.then instanceof Function)
                    )) {
                        res.then(() => {
                            lock = false;
                        });
                    } else {
                        lock = false;
                    }
                } catch (e) {
                    lock = false;
                    console.log(e);
                    throw e;
                }
            });
        }
    }
}


/**
 * 应用于vue computed
 * @param attrName 要展开的属性名称
 * @param mapper 展开对象
 * @example
 *     computed:{
 *        ...mapping('store',{
 *            'a': 'attrA',
 *            'b': function(state){return state.attrB}
 *        })
 *     }
 *     等价于
 *     computed:{
 *         a(){
 *             return this.store.attrA,
 *         },
 *         b(){
 *             const fn = function(state){return state.attrB}
 *             return fn.call(this,this.store);
 *         }
 *     }
 * @returns {{}}
 */
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


let canvas = null, ctx = null;

/**
 * canvas 裁剪图片
 * @param src 要裁剪的大图
 * @param x 裁剪部分到左边的距离
 * @param y 裁剪部分到上边的距离
 * @param w 裁剪部分的 宽度
 * @param h 裁剪部分的 高度
 * @returns {Promise<DataURL>}
 */
export async function clipImg(src, x, y, w, h) {
    if (!canvas) {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
    }
    if (!w || !h) throw new Error("要裁剪图像宽高不能为0");
    return new Promise((res, rej) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = function () {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, (x || 0), (y || 0), w, h, 0, 0, w, h);
            const a = canvas.toDataURL('image/png');
            //console.log(a);
            res(a);
        }
    });
}

Date.prototype.format = function (format) {
    const h = this.getHours();
    const o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "H+": this.getHours(), //24 hour
        "h+": h <= 12 ? h : h - 12,
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (let k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};
Date.prototype.sub = function (b) {
    return this.getTime() - new Date(b).getTime();
};

/**
 * 深冻结函数
 * @param obj 要冻结的对象
 */
export function deepFreeze(obj) {
    if (obj === null) return;
    if (typeof obj !== 'object') return;
    const propNames = Object.getOwnPropertyNames(obj);
    propNames.forEach(name => {
        deepFreeze(obj[name]);
    });
    return Object.freeze(obj);
}

const temp = /\.([^\.]+)$/;

/**
 * 获取文件类型
 * @param filename 文件名
 * @returns {*|null}
 */
export function getFileType(filename) {
    const res = (filename + "").match(temp);
    return res ? res[1] : null;
}

export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export function mix(x, y, a) {
    return x * (1 - a) + y * a
}

//字节数。汉字2，其他1
export function getBytesLength(str) {
    return String(str).replace(/[^\x00-\xff]/gi, "--").length;
}

//
export function subStringBytesLength(text, maxLength) {
    let len = 0;
    if (getBytesLength(text) <= maxLength) {
        return text;
    }
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        len = getBytesLength(char) + len;
        if (len > maxLength) {
            return text.substring(0, i);
        }
    }
}

export const throttle = require('loadsh/throttle.js');
export const cloneDeep = require('loadsh/cloneDeep');
export const clone = require('loadsh/clone');
export const debounce = require('loadsh/debounce');
export const get = require('loadsh/get');
export const isObject = require('loadsh/isObject');
export const merge = require('loadsh/merge');

/**
 * tree结构转Array
 * @param root 树的根节点
 * @param childKey 树的子节点 key 名, 默认 ‘children’
 * @param dfs 深度/广度 遍历, 默认 true 深度
 * @returns {[]}
 */
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

//转驼峰
export function getKebabCase(str) {
    let res = String(str).replace(/[A-Z]/g, function (item) {
        return '-' + item.toLowerCase()
    })
    if (res[0] === "-") {
        res = res.substring(1)
    }
    return res;
}

//object 转 css style字符串
export function objectToStyleString(obj) {
    return Object.keys(obj).reduce((res, key) => {
        res += `${getKebabCase(key)}:${obj[key]};\n`
        return res;
    }, '')
}

export function logger(...args) {
    console.log(...args)
}

logger.ERROR = 'font-size:16px;color:red;'
logger.SUCCESS = 'font-size:16px;color:green;'


/**
 * 类似于 input.focus() focus到文本末尾
 * @param obj
 */
export function focusAtLast(obj) {
    if (window.getSelection) {//ie11 10 9 ff safari
        obj.focus(); //解决ff不获取焦点无法定位问题
        const range = window.getSelection();//创建range
        range.selectAllChildren(obj);//range 选择obj下所有子内容
        range.collapseToEnd();//光标移至最后
    } else if (document.selection) {//ie10 9 8 7 6 5
        const range = document.selection.createRange();//创建选择对象
        range.moveToElementText(obj);//range定位到obj
        range.collapse(false);//光标移至最后
        range.select();
    }
}


export async function sleep(t = 4) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, t)
    })
}


export async function objToFormData(obj) {
    const fd = new FormData();
    Object.keys(obj).forEach(key => {
        fd.append(key, obj[key])
    })
    return fd;
}

//数字前补零
export function prefixInteger(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


