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
/*!**************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/timer/src/index.ts ***!
  \**************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimerService: () => (/* binding */ TimerService),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cordis */ "cordis");
/* harmony import */ var cordis__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(cordis__WEBPACK_IMPORTED_MODULE_0__);

class TimerService extends cordis__WEBPACK_IMPORTED_MODULE_0__.Service {
    constructor(ctx) {
        super(ctx, 'timer');
        ctx.mixin('timer', ['timeout', 'interval', 'throttle', 'debounce', 'setTimeout', 'setInterval']);
    }
    /** @deprecated use `ctx.timeout()` instead */
    setTimeout(callback, delay) {
        return this.timeout(callback, delay);
    }
    /** @deprecated use `ctx.interval()` instead */
    setInterval(callback, delay) {
        return this.interval(callback, delay);
    }
    timeout(...args) {
        const callback = typeof args[0] === 'function' ? args.shift() : undefined;
        const delay = args[0];
        if (callback) {
            const dispose = this.ctx.effect(() => {
                const timer = setTimeout(() => {
                    dispose();
                    callback();
                }, delay);
                return () => clearTimeout(timer);
            }, 'ctx.timeout()');
            return dispose;
        }
        else {
            const { promise, resolve, reject } = Promise.withResolvers();
            const dispose = this.ctx.effect(() => {
                const timer = setTimeout(resolve, delay);
                return () => {
                    clearTimeout(timer);
                    reject(new Error('Context has been disposed'));
                };
            }, 'ctx.timeout()');
            return promise.finally(dispose);
        }
    }
    interval(...args) {
        const callback = typeof args[0] === 'function' ? args.shift() : undefined;
        const delay = args[0];
        if (callback) {
            return this.ctx.effect(() => {
                const timer = setInterval(callback, delay);
                return () => clearInterval(timer);
            }, 'ctx.interval()');
        }
        else {
            let done;
            let nextTask;
            const dispose = this.ctx.effect(() => {
                const timer = setInterval(() => {
                    nextTask?.resolve({ done: false, value: undefined });
                }, delay);
                return () => {
                    clearInterval(timer);
                    if (done)
                        return;
                    done = { kind: 'throw', reason: new Error('Context has been disposed') };
                    nextTask?.reject(done.reason);
                };
            }, 'ctx.interval()');
            return {
                next: () => {
                    if (!done)
                        return (nextTask = Promise.withResolvers()).promise;
                    if (done.kind === 'return')
                        return Promise.resolve({ done: true, value: done.value });
                    return Promise.reject(done.reason);
                },
                return: (value) => {
                    if (!done)
                        done = { kind: 'return', value };
                    nextTask?.resolve({ done: true, value });
                    dispose();
                    return Promise.resolve({ done: true, value });
                },
                throw: (reason) => {
                    if (!done)
                        done = { kind: 'throw', reason };
                    nextTask?.reject(reason);
                    dispose();
                    return Promise.resolve({ done: true, value: undefined });
                },
                [Symbol.asyncIterator]() {
                    return this;
                },
            };
        }
    }
    _schedule(label, trigger, isDisposed = false) {
        let timer;
        const dispose = this.ctx.effect(() => () => {
            isDisposed = true;
            clearTimeout(timer);
        }, label);
        const wrapper = (...args) => {
            clearTimeout(timer);
            timer = trigger(args, isDisposed);
        };
        wrapper.dispose = dispose;
        return wrapper;
    }
    throttle(callback, delay, noTrailing) {
        let lastCall = -Infinity;
        const execute = (...args) => {
            lastCall = Date.now();
            callback(...args);
        };
        return this._schedule('ctx.throttle()', (args, isDisposed) => {
            const now = Date.now();
            const remaining = delay - now + lastCall;
            if (remaining <= 0) {
                execute(...args);
            }
            else if (!isDisposed) {
                return setTimeout(execute, remaining, ...args);
            }
        }, noTrailing);
    }
    debounce(callback, delay) {
        return this._schedule('ctx.debounce()', (args, isDisposed) => {
            if (isDisposed)
                return;
            return setTimeout(callback, delay, ...args);
        });
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TimerService);

})();

module.exports = __webpack_exports__;
/******/ })()
;