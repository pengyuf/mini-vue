export function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    }
    return component
}

export function setupComponent(instance) {
    // initProps()
    // initSlots()

    // 初始化一个有状态的component
    setupStatefullComponent(instance)
}

function setupStatefullComponent(instance: any) {
    const Component = instance.type
    const { setup } = Component

    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}
function handleSetupResult(instance, setupResult: any) {
    // function类型
    // obj类型
    if (typeof setupResult == 'function') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
    const Component = instance.type
    if (Component.render) {
        instance.render = Component.render
    }
}

