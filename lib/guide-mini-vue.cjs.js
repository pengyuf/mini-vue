'use strict';

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val == 'object';
};
const hasChanged = (val, newVal) => {
    return !Object.is(val, newVal);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};
const EMPTY_OBJ = {};

class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        // 是否执行stop的标志位，当执行完一次stop后，不再执行清空操作。优化性能。
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            // 当处于stop状态时，再次执行fn，fn会触发get操作，但此时shouldTrack已经置为false，在track中不会在收集
            return this._fn();
        }
        activeEffect = this;
        // 在非stop状态时，track中都会收集effect
        shouldTrack = true;
        // 返回_fn的返回值
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            clearEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function clearEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
let activeEffect;
let shouldTrack;
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop = options.onStop
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
const shallowReadOnlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallowReadonly = false) {
    return function get(target, key) {
        if (key == "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (isShallowReadonly) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandler = {
    get,
    set
};
const readonlyHandler = {
    get: readOnlyGet,
    set(target, key, value) {
        console.warn(`${key} 是readonly`);
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadOnlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler);
}
function createActiveObject(raw, baseHandler) {
    if (!isObject(raw)) {
        console.warn(`${raw} 必须是对象`);
        return raw;
    }
    return new Proxy(raw, baseHandler);
}

class refImpl {
    constructor(value) {
        this.__v_isRef = true;
        // 判断value是否是对象，如果是对象的话，调用reactive，转换为响应式对象
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        // 当传入的是对象时，_value是一个proxy对象，此时比较newValue和_value时，hasChanged一定是true
        // 所有我们需要保存原始传入的值。通过原始传入的值和newValue进行比较
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffect(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(object) {
    return new Proxy(object, {
        get: (target, key) => {
            return unRef(Reflect.get(target, key));
        },
        set: (target, key, value) => {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    // 初始化一个有状态的component
    setupStatefulComponent(instance);
}
/**
 * App.js(包含setup) --> createVNode接收App.js --> 返回一个vnode对象，vnode.type保存App.js
 * 通过 vnode.type可以获取到App.js，再解构出setup
 * 流程：初始化component-01-获取App.png
 * @param instance
 *
 */
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    // 执行setup，获取返回值
    if (setup) {
        setCurrentInstance(instance);
        // props只是可读的
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        // 处理setup返回值
        handleSetupResult(setupResult, instance);
    }
}
function handleSetupResult(setupResult, instance) {
    // 返回结果是对象
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    // 保证render有值
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    const curInstance = getCurrentInstance();
    if (curInstance) {
        let { provides } = curInstance;
        const parentProvides = curInstance.parent.provides;
        if (provides === parentProvides) {
            provides = curInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const curInstance = getCurrentInstance();
    if (curInstance) {
        const parentProvides = curInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 所有的操作都是基于vnode，所以先要将component转为vnode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    /**
     *
     * @param n1 老的
     * @param n2 新的
     * @param container
     * @param parentComponent
     */
    function patch(n1, n2, container, parentComponent) {
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理component
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                // 初始化
                const { proxy } = instance;
                // 调用render，改变render的this
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新
                const { proxy } = instance;
                // 调用render，改变render的this
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree; // 旧的subTree
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            //  初始化
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n1.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchProps(el, oldProps, newProps);
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    // 修改
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el)
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent);
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    // onClick : 判断是否是一个事件
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        // 注册事件
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === null || nextVal === undefined) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
