const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require("webpack")

let distFolder = 'dst/'

module.exports = (env, argv) => {

  const packMode = (argv) ? argv.mode : 'development'

  const plugins = [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new HtmlWebpackPlugin({
      dist: distFolder,
      inject: 'body',
      template: path.resolve(__dirname, './src/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "./src/assets"),
          to: "assets"
        },
      ],
    })
  ];

  return {
    mode: packMode,
    stats: {
      errorDetails: true,
    },
    entry: {
      "main": __dirname + "/src/main.tsx",
    },
    output: {
      path: __dirname + '/dst',
      filename: 'main.js',
      clean: true,
      assetModuleFilename: 'assets/[hash][ext]',
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.jsx', '.tsx', '.ts', '.js'],
    },
    plugins,
    devServer: {
      static: './src/',
      port: 4000,
      allowedHosts: "all",
    }
  }
};
