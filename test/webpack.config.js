const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, "./src/main.js"),
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "[name].[contenthash:8].js",
        publicPath: "/",
    },
    resolve: {
        extensions: ['.js', '.vue', '.json', '.jsx'],
    },
    devtool: 'source-map',
    devServer: {
        open: true,
        port: 10086,
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, './public')
    },
    module: {
        rules: [
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
                test: /\.js$/,
                enforce: "pre",
                use: ["source-map-loader"],
            },
            {
                test: /\.m?jsx?$/,
                exclude: [/node_modules/, /dist/],
                loader: 'babel-loader',
                options: {
                    ...require('./babel.config')
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
                    }
                }],
            }
        ]
    },
    optimization: {
        moduleIds:'named'
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, "./dist/index.html"),
            template: path.resolve(__dirname, './public/index.html'),
            title: 'custom arcgis layer'
        }),
/*        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        })*/
    ]
}
