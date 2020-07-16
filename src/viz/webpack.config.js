// @flow
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: [
        './src/viz/index.js',
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|txt|svg|jpg|gif|ico|xml|webmanifest)$/,
                use: [
                    'file-loader?name=[name].[ext]',
                ],
            },
        ],
    },
    output: {
        path: path.join(__dirname, '..', '..', 'dist'),
        publicPath: '/',
        filename: '[name].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/viz/index.html',
            inject: 'body',
            filename: 'index.html',
        }),
    ],
};
