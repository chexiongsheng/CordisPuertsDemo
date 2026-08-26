const path = require('path')

// 两个构建共享的配置。cordis core 不依赖任何 Node.js API，按纯 web/ES 环境打包
module.exports = {
  mode: 'development', // 不压缩，便于在 PuerTS 中报错时定位源码
  devtool: false,
  target: ['web', 'es2022'],
  resolve: {
    extensions: ['.ts', '.js'],
    // cordis 源码在 ../../cordis_puerts/cordis 下，其向上查找 node_modules
    // 找不到本工程，显式把本工程的 node_modules 加进搜索路径
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader',
          options: {
            // 仅转译：cordis 用了大量高级类型，类型检查交给 cordis 自己的 CI
            transpileOnly: true,
          },
        }],
      },
    ],
  },
}
