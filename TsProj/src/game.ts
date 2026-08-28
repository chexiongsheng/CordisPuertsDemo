/**
 * 统一入口：管理商城 / 邮件 / 排行三个系统的开关、内存哨兵与 V8 heap 统计。
 *
 * 每个系统都是"按需加载、退出即毁"的 cordis 插件（见 shop.ts / mail.ts / rank.ts）：
 *   - 打开系统：root.plugin(XxxPlugin) 创建独立 fiber，系统服务持有大块内存
 *   - 关闭系统：fiber.dispose()，cordis 逆序回收 fiber 内的一切，
 *     JS 侧不再持有任何引用，系统占用内存成为 V8 待回收垃圾
 *   - 回收验证：每次打开登记一个 WeakRef 哨兵（挂在服务实例上），
 *     GC 后通过 gcReport() 观察哨兵；heapStats() 给出 V8 实时内存
 *
 * 模块结构：本文件构建为 game.cjs；三个系统各自独立构建（shop.cjs /
 * mail.cjs / rank.cjs）。game 不静态 import 系统模块——每次打开系统时经
 * C# 注入的 globalThis.lazyRequire 实时加载（PuerTS module.mjs 的模块缓存
 * 对 exports 只持 WeakRef）；关闭系统后释放插件引用，exports 失去全部强
 * 引用，GC 后整个系统模块（代码 + 数据）被引擎卸载，statModuleCache 可见。
 *
 * 运行方式见 Assets/Scripts/CordisDemo.cs（每帧 GC + 实时 heap / 模块缓存显示）。
 * Node 冒烟：node --expose-gc test-game.js
 */

import * as cordis from 'cordis'

const { Context } = cordis

// 完整 cordis core 命名空间，供 C# 侧按需取用
export const core = cordis

const log = (msg: string) => console.log(msg)

// ---------------------------------------------------------------------------
// 系统开关（插件按需 lazyRequire，不做静态持有）
// ---------------------------------------------------------------------------

interface GameSystem {
  plugin: cordis.Plugin.Function | null
  fiber: cordis.Fiber | null
}

// 系统名与服务名一致，哨兵可直接经 root.<name>.sentinel 取得
const systems: Record<string, GameSystem> = {
  shop: { plugin: null, fiber: null },
  mail: { plugin: null, fiber: null },
  rank: { plugin: null, fiber: null },
}

let root: cordis.Context | undefined
const sentinels: Array<{ label: string; ref: WeakRef<object> }> = []
let openSeq = 0

async function init() {
  if (root) return
  root = new Context()
  log('[game] 游戏外壳启动（root context 常驻）')
}

/**
 * 实时加载系统插件。经 globalThis.lazyRequire（C# 注入的 PuerTS createRequire）
 * 而非 webpack 静态依赖：模块未缓存时才加载执行，且本模块不持久持有其 exports。
 * lazyRequire 返回 lazy proxy，首次属性访问（取 plugin）时才真正执行模块。
 */
function loadPlugin(name: string): cordis.Plugin.Function {
  const lazyRequire = (globalThis as any).lazyRequire
  if (typeof lazyRequire !== 'function') {
    throw new Error('globalThis.lazyRequire 未注入（见 CordisDemo.cs）')
  }
  const mod = lazyRequire(`./${name}.cjs`)
  const plugin = mod.plugin
  if (typeof plugin !== 'function') {
    throw new Error(`${name}.cjs 未导出 plugin`)
  }
  return plugin
}

/** 打开/关闭指定系统，返回操作后的开关状态（C# 侧经 isSystemOpen 读取） */
export async function toggleSystem(name: string): Promise<boolean> {
  await init()
  const sys = systems[name]
  if (!sys) {
    log(`[game] 未知系统：${name}`)
    return false
  }
  if (sys.fiber) {
    const fiber = sys.fiber
    sys.fiber = null
    await fiber.dispose()
    // 释放插件引用：系统模块 exports 失去全部强引用，
    // PuerTS 弱缓存条目在 GC 后失效（statModuleCache 中 valid?=false）
    sys.plugin = null
    log(`[game] ${name} 已关闭（服务 / 定时器回收，模块引用已释放）`)
    return false
  }
  sys.plugin = loadPlugin(name)
  sys.fiber = await root!.plugin(sys.plugin)
  openSeq += 1
  sentinels.push({ label: `${name}#${openSeq}`, ref: new WeakRef((root as any)[name].sentinel) })
  log(`[game] ${name} 已打开（fiber uid=${sys.fiber.uid}），哨兵 #${openSeq} 已登记`)
  return true
}

export function isSystemOpen(name: string): boolean {
  return !!systems[name]?.fiber
}

export function gcReport(): string {
  if (!sentinels.length) return '（尚未打开过系统，无哨兵）'
  return sentinels.map((s, i) => {
    const alive = s.ref.deref() !== undefined
    return `哨兵#${i + 1} [${s.label}] ${alive ? '仍存活（系统内存尚未释放）' : '已被 V8 回收'}`
  }).join('\n')
}

// ---------------------------------------------------------------------------
// V8 heap 统计（PuerTS native 注入的全局 v8 extras：v8.getHeapStatistics()）
// ---------------------------------------------------------------------------

interface V8HeapStatistics {
  total_heap_size: number
  total_physical_size: number
  used_heap_size: number
  heap_size_limit: number
  malloced_memory: number
  external_memory: number
  [key: string]: number
}

function getV8HeapStatistics(): V8HeapStatistics | null {
  const g = (globalThis as any).v8
  if (!g || typeof g.getHeapStatistics !== 'function') return null
  return g.getHeapStatistics() as V8HeapStatistics
}

const toMB = (n: number) => (n / 1048576).toFixed(1)

/**
 * V8 heap 概要（MB）。used 为存活对象实际占用；external 含 ArrayBuffer 等
 * 堆外分配；total 为 heap 当前水位（GC 后 V8 可能保留部分页复用，回落慢于 used）。
 */
export function heapStats(): string {
  const s = getV8HeapStatistics()
  if (!s) return '（v8 heap 统计不可用）'
  return `used ${toMB(s.used_heap_size)}MB / total ${toMB(s.total_heap_size)}MB / external ${toMB(s.external_memory)}MB`
}

/** V8 used heap（MB），供 C# 侧做操作前后对比；统计不可用时返回 -1 */
export function heapUsedMB(): number {
  const s = getV8HeapStatistics()
  return s ? s.used_heap_size / 1048576 : -1
}

// ---------------------------------------------------------------------------
// PuerTS 模块缓存状态（puer.module.statModuleCache）
// ---------------------------------------------------------------------------

/**
 * PuerTS CJS 模块缓存表格（key / weak? / valid?）。
 * 系统关闭且 GC 后，对应 .cjs 条目的 valid? 变为 false —— 模块已被卸载，
 * 下次打开将重新加载执行；gcModuleCache() 后该条目彻底消失。
 */
export function moduleCacheStats(): string {
  const puer = (globalThis as any).puer
  if (!puer?.module?.statModuleCache) return '（statModuleCache 不可用）'
  puer.module.gcModuleCache()
  return puer.module.statModuleCache()
}
