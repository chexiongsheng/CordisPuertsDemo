const path = require('path')
const common = require('./webpack.common')

// game 统一入口 + 三个独立系统模块，多入口各自产出独立 cjs：
//   game.cjs —— 统一入口（系统开关 / 哨兵 / heap 统计）
//   shop.cjs / mail.cjs / rank.cjs —— 各系统插件
// 模块间引用与 cordis 一样标记为外部依赖，互不打包，运行时由 PuerTS
// 模块系统按相对路径解析（同目录，即 Assets/Resources/）
module.exports = {
  ...common,
  entry: {
    game: './src/game.ts',
    shop: './src/shop.ts',
    mail: './src/mail.ts',
    rank: './src/rank.ts',
  },
  externals: {
    cordis: 'commonjs ./cordis.cjs',
    './shop': 'commonjs ./shop.cjs',
    './mail': 'commonjs ./mail.cjs',
    './rank': 'commonjs ./rank.cjs',
  },
  output: {
    path: path.resolve(__dirname, '../Assets/Resources'),
    filename: '[name].cjs',
    library: { type: 'commonjs2' },
    globalObject: 'globalThis',
  },
}
