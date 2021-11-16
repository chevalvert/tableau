const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const RemovePlugin = require('remove-files-webpack-plugin');

const root = path.resolve(__dirname, '..')

module.exports = merge(require(path.resolve(__dirname, 'webpack.config.common.js')), {
  output: {
    path: path.join(root, 'build')
  },

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true,
              minimize: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: path.resolve(__dirname, 'postcss.config.js') },
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  },

  optimization: {
    minimize: true
  },

  plugins: [
    new RemovePlugin({
      before: {
        include: [path.join(root, 'build')]
      }
    }),
    new MiniCssExtractPlugin({ filename: 'bundle.css' }),
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"production"' } }),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],

  mode: 'production',
  devtool: 'source-map'
})
