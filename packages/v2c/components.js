const fs = require('fs');
const path = require('path');
const entries = {};
fs.readdirSync(path.resolve(__dirname, './src/directives'))
    .filter(item => /\.js$/.test(item))
    .forEach(fileName => {
        fileName = fileName.match(/(.*)(\.js$)/)[1];
        entries[`directives/${fileName}`] = `./src/directives/${fileName}`
    })
fs.readdirSync(path.resolve(__dirname, './src/packages'))
    .forEach(item => {
        const file = fs.statSync(path.resolve(__dirname, `./src/packages/${item}`));
        if (file.isDirectory()) {
            entries[`lib/${item}`] = `./src/packages/${item}/index.js`;
        } else {
            item = item.match(/(.*)(\.vue$)/)[1];
            entries[`lib/${item}`] = `./src/packages/${item}`;
        }
    }, {})
console.log('entries', entries);
module.exports = {entries}
