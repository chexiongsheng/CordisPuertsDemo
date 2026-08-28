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
  !*** ./src/mail.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MailService: () => (/* binding */ MailService),
/* harmony export */   plugin: () => (/* binding */ plugin)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
/**
 * 邮件系统插件：5 万封邮件 + 4MB 附件缓存（中等内存）。
 * 独立构建为 mail.cjs，由 game.cjs 统一管理开关。
 */

const { Service } = cordis__WEBPACK_IMPORTED_MODULE_0__;
const log = (msg) => console.log(msg);
const MAIL_COUNT = 50_000;
const ATTACHMENT_CACHE_SIZE = 4 * 1024 * 1024; // 4MB
class MailService extends Service {
    /** 内存哨兵：仅被本服务持有，系统 dispose 后应可被 V8 回收 */
    sentinel = { tag: 'mail-service-instance' };
    /** 5 万封邮件数据 */
    mails = Array.from({ length: MAIL_COUNT }, (_, i) => ({
        id: i,
        from: `npc-${i % 100}`,
        title: `mail-title-${i}`,
        body: `mail-body-content-${i} `.repeat(4),
        read: false,
    }));
    /** 4MB 附件缓存（逐页写入，确保物理内存真实提交） */
    attachmentCache = (() => {
        const buf = new Uint8Array(ATTACHMENT_CACHE_SIZE);
        for (let i = 0; i < buf.length; i += 4096)
            buf[i] = 1;
        return buf;
    })();
    constructor(ctx) {
        super(ctx, 'mail');
    }
}
/** 系统插件统一导出名：game.cjs 经 lazyRequire 加载本模块后取 plugin 挂载 */
const plugin = async (ctx) => {
    await ctx.plugin(MailService);
    log(`[mail] 初始化完成：${MAIL_COUNT.toLocaleString()} 封邮件 + ${ATTACHMENT_CACHE_SIZE / 1024 / 1024}MB 附件缓存`);
    // 场景表现：中间立方体，绕 Y 轴旋转（随 dispose 销毁）
    const cube = CS.UnityEngine.GameObject.CreatePrimitive(CS.UnityEngine.PrimitiveType.Cube);
    cube.name = 'MailCube';
    cube.transform.position = new CS.UnityEngine.Vector3(0, 0, 0);
    ctx.on('update', (dt) => cube.transform.Rotate(0, 120 * dt, 0));
    ctx.inject(['mail'], (ctx) => {
        // 邮件同步定时器
        ctx.effect(function* () {
            const timer = setInterval(() => {
                log(`[mail] 与服务器同步邮件状态（共 ${ctx.mail.mails.length.toLocaleString()} 封）`);
            }, 3000);
            yield () => {
                clearInterval(timer);
                log('[mail] 同步定时器已清理');
            };
        });
        return () => log('[mail] 业务逻辑已随依赖回收');
    });
    return () => {
        CS.UnityEngine.Object.Destroy(cube);
        log('[mail] 插件已 dispose：服务下线 / effect 清理完毕 / 立方体销毁');
    };
};

})();

module.exports = __webpack_exports__;
/******/ })()
;