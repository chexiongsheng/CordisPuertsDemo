/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/* harmony export */   isSystemOpen: () => (/* binding */ isSystemOpen),
/* harmony export */   moduleCacheStats: () => (/* binding */ moduleCacheStats),
/* harmony export */   onUpdate: () => (/* binding */ onUpdate),
/* harmony export */   toggleSystem: () => (/* binding */ toggleSystem)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var timer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! timer */ "timer");
/* harmony import */ var timer__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(timer__WEBPACK_IMPORTED_MODULE_1__);
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
    log('[game] 游戏外壳启动（root context 常驻，timer 服务已注册）');
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