/**
 * json 转 excel
 * @param {Object[]} jsonData - json数组
 * @param {Object} [opts] - 选项
 * @param {Object} [opts.keyMap] - 输出字段映射表,
 *                  例如 {name:"名称" } 会将 {name:"张三"} 转为 {"名称":"张三"}
 * @param {string} [opts.filename] - 输出文件名
 */

export async function jsonToExcel(
    jsonData: ({})[],
    opts?: {
        keyMap?: { [prop: string]: string },
        filename?: string
    }
) {
    const XLSX = await import("xlsx");
    let keys: string[] = [], keyMap: { [prop: string]: string } = {}, fileName = opts?.filename || "";
    if (opts?.keyMap) {
        keyMap = opts.keyMap;
        keys = Object.keys(keyMap);
    }
    if (keys.length) {
        jsonData = jsonData.map((item: any) => {
            const obj: any = {};
            keys.forEach(key => {
                let _k = keyMap[key] || key;
                obj[_k] = item[key];
            });
            return obj;
        });
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, fileName ? `${fileName}.xlsx` : `file_${new Date().toLocaleDateString()}.xlsx`, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
}

/**
 * 二维数组导出excel
 * @param {[][]} aoaData - 二维数组, .eg: [["名称","身高"],["张三",180],["李四",170],...]
 * @param {string} [fileName] 输出文件名
 */
export async function aoaToExcel(aoaData: [][], fileName?: string) {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, fileName ? `${fileName}.xlsx` :
        `file_${new Date().toLocaleDateString()}.xlsx`, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
}

/**
 * 以二进制读取
 * @param {Blob} file -要转换的文件
 */
export async function fileToBinaryString(file: Blob) {
    const fr = new FileReader();
    return new Promise((res, rej) => {
        fr.onload = () => {
            res(fr.result)
        }
        try {
            fr.readAsArrayBuffer(file);
        } catch (e) {
            rej(e)
        }
    })
}

/**
 * excel 转 json
 * @param file 输入文件
 */
export async function excelToJson(file: Blob) {
    const XLSX = await import("xlsx");
    const d = await fileToBinaryString(file);
    const wb = XLSX.read(d, {
        type: 'binary',
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws)
}

/**
 * csv 转 json
 * @param {string} csvStr -输入文本
 * @param {string | RegExp} delimiter  -分隔符
 * @param {Object} opts -选项
 * @param {string[]} [opts.fields] -字段列表
 * @param {Object[]} [opts.keyMap] -字段映射，{ fieldNameInCsv: fieldNameInData }
 * @param {boolean} [opts.isFirstRowField = true] -第一行是否是字段,
 *                  如果 isFirstRowField = true，若fields未提供，第一行作为字段，若fields存在, 跳过第一行
 *                  如果 isFirstRowField = false, 跳过第一行,
 */
export function csvToJson(csvStr: string, delimiter: string | RegExp = ",", opts: {
    fields?: string[],
    keyMap?: {[prop:string]:string},
    isFirstRowField?:boolean
}) {
    if(!csvStr) throw new Error('csvStr is empty');
    opts = Object.assign({}, {
        isFirstRowField: true,
        fields: []
    }, opts)
    const datas = csvStr.split('\n')
        .map(str => str.trim())
        .filter(Boolean)
        .map(str => str.split(delimiter).map(c => c.trim()));
    let fs:any = opts.fields;
    if (!fs || !fs.length) {
        if(opts.isFirstRowField){
            fs = datas.shift();
        }else{
            throw new Error('first row is not Field but fields not give');
        }
    }else{
        if(opts.isFirstRowField) datas.shift();
    }
    if(!fs || !fs.length) throw new Error('invalid fields');
    return datas.map(row => {
        const res:{[prop:string]:string} = {};
        for (let i = 0; i < (fs as string[]).length; i++) {
            const key = opts.keyMap ? (opts.keyMap[fs[i]] || fs[i]): fs[i];
            res[key] = row[i];
        }
        return res;
    })
}
