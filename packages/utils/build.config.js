const path = require('path');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require("@rollup/plugin-commonjs");
const tsc = require('rollup-plugin-typescript2');
module.exports = {
    input: path.resolve('./src/index.ts'),
    external: [/node_modules/],
    plugins: [
        nodeResolve(),
        commonjs(),
        tsc({
            tsconfigDefaults: require('../../tsconfig.js'),
        }),
    ],
    output: [
        {
            file: './dist/index.cjs.js',
            format: "cjs",
            sourcemap: true
        },
        {
            file: './dist/index.esm.js',
            format: "esm",
            sourcemap: true
        }
    ]
}
