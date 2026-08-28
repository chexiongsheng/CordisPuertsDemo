# TsProj

cordis core 的 Unity PuerTS 演示工程构建目录。把 cordis core（`../../cordis_puerts/cordis/packages/core`）打包成 PuerTS V8 可用的 CommonJS 模块，并附带一个冒烟测试 demo。

## 前置要求

- Node.js（构建用，仅开发期依赖）
- 首次使用先安装依赖：

```powershell
npm install
```

## 构建

```powershell
npm run build          # 完整构建：cordis 库 + smoke demo + game demo（顺序执行下面三条）
```

也可以独立构建其中一部分：

```powershell
npm run build:cordis   # 构建 cordis 库：
                       #   1. webpack → ../Assets/Resources/cordis.cjs（含 cosmokit，commonjs2 单文件）
                       #   2. tsc -p tsconfig.cordis.json → dist-types/cordis/*.d.ts（类型声明）

npm run build:smoke    # 构建 smoke demo：webpack → ../Assets/Resources/smoke.cjs
                       # （require('./cordis.cjs') 被标记为外部依赖，运行时由 PuerTS 解析）

npm run build:game     # 构建 game demo（多入口）：
                       #   game.cjs 统一入口 + shop/mail/rank.cjs 三个独立系统模块
                       # game 不静态引用系统模块：运行时经 C# 注入的 globalThis.lazyRequire
                       # 按需加载；PuerTS 模块缓存为 WeakRef，系统关闭后模块整体可被 GC 卸载
                       # （puer.module.statModuleCache() 可观察）。对应 Assets/Scripts/CordisDemo.cs

npm run typecheck      # 可选：用构建产出的声明文件对 src 做完整类型检查
```

## 产物

| 产物 | 位置 | 说明 |
|---|---|---|
| cordis.cjs | `../Assets/Resources/` | cordis core 运行时（框架本体） |
| smoke.cjs | `../Assets/Resources/` | 冒烟测试，导出 `smoke()` / `smokeTimers()` / `core` |
| game.cjs | `../Assets/Resources/` | 统一入口，导出 `toggleSystem()` / `isSystemOpen()` / `gcReport()` / `heapStats()` / `heapUsedMB()` / `moduleCacheStats()` / `core` |
| shop.cjs | `../Assets/Resources/` | 商城系统插件（10 万商品 + 8MB 贴图缓存） |
| mail.cjs | `../Assets/Resources/` | 邮件系统插件（5 万邮件 + 4MB 附件缓存） |
| rank.cjs | `../Assets/Resources/` | 排行榜系统插件（8 万条排行，纯对象） |
| *.d.ts | `dist-types/cordis/` | cordis 类型声明，供 demo 编译期使用 |

## 构建结构

```
smoke.ts --import 'cordis'--> （编译期）tsconfig paths → dist-types/cordis/index.d.ts
                            ↘ （构建期）webpack externals → 保留 require('./cordis.cjs')
                               （运行时）PuerTS module.mjs → Assets/Resources/cordis.cjs
```

## Node 端冒烟（可选）

改完 cordis 或 demo 后，可先在 Node 里验证再进 Unity：

```powershell
node test-bundle.js            # smoke 链路
node --expose-gc test-game.js  # game 链路：三系统独立开关 + 跨模块 require + GC 回收验证
```
