'use strict';

const isObject = (val) => {
    return val !== null && typeof val == 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // initProps
    // initSlots
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
    // 执行setup，获取返回值
    if (setup) {
        const setupResult = setup();
        // 处理setup返回值
        handleSetupResult(setupResult, instance);
    }
}
function handleSetupResult(setupResult, instance) {
    // 返回结果是对象
    if (typeof setupResult === 'object') {
        instance.setup = setupResult;
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

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === 'string') {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理component
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}
function processElement(vnode, container) {
    //  初始化
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(children, el);
    }
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.forEach(v => {
        patch(v, container);
    });
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 所有的操作都是基于vnode，所以先要将component转为vnode
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
