/**
 * 排行榜系统插件：8 万条排行数据，纯 JS 对象、无堆外缓存（内存最小）。
 * 独立构建为 rank.cjs，由 game.cjs 统一管理开关。
 */

import * as cordis from 'cordis'

const { Service } = cordis

declare function setInterval(fn: () => void, ms: number): any
declare function clearInterval(t: any): void

const log = (msg: string) => console.log(msg)

const RANK_COUNT = 80_000

export class RankService extends Service {
  /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
  readonly sentinel = { tag: 'rank-service-instance' }

  /** 8 万条排行数据 */
  readonly entries = Array.from({ length: RANK_COUNT }, (_, i) => ({
    rank: i + 1,
    playerId: 10_000_000 + i,
    name: `player-${i}`,
    score: 1_000_000 - i * 7,
  }))

  constructor(ctx: cordis.Context) {
    super(ctx, 'rank')
  }
}

declare module 'cordis' {
  interface Context {
    rank: RankService
  }
}

export async function RankPlugin(ctx: cordis.Context) {
  await ctx.plugin(RankService)
  log(`[rank] 初始化完成：${RANK_COUNT.toLocaleString()} 条排行数据`)

  ctx.inject(['rank'], (ctx) => {
    // 名次刷新定时器
    ctx.effect(function* () {
      let tick = 0
      const timer = setInterval(() => {
        const entry = ctx.rank.entries[(++tick * 7919) % RANK_COUNT]
        log(`[rank] 名次变动：${entry.name} 现居第 ${entry.rank} 名（${entry.score} 分）`)
      }, 2500)
      yield () => {
        clearInterval(timer)
        log('[rank] 刷新定时器已清理')
      }
    })
    return () => log('[rank] 业务逻辑已随依赖回收')
  })

  return () => log('[rank] 插件已 dispose：服务下线 / effect 清理完毕')
}
