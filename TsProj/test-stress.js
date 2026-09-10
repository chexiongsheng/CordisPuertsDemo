// Node 对照压测：cordis 快速挂载（外层 effect）+ dispose + 周期性 GC，万轮循环。
// 目的：验证该对象形态在正常 V8 构建（Node）下是否稳定，辅助区分
// "PuerTS 的 V8 构建/flag 问题" vs "V8 通用问题" vs "cordis 问题"。
// 运行：node --expose-gc test-stress.js
const path = require('path')
const cordis = require(path.join(__dirname, '../Assets/Resources/cordis.cjs'))
const { Context } = cordis

async function main() {
  console.log('node', process.version, '/ v8', process.versions.v8)
  const root = new Context()
  const t0 = Date.now()

  for (let i = 0; i < 10000; i++) {
    // 与崩溃形态同构：外层 fiber 上直接注册 effect（cleanup 经 DisposableList + promise 链）
    const fiber = await root.plugin((ctx) => {
      let n = 0
      const noop = new Proxy((dt) => { n++; void dt }, {})
      ctx.effect(function* () {
        yield () => { void noop }
      })
    })
    await fiber.dispose()
    if (i % 10 === 0) global.gc()
    if (i % 1000 === 999) console.log(`round ${i + 1}, ${Date.now() - t0}ms`)
  }
  console.log('PASS: 10000 轮挂载/dispose 无异常')
}

main().catch((err) => {
  console.error('FAIL:', err)
  process.exitCode = 1
})
