const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')

const root = path.resolve(__dirname, '..')

module.exports = merge(require(path.resolve(__dirname, 'webpack.config.common.js')), {
  output: {
    path: path.join(root, 'src')
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true
            }
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: { path: path.resolve(root, 'config', 'postcss.config.js') },
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ],
        include: path.join(root, 'src')
      }
    ]
  },

  mode: 'development',
  devtool: 'eval-source-map'
})
