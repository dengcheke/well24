const path = require('path');
const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs = require("@rollup/plugin-commonjs");
const babel =  require('@rollup/plugin-babel').babel;
const tsc = require('rollup-plugin-typescript2');
const DEFAULT_EXTENSIONS = require('@babel/core').DEFAULT_EXTENSIONS;
module.exports = {
    input: path.resolve('./src/index.ts'),
    external: [/node_modules/],
    plugins: [
        nodeResolve(),
        commonjs(),
        tsc({
            useTsconfigDeclarationDir:true,
            tsconfig: path.resolve('../../tsconfig.json'),
            tsconfigOverride: {
                compilerOptions: {
                    declarationDir: path.resolve('./dist/types')
                }
            }
        }),
        babel({
            extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
            babelrc: false,
            exclude: 'node_modules/**',
            presets: [
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                    }
                ]
            ],
            plugins: [
                ["@babel/plugin-transform-runtime", {corejs: 3}],
            ],
            babelHelpers: 'runtime'
        })
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
        },
    ]
}
