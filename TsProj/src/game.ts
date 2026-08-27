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
 * mail.cjs / rank.cjs），构建期标记为外部依赖，运行时经 PuerTS require 解析，
 * 互不打包；cordis.cjs 同理共享。
 *
 * 运行方式见 Assets/Scripts/CordisShopDemo.cs（每帧 GC + 实时 heap 显示）。
 * Node 冒烟：node --expose-gc test-game.js
 */

import * as cordis from 'cordis'
import { ShopPlugin } from './shop'
import { MailPlugin } from './mail'
import { RankPlugin } from './rank'

const { Context } = cordis

// 完整 cordis core 命名空间，供 C# 侧按需取用
export const core = cordis

const log = (msg: string) => console.log(msg)

// ---------------------------------------------------------------------------
// 系统开关
// ---------------------------------------------------------------------------

interface GameSystem {
  plugin: cordis.Plugin.Function
  fiber: cordis.Fiber | null
}

// 系统名与服务名一致，哨兵可直接经 root.<name>.sentinel 取得
const systems: Record<string, GameSystem> = {
  shop: { plugin: ShopPlugin, fiber: null },
  mail: { plugin: MailPlugin, fiber: null },
  rank: { plugin: RankPlugin, fiber: null },
}

let root: cordis.Context | undefined
const sentinels: Array<{ label: string; ref: WeakRef<object> }> = []
let openSeq = 0

async function init() {
  if (root) return
  root = new Context()
  log('[game] 游戏外壳启动（root context 常驻）')
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
    log(`[game] ${name} 已关闭（服务 / 定时器全部回收）`)
    return false
  }
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
