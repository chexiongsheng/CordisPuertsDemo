// 在 Node 中验证 CJS 双 bundle 链路：smoke.cjs --require('./cordis.cjs')--> cordis.cjs
// Node 原生 CommonJS 的相对路径解析语义与 PuerTS module.mjs 一致
const path = require('path')

globalThis.hostLog = (msg) => console.log(msg)

const app = require(path.join(__dirname, '../Assets/Resources/smoke.cjs'))

// 框架本体应可通过 app.core 取到
console.log('typeof app.core.Context:', typeof app.core.Context)

app.smoke().then(() => {
  console.log('(smoke promise settled)')
}, (err) => {
  console.error('smoke rejected:', err)
})
