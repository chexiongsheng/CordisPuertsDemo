const path = require('path')
const common = require('./webpack.common')

// smoke demo 构建（应用部分）：
// smoke.ts 以包名 'cordis' 引用框架——
//   编译期：tsconfig.json 的 paths 把 'cordis' 指向 dist-types/cordis/index.d.ts
//   构建期：下方 externals 把 'cordis' 标记为外部依赖，不打进 bundle
//   运行时：产物中保留 require('./cordis.cjs')，由 PuerTS 模块系统解析
//          （相对 smoke.cjs 所在目录，即 Assets/Resources/cordis.cjs）
module.exports = {
  ...common,
  entry: './src/smoke.ts',
  externals: {
    cordis: 'commonjs ./cordis.cjs',
  },
  output: {
    path: path.resolve(__dirname, '../Assets/Resources'),
    filename: 'smoke.cjs',
    library: { type: 'commonjs2' },
    globalObject: 'globalThis',
  },
}
