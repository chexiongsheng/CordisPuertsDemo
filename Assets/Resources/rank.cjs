/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "cordis"
/*!*******************************!*\
  !*** external "./cordis.cjs" ***!
  \*******************************/
(module) {

module.exports = require("./cordis.cjs");

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
  !*** ./src/rank.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RankService: () => (/* binding */ RankService),
/* harmony export */   plugin: () => (/* binding */ plugin)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/**
 * 排行榜系统插件：8 万条排行数据，纯 JS 对象、无堆外缓存（内存最小）。
 * 独立构建为 rank.cjs，由 game.cjs 统一管理开关。
 */

const { Service } = cordis__WEBPACK_IMPORTED_MODULE_0__;
const log = (msg) => console.log(msg);
const RANK_COUNT = 80_000;
class RankService extends Service {
    /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
    sentinel = { tag: 'rank-service-instance' };
    /** 8 万条排行数据 */
    entries = Array.from({ length: RANK_COUNT }, (_, i) => ({
        rank: i + 1,
        playerId: 10_000_000 + i,
        name: `player-${i}`,
        score: 1_000_000 - i * 7,
    }));
    constructor(ctx) {
        super(ctx, 'rank');
    }
}
/** 系统插件统一导出名：game.cjs 经 lazyRequire 加载本模块后取 plugin 挂载 */
const plugin = async (ctx) => {
    await ctx.plugin(RankService);
    log(`[rank] 初始化完成：${RANK_COUNT.toLocaleString()} 条排行数据`);
    ctx.inject(['rank'], (ctx) => {
        // 名次刷新定时器
        ctx.effect(function* () {
            let tick = 0;
            const timer = setInterval(() => {
                const entry = ctx.rank.entries[(++tick * 7919) % RANK_COUNT];
                log(`[rank] 名次变动：${entry.name} 现居第 ${entry.rank} 名（${entry.score} 分）`);
            }, 2500);
            yield () => {
                clearInterval(timer);
                log('[rank] 刷新定时器已清理');
            };
        });
        return () => log('[rank] 业务逻辑已随依赖回收');
    });
    return () => log('[rank] 插件已 dispose：服务下线 / effect 清理完毕');
};

})();

module.exports = __webpack_exports__;
/******/ })()
;