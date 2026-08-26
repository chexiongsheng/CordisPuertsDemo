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
/*!**********************!*\
  !*** ./src/smoke.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   core: () => (/* binding */ core),
/* harmony export */   smoke: () => (/* binding */ smoke),
/* harmony export */   smokeTimers: () => (/* binding */ smokeTimers)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);
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
 * cordis 的插件激活 / dispose 全部基于 microtask 驱动，demo 只用 Promise 链。
 */

const { Context, Service, Logger } = cordis__WEBPACK_IMPORTED_MODULE_0__;
// 完整 cordis core 命名空间，供 C# 侧按需取用
const core = cordis__WEBPACK_IMPORTED_MODULE_0__;
// ---------------------------------------------------------------------------
// demo: events
// ---------------------------------------------------------------------------
async function demoEvents(root) {
    console.log('--- events ---');
    // on / emit
    const off = root.on('test-event', (x) => console.log(`on: got ${x}`));
    root.emit('test-event', 42);
    // 返回的 dispose 可以摘除监听器
    off();
    root.emit('test-event', 43); // 不应有输出
    // once 只触发一次
    root.once('once-event', () => console.log('once: fired'));
    root.emit('once-event');
    root.emit('once-event'); // 不应有输出
    // bail: 取第一个非空返回值
    root.on('sum', (a, b) => a + b);
    console.log(`bail: 1 + 2 = ${root.bail('sum', 1, 2)}`);
    // serial: 支持异步监听器
    root.on('double', async (x) => x * 2);
    console.log(`serial: 21 * 2 = ${await root.serial('double', 21)}`);
    // waterfall: inner 先执行，外层 hook 用无参 next() 逐级包装结果
    root.on('pipe', (s, next) => next() + ' <- hook');
    const piped = root.waterfall('pipe', 'base', (s = 'base') => `${s} -> inner`);
    console.log(`waterfall: ${piped}`);
    // parallel: 等待全部监听器 settle
    root.on('p-event', async () => console.log('parallel: hook settled'));
    await root.parallel('p-event');
}
// ---------------------------------------------------------------------------
// demo: plugin + effect
// ---------------------------------------------------------------------------
async function demoPlugin(root) {
    console.log('--- plugin & effect ---');
    const fiber = await root.plugin((ctx) => {
        console.log('plugin: applied');
        ctx.on('inner-event', () => console.log('plugin: inner-event handled'));
        // generator effect: yield 出去的函数在 dispose 时逆序执行
        ctx.effect(function* () {
            console.log('plugin: effect started');
            yield () => console.log('plugin: cleanup 1');
            yield () => console.log('plugin: cleanup 2');
        });
        return () => console.log('plugin: dispose callback');
    });
    console.log(`plugin: fiber active (uid=${fiber.uid}, name=${fiber.name ?? 'anonymous'})`);
    root.emit('inner-event');
    await fiber.dispose();
    console.log('plugin: fiber disposed');
    root.emit('inner-event'); // 监听器已随 fiber 回收，不应有输出
}
// ---------------------------------------------------------------------------
// demo: service
// ---------------------------------------------------------------------------
class Counter extends Service {
    value = 0;
    constructor(ctx) {
        super(ctx, 'counter');
    }
    increase() {
        return ++this.value;
    }
}
class LazySvc extends Service {
    constructor(ctx) {
        super(ctx, 'lazy-svc');
    }
    hello() {
        return 'world';
    }
}
async function demoService(root) {
    console.log('--- service ---');
    await root.plugin(Counter);
    root.counter.increase();
    root.counter.increase();
    console.log(`service: counter.value = ${root.counter.value}`);
    // ctx.inject: 依赖未满足时插件保持 pending，服务上线后自动激活
    let injected = false;
    root.inject(['lazy-svc'], (ctx) => {
        injected = true;
        console.log(`inject: activated, lazy-svc.hello() = ${ctx['lazy-svc'].hello()}`);
    });
    console.log(`inject: before provide, activated = ${injected}`);
    await root.plugin(LazySvc);
    console.log(`inject: after provide, activated = ${injected}`);
    // 在依赖型 effect 内部访问服务（traceable）
    await root.inject(['counter'], (ctx) => {
        ctx.counter.increase();
        console.log(`service: injected counter.value = ${ctx.counter.value}`);
    });
}
// ---------------------------------------------------------------------------
// demo: context extend / logger
// ---------------------------------------------------------------------------
async function demoContext(root) {
    console.log('--- context ---');
    // extend 出来的子上下文共享 root 的事件服务
    const child = root.extend();
    root.on('shared-event', (x) => console.log(`extend: listener on root got ${x}`));
    child.emit('shared-event', 7);
    // logger: 注册 exporter 桥接到 console
    const consoleExporter = {
        export: (message) => console.log(`[logger:${message.name}] ${Logger.format(consoleExporter, message)}`),
    };
    root.logger.exporter(consoleExporter);
    const logger = root.logger('demo');
    logger.info('hello %s', 'cordis');
    logger.warn('number formatter: %d', 3.14);
}
// ---------------------------------------------------------------------------
// 入口
// ---------------------------------------------------------------------------
async function smoke() {
    try {
        console.log('=== cordis smoke start ===');
        const root = new Context();
        await demoEvents(root);
        await demoPlugin(root);
        await demoService(root);
        await demoContext(root);
        console.log('=== cordis smoke done ===');
    }
    catch (error) {
        console.log(`!!! smoke failed: ${error?.stack ?? error}`);
    }
}
// 探测宿主环境的宏任务能力（PuerTS 注入的 setTimeout/setInterval）
function smokeTimers() {
    console.log('--- timers ---');
    setTimeout(() => console.log('timer: setTimeout fired'), 50);
    let n = 0;
    const t = setInterval(() => {
        if (++n >= 3) {
            clearInterval(t);
            console.log('timer: setInterval x3 done');
        }
    }, 50);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;