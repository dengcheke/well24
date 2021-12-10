export function toKebabCase(str: string) {
    let res = String(str).replace(/[A-Z]/g, function (item) {
        return '-' + item.toLowerCase()
    })
    if (res[0] === "-") {
        res = res.substring(1)
    }
    return res;
}
