// packages
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FriendlyWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// config
module.exports = ({mode}) => {
    const isDev = mode === 'development';

    const pathResolver = pathString => path.resolve(__dirname, pathString);

    const plugins = [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'Photo Filter',
            template: './index.html',
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: !isDev,
            },
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: './assets',
                    to: pathResolver('dist/assets'),
                },
                {
                    from: './favicon.ico',
                    to: pathResolver('dist'),
                },
            ],
        }),
        new FriendlyWebpackPlugin(),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: pathResolver('tsconfig.json'),
            },
        }),
    ];

    const optimization = {
        splitChunks: {
            chunks: 'all',
        },
        ...(isDev ? {runtimeChunk: 'single'} : {}),
    };

    if (!isDev) {
        optimization.minimizer = [new TerserPlugin(), new CssMinimizerPlugin()];
    }

    return {
        context: pathResolver('src'),
        mode,
        entry: {
            polyfill: '@babel/polyfill',
            main: './main.ts',
        },
        output: {
            filename: '[name].js',
            path: pathResolver('dist'),
        },
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.ts$/i,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-typescript'],
                            plugins: [
                                ['@babel/plugin-proposal-decorators', {legacy: true}],
                                '@babel/plugin-proposal-class-properties',
                            ],
                        },
                    },
                },
                {
                    test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                    type: 'asset/inline',
                },
            ],
        },
        plugins,
        devtool: isDev ? 'source-map' : false,
        resolve: {
            extensions: ['.ts', '.js'],
        },
        devServer: {
            compress: true,
            port: 8000,
            watchFiles: ['src/*.html'],
            historyApiFallback: true,
        },
        optimization,
    };
};
