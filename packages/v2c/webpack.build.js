const path = require('path');
const nodeExternals = require('webpack-node-externals');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const {entries, externals} = require('./components');
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
            additionalModuleDirs:[path.resolve(__dirname,'../../node_modules')]
        }),
        {
            vue: {
                root: 'Vue',
                commonjs: 'vue',
                commonjs2: 'vue',
                amd: 'vue'
            },
            ...externals
        }
    ],
    optimization: {
        minimize: !false,
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
