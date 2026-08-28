/**
 * 商城系统插件：10 万件商品 + 8MB 贴图缓存（三个系统中内存最大）。
 * 独立构建为 shop.cjs，由 game.cjs 统一管理开关。
 */

import * as cordis from 'cordis'

const { Service } = cordis

declare function setInterval(fn: () => void, ms: number): any
declare function clearInterval(t: any): void

const log = (msg: string) => console.log(msg)

const ITEM_COUNT = 100_000
const TEXTURE_CACHE_SIZE = 8 * 1024 * 1024 // 8MB

export class ShopService extends Service {
  /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
  readonly sentinel = { tag: 'shop-service-instance' }

  /** 10 万件商品数据 */
  readonly items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
    id: i,
    name: `item-${i}`,
    price: (i * 7919) % 10000 + 1,
    desc: `legendary-item-description-${i}`,
  }))

  /** 8MB 贴图缓存（逐页写入，确保物理内存真实提交） */
  readonly textureCache = (() => {
    const buf = new Uint8Array(TEXTURE_CACHE_SIZE)
    for (let i = 0; i < buf.length; i += 4096) buf[i] = 1
    return buf
  })()

  constructor(ctx: cordis.Context) {
    super(ctx, 'shop')
  }
}

declare module 'cordis' {
  interface Context {
    shop: ShopService
  }
}

/** 系统插件统一导出名：game.cjs 经 lazyRequire 加载本模块后取 plugin 挂载 */
export const plugin: cordis.Plugin.Function = async (ctx: cordis.Context) => {
  // 1. 提供商城服务（构造时分配大块内存），await 确保服务激活后再继续
  await ctx.plugin(ShopService)
  log(`[shop] 初始化完成：${ITEM_COUNT.toLocaleString()} 件商品 + ${TEXTURE_CACHE_SIZE / 1024 / 1024}MB 贴图缓存`)

  // 2. 业务逻辑：cordis 要求 fiber 内访问服务必须经 inject 声明依赖（可追踪），
  //    依赖满足时激活；服务下线时，依赖它的逻辑会被先行停止
  ctx.inject(['shop'], (ctx) => {
    // 价格轮询定时器：effect 的 yield 清理函数在 dispose 时逆序执行
    ctx.effect(function* () {
      let tick = 0
      const timer = setInterval(() => {
        const item = ctx.shop.items[(++tick * 7919) % ITEM_COUNT]
        log(`[shop] 价格轮询：${item.name} 现价 ${item.price} 金币`)
      }, 2000)
      yield () => {
        clearInterval(timer)
        log('[shop] 价格轮询定时器已清理')
      }
    })
    return () => log('[shop] 业务逻辑已随依赖回收')
  })

  // 3. dispose 回调（async plugin 的返回值会被框架收集为清理函数）
  return () => log('[shop] 插件已 dispose：服务下线 / effect 清理完毕')
}
