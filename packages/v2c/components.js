const fs = require('fs');
const path = require('path');
const outDir = '@well24/v2c/dist'
const entries = {}, externals = {}
fs.readdirSync(path.resolve(__dirname, './src/directives'))
    .filter(item => /\.js$/.test(item))
    .forEach(fileName => {
        fileName = fileName.match(/(.*)(\.js$)/)[1];
        entries[`directives/${fileName}`] = `./src/directives/${fileName}`
        externals[`@src/directives/${fileName}`] = `${outDir}/directives/${fileName}`
    })
fs.readdirSync(path.resolve(__dirname, './src/packages'))
    .forEach(item => {
        const file = fs.statSync(path.resolve(__dirname, `./src/packages/${item}`));
        if (file.isDirectory()) {
            entries[`lib/${item}`] = `./src/packages/${item}/index.js`;
            externals[`@src/packages/${item}/index`]
                = externals[`@src/packages/${item}`] = `${outDir}/lib/${item}`
        } else {
            item = item.match(/(.*)(\.vue$)/)[1];
            entries[`lib/${item}`] = `./src/packages/${item}`;
            externals[`@src/packages/${item}`] = `${outDir}/lib/${item}`
        }
    }, {})
console.log('entries',entries);
console.log('externals',externals);
module.exports = {
    entries, externals
}
