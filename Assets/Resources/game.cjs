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

/***/ "./mail"
/*!*****************************!*\
  !*** external "./mail.cjs" ***!
  \*****************************/
(module) {

module.exports = require("./mail.cjs");

/***/ },

/***/ "./rank"
/*!*****************************!*\
  !*** external "./rank.cjs" ***!
  \*****************************/
(module) {

module.exports = require("./rank.cjs");

/***/ },

/***/ "./shop"
/*!*****************************!*\
  !*** external "./shop.cjs" ***!
  \*****************************/
(module) {

module.exports = require("./shop.cjs");

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
/* harmony export */   toggleSystem: () => (/* binding */ toggleSystem)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shop__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shop */ "./shop");
/* harmony import */ var _shop__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_shop__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _mail__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mail */ "./mail");
/* harmony import */ var _mail__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_mail__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _rank__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rank */ "./rank");
/* harmony import */ var _rank__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_rank__WEBPACK_IMPORTED_MODULE_3__);
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




const { Context } = cordis__WEBPACK_IMPORTED_MODULE_0__;
// 完整 cordis core 命名空间，供 C# 侧按需取用
const core = cordis__WEBPACK_IMPORTED_MODULE_0__;
const log = (msg) => console.log(msg);
// 系统名与服务名一致，哨兵可直接经 root.<name>.sentinel 取得
const systems = {
    shop: { plugin: _shop__WEBPACK_IMPORTED_MODULE_1__.ShopPlugin, fiber: null },
    mail: { plugin: _mail__WEBPACK_IMPORTED_MODULE_2__.MailPlugin, fiber: null },
    rank: { plugin: _rank__WEBPACK_IMPORTED_MODULE_3__.RankPlugin, fiber: null },
};
let root;
const sentinels = [];
let openSeq = 0;
async function init() {
    if (root)
        return;
    root = new Context();
    log('[game] 游戏外壳启动（root context 常驻）');
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
        log(`[game] ${name} 已关闭（服务 / 定时器全部回收）`);
        return false;
    }
    sys.fiber = await root.plugin(sys.plugin);
    openSeq += 1;
    sentinels.push({ label: `${name}#${openSeq}`, ref: new WeakRef(root[name].sentinel) });
    log(`[game] ${name} 已打开（fiber uid=${sys.fiber.uid}），哨兵 #${openSeq} 已登记`);
    return true;
}
function isSystemOpen(name) {
    return !!systems[name]?.fiber;
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

})();

module.exports = __webpack_exports__;
/******/ })()
;