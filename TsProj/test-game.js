// 在 Node 中验证 game demo 的核心命题：
// 各系统 fiber.dispose() 之后，其服务实例（含大块内存）可被 GC 回收，
// 且系统间互不影响。同时验证 game.cjs → shop/mail/rank.cjs 的跨模块 require 链。
// 运行：node --expose-gc test-game.js
const path = require('path')
const v8m = require('v8')

const game = require(path.join(__dirname, '../Assets/Resources/game.cjs'))

const mb = (n) => (n / 1048576).toFixed(1)
const heap = () => {
  const s = v8m.getHeapStatistics()
  return `used=${mb(s.used_heap_size)}MB total=${mb(s.total_heap_size)}MB external=${mb(s.external_memory)}MB`
}
// 跨 macrotask GC：避开 V8 keptObjects 对当前 job 的保活窗口
const gc = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0))
  global.gc(); global.gc()
}

async function main() {
  await gc()
  console.log('[heap] baseline         :', heap())

  // 逐个打开：三个系统内存梯度可见
  await game.toggleSystem('shop')
  console.log('[heap] +shop            :', heap())
  await game.toggleSystem('mail')
  console.log('[heap] +mail            :', heap())
  await game.toggleSystem('rank')
  console.log('[heap] +rank            :', heap())

  // 独立关闭邮件：其余系统不受影响
  await game.toggleSystem('mail')
  await gc()
  console.log('[heap] -mail (gc)       :', heap(), '（shop/rank 仍在）')

  // 关闭剩余系统
  await game.toggleSystem('shop')
  await game.toggleSystem('rank')

  console.log('--- GC before ---')
  console.log(game.gcReport())

  await gc()
  console.log('[heap] all closed (gc)  :', heap())
  console.log('--- GC after ---')
  const report = game.gcReport()
  console.log(report)

  if (report.includes('仍存活')) {
    console.error('!!! FAIL: 存在未被回收的系统实例')
    process.exitCode = 1
  } else {
    console.log('PASS: 全部系统实例已被回收')
  }
}

main().catch((err) => {
  console.error('!!! test-game failed:', err)
  process.exitCode = 1
})
