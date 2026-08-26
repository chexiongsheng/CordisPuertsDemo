const path = require('path')
const common = require('./webpack.common')

// cordis 库构建（运行时部分）：
// cordis core（含 cosmokit）→ 单个 CommonJS 模块 cordis.cjs，
// 输出到 Unity 工程的 Assets/Resources，由 PuerTS 的 loader 在运行时加载。
// 配套的 .d.ts 声明由 `tsc -p tsconfig.cordis.json` 生成（见 package.json build:cordis）。
module.exports = {
  ...common,
  entry: '../../cordis_puerts/cordis/packages/core/src/index.ts',
  output: {
    path: path.resolve(__dirname, '../Assets/Resources'),
    filename: 'cordis.cjs',
    library: { type: 'commonjs2' }, // module.exports = ...
    globalObject: 'globalThis',
    // 独立重 build cordis 时保留 demo 产物
    clean: { keep: 'smoke.cjs' },
  },
}
