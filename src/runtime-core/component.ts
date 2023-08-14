import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props:{}
    }
    return component
}

export function setupComponent(instance) {
    initProps(instance,instance.vnode.props)
    // initSlots

    // 初始化一个有状态的component
    setupStatefulComponent(instance)
}

/**
 * App.js(包含setup) --> createVNode接收App.js --> 返回一个vnode对象，vnode.type保存App.js
 * 通过 vnode.type可以获取到App.js，再解构出setup
 * 流程：初始化component-01-获取App.png
 * @param instance 
 *
 */
function setupStatefulComponent(instance: any) {
    const component = instance.type
    const { setup } = component

    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    // 执行setup，获取返回值
    if (setup) {
        // props只是可读的
        const setupResult = setup(shallowReadonly(instance.props))
        // 处理setup返回值
        handleSetupResult(setupResult, instance)
    }
}

function handleSetupResult(setupResult, instance) {
    // 返回结果是对象
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    // 保证render有值
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type
    if (Component.render) {
        instance.render = Component.render
    }
}

