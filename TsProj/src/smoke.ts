/**
 * cordis 在 Unity PuerTS V8 环境下的冒烟测试。
 *
 * cordis core 已被独立构建为“PuerTS 可用的 cordis 包”：
 *   - 运行时：Assets/Resources/cordis.cjs（含 cosmokit，webpack 打包）
 *   - 声明：  TsProj/dist-types/cordis/index.d.ts（tsc -p tsconfig.cordis.json）
 *
 * 本文件以包名 'cordis' 引用框架：
 *   - 编译期：tsconfig.json 的 paths 把 'cordis' 指向上面的声明文件
 *   - 构建期：webpack externals 把 'cordis' 标记为外部依赖，不打进本 bundle
 *   - 运行时：产物中保留 require('./cordis.cjs')，由 PuerTS 模块系统解析
 *
 * 日志通过宿主（C# 侧）注入的 globalThis.hostLog 输出。
 * cordis 的插件激活 / dispose 全部基于 microtask 驱动，demo 只用 Promise 链。
 */

import * as cordis from 'cordis'

const { Context, Service, Logger } = cordis

// 完整 cordis core 命名空间，供 C# 侧按需取用
export const core = cordis

declare function setTimeout(fn: () => void, ms: number): any
declare function setInterval(fn: () => void, ms: number): any
declare function clearInterval(t: any): void
declare const hostLog: (msg: string) => void

function log(msg: any) {
  hostLog(String(msg))
}

// ---------------------------------------------------------------------------
// demo: events
// ---------------------------------------------------------------------------

async function demoEvents(root: cordis.Context) {
  log('--- events ---')

  // on / emit
  const off = root.on('test-event', (x: number) => log(`on: got ${x}`))
  root.emit('test-event', 42)

  // 返回的 dispose 可以摘除监听器
  off()
  root.emit('test-event', 43) // 不应有输出

  // once 只触发一次
  root.once('once-event', () => log('once: fired'))
  root.emit('once-event')
  root.emit('once-event') // 不应有输出

  // bail: 取第一个非空返回值
  root.on('sum', (a: number, b: number) => a + b)
  log(`bail: 1 + 2 = ${root.bail('sum', 1, 2)}`)

  // serial: 支持异步监听器
  root.on('double', async (x: number) => x * 2)
  log(`serial: 21 * 2 = ${await root.serial('double', 21)}`)

  // waterfall: inner 先执行，外层 hook 用无参 next() 逐级包装结果
  root.on('pipe', (s, next) => next() + ' <- hook')
  const piped = root.waterfall('pipe', 'base', (s = 'base') => `${s} -> inner`)
  log(`waterfall: ${piped}`)

  // parallel: 等待全部监听器 settle
  root.on('p-event', async () => log('parallel: hook settled'))
  await root.parallel('p-event')
}

// ---------------------------------------------------------------------------
// demo: plugin + effect
// ---------------------------------------------------------------------------

async function demoPlugin(root: cordis.Context) {
  log('--- plugin & effect ---')

  const fiber = await root.plugin((ctx: cordis.Context) => {
    log('plugin: applied')
    ctx.on('inner-event', () => log('plugin: inner-event handled'))

    // generator effect: yield 出去的函数在 dispose 时逆序执行
    ctx.effect(function* () {
      log('plugin: effect started')
      yield () => log('plugin: cleanup 1')
      yield () => log('plugin: cleanup 2')
    })

    return () => log('plugin: dispose callback')
  })
  log(`plugin: fiber active (uid=${fiber.uid}, name=${fiber.name ?? 'anonymous'})`)

  root.emit('inner-event')

  await fiber.dispose()
  log('plugin: fiber disposed')

  root.emit('inner-event') // 监听器已随 fiber 回收，不应有输出
}

// ---------------------------------------------------------------------------
// demo: service
// ---------------------------------------------------------------------------

class Counter extends Service {
  value = 0

  constructor(ctx: cordis.Context) {
    super(ctx, 'counter')
  }

  increase() {
    return ++this.value
  }
}

class LazySvc extends Service {
  constructor(ctx: cordis.Context) {
    super(ctx, 'lazy-svc')
  }

  hello() {
    return 'world'
  }
}

// 模块增强：cordis 应用通过声明合并获得服务与事件的类型
// （检验构建产出的 .d.ts 可被消费者正常使用的直接证据）
declare module 'cordis' {
  interface Context {
    counter: Counter
    'lazy-svc': LazySvc
  }

  interface Events {
    'test-event'(x: number): void
    'once-event'(): void
    'sum'(a: number, b: number): number
    'double'(x: number): Promise<number>
    'pipe'(s: string, next: () => string): string
    'p-event'(): Promise<void>
    'inner-event'(): void
    'shared-event'(x: number): void
  }
}

async function demoService(root: cordis.Context) {
  log('--- service ---')

  await root.plugin(Counter)
  root.counter.increase()
  root.counter.increase()
  log(`service: counter.value = ${root.counter.value}`)

  // ctx.inject: 依赖未满足时插件保持 pending，服务上线后自动激活
  let injected = false
  root.inject(['lazy-svc'], (ctx: cordis.Context) => {
    injected = true
    log(`inject: activated, lazy-svc.hello() = ${ctx['lazy-svc'].hello()}`)
  })
  log(`inject: before provide, activated = ${injected}`)

  await root.plugin(LazySvc)
  log(`inject: after provide, activated = ${injected}`)

  // 在依赖型 effect 内部访问服务（traceable）
  await root.inject(['counter'], (ctx: cordis.Context) => {
    ctx.counter.increase()
    log(`service: injected counter.value = ${ctx.counter.value}`)
  })
}

// ---------------------------------------------------------------------------
// demo: context extend / logger
// ---------------------------------------------------------------------------

async function demoContext(root: cordis.Context) {
  log('--- context ---')

  // extend 出来的子上下文共享 root 的事件服务
  const child = root.extend()
  root.on('shared-event', (x: number) => log(`extend: listener on root got ${x}`))
  child.emit('shared-event', 7)

  // logger: 注册 exporter 桥接到宿主日志
  const hostExporter: cordis.Exporter = {
    export: (message) => log(`[logger:${message.name}] ${Logger.format(hostExporter, message)}`),
  }
  root.logger.exporter(hostExporter)
  const logger = root.logger('demo')
  logger.info('hello %s', 'cordis')
  logger.warn('number formatter: %d', 3.14)
}

// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------

export async function smoke() {
  try {
    log('=== cordis smoke start ===')
    const root = new Context()
    await demoEvents(root)
    await demoPlugin(root)
    await demoService(root)
    await demoContext(root)
    log('=== cordis smoke done ===')
  } catch (error: any) {
    log(`!!! smoke failed: ${error?.stack ?? error}`)
  }
}

// 探测宿主环境的宏任务能力（PuerTS 注入的 setTimeout/setInterval）
export function smokeTimers() {
  log('--- timers ---')
  setTimeout(() => log('timer: setTimeout fired'), 50)
  let n = 0
  const t = setInterval(() => {
    if (++n >= 3) {
      clearInterval(t)
      log('timer: setInterval x3 done')
    }
  }, 50)
}
