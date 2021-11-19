let _canvas: HTMLCanvasElement;
let _ctx: CanvasRenderingContext2D | null;
const DEFAULT_FONT = "500 14px serif";

type ColorStops = Array<{ offset: number; color: string }>;
type ImgOutputOpts = { type?: string, quality?: any };

function getCtx() {
    if (!_canvas) {
        _canvas = document.createElement("canvas");
    }
    if (!_ctx) {
        _ctx = _canvas.getContext("2d");
    }
    if (!_ctx) {
        throw new Error("cannot get canvas 2d ctx");
    }
    return {
        ctx: _ctx,
        canvas: _canvas
    };
}

function _exportImg(opts: ImgOutputOpts = {}) {
    const {canvas} = getCtx();
    return canvas.toDataURL(opts.type, opts.quality);
}

/**
 * 生成渐变色图片
 * @param {Array<{offset:number,color:string}>} stops -渐变色带
 * @param {number} w -图片宽度
 * @param {number} h -图片高度
 * @param {Object} opts - 选项
 * @param {"linear" | "radial"} opts.linearType -渐变类型
 * @param {number[]} opts.gradientParam -渐变参数, 同CanvasRenderingContext2D.create[linearType]Gradient, linearType = 'radial' 时此选项必须有
 * @param {{type: string, quality: any}} opts.outputOpts -导出选项, canvas.toDataUrl(type, quality);
 * @returns {string} 图片DataURL
 */
export function genColorRamp(stops: ColorStops, w: number, h: number, opts: {
    linearType?: "linear" | "radial";
    gradientParam?: number[];
    outputOpts?: ImgOutputOpts
} = {}) {
    const {ctx, canvas} = getCtx();
    const height = canvas.height = h >> 0 || 1;
    const width = canvas.width = w >> 0 || 128;
    stops = [...stops].sort((a, b) => a.offset - b.offset);
    if (!stops.length) throw new Error("invalid ColorStops");
    ctx.clearRect(0, 0, width, height);
    const type = opts.linearType || "linear";
    let gradient;
    if (type === "linear") {
        const param = opts.gradientParam || [0, 0, width, 0];
        gradient = ctx.createLinearGradient(param[0], param[1], param[2], param[3]);
    } else {
        const param = opts.gradientParam;
        if(!param) throw new Error('when linearType is radial, gradientParam cannot be empty!');
        gradient = ctx.createRadialGradient(param[0], param[1], param[2], param[3], param[4], param[5]);
    }
    for (let i = 0; i < stops.length; i++) {
        gradient.addColorStop(stops[i].offset, stops[i].color);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return _exportImg(opts.outputOpts);
}

/**
 * 使用canvas裁剪图片
 * @param {string} src -要裁剪的图片源
 * @param {number} srcx -裁剪部分到左边的距离
 * @param {number} srcy -裁剪部分到上边的距离
 * @param {number} srcw -裁剪部分的宽度
 * @param {number} srch -裁剪部分的高度
 * @param {Object} opts -裁剪部分的高度
 * @param {string} opts.crossOrigin -同img.crossOrigin
 * @param {number} opts.dstw -目标图片宽度, 默认srcw, 用于缩放
 * @param {number} opts.dsth -目标图片高度, 默认srch, 用于缩放
 * @param {{type: string, quality: any}} opts.outputOpts -导出选项, canvas.toDataUrl(type, quality);
 * @returns {Promise<string>>} 图片DataURL
 */
export async function clipImg(src: string, srcx: number, srcy: number, srcw: number, srch: number, opts: {
    crossOrigin?: string;
    dstw?: number,
    dsth?: number,
    outputOpts?: ImgOutputOpts
} = {}) {
    if (!srcw || !srch) throw new Error("要裁剪图像宽高不能为0");
    const dstw = opts.dstw || srcw;
    const dsth = opts.dsth || srch;
    return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = opts.crossOrigin || "anonymous";
        img.onload = function () {
            const {ctx, canvas} = getCtx();
            canvas.width = dstw;
            canvas.height = dsth;
            ctx.drawImage(img, srcx || 0, srcy || 0, srcw, srch, 0, 0, dstw, dsth);
            resolve(_exportImg(opts.outputOpts));
        }
        img.onerror = e => reject(e)
    });
}

/**
 * 测量文本
 * @param {string} text 文本
 * @param {string} font css font
 * @returns {number[]} 文本宽高（像素）[width,height]
 */
export function measureText(text: string, font = DEFAULT_FONT) {
    const {ctx} = getCtx();
    const metric = ctx.measureText(text);
    return [
        metric.width,
        metric.fontBoundingBoxAscent + metric.fontBoundingBoxDescent
    ]
}

