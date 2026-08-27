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
  !*** ./src/shop.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShopPlugin: () => (/* binding */ ShopPlugin),
/* harmony export */   ShopService: () => (/* binding */ ShopService)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/**
 * 商城系统插件：10 万件商品 + 8MB 贴图缓存（三个系统中内存最大）。
 * 独立构建为 shop.cjs，由 game.cjs 统一管理开关。
 */

const { Service } = cordis__WEBPACK_IMPORTED_MODULE_0__;
const log = (msg) => console.log(msg);
const ITEM_COUNT = 100_000;
const TEXTURE_CACHE_SIZE = 8 * 1024 * 1024; // 8MB
class ShopService extends Service {
    /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
    sentinel = { tag: 'shop-service-instance' };
    /** 10 万件商品数据 */
    items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
        id: i,
        name: `item-${i}`,
        price: (i * 7919) % 10000 + 1,
        desc: `legendary-item-description-${i}`,
    }));
    /** 8MB 贴图缓存（逐页写入，确保物理内存真实提交） */
    textureCache = (() => {
        const buf = new Uint8Array(TEXTURE_CACHE_SIZE);
        for (let i = 0; i < buf.length; i += 4096)
            buf[i] = 1;
        return buf;
    })();
    constructor(ctx) {
        super(ctx, 'shop');
    }
}
async function ShopPlugin(ctx) {
    // 1. 提供商城服务（构造时分配大块内存），await 确保服务激活后再继续
    await ctx.plugin(ShopService);
    log(`[shop] 初始化完成：${ITEM_COUNT.toLocaleString()} 件商品 + ${TEXTURE_CACHE_SIZE / 1024 / 1024}MB 贴图缓存`);
    // 2. 业务逻辑：cordis 要求 fiber 内访问服务必须经 inject 声明依赖（可追踪），
    //    依赖满足时激活；服务下线时，依赖它的逻辑会被先行停止
    ctx.inject(['shop'], (ctx) => {
        // 价格轮询定时器：effect 的 yield 清理函数在 dispose 时逆序执行
        ctx.effect(function* () {
            let tick = 0;
            const timer = setInterval(() => {
                const item = ctx.shop.items[(++tick * 7919) % ITEM_COUNT];
                log(`[shop] 价格轮询：${item.name} 现价 ${item.price} 金币`);
            }, 2000);
            yield () => {
                clearInterval(timer);
                log('[shop] 价格轮询定时器已清理');
            };
        });
        return () => log('[shop] 业务逻辑已随依赖回收');
    });
    // 3. dispose 回调（async plugin 的返回值会被框架收集为清理函数）
    return () => log('[shop] 插件已 dispose：服务下线 / effect 清理完毕');
}

})();

module.exports = __webpack_exports__;
/******/ })()
;