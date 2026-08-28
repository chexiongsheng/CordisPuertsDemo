const path = require('path')
const common = require('./webpack.common')

// game 统一入口 + 三个独立系统模块，多入口各自产出独立 cjs：
//   game.cjs —— 统一入口（系统开关 / 哨兵 / heap 统计 / 模块缓存状态）
//   shop.cjs / mail.cjs / rank.cjs —— 各系统插件
// game 不静态引用系统模块（经 globalThis.lazyRequire 运行时按需加载），
// 仅 cordis 标记为外部依赖，运行时由 PuerTS 模块系统按相对路径解析
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
  },
  output: {
    path: path.resolve(__dirname, '../Assets/Resources'),
    filename: '[name].cjs',
    library: { type: 'commonjs2' },
    globalObject: 'globalThis',
  },
}
