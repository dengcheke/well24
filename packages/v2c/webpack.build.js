const path = require('path');
const nodeExternals = require('webpack-node-externals');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {entries, externals} = require('./components');
const srcRoot = path.resolve(__dirname, './src');
const pathMap = {
    'directives':'directives',
    'packages':'lib',
}
module.exports = {
    mode: 'production',
    entry: entries,
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[name].js',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@src': path.resolve(__dirname, './src')
        }
    },
    externals: [
        nodeExternals({
            additionalModuleDirs: [path.resolve(__dirname, '../../node_modules')]
        }),
        //convert to relative path
        (context, request, cb) => {
            const ctx = path.relative(srcRoot,context);
            const matchesCtx = ctx.match(/^(packages|directives)[\/\\]([^\/\\]*)/);
            const matches = request.match(/^@src[\/\\]([^\/\\]*)[\/\\](.*)/);
            if(matches && matchesCtx){
                const ctxType = matchesCtx[1];
                const reqType = matches[1], reqModule = matches[2];
                const fakePathCtx = path.resolve(__dirname,`./dist/${pathMap[ctxType]}/`);
                const fakePathReq = path.resolve(__dirname,`./dist/${pathMap[reqType]}/${reqModule}`);
                let resolvePath = path.relative(fakePathCtx,fakePathReq);
                if(resolvePath.indexOf('.')!==0){
                    resolvePath = './' + resolvePath;
                }
                resolvePath = resolvePath.replace(/\\/g,'/');
                cb(null,resolvePath);
            }else{
                cb();
            }
        },
        {
            vue: {
                root: 'Vue',
                commonjs: 'vue',
                commonjs2: 'vue',
                amd: 'vue'
            },
        },

    ],
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.m?jsx?$/,
                include: [
                    path.resolve(__dirname, './src')
                ],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            [
                                "@babel/preset-env",
                                {
                                    "targets": {
                                        "ie": "11"
                                    },
                                }
                            ]
                        ],
                        "plugins": [
                            "@vue/babel-plugin-transform-vue-jsx",
                            ["@babel/plugin-transform-runtime", {corejs: 3}],
                        ]
                    }
                }],
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    compilerOptions: {
                        preserveWhitespace: false
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader'],
            },
            {
                test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 4096,
                        name: path.posix.join('static', '[name].[hash:8].[ext]')
                    }
                }],
            }
        ]
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false
        }),
        new VueLoaderPlugin()
    ]
}
