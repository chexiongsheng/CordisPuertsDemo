/**
 * 排行榜系统插件：8 万条排行数据，纯 JS 对象、无堆外缓存（内存最小）。
 * 独立构建为 rank.cjs，由 game.cjs 统一管理开关。
 */

import * as cordis from 'cordis'

const { Service } = cordis

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

  interface Events {
    /** 每帧由 game 广播（C# Update → game.onUpdate(dt)），驱动各系统的场景表现 */
    'update'(dt: number): void
  }
}

/** 系统插件统一导出名：game.cjs 经 lazyRequire 加载本模块后取 plugin 挂载 */
export const plugin: cordis.Plugin.Function = async (ctx: cordis.Context) => {
  await ctx.plugin(RankService)
  log(`[rank] 初始化完成：${RANK_COUNT.toLocaleString()} 条排行数据`)

  // 场景表现：右侧立方体，绕 Z 轴旋转（随 dispose 销毁）
  const cube = CS.UnityEngine.GameObject.CreatePrimitive(CS.UnityEngine.PrimitiveType.Cube)
  cube.name = 'RankCube'
  cube.transform.position = new CS.UnityEngine.Vector3(4, 0, 0)
  ctx.on('update', (dt) => cube.transform.Rotate(0, 0, 150 * dt))

  // 注意：ctx.interval 内部要访问 ctx.timer 服务，必须把 'timer' 声明进 inject
  ctx.inject(['rank', 'timer'], (ctx) => {
    // 名次刷新定时器：cordis timer 服务，随当前 fiber 自动清理
    let tick = 0
    ctx.interval(() => {
      const entry = ctx.rank.entries[(++tick * 7919) % RANK_COUNT]
      log(`[rank] 名次变动：${entry.name} 现居第 ${entry.rank} 名（${entry.score} 分）`)
    }, 2500)
    return () => log('[rank] 业务逻辑已随依赖回收')
  })

  return () => {
    CS.UnityEngine.Object.Destroy(cube)
    log('[rank] 插件已 dispose：服务下线 / effect 清理完毕 / 立方体销毁')
  }
}
