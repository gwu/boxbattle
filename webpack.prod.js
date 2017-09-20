const merge = require('webpack-merge')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const common = require('./webpack.common.js')

module.exports = merge(
  common,
  {
    output: {
      filename: '[name].[chunkhash].js'
    },
    plugins: [
      new UglifyJSPlugin(),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
      })
    ]
  }
)
