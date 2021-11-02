/**
 * 获得当前分页数据
 * @param data 全部数据
 * @param curPage 当前页码
 * @param pageSize 每页数目
 */

export function getPageData(data, curPage, pageSize) {
    if (data.length < 1) return;
    curPage = curPage >= 1 ? curPage : 1;
    pageSize = pageSize >= 1 ? pageSize : 1;
    let startIdx = (curPage - 1) * pageSize;
    let endIdx = curPage * pageSize - 1;
    endIdx = endIdx > data.length - 1 ? data.length - 1 : endIdx;
    return data.slice(startIdx, endIdx + 1);
}

/**
 * json导出excel，
 * @param jsonData json数组
 * @param keyMap  可选 字段映射 例如{name:‘名称’,age:'年龄'} 或者 [ {key:'name',title:'名称'},{key:'age',title:'年龄'}]
 */
export async function jsonToExcel(jsonData, keyMap, fileName) {
    const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
    if (keyMap) {
        let keys;
        if (Array.isArray(keyMap)) { //如果是数组
            //  { key:'name',title:'姓名' } 转换成 { name：姓名}
            keyMap = keyMap.reduce((pre, cur) => {
                if (cur.key) {
                    pre[cur.key] = cur.title || "";
                }
                return pre;
            }, {});
            keys = Object.keys(keyMap);
        }
        if (keyMap instanceof Object) {
            keys = Object.keys(keyMap);
        }
        if (keys.length === 0) return;
        jsonData = jsonData.map(item => {
            const obj = {};
            keys.forEach(key => {
                obj[keyMap[key]] = item[key];
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
 * @param aoa 二维数组
 * @param fileName 文件名,可选
 * @returns {Promise<void>}
 */
export async function aoaToExcel(aoa, fileName) {
    const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, fileName ? `${fileName}.xlsx` :
        `file_${new Date().toLocaleDateString()}.xlsx`, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    });
}

export async function fileToBinaryString(file) {
    const fr = new FileReader();
    return new Promise((res, rej) => {
        fr.onload = () => {
            res(fr.result)
        }
        try {
            fr.readAsBinaryString(file);
        } catch (e) {
            rej(e)
        }
    })
}

export async function excelToJson(file) {
    const XLSX = await import(/* webpackChunkName: "xlsx" */ "xlsx");
    const d = await fileToBinaryString(file);
    const wb = XLSX.read(d, {
        type: 'binary',
    });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws)
}

export function txtToObject(input, fields) {
    const rows = input.split('\n');
    const keys = fields.map(field => field.key);
    return rows.map(rowStr => {
        const values = rowStr.trim().split(/\s+/);
        return keys.reduce((res, curKey, idx) => {
            res[curKey] = values[idx] || null;
            return res;
        }, {})
    });
}
