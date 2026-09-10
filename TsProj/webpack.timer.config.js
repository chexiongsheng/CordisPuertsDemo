const path = require('path')
const common = require('./webpack.common')

// cordis timer 服务构建：
// timer（packages/timer）→ 单个 CommonJS 模块 timer.cjs，
// 输出到 Unity 工程的 Assets/Resources，与 cordis.cjs 同目录。
// cordis 标记为外部依赖，运行时由 PuerTS 模块系统按相对路径解析（同 game 构建）。
// 配套的 .d.ts 声明由 `tsc -p tsconfig.timer.json` 生成（见 package.json build:timer）。
module.exports = {
  ...common,
  entry: '../../cordis_puerts/cordis/packages/timer/src/index.ts',
  externals: {
    cordis: 'commonjs ./cordis.cjs',
  },
  output: {
    path: path.resolve(__dirname, '../Assets/Resources'),
    filename: 'timer.cjs',
    library: { type: 'commonjs2' }, // module.exports = ...
    globalObject: 'globalThis',
  },
}
