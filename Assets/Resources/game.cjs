/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/hmr.ts"
/*!********************!*\
  !*** ./src/hmr.ts ***!
  \********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HmrService: () => (/* binding */ HmrService),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
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

const { Service } = cordis__WEBPACK_IMPORTED_MODULE_0__;
const DEFAULT_TARGETS = ['shop.cjs', 'mail.cjs', 'rank.cjs'];
class HmrService extends Service {
    config;
    static inject = ['timer'];
    /** 文件名 → 上次读到的内容 */
    snapshots = Object.create(null);
    constructor(ctx, config = {}) {
        super(ctx, 'hmr');
        this.config = config;
    }
    get targets() {
        return this.config.targets ?? DEFAULT_TARGETS;
    }
    async *[Service.init]() {
        // 宿主没有 puer.loadFile（如 Node 冒烟环境）时自动停用，
        // Node 侧由 dev-hmr.js 的 fs.watch 承担检测
        if (typeof globalThis.puer?.loadFile !== 'function') {
            this.ctx.logger.info('[hmr] 宿主无 puer.loadFile，自动热重载未启用');
            return;
        }
        for (const file of this.targets) {
            this.snapshots[file] = this.read(file) ?? '';
        }
        // 轮询注册在 HmrService 自己的 fiber 上，服务卸载时自动 clear
        this.ctx.interval(() => this.check(), this.config.interval ?? 1000);
        this.ctx.logger.info('[hmr] 已启动：监听 %o，间隔 %dms', this.targets, this.config.interval ?? 1000);
    }
    read(file) {
        try {
            const res = globalThis.puer.loadFile(file);
            return res?.content ?? undefined;
        }
        catch {
            return undefined;
        }
    }
    /** 立即检查一次，返回内容发生变化的系统名（并广播 hmr/change） */
    check() {
        const changed = [];
        for (const file of this.targets) {
            const content = this.read(file);
            if (content === undefined || content === this.snapshots[file])
                continue;
            this.snapshots[file] = content;
            const name = file.replace(/\.cjs$/, '');
            changed.push(name);
            this.ctx.emit('hmr/change', name, file);
        }
        return changed;
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HmrService);


/***/ },

/***/ "cordis"
/*!*******************************!*\
  !*** external "./cordis.cjs" ***!
  \*******************************/
(module) {

module.exports = require("./cordis.cjs");

/***/ },

/***/ "timer"
/*!******************************!*\
  !*** external "./timer.cjs" ***!
  \******************************/
(module) {

module.exports = require("./timer.cjs");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			const getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   core: () => (/* binding */ core),
/* harmony export */   gcReport: () => (/* binding */ gcReport),
/* harmony export */   heapStats: () => (/* binding */ heapStats),
/* harmony export */   heapUsedMB: () => (/* binding */ heapUsedMB),
/* harmony export */   hotReloadOpenSystems: () => (/* binding */ hotReloadOpenSystems),
/* harmony export */   hotReloadSystem: () => (/* binding */ hotReloadSystem),
/* harmony export */   isSystemOpen: () => (/* binding */ isSystemOpen),
/* harmony export */   moduleCacheStats: () => (/* binding */ moduleCacheStats),
/* harmony export */   onUpdate: () => (/* binding */ onUpdate),
/* harmony export */   toggleSystem: () => (/* binding */ toggleSystem)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! timer */ "timer");
/* harmony import */ var timer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(timer__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _hmr__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hmr */ "./src/hmr.ts");
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
 * 例外：cordis.cjs / timer.cjs 是基础设施，静态引用、常驻不卸载。
 *
 * 运行方式见 Assets/Scripts/CordisDemo.cs（每帧 GC + 实时 heap / 模块缓存显示）。
 * Node 冒烟：node --expose-gc test-game.js
 */



const { Context } = cordis__WEBPACK_IMPORTED_MODULE_0__;
// 完整 cordis core 命名空间，供 C# 侧按需取用
const core = cordis__WEBPACK_IMPORTED_MODULE_0__;
const log = (msg) => console.log(msg);
// 系统名与服务名一致，哨兵可直接经 root.<name>.sentinel 取得
const systems = {
    shop: { plugin: null, fiber: null },
    mail: { plugin: null, fiber: null },
    rank: { plugin: null, fiber: null },
};
let root;
const sentinels = [];
let openSeq = 0;
async function init() {
    if (root)
        return;
    root = new Context();
    // cordis 框架内部错误（如 fiber 激活失败、inject 依赖缺失）走 ctx.logger.error，
    // 但 core 的 LoggerService 默认 exporter 只写内存 buffer（控制台输出在独立的
    // logger-console 包），不注册 exporter 错误会静默。注册一个转发到 console。
    const consoleExporter = {
        export: (msg) => {
            const text = `[cordis] ${cordis__WEBPACK_IMPORTED_MODULE_0__.Logger.format(consoleExporter, msg)}`;
            // error 走 console.error（Unity 侧桥接为 Debug.LogError），普通日志保持 console.log
            if (msg.type === 'error')
                console.error(text);
            else
                log(text);
        },
    };
    root.logger.exporter(consoleExporter);
    // cordis timer 服务：基础设施级，注册在 root 上常驻。
    // 之后各系统插件可直接用 ctx.interval / ctx.timeout，
    // 定时器随调用方 fiber 自动清理（this.ctx 绑定调用方，见 TimerService 实现）
    await root.plugin(timer__WEBPACK_IMPORTED_MODULE_1__.TimerService);
    // Hmr 服务：轮询系统模块内容，变化时广播 hmr/change；
    // 本模块订阅该事件并执行"关系统 → 失效模块缓存 → 重开"的热重载
    await root.plugin(_hmr__WEBPACK_IMPORTED_MODULE_2__.HmrService, {
        targets: ['shop.cjs', 'mail.cjs', 'rank.cjs'],
        interval: 1000,
    });
    const reloading = new Set();
    root.on('hmr/change', async (name) => {
        if (reloading.has(name))
            return;
        reloading.add(name);
        try {
            log(`[game] 检测到 ${name}.cjs 变化，开始热重载`);
            await hotReloadSystem(name);
            root.emit('hmr/reload', name, isSystemOpen(name));
        }
        finally {
            reloading.delete(name);
        }
    });
    log('[game] 游戏外壳启动（root context 常驻，timer / hmr 服务已注册）');
}
/**
 * 实时加载系统插件。经 globalThis.lazyRequire（C# 注入的 PuerTS createRequire）
 * 而非 webpack 静态依赖：模块未缓存时才加载执行，且本模块不持久持有其 exports。
 * lazyRequire 返回 lazy proxy，首次属性访问（取 plugin）时才真正执行模块。
 */
function loadPlugin(name) {
    const lazyRequire = globalThis.lazyRequire;
    if (typeof lazyRequire !== 'function') {
        throw new Error('globalThis.lazyRequire 未注入（见 CordisDemo.cs）');
    }
    const mod = lazyRequire(`./${name}.cjs`);
    const plugin = mod.plugin;
    if (typeof plugin !== 'function') {
        throw new Error(`${name}.cjs 未导出 plugin`);
    }
    return plugin;
}
/** 打开/关闭指定系统，返回操作后的开关状态（C# 侧经 isSystemOpen 读取） */
async function toggleSystem(name) {
    await init();
    const sys = systems[name];
    if (!sys) {
        log(`[game] 未知系统：${name}`);
        return false;
    }
    if (sys.fiber) {
        const fiber = sys.fiber;
        sys.fiber = null;
        await fiber.dispose();
        // 释放插件引用：系统模块 exports 失去全部强引用，
        // PuerTS 弱缓存条目在 GC 后失效（statModuleCache 中 valid?=false）
        sys.plugin = null;
        log(`[game] ${name} 已关闭（服务 / 定时器回收，模块引用已释放）`);
        return false;
    }
    sys.plugin = loadPlugin(name);
    sys.fiber = await root.plugin(sys.plugin);
    openSeq += 1;
    sentinels.push({ label: `${name}#${openSeq}`, ref: new WeakRef(root[name].sentinel) });
    log(`[game] ${name} 已打开（fiber uid=${sys.fiber.uid}），哨兵 #${openSeq} 已登记`);
    return true;
}
function isSystemOpen(name) {
    return !!systems[name]?.fiber;
}
// ---------------------------------------------------------------------------
// 热重载（HMR 的最小实现）
// ---------------------------------------------------------------------------
/**
 * 使系统模块的缓存失效。
 * PuerTS：puer.module.deleteModuleCache(key) 直接删缓存条目（确定性，无需等 GC），
 * 下次 lazyRequire 会重新读取并执行磁盘上的 .cjs。
 * Node 侧没有 puer，由宿主的 lazyRequire（dev-hmr.js）自行绕过 require 缓存。
 */
function invalidateModuleCache(name) {
    const del = globalThis.puer?.module?.deleteModuleCache;
    if (typeof del !== 'function')
        return false;
    // module.mjs 的 key 由 joinAsPosix(require 目录, specifier) 得到，两种写法都试
    let cleared = false;
    for (const key of [`${name}.cjs`, `./${name}.cjs`]) {
        if (del(key))
            cleared = true;
    }
    return cleared;
}
/**
 * 热重载指定系统：关闭（dispose fiber、释放模块引用）→ 删模块缓存 → 重新打开。
 * 效果等同于"关掉再打开"，但重新加载的是磁盘上最新的 .cjs。
 * 前提：新的 .cjs 已构建到 Assets/Resources（Unity 工作流：改 src → npm run build:game）。
 * 系统未打开时只失效缓存，不自动打开。
 */
async function hotReloadSystem(name) {
    await init();
    const sys = systems[name];
    if (!sys) {
        log(`[game] 未知系统：${name}`);
        return false;
    }
    const wasOpen = !!sys.fiber;
    if (wasOpen)
        await toggleSystem(name); // 关闭：dispose + 释放插件引用
    const cleared = invalidateModuleCache(name);
    if (wasOpen)
        await toggleSystem(name); // 重新加载最新代码
    log(`[game] ${name} 热重载完成（模块缓存${cleared ? '已失效' : '未命中，依赖宿主缓存策略'}）`);
    return isSystemOpen(name);
}
/** 热重载所有已打开的系统（供 C# 侧一键调用） */
async function hotReloadOpenSystems() {
    const names = Object.keys(systems).filter((name) => isSystemOpen(name));
    if (!names.length)
        return '（没有打开的系统）';
    for (const name of names)
        await hotReloadSystem(name);
    return `已热重载：${names.join(', ')}`;
}
/**
 * 每帧由 C# Update 驱动：向所有打开的系统广播 update 事件。
 * 各系统插件经 ctx.on('update') 驱动场景表现（如旋转立方体），
 * dispose 时监听器自动摘除，表现随即停止。
 */
function onUpdate(dt) {
    if (!root)
        return;
    root.emit('update', dt);
}
function gcReport() {
    if (!sentinels.length)
        return '（尚未打开过系统，无哨兵）';
    return sentinels.map((s, i) => {
        const alive = s.ref.deref() !== undefined;
        return `哨兵#${i + 1} [${s.label}] ${alive ? '仍存活（系统内存尚未释放）' : '已被 V8 回收'}`;
    }).join('\n');
}
function getV8HeapStatistics() {
    const g = globalThis.v8;
    if (!g || typeof g.getHeapStatistics !== 'function')
        return null;
    return g.getHeapStatistics();
}
const toMB = (n) => (n / 1048576).toFixed(1);
/**
 * V8 heap 概要（MB）。used 为存活对象实际占用；external 含 ArrayBuffer 等
 * 堆外分配；total 为 heap 当前水位（GC 后 V8 可能保留部分页复用，回落慢于 used）。
 */
function heapStats() {
    const s = getV8HeapStatistics();
    if (!s)
        return '（v8 heap 统计不可用）';
    return `used ${toMB(s.used_heap_size)}MB / total ${toMB(s.total_heap_size)}MB / external ${toMB(s.external_memory)}MB`;
}
/** V8 used heap（MB），供 C# 侧做操作前后对比；统计不可用时返回 -1 */
function heapUsedMB() {
    const s = getV8HeapStatistics();
    return s ? s.used_heap_size / 1048576 : -1;
}
// ---------------------------------------------------------------------------
// PuerTS 模块缓存状态（puer.module.statModuleCache）
// ---------------------------------------------------------------------------
/**
 * PuerTS CJS 模块缓存表格（key / weak? / valid?）。
 * 系统关闭且 GC 后，对应 .cjs 条目的 valid? 变为 false —— 模块已被卸载，
 * 下次打开将重新加载执行；gcModuleCache() 后该条目彻底消失。
 */
function moduleCacheStats() {
    const puer = globalThis.puer;
    if (!puer?.module?.statModuleCache)
        return '（statModuleCache 不可用）';
    puer.module.gcModuleCache();
    return puer.module.statModuleCache();
}

})();

module.exports = __webpack_exports__;
/******/ })()
;