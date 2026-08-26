/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../cordis_puerts/cordis/packages/core/src/context.ts"
/*!***************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/context.ts ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Context: () => (/* binding */ Context)
/* harmony export */ });
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./events */ "../../cordis_puerts/cordis/packages/core/src/events.ts");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logger */ "../../cordis_puerts/cordis/packages/core/src/logger.ts");
/* harmony import */ var _reflect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./reflect */ "../../cordis_puerts/cordis/packages/core/src/reflect.ts");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./registry */ "../../cordis_puerts/cordis/packages/core/src/registry.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");
/* harmony import */ var _fiber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./fiber */ "../../cordis_puerts/cordis/packages/core/src/fiber.ts");






class Context {
    static effect = _utils__WEBPACK_IMPORTED_MODULE_4__.symbols.effect;
    static filter = _utils__WEBPACK_IMPORTED_MODULE_4__.symbols.filter;
    static isolate = _utils__WEBPACK_IMPORTED_MODULE_4__.symbols.isolate;
    static intercept = _utils__WEBPACK_IMPORTED_MODULE_4__.symbols.intercept;
    static is(value) {
        return !!value?.[Context.is];
    }
    static {
        Context.is[Symbol.toPrimitive] = () => Symbol.for('cordis.is');
        Context.prototype[Context.is] = true;
    }
    constructor() {
        this[_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.isolate] = Object.create(null);
        this[_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.intercept] = Object.create(null);
        const self = new Proxy(this, _reflect__WEBPACK_IMPORTED_MODULE_2__.ReflectService.handler);
        this.root = self;
        this.baseUrl = undefined;
        this.fiber = new _fiber__WEBPACK_IMPORTED_MODULE_5__.Fiber(self, {}, Object.create(null), null, () => []);
        this.reflect = new _reflect__WEBPACK_IMPORTED_MODULE_2__.ReflectService(self);
        this.registry = new _registry__WEBPACK_IMPORTED_MODULE_3__.RegistryService(self);
        this.events = new _events__WEBPACK_IMPORTED_MODULE_0__.EventsService(self);
        this.logger = new _logger__WEBPACK_IMPORTED_MODULE_1__.LoggerService(self);
        this.fiber._disposables.clear();
        return self;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `Context <${this.fiber.name}>`;
    }
    extend(meta = {}) {
        const shadow = Reflect.getOwnPropertyDescriptor(this, _utils__WEBPACK_IMPORTED_MODULE_4__.symbols.shadow)?.value;
        const self = Object.create((0,_utils__WEBPACK_IMPORTED_MODULE_4__.getTraceable)(this, this));
        for (const prop of Reflect.ownKeys(meta)) {
            Object.defineProperty(self, prop, Reflect.getOwnPropertyDescriptor(meta, prop));
        }
        if (!shadow)
            return self;
        return Object.assign(Object.create(self), { [_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.shadow]: shadow });
    }
    isolate(name, label) {
        const shadow = Object.create(this[_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.isolate]);
        shadow[name] = label ?? Symbol(name);
        return this.extend({ [_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.isolate]: shadow });
    }
    intercept(name, config) {
        const intercept = Object.create(this[_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.intercept]);
        intercept[name] = config;
        return this.extend({ [_utils__WEBPACK_IMPORTED_MODULE_4__.symbols.intercept]: intercept });
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/events.ts"
/*!**************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/events.ts ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventsService: () => (/* binding */ EventsService),
/* harmony export */   isBailed: () => (/* binding */ isBailed)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context */ "../../cordis_puerts/cordis/packages/core/src/context.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");



function isBailed(value) {
    return value !== null && value !== false && value !== undefined;
}
class EventsService {
    ctx;
    _hooks = {};
    constructor(ctx) {
        this.ctx = ctx;
        (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(this, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker, {
            property: 'ctx',
            noShadow: true,
        });
        this.on('internal/listener', function (name, listener, options) {
            if (name === 'internal/update' && !options.global) {
                const hooks = this.fiber._hooks['internal/update'] ??= new _utils__WEBPACK_IMPORTED_MODULE_2__.DisposableList();
                const method = options.prepend ? 'unshift' : 'push';
                return hooks[method](listener);
            }
        });
        this.on('internal/update', function (config, noSave, next) {
            const cbs = [...this._hooks['internal/update'] || []];
            const _next = () => {
                const cb = cbs.shift() ?? next;
                return cb.call(this, config, noSave, _next);
            };
            return _next();
        }, { global: true, prepend: true });
    }
    _resolve(type, args) {
        const thisArg = typeof args[0] === 'object' || typeof args[0] === 'function' ? args.shift() : null;
        const name = args.shift();
        if (!name.startsWith('internal/') && this._hooks['internal/dispatch']?.length) {
            this.emit('internal/dispatch', type, name, args, thisArg);
        }
        const filter = thisArg?.[_context__WEBPACK_IMPORTED_MODULE_1__.Context.filter];
        return [thisArg, (this._hooks[name] || [])
                .filter(hook => hook.global || !filter || filter.call(thisArg, hook.ctx)).map(hook => hook.callback)];
    }
    /** @deprecated */
    dispatch(type, args) {
        const [thisArg, callbacks] = this._resolve(type, args);
        return callbacks.map(callback => callback.bind(thisArg));
    }
    async parallel(...args) {
        const [thisArg, callbacks] = this._resolve('emit', args);
        const results = await Promise.allSettled(callbacks.map(async (callback) => Reflect.apply(callback, thisArg, args)));
        const errors = results.filter((result) => result.status === 'rejected');
        if (errors.length)
            throw new AggregateError(errors.map(error => error.reason));
    }
    emit(...args) {
        const [thisArg, callbacks] = this._resolve('emit', args);
        for (const callback of callbacks)
            Reflect.apply(callback, thisArg, args);
    }
    async serial(...args) {
        const [thisArg, callbacks] = this._resolve('serial', args);
        for (const callback of callbacks) {
            const result = await Reflect.apply(callback, thisArg, args);
            if (isBailed(result))
                return result;
        }
    }
    bail(...args) {
        const [thisArg, callbacks] = this._resolve('bail', args);
        for (const callback of callbacks) {
            const result = Reflect.apply(callback, thisArg, args);
            if (isBailed(result))
                return result;
        }
    }
    waterfall(...args) {
        const [thisArg, callbacks] = this._resolve('waterfall', args);
        const inner = args.pop();
        const next = () => {
            const callback = callbacks.shift();
            return callback ? Reflect.apply(callback, thisArg, args) : inner(...args);
        };
        args.push(next);
        return next();
    }
    register(label, hooks, callback, options) {
        const method = options.prepend ? 'unshift' : 'push';
        return this.ctx.fiber.effect(() => {
            hooks[method]({ ctx: this.ctx, callback, ...options });
            return () => this.unregister(hooks, callback);
        }, label);
    }
    unregister(hooks, callback) {
        const index = hooks.findIndex(hook => hook.callback === callback);
        if (index >= 0) {
            hooks.splice(index, 1);
            return true;
        }
    }
    on(name, listener, options) {
        if (typeof options !== 'object') {
            options = { prepend: options };
        }
        // handle special events
        this.ctx.fiber.assertActive();
        listener = this.ctx.reflect.bind(listener);
        const result = this.bail(this.ctx, 'internal/listener', name, listener, options);
        if (result)
            return result;
        const hooks = this._hooks[name] ||= [];
        const label = `ctx.on(${typeof name === 'string' ? JSON.stringify(name) : name.toString()})`;
        return this.register(label, hooks, listener, options);
    }
    once(name, listener, options) {
        const dispose = this.on(name, function (...args) {
            dispose();
            return listener.apply(this, args);
        }, options);
        return dispose;
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/fiber.ts"
/*!*************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/fiber.ts ***!
  \*************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CordisError: () => (/* binding */ CordisError),
/* harmony export */   Fiber: () => (/* binding */ Fiber),
/* harmony export */   FiberState: () => (/* binding */ FiberState),
/* harmony export */   ValidationError: () => (/* binding */ ValidationError),
/* harmony export */   resolveConfig: () => (/* binding */ resolveConfig)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context */ "../../cordis_puerts/cordis/packages/core/src/context.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");



const kValidationError = Symbol.for('ValidationError');
class ValidationError extends TypeError {
    name = 'ValidationError';
    constructor(issues) {
        super(`invalid config:\n` + issues.map(issue => {
            if (issue.path) {
                return `  - ${issue.message} (at ${issue.path.join('.')})`;
            }
            else {
                return `  - ${issue.message}`;
            }
        }).join('\n'));
    }
}
Object.defineProperty(ValidationError.prototype, kValidationError, {
    value: true,
});
function resolveConfig(runtime, config) {
    if (!runtime.Config)
        return config;
    // TODO: async validation
    const result = runtime.Config['~standard'].validate(config);
    if ('then' in result) {
        throw new TypeError('Async config validation is not supported');
    }
    if (result.issues) {
        throw new ValidationError(result.issues);
    }
    else {
        return result.value;
    }
}
var FiberState;
(function (FiberState) {
    FiberState[FiberState["PENDING"] = 0] = "PENDING";
    FiberState[FiberState["LOADING"] = 1] = "LOADING";
    FiberState[FiberState["ACTIVE"] = 2] = "ACTIVE";
    FiberState[FiberState["FAILED"] = 3] = "FAILED";
    FiberState[FiberState["DISPOSED"] = 4] = "DISPOSED";
    FiberState[FiberState["UNLOADING"] = 5] = "UNLOADING";
})(FiberState || (FiberState = {}));
class CordisError extends Error {
    code;
    constructor(code, message) {
        super(message ?? CordisError.Code[code]);
        this.code = code;
    }
}
(function (CordisError) {
    CordisError.Code = {
        INACTIVE_EFFECT: 'cannot create effect on inactive context',
    };
})(CordisError || (CordisError = {}));
const INACTIVE = '__INACTIVE__';
class Fiber {
    parent;
    inject;
    runtime;
    uid;
    ctx;
    config;
    state = FiberState.PENDING;
    dispose;
    store;
    inertia;
    _hooks = Object.create(null);
    _disposables = new _utils__WEBPACK_IMPORTED_MODULE_2__.DisposableList();
    // Same as `this.ctx`, but with a more specific type.
    context;
    _error;
    _runner;
    _store = Object.create(null);
    constructor(parent, config, inject, runtime, getOuterStack) {
        this.parent = parent;
        this.inject = inject;
        this.runtime = runtime;
        const collect = (dispose) => {
            this._disposables.push(dispose);
        };
        if (runtime) {
            this.uid = parent.registry.counter;
            this.ctx = this.context = parent.extend({ fiber: this });
            const injectEntries = Object.entries(this.inject);
            if (injectEntries.length) {
                this.ctx[_context__WEBPACK_IMPORTED_MODULE_1__.Context.intercept] = Object.create(parent[_context__WEBPACK_IMPORTED_MODULE_1__.Context.intercept]);
                for (const [name, config] of injectEntries) {
                    if ((0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.isNullable)(config))
                        continue;
                    this.ctx[_context__WEBPACK_IMPORTED_MODULE_1__.Context.intercept][name] = config;
                }
            }
            this._runner = {
                epoch: INACTIVE,
                getOuterStack,
                execute: function () {
                    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isConstructor)(runtime.callback)) {
                        // eslint-disable-next-line new-cap
                        const instance = new runtime.callback(this.ctx, this.config);
                        for (const hook of instance?.[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.initHooks] ?? []) {
                            hook();
                        }
                        return instance?.[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.init]?.();
                    }
                    else {
                        return runtime.callback(this.ctx, this.config);
                    }
                },
                collect,
            };
            this.context.emit('internal/plugin', this);
            for (const name of Object.keys(this.inject)) {
                this._checkImpl(name);
            }
            this.dispose = parent.fiber.effect(() => {
                const remove = runtime.fibers.push(this);
                try {
                    this.config = resolveConfig(runtime, config);
                    this._refresh();
                }
                catch (error) {
                    this.ctx.logger.error(error);
                    this._error = error;
                }
                return async () => {
                    this.uid = null;
                    this.context.emit('internal/plugin', this);
                    if (this.ctx.registry.has(runtime.callback)) {
                        remove();
                        if (!runtime.fibers.length) {
                            this.ctx.registry.delete(runtime.callback);
                        }
                    }
                    this._setEpoch(INACTIVE);
                    // `this.inertia` itself should never reject — both `_reload` and
                    // `_unload` swallow their own work errors via `ctx.logger.error`.
                    // If it *does* reject, the only remaining cause is the logger
                    // itself failing, which we can't recover from in this exact spot
                    // (calling the logger again is what just failed). Let the
                    // rejection propagate; process-level crash is the honest outcome.
                    while (this.inertia) {
                        await this.inertia;
                    }
                };
            }, 'ctx.plugin()');
        }
        else {
            this.uid = 0;
            this.ctx = this.context = parent;
            this.state = FiberState.ACTIVE;
            this.store = Object.create(null);
            this._runner = {
                epoch: '',
                getOuterStack,
                execute: () => { },
                collect,
            };
            this.dispose = () => this.restart();
        }
    }
    get name() {
        let fiber = this;
        do {
            if (fiber.runtime?.name)
                return fiber.runtime.name;
            fiber = fiber.parent.fiber;
        } while (fiber !== fiber.parent.fiber);
        return 'root';
    }
    assertActive() {
        if (this.uid !== null)
            return;
        throw new CordisError('INACTIVE_EFFECT');
    }
    _execute(runner) {
        const oldEpoch = runner.epoch;
        return (0,_utils__WEBPACK_IMPORTED_MODULE_2__.composeError)((info) => {
            const safeCollect = (dispose) => {
                if (typeof dispose === 'function') {
                    runner.collect(dispose);
                }
                else if (!(0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.isNullable)(dispose)) {
                    throw new TypeError('Invalid effect');
                }
            };
            const effect = runner.execute.call(this);
            if (typeof effect === 'function') {
                return runner.collect(effect);
            }
            else if ((0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.isNullable)(effect)) {
                // return
            }
            else if (!(0,_utils__WEBPACK_IMPORTED_MODULE_2__.isObject)(effect)) {
                throw new TypeError('Invalid effect');
            }
            else if ('then' in effect) {
                return effect.then(safeCollect);
            }
            else if (Symbol.iterator in effect) {
                info.error = new Error();
                const iter = effect[Symbol.iterator]();
                while (true) {
                    const result = iter.next();
                    safeCollect(result.value);
                    if (result.done)
                        return;
                }
            }
            else if (Symbol.asyncIterator in effect) {
                const iter = effect[Symbol.asyncIterator]();
                return (async () => {
                    // force async stack trace
                    await Promise.resolve();
                    info.error = new Error();
                    while (true) {
                        if (runner.epoch !== oldEpoch)
                            return;
                        const result = await iter.next();
                        safeCollect(result.value);
                        if (result.done)
                            return;
                    }
                })();
            }
            else {
                throw new TypeError('Invalid effect');
            }
        }, runner.getOuterStack);
    }
    effect(execute, label = 'anonymous') {
        this.assertActive();
        const disposables = [];
        const dispose = () => {
            let task;
            for (const dispose of disposables.splice(0).reverse()) {
                if (task) {
                    task = task.then(dispose);
                }
                else {
                    const result = dispose();
                    if ((0,_utils__WEBPACK_IMPORTED_MODULE_2__.isObject)(result) && 'then' in result) {
                        task = result;
                    }
                }
            }
            return task;
        };
        const meta = { label, children: [] };
        const runner = {
            execute,
            epoch: true,
            collect: (dispose) => {
                disposables.push(dispose);
                this._disposables.delete(dispose);
                if (dispose[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.effect]) {
                    meta.children.push(dispose[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.effect]);
                }
            },
            getOuterStack: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.buildOuterStack)(),
        };
        let task;
        try {
            task = this._execute(runner);
        }
        catch (reason) {
            dispose();
            throw reason;
        }
        // prevent unhandled rejection — both from `task` itself and from the
        // disposer chain if it fails to settle cleanly.
        task?.catch(dispose).catch((error) => this.ctx.logger.error(error));
        const wrapper = (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(() => {
            if (!runner.epoch)
                return;
            runner.epoch = false;
            return task ? task.then(dispose) : dispose();
        }, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.effect, meta);
        const disposeAsync = () => {
            if (!runner.epoch)
                return;
            runner.epoch = false;
            return dispose();
        };
        wrapper.then = async (onFulfilled, onRejected) => {
            return Promise.resolve(task)
                .then(() => disposeAsync)
                .then(onFulfilled, onRejected);
        };
        disposables.push(this._disposables.push(wrapper));
        return wrapper;
    }
    getEffects() {
        return [...this._disposables]
            .map(dispose => dispose[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.effect])
            .filter(Boolean);
    }
    _getState() {
        if (this.uid === null)
            return FiberState.DISPOSED;
        if (this._error)
            return FiberState.FAILED;
        if (this._runner.epoch !== INACTIVE)
            return FiberState.ACTIVE;
        return FiberState.PENDING;
    }
    _updateState(callback) {
        const oldState = this.state;
        this.state = callback() ?? this._getState();
        if (oldState === this.state)
            return;
        // FIXME internal/fiber-info
        this.context.emit('internal/status', this, oldState);
        // only notify changes between ACTIVE and NON-ACTIVE states
        if (oldState !== FiberState.ACTIVE && this.state !== FiberState.ACTIVE)
            return;
        for (const key of Reflect.ownKeys(this.ctx.reflect.store)) {
            const impl = this.ctx.reflect.store[key];
            if (impl.fiber !== this)
                continue;
            this.ctx.reflect.notify([impl.name]);
        }
    }
    _checkImpl(name) {
        const impl = this.ctx.reflect._getImpl(name, true);
        if (!impl)
            return delete this._store[name];
        try {
            if (impl.check && !impl.check.call((0,_utils__WEBPACK_IMPORTED_MODULE_2__.getTraceable)(this.ctx, impl.value))) {
                return delete this._store[name];
            }
        }
        catch (error) {
            impl.fiber.ctx.logger.error(error);
            return delete this._store[name];
        }
        this._store[name] = impl;
    }
    _refresh() {
        let epoch = false;
        epoch = '';
        for (const name of Object.keys(this.inject)) {
            const impl = this._store[name];
            if (!impl) {
                epoch = INACTIVE;
                break;
            }
            epoch += ':' + impl.fiber.uid;
        }
        this._setEpoch(epoch);
    }
    _setEpoch(epoch) {
        const oldEpoch = this._runner.epoch;
        if (epoch === oldEpoch)
            return;
        this._runner.epoch = epoch;
        if (this.inertia)
            return;
        this._updateState(() => {
            if (epoch !== INACTIVE && oldEpoch === INACTIVE) {
                this.inertia = this._reload();
                return FiberState.LOADING;
            }
            else {
                this.inertia = this._unload();
                return FiberState.UNLOADING;
            }
        });
    }
    async _reload() {
        this.store = { ...this._store };
        const oldEpoch = this._runner.epoch;
        try {
            await Promise.resolve();
            await this._execute(this._runner);
        }
        catch (reason) {
            // impl guarantees that the error is non-null (?)
            this.ctx.logger.error(reason);
            this._error = reason;
            this._runner.epoch = INACTIVE;
        }
        this._updateState(() => {
            if (this._runner.epoch === oldEpoch) {
                this.inertia = undefined;
            }
            else {
                this.inertia = this._unload();
                return FiberState.UNLOADING;
            }
        });
    }
    async _unload() {
        await Promise.all(this._disposables.clear().map(async (dispose) => {
            try {
                await (0,_utils__WEBPACK_IMPORTED_MODULE_2__.composeError)(async (info) => {
                    await Promise.resolve();
                    info.error = new Error();
                    await dispose();
                }, this._runner.getOuterStack);
            }
            catch (reason) {
                this.ctx.logger.error(reason);
            }
        }));
        this.store = undefined;
        this._updateState(() => {
            if (this._runner.epoch === INACTIVE) {
                this.inertia = undefined;
            }
            else {
                this.inertia = this._reload();
                return FiberState.LOADING;
            }
        });
    }
    async await() {
        while (this.inertia) {
            await this.inertia;
        }
        if (this._error)
            throw this._error;
        return this;
    }
    async restart() {
        const fiber = this.ctx.fiber;
        fiber.assertActive();
        fiber._setEpoch(INACTIVE);
        fiber._refresh();
        await fiber.await();
    }
    update(config, noSave = false) {
        const fiber = this.ctx.fiber;
        fiber.assertActive();
        config = resolveConfig(fiber.runtime, config);
        fiber.context.waterfall(fiber, 'internal/update', config, noSave, () => {
            fiber.config = config;
            fiber._error = undefined;
            return fiber.restart();
        });
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/logger.ts"
/*!**************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/logger.ts ***!
  \**************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Logger: () => (/* binding */ Logger),
/* harmony export */   LoggerLevel: () => (/* binding */ LoggerLevel),
/* harmony export */   LoggerService: () => (/* binding */ LoggerService),
/* harmony export */   c16: () => (/* binding */ c16),
/* harmony export */   c256: () => (/* binding */ c256),
/* harmony export */   defaultFormatters: () => (/* binding */ defaultFormatters)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");


var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["ERROR"] = 0] = "ERROR";
    LoggerLevel[LoggerLevel["WARN"] = 1] = "WARN";
    LoggerLevel[LoggerLevel["INFO"] = 2] = "INFO";
    LoggerLevel[LoggerLevel["DEBUG"] = 3] = "DEBUG";
})(LoggerLevel || (LoggerLevel = {}));
const defaultFormatters = {
    s: (value) => String(value),
    d: (value) => Math.trunc(Number(value)),
    i: (value) => Math.trunc(Number(value)),
    f: (value) => Number(value),
    o: (value) => JSON.stringify(value),
    O: (value) => JSON.stringify(value),
    c: () => '',
    C: (value, exporter, message) => {
        return Logger.color(exporter, Logger.code(message.name, exporter.colors), value);
    },
};
function isAggregateError(error) {
    return error instanceof Error && Array.isArray(error['errors']);
}
class Logger {
    service;
    static color(exporter, code, value, decoration = '') {
        if (!exporter.colors)
            return '' + value;
        return `\u001b[3${code < 8 ? code : '8;5;' + code}${exporter.colors >= 2 ? decoration : ''}m${value}\u001b[0m`;
    }
    static code(name, level) {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 3) - hash) + name.charCodeAt(i) + 13;
            hash |= 0;
        }
        const colors = !level ? [] : level >= 2 ? c256 : c16;
        return colors[Math.abs(hash) % colors.length];
    }
    static format(exporter, message) {
        const args = message.args.slice();
        if (args[0] instanceof Error) {
            args[0] = args[0].stack || args[0].message;
            args.unshift('%s');
        }
        else if (typeof args[0] !== 'string') {
            args.unshift('%o');
        }
        let format = args.shift();
        format = format.replace(/%([a-zA-Z%])/g, (match, char) => {
            if (match === '%%')
                return '%';
            const formatter = exporter.formatters?.[char] ?? defaultFormatters[char];
            if (typeof formatter === 'function') {
                const value = args.shift();
                return formatter(value, exporter, message);
            }
            return match;
        });
        const oFormatter = exporter.formatters?.o ?? defaultFormatters.o;
        for (let arg of args) {
            if (typeof arg === 'object' && arg) {
                arg = oFormatter(arg, exporter, message);
            }
            format += ' ' + arg;
        }
        const { maxLength = 10240 } = exporter;
        return format.split(/\r?\n/g).map(line => {
            return line.slice(0, maxLength) + (line.length > maxLength ? '...' : '');
        }).join('\n');
    }
    constructor(options, service) {
        this.service = service;
        Object.assign(this, options);
        this.error = this._method('error', LoggerLevel.ERROR);
        this.info = this._method('info', LoggerLevel.INFO);
        this.warn = this._method('warn', LoggerLevel.WARN);
        this.debug = this._method('debug', LoggerLevel.DEBUG);
    }
    _method(type, level) {
        return (...args) => {
            if (args.length === 1 && args[0] instanceof Error) {
                if (args[0].cause) {
                    this[type](args[0].cause);
                }
                else if (isAggregateError(args[0])) {
                    args[0].errors.forEach(error => this[type](error));
                    return;
                }
            }
            const sn = ++this.service._snMessage;
            const ts = Date.now();
            for (const exporter of this.service.exporters.values()) {
                const targetLevel = exporter.levels?.[this.name] ?? exporter.levels?.default ?? this.level ?? LoggerLevel.INFO;
                if (targetLevel < level)
                    continue;
                const message = { sn, ts, type, level, name: this.name, ...this.meta, args };
                exporter.export(message);
            }
        };
    }
}
const c16 = [6, 2, 3, 4, 5, 1];
const c256 = [
    20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62,
    63, 68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113,
    129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168,
    169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200,
    201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221,
];
class LoggerService {
    bufferSize = 1000;
    buffer = [];
    ctx;
    _snMessage = 0;
    _snExporter = 0;
    exporters = new Map();
    constructor(ctx) {
        const tracker = {
            property: 'ctx',
            noShadow: true,
        };
        const self = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.createCallable)('logger', (0,_utils__WEBPACK_IMPORTED_MODULE_1__.joinPrototype)(Object.getPrototypeOf(this), Function.prototype), tracker);
        Object.assign(self, this);
        self.ctx = ctx;
        (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(self, _utils__WEBPACK_IMPORTED_MODULE_1__.symbols.tracker, tracker);
        self.exporter({
            colors: 3,
            export: (message) => {
                self.buffer.push(message);
                // for better performance
                const overflow = self.buffer.length - self.bufferSize;
                if (overflow === 1) {
                    self.buffer.shift();
                }
                else if (overflow > 1) {
                    self.buffer.splice(0, overflow);
                }
            },
        });
        return self;
    }
    exporter(exporter) {
        return this.ctx.effect(() => {
            const id = ++this._snExporter;
            this.exporters.set(id, exporter);
            return () => this.exporters.delete(id);
        }, 'ctx.logger.exporter()');
    }
    _resolveConfig() {
        let intercept = this.ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.intercept];
        const configs = [];
        while ('logger' in intercept) {
            if (Object.hasOwn(intercept, 'logger')) {
                configs.unshift(intercept['logger']);
            }
            intercept = Object.getPrototypeOf(intercept);
        }
        return Object.assign({}, ...configs);
    }
    [_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.invoke](name) {
        const config = this._resolveConfig();
        const caller = this[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.caller];
        const fiber = (caller ?? this.ctx).fiber;
        name ??= config.name;
        name ??= (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.hyphenate)(fiber.name);
        return new Logger({
            name,
            level: config.level,
            meta: { fiber: new WeakRef(fiber) },
        }, this);
    }
    static {
        for (const type of ['error', 'info', 'warn', 'debug']) {
            ;
            LoggerService.prototype[type] = function (...args) {
                return this()[type](...args);
            };
        }
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/reflect.ts"
/*!***************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/reflect.ts ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReflectService: () => (/* binding */ ReflectService)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");
/* harmony import */ var _fiber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fiber */ "../../cordis_puerts/cordis/packages/core/src/fiber.ts");



function enhanceError(error) {
    const lines = error.stack.split('\n');
    lines.splice(0, 2, `Error: ${error.message}`);
    error.stack = lines.join('\n');
    return error;
}
const RESERVED_WORDS = ['prototype', 'then'];
// - is a symbol
// - is a reserved word (prototype, then)
// - is a number string (0, 1, 2, ...)
// - starts with `_`
function isSpecialProperty(prop) {
    return typeof prop === 'symbol'
        || RESERVED_WORDS.includes(prop)
        || parseInt(prop).toString() === prop
        || prop.startsWith('_');
}
class ReflectService {
    ctx;
    static handler = {
        get: (target, prop, ctx) => {
            if (isSpecialProperty(prop)) {
                return Reflect.get(target, prop, ctx);
            }
            if (Reflect.has(target, prop)) {
                return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getTraceable)(ctx, Reflect.get(target, prop, ctx));
            }
            const error = new Error(`cannot get property "${prop}" without inject`);
            try {
                const def = target.reflect.props[prop];
                if (def?.type === 'accessor') {
                    return def.get.call(ctx, ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.receiver], error);
                }
                if (!ctx.fiber.runtime)
                    return ctx.reflect.get(prop, false);
                return ctx.events.waterfall('internal/get', ctx, prop, error, () => {
                    const key = target[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][prop];
                    let fiber = (ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.shadow] ?? ctx).fiber;
                    while (true) {
                        const impl = fiber.store?.[prop];
                        if (impl)
                            return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getTraceable)(ctx, impl.value);
                        if (prop in fiber.inject) {
                            error.message = `cannot get required service "${prop}" in inactive context`;
                            throw error;
                        }
                        if (!fiber.runtime)
                            throw error;
                        if (fiber.parent[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][prop] !== key)
                            throw error;
                        fiber = fiber.parent.fiber;
                    }
                });
            }
            catch (e) {
                throw e === error ? enhanceError(e) : e;
            }
        },
        set: (target, prop, value, ctx) => {
            if (isSpecialProperty(prop)) {
                return Reflect.set(target, prop, value, ctx);
            }
            const error = new Error(`cannot set property "${prop}" without provide`);
            const def = target.reflect.props[prop];
            if (!def) {
                if (!ctx.fiber.runtime)
                    return Reflect.set(target, prop, value, ctx);
                throw enhanceError(error);
            }
            try {
                if (def.type === 'accessor') {
                    if (!def.set)
                        return false;
                    return def.set.call(ctx, value, ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.receiver], error);
                }
                return ctx.events.waterfall('internal/set', ctx, prop, value, error, () => {
                    return ctx.reflect.set(prop, value, error);
                });
            }
            catch (e) {
                throw e === error ? enhanceError(e) : e;
            }
        },
        has: (target, prop) => {
            if (isSpecialProperty(prop)) {
                return Reflect.has(target, prop);
            }
            if (Reflect.has(target, prop))
                return true;
            return !!target.reflect.props[prop];
        },
    };
    store = Object.create(null);
    props = Object.create(null);
    constructor(ctx) {
        this.ctx = ctx;
        (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(this, _utils__WEBPACK_IMPORTED_MODULE_1__.symbols.tracker, {
            property: 'ctx',
            noShadow: true,
        });
        this.mixin('reflect', ['get', 'set', 'provide', 'accessor', 'mixin']);
        this.mixin('fiber', ['runtime', 'effect']);
        this.mixin('registry', ['inject', 'plugin']);
        this.mixin('events', ['on', 'once', 'parallel', 'emit', 'serial', 'bail', 'waterfall']);
    }
    get(name, strict = true) {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getTraceable)(this.ctx, this._getImpl(name, strict)?.value);
    }
    _getImpl(name, strict = true) {
        const key = this.ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name];
        const impl = key && this.store[key];
        if (!impl)
            return;
        if (strict && impl.fiber.state !== _fiber__WEBPACK_IMPORTED_MODULE_2__.FiberState.ACTIVE)
            return;
        return impl;
    }
    set(name, value, error) {
        const key = this.ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name];
        const impl = this.store[key];
        if (!impl) {
            throw new Error(`cannot set property "${name}" without provide`);
        }
        if (impl.fiber !== this.ctx.fiber) {
            throw new Error(`cannot set property "${name}" in multiple fibers`);
        }
        impl.value = value;
        return true;
    }
    provide(name, value, check) {
        return this.ctx.fiber.effect(() => {
            if (!this.props[name]) {
                this.props[name] ??= { type: 'service' };
            }
            else if (this.props[name].type !== 'service') {
                throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
            }
            this.props[name] = { type: 'service' };
            this.ctx.root[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name] ??= Symbol(name);
            const key = this.ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name];
            const impl = { name, value, fiber: this.ctx.fiber, check };
            if (this.store[key]) {
                throw new Error(`service "${name}" has been registered at <${this.store[key].fiber.name}>`);
            }
            this.store[key] = impl;
            this.ctx.fiber.store[name] = impl;
            if (this.ctx.fiber.state === _fiber__WEBPACK_IMPORTED_MODULE_2__.FiberState.ACTIVE) {
                this.notify([name]);
            }
            return async () => {
                delete this.store[key];
                const fibers = this.notify([name]);
                await Promise.allSettled(fibers.map(fiber => fiber.await()));
                // ensure self access before dependencies cleanup
                delete this.ctx.fiber.store[name];
            };
        }, `ctx.provide(${JSON.stringify(name)})`);
    }
    notify(names, filter = (ctx, name) => ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name] === this.ctx[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.isolate][name]) {
        const fibers = [];
        for (const runtime of this.ctx.registry.values()) {
            for (const fiber of runtime.fibers) {
                let hasUpdate = false;
                for (const name of names) {
                    if (!(name in fiber.inject))
                        continue;
                    if (!filter(fiber.ctx, name))
                        continue;
                    hasUpdate = true;
                    fiber._checkImpl(name);
                }
                if (!hasUpdate)
                    continue;
                fiber._refresh();
                fibers.push(fiber);
            }
        }
        for (const name of names) {
            const self = Object.create(this.ctx);
            self[_utils__WEBPACK_IMPORTED_MODULE_1__.symbols.filter] = (target) => filter(target, name);
            this.ctx.events.emit(self, 'internal/service', name, this._getImpl(name, false)?.value);
        }
        return fibers;
    }
    accessor(name, options) {
        return this.ctx.fiber.effect(() => {
            if (name in this.props) {
                throw new Error(`property "${name}" is already declared as ${this.props[name].type}`);
            }
            this.props[name] = { type: 'accessor', ...options };
            return () => delete this.props[name];
        }, `ctx.accessor(${JSON.stringify(name)})`);
    }
    mixin(source, mixins) {
        const self = this;
        return this.ctx.fiber.effect(function* () {
            const entries = Array.isArray(mixins) ? mixins.map(key => [key, key]) : Object.entries(mixins);
            const getTarget = (ctx, error) => {
                // TODO enhance error message
                return ctx[source];
            };
            for (const [key, value] of entries) {
                yield self.accessor(value, {
                    get(receiver, error) {
                        const service = getTarget(this, error);
                        if ((0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.isNullable)(service))
                            return service;
                        const mixin = receiver ? (0,_utils__WEBPACK_IMPORTED_MODULE_1__.withProps)(receiver, service) : service;
                        const value = Reflect.get(service, key, mixin);
                        if (typeof value !== 'function')
                            return value;
                        return value.bind(mixin ?? service);
                    },
                    set(value, receiver, error) {
                        const service = getTarget(this, error);
                        const mixin = receiver ? (0,_utils__WEBPACK_IMPORTED_MODULE_1__.withProps)(receiver, service) : service;
                        return Reflect.set(service, key, value, mixin);
                    },
                });
            }
        }, `ctx.mixin(${JSON.stringify(source)})`);
    }
    trace(value) {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.getTraceable)(this.ctx, value);
    }
    bind(callback) {
        return new Proxy(callback, {
            apply: (target, thisArg, args) => {
                return Reflect.apply(target, this.trace(thisArg), args.map(arg => this.trace(arg)));
            },
            construct: (target, args, newTarget) => {
                return Reflect.construct(target, args.map(arg => this.trace(arg)), newTarget);
            },
        });
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/registry.ts"
/*!****************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/registry.ts ***!
  \****************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Inject: () => (/* binding */ Inject),
/* harmony export */   RegistryService: () => (/* binding */ RegistryService)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _fiber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fiber */ "../../cordis_puerts/cordis/packages/core/src/fiber.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");



function isApplicable(object) {
    return object && typeof object === 'object' && typeof object.apply === 'function';
}
function Inject(name, config) {
    return function (value, decorator) {
        if (decorator.kind === 'class') {
            if (!Object.hasOwn(value, 'inject')) {
                (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(value, 'inject', Object.create(Object.getPrototypeOf(value).inject ?? null));
                (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(value.inject, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.checkProto, true);
            }
            value.inject[name] = config;
        }
        else if (decorator.kind === 'method') {
            const inject = (value[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.metadata] ??= {}).inject ??= Object.create(null);
            inject[name] = config;
            decorator.addInitializer(function () {
                const property = this[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker]?.property;
                (this[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.initHooks] ??= []).push(() => {
                    this.ctx.inject(inject, (ctx) => {
                        return value.call(property ? (0,_utils__WEBPACK_IMPORTED_MODULE_2__.withProps)(this, { [property]: ctx }) : this);
                    });
                });
            });
        }
        else {
            throw new Error('@Inject() can only be used on class or class methods');
        }
    };
}
(function (Inject) {
    function resolve(inject, result = Object.create(null)) {
        if (!inject)
            return result;
        if (Array.isArray(inject)) {
            for (const name of inject) {
                result[name] = null;
            }
        }
        else if (Reflect.has(inject, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.checkProto)) {
            Object.assign(result, resolve(Object.getPrototypeOf(inject)));
            for (const name of Object.keys(inject)) {
                result[name] = inject[name] ?? null;
            }
        }
        else {
            for (const name of Object.keys(inject)) {
                result[name] = inject[name] ?? null;
            }
        }
        return result;
    }
    Inject.resolve = resolve;
})(Inject || (Inject = {}));
class RegistryService {
    ctx;
    _counter = 0;
    _internal = new Map();
    constructor(ctx) {
        this.ctx = ctx;
        (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(this, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker, {
            property: 'ctx',
            noShadow: true,
        });
    }
    get counter() {
        return ++this._counter;
    }
    get size() {
        return this._internal.size;
    }
    resolve(plugin) {
        // plugin.apply may throw
        try {
            if (typeof plugin === 'function')
                return plugin;
            if (isApplicable(plugin))
                return plugin.apply;
        }
        catch { }
    }
    get(plugin) {
        const key = this.resolve(plugin);
        return key && this._internal.get(key);
    }
    has(plugin) {
        const key = this.resolve(plugin);
        return !!key && this._internal.has(key);
    }
    delete(plugin) {
        const key = this.resolve(plugin);
        const runtime = key && this._internal.get(key);
        if (!runtime)
            return;
        this._internal.delete(key);
        for (const fiber of runtime.fibers) {
            fiber.dispose();
        }
        return runtime;
    }
    keys() {
        return this._internal.keys();
    }
    values() {
        return this._internal.values();
    }
    entries() {
        return this._internal.entries();
    }
    forEach(callback) {
        return this._internal.forEach(callback);
    }
    inject(inject, callback) {
        return this.plugin({ inject, apply: callback, name: callback.name });
    }
    plugin(plugin, config, getOuterStack = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.buildOuterStack)()) {
        // check if it's a valid plugin
        const callback = this.resolve(plugin);
        if (!callback)
            throw new Error('invalid plugin, expect function or object with an "apply" method, received ' + typeof plugin);
        this.ctx.fiber.assertActive();
        let runtime = this._internal.get(callback);
        if (!runtime) {
            let name = plugin.name;
            if (name === 'apply')
                name = undefined;
            runtime = { name, callback, fibers: new _utils__WEBPACK_IMPORTED_MODULE_2__.DisposableList(), Config: plugin.Config };
            this._internal.set(callback, runtime);
        }
        const fiber = new _fiber__WEBPACK_IMPORTED_MODULE_1__.Fiber(this.ctx, config, Inject.resolve(plugin.inject), runtime, getOuterStack);
        const wrapped = Object.create(fiber);
        wrapped.then = (onFulfilled, onRejected) => {
            return fiber.await().then(onFulfilled, onRejected);
        };
        return wrapped;
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/service.ts"
/*!***************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/service.ts ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Service: () => (/* binding */ Service)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./context */ "../../cordis_puerts/cordis/packages/core/src/context.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");



class Service {
    ctx;
    static init = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.init;
    static check = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.check;
    static config = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.config;
    static invoke = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.invoke;
    static extend = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.extend;
    static tracker = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker;
    static resolveConfig = _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.resolveConfig;
    name;
    constructor(ctx, name) {
        this.ctx = ctx;
        name ??= this.constructor['provide'];
        let self = this;
        const tracker = {
            associate: name,
            property: 'ctx',
        };
        if (self[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.invoke]) {
            self = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createCallable)(name, (0,_utils__WEBPACK_IMPORTED_MODULE_2__.joinPrototype)(Object.getPrototypeOf(this), Function.prototype), tracker);
        }
        self.ctx = ctx;
        self.name = name;
        (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(self, _utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker, tracker);
        self.ctx.reflect.provide(name, self, this[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.check]);
        return self;
    }
    [_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.filter](ctx) {
        return ctx[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.isolate][this.name] === this.ctx[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.isolate][this.name];
    }
    [_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.extend](props) {
        let self;
        if (this[Service.invoke]) {
            self = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.createCallable)(this.name, this, this[_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.tracker]);
        }
        else {
            self = Object.create(this);
        }
        return Object.assign(self, props);
    }
    [_utils__WEBPACK_IMPORTED_MODULE_2__.symbols.resolveConfig](base, head) {
        let intercept = this.ctx[_context__WEBPACK_IMPORTED_MODULE_1__.Context.intercept];
        const configs = [];
        while (this.name in intercept) {
            if (Object.hasOwn(intercept, this.name)) {
                configs.unshift(intercept[this.name]);
            }
            intercept = Object.getPrototypeOf(intercept);
        }
        if (base)
            configs.unshift(base);
        if (head)
            configs.push(head);
        if (this['Config']?.merge) {
            return this['Config'].merge(...configs);
        }
        else {
            return Object.assign({}, ...configs);
        }
    }
    static [Symbol.hasInstance](instance) {
        if (!instance)
            return false;
        let constructor = instance.constructor;
        while (constructor) {
            // constructor may be a proxy
            constructor = constructor.prototype?.constructor;
            if (constructor === this)
                return true;
            constructor &&= Object.getPrototypeOf(constructor);
        }
        return false;
    }
}


/***/ },

/***/ "../../cordis_puerts/cordis/packages/core/src/utils.ts"
/*!*************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/utils.ts ***!
  \*************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DisposableList: () => (/* binding */ DisposableList),
/* harmony export */   buildOuterStack: () => (/* binding */ buildOuterStack),
/* harmony export */   composeError: () => (/* binding */ composeError),
/* harmony export */   createCallable: () => (/* binding */ createCallable),
/* harmony export */   getPropertyDescriptor: () => (/* binding */ getPropertyDescriptor),
/* harmony export */   getTraceable: () => (/* binding */ getTraceable),
/* harmony export */   isConstructor: () => (/* binding */ isConstructor),
/* harmony export */   isObject: () => (/* binding */ isObject),
/* harmony export */   joinPrototype: () => (/* binding */ joinPrototype),
/* harmony export */   symbols: () => (/* binding */ symbols),
/* harmony export */   withProps: () => (/* binding */ withProps)
/* harmony export */ });
/* harmony import */ var cosmokit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! cosmokit */ "./node_modules/cosmokit/lib/index.mjs");

class DisposableList {
    sn = 0;
    map = new Map();
    weak = new WeakMap();
    get length() {
        return this.map.size;
    }
    push(value) {
        const sn = ++this.sn;
        this.map.set(sn, value);
        this.weak.set(value, sn);
        return () => this.map.delete(sn);
    }
    delete(value) {
        const sn = this.weak.get(value);
        if (!sn)
            return false;
        return this.map.delete(sn);
    }
    clear() {
        const values = [...this.map.values()];
        this.map.clear();
        return values.reverse();
    }
    [Symbol.iterator]() {
        return this.map.values();
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return [...this];
    }
}
const symbols = {
    // internal symbols
    shadow: Symbol.for('cordis.shadow'),
    caller: Symbol.for('cordis.caller'),
    receiver: Symbol.for('cordis.receiver'),
    original: Symbol.for('cordis.original'),
    metadata: Symbol.for('cordis.metadata'),
    initHooks: Symbol.for('cordis.initHooks'),
    checkProto: Symbol.for('cordis.checkProto'),
    // context symbols
    effect: Symbol.for('cordis.effect'),
    filter: Symbol.for('cordis.filter'),
    isolate: Symbol.for('cordis.isolate'),
    intercept: Symbol.for('cordis.intercept'),
    // service symbols
    init: Symbol.for('cordis.init'),
    check: Symbol.for('cordis.check'),
    config: Symbol.for('cordis.config'),
    invoke: Symbol.for('cordis.invoke'),
    extend: Symbol.for('cordis.extend'),
    tracker: Symbol.for('cordis.tracker'),
    resolveConfig: Symbol.for('cordis.resolveConfig'),
};
const GeneratorFunction = function* () { }.constructor;
const AsyncGeneratorFunction = async function* () { }.constructor;
function isConstructor(func) {
    // async function or arrow function
    if (!func.prototype)
        return false;
    // generator function or malformed definition
    // we cannot use below check because `mock.fn()` is proxied
    // if (func.prototype.constructor !== func) return false
    if (func instanceof GeneratorFunction)
        return false;
    // polyfilled AsyncGeneratorFunction === Function
    if (AsyncGeneratorFunction !== Function && func instanceof AsyncGeneratorFunction)
        return false;
    return true;
}
function joinPrototype(proto1, proto2) {
    if (proto1 === Object.prototype)
        return proto2;
    const result = Object.create(joinPrototype(Object.getPrototypeOf(proto1), proto2));
    for (const key of Reflect.ownKeys(proto1)) {
        Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(proto1, key));
    }
    return result;
}
function isObject(value) {
    return value && (typeof value === 'object' || typeof value === 'function');
}
function getPropertyDescriptor(target, prop) {
    let proto = target;
    while (proto) {
        const desc = Reflect.getOwnPropertyDescriptor(proto, prop);
        if (desc)
            return desc;
        proto = Object.getPrototypeOf(proto);
    }
}
function getTraceable(ctx, value) {
    if (!isObject(value))
        return value;
    if (Object.hasOwn(value, symbols.shadow)) {
        return Object.getPrototypeOf(value);
    }
    const tracker = value[symbols.tracker];
    if (!tracker)
        return value;
    return createTraceable(ctx, value, tracker);
}
function withProps(target, props) {
    if (!props)
        return target;
    return new Proxy(target, {
        get: (target, prop, receiver) => {
            if (prop in props && prop !== 'constructor')
                return Reflect.get(props, prop, receiver);
            return Reflect.get(target, prop, receiver);
        },
        set: (target, prop, value, receiver) => {
            if (prop in props && prop !== 'constructor')
                return Reflect.set(props, prop, value, receiver);
            return Reflect.set(target, prop, value, receiver);
        },
    });
}
function withProp(target, prop, value) {
    return withProps(target, Object.defineProperty(Object.create(null), prop, {
        value,
        writable: false,
    }));
}
function createShadow(ctx, target, property, receiver) {
    if (!property)
        return receiver;
    const origin = getPropertyDescriptor(target, property)?.value;
    if (!origin)
        return receiver;
    return withProp(receiver, property, ctx.extend({ [symbols.shadow]: origin }));
}
function createShadowMethod(ctx, value, outer, shadow) {
    return new Proxy(value, {
        apply: (target, thisArg, args) => {
            if (thisArg === outer)
                thisArg = shadow;
            return getTraceable(ctx, Reflect.apply(target, thisArg, args));
        },
    });
}
function createTraceable(ctx, value, tracker) {
    const caller = ctx[symbols.shadow] ?? ctx;
    if (ctx[symbols.shadow]) {
        ctx = Object.getPrototypeOf(ctx);
    }
    const proxy = new Proxy(value, {
        get: (target, prop, receiver) => {
            if (prop === symbols.original)
                return target;
            if (prop === symbols.caller)
                return caller;
            if (prop === tracker.property)
                return ctx;
            if (typeof prop === 'symbol') {
                return Reflect.get(target, prop, receiver);
            }
            if (tracker.associate && ctx.reflect.props[`${tracker.associate}.${prop}`]) {
                return Reflect.get(ctx, `${tracker.associate}.${prop}`, withProp(ctx, symbols.receiver, receiver));
            }
            let shadow, innerValue;
            const desc = getPropertyDescriptor(target, prop);
            if (desc && 'value' in desc) {
                innerValue = desc.value;
            }
            else {
                shadow = createShadow(ctx, target, tracker.property, receiver);
                innerValue = Reflect.get(target, prop, shadow);
            }
            const innerTracker = innerValue?.[symbols.tracker];
            if (innerTracker) {
                return createTraceable(ctx, innerValue, innerTracker);
            }
            else if (!tracker.noShadow && typeof innerValue === 'function') {
                shadow ??= createShadow(ctx, target, tracker.property, receiver);
                return createShadowMethod(ctx, innerValue, receiver, shadow);
            }
            else {
                return innerValue;
            }
        },
        set: (target, prop, value, receiver) => {
            if (prop === symbols.original)
                return false;
            if (prop === symbols.caller)
                return false;
            if (prop === tracker.property)
                return false;
            if (typeof prop === 'symbol') {
                return Reflect.set(target, prop, value, receiver);
            }
            if (tracker.associate && ctx.reflect.props[`${tracker.associate}.${prop}`]) {
                return Reflect.set(ctx, `${tracker.associate}.${prop}`, value, withProp(ctx, symbols.receiver, receiver));
            }
            const shadow = createShadow(ctx, target, tracker.property, receiver);
            return Reflect.set(target, prop, value, shadow);
        },
        apply: (target, thisArg, args) => {
            const receiver = tracker.noShadow
                ? proxy
                : createShadow(ctx, target, tracker.property, proxy);
            return applyTraceable(receiver, target, thisArg, args);
        },
    });
    return proxy;
}
function applyTraceable(proxy, value, thisArg, args) {
    if (!value[symbols.invoke])
        return Reflect.apply(value, thisArg, args);
    return value[symbols.invoke].apply(proxy, args);
}
function createCallable(name, proto, tracker) {
    const self = function (...args) {
        const proxy = createTraceable(self['ctx'], self, tracker);
        return Reflect.apply(proxy, this, args);
    };
    (0,cosmokit__WEBPACK_IMPORTED_MODULE_0__.defineProperty)(self, 'name', name);
    return Object.setPrototypeOf(self, proto);
}
function handleError(info, reason, getOuterStack) {
    const innerLines = info.error.stack.split('\n');
    // malformed error
    if (typeof reason?.stack !== 'string') {
        const outerError = new Error(reason);
        const lines = outerError.stack.split('\n');
        lines.splice(1, Infinity, ...getOuterStack());
        outerError.stack = lines.join('\n');
        throw outerError;
    }
    // long stack trace
    const lines = reason.stack.split('\n');
    let index = lines.indexOf(innerLines[2]);
    if (index === -1)
        throw reason;
    index -= info.offset;
    while (index > 0) {
        if (!lines[index - 1].endsWith(' (<anonymous>)'))
            break;
        index -= 1;
    }
    lines.splice(index, Infinity, ...getOuterStack());
    reason.stack = lines.join('\n');
    throw reason;
}
function composeError(callback, getOuterStack = buildOuterStack()) {
    const info = { offset: 1, error: new Error() };
    try {
        const result = callback(info);
        if (isObject(result) && 'then' in result) {
            return result.then(undefined, (reason) => handleError(info, reason, getOuterStack));
        }
        else {
            return result;
        }
    }
    catch (reason) {
        handleError(info, reason, getOuterStack);
    }
}
function buildOuterStack(offset = 0) {
    const outerError = new Error();
    return () => outerError.stack.split('\n').slice(3 + offset);
}


/***/ },

/***/ "./node_modules/cosmokit/lib/index.mjs"
/*!*********************************************!*\
  !*** ./node_modules/cosmokit/lib/index.mjs ***!
  \*********************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Binary: () => (/* binding */ Binary),
/* harmony export */   Time: () => (/* binding */ Time),
/* harmony export */   arrayBufferToBase64: () => (/* binding */ arrayBufferToBase64),
/* harmony export */   arrayBufferToHex: () => (/* binding */ arrayBufferToHex),
/* harmony export */   base64ToArrayBuffer: () => (/* binding */ base64ToArrayBuffer),
/* harmony export */   camelCase: () => (/* binding */ camelCase),
/* harmony export */   camelize: () => (/* binding */ camelize),
/* harmony export */   capitalize: () => (/* binding */ capitalize),
/* harmony export */   clone: () => (/* binding */ clone),
/* harmony export */   contain: () => (/* binding */ contain),
/* harmony export */   deduplicate: () => (/* binding */ deduplicate),
/* harmony export */   deepEqual: () => (/* binding */ deepEqual),
/* harmony export */   defineProperty: () => (/* binding */ defineProperty),
/* harmony export */   difference: () => (/* binding */ difference),
/* harmony export */   filterKeys: () => (/* binding */ filterKeys),
/* harmony export */   formatProperty: () => (/* binding */ formatProperty),
/* harmony export */   hexToArrayBuffer: () => (/* binding */ hexToArrayBuffer),
/* harmony export */   hyphenate: () => (/* binding */ hyphenate),
/* harmony export */   intersection: () => (/* binding */ intersection),
/* harmony export */   is: () => (/* binding */ is),
/* harmony export */   isNonNullable: () => (/* binding */ isNonNullable),
/* harmony export */   isNullable: () => (/* binding */ isNullable),
/* harmony export */   isPlainObject: () => (/* binding */ isPlainObject),
/* harmony export */   makeArray: () => (/* binding */ makeArray),
/* harmony export */   mapValues: () => (/* binding */ mapValues),
/* harmony export */   noop: () => (/* binding */ noop),
/* harmony export */   omit: () => (/* binding */ omit),
/* harmony export */   paramCase: () => (/* binding */ paramCase),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   remove: () => (/* binding */ remove),
/* harmony export */   sanitize: () => (/* binding */ sanitize),
/* harmony export */   snakeCase: () => (/* binding */ snakeCase),
/* harmony export */   trimSlash: () => (/* binding */ trimSlash),
/* harmony export */   uncapitalize: () => (/* binding */ uncapitalize),
/* harmony export */   union: () => (/* binding */ union),
/* harmony export */   valueMap: () => (/* binding */ mapValues)
/* harmony export */ });
// src/misc.ts
function noop() {
}
function isNullable(value) {
  return value === null || value === void 0;
}
function isNonNullable(value) {
  return !isNullable(value);
}
function isPlainObject(data) {
  return data && typeof data === "object" && !Array.isArray(data);
}
function filterKeys(object, filter) {
  return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
function mapValues(object, transform) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
function pick(source, keys, forced) {
  if (!keys) return { ...source };
  const result = {};
  for (const key of keys) {
    if (forced || source[key] !== void 0) result[key] = source[key];
  }
  return result;
}
function omit(source, keys) {
  if (!keys) return { ...source };
  const result = { ...source };
  for (const key of keys) {
    Reflect.deleteProperty(result, key);
  }
  return result;
}
function defineProperty(object, key, value) {
  return Object.defineProperty(object, key, { writable: true, value, enumerable: false });
}

// src/array.ts
function contain(array1, array2) {
  return array2.every((item) => array1.includes(item));
}
function intersection(array1, array2) {
  return array1.filter((item) => array2.includes(item));
}
function difference(array1, array2) {
  return array1.filter((item) => !array2.includes(item));
}
function union(array1, array2) {
  return Array.from(/* @__PURE__ */ new Set([...array1, ...array2]));
}
function deduplicate(array) {
  return [...new Set(array)];
}
function remove(list, item) {
  const index = list?.indexOf(item);
  if (index >= 0) {
    list.splice(index, 1);
    return true;
  } else {
    return false;
  }
}
function makeArray(source) {
  return Array.isArray(source) ? source : isNullable(source) ? [] : [source];
}

// src/types.ts
function is(type, value) {
  if (arguments.length === 1) return (value2) => is(type, value2);
  return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
  return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
  return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
var Binary;
((Binary2) => {
  Binary2.is = isArrayBufferLike;
  Binary2.isSource = isArrayBufferSource;
  function fromSource(source) {
    if (ArrayBuffer.isView(source)) {
      return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
    } else {
      return source;
    }
  }
  Binary2.fromSource = fromSource;
  function toBase64(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") {
      return Buffer.from(source).toString("base64");
    }
    let binary = "";
    const bytes = new Uint8Array(source);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  Binary2.toBase64 = toBase64;
  function fromBase64(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
    return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
  }
  Binary2.fromBase64 = fromBase64;
  function toHex(source) {
    source = fromSource(source);
    if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
    return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  Binary2.toHex = toHex;
  function fromHex(source) {
    if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
    const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
    const buffer = [];
    for (let i = 0; i < hex.length; i += 2) {
      buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
    }
    return Uint8Array.from(buffer).buffer;
  }
  Binary2.fromHex = fromHex;
})(Binary || (Binary = {}));
var base64ToArrayBuffer = Binary.fromBase64;
var arrayBufferToBase64 = Binary.toBase64;
var hexToArrayBuffer = Binary.fromHex;
var arrayBufferToHex = Binary.toHex;
function clone(source, refs = /* @__PURE__ */ new Map()) {
  if (!source || typeof source !== "object") return source;
  if (is("Date", source)) return new Date(source.valueOf());
  if (is("RegExp", source)) return new RegExp(source.source, source.flags);
  if (isArrayBufferLike(source)) return source.slice(0);
  if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
  const cached = refs.get(source);
  if (cached) return cached;
  if (Array.isArray(source)) {
    const result2 = [];
    refs.set(source, result2);
    source.forEach((value, index) => {
      result2[index] = Reflect.apply(clone, null, [value, refs]);
    });
    return result2;
  }
  const result = Object.create(Object.getPrototypeOf(source));
  refs.set(source, result);
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
    if ("value" in descriptor) {
      descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
    }
    Reflect.defineProperty(result, key, descriptor);
  }
  return result;
}
function deepEqual(a, b, strict) {
  if (a === b) return true;
  if (!strict && isNullable(a) && isNullable(b)) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  if (!a || !b) return false;
  function check(test, then) {
    return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
  }
  return check(Array.isArray, (a2, b2) => a2.length === b2.length && a2.every((item, index) => deepEqual(item, b2[index]))) ?? check(is("Date"), (a2, b2) => a2.valueOf() === b2.valueOf()) ?? check(is("RegExp"), (a2, b2) => a2.source === b2.source && a2.flags === b2.flags) ?? check(isArrayBufferLike, (a2, b2) => {
    if (a2.byteLength !== b2.byteLength) return false;
    const viewA = new Uint8Array(a2);
    const viewB = new Uint8Array(b2);
    for (let i = 0; i < viewA.length; i++) {
      if (viewA[i] !== viewB[i]) return false;
    }
    return true;
  }) ?? Object.keys({ ...a, ...b }).every((key) => deepEqual(a[key], b[key], strict));
}

// src/string.ts
function capitalize(source) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}
function uncapitalize(source) {
  return source.charAt(0).toLowerCase() + source.slice(1);
}
function camelCase(source) {
  return source.replace(/[_-][a-z]/g, (str) => str.slice(1).toUpperCase());
}
function tokenize(source, delimiters, delimiter) {
  const output = [];
  let state = 0 /* DELIM */;
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      if (state === 1 /* UPPER */) {
        const next = source.charCodeAt(i + 1);
        if (next >= 97 && next <= 122) {
          output.push(delimiter);
        }
        output.push(code + 32);
      } else {
        if (state !== 0 /* DELIM */) {
          output.push(delimiter);
        }
        output.push(code + 32);
      }
      state = 1 /* UPPER */;
    } else if (code >= 97 && code <= 122) {
      output.push(code);
      state = 2 /* LOWER */;
    } else if (delimiters.includes(code)) {
      if (state !== 0 /* DELIM */) {
        output.push(delimiter);
      }
      state = 0 /* DELIM */;
    } else {
      output.push(code);
    }
  }
  return String.fromCharCode(...output);
}
function paramCase(source) {
  return tokenize(source, [45, 95], 45);
}
function snakeCase(source) {
  return tokenize(source, [45, 95], 95);
}
var camelize = camelCase;
var hyphenate = paramCase;
function formatProperty(key) {
  if (typeof key !== "string") return `[${key.toString()}]`;
  return /^[a-z_$][\w$]*$/i.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`;
}
function trimSlash(source) {
  return source.replace(/\/$/, "");
}
function sanitize(source) {
  if (!source.startsWith("/")) source = "/" + source;
  return trimSlash(source);
}

// src/time.ts
var Time;
((Time2) => {
  Time2.millisecond = 1;
  Time2.second = 1e3;
  Time2.minute = Time2.second * 60;
  Time2.hour = Time2.minute * 60;
  Time2.day = Time2.hour * 24;
  Time2.week = Time2.day * 7;
  let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  function setTimezoneOffset(offset) {
    timezoneOffset = offset;
  }
  Time2.setTimezoneOffset = setTimezoneOffset;
  function getTimezoneOffset() {
    return timezoneOffset;
  }
  Time2.getTimezoneOffset = getTimezoneOffset;
  function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
    if (typeof date === "number") date = new Date(date);
    if (offset === void 0) offset = timezoneOffset;
    return Math.floor((date.valueOf() / Time2.minute - offset) / 1440);
  }
  Time2.getDateNumber = getDateNumber;
  function fromDateNumber(value, offset) {
    const date = new Date(value * Time2.day);
    if (offset === void 0) offset = timezoneOffset;
    return new Date(+date + offset * Time2.minute);
  }
  Time2.fromDateNumber = fromDateNumber;
  const numeric = /\d+(?:\.\d+)?/.source;
  const timeRegExp = new RegExp(`^${[
    "w(?:eek(?:s)?)?",
    "d(?:ay(?:s)?)?",
    "h(?:our(?:s)?)?",
    "m(?:in(?:ute)?(?:s)?)?",
    "s(?:ec(?:ond)?(?:s)?)?"
  ].map((unit) => `(${numeric}${unit})?`).join("")}$`);
  function parseTime(source) {
    const capture = timeRegExp.exec(source);
    if (!capture) return 0;
    return (parseFloat(capture[1]) * Time2.week || 0) + (parseFloat(capture[2]) * Time2.day || 0) + (parseFloat(capture[3]) * Time2.hour || 0) + (parseFloat(capture[4]) * Time2.minute || 0) + (parseFloat(capture[5]) * Time2.second || 0);
  }
  Time2.parseTime = parseTime;
  function parseDate(date) {
    const parsed = parseTime(date);
    if (parsed) {
      date = Date.now() + parsed;
    } else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
      date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
    } else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) {
      date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
    }
    return date ? new Date(date) : /* @__PURE__ */ new Date();
  }
  Time2.parseDate = parseDate;
  function format(ms) {
    const abs = Math.abs(ms);
    if (abs >= Time2.day - Time2.hour / 2) {
      return Math.round(ms / Time2.day) + "d";
    } else if (abs >= Time2.hour - Time2.minute / 2) {
      return Math.round(ms / Time2.hour) + "h";
    } else if (abs >= Time2.minute - Time2.second / 2) {
      return Math.round(ms / Time2.minute) + "m";
    } else if (abs >= Time2.second) {
      return Math.round(ms / Time2.second) + "s";
    }
    return ms + "ms";
  }
  Time2.format = format;
  function toDigits(source, length = 2) {
    return source.toString().padStart(length, "0");
  }
  Time2.toDigits = toDigits;
  function template(template2, time = /* @__PURE__ */ new Date()) {
    return template2.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
  }
  Time2.template = template;
})(Time || (Time = {}));

//# sourceMappingURL=index.mjs.map


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
/*!*************************************************************!*\
  !*** ../../cordis_puerts/cordis/packages/core/src/index.ts ***!
  \*************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Context: () => (/* reexport safe */ _context__WEBPACK_IMPORTED_MODULE_0__.Context),
/* harmony export */   CordisError: () => (/* reexport safe */ _fiber__WEBPACK_IMPORTED_MODULE_2__.CordisError),
/* harmony export */   DisposableList: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.DisposableList),
/* harmony export */   EventsService: () => (/* reexport safe */ _events__WEBPACK_IMPORTED_MODULE_1__.EventsService),
/* harmony export */   Fiber: () => (/* reexport safe */ _fiber__WEBPACK_IMPORTED_MODULE_2__.Fiber),
/* harmony export */   FiberState: () => (/* reexport safe */ _fiber__WEBPACK_IMPORTED_MODULE_2__.FiberState),
/* harmony export */   Inject: () => (/* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.Inject),
/* harmony export */   Logger: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.Logger),
/* harmony export */   LoggerLevel: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.LoggerLevel),
/* harmony export */   LoggerService: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.LoggerService),
/* harmony export */   RegistryService: () => (/* reexport safe */ _registry__WEBPACK_IMPORTED_MODULE_4__.RegistryService),
/* harmony export */   Service: () => (/* reexport safe */ _service__WEBPACK_IMPORTED_MODULE_5__.Service),
/* harmony export */   ValidationError: () => (/* reexport safe */ _fiber__WEBPACK_IMPORTED_MODULE_2__.ValidationError),
/* harmony export */   buildOuterStack: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.buildOuterStack),
/* harmony export */   c16: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.c16),
/* harmony export */   c256: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.c256),
/* harmony export */   composeError: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.composeError),
/* harmony export */   createCallable: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.createCallable),
/* harmony export */   defaultFormatters: () => (/* reexport safe */ _logger__WEBPACK_IMPORTED_MODULE_3__.defaultFormatters),
/* harmony export */   getPropertyDescriptor: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.getPropertyDescriptor),
/* harmony export */   getTraceable: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.getTraceable),
/* harmony export */   isBailed: () => (/* reexport safe */ _events__WEBPACK_IMPORTED_MODULE_1__.isBailed),
/* harmony export */   isConstructor: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.isConstructor),
/* harmony export */   isObject: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.isObject),
/* harmony export */   joinPrototype: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.joinPrototype),
/* harmony export */   resolveConfig: () => (/* reexport safe */ _fiber__WEBPACK_IMPORTED_MODULE_2__.resolveConfig),
/* harmony export */   symbols: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.symbols),
/* harmony export */   withProps: () => (/* reexport safe */ _utils__WEBPACK_IMPORTED_MODULE_6__.withProps)
/* harmony export */ });
/* harmony import */ var _context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./context */ "../../cordis_puerts/cordis/packages/core/src/context.ts");
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./events */ "../../cordis_puerts/cordis/packages/core/src/events.ts");
/* harmony import */ var _fiber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fiber */ "../../cordis_puerts/cordis/packages/core/src/fiber.ts");
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./logger */ "../../cordis_puerts/cordis/packages/core/src/logger.ts");
/* harmony import */ var _registry__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./registry */ "../../cordis_puerts/cordis/packages/core/src/registry.ts");
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./service */ "../../cordis_puerts/cordis/packages/core/src/service.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils */ "../../cordis_puerts/cordis/packages/core/src/utils.ts");








})();

module.exports = __webpack_exports__;
/******/ })()
;