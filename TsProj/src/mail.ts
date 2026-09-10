/**
 * 邮件系统插件：5 万封邮件 + 4MB 附件缓存（中等内存）。
 * 独立构建为 mail.cjs，由 game.cjs 统一管理开关。
 */

import * as cordis from 'cordis'

const { Service } = cordis

const log = (msg: string) => console.log(msg)

const MAIL_COUNT = 50_000
const ATTACHMENT_CACHE_SIZE = 4 * 1024 * 1024 // 4MB

export class MailService extends Service {
  /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
  readonly sentinel = { tag: 'mail-service-instance' }

  /** 5 万封邮件数据 */
  readonly mails = Array.from({ length: MAIL_COUNT }, (_, i) => ({
    id: i,
    from: `npc-${i % 100}`,
    title: `mail-title-${i}`,
    body: `mail-body-content-${i} `.repeat(4),
    read: false,
  }))

  /** 4MB 附件缓存（逐页写入，确保物理内存真实提交） */
  readonly attachmentCache = (() => {
    const buf = new Uint8Array(ATTACHMENT_CACHE_SIZE)
    for (let i = 0; i < buf.length; i += 4096) buf[i] = 1
    return buf
  })()

  constructor(ctx: cordis.Context) {
    super(ctx, 'mail')
  }
}

declare module 'cordis' {
  interface Context {
    mail: MailService
  }

  interface Events {
    /** 每帧由 game 广播（C# Update → game.onUpdate(dt)），驱动各系统的场景表现 */
    'update'(dt: number): void
  }
}

/** 系统插件统一导出名：game.cjs 经 lazyRequire 加载本模块后取 plugin 挂载 */
export const plugin: cordis.Plugin.Function = async (ctx: cordis.Context) => {
  await ctx.plugin(MailService)
  log(`[mail] 初始化完成：${MAIL_COUNT.toLocaleString()} 封邮件 + ${ATTACHMENT_CACHE_SIZE / 1024 / 1024}MB 附件缓存`)

  // 场景表现：中间立方体，绕 Y 轴旋转（随 dispose 销毁）
  const cube = CS.UnityEngine.GameObject.CreatePrimitive(CS.UnityEngine.PrimitiveType.Cube)
  cube.name = 'MailCube'
  cube.transform.position = new CS.UnityEngine.Vector3(0, 0, 0)
  ctx.on('update', (dt) => cube.transform.Rotate(0, 120 * dt, 0))

  ctx.inject(['mail'], (ctx) => {
    // 邮件同步定时器：cordis timer 服务，随当前 fiber 自动清理
    ctx.interval(() => {
      log(`[mail] 与服务器同步邮件状态（共 ${ctx.mail.mails.length.toLocaleString()} 封）`)
    }, 3000)
    return () => log('[mail] 业务逻辑已随依赖回收')
  })

  return () => {
    CS.UnityEngine.Object.Destroy(cube)
    log('[mail] 插件已 dispose：服务下线 / effect 清理完毕 / 立方体销毁')
  }
}
