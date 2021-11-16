const path = require('path')
const webpack = require('webpack')
const HandlebarsPlugin = require('handlebars-webpack-plugin')

const hash = Date.now()
const root = path.resolve(__dirname, '..')

const pkg = require(path.join(root, 'package.json'))
const isProduction = (process.env.NODE_ENV === 'production')

// Register all package.json alias
const alias = {}
Object.entries(pkg.alias || {}).forEach(([name, resolve]) => {
  alias[name] = path.resolve(root, resolve)
})

module.exports = {
  entry: [
    path.join(root, 'src', 'index.js'),
    path.join(root, 'src', 'index.scss')
  ],

  output: {
    publicPath: '/',
    filename: 'bundle.js'
  },

  resolve: {
    alias: {
      abstractions: path.join(root, 'src', 'abstractions'),
      components: path.join(root, 'src', 'components'),
      controllers: path.join(root, 'src', 'controllers'),
      store: path.join(root, 'src', 'store.js'),
      utils: path.join(root, 'src', 'utils')
    }
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        include: path.join(root, 'src')
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: 'ifdef-loader',
        options: { DEVELOPMENT: !isProduction }
      },
      {
        test: /\.svg$/i,
        use: 'raw-loader'
      }
    ]
  },

  plugins: [
    new HandlebarsPlugin({
      entry: path.join(root, 'src', '*.hbs'),
      output: path.join(root, 'build', '[name].html'),
      helpers: {
        bool: value => value ? 'true' : 'false'
      },

      onBeforeRender: function (Handlebars, data, filename) {
        data.compiler = {
          hash,
          name: pkg.name,
          semver: pkg.version + (isProduction ? '' : '-dev'),
          isProduction
        }
      }
    }),
    new webpack.ProvidePlugin({
      h: [path.join(root, 'src', 'utils', 'jsx'), 'h']
    })
  ]
}
