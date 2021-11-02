import {isNil} from "@utils/index";
import SiteImg from '@assets/img/site-icon-40x40.png';
import {ESRI} from "@mapComp/esri-const-var";

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

/**
 * 格式化字段，根据字段类型
 * @param obj 要格式化的对象
 * @param keyTypeMap 字段类型map
 * @param objKeys [Array|null] 要格式化的字段，默认为 Object.keys(obj)
 * @example
 *    obj = {name:'xxx',age:'11'}, keyTypeMap = {name:STRING,age:INT},
 *    转化后为 {name:'xxx',age:11}
 */
export function formatFieldByType(obj, keyTypeMap, objKeys) {
    const keys = objKeys || Object.keys(obj);
    keys.forEach(key => {
        const type = keyTypeMap[key] || STRING;
        const val = obj[key];
        if (!isNil(val)) {
            switch (type) {
                case ESRI.INT:
                    obj[key] = parseInt(val);
                    break;
                case ESRI.DOUBLE:
                    obj[key] = parseFloat(val);
                    break;
                default:
                    obj[key] = !isNil(val) ? val + "" : "";
            }
        }
    });
}


const size = 40;

/**
 * 获取图层图标
 * @param type 上面的枚举类
 * @returns {Promise<DataURL>}
 */
export async function getLayerIcon(type) {
    const x = type[0] * size;
    const y = type[1] * size;
    return clipImg(SiteImg, x, y, type[2] || size, type[3] || size);
}


