/**
 * Hmr：热重载服务（官方 @cordisjs/plugin-hmr 的最小等价实现）。
 *
 * 官方 HMR 依赖 chokidar / node:fs / Node 内部 ModuleLoader，无法跑在 PuerTS 里；
 * 这里用两个 PuerTS 自带能力替代：
 *   - 文件变化检测：puer.loadFile 轮询文件内容（走 C# loader.ReadFile，每次真读盘），
 *     内容变化即视为"文件被重新构建"；
 *   - 模块失效：由消费方（game.cjs）调用 puer.module.deleteModuleCache。
 *
 * 本服务只负责"检测 + 广播"，具体怎么重载由订阅 hmr/change 的一方决定——
 * 与官方语义一致（官方也是 emit hmr/change、hmr/reload）。
 *
 * 用法：
 *   await root.plugin(HmrService, { targets: ['shop.cjs', 'mail.cjs'], interval: 1000 })
 *   root.on('hmr/change', (name, file) => { ... })
 */

import * as cordis from 'cordis'

const { Service } = cordis

declare module 'cordis' {
  interface Context {
    hmr: HmrService
  }

  interface Events {
    /** 监听到目标文件内容变化（name 为去掉 .cjs 的系统名） */
    'hmr/change'(name: string, file: string): void
    /** 消费方完成一次热重载后广播（open 表示重载后系统是否打开） */
    'hmr/reload'(name: string, open: boolean): void
  }
}

export interface HmrConfig {
  /** 轮询间隔（ms），默认 1000 */
  interval?: number
  /** 监听的目标文件（相对宿主模块根目录），默认三个系统 */
  targets?: string[]
}

const DEFAULT_TARGETS = ['shop.cjs', 'mail.cjs', 'rank.cjs']

export class HmrService extends Service {
  static inject = ['timer']

  /** 文件名 → 上次读到的内容 */
  private snapshots: Record<string, string> = Object.create(null)

  constructor(ctx: cordis.Context, public config: HmrConfig = {}) {
    super(ctx, 'hmr')
  }

  private get targets() {
    return this.config.targets ?? DEFAULT_TARGETS
  }

  async* [Service.init]() {
    // 宿主没有 puer.loadFile（如 Node 冒烟环境）时自动停用，
    // Node 侧由 dev-hmr.js 的 fs.watch 承担检测
    if (typeof (globalThis as any).puer?.loadFile !== 'function') {
      this.ctx.logger.info('[hmr] 宿主无 puer.loadFile，自动热重载未启用')
      return
    }
    for (const file of this.targets) {
      this.snapshots[file] = this.read(file) ?? ''
    }
    // 轮询注册在 HmrService 自己的 fiber 上，服务卸载时自动 clear
    this.ctx.interval(() => this.check(), this.config.interval ?? 1000)
    this.ctx.logger.info('[hmr] 已启动：监听 %o，间隔 %dms', this.targets, this.config.interval ?? 1000)
  }

  private read(file: string): string | undefined {
    try {
      const res = (globalThis as any).puer.loadFile(file)
      return res?.content ?? undefined
    } catch {
      return undefined
    }
  }

  /** 立即检查一次，返回内容发生变化的系统名（并广播 hmr/change） */
  check(): string[] {
    const changed: string[] = []
    for (const file of this.targets) {
      const content = this.read(file)
      if (content === undefined || content === this.snapshots[file]) continue
      this.snapshots[file] = content
      const name = file.replace(/\.cjs$/, '')
      changed.push(name)
      this.ctx.emit('hmr/change', name, file)
    }
    return changed
  }
}

export default HmrService
