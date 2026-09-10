// Node 侧的最小 HMR 验证脚本：监听 Assets/Resources 下系统 .cjs 的变化，
// 自动对"已打开的系统"执行热重载（关闭 → 失效模块缓存 → 重新打开）。
//
// 用法（两个终端）：
//   1) npm run watch:game     —— webpack 监听 src/*.ts，改动后自动重新构建 .cjs
//   2) node dev-hmr.js        —— 本脚本监听 .cjs 产物，改动后热重载对应系统
//
// 说明：Unity 里没有 chokidar/Node fs，热重载由 CordisDemo.cs 的按钮触发；
// 本脚本只用于在 Node 中快速验证热重载链路。
const path = require('path')
const fs = require('fs')

const resDir = path.join(__dirname, '../Assets/Resources')
const names = ['shop', 'mail', 'rank']

// 宿主注入的 lazyRequire：绕过 Node require 缓存，保证热重载读到新产物
globalThis.lazyRequire = (s) => {
  const file = path.join(resDir, s)
  delete require.cache[require.resolve(file)]
  return require(file)
}

// mock Unity C# 侧 API（与 test-game.js 一致）
globalThis.CS = {
  UnityEngine: {
    GameObject: { CreatePrimitive: () => ({ name: '', transform: { position: null, Rotate() {} } }) },
    PrimitiveType: { Cube: 3 },
    Vector3: class { constructor(x, y, z) { this.x = x; this.y = y; this.z = z } },
    Object: { Destroy: () => {} },
  },
}

const game = require(path.join(resDir, 'game.cjs'))

async function main() {
  console.log('[hmr] 监听中：', names.map((n) => `${n}.cjs`).join(', '))
  console.log('[hmr] 先在 Unity/控制台打开系统，然后修改 src 触发重新构建即可看到热重载')

  for (const name of names) {
    const file = path.join(resDir, `${name}.cjs`)
    if (!fs.existsSync(file)) continue
    let timer
    fs.watch(file, () => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        if (!game.isSystemOpen(name)) {
          console.log(`[hmr] ${name}.cjs 变化，但系统未打开，跳过`)
          return
        }
        console.log(`[hmr] ${name}.cjs 变化 → 热重载 ${name}`)
        await game.hotReloadSystem(name)
        console.log(`[hmr] ${name} 重载后 heap: ${game.heapStats()}`)
      }, 200)
    })
  }

  // 演示：自动打开三个系统，方便观察
  for (const name of names) await game.toggleSystem(name)
  console.log('[hmr] 已打开全部系统，等待文件变化...')
}

main().catch((e) => { console.error('[hmr] 失败:', e); process.exitCode = 1 })
